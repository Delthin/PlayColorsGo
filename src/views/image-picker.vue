<script setup lang="ts">
import { ref } from "vue";
import Navbar from "../components/layout/Navbar.vue";
import PageHeader from "../components/layout/PageHeader.vue";
import { useRouter } from 'vue-router';
import SavePaletteModal from '../components/collection/SavePaletteModal.vue';
import NotificationToast from '../components/common/NotificationToast.vue';

const imageUrl = ref<string>('');
const colorPoints = ref<{ x: number; y: number; color: string }[]>([]);
const imageElement = ref<HTMLImageElement | null>(null);
const colors = ref<string[]>([]);

const DEFAULT_POINTS_COUNT = 5;
const showMagnifier = ref(false);
const magnifierPos = ref({ x: 0, y: 0 });
const magnifierScale = 2; // 放大倍数
const selectedColorIndex = ref<number>(0);
const hoveredColorIndex = ref<number | null>(null);

const isMouseDown = ref(false);
const activePointIndex = ref(-1);

const router = useRouter();
const showSaveModal = ref(false);

const notification = ref({
    show: false,
    message: '',
    type: 'success' as 'success' | 'error'
});


function showNotification(message: string, type: 'success' | 'error' = 'success') {
    notification.value = {
        show: true,
        message,
        type
    };
    setTimeout(() => {
        notification.value.show = false;
    }, 2000);
}

function copyColor(color: string) {
    navigator.clipboard.writeText(color).then(() => {
        showNotification(`Color ${color.toUpperCase()} copied!`, 'success');
    });
}

// 复制颜色函数
function copyColors() {
    const colorString = colors.value.join(', ');
    navigator.clipboard.writeText(colorString).then(() => {
        showNotification('Colors copied to clipboard!', 'success');
    });
}

// 预览调色板函数
function previewPalette() {
    router.push({
        path: '/preview',
        query: {
            colors: colors.value.join(',')
        }
    });
}

// 处理保存结果
function handleSavePalette(data: { success: boolean, message: string }) {
    showNotification(data.message, data.success ? 'success' : 'error');
    if (data.success) {
        showSaveModal.value = false;
    }
}

// 触发文件上传函数
function triggerUpload() {
    const input = document.getElementById('image-upload') as HTMLInputElement;
    if (input) {
        // 清除原有的值，使其能重复选择相同文件
        input.value = '';
        input.click();
    }
}

// 处理图片上传
function handleImageUpload(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            imageUrl.value = e.target?.result as string;
            // 重置取色点
            colorPoints.value = [];
            colors.value = [];
        };
        reader.onerror = () => {
            showNotification('Failed to load image', 'error');
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

    // 使用新数组避免直接修改响应式数据
    let newPoints;

    if (keepExisting) {
        if (count > colorPoints.value.length) {
            // 只添加新点
            const additionalPoints = Array(count - colorPoints.value.length)
                .fill(null)
                .map(() => ({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    color: '#000000'
                }));
            newPoints = [...colorPoints.value, ...additionalPoints];
        } else {
            // 只移除多余的点
            newPoints = colorPoints.value.slice(0, count);
        }
    } else {
        // 生成新的随机点
        newPoints = Array(count)
            .fill(null)
            .map(() => ({
                x: Math.random() * width,
                y: Math.random() * height,
                color: '#000000'
            }));
    }

    // 一次性更新点位
    colorPoints.value = newPoints;

    // 使用 requestAnimationFrame 更新颜色
    requestAnimationFrame(() => updateColors());
}


function addColorPoint() {
    if (colorPoints.value.length >= 10) return;
    const currentLength = colorPoints.value.length;
    requestAnimationFrame(() => {
        initializeColorPoints(currentLength + 1, true);
    });
}

function removeColorPoint() {
    if (colorPoints.value.length <= 1) return;
    const currentLength = colorPoints.value.length;
    requestAnimationFrame(() => {
        initializeColorPoints(currentLength - 1, true);
    });
}

