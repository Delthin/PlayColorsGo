<script setup lang="ts">
import { defineProps } from 'vue';

defineProps<{
    show: boolean
    message: string
    type: 'success' | 'error'
}>();
</script>

<template>
    <div v-if="show" class="notification" :class="type">
        <i :class="type === 'success' ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
        {{ message }}
    </div>
</template>

<style scoped>
.notification {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #333;
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 14px;
    animation: slideUp 0.3s ease-out forwards;
    z-index: 1000;
    display: flex;
    align-items: center;
    gap: 8px;
}

.notification.success i {
    color: #4CAF50;
}

.notification.error i {
    color: #f44336;
}

@keyframes slideUp {
    from {
        transform: translate(-50%, 20px);
        opacity: 0;
    }

    to {
        transform: translate(-50%, 0);
        opacity: 1;
    }
}
</style>