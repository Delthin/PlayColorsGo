<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { ref, onMounted, watch } from 'vue';
import Navbar from "../components/Navbar.vue";
import ColorPicker from "../components/ColorPicker.vue";

const route = useRoute();
const router = useRouter();
const colors = ref<string[]>([]);

function updateUrlColors(newColors: string[]) {
  router.replace({ query: { colors: newColors.join(',') } });
}

function getColorsFromUrl(): string[] {
  const colorQuery = route.query.colors as string;
  if (colorQuery) {
    return colorQuery.split(',');
  }
  // Default colors if none are provided in the URL
  return ['#FF0000', '#FFFF00', '#0000FF', '#00FF00', '#800080'];
}

onMounted(() => {
  colors.value = getColorsFromUrl();
});

watch(
    () => route.query.colors,
    () => {
      colors.value = getColorsFromUrl();
    }
);

function handleColorChange(newColors: string[]) {
  colors.value = newColors;
  updateUrlColors(newColors);
}
</script>

<template>
  <Navbar />
  <div class="palette-container">
    <h2>Palette Visualizer</h2>
    <p>Preview your colors on real designs for a better visual understanding.</p>
  </div>
  <ColorPicker
      v-model="colors"
      :max-colors="10"
      @change="handleColorChange"
  />
</template>

<style scoped>
.palette-container {
  text-align: center;
  margin-top: 250px;
  margin-bottom: 70px;
}

h2 {
  font-size: 36px;
}

p {
  color: #666;
  font-size: 24px;
}
</style>