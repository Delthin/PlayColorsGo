<script setup lang="ts">
import { ref, onMounted } from "vue";
import {login, getUserInfo, updateUserInfo} from "../api/user.ts";
import UserProfileDropDown from "../components/UserProfileDropDown.vue";
import Navbar from "../components/Navbar.vue";

const user = ref<{ name: string }>({ name: "" });
const newPassword = ref("");

async function fetchUserInfo() {
  getUserInfo().then(res => {
    if(res.data.code === '000') {
      console.log("fetchUserInfo!")
      user.value = {name: res.data.result.name};
      newPassword.value = res.data.result.password;
      console.log(user.value.name);
    }
  })
}

onMounted(() => {
  fetchUserInfo();
})

// 更新用户名
async function updateUsername() {
  if (user.value.name.trim() === "") {
    alert("Username cannot be empty!");
    return;
  }
  updateUserInfo({
    name: user.value.name,
    password: undefined
  }).then(res => {
    if(res.data.code === '000') {
      console.log("Username updated successfully!");
      sessionStorage.setItem('name', res.data.result.name);
      login({
        name: user.value.name,
        password: newPassword.value
      }).then(res => {
        if(res.data.code === '000') {
          const token = res.data.result
          sessionStorage.setItem('token', token)
        }
      })
    }
  })
  window.location.reload();
}

// 更新密码
function updatePassword() {
  if (newPassword.value.trim() === "") {
    alert("Please fill in all password fields!");
    return;
  }
  updateUserInfo({
    name: undefined,
    password: newPassword.value
  }).then(res => {
    if(res.data.code === '000') {
      console.log("Username updated successfully!");
      login({
        name: user.value.name,
        password: newPassword.value
      }).then(res => {
        if(res.data.code === '000') {
          const token = res.data.result
          sessionStorage.setItem('token', token)
        }
      })
    }
  })
  window.location.reload();
}
</script>

<template>
  <Navbar />
  <div class="account-page">
    <div class="content">
      <h1>Account</h1>
      <p class="main-description">Update your username and password.</p>

      <div class="form-container">
        <h2>Username</h2>
        <p class="field-description">Change your username here.</p>
        <label for="username">New username</label>
        <input
            type="text"
            id="username"
            v-model="user.name"
            placeholder="Enter your new username"
        />
        <button @click="updateUsername">Save</button>
      </div>

      <div class="form-container">
        <h2>Password</h2>
        <p class="field-description">Change your password here.</p>
        <label for="new-password">New password</label>
        <input
            type="text"
            id="new-password"
            v-model="newPassword"
            placeholder="Enter your new password"
        />
        <button @click="updatePassword">Save</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.account-page {
  position: relative;
  margin-top: 150px;
}

.content {
  max-width: 700px;
  margin: auto;
  text-align: center;
}

h1 {
  font-size: 36px;
  margin-bottom: 10px;
  font-weight: bold;
}

.main-description {
  font-size: 18px;
  color: #666;
  margin-bottom: 30px;
  text-align: center;
}

.field-description {
  font-size: 16px;
  color: #888;
  margin-bottom: 20px;
  text-align: left;
  margin-left: 28px;
}

.form-container {
  background-color: #ffffff;
  padding: 40px 20px;
  border-radius: 8px;
  border: 1px solid #ccc;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 50px;
  margin-left: auto;
  margin-right: auto;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 7px;
  position: relative;
}

h2 {
  font-size: 24px;
  margin-bottom: 0px;
  font-weight: bold;
  text-align: left;
  margin-left: 28px;
  margin-top: -10px;
}

label {
  display: block;
  font-weight: bold;
  margin-bottom: 25px;
  text-align: left;
  margin-left: 29px;
}

input {
  width: 90%;
  padding: 10px;
  margin-bottom: 35px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-left: auto;
  margin-right: auto;
}

button {
  align-self: flex-end;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  margin-right: 30px;
}

button:hover {
  background-color: #0056b3;
}
</style>