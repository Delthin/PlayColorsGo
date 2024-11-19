<script setup lang="ts">
import { useRoute } from 'vue-router';
import { ref, onMounted } from 'vue';
import Navbar from "../components/Navbar.vue";
import ColorPicker from "../components/ColorPicker.vue";  // 确保路径正确

const route = useRoute();
const colors = ref<string[]>(['#FF0000', '#FFFF00', '#0000FF', '#00FF00', '#800080']);

onMounted(() => {
  const colorQuery = route.query.colors as string;
  if (colorQuery) {
    colors.value = colorQuery.split(',');
  }
});
</script>

<template>
  <Navbar />
  <div class="palette-container">
    <h2>Palette Visualizer</h2>
    <p>Preview your colors on real designs for a better visual understanding.</p>
  </div>

  <ColorPicker
      v-model="colors"
      :max-colors="5"
  />
</template>

<style scoped>
.palette-container {
  text-align: center;
  margin-top: 150px;
  /* 为底部颜色栏留出空间 */
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