// 更新所有取色点的颜色
function updateColors() {
    if (!imageElement.value) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const img = imageElement.value;
    const rect = img.getBoundingClientRect();

    // 设置canvas尺寸
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    // 一次性绘制图片
    ctx.drawImage(img, 0, 0);

    const scaleX = img.naturalWidth / rect.width;
    const scaleY = img.naturalHeight / rect.height;

    // 批量获取颜色数据
    const newColors = colorPoints.value.map((point, index) => {
        const sampleX = Math.min(Math.floor(point.x * scaleX), img.naturalWidth - 1);
        const sampleY = Math.min(Math.floor(point.y * scaleY), img.naturalHeight - 1);

        const pixel = ctx.getImageData(sampleX, sampleY, 1, 1).data;
        return `#${Array.from(pixel.slice(0, 3))
            .map(x => x.toString(16).padStart(2, '0'))
            .join('')}`;
    });

    // 一次性更新所有颜色
    colors.value = newColors;

    // 更新点的颜色
    colorPoints.value = colorPoints.value.map((point, index) => ({
        ...point,
        color: newColors[index]
    }));
}

// 处理取色点拖动
function handlePointDragStart(event: MouseEvent, index: number) {
    event.preventDefault();
    isMouseDown.value = true;
    activePointIndex.value = index;
    selectedColorIndex.value = index;
    showMagnifier.value = true;

    // 添加全局事件监听
    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);

    // 立即更新位置
    updatePointPosition(event);
}

function handleGlobalMouseMove(event: MouseEvent) {
    if (!isMouseDown.value || !imageElement.value) return;
    updatePointPosition(event);
}

function handleGlobalMouseUp() {
    isMouseDown.value = false;
    activePointIndex.value = -1;
    showMagnifier.value = false;

    // 移除全局事件监听
    document.removeEventListener('mousemove', handleGlobalMouseMove);
    document.removeEventListener('mouseup', handleGlobalMouseUp);

    // 最后更新一次颜色
    updateColors();
}

function updatePointPosition(event: MouseEvent) {
    if (!imageElement.value || activePointIndex.value === -1) return;

    const rect = imageElement.value.getBoundingClientRect();
    // 计算相对位置并限制边界
    const x = Math.min(Math.max(0, event.clientX - rect.left), rect.width);
    const y = Math.min(Math.max(0, event.clientY - rect.top), rect.height);

    // 更新点位置
    colorPoints.value[activePointIndex.value] = {
        ...colorPoints.value[activePointIndex.value],
        x: x,
        y: y
    };

    // 更新放大镜位置 - 使用相同的坐标
    magnifierPos.value = { x, y };

    // 使用 requestAnimationFrame 更新颜色
    requestAnimationFrame(updateColors);
}

// 随机打乱取色点位置
function shufflePoints() {
    if (!imageElement.value) return;
    const rect = imageElement.value.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // 生成新的随机位置
    const newPoints = colorPoints.value.map(point => ({
        ...point,
        oldX: point.x, // 保存原始位置
        oldY: point.y,
        x: Math.random() * width,
        y: Math.random() * height
    }));

    // 先更新位置（带动画）
    colorPoints.value = newPoints;

    // 等待动画完成后更新颜色
    setTimeout(() => {
        updateColors();
    }, 400); // 与 CSS transition duration 匹配
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

function handleDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const uploadArea = event.currentTarget as HTMLElement;
    uploadArea.classList.add('dragging');
}

function handleDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const uploadArea = event.currentTarget as HTMLElement;
    uploadArea.classList.remove('dragging');
}

function handleDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const uploadArea = event.currentTarget as HTMLElement;
    uploadArea.classList.remove('dragging');

    const file = event.dataTransfer?.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            imageUrl.value = e.target?.result as string;
            colorPoints.value = [];
            colors.value = [];
        };
        reader.readAsDataURL(file);
    } else {
        showNotification('Please upload an image file', 'error');
    }
}

</script>

