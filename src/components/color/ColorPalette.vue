<script setup lang="ts">
import { defineProps, onMounted, ref } from 'vue';
import { router } from "../../router/index.ts";
import { getUserInfo, deleteFavorite } from "../../api/user.ts";
import NotificationToast from '../common/NotificationToast.vue'
import DeleteConfirmModal from '../common/DeleteConfirmModal.vue'

const props = defineProps<{
  paletteId: number
  colors: string[]
  isActive: boolean
  size?: 'small' | 'medium' | 'large'
  fromFavorites?: boolean
  name?: string
  collection?: string // 添加 collection prop
}>()

const notification = ref({
  show: false,
  message: '',
  type: 'success' as 'success' | 'error'
});

// 控制菜单的显示状态
const hoveredColor = ref('');
const copiedColor = ref('');
const user = ref<{ name: string } | null>(null);
const showSaveModal = ref(false)
const showDeleteConfirm = ref(false);

async function fetchUserInfo() {
  getUserInfo().then((res) => {
    if (res.data.code === '000') {
      // console.log("fetchUserInfo!")
      user.value = { name: res.data.result.name };
      // console.log(user.value.name);
    }
  })
}

onMounted(() => {
  if (sessionStorage.getItem('token') != '') {
    fetchUserInfo();
  } else {
    user.value = null;
  }
});

// 通用通知函数
function showNotification(message: string, type: 'success' | 'error' = 'success') {
  notification.value = {
    show: true,
    message,
    type
  };
  setTimeout(() => {
    notification.value.show = false;
  }, 2000);
}

// 复制调色板到剪切板
function copyPalette() {
  const palette = props.colors.join(', ');
  navigator.clipboard.writeText(palette).then(() => {
    showNotification('Palette copied to clipboard!');
  });
}


function openPalette() {
  const palette = props.colors.join(','); // Join colors into a single string for easy passing
  console.log("on openPalette");
  router.push({
    path: '/preview',
    query: {
      colors: palette
    }
  });
}

// 添加调色板到收藏
async function addToFavorites() {
  if (!user.value) {
    showNotification('Please log in first!', 'error')
    return;
  }
  showSaveModal.value = true;
}

async function handleSavePalette(data: { success: boolean, message: string }) {
  showNotification(data.message, data.success ? 'success' : 'error');
  showSaveModal.value = false;
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
  showNotification('Color copied to clipboard!');
  setTimeout(() => {
    copiedColor.value = '';
  }, 2000);
}
// 删除调色板
async function handleDelete() {
  if (!user.value || !props.name) return;
  
  if (!props.collection) {
    showNotification('Cannot delete: collection not specified', 'error');
    return;
  }

  try {
    const response = await deleteFavorite(
      user.value.name,
      props.name,
      props.collection
    );

    if (response.data.code === '000') {
      // 立即关闭确认对话框
      showDeleteConfirm.value = false;
      // 显示成功通知
      showNotification('Palette successfully deleted', 'success');
      // 延迟触发删除事件
      setTimeout(() => {
        emit('delete');
      }, 1000);
    } else {
      showNotification('Failed to delete palette', 'error');
      showDeleteConfirm.value = false;
    }
  } catch (error) {
    showNotification('Error deleting palette', 'error');
    showDeleteConfirm.value = false;
  }
}

const emit = defineEmits(['delete']);

</script>

<template>
  <div class="palette-container">
    <div class="palette" :class="[size || 'large']">
      <div v-for="color in colors" :key="color" :style="{
        backgroundColor: color,
        flex: hoveredColor === color ? '2' : '1'
      }" class="color-box" @mouseenter="hoveredColor = color" @mouseleave="hoveredColor = ''"
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
    <div class="action-container">
      <div v-if="fromFavorites && name" class="palette-name">
        {{ name }}
      </div>
      <div class="action-buttons">
        <button v-if="!fromFavorites" class="action-button" @click="addToFavorites">
          <i class="fas fa-heart"></i>
          <span class="tooltip">Add to Favorites</span>
        </button>
        <button v-if="fromFavorites" class="action-button delete-button" @click="showDeleteConfirm = true">
          <i class="fas fa-trash"></i>
          <span class="tooltip">Delete from Favorites</span>
        </button>
        <button class="action-button" @click="copyPalette">
          <i class="fas fa-copy"></i>
          <span class="tooltip">Copy Palette</span>
        </button>
        <button class="action-button" @click="openPalette">
          <i class="fas fa-eye"></i>
          <span class="tooltip">View Palette</span>
        </button>
      </div>
    </div>
  </div>
  <NotificationToast :show="notification.show" :message="notification.message" :type="notification.type" />
  <SavePaletteModal v-if="showSaveModal" :show="showSaveModal" :colors="colors" @close="showSaveModal = false"
    @save="handleSavePalette" />
  <DeleteConfirmModal v-if="showDeleteConfirm" :show="showDeleteConfirm" title="Delete Palette"
    message="Are you sure you want to delete this palette?" @confirm="handleDelete"
    @cancel="showDeleteConfirm = false" />
</template>

<style scoped>
.palette-container {
  display: flex;
  flex-direction: column;
  position: relative;
  padding-bottom: 40px;
  /* 为菜单按钮留出空间 */
}

.palette-name {
  font-size: 16px;
  color: #2c3e50;
  font-family: 'Arial', sans-serif;
  font-weight: 600;
  padding: 0px 12px;
  margin-left: 4px;
  line-height: 20px;
  height: 36px;
  display: flex;
  align-items: center;
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

.notification {
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

.notification.success i {
  color: #4CAF50;
}

.notification.error i {
  color: #f44336;
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

.action-container {
  position: absolute;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 4px;
  gap: 8px;
  z-index: 5;
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
  border: none;
  border-radius: 50%;
  cursor: pointer;
  color: #2c3e50;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  padding: 0;
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

.delete-button:hover {
  color: #dc3545;
}

.delete-confirm-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 24px;
  border-radius: 8px;
  min-width: 300px;
}

.modal-content h3 {
  margin: 0 0 16px 0;
  color: #2c3e50;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.modal-buttons button {
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
}

.modal-buttons button:not(.delete) {
  background: #e0e0e0;
}

.modal-buttons .delete {
  background: #dc3545;
  color: white;
}

.modal-buttons .delete:hover {
  background: #c82333;
}
</style>
