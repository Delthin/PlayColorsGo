<script setup lang="ts">
import { ref, computed, watch } from 'vue';

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

// 当前显示的颜色数量
const displayCount = ref(Math.min(props.modelValue.length, props.maxColors));

// 显示的颜色
const displayedColors = computed(() => props.modelValue.slice(0, displayCount.value));

// 拖拽相关状态
const draggedIndex = ref<number | null>(null);
const dragOverIndex = ref<number | null>(null);

// 生成类似颜色的函数
function generateSimilarColor(baseColor: string): string {
  const rgb = parseInt(baseColor.slice(1), 16);
  const r = (rgb >> 16) & 255;
  const g = (rgb >> 8) & 255;
  const b = rgb & 255;

  const variance = 200; // 颜色变化范围

  const newR = Math.max(0, Math.min(255, r + Math.floor(Math.random() * variance * 2) - variance));
  const newG = Math.max(0, Math.min(255, g + Math.floor(Math.random() * variance * 2) - variance));
  const newB = Math.max(0, Math.min(255, b + Math.floor(Math.random() * variance * 2) - variance));

  return `#${((newR << 16) | (newG << 8) | newB).toString(16).padStart(6, '0')}`;
}

// 处理颜色更新
function updateColor(newColor: string, index: number) {
  const newColors = [...props.modelValue];
  newColors[index] = newColor;
  emit('update:modelValue', newColors);
  emit('change', newColors);
}

// 增加颜色数量
function increaseSize() {
  if (displayCount.value < props.maxColors) {
    const newColors = [...props.modelValue];
    const baseColor = newColors[newColors.length - 1];
    const newColor = generateSimilarColor(baseColor);
    newColors.push(newColor);
    displayCount.value++;
    emit('update:modelValue', newColors);
    emit('change', newColors);
  }
}

// 减少颜色数量
function decreaseSize() {
  if (displayCount.value > 1) {
    const newColors = props.modelValue.slice(0, -1);
    displayCount.value--;
    emit('update:modelValue', newColors);
    emit('change', newColors);
  }
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
    <div class="palette">
      <div
          v-for="(color, index) in displayedColors"
          :key="index"
          class="color-box-wrapper"
          draggable="true"
          @dragstart="handleDragStart(index, $event)"
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
            :class="{
            'rounded-left': index === 0,
            'rounded-right': index === displayedColors.length - 1,
          }"
        >
          <el-color-picker
              v-model="props.modelValue[index]"
              @change="newColor => updateColor(newColor, index)"
              :show-alpha="true"
              :popper-class="'custom-color-picker'"
              size="small"
          />
        </div>
      </div>
    </div>

    <div class="color-adjustment">
      <button @click="increaseSize" :disabled="displayCount.value >= props.maxColors">+</button>
      <button @click="decreaseSize" :disabled="displayCount.value <= 1">-</button>
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
  justify-content: center;
  background-color: #f8f8f8;
  padding: 10px 0;
  box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.palette {
  display: flex;
  gap: 0;
  width: calc(50% - 70px);
  border-radius: 8px;
  overflow: hidden;
}

.color-box-wrapper {
  position: relative;
  flex: 1;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.color-box-wrapper.dragging {
  opacity: 0.4;
}

.color-box-wrapper.drag-over {
  transform: scale(1.05);
}

.color-box {
  height: 40px;
  width: 100%;
  position: relative;
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
  z-index: 1001;
}
</style>