<template>
    <div class="image-picker-page">
        <input type="file" accept="image/*" @change="handleImageUpload" id="image-upload" class="hidden" />
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
                            <button @click="addColorPoint"
                                :disabled="colors.length >= 10 || colors.length === 0">+</button>
                            <button @click="removeColorPoint" :disabled="colors.length <= 1">-</button>
                        </div>
                    </div>
                </div>

                <div class="colors-info">
                    <div v-for="(color, index) in colors" :key="index" class="color-info-item"
                        :class="{ 'selected': index === selectedColorIndex }">
                        <div class="color-info-main" @click="selectColor(index)">
                            <div class="color-preview" :style="{ backgroundColor: color }">
                            </div>
                            <span class="color-hex">{{ color.toUpperCase() }}</span>
                        </div>
                        <button class="copy-button" @click="copyColor(color)" :title="'Copy ' + color">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                </div>
                <!-- 在 color-panel 内，colors-info 后添加以下内容 -->
                <div class="panel-controls">
                    <button class="tool-button upload-btn" @click="triggerUpload">
                        <i class="fas fa-upload"></i>
                        <span>Upload Image</span>
                    </button>

                    <button class="tool-button" @click="shufflePoints">
                        <i class="fas fa-random"></i>
                        <span>Shuffle</span>
                    </button>

                    <button class="tool-button" @click="copyColors">
                        <i class="fas fa-copy"></i>
                        <span>Copy Colors</span>
                    </button>

                    <button class="tool-button" @click="showSaveModal = true">
                        <i class="fas fa-heart"></i>
                        <span>Save Palette</span>
                    </button>

                    <button class="tool-button" @click="previewPalette">
                        <i class="fas fa-eye"></i>
                        <span>Preview</span>
                    </button>
                </div>
            </div>

            <div class="image-panel">
                <div class="upload-area" v-if="!imageUrl" @click="triggerUpload" @dragover="handleDragOver" @dragleave="handleDragLeave"
                    @drop="handleDrop">
                    <input type="file" accept="image/*" @change="handleImageUpload" id="image-upload" class="hidden" />
                    <div class="upload-content">
                        <i class="fas fa-cloud-upload-alt"></i>
                        <div class="upload-text">
                            <h3>Upload image</h3>
                            <p>Browse or drop image here</p>
                        </div>
                    </div>
                </div>

                <div class="image-container" v-else>
                    <img :src="imageUrl" ref="imageElement" @load="initializeColorPoints(DEFAULT_POINTS_COUNT)"
                        draggable="false" />

                    <!-- 放大镜 -->
                    <div v-if="showMagnifier" class="magnifier" :style="{
                        left: `${magnifierPos.x}px`,
                        top: `${magnifierPos.y}px`,
                        backgroundImage: `url(${imageUrl})`,
                        backgroundPosition: `-${(magnifierPos.x * magnifierScale - 50)}px -${(magnifierPos.y * magnifierScale - 50)}px`,
                        backgroundSize: `${imageElement?.width * magnifierScale}px ${imageElement?.height * magnifierScale}px`
                    }">
                    </div>
                    <div v-for="(point, index) in colorPoints" :key="index" class="color-point"
                        :class="{ 'selected': index === selectedColorIndex }" :style="{
                            left: `${point.x}px`,
                            top: `${point.y}px`,
                            backgroundColor: point.color
                        }" @mousedown="handlePointDragStart($event, index)">
                    </div>
                </div>
            </div>
        </div>
    </div>
    <SavePaletteModal v-if="showSaveModal" :show="showSaveModal" :colors="colors" @close="showSaveModal = false"
        @save="handleSavePalette" />
    <NotificationToast :show="notification.show" :message="notification.message" :type="notification.type" />
</template>

<style scoped>
.image-picker-page {
    min-height: 100vh;
    background-color: white;
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
    border: 1px solid #eee;
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
    justify-content: space-between;
    padding: 8px;
    border-radius: 4px;
    transition: all 0.2s;
    background-color: transparent;
}

