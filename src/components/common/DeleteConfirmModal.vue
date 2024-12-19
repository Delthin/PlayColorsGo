<script setup lang="ts">
const props = defineProps<{
  show: boolean
  title?: string
  message?: string
}>()

const emit = defineEmits(['confirm', 'cancel'])
</script>

<template>
  <div v-if="show" class="delete-confirm-modal">
    <div class="modal-content">
      <h3>{{ title || 'Delete Item' }}</h3>
      <p>{{ message || 'Are you sure you want to delete this item?' }}</p>
      <div class="modal-buttons">
        <button @click="emit('cancel')">Cancel</button>
        <button class="delete" @click="emit('confirm')">Delete</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.delete-confirm-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 24px;
  border-radius: 8px;
  min-width: 300px;
}

.modal-content h3 {
  margin: 0 0 16px 0;
  color: #2c3e50;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.modal-buttons button {
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
}

.modal-buttons button:not(.delete) {
  background: #e0e0e0;
}

.modal-buttons .delete {
  background: #dc3545;
  color: white;
}

.modal-buttons .delete:hover {
  background: #c82333;
}
</style>