<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getUserInfo, addFavorite } from "../api/user"
import { ElMessage } from 'element-plus'

const props = defineProps<{
  show: boolean
  paletteId: number
  colors: string[]
}>()

const emit = defineEmits(['close', 'save'])

const collections = ref<string[]>([])
const selectedCollection = ref('')
const paletteName = ref('')
const user = ref<{ name: string } | null>(null)

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
  if (!selectedCollection.value || !paletteName.value || !user.value?.name) {
    ElMessage.error('请填写所有必填项并确保已登录')
    return
  }
  
  try {
    const response = await addFavorite(
      user.value.name,
      props.paletteId,
      selectedCollection.value,
    )
    
    if (response.data.code === '000') {
      ElMessage.success('添加成功')
      emit('save', {
        success: true,
        message: '添加成功'
      })
      emit('close')
    } else {
      ElMessage.error(response.data.message || '添加失败')
      emit('save', {
        success: false,
        message: response.data.message || '添加失败'
      })
    }
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || '添加失败'
    ElMessage.error(errorMsg)
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
      <h2>Save Palette</h2>
      <div class="form-group">
        <label>Palette Name</label>
        <input 
          v-model="paletteName"
          type="text"
          placeholder="Enter palette name"
          required
        />
      </div>
      <div class="form-group">
        <label>Collection</label>
        <select v-model="selectedCollection" required>
          <option value="">Select a collection</option>
          <option v-for="collection in collections" 
                  :key="collection" 
                  :value="collection">
            {{ collection }}
          </option>
        </select>
      </div>
      <button class="save-btn" @click="handleSave">Save</button>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
}

h2 {
  margin-bottom: 20px;
  text-align: center;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
}

input, select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.save-btn {
  width: 100%;
  padding: 12px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
}

.save-btn:hover {
  background: #0056b3;
}
</style>