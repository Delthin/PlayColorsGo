<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import ColorPalette from './ColorPalette.vue';
import { axios } from '../utils/request';
import { userInfo } from '../api/user';
import { Plus } from 'lucide-vue-next';  // 添加图标
import { useRoute } from 'vue-router';   // 添加路由


const showLibrary = ref(false);
const activeTab = ref('library'); // 'library' or 'explore'
const searchQuery = ref('');
const filterType = ref('all');
const palettes = ref<Array<{ id: number; name: string; colors: string[] }>>([]);
const user = ref<{ name: string } | null>(null);
const route = useRoute();

// 定义 props 和 emits
const props = defineProps<{
    modelValue: boolean;
}>();

const emit = defineEmits(['update:modelValue', 'select']);

// 获取用户信息
async function fetchUserInfo() {
    try {
        const res = await userInfo();
        if (res.data.code === '000') {
            user.value = { name: res.data.result.name };
        }
    } catch (error) {
        console.error('Error fetching user info:', error);
        user.value = null;
    }
}

// 获取用户的调色板
async function fetchUserPalettes() {
    try {
        if (!user.value?.name) return;

        const response = await axios.get('/api/users/getFavorites', {
            params: { name: user.value.name }
        });

        if (response.data.code === '000') {
            palettes.value = response.data.result;
        }
    } catch (error) {
        console.error('Error fetching palettes:', error);
    }
}

// 选择调色板
function selectPalette(colors: string[]) {
    emit('select', colors);
    emit('update:modelValue', false);
}

// 关闭弹窗
function closeLibrary() {
    emit('update:modelValue', false);
}

// 组件挂载时加载数据
onMounted(() => {
    fetchUserInfo();
    fetchUserPalettes();
});

function handleOverlayClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
        emit('update:modelValue', false);
    }
}

function handleAddToFavorites() {
    // 从路由中获取颜色信息
    const colorQuery = route.query.colors as string;
    if (colorQuery) {
        const colors = colorQuery.split(',');
        console.log('Colors to be added to favorites:', colors);
        // TODO: 在这里调用添加收藏接口
        // await axios.post('/api/users/addFavorite', {
        //     name: user.value?.name,
        //     colors: colors
        // });
    }
}

// 监听搜索和筛选条件变化
watch([searchQuery, filterType], () => {
    fetchUserPalettes();
});
</script>

<template>
    <div v-if="props.modelValue" class="library-overlay" @click="handleOverlayClick">
        <div class="library-modal" @click.stop>
            <div class="library-content">
                <!-- 标题居中 -->
                <div class="header">
                    <div class="header-content">
                        <div class="tabs">
                            <button :class="{ active: activeTab === 'library' }" @click="activeTab = 'library'">
                                Library
                            </button>
                            <button :class="{ active: activeTab === 'explore' }" @click="activeTab = 'explore'">
                                Explore
                            </button>
                        </div>
                        <button class="add-button" @click="handleAddToFavorites">
                            <Plus size="20" />
                        </button>
                    </div>
                </div>

                <div class="divider"></div>

                <!-- 工具栏 -->
                <div class="toolbar">
                    <select v-model="filterType">
                        <option value="all">All palettes</option>
                        <option value="recent">Recent</option>
                        <option value="favorite">Favorites</option>
                    </select>

                    <SearchBox placeholder="Search palettes..." @search="handleSearch" @close="handleSearchClose" />
                </div>

                <div class="divider"></div>

                <!-- 调色板列表 -->
                <div class="palettes-grid">
                    <div v-for="palette in palettes" :key="palette.id" class="palette-item"
                        @click="selectPalette(palette.colors)">
                        <ColorPalette :paletteId="palette.id" :colors="palette.colors" :isActive="false"
                            :fromFavorites="true" />
                        <div class="palette-name">{{ palette.name || `Palette ${palette.id}` }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.library-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    /* background: rgba(0, 0, 0, 0.3); */
    z-index: 999;
}

.library-modal {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: 400px;
    background: white;
    box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
    z-index: 1000;
}

.library-content {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.header {
    padding: 20px;
    text-align: center;
}

.header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 0 10px;
}

.add-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
    border-radius: 4px;
    color: #666;
    display: flex;
    align-items: center;
    justify-content: center;
}

.add-button:hover {
    background: #f0f0f0;
    color: #333;
}

.tabs {
    display: inline-flex;
    gap: 20px;
    background: #f5f5f5;
    padding: 4px;
    border-radius: 8px;
}

.tabs button {
    background: none;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    color: #666;
}

.tabs button.active {
    background: white;
    color: #333;
    font-weight: 500;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.divider {
    height: 1px;
    background: #eee;
    margin: 0;
}

.toolbar {
    padding: 15px 20px;
    display: flex;
    align-items: center;
    gap: 12px;
}

select {
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    color: #333;
    background: white;
}

.palettes-grid {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
}

.palette-item {
    margin-bottom: 20px;
    border-radius: 8px;
    border: 1px solid #eee;
    padding: 12px;
}

.palette-name {
    margin-top: 8px;
    font-size: 14px;
    color: #666;
}
</style>