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
        <span class="search-icon">🔍</span>
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
}

.search-icon {
  position: absolute;
  left: 10px;
  font-size: 16px;
  color: #888;
}

input {
  padding: 10px 10px 10px 35px; /* Padding to leave space for the icon */
  border: 1px solid #ddd;
  border-radius: 20px;
  width: 300px;
  background-color: #f0f0f0; /* Adjust background color */
  font-size: 14px;
  color: #333;
  transition: all 0.3s ease;
}

input::placeholder {
  color: #aaa;
}

input:focus {
  outline: none;
  border-color: #333;
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
  color: red; /* Active link color */
}

.nav-links span:hover {
  color: #666; /* Hover color */
}
</style>
