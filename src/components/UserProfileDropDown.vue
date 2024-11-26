<script setup lang="ts">
import {onMounted, ref} from 'vue';
import { useRouter } from 'vue-router';
import {userInfo} from "../api/user.ts";

const router = useRouter();
const user = ref<{ name: string } | null>(null);
const userInitial = ref<string>(user.value?.name?.charAt(0) || '?');

const showMenu = ref(false);
let hideMenuTimeout: number | null = null;

async function fetchUserInfo() {
  userInfo().then(res => {
    if(res.data.code === '000') {
      console.log("fetchUserInfo!")
      user.value = {name: res.data.result.name};
      console.log(user.value.name);
      userInitial.value = user.value?.name?.charAt(0).toUpperCase() || '?';
      console.log(userInitial.value)
    }
  })
}

onMounted(() => {
  console.log("here onMounted")
  if(sessionStorage.getItem('token') == '') {
    user.value = null;
  } else{
    fetchUserInfo();
  }
})

function showDropdownMenu() {
  if (hideMenuTimeout) {
    clearTimeout(hideMenuTimeout);
    hideMenuTimeout = null;
  }
  showMenu.value = true;
}

function hideDropdownMenu() {
  hideMenuTimeout = window.setTimeout(() => {
    showMenu.value = false;
  }, 200);
}

function goToFavorites() {
  router.push('/favorites');
}

function goToAccount() {
  router.push('/account');
}

function logout() {
  console.log("in logout")
  sessionStorage.setItem('token', '');
  console.log(sessionStorage.getItem('token'))
  user.value = null;
  router.push('/').then(() => {
    window.location.reload();
  });
}
</script>

<template>
  <div
      v-if="user"
      class="user-profile"
      @mouseover="showDropdownMenu"
      @mouseleave="hideDropdownMenu"
  >
    <div class="avatar">{{ userInitial }}</div>
    <ul v-show="showMenu" class="dropdown-menu">
      <li @click="goToFavorites">Favorites</li>
      <li @click="goToAccount">Account</li>
      <li @click="logout">Sign out</li>
    </ul>
  </div>
</template>

<style scoped>
.user-profile {
  position: relative;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.avatar {
  width: 40px;
  height: 40px;
  background-color: green;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  font-size: 20px;
  font-weight: bold;
}

.dropdown-menu {
  position: absolute;
  top: 50px;
  right: 0;
  background: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  overflow: hidden;
  z-index: 1000;
  list-style: none;
  padding: 0;
  margin: 0;
}

.dropdown-menu li {
  padding: 10px 20px;
  cursor: pointer;
  font-size: 16px;
  color: #333;
  transition: background-color 0.3s ease;
}

.dropdown-menu li:nth-child(1) {
  border-bottom: 1px solid #e0e0e0;
}

.dropdown-menu li:hover {
  background-color: #f5f5f5;
}
</style>
