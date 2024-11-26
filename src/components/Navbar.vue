<script setup lang="ts">
import {onMounted, ref} from "vue";
import { useRouter, useRoute } from 'vue-router';
import LoginModal from "./LoginModal.vue";
import SignUpModal from "./SignUpModal.vue";
import UserProfileDropDown from "./UserProfileDropDown.vue";
import {userInfo} from "../api/user.ts";

const router = useRouter();
const route = useRoute();

// 控制sign in和sign up弹窗显示状态
const showLoginModal = ref(false);
const showSignUpModal = ref(false);

// 搜索标签逻辑
const tags = ref<string[]>([]);
const inputTag = ref<string>(''); // 当前输入内容
const emit = defineEmits(["tags-update"]);
const user = ref<{ name: string } | null>(null);

async function fetchUserInfo() {
  userInfo().then(res => {
    if(res.data.code === '000') {
      console.log("fetchUserInfo!")
      user.value = {name: res.data.result.name};
      console.log(user.value.name);
    }
  })
}

onMounted(() => {
  console.log('here hey')
  if(sessionStorage.getItem('token') == '') {
    user.value = null;
  } else{
    fetchUserInfo();
  }
})

function addTag(tag: string) {
  if (tag.trim() !== '' && !tags.value.includes(tag)) {
    tags.value.push(tag.trim());
    console.log(tag.trim());
    inputTag.value = ''; // 清空输入框
    emit("tags-update", tags.value); // 发出更新事件
  }
}

function removeTag(tag: string) {
  console.log(tag);
  tags.value = tags.value.filter((t) => t !== tag);
  emit("tags-update", tags.value); // 发出更新事件
}

// 监听用户按键事件
function handleKeyPress(event: KeyboardEvent) {
  if (event.key === 'Enter' && inputTag.value.trim() !== '') {
    addTag(inputTag.value.trim());
  }
}

function openPalette() {
  router.push({ path: '/preview', query: { colors: null } });
}

function openLoginModal() {
  showSignUpModal.value = false;
  showLoginModal.value = true;
}

function openSignUpModal() {
  showLoginModal.value = false;
  showSignUpModal.value = true;
}
</script>

<template>
  <nav class="navbar">
    <div class="navbar-content">
      <h1>Coolors</h1>
      <!-- 搜索框和标签部分 -->
      <div class="search-container" :class="{ 'with-tags': tags.length > 0 }">
        <!-- 当没有标签时的原始布局 -->
        <template v-if="tags.length === 0">
          <span class="search-icon">
            <img src="../../public/search.png" alt="search" />
          </span>
          <input
              type="text"
              v-model="inputTag"
              @keydown="handleKeyPress"
              placeholder="Search with colors, topics, styles, or hex values..."
          />
        </template>

        <!-- 当有标签时的标签和输入框布局 -->
        <div v-else class="tags-input-container">
          <div class="tags">
            <span v-for="tag in tags" :key="tag" class="tag">
              {{ tag }}
              <button @click="removeTag(tag)">×</button>
            </span>
          </div>
          <input
              type="text"
              v-model="inputTag"
              @keydown="handleKeyPress"
              placeholder="Add tag"
              class="tag-input"
          />
        </div>
      </div>
      <div class="nav-links">
        <span
            :class="{ active: route.path === '/colors' }"
            @click="router.push('/colors')"
        >
          Colors
        </span>
        <span
            :class="{ active: route.path === '/preview' }"
            @click="openPalette"
        >
          Preview
        </span>
      </div>
      <div class="separator"></div>
      <!-- 登录后显示头像 -->
      <UserProfileDropDown v-if="user" />
      <!-- 未登录显示Sign in & Sign up -->
      <div v-else class="auth-buttons">
        <span class="sign-in" @click="openLoginModal">Sign in</span>
        <button class="sign-up" @click="openSignUpModal">Sign up</button>
      </div>
    </div>
    <!-- 登录弹窗 -->
    <LoginModal
        v-if="showLoginModal"
        @close="showLoginModal = false"
        @loginSuccess="user = $event"
        @switchToSignUp="openSignUpModal"
    />
    <!-- 注册弹窗 -->
    <SignUpModal
        v-if="showSignUpModal"
        @close="showSignUpModal = false"
        @signupSuccess="user = $event"
        @switchToSignIn="openLoginModal"
    />
  </nav>
</template>


<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px 0;
}

.navbar-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

h1 {
  margin: 0;
  color: deepskyblue;
  font-size: 36px;
}

.search-container {
  position: relative;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  background-color: #ffffff;
  border-radius: 30px; /* 设置圆角矩形 */
  padding: 5px 15px; /* 增加内边距 */
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); /* 添加轻微的阴影 */
}

.search-icon img {
  width: 20px; /* 图标宽度 */
  height: 20px; /* 图标高度 */
}

input {
  padding: 10px 10px 10px 40px; /* 留出图标的空间 */
  border: none; /* 去掉边框 */
  border-radius: 30px; /* 圆角矩形 */
  width: 300px; /* 搜索框宽度 */
  background-color: transparent; /* 背景透明，与容器一致 */
  font-size: 14px;
  color: #333;
}

input::placeholder {
  color: #aaa;
}

input:focus {
  outline: none;
  background-color: #ffffff;
}

.tags-input-container {
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 20px;
  padding: 5px 10px;
  background-color: #f9f9f9;
  gap: 10px;
  width: 100%;
  max-width: 500px;
  overflow: auto;
}

.tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 5px;
  white-space: nowrap;
  overflow: hidden;
  flex-shrink: 0;
}

.tag {
  display: flex;
  align-items: center;
  background: #eaeaea;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 14px;
}

.tag button {
  background: none;
  border: none;
  cursor: pointer;
  margin-left: 5px;
  color: #888;
  font-size: 12px;
}

.tag-input {
  border: none;
  background: none;
  outline: none;
  font-size: 14px;
  flex-grow: 1;
  white-space: nowrap;
}

.tag-input::placeholder {
  color: #aaa;
}

/* 隐藏滚动条样式 */
.tags-input-container::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}
.tags-input-container {
  -ms-overflow-style: none; /* IE 10+ */
  scrollbar-width: none; /* Firefox */
}

.nav-links {
  display: flex;
  gap: 20px;
  font-size: 18px;
}

.nav-links span {
  cursor: pointer;
  color: #333;
  transition: color 0.3s ease;
}

.nav-links .active {
  color: red;
}

.nav-links span:hover {
  color: #666;
}

.auth-buttons {
  height: 55px;
  display: flex;
  align-items: center;
  gap: 20px;
}

.sign-in {
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  color: #333;
  transition: color 0.3s ease;
}

.sign-in:hover {
  color: #007bff;
}

.sign-up {
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.sign-up:hover {
  background-color: #0056b3;
}

.separator {
  width: 0.5px;
  height: 35px;
  background-color: #e0e0e0;
  margin-right: 20px;
}
</style>