.color-info-main {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    flex: 1;
    padding: 2px 0; /* 增加上下内边距 */
    height: 100%; /* 确保填满父容器高度 */
}

.color-info-item:hover {
    transform: translateX(4px);
    background-color: #f8f9fa;
}

.color-info-item.selected {
    transform: translateX(4px);
    background-color: #e9ecef;
}

.copy-button {
    background: transparent;
    border: none;
    color: #6c757d;
    padding: 4px 8px;
    border-radius: 4px;
    cursor: pointer;
    opacity: 0;
    transition: all 0.2s;
}

.color-info-item:hover .copy-button {
    opacity: 1;
}

.copy-button:hover {
    color: #007bff;
    background-color: rgba(0, 123, 255, 0.1);
}

.color-preview {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    border: 1px solid #ddd;
}

.color-hex {
    font-family: monospace;
    font-size: 16px;
    color: #495057;
}

.image-panel {
    flex: 1;
    background: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #eee;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    padding: 20px;
    min-height: 400px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.upload-area {
    width: 100%;
    height: 100%;
    min-height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px dashed #ddd;
    border-radius: 8px;
    transition: all 0.3s ease;
    background-color: #fafafa;
    cursor: pointer;
}

.upload-area:hover,
.upload-area.dragging {
    border-color: #007bff;
    background-color: rgba(0, 123, 255, 0.05);
}

.upload-content {
    text-align: center;
    color: #6c757d;
    pointer-events: none;
}

.upload-content i {
    font-size: 48px;
    margin-bottom: 16px;
    color: #007bff;
}

.upload-content h3 {
    font-size: 20px;
    margin-bottom: 8px;
    color: #495057;
}

.upload-content p {
    font-size: 14px;
    margin: 0;
}

.upload-link {
    color: #007bff;
    text-decoration: none;
    cursor: pointer;
}

.upload-link:hover {
    text-decoration: underline;
}

.hidden {
    display: none;
}



.image-container {
    position: relative;
    max-width: 100%;
    max-height: 900px;
    touch-action: none;
    -webkit-user-select: none;
    user-select: none;
    will-change: transform;
    transform: translateZ(0);
}

/* 当放大镜显示时隐藏鼠标 */
.image-container:has(.magnifier) {
    cursor: none !important;
}

.image-container img {
    max-width: 100%;
    max-height: 900px;
    object-fit: contain;
    pointer-events: none;
    -webkit-user-drag: none;
    user-select: none;
}

.color-point {
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    cursor: grab;
    will-change: transform;
    backface-visibility: hidden;
    /* GPU加速 */
    transform: translate(-50%, -50%);
    /* 居中对齐 */
    touch-action: none;
    z-index: 1;
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 添加轨迹动画效果 */
.color-point::after {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: inherit;
    opacity: 0.2;
    transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    pointer-events: none;
}

.color-point:hover::after {
    transform: scale(1.5);
}

.color-point:active {
    cursor: none;
}

.color-point.selected {
    width: 28px;
    height: 28px;
    border-width: 4px;
    box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.5), 0 2px 8px rgba(0, 0, 0, 0.3);
    z-index: 10;
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
    cursor: none;
    will-change: transform;
    transform: translate3d(-50%, -50%, 0);

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

.tool-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px;
    background-color: white;
    border: 1px solid #ddd;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    width: 100%;
    justify-content: center;
    font-size: 16px;
    color: #495057;
}

.tool-button:hover {
    background-color: #f8f9fa;
    border-color: #007bff;
    color: #007bff;
}

.tool-button i {
    font-size: 16px;
}

.tool-button.upload-btn {
    background-color: #2176ff;
    color: white;
    border-color: #007bff;
    height: px;
}

.tool-button.upload-btn:hover {
    background-color: #0056b3;
    border-color: #0056b3;
    color: white;
}

.panel-controls {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 20px;
    border-top: 1px solid #eee;
    padding-top: 15px;
}
</style>