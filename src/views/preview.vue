<script setup lang="ts">
import { useRoute } from 'vue-router';
import { ref, computed, onMounted } from 'vue';
import Navbar from "../components/Navbar.vue";

const route = useRoute();
const colors = ref<string[]>([]); // Array of color values
const maxColors = ref(5); // Start with 5 colors displayed

onMounted(() => {
  const colorQuery = route.query.colors as string;
  colors.value = colorQuery
      ? colorQuery.split(',')
      : ['#FF0000', '#FFFF00', '#0000FF', '#00FF00', '#800080'];
});

// Display only up to maxColors colors
const displayedColors = computed(() => colors.value.slice(0, maxColors.value));

// Add new color slot
function increaseSize() {
  if (maxColors.value < colors.value.length) {
    maxColors.value += 1;
  }
}

// Remove last color slot
function decreaseSize() {
  if (maxColors.value > 1) {
    maxColors.value -= 1;
  }
}

// Update a color when modified
function updateColor(newColor: string, index: number) {
  colors.value[index] = newColor;
}

// Trigger color picker programmatically
function openColorPicker(index: number) {
  const colorPickerElement = document.querySelectorAll('.el-color-picker__trigger')[index];
  if (colorPickerElement) {
    (colorPickerElement as HTMLElement).click(); // Trigger the color picker
  }
}
</script>
<template>
  <Navbar />
  <div class="palette-container">
    <h2>Palette Visualizer</h2>
    <p>Preview your colors on real designs for a better visual understanding.</p>
  </div>

  <!-- Bottom color strip -->
  <div class="color-strip">
    <div class="palette">
      <div
          v-for="(color, index) in displayedColors"
          :key="index"
          class="color-box-wrapper"
          @click="openColorPicker(index)"
      >
        <!-- Color Box -->
        <div
            class="color-box"
            :style="{ backgroundColor: color }"
            :class="{
            'rounded-left': index === 0,
            'rounded-right': index === displayedColors.length - 1,
          }"
        >
          <!-- Hidden Color Picker -->
          <el-color-picker
              v-model="colors[index]"
              @change="newColor => updateColor(newColor, index)"
              :show-alpha="true"
              :popper-class="'custom-color-picker'"
              style="visibility: hidden; position: absolute;"
              size= "small"
          />
        </div>
      </div>
    </div>

    <!-- Global Adjust Buttons -->
    <div class="color-adjustment">
      <button @click="increaseSize">+</button>
      <button @click="decreaseSize">-</button>
    </div>
  </div>
</template>

<style scoped>
.palette-container {
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

.color-strip {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f8f8;
  padding: 10px 0;
  box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
}

.palette {
  display: flex;
  gap: 0; /* Set gap to 0 to remove spacing */
  width: calc(50% - 70px); /* Adjust for button space */
  border-radius: 8px;
  overflow: hidden; /* Ensure rounded corners remain smooth */
}

.color-box-wrapper {
  position: relative;
  flex: 1; /* Each color box takes up equal space */
  cursor: pointer; /* Make the whole box clickable */
}

.color-box {
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  border-radius: 0; /* No border-radius for the inner boxes */
}

.color-box.rounded-left {
  border-top-left-radius: 8px;
  border-bottom-left-radius: 8px;
}

.color-box.rounded-right {
  border-top-right-radius: 8px;
  border-bottom-right-radius: 8px;
}

.color-adjustment {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-left: 10px;
}

.color-adjustment button {
  background-color: #ffffff;
  border: 1px solid #ddd;
  border-radius: 50%;
  font-size: 18px;
  width: 30px;
  height: 30px;
  cursor: pointer;
  color: #333;
}

.color-adjustment button:hover {
  background-color: #eaeaea;
}

.custom-color-picker {
  z-index: 10;
}
</style>
