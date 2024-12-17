<script setup lang="ts">
import { usePalettes } from '../composables/usePalettes'
import ColorPalette from './ColorPalette.vue'

const props = defineProps<{
  layout?: 'grid' | 'list'
  size?: 'small' | 'medium' | 'large'
  tags?: string[]
}>()

const { palettes, loading, fetchPalettes } = usePalettes()

// 根据传入的tags获取数据
watch(() => props.tags, (newTags) => {
  fetchPalettes(newTags)
}, { immediate: true })
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
  grid-template-columns: repeat(4, 1fr);
  gap: 35px;
  padding: 40px;
}

.palette-container.list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
}
</style>