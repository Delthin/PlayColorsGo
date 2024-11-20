<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Shuffle, Palette, BookmarkPlus, RefreshCcw } from 'lucide-vue-next';

interface Props {
  modelValue: string[];
  maxColors?: number;
}

interface Emits {
  (e: 'update:modelValue', colors: string[]): void;
  (e: 'change', colors: string[]): void;
}

const props = withDefaults(defineProps<Props>(), {
  maxColors: 10
});

const emit = defineEmits<Emits>();

const displayCount = ref(Math.min(props.modelValue.length, props.maxColors));
const displayedColors = computed(() => props.modelValue.slice(0, displayCount.value));
const selectedColorIndex = ref<number | null>(null);
const showAdjustmentPanel = ref(false);

const hue = ref(0);
const saturation = ref(0);
const brightness = ref(0);
const temperature = ref(0);

// 拖拽相关状态
const draggedIndex = ref<number | null>(null);
const dragOverIndex = ref<number | null>(null);

function updateColor(newColor: string, index: number) {
  const newColors = [...props.modelValue];
  // 这里clear之后没法设置默认颜色
  // if (newColor === '') {
  //   console.log('Empty color');
  //   newColor = '#FF0000';
  // }
  // console.log(newColor);
  newColors[index] = newColor;
  // console.log(newColors[index]);
  emit('update:modelValue', newColors);
  emit('change', newColors);
}

function increaseSize() {
  if (displayCount.value < props.maxColors) {
    const newColors = [...props.modelValue];
    const newColor = generateSimilarColor(newColors[newColors.length - 1]);
    newColors.push(newColor);
    displayCount.value++;
    emit('update:modelValue', newColors);
    emit('change', newColors);
  }
}

function decreaseSize() {
  if (displayCount.value > 1) {
    const newColors = props.modelValue.slice(0, -1);
    displayCount.value--;
    emit('update:modelValue', newColors);
    emit('change', newColors);
  }
}

function shuffleColors() {
  const shuffled = [...displayedColors.value].sort(() => Math.random() - 0.5);
  emit('update:modelValue', shuffled);
  emit('change', shuffled);
}

function toggleAdjustmentPanel() {
  showAdjustmentPanel.value = !showAdjustmentPanel.value;
}

function adjustColors() {
  const newColors = displayedColors.value.map(color => {
    const hsl = rgbToHsl(hexToRgb(color));
    hsl.h = (hsl.h + hue.value) % 360;
    hsl.s = Math.max(0, Math.min(100, hsl.s + saturation.value));
    hsl.l = Math.max(0, Math.min(100, hsl.l + brightness.value));

    // 调整色温
    const rgb = hslToRgb(hsl);
    rgb.r = Math.max(0, Math.min(255, rgb.r + temperature.value));
    rgb.b = Math.max(0, Math.min(255, rgb.b - temperature.value));

    return rgbToHex(rgb);
  });

  emit('update:modelValue', newColors);
  emit('change', newColors);
}

function loadFromFavorites() {
  // 这里需要实现从收藏库加载颜色的逻辑
  console.log('Load from favorites');
}

function generateNewPalette() {
  const newColors = Array(displayCount.value).fill(0).map(() => generateRandomColor());
  emit('update:modelValue', newColors);
  emit('change', newColors);
}

function generateRandomColor(): string {
  return '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
}

function generateSimilarColor(baseColor: string): string {
  const rgb = parseInt(baseColor.slice(1), 16);
  const r = (rgb >> 16) & 255;
  const g = (rgb >> 8) & 255;
  const b = rgb & 255;

  const variance = 100;

  const newR = Math.max(0, Math.min(255, r + Math.floor(Math.random() * variance * 2) - variance));
  const newG = Math.max(0, Math.min(255, g + Math.floor(Math.random() * variance * 2) - variance));
  const newB = Math.max(0, Math.min(255, b + Math.floor(Math.random() * variance * 2) - variance));

  return `#${((newR << 16) | (newG << 8) | newB).toString(16).padStart(6, '0')}`;
}

// 拖拽处理函数
function handleDragStart(index: number, event: DragEvent) {
  draggedIndex.value = index;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    const target = event.target as HTMLElement;
    target.style.opacity = '0.4';
  }
}

function handleDragEnd(event: DragEvent) {
  draggedIndex.value = null;
  dragOverIndex.value = null;
  const target = event.target as HTMLElement;
  target.style.opacity = '1';
}

function handleDragOver(index: number, event: DragEvent) {
  event.preventDefault();
  dragOverIndex.value = index;
}

function handleDrop(event: DragEvent) {
  event.preventDefault();
  if (draggedIndex.value !== null && dragOverIndex.value !== null) {
    const newColors = [...props.modelValue];
    const [movedColor] = newColors.splice(draggedIndex.value, 1);
    newColors.splice(dragOverIndex.value, 0, movedColor);
    emit('update:modelValue', newColors);
    emit('change', newColors);
  }
  draggedIndex.value = null;
  dragOverIndex.value = null;
}

