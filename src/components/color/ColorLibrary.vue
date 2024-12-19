<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Plus } from 'lucide-vue-next';  // 添加图标
import { useRoute, useRouter } from 'vue-router';   // 添加路由
import PaletteList from './PaletteList.vue';
import SearchBox from '../common/SearchBox.vue';
import { usePalettes } from "../../composables/usePalettes.ts";
import SavePaletteModal from '../collection/SavePaletteModal.vue'
import CollectionSelector from '../collection/CollectionSelector.vue';
import NotificationToast from '../common/NotificationToast.vue';
import { getUserInfo } from '../../api/user.ts';

// 修改 usePalettes 的解构,添加 fetchFilteredFavorites
const {
    fetchUserInfoAndCollections,
    fetchAllCollectionsPalettes,
    fetchFilteredFavorites  // 添加这个方法
} = usePalettes();

const activeTab = ref('library'); // 'library' or 'explore'
const user = ref<{ name: string } | null>(null);
const route = useRoute();
const searchTags = ref<string[]>([]);
const showSaveModal = ref(false)
const selectedPalette = ref<{ id?: number, colors: string[] } | null>(null)
const selectedCollection = ref('all');
const router = useRouter();


// 定义 props 和 emits
const props = defineProps<{
    modelValue: boolean;
}>();

const emit = defineEmits(['update:modelValue', 'select']);
const notification = ref({
    show: false,
    message: '',
    type: 'success' as 'success' | 'error'
});

// 添加通知函数
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

// 组件挂载时加载数据
onMounted(async () => {
    await fetchUserInfo();
    await fetchUserInfoAndCollections();
    await fetchAllCollectionsPalettes();
});

async function fetchUserInfo() {
    try {
        const res = await getUserInfo();
        if (res.data.code === '000') {
            user.value = { name: res.data.result.name };
        }
    } catch (error) {
        showNotification('Failed to get user info', 'error');
    }
}

function handleOverlayClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
        emit('update:modelValue', false);
    }
}

// 修改 handleAddToFavorites 函数
async function handleAddToFavorites() {
    try {
        // 检查用户登录状态
        if (!user.value?.name) {
            showNotification('Please log in to save', 'error');
            return;
        }

        // 从路由或当前状态获取颜色
        let colors: string[] = [];
        const colorQuery = route.query.colors as string;

        if (colorQuery) {
            colors = colorQuery.split(',').map(color => color.trim());
        } else {
            showNotification('No colors to save', 'error');
            return;
        }

        if (colors.length === 0) {
            showNotification('No colors to save', 'error');
            return;
        }

        // 设置选中的调色板
        selectedPalette.value = {
            colors: colors
        };
        // 显示保存模态框
        showSaveModal.value = true;

    } catch (error) {
        showNotification('Failed to add to favorites', 'error');
        console.error(error);
    }
}

function handleExploreSearch(query: string) {
    searchTags.value = query ? [query] : [];
}


// 修改 library 搜索处理函数
async function handleLibrarySearch(query: string) {
    searchTags.value = query ? [query] : [];
    // 调用收藏夹搜索方法
    if (user.value?.name) {
        await fetchFilteredFavorites(searchTags.value);
    }
}

// 修改搜索关闭处理函数
async function handleSearchClose() {
    searchTags.value = [];
    // 重新加载所有收藏
    await fetchAllCollectionsPalettes();
}
async function handleSavePalette(data: { success: boolean, message: string }) {
  showNotification(data.message, data.success ? 'success' : 'error');
  showSaveModal.value = false;
}

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
                        <button class="add-button" @click="handleAddToFavorites" :disabled="!user?.name"
                            :title="!user?.name ? '请先登录' : '添加到收藏'">
                            <Plus size="20" />
                        </button>
                    </div>
                </div>

                <div class="divider"></div>

                <!-- 根据activeTab显示不同内容 -->
                <template v-if="activeTab === 'library'">
                    <div class="toolbar">
                        <SearchBox placeholder="Search saved palettes..." @search="handleLibrarySearch"
                            @close="handleSearchClose" />
                    </div>
                    <div class="divider"></div>

                    <div class="toolbar">
                        <CollectionSelector v-model:selectedCollection="selectedCollection" />
                    </div>
                    <div class="divider"></div>

                    <!-- 调色板列表 -->
                    <div class="content-wrapper">
                        <PaletteList layout="list" size="small" :tags="searchTags" mode="favorites"
                            :collection="selectedCollection" />
                    </div>
                </template>

                <template v-else>
                    <!-- Explore内容 -->
                    <div class="toolbar">
                        <SearchBox placeholder="Search palettes..." @search="handleExploreSearch"
                            @close="handleSearchClose" />
                    </div>
                    <div class="divider"></div>
                    <div class="explore-content">
                        <PaletteList layout="list" size="small" :tags="searchTags" />
                    </div>
                </template>
            </div>
        </div>
    </div>
    <SavePaletteModal v-if="showSaveModal" :show="showSaveModal" :colors="selectedPalette.colors"
        @close="showSaveModal = false" @save="handleSavePalette" />
    <NotificationToast :show="notification.show" :message="notification.message" :type="notification.type" />
</template>

<style scoped>
.library-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.1);
    z-index: 9999;
}

.library-modal {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: 400px;
    background: white;
    box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
    z-index: 1003;
}

.content-wrapper {
    flex: 1;
    overflow-y: auto;
    padding: 10px;
}

.library-content {
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    /* 防止内容溢出 */
}

.header {
    padding: 10px;
    text-align: center;
}

.header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
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
    transition: all 0.2s ease;
}

.add-button:hover {
    background: #f0f0f0;
    color: #333;
}

.add-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.add-button:not(:disabled):hover {
    background: #f0f0f0;
    color: #333;
}

.tabs {
    display: inline-flex;
    gap: 0px;
    padding: 4px;
    border-radius: 8px;
    height: 40px;
}

.tabs button {
    background: none;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 18px;
    font-family: 'Poppins', sans-serif;
    cursor: pointer;
    color: grey;
}

.tabs button.active {
    color: #333;
    font-weight: 600;
}

.divider {
    height: 1px;
    background: #eee;
    margin: 0;
}

.toolbar {
    padding: 15px 10px;
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

.explore-content {
    flex: 1;
    overflow-y: auto;
}
</style>