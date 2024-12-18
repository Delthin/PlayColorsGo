<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import Navbar from "../components/Navbar.vue";
import PaletteList from "../components/PaletteList.vue";
import { usePalettes } from "../composables/usePalettes";
import { createCollection } from "../api/collections"; // 新增导入
import { getUserInfo } from "../api/user"; // 新增导入
import { ElMessage } from 'element-plus'

const tags = ref<string[]>([]);
const selectedCollection = ref('all');
const {
  collections,
  fetchUserInfoAndCollections,
  fetchAllCollectionsPalettes,
  switchCollection,
} = usePalettes();
const showDialog = ref(false); // 控制弹窗显示
const newCollectionName = ref(''); // 新收藏夹名称
const user = ref<{ name: string }>({ name: "" });


// 创建收藏夹方法
async function handleCreateCollection() {
  if (!newCollectionName.value) {
    ElMessage.error('请输入收藏夹名称');
    return;
  }

  if (!user.value.name) {
    ElMessage.error('用户信息未加载');
    return;
  }

  try {
    await createCollection(newCollectionName.value, user.value.name);
    await fetchUserInfoAndCollections();
    await fetchAllCollectionsPalettes();
    showDialog.value = false;
    newCollectionName.value = '';
    ElMessage.success('收藏夹创建成功');
  } catch (error) {
    console.error('Error creating collection:', error);
    ElMessage.error('创建收藏夹失败');
  }
}

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

watch(selectedCollection, async (newValue) => {
  await switchCollection(newValue);
});

function updateTags(newTags: string[]) {
  tags.value = newTags;
}

onMounted(async () => {
  await fetchCollections();
  await fetchUserInfoAndCollections();
  await fetchAllCollectionsPalettes(); // 初始加载所有收藏夹的调色板
});
</script>

<template>
  <Navbar @tags-update="updateTags" />
  <div class="container">
    <h2>Favourites</h2>
    <p>Have a look at what you like</p>

    <div class="collection-controls">
      <div class="collection-selector">
        <select v-model="selectedCollection">
          <option v-for="collection in collections" :key="collection" :value="collection">
            {{ collection === 'all' ? 'All Collections' : collection }}
          </option>
        </select>
      </div>
      <button class="create-btn" @click="showDialog = true">Create Collection</button>
    </div>
  </div>

  <!-- 创建收藏夹弹窗 -->
  <div class="dialog-overlay" v-if="showDialog" @click="showDialog = false">
    <div class="dialog" @click.stop>
      <h3>Create New Collection</h3>
      <input type="text" v-model="newCollectionName" placeholder="Enter collection name">
      <div class="dialog-buttons">
        <button @click="showDialog = false">Cancel</button>
        <button @click="handleCreateCollection" class="create">Create</button>
      </div>
    </div>
  </div>

  <PaletteList layout="grid" size="large" :tags="tags" mode="favorites" :collection="selectedCollection" />
</template>

<style scoped>
*,
*::before,
*::after {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

.container {
  text-align: center;
  margin-top: 250px;
  margin-bottom: 80px;
}

h2 {
  font-size: 36px;
}

p {
  color: #666;
  font-size: 24px;
}

.collection-selector {
  margin: 20px auto;
  width: 200px;
}

.collection-selector select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  background-color: white;
}

.collection-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin: 20px auto;
  width: fit-content;
}

.create-btn {
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.create-btn:hover {
  background-color: #45a049;
}

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.dialog {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  min-width: 300px;
}

.dialog h3 {
  margin-top: 0;
  margin-bottom: 20px;
}

.dialog input {
  width: 100%;
  padding: 8px;
  margin-bottom: 20px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.dialog-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.dialog-buttons button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.dialog-buttons button.create {
  background-color: #4CAF50;
  color: white;
}

.dialog-buttons button:not(.create) {
  background-color: #f5f5f5;
}
</style>