<script setup lang="ts">
import {onMounted, ref, onUnmounted} from "vue";
import {useRouter, useRoute} from 'vue-router';
import LoginModal from "../auth/LoginModal.vue";
import SignUpModal from "../auth/SignUpModal.vue";
import UserProfileDropDown from "../auth/UserProfileDropDown.vue";
import {getUserInfo} from "../../api/user.ts";

const router = useRouter();
const route = useRoute();

const showLoginModal = ref(false);
const showSignUpModal = ref(false);

const tags = ref<string[]>([]);
const inputTag = ref<string>('');
const emit = defineEmits(["tags-update"]);
const user = ref<{ name: string } | null>(null);
const isTagRecommendationVisible = ref(false);

function onSearchInputFocus() {
  isTagRecommendationVisible.value = true;
}

function onOutsideClick(event: MouseEvent) {
  const searchContainer = document.querySelector('.search-container');
  if (searchContainer && !searchContainer.contains(event.target as Node)) {
    isTagRecommendationVisible.value = false;
  }
}

const colorsTags = ref<string[]>([
  "Red", "Orange", "Brown", "Yellow", "Green", "Turquoise", "Blue", "Violet", "Pink", "Gray", "Black", "White",
]);

const stylesTags = ref<string[]>([
  "Warm", "Cold", "Bright", "Dark", "Vintage", "Monochromatic", "Gradient", "Rainbow", "2 Colors", "3 Colors", "4 Colors",
]);

const topicsTags = ref<string[]>([
  "Christmas", "Halloween", "Pride", "Sunset", "Spring", "Winter", "Summer", "Autumn", "Party", "Space", "Kids",
]);