// 颜色转换函数
function hexToRgb(hex: string): { r: number, g: number, b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

function rgbToHex(rgb: { r: number, g: number, b: number }): string {
  return "#" + ((1 << 24) + (rgb.r << 16) + (rgb.g << 8) + rgb.b).toString(16).slice(1);
}

function rgbToHsl(rgb: { r: number, g: number, b: number }): { h: number, s: number, l: number } {
  const r = rgb.r/ 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s, l = (max + min) / 2;


  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }


  return { h: h * 360, s: s * 100, l: l * 100 };
}


function hslToRgb(hsl: { h: number, s: number, l: number }): { r: number, g: number, b: number } {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;
  let r, g, b;


  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };


    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);

  }


  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}


// 监听 props.modelValue 的变化
watch(() => props.modelValue, (newValue) => {
  displayCount.value = Math.min(newValue.length, props.maxColors);
}, { deep: true });
</script>


<template>
  <div class="color-strip">
    <div class="color-controls">
      <div class="palette">
        <div
            v-for="(color, index) in displayedColors"
            :key="index"
            class="color-box-wrapper"
            draggable="true"
            @dragstart.stop="handleDragStart(index, $event)"
            @dragend="handleDragEnd($event)"
            @dragover="handleDragOver(index, $event)"
            @drop="handleDrop($event)"
            :class="{
              'dragging': index === draggedIndex,
              'drag-over': index === dragOverIndex
            }"
        >
          <div
              class="color-box"
              :style="{ backgroundColor: color }"
              :class="{ 'selected': index === selectedColorIndex,
                        'rounded-left': index === 0,
                        'rounded-right': index === displayedColors.length - 1,}"
              @click="() => {selectedColorIndex = index;}"
          >
            <el-color-picker
                v-model="props.modelValue[index]"
                @active-change="newColor => {
                  updateColor(newColor, index);
                }"
                @blur="() => {selectedColorIndex = null;}"
                :popper-class="'custom-color-picker'"
                size="small"
            />
          </div>
        </div>
      </div>
      <div class="color-adjustment">
        <button @click="increaseSize" :disabled="displayCount === props.maxColors">+</button>
        <button @click="decreaseSize" :disabled="displayCount <= 1">-</button>
      </div>
    </div>
    <div class="tools">
      <button @click="shuffleColors" title="Shuffle colors">
        <Shuffle />
      </button>
      <button @click="toggleAdjustmentPanel" title="Adjust colors">
        <Palette />
      </button>
      <button @click="loadFromFavorites" title="Load from favorites">
        <BookmarkPlus />
      </button>
      <button @click="generateNewPalette" title="Generate new palette">
        <RefreshCcw />
      </button>
    </div>

    <div v-if="showAdjustmentPanel" class="adjustment-panel">
      <div class="adjustment-slider">
        <label>Hue</label>
        <input type="range" v-model="hue" min="-180" max="180" @input="adjustColors">
      </div>
      <div class="adjustment-slider">
        <label>Saturation</label>
        <input type="range" v-model="saturation" min="-100" max="100" @input="adjustColors">
      </div>
      <div class="adjustment-slider">
        <label>Brightness</label>
        <input type="range" v-model="brightness" min="-100" max="100" @input="adjustColors">
      </div>
      <div class="adjustment-slider">
        <label>Temperature</label>
        <input type="range" v-model="temperature" min="-100" max="100" @input="adjustColors">
      </div>
    </div>

  </div>
</template>
<style scoped>
.color-strip {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #f8f8f8;
  padding: 10px 20px;
  box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.color-controls {
  display: flex;
  align-items: center;
}

.palette {
  display: flex;
  height: 40px;
  width: calc(600px);
  border-radius: 8px;
  overflow: hidden;
}

.color-box-wrapper {
  flex: 1;
  height: 100%;
  min-width: 20px;
  position: relative;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.color-box-wrapper.dragging {
  opacity: 0.4;
}

.color-box-wrapper.drag-over::before {
  content: '';
  position: absolute;
  top: 0;
  left: -2px;
  width: 4px;
  height: 100%;
  background-color: #000;
  z-index: 1;
}

.color-adjustment {
  margin-left: 10px;
}

.color-box {
  height: 100%;
  width: 100%;
  position: relative;
  cursor: pointer;
}

.color-box.selected::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  background-color: black;
  border-radius: 50%;
}

.color-box :deep(.el-color-picker) {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  opacity: 0;
}

.color-box :deep(.el-color-picker__trigger) {
  width: 100%;
  height: 100%;
  padding: 0;
  border: none;
}

.color-adjustment button {
  background-color: #ffffff;
  border: 1px solid #ddd;
  border-radius: 50%;
  font-size: 18px;
  width: 25px;
  height: 25px;
  cursor: pointer;
  color: #333;
}

.tools {
  display: flex;
  gap: 10px;
  margin-left: auto;
  padding-right: 50px;
}

.tools button {
  background-color: #ffffff;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px;
  cursor: pointer;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tools button:hover {
  background-color: #f0f0f0;
}

.adjustment-panel {
  position: absolute;
  bottom: 100%;
  right: 80px;
  width: 200px;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 15px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.adjustment-slider {
  margin-bottom: 10px;
}

.adjustment-slider label {
  display: block;
  margin-bottom: 5px;
}

.adjustment-slider input {
  width: 100%;
}
</style>