<script setup lang="ts">
import { ref } from "vue";
import Navbar from "../components/layout/Navbar.vue";
import PageHeader from "../components/layout/PageHeader.vue";

const imageUrl = ref<string>('');
const colorPoints = ref<{ x: number; y: number; color: string }[]>([]);
const isDragging = ref(false);
const draggedPointIndex = ref(-1);
const imageElement = ref<HTMLImageElement | null>(null);
const colors = ref<string[]>([]);

const DEFAULT_POINTS_COUNT = 5;
const showMagnifier = ref(false);
const magnifierPos = ref({ x: 0, y: 0 });
const magnifierScale = 2; // 放大倍数

const exportOptions = [
    { label: 'Open in Generator', icon: 'fas fa-external-link-alt' },
    { label: 'Copy URL', icon: 'fas fa-link' },
    { label: 'Quick View', icon: 'fas fa-eye' },
    { label: 'Save Palette', icon: 'fas fa-save' },
];

// 处理图片上传
function handleImageUpload(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            imageUrl.value = e.target?.result as string;
            // 图片加载完成后初始化取色点
            const img = new Image();
            img.src = imageUrl.value;
            img.onload = () => {
                initializeColorPoints(DEFAULT_POINTS_COUNT, false);
            };
        };
        reader.readAsDataURL(file);
    }
}

// 初始化取色点
function initializeColorPoints(count: number, keepExisting: boolean = false) {
    if (!imageElement.value) return;

    const { width, height } = imageElement.value;
    const currentPoints = colorPoints.value;

    if (keepExisting) {
        if (count > currentPoints.length) {
            // 添加新点
            const newPoints = Array(count - currentPoints.length).fill(null).map(() => ({
                x: Math.random() * width,
                y: Math.random() * height,
                color: '#000000'
            }));
            colorPoints.value = [...currentPoints, ...newPoints];
        } else {
            // 减少点
            colorPoints.value = currentPoints.slice(0, count);
        }
    } else {
        // 完全重置所有点
        colorPoints.value = Array(count).fill(null).map(() => ({
            x: Math.random() * width,
            y: Math.random() * height,
            color: '#000000'
        }));
    }

    updateColors();
}

function addColorPoint() {
    if (colorPoints.value.length < 10) {
        initializeColorPoints(colorPoints.value.length + 1, true);
    }
}

function removeColorPoint() {
    if (colorPoints.value.length > 1) {
        initializeColorPoints(colorPoints.value.length - 1, true);
    }
}

// 更新所有取色点的颜色
function updateColors() {
    if (!imageElement.value) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = imageElement.value.width;
    canvas.height = imageElement.value.height;
    ctx.drawImage(imageElement.value, 0, 0);

    colors.value = colorPoints.value.map(point => {
        const pixel = ctx.getImageData(point.x, point.y, 1, 1).data;
        const color = `#${pixel[0].toString(16).padStart(2, '0')}${pixel[1].toString(16).padStart(2, '0')}${pixel[2].toString(16).padStart(2, '0')}`;
        point.color = color;
        return color;
    });
}

function handleMagnifier(event: MouseEvent) {
    if (!isDragging.value || !imageElement.value) return;

    const rect = imageElement.value.getBoundingClientRect();
    magnifierPos.value = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
    showMagnifier.value = true;
}

function handleExport(option: string) {
    switch (option) {
        case 'Copy URL':
            navigator.clipboard.writeText(window.location.href);
            break;
        // 添加其他导出选项处理...
    }
}

// 处理取色点拖动
function handlePointDragStart(index: number) {

    if (!isDragging.value || !imageElement.value) return;
    handleMagnifier(event);
    isDragging.value = true;
    draggedPointIndex.value = index;
}

