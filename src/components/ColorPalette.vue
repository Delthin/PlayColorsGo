<script setup lang="ts">
import { defineProps, onMounted, ref } from 'vue';
import { router } from "../router";
import { axios } from '../utils/request';
import { userInfo } from "../api/user.ts";

const props = defineProps<{
  paletteId: number
  colors: string[]
  isActive: boolean
  size?: 'small' | 'medium' | 'large'  // 添加尺寸控制
  fromFavorites?: boolean
}>();


const tooltip = ref({
  visible: false,
  color: '',
  x: 0,
  y: 0
});

// 控制菜单的显示状态
const hoveredColor = ref('');
const copiedColor = ref('');
const menuVisible = ref(props.isActive);
const user = ref<{ name: string } | null>(null);

async function fetchUserInfo() {
  userInfo().then((res) => {
    if (res.data.code === '000') {
      console.log("fetchUserInfo!")
      user.value = { name: res.data.result.name };
      console.log(user.value.name);
    }
  })
}

onMounted(() => {
  if (!(sessionStorage.getItem('token') == '')) {
    fetchUserInfo();
  } else {
    user.value = null;
  }
});

// 复制调色板到剪切板
function copyPalette() {
  const palette = props.colors.join(', ');
  navigator.clipboard.writeText(palette).then(() => {
    alert(`Copied palette: ${palette}`);
  });
  menuVisible.value = false;
}


function openPalette() {
  const palette = props.colors.join(','); // Join colors into a single string for easy passing
  console.log("on openPalette");
  router.push({ path: '/preview', query: { colors: palette } });
  menuVisible.value = false;
}

// 添加调色板到收藏
async function addToFavorites() {
  console.log("call addToFavorites");
  console.log(user.value?.name);
  if (user.value != null) {
    console.log("h here!")
    const name = user.value.name;
    const paletteId = props.paletteId;
    console.log(paletteId);
    const url = `/api/users/addFavorite?name=${encodeURIComponent(name)}&paletteId=${encodeURIComponent(paletteId)}`;
    console.log("about to call backend")
    try {
      // 发起POST请求，调用后端接口
      const response = await axios.post(url, null);
      console.log("in addToFavorites");
      console.log(user.value.name);
      if (response.data.code === "000") {
        console.log("Palette added to favorites successfully!");
        alert("Successfully add to favorites!");
      } else {
        console.error("Failed to add to favorites:", response.data.msg);
      }
    } catch (error) {
      console.error("Error while adding to favorites:", error);
    }
  } else {
    alert("Please log in first!");
  }
}

function isLightColor(color: string): boolean {
  const hex = color.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return (r * 0.299 + g * 0.587 + b * 0.114) > 128;
}

// 格式化颜色代码
function formatHexColor(color: string): string {
  return color.replace('#', '').toUpperCase();
}

// 复制颜色函数
function copyColor(color: string) {
  navigator.clipboard.writeText(color);
  copiedColor.value = color;
  setTimeout(() => {
    copiedColor.value = '';
  }, 2000);
}
</script>

<template>
  <div class="palette-container">
    <div class="palette" :class="[size || 'large']">
      <div v-for="color in colors" 
           :key="color" 
           :style="{ 
             backgroundColor: color,
             flex: hoveredColor === color ? '2' : '1'
           }" 
           class="color-box"
           @mouseenter="hoveredColor = color" 
           @mouseleave="hoveredColor = ''"
           @click="copyColor(color)">
        <div v-if="hoveredColor === color || copiedColor === color"
             :class="['color-info', isLightColor(color) ? 'dark-text' : 'light-text']">
          <template v-if="copiedColor === color">
            <i class="fas fa-check"></i>
          </template>
          <template v-else>
            {{ formatHexColor(color) }}
          </template>
        </div>
      </div>
    </div>
    <div class="copy-notification" v-if="copiedColor">
      <i class="fas fa-check-circle"></i>
      Color copied to clipboard!
    </div>
    <div class="action-buttons">
      <button v-if="!fromFavorites" class="action-button" @click="addToFavorites" >
        <i class="fas fa-heart"></i>
        <span class="tooltip">Add to Favorites</span>
      </button>
      <button class="action-button" @click="copyPalette" >
        <i class="fas fa-copy"></i>
        <span class="tooltip">Copy Palette</span>
      </button>
      <button class="action-button" @click="openPalette" >
        <i class="fas fa-eye"></i>
        <span class="tooltip">View Palette</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.palette-container {
  display: flex;
  flex-direction: column;
  position: relative;
  padding-bottom: 40px;
  /* 为菜单按钮留出空间 */
}

.palette-wrapper {
  position: relative;
  width: 100%;
}

.palette {
  display: flex;
  width: 100%;
  overflow: hidden;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.palette.small {
  height: 40px;
}

.palette.medium {
  height: 80px;
}

.palette.large {
  height: 120px;
}

.color-box {
  flex: 1;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.color-info {
  position: absolute;
  font-size: 14px;
  font-family: 'Arial', sans-serif;
  font-weight: 600;
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.3s ease;
  width: 100%;
  text-align: center;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.color-box:hover .color-info {
  opacity: 1;
  transform: translateY(0);
}

.light-text {
  color: white;
}

.dark-text {
  color: black;
}

.copy-notification {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #333;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  animation: slideUp 0.3s ease-out forwards;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 8px;
}

.copy-notification i {
  color: #4CAF50;
}

@keyframes slideUp {
  from {
    transform: translate(-50%, 20px);
    opacity: 0;
  }
  to {
    transform: translate(-50%, 0);
    opacity: 1;
  }
}

.palette.small .color-info {
  font-size: 12px;
}

.palette.medium .color-info {
  font-size: 14px;
}

.palette.large .color-info {
  font-size: 16px;
}

.fa-check {
  font-size: 1.2em;
}

.action-buttons {
  position: absolute;
  right: 0;
  bottom: 0;
  display: flex;
  gap: 8px;
  z-index: 5;
}

.action-button {
  width: 36px;
  height: 36px;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 50%;
  cursor: pointer;
  color: #2c3e50;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  padding: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  position: relative;
}

.action-button:hover {
  background-color: #ffffff;
  border-color: #d0d0d0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  transform: translateY(-1px);
}

.action-button .tooltip {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background-color: #333;
  color: #fff;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 14px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
}

.action-button:hover .tooltip {
  opacity: 1;
  visibility: visible;
}

/* 添加小箭头 */
.action-button .tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-width: 5px;
  border-style: solid;
  border-color: #333 transparent transparent transparent;
}
</style>
