<script setup lang="ts">
import {defineProps, onMounted, onUnmounted, reactive, ref, watch} from "vue";
import {ElColorPicker} from "element-plus";
import ContentSvg from "../../../public/templates/ContentSvg.vue";

interface Props {
  colors: string[];
  // svgRef: SVGSVGElement | null;
}

const props = defineProps<Props>()
const colors = reactive<string[]>([])

const svgRef = ref<ContentSvg | null>(null);

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
  const svgElement = svgRef.value.$el as SVGElement
  const elements = svgElement?.querySelectorAll('[data-group]')
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
  if (svgRef.value === null) {
    return
  }
  const svgElement = svgRef.value.$el as SVGElement
  const elements = svgElement?.querySelectorAll('[data-group]')
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
    <ContentSvg ref="svgRef"/>
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