function handlePointDragMove(event: MouseEvent) {
    if (!isDragging.value || !imageElement.value) return;

    const rect = imageElement.value.getBoundingClientRect();
    const x = Math.min(Math.max(0, event.clientX - rect.left), rect.width);
    const y = Math.min(Math.max(0, event.clientY - rect.top), rect.height);

    colorPoints.value[draggedPointIndex.value] = {
        ...colorPoints.value[draggedPointIndex.value],
        x,
        y
    };

    updateColors();
}

function handlePointDragEnd() {
    isDragging.value = false;
    draggedPointIndex.value = -1;
}

// 随机打乱取色点位置
function shufflePoints() {
    if (!imageElement.value) return;
    initializeColorPoints(colorPoints.value.length, false);
}

// 监听颜色变化
function handleColorsChange(newColors: string[]) {
    colors.value = newColors;
    // 如果颜色数量变化，更新取色点
    if (newColors.length !== colorPoints.value.length) {
        initializeColorPoints(newColors.length);
    }
}


// 选中颜色点
const selectedColorIndex = ref<number | null>(null);

function selectColor(index: number) {
    selectedColorIndex.value = index;
    // 高亮对应的取色点
    colorPoints.value = colorPoints.value.map((point, i) => ({
        ...point,
        isSelected: i === index
    }));
}

function isLightColor(color: string): boolean {
    const hex = color.replace('#', '');
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return (r * 0.299 + g * 0.587 + b * 0.114) > 128;
}

</script>

<template>
    <div class="image-picker-page">
        <Navbar />
        <PageHeader title="Image Color Picker"
            subtitle="Extract colors from your images and create beautiful palettes" />

        <div class="content-container">
            <div class="color-panel">
                <div class="color-strip">
                    <div class="color-controls">
                        <div class="palette">
                            <div v-for="(color, index) in colors" :key="index" class="color-box-wrapper"
                                @mouseenter="hoveredColorIndex = index" @mouseleave="hoveredColorIndex = null"
                                @click="selectColor(index)">
                                <div class="color-box" :style="{ backgroundColor: color }" :class="{
                                    'selected': index === selectedColorIndex,
                                    'light': isLightColor(color)
                                }">
                                    <div v-if="hoveredColorIndex === index || selectedColorIndex === index"
                                        class="color-dot">
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="color-adjustment">
                            <button @click="addColorPoint" :disabled="colors.length >= 10">+</button>
                            <button @click="removeColorPoint" :disabled="colors.length <= 1">-</button>
                        </div>
                    </div>
                </div>

                <div class="colors-info">
                    <div v-for="(color, index) in colors" :key="index" class="color-info-item"
                        :class="{ 'selected': index === selectedColorIndex }">
                        <div class="color-preview" :style="{ backgroundColor: color }">
                        </div>
                        <span class="color-hex">{{ color.toUpperCase() }}</span>
                    </div>
                </div>
            </div>

            <div class="image-panel">
                <div class="upload-area" v-if="!imageUrl">
                    <input type="file" accept="image/*" @change="handleImageUpload" id="image-upload" class="hidden" />
                    <label for="image-upload" class="upload-button">
                        <i class="fas fa-upload"></i>
                        <span>Upload Image</span>
                    </label>
                </div>

                <div class="image-container" v-else>
                    <img :src="imageUrl" ref="imageElement" @load="initializeColorPoints(DEFAULT_POINTS_COUNT)"
                        @mousemove="handlePointDragMove" @mouseup="handlePointDragEnd"
                        @mouseleave="handlePointDragEnd" />

                    <!-- 放大镜 -->
                    <div v-if="showMagnifier" class="magnifier" :style="{
                        left: `${magnifierPos.x}px`,
                        top: `${magnifierPos.y}px`,
                        backgroundImage: `url(${imageUrl})`,
                        backgroundPosition: `-${magnifierPos.x * magnifierScale}px -${magnifierPos.y * magnifierScale}px`,
                        backgroundSize: `${imageElement?.width * magnifierScale}px`
                    }">
                    </div>

                    <div v-for="(point, index) in colorPoints" :key="index" class="color-point" :style="{
                        left: `${point.x}px`,
                        top: `${point.y}px`,
                        backgroundColor: point.color
                    }" @mousedown="handlePointDragStart(index)"></div>

                    <div class="image-controls">
                        <button @click="shufflePoints" class="control-button">
                            <i class="fas fa-random"></i>
                            Shuffle Points
                        </button>
                        <button @click="initializeColorPoints(colors.length)" class="control-button">
                            <i class="fas fa-redo"></i>
                            Reset Points
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.image-picker-page {
    min-height: 100vh;
    background-color: #f8f9fa;
}

