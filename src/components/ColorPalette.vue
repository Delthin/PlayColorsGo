<script setup lang="ts">
import {defineProps, onMounted, ref} from 'vue';
import {router} from "../router";
import {axios} from '../utils/request';
import {userInfo} from "../api/user.ts";

const props = defineProps<{
  paletteId: number,
  colors: string[],
  fromFavorites?: boolean;
}>();

// 控制工具提示的显示和位置
const tooltip = ref({
  visible: false,
  color: '',
  x: 0,
  y: 0
});

// 控制菜单的显示状态
const menuVisible = ref(false);
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
  if(!(sessionStorage.getItem('token') == '')) {
    fetchUserInfo();
  } else{
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


// 添加调色板到收藏
async function addToFavorites() {
  console.log("call addToFavorites");
  console.log(user.value?.name);
  if(user.value != null) {
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
</script>

<template>
  <div class="palette-container">
    <div class="palette">
      <div
          v-for="color in colors"
          :key="color"
          :style="{ backgroundColor: color }"
          class="color-box"
          @mouseenter="showTooltip(color, $event)"
          @mouseleave="hideTooltip"
      >
        <!-- 显示颜色值的工具提示 -->
        <span v-if="tooltip.visible && tooltip.color === color" class="tooltip" :style="{ top: tooltip.y + 'px', left: tooltip.x + 'px' }">
          {{ color }}
        </span>
      </div>
    </div>

    <!-- 右下方的菜单按钮（三个点） -->
    <div class="menu-button-container">
      <button class="menu-button" @click.stop="toggleMenu">···</button>
      <div v-if="menuVisible" class="dropdown-menu">
        <ul>
          <li @click="copyPalette">Copy Palette</li>
          <li @click="openPalette">View Palette</li>
          <li v-if="!fromFavorites" @click="addToFavorites">Add to Favorites</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.palette-container {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.palette {
  display: flex;
  gap: 0;
  margin: 20px 0;
  border-radius: 8px;
  width: 100%;
  overflow: hidden;
}

.color-box {
  flex: 1;
  height: 100px;
  cursor: pointer;
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

/* 右下方的菜单按钮 */
.menu-button-container {
  position: relative;
  margin-top: 1px; /* 控制菜单按钮与调色板的距离 */
}

.menu-button {
  font-size: 18px;
  background: none;
  border: none;
  cursor: pointer;
  color: #333;
}

/* 下拉菜单样式 */
.dropdown-menu {
  position: absolute;
  top: 25px; /* 菜单显示在按钮下方 */
  right: 0;
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  overflow: hidden;
  z-index: 100;
  width: 150px;
}

.dropdown-menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.dropdown-menu li {
  padding: 8px 12px;
  font-size: 14px;
  cursor: pointer;
  color: #333;
}

.dropdown-menu li:hover {
  background-color: #f0f0f0;
}
</style>
