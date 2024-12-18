<script setup lang="ts">
import { ref } from 'vue';
import { Search, X } from 'lucide-vue-next';

defineProps<{
  size?: 'small' | 'large'
  placeholder?: string
}>()

const emit = defineEmits(['search', 'close']);
const isExpanded = ref(false);
const searchQuery = ref('');

function toggleSearch() {
  isExpanded.value = !isExpanded.value;
  if (!isExpanded.value) {
    searchQuery.value = '';
    emit('close');
  }
}

function handleSearch() {
  emit('search', searchQuery.value);
}
</script>

<template>
  <div class="search-wrapper">
    <div v-if="!isExpanded" class="search-button" @click="toggleSearch">
      <Search size="18" />
    </div>
    <div v-else class="search-input-wrapper">
      <input
        v-model="searchQuery"
        type="text"
        :placeholder="placeholder"
        @keyup.enter="handleSearch"
        ref="searchInput"
      />
      <button class="close-search" @click="toggleSearch">
        <X size="18" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.search-wrapper {
  position: relative;
  height: 36px;
  width: 100%;
}

.search-button {
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  color: #666;
}

.search-input-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  background: white;
  border-radius: 4px;
  border: 1px solid #ddd;
  animation: expand 0.3s ease;
}

.search-input-wrapper input {
  flex: 1;
  border: none;
  padding: 8px;
  outline: none;
  font-size: 14px;
}

.close-search {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: #666;
}

@keyframes expand {
  from { width: 30px; }
  to { width: 100%; }
}
</style>