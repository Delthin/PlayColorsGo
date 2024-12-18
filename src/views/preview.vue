<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { ref, onMounted, watch } from 'vue';
import Navbar from "../components/layout/Navbar.vue";
import ColorPicker from "../components/color/ColorPicker.vue";
import { usePalettes } from "../composables/usePalettes";
import PageHeader from "../components/layout/PageHeader.vue";


const route = useRoute();
const router = useRouter();
const colors = ref<string[]>([]);
const { palettes, fetchPalettes } = usePalettes();


function updateUrlColors(newColors: string[]) {
  router.replace({ query: { colors: newColors.join(',') } });
}

function getRandomPalette(): string[] {
  if (palettes.value.length === 0) {
    // 如果还没有加载调色板,返回默认颜色
    return ['#FF0000', '#FFFF00', '#0000FF', '#00FF00', '#800080'];
  }
  // 随机选择一个调色板
  const randomIndex = Math.floor(Math.random() * palettes.value.length);
  return palettes.value[randomIndex].colors;
}

async function getColorsFromUrl(): Promise<string[]> {
  const colorQuery = route.query.colors as string;
  if (colorQuery) {
    return colorQuery.split(',');
  }

  // 如果URL中没有颜色,从API获取调色板
  await fetchPalettes();
  return getRandomPalette();
}

onMounted(async () => {
  colors.value = await getColorsFromUrl();
});

watch(
  () => route.query.colors,
  async () => {
    colors.value = await getColorsFromUrl();
  }
);

function handleColorChange(newColors: string[]) {
  colors.value = newColors;
  updateUrlColors(newColors);
}
</script>

<template>
  <Navbar />
  <PageHeader 
    title="Palette Visualizer"
    subtitle="Preview your colors on real designs for a better visual understanding."
  />
  <ColorPicker v-model="colors" :max-colors="10" @change="handleColorChange" />
</template>
