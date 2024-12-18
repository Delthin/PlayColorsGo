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
  if (!selectedCollection.value || !paletteName.value) {
    ElMessage.error('请填写所有必填项')
    return
  }
  
  try {
    const response = await addFavorite(
      user.value?.name || '', 
      props.paletteId,
      selectedCollection.value
    )
    
    if (response.data.code === '000') {
      emit('save', {
        success: true,
        message: '添加成功'
      })
    } else {
      emit('save', {
        success: false,
        message: '添加失败'
      })
    }
  } catch (error) {
    emit('save', {
      success: false,
      message: '添加失败'
    })
  }
}

onMounted(() => {
  fetchCollections()
})
</script>