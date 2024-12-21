<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import {ref, onMounted, watch, computed} from 'vue';
import Navbar from "../components/layout/Navbar.vue";
import ColorPicker from "../components/color/ColorPicker.vue";
import { usePalettes } from "../composables/usePalettes";
import PageHeader from "../components/layout/PageHeader.vue";
import Template from "../components/visualizer/Illustration.vue";
import Illustration from "../components/visualizer/Illustration.vue";


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
  const randomColors = getRandomPalette();
  // 立即更新URL
  updateUrlColors(randomColors);
  return randomColors;
}

onMounted(async () => {
  const initialColors = await getColorsFromUrl();
  colors.value = initialColors;

  const previewColorsElement = document.querySelector('.preview-colors');
  if (previewColorsElement) {
    const initialStyles = initialColors.map((color, index) => {
      return `--c${index + 1}: ${color};`;
    }).join('\n');
    previewColorsElement.setAttribute('style', initialStyles);
  }
});

watch(
  () => route.query.colors,
  async (newColorQuery) => {
    if (newColorQuery) {
      // 直接从查询参数更新颜色
      colors.value = (newColorQuery as string).split(',');
    } else {
      // 如果没有查询参数，获取随机颜色
      const randomColors = await getColorsFromUrl();
      colors.value = randomColors;
    }
  },
  { immediate: true } // 添加 immediate: true 以确保首次加载时也能正确处理
);

function handleColorChange(newColors: string[]) {
  colors.value = newColors;
  updateUrlColors(newColors);
}

const dynamicColors = computed(() => {
  return colors.value.map((color, index) => {
    return `--c${index + 1}: ${color};`;
  }).join('\n');
})

watch(dynamicColors, (newStyles) => {
  const previewColorsElement = document.querySelector('.preview-colors');
  if (previewColorsElement) {
    previewColorsElement.setAttribute('style', newStyles);
  }
}, { immediate: true });

</script>

<template>
  <Navbar />
  <PageHeader 
    title="Palette Visualizer"
    subtitle="Preview your colors on real designs for a better visual understanding."
  />
  <div class="preview-colors">
    <div class="illustrations-wrapper">
      <Illustration :colors="colors" class="illustration" />
      <Illustration :colors="colors" class="illustration" />
      <Illustration :colors="colors" class="illustration" />
      <Illustration :colors="colors" class="illustration" />
    </div>
  </div>
  <ColorPicker v-model="colors" :max-colors="10" @change="handleColorChange" />
</template>

<style scoped>
.illustrations-wrapper {
  scale: 90%;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
  grid-gap: 20px 20px;
  justify-items: center;
  justify-content: center;
  margin-bottom: 200px;
}

.illustration {
  display: flex;
  justify-content: center;
  align-items: center;
  align-self: center;
  margin-bottom: 20px;
}

</style>
