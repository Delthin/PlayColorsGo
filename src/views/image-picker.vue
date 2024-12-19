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
const selectedColorIndex = ref<number>(0);
const hoveredColorIndex = ref<number | null>(null);


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
    const rect = imageElement.value.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
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

    const img = imageElement.value;
    const rect = img.getBoundingClientRect();

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);

    const scaleX = img.naturalWidth / rect.width;
    const scaleY = img.naturalHeight / rect.height;

    // 同时更新 colors 和 colorPoints 的颜色
    colors.value = colorPoints.value.map((point, index) => {
        const realX = Math.min(Math.floor(point.x * scaleX), img.naturalWidth - 1);
        const realY = Math.min(Math.floor(point.y * scaleY), img.naturalHeight - 1);

        const pixel = ctx.getImageData(realX, realY, 1, 1).data;
        const color = `#${Array.from(pixel.slice(0, 3))
            .map(x => x.toString(16).padStart(2, '0'))
            .join('')}`;

        // 更新 colorPoints 中对应点的颜色
        colorPoints.value[index] = {
            ...point,
            color: color
        };

        return color;
    });
}

function handleMagnifier(event: MouseEvent) {
    if (!isDragging.value || !imageElement.value) return;

    const rect = imageElement.value.getBoundingClientRect();
    const pointSize = draggedPointIndex.value === selectedColorIndex.value ? 28 : 20;
    const offset = pointSize / 2;

    // 使用取色点中心作为放大镜位置
    const x = event.clientX - rect.left - offset;
    const y = event.clientY - rect.top - offset;

    magnifierPos.value = {
        x: x + offset,
        y: y + offset
    };
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
function handlePointDragStart(event: MouseEvent, index: number) {
    event.preventDefault();
    isDragging.value = true;
    draggedPointIndex.value = index;
    selectedColorIndex.value = index; // 同步选中状态
    showMagnifier.value = true;
    handleMagnifier(event);
}

const throttledUpdateColors = throttle(updateColors, 100); // 限制颜色更新频率

function handlePointDragMove(event: MouseEvent) {
    if (!isDragging.value || !imageElement.value) return;

    requestAnimationFrame(() => {
        const rect = imageElement.value!.getBoundingClientRect();
        const pointSize = draggedPointIndex.value === selectedColorIndex.value ? 28 : 20;
        const offset = pointSize / 2;

        // 计算中心点位置
        const boundedX = Math.min(Math.max(0, event.clientX - rect.left - offset), rect.width - pointSize);
        const boundedY = Math.min(Math.max(0, event.clientY - rect.top - offset), rect.height - pointSize);

        if (draggedPointIndex.value !== -1) {
            colorPoints.value[draggedPointIndex.value] = {
                ...colorPoints.value[draggedPointIndex.value],
                x: boundedX,
                y: boundedY
            };

            // 更新放大镜位置，使用中心点坐标
            magnifierPos.value = {
                x: boundedX + offset,
                y: boundedY + offset
            };

            throttledUpdateColors();
        }
    });
}

function handlePointDragEnd() {
    isDragging.value = false;
    draggedPointIndex.value = -1;
    showMagnifier.value = false;
    // 拖动结束时更新一次颜色确保准确
    updateColors();
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


function selectColor(index: number) {
    selectedColorIndex.value = index;
}

function isLightColor(color: string): boolean {
    const hex = color.replace('#', '');
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return (r * 0.299 + g * 0.587 + b * 0.114) > 128;
}

function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return function (this: any, ...args: Parameters<T>) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
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
                                <div class="color-box" :style="{ backgroundColor: color }">
                                    <div v-if="hoveredColorIndex === index || selectedColorIndex === index"
                                        class="color-dot" :style="{
                                            backgroundColor: isLightColor(color) ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)',
                                            opacity: selectedColorIndex === index ? 1 : 0.5
                                        }">
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
                        @mousedown.prevent @mousemove="handlePointDragMove" @mouseup="handlePointDragEnd"
                        @mouseleave="handlePointDragEnd" />

                    <!-- 放大镜 -->
                    <div v-if="showMagnifier" class="magnifier" :style="{
                        left: `${magnifierPos.x}px`,
                        top: `${magnifierPos.y}px`,
                        backgroundImage: `url(${imageUrl})`,
                        backgroundPosition: `-${(magnifierPos.x - 50) * magnifierScale}px -${(magnifierPos.y - 50) * magnifierScale}px`,
                        backgroundSize: `${imageElement?.width * magnifierScale}px ${imageElement?.height * magnifierScale}px`
                    }">
                    </div>
<div v-for="(point, index) in colorPoints" 
     :key="index" 
     class="color-point"
     :class="{ 'selected': index === selectedColorIndex }" 
     :style="{
         left: `${point.x}px`,
         top: `${point.y}px`,
         backgroundColor: point.color
     }" 
     @mousedown="handlePointDragStart($event, index)">
</div>

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
    display: inline-block; /* 添加这行 */
}

.image-container img {
    max-width: 100%;
    max-height: 600px;
    object-fit: contain;
    user-select: none;
    -webkit-user-drag: none;
    display: block; /* 添加这行 */
}

.color-point {
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    cursor: none;
    /* 隐藏鼠标 */
    transform-origin: center;
    will-change: transform;
    backface-visibility: hidden;
    /* GPU加速 */
    transform: translate3d(0, 0, 0);
    /* GPU加速 */
    touch-action: none;
    transition: width 0.3s ease, height 0.3s ease, border-width 0.3s ease;
}

.color-point.selected {
    width: 28px;
    height: 28px;
    border-width: 4px;
    box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.5), 0 2px 8px rgba(0, 0, 0, 0.3);
    z-index: 10;
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
    opacity: 0.8;
}

.color-box-wrapper:hover .color-dot,
.color-box-wrapper.selected .color-dot {
    transform: translate(-50%, -50%) scale(1);
}

.color-box-wrapper.selected .color-dot {
    width: 12px;
    height: 12px;
}

.selected .color-dot {
    opacity: 1;
}

.color-dot.light {
    background-color: black;
    /* 浅色背景时使用黑色 */
}

.color-dot.dark {
    background-color: white;
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
    cursor: none;
}

.magnifier::after {
    content: '';
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: black;
    border: 1px solid white;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
}

.image-container.dragging {
    cursor: none;
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