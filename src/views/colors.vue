<script setup lang="ts">
import Navbar from '../components/Navbar.vue'
import ColorPalette from '../components/ColorPalette.vue'
</script>

<template>
  <Navbar />
  <div class="container">
    <h2>Popular Color Palettes</h2>
    <p>Get inspired by thousands of beautiful color schemes and make something cool!</p>
  </div>
  <div class="palette-list">
    <ColorPalette :colors="['#264653', '#2a9d8f', '#e9c46a', '#f4a261', '#e76f51']" />
    <ColorPalette :colors="['#e63946', '#f1faee', '#a8dadc', '#457b9d', '#1d3557']" />
    <ColorPalette :colors="['#606c38', '#283618', '#fefae0', '#dda15e', '#bc6c25']" />
    <ColorPalette :colors="['#003049', '#d62828', '#f77f00', '#fcbf49', '#eae2b7']" />
    <ColorPalette :colors="['#a8dadc', '#457b9d', '#1d3557', '#e63946', '#f1faee']" />
    <ColorPalette :colors="['#bc6c25', '#dda15e', '#fefae0', '#283618', '#606c38']" />
    <ColorPalette :colors="['#2d3142', '#bfc0c0', '#ffffff', '#ef8354', '#4f5d75']" />
    <ColorPalette :colors="['#f4f1de', '#e07a5f', '#3d405b', '#81b29a', '#f2cc8f']" />
    <ColorPalette :colors="['#ffbe0b', '#fb5607', '#ff006e', '#8338ec', '#3a86ff']" />
    <ColorPalette :colors="['#ffafcc', '#ffc8dd', '#bde0fe', '#a2d2ff', '#cdb4db']" />
    <ColorPalette :colors="['#14213d', '#fca311', '#e5e5e5', '#ffffff', '#000000']" />
    <ColorPalette :colors="['#f72585', '#b5179e', '#7209b7', '#3a0ca3', '#4361ee']" />
    <ColorPalette :colors="['#06d6a0', '#1b9aaa', '#ef476f', '#ffc43d', '#fffbfe']" />
    <ColorPalette :colors="['#ffcad4', '#b0d0d3', '#c08497', '#f7af9d', '#f7e3af']" />
    <ColorPalette :colors="['#22223b', '#4a4e69', '#9a8c98', '#c9ada7', '#f2e9e4']" />
    <ColorPalette :colors="['#8ecae6', '#219ebc', '#023047', '#ffb703', '#fb8500']" />
    <ColorPalette :colors="['#e63946', '#f1faee', '#a8dadc', '#457b9d', '#1d3557']" />
    <ColorPalette :colors="['#ef476f', '#ffd166', '#06d6a0', '#118ab2', '#073b4c']" />
    <ColorPalette :colors="['#006d77', '#83c5be', '#edf6f9', '#ffddd2', '#e29578']" />
    <ColorPalette :colors="['#ff9f1c', '#ffbf69', '#ffffff', '#cbf3f0', '#2ec4b6']" />
  </div>

</template>

<style scoped>
/* Global box-sizing to include padding and border in width calculations */
*,
*::before,
*::after {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  overflow-x: hidden; /* Prevent horizontal overflow */
}

.container {
  text-align: center;
  margin-top: 150px; /* 为标题和导航栏间距 */
}

h2 {
  font-size: 36px;
}

p {
  color: #666;
  font-size: 24px;
}

.palette-list {
  display: grid;
  gap: 30px;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); /* 自适应宽度 */
  width: 100%;
  padding: 0 40px; /* Add padding to avoid sticking to edges */
}
</style>
