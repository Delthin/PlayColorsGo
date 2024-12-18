<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { createCollection } from "../api/collections";
import { usePalettes } from "../composables/usePalettes";
import { getUserInfo } from "../api/user"; // 新增导入

const {
    collections,
    fetchUserInfoAndCollections,
    fetchAllCollectionsPalettes,
} = usePalettes();

const props = defineProps<{
    selectedCollection: string;
}>();

const emit = defineEmits(['update:selectedCollection']);
const showDialog = ref(false);
const newCollectionName = ref('');
const user = ref<{ name: string }>({ name: "" });

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

async function handleCreateCollection() {
    if (!newCollectionName.value) {
        ElMessage.error('Please enter a collection name');
        return;
    }

    if (!user.value.name) {
        ElMessage.error('Please log in to create a collection');
        return;
    }

    try {
        await createCollection(newCollectionName.value, user.value.name);
        await fetchUserInfoAndCollections();
        await fetchAllCollectionsPalettes();
        showDialog.value = false;
        newCollectionName.value = '';
        ElMessage.success('Collection created successfully');
    } catch (error) {
        console.error('Error creating collection:', error);
        ElMessage.error('Failed to create collection');
    }
}


// 添加初始化加载
onMounted(async () => {
    await fetchCollections();
    await fetchUserInfoAndCollections();
    await fetchAllCollectionsPalettes();
});

</script>

<template>
    <div class="collection-controls">
        <div class="collection-selector">
            <select :value="selectedCollection"
                @input="$emit('update:selectedCollection', ($event.target as HTMLSelectElement).value)">
                <option value="" disabled selected>Select a Collection</option>
                <!-- <option value="all">All Collections</option> -->
                <option v-for="collection in collections" :key="collection" :value="collection">
                    {{ collection }}
                </option>
            </select>
        </div>
        <button class="create-btn" @click="showDialog = true">
            Create Collection
            <span class="tooltip">Create a new collection</span>
        </button>
    </div>

    <!-- 创建收藏夹弹窗 -->
    <div class="modal-overlay" v-if="showDialog" @click="showDialog = false">
        <div class="modal-content" @click.stop>
            <button class="close-btn" @click="showDialog = false">✕</button>
            <div class="modal-header">
                <h3 class="modal-title">Create New Collection</h3>
            </div>
            <div class="form-group">
                <label class="form-label">Collection Name</label>
                <input type="text" v-model="newCollectionName" class="form-input" placeholder="Enter collection name">
            </div>
            <button @click="handleCreateCollection" class="btn btn-primary">
                Create Collection
            </button>
        </div>
    </div>
</template>

<style scoped>
@import '../styles/modal.css';

.collection-controls {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
    margin: 20px auto;
    width: fit-content;
    font-family: 'Arial', sans-serif;
    height: 0px;
}

.collection-selector {
    width: 180px;
    position: relative;
}

.collection-selector select {
    width: 100%;
    padding: 8px 12px;
    /* 减小内边距 */
    height: 40px;
    /* 固定高度 */
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    font-size: 14px;
    background-color: #f8f9fa;
    color: #2c3e50;
    transition: all 0.3s ease;
    cursor: pointer;
    font-family: 'Arial', sans-serif;
    font-weight: 600;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23666' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
    background-size: 12px;
    line-height: 20px;
    /* 添加行高控制 */
}

.collection-selector select:hover {
    border-color: #3498db;
    background-color: #ffffff;
    box-shadow: 0 2px 8px rgba(52, 152, 219, 0.15);
}

.collection-selector select:focus {
    border-color: #3498db;
    background-color: #ffffff;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
}

.collection-selector select option {
    background-color: #ffffff;
    color: #2c3e50;
    padding: 12px;
}

.collection-selector select option:hover {
    background-color: #ebf5fb;
}

.collection-selector select option:checked {
    background-color: #3498db;
    color: white;
}


@keyframes focusAnimation {
    0% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.02);
    }

    100% {
        transform: scale(1);
    }
}

.create-btn {
    padding: 12px 20px;
    min-width: 140px;
    background-color: #3498db;
    /* 明亮的蓝色 */
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    letter-spacing: 0.5px;
}

.create-btn:hover {
    background-color: #2980b9;
    /* 深蓝色 */
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(52, 152, 219, 0.25);
}


/* 添加禁用选项的样式 */
.collection-selector select option[disabled] {
    color: #999;
    font-style: italic;
}

.tooltip {
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

.create-btn:hover .tooltip {
    opacity: 1;
    visibility: visible;
}

.tooltip::after {
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