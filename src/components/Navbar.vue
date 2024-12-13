<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter, useRoute } from 'vue-router';
import LoginModal from "./LoginModal.vue";
import SignUpModal from "./SignUpModal.vue";
import UserProfileDropDown from "./UserProfileDropDown.vue";
import { userInfo } from "../api/user.ts";

const router = useRouter();
const route = useRoute();

const showLoginModal = ref(false);
const showSignUpModal = ref(false);

const tags = ref<string[]>([]);
const inputTag = ref<string>('');
const emit = defineEmits(["tags-update"]);
const user = ref<{ name: string } | null>(null);

async function fetchUserInfo() {
  try {
    const res = await userInfo();
    if (res.data.code === '000') {
      console.log("fetchUserInfo!");
      user.value = { name: res.data.result.name };
      console.log(user.value.name);
      console.info('user', user.value);
    }
  } catch (error) {
    console.error("Error fetching user info:", error);
    user.value = null;
  }
}

onMounted(() => {
  console.log('Navbar mounted');
  const token = sessionStorage.getItem('token');
  if (!token) {
    user.value = null;
  } else {
    fetchUserInfo();
  }
});

function addTag(tag: string) {
  if (tag.trim() !== '' && !tags.value.includes(tag)) {
    tags.value.push(tag.trim());
    console.log(tag.trim());
    inputTag.value = '';
    emit("tags-update", tags.value);
  }
}

function removeTag(tag: string) {
  console.log(tag);
  tags.value = tags.value.filter((t) => t !== tag);
  emit("tags-update", tags.value);
}

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
      <!-- 左侧：标题 -->
      <div class="navbar-left">
        <h1 class="title-left">Coolors</h1>
      </div>

      <!-- 中间：搜索框 -->
      <div class="navbar-center">
        <div class="search-container" :class="{ 'with-tags': tags.length > 0 }">
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
      </div>

      <!-- 右侧：导航链接和认证按钮 -->
      <div class="navbar-right">
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
        <div class="auth-buttons">
          <div v-if="user">
            <UserProfileDropDown />
          </div>
          <div v-else>
            <span class="sign-in" @click="openLoginModal">Sign in</span>
            <button class="sign-up" @click="openSignUpModal">Sign up</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 模态框 -->
    <LoginModal
        v-if="showLoginModal"
        @close="showLoginModal = false"
        @loginSuccess="user = $event"
        @switchToSignUp="openSignUpModal"
    />
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
  width: 100%;
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1000; /* 确保导航栏在最上层 */
}

.navbar-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 10px 20px; /* 左右内边距 */
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.navbar-left {
  flex: 1;
}

.title-left {
  color: deepskyblue;
  font-size: 36px;
  margin: 0; /* 移除默认外边距 */
}

.navbar-center {
  flex: 2;
  display: flex;
  justify-content: center;
}

.search-container {
  transition: all 0.3s ease;
  background-color: #f9f9f9;
  border-radius: 30px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 5px 10px;
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 400px; /* 限制搜索框最大宽度 */
}

.search-icon img {
  width: 20px;
  height: 20px;
  margin-right: 8px;
}

input {
  border: none;
  border-radius: 30px;
  background-color: transparent;
  font-size: 14px;
  color: #333;
  flex: 1;
}

input::placeholder {
  color: #aaa;
}

input:focus {
  outline: none;
  background-color: #ffffff;
}

.tags-input-container {
  border: 1px solid #ddd;
  border-radius: 20px;
  background-color: #f9f9f9;
  overflow: auto;
  padding: 5px 10px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  margin-right: 8px;
}

.tag {
  background: #eaeaea;
  border-radius: 20px;
  font-size: 14px;
  padding: 2px 8px;
  margin: 2px;
  display: flex;
  align-items: center;
}

.tag button {
  background: none;
  border: none;
  cursor: pointer;
  color: #888;
  font-size: 12px;
  margin-left: 4px;
}

.tag-input {
  border: none;
  background: none;
  outline: none;
  font-size: 14px;
  white-space: nowrap;
}

.tag-input::placeholder {
  color: #aaa;
}

.navbar-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.nav-links {
  display: flex;
  gap: 20px;
  margin-right: 20px;
  font-size: 18px;
  font-weight: bold;
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
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.sign-in {
  font-size: 18px;
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
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.sign-up:hover {
  background-color: #0056b3;
}
</style>

