<script setup lang="ts">
import {defineProps, onMounted, onUnmounted, reactive, ref, watch} from "vue";
import {ElColorPicker} from "element-plus";

interface Props {
  colors: string[]
}

const props = defineProps<Props>()
const colors = reactive<string[]>([])
const svgRef = ref<SVGSVGElement | null>(null)

const currentColor = ref('#FFFFFF')
const currentColorIndex = ref<number | null>(0)
const colorPickerRef = ref<InstanceType<typeof ElColorPicker> | null>(null)

const setColorPickerPosition = (x: number, y: number) => {
  if (colorPickerRef.value === null) {
    return
  }
  const popperElement = document.querySelector(`.custom-color-picker`) as HTMLElement
  if (popperElement === null) {
    return
  }
  // it made difference at a time, but currently doesn't due to bug of element-plus
  popperElement.style.left = `${x}px`
  popperElement.style.top = `${y}px`
}

const handleElementClick = (event: MouseEvent, dataGroup: number) => {
  const colorIndex = (dataGroup - 1) % colors.length
  currentColor.value = colors[colorIndex]
  currentColorIndex.value = colorIndex
  setColorPickerPosition(event.clientX, event.clientY)
  colorPickerRef.value?.show()
}

const fillColors = () => {
  if (svgRef.value === null) {
    return
  }
  const svgElement = svgRef.value
  const elements = svgElement.querySelectorAll('[data-group]')
  elements.forEach(element => {
    const dataGroup = parseInt((element as SVGElement).getAttribute('data-group') || '0')
    const colorIndex = (dataGroup - 1) % colors.length
    ;(element as SVGElement).style.fill = props.colors[colorIndex]
  })
}

const updateColor = (newColor: string, index: number) => {
  props.colors[currentColorIndex.value] = newColor
  fillColors()
}

watch(() => props.colors, (newColors) => {
  colors.splice(0, colors.length, ...newColors)
  fillColors()
}, {immediate: true});

onMounted(() => {
  const elements = svgRef.value?.querySelectorAll('[data-group]')
  if (!elements) {
    return
  }
  elements.forEach(element => {
    const dataGroup = parseInt((element as SVGElement).getAttribute('data-group') || '0')
    element.addEventListener('click', (event) => {
      handleElementClick(event, dataGroup)
    })
  })
  fillColors()
})

onUnmounted(() => {
  const elements = svgRef.value?.querySelectorAll('[data-group]')
  if (!elements) {
    return
  }
  elements.forEach(element => {
    const dataGroup = parseInt((element as SVGElement).getAttribute('data-group') || '0')
    element.removeEventListener('click', (event) => {
      handleElementClick(event, dataGroup)
    })
  })
})

</script>

<template>
  <div class="svg-container">
    <svg
        ref="svgRef"
        width="100%"
        height="100%"
        viewBox="0 0 800 400"
        xmlns="http://www.w3.org/2000/svg"
        style="overflow: visible;">

      <!-- Left Section -->
      <rect x="0" y="0" width="400" height="400" data-group="1"/>
      <text x="200" y="130" font-family="Arial" font-size="64" font-weight="600" text-anchor="middle" dominant-baseline="middle" data-group="3">目 录</text>
      <!-- add a rectangle which just has outline in data-group 3 surrounding the CONTENTS -->
      <rect x="110" y="180" width="180" height="60" data-group="3"/>
      <rect x="113" y="183" width="174" height="54" data-group="1"/>
      <text x="200" y="212" font-family="Arial" font-size="24" font-weight="600" text-anchor="middle" dominant-baseline="middle"  data-group="3">CONTENTS</text>

      <!-- Right Section -->
      <rect x="400" y="0" width="400" height="400" data-group="2"/>

      <!-- Group for Section Titles -->
      <g id="section-titles">
        <g class="section" v-for="i in 4" :key="i" :transform="'translate(0, ' + (80 * i) + ')'">
          <g transform="translate(430, -20)">
            <circle r="20" cx="13" cy="22" data-group="1"/>
            <polygon points="56,18 56,26 60,22" data-group="3"/>
            <text x="2" y="28" font-family="Arial" font-size="20" data-group="3">{{ '0' + i }}</text>
            <rect x="80" y="0" width="250" height="50" rx="25" data-group="4"/>
            <text x="205" y="27" font-family="Arial" font-size="18" text-anchor="middle" dominant-baseline="middle" data-group="5">输入文字</text>
          </g>
        </g>
      </g>
    </svg>
    <el-color-picker
      ref="colorPickerRef"
      v-model="currentColor"
      @active-change="updateColor"
      @blur="() => currentColorIndex.value = null"
      popper-class="custom-color-picker"
      style="display: none;"
    />
  </div>
</template>

<style scoped>
.svg-container {
  width: 60%;
  margin: 20px auto;
}

</style>