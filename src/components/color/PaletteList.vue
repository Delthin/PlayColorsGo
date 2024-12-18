<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { usePalettes } from '../../composables/usePalettes'
import ColorPalette from './ColorPalette.vue'

const props = defineProps<{
  layout: 'grid' | 'list'
  size: 'small' | 'medium' | 'large'
  tags?: string[]
  mode?: 'favorites' | 'explore'
  collection?: string
}>();

const {
  palettes,
  loading,
  favorites,
  fetchPalettes,
  fetchFilteredFavorites,
  fetchUserInfoAndCollections,
  switchCollection
} = usePalettes()

onMounted(async () => {
  if (props.mode === 'favorites') {
    await fetchUserInfoAndCollections()
    if (props.collection) {
      await switchCollection(props.collection)
    }
  } else {
    await fetchPalettes(props.tags)
  }
})

watch(() => props.collection, async (newCollection) => {
  if (props.mode === 'favorites' && newCollection) {
    await switchCollection(newCollection)
  }
})

watch(() => props.tags, async (newTags) => {
  if (props.mode === 'favorites') {
    await fetchFilteredFavorites(newTags)
  } else {
    await fetchPalettes(newTags)
  }
}, { deep: true })
</script>

<template>
  <div :class="['palette-container', layout]">
    <template v-if="loading">
      <div class="loading">Loading...</div>
    </template>
    <template v-else>
      <ColorPalette v-for="palette in (mode === 'favorites' ? favorites : palettes)" :key="palette.id"
        :palette-id="palette.id" :colors="palette.colors" :size="size" :is-active="false"
        :from-favorites="mode === 'favorites'" :name="mode === 'favorites' ? palette.name : undefined" />
    </template>
  </div>
</template>

<style scoped>
.palette-container.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 340px));
  justify-content: center;
  column-gap: 40px;
  row-gap: 10px;
  padding: 40px;
}

.palette-container.list {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 20px;
}
</style>