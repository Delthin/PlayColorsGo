<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

function openPalette() {
  router.push({ path: '/preview', query: { colors: null } });
}
</script>

<template>
  <nav class="navbar">
    <div class="navbar-content">
      <h1>Coolors</h1>
      <div class="search-container">
        <span class="search-icon">
          <img src="../../public/search.png" alt="search" />
        </span>
        <input type="text" placeholder="Search with colors, topics, styles, or hex values..." />
      </div>
      <div class="nav-links">
        <span
            :class="{ active: route.path === '/colors' }"
            @click="router.push('/colors')"
        >
          Colors
        </span>
        <span
            :class="{ active: route.path === '/preview' }"
            @click="openPalette"
        >
          Preview
        </span>
      </div>
    </div>
  </nav>
</template>


<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px 0;
}

.navbar-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

h1 {
  margin: 0;
  color: deepskyblue;
  font-size: 36px;
}

.search-container {
  position: relative;
  display: flex;
  align-items: center;
  background-color: #ffffff;
  border-radius: 30px; /* 设置圆角矩形 */
  padding: 5px 15px; /* 增加内边距 */
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); /* 添加轻微的阴影 */
}

.search-icon img {
  width: 20px; /* 图标宽度 */
  height: 20px; /* 图标高度 */
}

input {
  padding: 10px 10px 10px 40px; /* 留出图标的空间 */
  border: none; /* 去掉边框 */
  border-radius: 30px; /* 圆角矩形 */
  width: 300px; /* 搜索框宽度 */
  background-color: transparent; /* 背景透明，与容器一致 */
  font-size: 14px;
  color: #333;
}

input::placeholder {
  color: #aaa;
}

input:focus {
  outline: none;
  background-color: #ffffff;
}

.nav-links {
  display: flex;
  gap: 20px;
  font-size: 18px;
}

.nav-links span {
  cursor: pointer;
  color: #333;
  transition: color 0.3s ease;
}

.nav-links .active {
  color: red;
}

.nav-links span:hover {
  color: #666;
}
</style>