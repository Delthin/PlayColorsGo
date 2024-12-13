<script setup lang="ts">
import Navbar from '../components/Navbar.vue'
import ColorPalette from '../components/ColorPalette.vue'
import { ref, watch } from "vue";
import {axios} from '../utils/request';

const palettes = ref<Array<{ id: number; colors: string[] }>>([]);
const tags = ref<string[]>([]);

const activePaletteId = ref<number | null>(null);

function toggleMenu(paletteId: number) {
  if (activePaletteId.value === paletteId) {
    activePaletteId.value = null;
  } else {
    activePaletteId.value = paletteId;
  }
}

async function fetchFilteredPalettes() {
  try {
    if (tags.value.length > 0) {
      console.log(tags.value);
      const tagsString = tags.value.map(tag => encodeURIComponent(tag)).join('&tags=');
      const response = await axios.get(`/api/palettes/searchPalettes?tags=${tagsString}`);
      if (response.data.code === '000') {
        palettes.value = response.data.result.map((palette: any) => ({
          id: palette.id,
          colors: palette.colors,
        }));
      } else {
        console.error("Failed to fetch filtered palettes:", response.data.msg);
      }
    } else {
      const response = await axios.get("/api/palettes");
      if (response.data.code === '000') {
        palettes.value = response.data.result.map((palette: any) => ({
          id: palette.id,
          colors: palette.colors,
        }));
      } else {
        console.error("Failed to fetch palettes:", response.data.msg);
      }
    }
  } catch (error) {
    console.error("Error fetching filtered palettes:", error);
  }
}

watch(tags, () => {
  console.log("update palettes!");
  fetchFilteredPalettes();
}, { immediate: true, deep: true });

function updateTags(newTags: string[]) {
  tags.value = newTags;
  console.log("updateTags");
  console.log(tags.value);
}
</script>

<template>
  <Navbar @tags-update="updateTags"/>
  <div class="container">
    <h2>Popular Color Palettes</h2>
    <p>Get inspired by thousands of beautiful color schemes and make something cool!</p>
  </div>

  <div v-if="palettes.length === 0" class="empty-state">
    <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" fill="#b0b0b0" viewBox="0 0 24 24">
      <path d="M10,2a8,8,0,0,1,5.66,13.66l4.71,4.71a1,1,0,0,1-1.41,1.41l-4.71-4.71A8,8,0,1,1,10,2Zm0,2a6,6,0,1,0,6,6A6,6,0,0,0,10,4Z"></path>
    </svg>
    <h3>No palettes found</h3>
    <p>It seems we can't find any results based on your search.</p>
  </div>
  <div v-else class="palette-list">
    <div v-for="palette in palettes" :key="palette.id">
      <ColorPalette
          :paletteId="palette.id"
          :colors="palette.colors"
          :isActive="activePaletteId === palette.id"
          @toggleMenu="toggleMenu(palette.id)"
      />
    </div>
  </div>

</template>
<!--        :paletteId="palette.id"-->

<style scoped>
*,
*::before,
*::after {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

.container {
  text-align: center;
  margin-top: 150px;
}

h2 {
  font-size: 36px;
}

p {
  color: #666;
  font-size: 24px;
}

.palette-list {
  display: grid;
  gap: 30px;
  //grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  grid-template-columns: repeat(4, 1fr);
  width: 100%;
  padding: 0 40px;
}

.empty-state {
  text-align: center;
  margin-top: 100px;
}

.empty-state h3 {
  font-size: 24px;
  margin-top: 20px;
  color: #333;
}

.empty-state p {
  color: #666;
  margin-top: 10px;
  font-size: 16px;
}
</style>
