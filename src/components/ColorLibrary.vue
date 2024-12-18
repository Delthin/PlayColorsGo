<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import ColorPalette from './ColorPalette.vue';
import { axios } from '../utils/request';
import { getUserInfo } from '../api/user';
import { Plus } from 'lucide-vue-next';  // 添加图标
import { useRoute } from 'vue-router';   // 添加路由
import PaletteList from './PaletteList.vue';
import SearchBox from './SearchBox.vue';
import {usePalettes} from "../composables/usePalettes.ts";
import SavePaletteModal from './SavePaletteModal.vue'


const showLibrary = ref(false);
const activeTab = ref('library'); // 'library' or 'explore'
const searchQuery = ref('');
const filterType = ref('all');
const palettes = ref<Array<{ id: number; name: string; colors: string[] }>>([]);
const user = ref<{ name: string } | null>(null);
const route = useRoute();
const searchTags = ref<string[]>([]);

const showSaveModal = ref(false)
const selectedPalette = ref<{id: number, colors: string[]} | null>(null)



// 定义 props 和 emits
const props = defineProps<{
    modelValue: boolean;
}>();

const emit = defineEmits(['update:modelValue', 'select']);

// 获取用户信息
async function fetchUserInfo() {
    try {
        const res = await getUserInfo();
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

const {fetchUserInfoAndFavorites, favorites} = usePalettes()

// 组件挂载时加载数据
onMounted(async () => {
    // async fetchUserInfo();
    // async fetchUserPalettes();
  await fetchUserInfoAndFavorites()
});

function handleOverlayClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
        emit('update:modelValue', false);
    }
}

function handleAddToFavorites() {
    const colorQuery = route.query.colors as string;
    if (colorQuery) {
        const colors = colorQuery.split(',');
        // 设置要保存的调色板信息
        selectedPalette.value = {
            id: Date.now(), // 临时ID，实际应该从后端获取
            colors: colors
        };
        showSaveModal.value = true;
    }
}

function handleSavePalette(data: { success: boolean, message: string }) {
    if (data.success) {
        ElMessage.success('成功添加到收藏夹!');
        fetchUserInfoAndFavorites(); // 刷新收藏列表
    } else {
        ElMessage.error(data.message);
    }
    showSaveModal.value = false;
}

function handleExploreSearch(query: string) {
    searchTags.value = query ? [query] : [];
}

function handleSearchClose() {
    searchTags.value = [];
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
                        <button class="add-button" @click="handleAddToFavorites">
                            <Plus size="20" />
                        </button>
                    </div>
                </div>

                <div class="divider"></div>

                <!-- 根据activeTab显示不同内容 -->
                <template v-if="activeTab === 'library'">
                    <!-- 原有的library内容 -->
                    <div class="toolbar">
                    </div>

                    <div class="divider"></div>

                    <!-- 调色板列表 -->
                    <div class="palettes-grid">
                        <div v-for="palette in favorites" :key="palette.id" class="palette-item"
                            @click="selectPalette(palette.colors)">
                            <ColorPalette :paletteId="palette.id" :colors="palette.colors" :isActive="false"
                                :fromFavorites="true" :size="'small'"/>
                            <div class="palette-name">{{ palette.name || `Palette ${palette.id}` }}</div>
                        </div>
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
    <SavePaletteModal
        v-if="showSaveModal && selectedPalette"
        :show="showSaveModal"
        :palette-id="selectedPalette.id"
        :colors="selectedPalette.colors"
        @close="showSaveModal = false"
        @save="handleSavePalette"
    />
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
}

.add-button:hover {
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
    cursor: pointer;
    color: grey;
}

.tabs button.active {
    color: #333;
    font-weight: 500;
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

.explore-content {
  flex: 1;
  overflow-y: auto;
}

.library-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>