async function fetchUserInfo() {
  try {
    const res = await getUserInfo();
    if (res.data.code === '000') {
      // console.log("fetchUserInfo!");
      user.value = {name: res.data.result.name};
      // console.log(user.value.name);
      // console.info('user', user.value);
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

  document.addEventListener('click', onOutsideClick);
});

onUnmounted(() => {
  document.removeEventListener('click', onOutsideClick);
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
  router.push({path: '/preview', query: {colors: null}});
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
      <div class="navbar-left">
        <h1 class="title-left">Coolors</h1>
      </div>
      <div class="navbar-right">
        <div class="nav-links">
          <span :class="{ active: route.path === '/image-picker' }" @click="router.push('/image-picker')">
            Image-Picker
          </span>
          <span :class="{ active: route.path === '/colors' }" @click="router.push('/colors')">
            Colors
          </span>
          <span :class="{ active: route.path === '/preview' }" @click="openPalette">
            Preview
          </span>
        </div>
        <div class="sep"> |</div>
        <div class="auth-buttons">
          <div v-if="user">
            <UserProfileDropDown/>
          </div>
          <div v-else>
            <span class="sign-in" @click="openLoginModal">Sign in</span>
            <button class="sign-up" @click="openSignUpModal">Sign up</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="route.path === '/colors'" class="search-row">
      <div class="search-container">
        <div class="tags" v-if="tags.length > 0">
            <span v-for="tag in tags" :key="tag" class="tag">
              {{ tag }}
              <button @click="removeTag(tag)">×</button>
            </span>
        </div>
        <span class="search-icon" v-if="tags.length === 0">
            <img src="../../../public/search.png" alt="search"/>
          </span>
        <input type="text"
               v-model="inputTag"
               @keydown="handleKeyPress"
               @focus="onSearchInputFocus"
               placeholder="Search or add tags"
               class="search-input"/>
      </div>
    </div>

    <div v-if="isTagRecommendationVisible" class="search-modal-overlay">
      <div class="search-modal-content">
        <div class="tag-section">
          <div>
            <h3>Colors</h3>
            <div class="tags-container">
              <div class="tag" v-for="tag in colorsTags" :key="tag" @click="addTag(tag)">
                {{ tag }}
              </div>
            </div>
          </div>
          <div>
            <h3>Styles</h3>
            <div class="tags-container">
              <div class="tag" v-for="tag in stylesTags" :key="tag" @click="addTag(tag)">
                {{ tag }}
              </div>
            </div>
          </div>
          <div>
            <h3>Topics</h3>
            <div class="tags-container">
              <div class="tag" v-for="tag in topicsTags" :key="tag" @click="addTag(tag)">
                {{ tag }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="loginbtn">
      <LoginModal v-if="showLoginModal" @close="showLoginModal = false" @loginSuccess="user = $event"
                  @switchToSignUp="openSignUpModal"/>
    </div>
    <div class="signupbtn">
      <SignUpModal v-if="showSignUpModal" @close="showSignUpModal = false" @signupSuccess="user = $event"
                   @switchToSignIn="openLoginModal"/>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  width: 100%;
  background-color: #ffffff;
  z-index: 996;
}

.navbar-content {
  margin: 0 auto;
  padding: 10px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1.5px solid rgba(0, 0, 0, 0.08);
}

.navbar-left {
  flex: 1;
  display: flex;
  align-items: center;
}

.title-left {
  color: deepskyblue;
  font-size: 36px;
  margin: 0;
}

.search-row {
  position: relative;
  top: 10px;
  padding: 15px 20px;
  width: 100%;
  background-color: #ffffff;
  z-index: 995;
  border-bottom: 1.5px solid rgba(0, 0, 0, 0.08);
}

.search-container {
  width: 100%;
  display: flex;
  align-items: center;
}

.search-icon img {
  width: 20px;
  height: 20px;
  margin-right: 8px;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  border-radius: 8px;
  min-height: 40px;
}

.search-input::placeholder {
  color: #aaa;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  margin-right: 8px;
  gap: 4px;
}

.tag button {
  background: none;
  border: none;
  cursor: pointer;
  margin-left: 8px;
  color: #888;
  font-size: 12px;
  padding: 0;
}

.navbar-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 20px;
  min-width: 200px; /* 确保足够的宽度 */
}

.nav-links {
  display: flex;
  gap: 20px;
  font-size: 18px;
  font-weight: bold;
  white-space: nowrap; /* 防止文本换行 */
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

.sep {
  color: #e0e0e0;
}

.auth-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-shrink: 0; /* 防止缩小 */
}

.sign-in, .sign-up {
  white-space: nowrap;
}

.sign-in {
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  color: #333;
  transition: color 0.3s ease;
  padding-right: 16px;
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

.search-modal-overlay {
  position: relative;
  width: 100%;
  background: #ffffff;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.search-modal-content {
  text-align: left;
  min-height: 300px;
  padding: 20px;
}

.tag-section {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.tag-section > div {
  flex: 1;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  justify-items: center;
  margin-top: 5px;
}

.tag {
  max-height: 12px;
  border-radius: 10px;
  display: flex;
  margin: 2px;
  align-items: center;
  font-size: 14px;

  background: none;
  border: 1.5px solid #e0e0e0;
  padding: 10px 20px;
  cursor: pointer;
  transition: background 0.3s ease;
  text-align: center;
}

.tag:hover {
  background: #e0e0e0;
}

/* 响应式调整 */
@media (max-width: 1024px) {
  .title-left {
    font-size: 32px;
  }

  .nav-links {
    gap: 15px;
    font-size: 16px;
  }

  .auth-buttons {
    gap: 15px;
    min-width: 120px;
  }

  .sign-in, .sign-up {
    font-size: 16px;
    padding: 6px 12px;
  }
}


</style>


/* Responsive adjustments */
//@media (max-width: 768px) {
// .navbar-content {
// flex-direction: column;
// align-items: stretch;
// }
//
// .navbar-left,
// .navbar-center,
// .navbar-right {
// flex: none;
// width: 100%;
// text-align: center;
// margin: 5px 0;
// }
//
// .navbar-right {
// justify-content: center;
// flex-direction: row;
// }
//
// .auth-buttons {
// display: flex; /* Maintain row layout */
// gap: 10px; /* Adjust spacing if needed */
// justify-content: center; /* Ensure the buttons stay centered */
// }
//}


//.search-container {
//  transition: all 0.3s ease;
//  background-color: #ffffff;
//  border-radius: 20px;
//  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
//  padding: 8px 12px;
//  display: flex;
//  align-items: center;
//  width: 100%;
//  max-width: 70%;
//}