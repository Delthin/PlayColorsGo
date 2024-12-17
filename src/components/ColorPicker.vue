<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Shuffle, Palette, BookmarkPlus, RefreshCcw } from 'lucide-vue-next';
import ColorLibrary from './ColorLibrary.vue';
import { TinyColor, random } from '@ctrl/tinycolor';

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
// const temperature = ref(0);
const originalColors = ref<TinyColor[]>([]);

// 拖拽相关状态
const draggedIndex = ref<number | null>(null);
const dragOverIndex = ref<number | null>(null);

// 添加状态
const showLibrary = ref(false);

function updateColor(newColor: string, index: number) {
  const newColors = [...props.modelValue];
  // 这里clear之后没法设置默认颜色
  // if (newColor === '') {
  //   console.log('Empty color');
  //   newColor = '#FF0000';
  // }
  // console.log(newColor);
  newColors[index] = new TinyColor(newColor).toHexString();
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
  if (showAdjustmentPanel.value) {
    // 打开面板时，保存原始颜色
    originalColors.value = displayedColors.value.map(color => new TinyColor(color));
  } else {
    // 关闭面板时，重置调整值
    resetAdjustment();
  }
}

// function mapRange (value: number, fromMin: number, fromMax: number, toMin: number, toMax: number) {
//   return ((value - fromMin) / (fromMax - fromMin)) * (toMax - toMin) + toMin;
// }

function adjustColors() {
  const newColors = originalColors.value.map(originalColor => {
    let adjustedColor = originalColor.clone();

    // 应用色调调整
    let hsl = adjustedColor.toHsl();
    let h = (Number(hsl.h) + Number(hue.value)) % 360;
    hsl.h = h < 0 ? 360 + h : h;
    adjustedColor = new TinyColor(hsl);
    adjustedColor = saturation.value > 0
        ? adjustedColor.saturate(saturation.value)
        : adjustedColor.desaturate(-saturation.value);
    adjustedColor = brightness.value > 0
        ? adjustedColor.lighten(brightness.value)
        : adjustedColor.darken(-brightness.value);
    // 调整色温
    // 有点难，不搞了
    // const rgb = adjustedColor.toRgb();
    // const temperatureAdjustment = mapRange(temperature.value, -100, 100, -127.5, 127.5);
    // rgb.r = Math.max(0, Math.min(255, rgb.r + temperatureAdjustment));
    // rgb.b = Math.max(0, Math.min(255, rgb.b - temperatureAdjustment));
    //
    // adjustedColor = new TinyColor(rgb);

    return adjustedColor.toHexString();
  });

  emit('update:modelValue', newColors);
  emit('change', newColors);
}

function resetAdjustment() {
  hue.value = 0;
  saturation.value = 0;
  brightness.value = 0;
  // temperature.value = 0;
}

function loadFromFavorites() {
  // 这里需要实现从收藏库加载颜色的逻辑
  showLibrary.value = true;
}

function generateNewPalette() {
  const newColors = Array(displayCount.value).fill(0).map(() => generateRandomColor());
  emit('update:modelValue', newColors);
  emit('change', newColors);
}

function generateRandomColor(): string {
  return random().toHexString();
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

    <div v-if="showAdjustmentPanel" class="adjustment-panel" >
      <div class="adjustment-slider">
        <label>Hue</label>
        <div class="slider-container">
          <input
              type="range"
              id="hue-slider"
              v-model="hue"
              min="-180"
              max="180"
              @input="adjustColors"
          >
          <input
              type="number"
              v-model="hue"
              min="-180"
              max="180"
              @input="adjustColors"
          >
        </div>
      </div>
      <div class="adjustment-slider">
        <label>Saturation</label>
        <div class="slider-container">
          <input
              type="range"
              id="saturation-slider"
              v-model="saturation"
              min="-100"
              max="100"
              @input="adjustColors"
          >
          <input
              type="number"
              v-model="saturation"
              min="-100"
              max="100"
              @input="adjustColors"
          >
        </div>
      </div>
      <div class="adjustment-slider">
        <label>Brightness</label>
        <div class="slider-container">
          <input
              type="range"
              id="brightness-slider"
              v-model="brightness"
              min="-100"
              max="100"
              @input="adjustColors"
          >
          <input
              type="number"
              v-model="brightness"
              min="-100"
              max="100"
              @input="adjustColors"
          >
        </div>
      </div>
<!--      <div class="adjustment-slider">-->
<!--        <label>Temperature</label>-->
<!--        <div class="slider-container">-->
<!--          <input-->
<!--              type="range"-->
<!--              id="temperature-slider"-->
<!--              v-model="temperature"-->
<!--              min="-100"-->
<!--              max="100"-->
<!--              @input="adjustColors"-->
<!--          >-->
<!--          <input-->
<!--              type="number"-->
<!--              v-model="temperature"-->
<!--              min="-100"-->
<!--              max="100"-->
<!--              @input="adjustColors"-->
<!--          >-->
<!--        </div>-->
<!--      </div>-->
    </div>
    <ColorLibrary 
      v-model="showLibrary"
      @select="colors => {
        emit('update:modelValue', colors);
        emit('change', colors);
      }"
    />
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
  border-radius: 8px;
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
  width: 250px;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 15px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.adjustment-slider {
  margin-bottom: 15px;
}

.adjustment-slider label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.slider-container {
  display: flex;
  align-items: center;
}

.slider-container input[type="range"] {
  flex-grow: 1;
  margin-right: 10px;
}

.slider-container input[type="number"] {
  width: 60px;
}

/* Custom styles for range inputs */
input[type="range"] {
  appearance: none;
  width: 100%;
  height: 10px;
  border-radius: 5px;
  outline: none;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: white;
  cursor: pointer;
  border: 2px solid #4CAF50;
}

/* Custom background for each slider */
#hue-slider {
  background: linear-gradient(to right, red, yellow, lime, cyan, blue, magenta, red);
}

#saturation-slider {
  background: linear-gradient(to right, white, rgb(204, 0, 0));
}

#brightness-slider {
  background: linear-gradient(to right, black, white);
}

</style>

//#temperature-slider {
//  background: linear-gradient(to right, #4000FF, white, #FF4000);
//}