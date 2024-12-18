<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import Navbar from "../components/layout/Navbar.vue";
import PaletteList from "../components/color/PaletteList.vue";
import { usePalettes } from "../composables/usePalettes";
import { getUserInfo } from "../api/user"; 
import PageHeader from "../components/layout/PageHeader.vue";

const tags = ref<string[]>([]);
const selectedCollection = ref('all');
const {
  collections,
  fetchUserInfoAndCollections,
  fetchAllCollectionsPalettes,
  switchCollection,
} = usePalettes();
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
  <PageHeader 
    title="Favourites"
    subtitle="Have a look at what you like"
  />
  <div class="divider">
    <div class="line"></div>
    <div class="selector-container">
      <CollectionSelector v-model:selectedCollection="selectedCollection" />
    </div>
    <div class="line"></div>
  </div>
  
  <PaletteList layout="grid" size="large" :tags="tags" mode="favorites" :collection="selectedCollection" />
</template>

<style scoped>
.divider {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 2000px;
  position: relative;
}

.line {
  flex: 1;
  height: 1px;
  background-color: #e0e0e0;
  opacity: 0.6;
}

.selector-container {
  padding: 0 20px;
  min-width: 280px;
  position: relative;
  z-index: 1;
}

/* 添加hover效果 */
.selector-container:hover + .line,
.line:has(+ .selector-container:hover) {
  background-color: #d0d0d0;
  transition: background-color 0.3s ease;
}
</style>