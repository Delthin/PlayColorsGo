<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import Navbar from "../components/Navbar.vue";
import PaletteList from "../components/PaletteList.vue";
import { usePalettes } from "../composables/usePalettes";
import { getUserInfo } from "../api/user"; // 新增导入

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
  <div class="container">
    <h2>Favourites</h2>
    <p>Have a look at what you like</p>

    <CollectionSelector v-model:selectedCollection="selectedCollection" />
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

</style>