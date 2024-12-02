<script setup lang="ts">
import Navbar from '../components/Navbar.vue'
import ColorPalette from '../components/ColorPalette.vue'
import { ref, watch } from "vue";
import {axios} from '../utils/request';

const palettes = ref<Array<{ id: number; colors: string[] }>>([]);
const tags = ref<string[]>([]);

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
    <!--
    <ColorPalette :colors="['#264653', '#2a9d8f', '#e9c46a', '#f4a261', '#e76f51']" />
    <ColorPalette :colors="['#e63946', '#f1faee', '#a8dadc', '#457b9d', '#1d3557']" />
    <ColorPalette :colors="['#606c38', '#283618', '#fefae0', '#dda15e', '#bc6c25']" />
    <ColorPalette :colors="['#003049', '#d62828', '#f77f00', '#fcbf49', '#eae2b7']" />
    <ColorPalette :colors="['#a8dadc', '#457b9d', '#1d3557', '#e63946', '#f1faee']" />
    <ColorPalette :colors="['#bc6c25', '#dda15e', '#fefae0', '#283618', '#606c38']" />
    <ColorPalette :colors="['#2d3142', '#bfc0c0', '#ffffff', '#ef8354', '#4f5d75']" />
    <ColorPalette :colors="['#f4f1de', '#e07a5f', '#3d405b', '#81b29a', '#f2cc8f']" />
    <ColorPalette :colors="['#ffbe0b', '#fb5607', '#ff006e', '#8338ec', '#3a86ff']" />
    <ColorPalette :colors="['#ffafcc', '#ffc8dd', '#bde0fe', '#a2d2ff', '#cdb4db']" />
    <ColorPalette :colors="['#14213d', '#fca311', '#e5e5e5', '#ffffff', '#000000']" />
    <ColorPalette :colors="['#f72585', '#b5179e', '#7209b7', '#3a0ca3', '#4361ee']" />
    <ColorPalette :colors="['#06d6a0', '#1b9aaa', '#ef476f', '#ffc43d', '#fffbfe']" />
    <ColorPalette :colors="['#ffcad4', '#b0d0d3', '#c08497', '#f7af9d', '#f7e3af']" />
    <ColorPalette :colors="['#22223b', '#4a4e69', '#9a8c98', '#c9ada7', '#f2e9e4']" />
    <ColorPalette :colors="['#8ecae6', '#219ebc', '#023047', '#ffb703', '#fb8500']" />
    <ColorPalette :colors="['#e63946', '#f1faee', '#a8dadc', '#457b9d', '#1d3557']" />
    <ColorPalette :colors="['#ef476f', '#ffd166', '#06d6a0', '#118ab2', '#073b4c']" />
    <ColorPalette :colors="['#006d77', '#83c5be', '#edf6f9', '#ffddd2', '#e29578']" />
    <ColorPalette :colors="['#ff9f1c', '#ffbf69', '#ffffff', '#cbf3f0', '#2ec4b6']" />
    -->
    <ColorPalette
        v-for="palette in palettes"
        :key="palette.id"
        :colors="palette.colors"
        :paletteId="palette.id"
    />
  </div>

</template>

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
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
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
