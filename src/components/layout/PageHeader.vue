<script setup lang="ts">
defineProps({
    title: {
        type: String,
        required: true
    },
    subtitle: {
        type: String,
        required: true
    }
})
</script>

<template>
    <div class="page-header">
        <h2>{{ title }}</h2>
        <p>{{ subtitle }}</p>
    </div>
</template>

<style scoped>
.page-header {
    text-align: center;
    margin-top: 250px;
    margin-bottom: 70px;
    padding: 0 20px;
}

h2 {
    font-size: 36px;
    color: #2c3e50;
    margin-bottom: 12px;
    font-weight: 600;
    transition: color 0.3s ease;
}

p {
    color: #666;
    font-size: 24px;
    margin-bottom: 40px;
    line-height: 1.5;
    transition: color 0.3s ease;
}

/* 添加悬停效果 */
.page-header:hover h2 {
    color: #1a2634;
}

.page-header:hover p {
    color: #484848;
}

@media (max-width: 768px) {
    .page-header {
        margin-top: 180px;
        margin-bottom: 50px;
    }

    h2 {
        font-size: 28px;
    }

    p {
        font-size: 18px;
    }
}
</style>