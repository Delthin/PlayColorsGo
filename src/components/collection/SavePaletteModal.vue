<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getUserInfo, addFavorite } from "../../api/user"
import NotificationToast from '../common/NotificationToast.vue'

const props = defineProps<{
  show: boolean
  // paletteId: number
  colors: string[]
}>()

const emit = defineEmits(['close', 'save'])

const collections = ref<string[]>([])
const selectedCollection = ref('')
const paletteName = ref('')
const user = ref<{ name: string } | null>(null)
const notification = ref({
  show: false,
  message: '',
  type: 'success' as 'success' | 'error'
});

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

// 获取用户收藏夹列表
async function fetchCollections() {
  try {
    const res = await getUserInfo()
    if (res.data.code === '000') {
      user.value = { name: res.data.result.name }
      collections.value = res.data.result.paletteCollections.map((c: any) => c.name)
    }
  } catch (error) {
    console.error('Error fetching collections:', error)
  }
}

// 保存调色板
async function handleSave() {
  if (!user.value?.name) {
    showNotification('Please log in to save', 'error');
    return
  }
  if (!selectedCollection.value || !paletteName.value) {
    showNotification('Please fill in all fields', 'error');
    return
  }
  
  try {
    const response = await addFavorite(
      user.value.name,
      props.colors,
      paletteName.value,
      selectedCollection.value,
    )
    
    if (response.data.code === '000') {
      emit('save', {
        success: true,
        message: 'Saved successfully'
      })
      emit('close')
      showNotification('Saved successfully', 'success');
    } else {
      const errorMsg = response.data.message || 'Failed to save'
      showNotification(errorMsg, 'error')
      emit('save', {
        success: false,
        message: errorMsg
      })
    }
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || 'Failed to save'
    showNotification(errorMsg, 'error')
    emit('save', {
      success: false,
      message: errorMsg
    })
  }
}

onMounted(() => {
  fetchCollections()
})
</script>

<template>
  <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <button class="close-btn" @click="$emit('close')">✕</button>
      <div class="modal-header">
        <h2 class="modal-title">Save Palette</h2>
      </div>
      <div class="form-group">
        <label class="form-label">Palette Name</label>
        <input 
          v-model="paletteName"
          class="form-input"
          type="text"
          placeholder="Enter palette name"
          required
        />
      </div>
      <div class="form-group">
        <label class="form-label">Collection</label>
        <select v-model="selectedCollection" class="form-select" required>
          <option value="">Select a collection</option>
          <option v-for="collection in collections" 
                  :key="collection" 
                  :value="collection">
            {{ collection }}
          </option>
        </select>
      </div>
      <button class="btn btn-primary" @click="handleSave">Save</button>
    </div>
    <NotificationToast 
      :show="notification.show"
      :message="notification.message"
      :type="notification.type"
    />
  </div>
</template>

<style scoped>
@import '../../styles/modal.css';
</style>