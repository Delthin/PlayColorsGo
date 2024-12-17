<script setup lang="ts">
import { usePalettes } from '../composables/usePalettes'
import ColorPalette from './ColorPalette.vue'
import { defineProps, onMounted, watch } from 'vue'

const props = defineProps<{
  layout?: 'grid' | 'list'
  size?: 'small' | 'medium' | 'large'
  tags?: string[]
}>()

const { palettes, loading, fetchPalettes } = usePalettes()

onMounted(() => {
  fetchPalettes(props.tags)
})

// 根据传入的tags获取数据
watch(() => props.tags, (newTags) => {
  console.log('Tags changed:', newTags)
  fetchPalettes(newTags)
}, { deep: true })
</script>

<template>
  <div :class="['palette-container', layout]">
    <template v-if="loading">
      <div class="loading">Loading...</div>  
    </template>
    <template v-else>
      <ColorPalette
        v-for="palette in palettes"
        :key="palette.id"
        :palette-id="palette.id"
        :colors="palette.colors"
        :size="size"
        :is-active="false"
      />
    </template>
  </div>
</template>

<style scoped>
.palette-container.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 340px));
  /* 设置列间距自动平均分布 */
  justify-content: center;
  column-gap: 40px;
  row-gap: 15px;
  padding: 40px;
}

.palette-container.list {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 20px;
}
</style>