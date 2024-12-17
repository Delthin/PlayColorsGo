<script setup lang="ts">
import {usePalettes} from '../composables/usePalettes'
import ColorPalette from './ColorPalette.vue'
import {defineProps, onMounted, watch} from 'vue'

const props = defineProps<{
  layout?: 'grid' | 'list'
  size?: 'small' | 'medium' | 'large'
  tags?: string[]
  mode?: 'normal' | 'favorites'
}>()

const {palettes, loading, fetchPalettes, fetchFilteredFavorites, fetchUserInfoAndFavorites, favorites} = usePalettes()

onMounted(async () => {
  if (props.mode === 'favorites') {
    console.log("before fetchUserInfoAndFavorites")
    await fetchUserInfoAndFavorites()
    console.log("after fetchUserInfoAndFavorites",favorites)
  } else {
    await fetchPalettes(props.tags)
  }
})

watch(() => props.tags, async (newTags) => {
  console.log('Tags changed:', newTags)
  if (props.mode === 'favorites') {
    await fetchFilteredFavorites(newTags)
  } else {
    await fetchPalettes(newTags)
  }
}, {deep: true})
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
      <ColorPalette
          v-for="palette in favorites"
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