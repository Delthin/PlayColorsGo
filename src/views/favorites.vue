<script setup lang="ts">
import {ref, onMounted, watch} from "vue";
import UserProfileDropDown from "../components/UserProfileDropDown.vue";
import ColorPalette from '../components/ColorPalette.vue'
import { userInfo } from "../api/user.ts";
import {axios} from '../utils/request';

// 示例 favorites 数据
const favorites = ref<Array<{ id: number; colors: string[] }>>([]);
const user = ref<{ name: string } >({ name: "" });
const tags = ref<string[]>([]);
const inputTag = ref<string>(''); // 当前输入内容

// 获取用户收藏项
async function fetchUserInfoAndFavorites() {
  try {
    // 确保获取用户信息是同步完成的
    const res = await userInfo();
    if (res.data.code === '000') {
      console.log("fetchUserInfo in favorites.vue!");
      user.value = { name: res.data.result.name };
      console.log(user.value.name);
    } else {
      console.error("Failed to fetch user info:", res.data.msg);
      return; // 如果用户信息获取失败，直接返回
    }

    // 只有当用户信息获取成功后，才继续执行获取收藏信息的逻辑
    if (user.value.name) {
      const response = await axios.get("/api/users/getFavorites", {
        params: { name: user.value.name }
      });
      if (response.data.code === '000') {
        // 处理成功返回的数据
        favorites.value = response.data.result.map((palette: any) => ({
          id: palette.id,
          colors: palette.colors
        }));
      } else {
        console.error("Failed to fetch favorites:", response.data.msg);
      }
    } else {
      console.warn("Username is not available yet");
    }
  } catch (error) {
    console.error("Error fetching user info or favorites:", error);
  }
}

function addTag(tag: string) {
  if (tag.trim() !== '' && !tags.value.includes(tag)) {
    tags.value.push(tag.trim());
    console.log(tag.trim());
    inputTag.value = ''; // 清空输入框
  }
}

function removeTag(tag: string) {
  console.log(tag);
  tags.value = tags.value.filter((t) => t !== tag);
}

// 监听用户按键事件
function handleKeyPress(event: KeyboardEvent) {
  if (event.key === 'Enter' && inputTag.value.trim() !== '') {
    addTag(inputTag.value.trim());
  }
}

async function fetchFilteredFavorites() {
  try {
    if (tags.value.length > 0) {
      // 请求接口，传递 tags 作为参数
      console.log(tags.value);
      const tagsString = tags.value.map(tag => encodeURIComponent(tag)).join('&tags=');
      const response = await axios.get(`/api/users/searchFavorites`, {
        params: {
          name: user.value.name,
          tags: tagsString,
        }
      });
      if (response.data.code === '000') {
        favorites.value = response.data.result.map((palette: any) => ({
          id: palette.id,
          colors: palette.colors,
        }));
      } else {
        console.error("Failed to fetch filtered palettes:", response.data.msg);
      }
    } else {
      // 如果没有标签，获取所有的调色板
      const response = await axios.get("/api/users/getFavorites", {
        params: { name: user.value.name }
      });
      if (response.data.code === '000') {
        favorites.value = response.data.result.map((palette: any) => ({
          id: palette.id,
          colors: palette.colors,
        }));
      } else {
        console.error("Failed to fetch palettes:", response.data.msg);
      }
    }
  } catch (error) {
    console.error("Error fetching filtered palettes:", error);
  }
}

watch(tags, () => {
  console.log("update favorites!");
  fetchFilteredFavorites();
}, { immediate: true, deep: true });

onMounted(() => {
  fetchUserInfoAndFavorites();
});
</script>

<template>
  <div class="favorites-page">
    <!-- 用户头像和下拉菜单 -->
    <div class="user-dropdown-container">
      <UserProfileDropDown />
    </div>

    <!-- 页面内容 -->
    <div class="content">
      <h1>Favorites</h1>
      <div class="search-section">
        <div class="search-container" :class="{ 'with-tags': tags.length > 0 }">
          <template v-if="tags.length === 0">
            <span class="search-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#888">
                <path d="M10,2a8,8,0,0,1,5.66,13.66l4.71,4.71a1,1,0,0,1-1.41,1.41l-4.71-4.71A8,8,0,1,1,10,2Zm0,2a6,6,0,1,0,6,6A6,6,0,0,0,10,4Z"></path>
              </svg>
            </span>
            <input
                type="text"
                placeholder="Search name or hex"
                v-model="inputTag"
                @keydown="handleKeyPress"
                class="search-input"
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

      <!-- 空状态显示 -->
      <div v-if="favorites.length === 0" class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" fill="#b0b0b0" viewBox="0 0 24 24">
          <path d="M12 .587l3.668 7.57 8.332 1.151-6.064 5.922 1.484 8.259-7.42-3.897-7.42 3.897 1.484-8.259-6.064-5.922 8.332-1.151z"/>
        </svg>
        <p>You don't have any according favorite yet.</p>
      </div>
      <div v-else class="palette-list">
        <ColorPalette
            v-for="palette in favorites"
            :key="palette.id"
            :colors="palette.colors"
            :paletteId="palette.id"
            :fromFavorites="true"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.favorites-page {
  padding: 20px;
  position: relative;
}

.user-dropdown-container {
  position: absolute;
  top: 30px;
  right: 170px; /* 将头像定位到右上角 */
}

.content {
  max-width: 800px;
  margin: 50px auto;
  text-align: center;
}

h1 {
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 40px;
}

.search-section {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 40px;
  margin-left: 900px; /* 调整搜索框的位置往右移动 */
}

.search-container {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 10px;
  font-size: 16px;
  color: #888;
}

.search-input {
  padding: 10px 10px 10px 35px; /* 左侧为图标留出空间 */
  border: 1px solid #ddd;
  border-radius: 8px;
  width: 250px;
}

.empty-state {
  margin-top: 100px;
}

.empty-state p {
  color: #666;
  margin-top: 20px;
}

.palette-list {
  display: grid;
  gap: 30px;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); /* 自适应宽度 */
  width: 100%;
  padding: 0 40px; /* Add padding to avoid sticking to edges */
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
</style>
