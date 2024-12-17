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

// 显示工具提示
function showTooltip(color: string, event: MouseEvent) {
  tooltip.value = {
    visible: true,
    color,
    x: event.clientX,
    y: event.clientY - 30
  };
}

// 隐藏工具提示
function hideTooltip() {
  tooltip.value.visible = false;
}

// 切换菜单的显示状态
function toggleMenu() {
  menuVisible.value = !menuVisible.value;
}

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

// function handleClickOutside(event: MouseEvent) {
//   const menuContainer = document.querySelector('.menu-button-container');
//   if (menuVisible.value && menuContainer && !menuContainer.contains(event.target as Node)) {
//     menuVisible.value = false;
//   }
// }

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

// 组件挂载时添加事件监听
// onMounted(() => {
//   if(!(sessionStorage.getItem('token') == '')) {
//     fetchUserInfo();
//   } else{
//     user.value = null;
//   }
//   document.addEventListener('click', handleClickOutside);
// });

// // 组件卸载时移除事件监听
// onUnmounted(() => {
//   document.removeEventListener('click', handleClickOutside);
// });
</script>

<template>
  <div class="palette-container">
    <div class="palette" :class="[size || 'large']">
      <div v-for="color in colors" :key="color" :style="{ backgroundColor: color }" class="color-box"
        @mouseenter="showTooltip(color, $event)" @mouseleave="hideTooltip">
        <span v-if="tooltip.visible && tooltip.color === color" class="tooltip"
          :style="{ top: tooltip.y + 'px', left: tooltip.x + 'px' }">
          {{ color }}
        </span>
      </div>
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
  transition: transform 0.2s;
}

.tooltip {
  position: absolute;
  padding: 5px 10px;
  background-color: #333;
  color: #fff;
  font-size: 12px;
  border-radius: 4px;
  pointer-events: none;
  transform: translate(-50%, -100%);
  white-space: nowrap;
  z-index: 10;
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
