<script setup lang="ts">
import { useRoute } from 'vue-router';
import { ref, onMounted } from 'vue';
import Navbar from "../components/Navbar.vue";
import ColorPicker from "../components/ColorPicker.vue";

const route = useRoute();
const colors = ref<string[]>([]);

onMounted(() => {
  const colorQuery = route.query.colors as string;
  if (colorQuery) {
    colors.value = colorQuery.split(',');
  } else {
    // 如果没有传入颜色，设置默认颜色
    colors.value = ['#FF0000', '#FFFF00', '#0000FF', '#00FF00', '#800080'];
  }
});


function handleColorChange(newColors: string[]) {
  colors.value = newColors;
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
  margin-top: 150px;
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