.content-container {
    display: flex;
    padding: 20px;
    gap: 20px;
    max-width: 1400px;
    margin: 0 auto;
    margin-top: 100px;
}

.color-panel {
    width: 300px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.color-strip {
    border-radius: 8px;
    overflow: hidden;
}

.color-controls {
    display: flex;
    align-items: center;
    gap: 10px;
}

.palette {
    display: flex;
    height: 50px;
    flex-grow: 1;
    border-radius: 8px;
    overflow: hidden;
}

.color-box-wrapper {
    flex: 1;
    height: 100%;
    min-width: 20px;
    cursor: pointer;
    transition: transform 0.2s;
}

.color-box {
    height: 100%;
    width: 100%;
    position: relative;
    transition: transform 0.2s;
}

.color-box.selected {
    transform: scale(1.1);
}

.color-box.selected::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 8px;
    height: 8px;
    background-color: rgba(255, 255, 255, 0.8);
    border-radius: 50%;
}

.color-box.selected.dark::after {
    background-color: rgba(0, 0, 0, 0.8);
}

.color-adjustment {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.color-adjustment button {
    width: 24px;
    height: 24px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
}

.color-adjustment button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.colors-info {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.color-info-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px;
    border-radius: 4px;
    transition: background-color 0.2s;
}

.color-info-item:hover {
    background-color: #f8f9fa;
}

.color-info-item.selected {
    background-color: #e9ecef;
}

.color-preview {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    border: 1px solid #ddd;
}

.color-hex {
    font-family: monospace;
    font-size: 14px;
    color: #495057;
}

.image-panel {
    flex: 1;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    padding: 20px;
    min-height: 400px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.upload-area {
    text-align: center;
    padding: 40px;
    border: 2px dashed #ddd;
    border-radius: 8px;
}

.hidden {
    display: none;
}

.upload-button {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 12px 24px;
    background-color: #007bff;
    color: white;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s;
}

.upload-button:hover {
    background-color: #0056b3;
}

.image-container {
    position: relative;
    max-width: 100%;
    max-height: 600px;
}

.image-container img {
    max-width: 100%;
    max-height: 600px;
    object-fit: contain;
}

.color-point {
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    cursor: move;
    transform: translate(-50%, -50%);
}

.image-controls {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 10px;
}

.control-button {
    padding: 8px 16px;
    background-color: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s;
    width: 100%;
    justify-content: center;
    font-size: 14px;
}

.control-button:hover {
    background-color: #f8f9fa;
    border-color: #007bff;
}

.color-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-bottom: 20px;
}

.color-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.color-block {
    height: 60px;
    border-radius: 8px;
    position: relative;
    cursor: pointer;
    transition: transform 0.2s;
}

.color-block:hover {
    transform: scale(1.05);
}

.color-dot {
    position: absolute;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    transition: all 0.3s ease;
}

.light .color-dot {
    background-color: black !important;
}

.color-info {
    font-size: 12px;
    color: #666;
    text-align: center;
}

.magnifier {
    position: absolute;
    width: 100px;
    height: 100px;
    border-radius: 50%;
    border: 2px solid white;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
    pointer-events: none;
    z-index: 100;
    background-repeat: no-repeat;
    transform: translate(-50%, -50%);
}

.panel-controls {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 20px;
    border-top: 1px solid #eee;
    padding-top: 20px;
}
</style>