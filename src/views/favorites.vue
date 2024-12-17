<script setup lang="ts">
import {ref} from "vue";
import Navbar from "../components/Navbar.vue";
import PaletteList from "../components/PaletteList.vue";

const tags = ref<string[]>([]);

function updateTags(newTags: string[]) {
  tags.value = newTags;
}
</script>

<template>
  <Navbar @tags-update="updateTags"/>
  <div class="container">
    <h2>Favourites</h2>
    <p>Have a look at what you like</p>
  </div>

  <PaletteList
      layout="grid"
      size="large"
      :tags="tags"
      :mode="'favorites'"
  />

  <!--      &lt;!&ndash; 空状态显示 &ndash;&gt;-->
  <!--      <div v-if="favorites.length === 0" class="empty-state">-->
  <!--        <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" fill="#b0b0b0" viewBox="0 0 24 24">-->
  <!--          <path d="M12 .587l3.668 7.57 8.332 1.151-6.064 5.922 1.484 8.259-7.42-3.897-7.42 3.897 1.484-8.259-6.064-5.922 8.332-1.151z"/>-->
  <!--        </svg>-->
  <!--        <p>You don't have any according favorite yet.</p>-->
  <!--      </div>-->
  <!--      <div v-else class="palette-list">-->
  <!--        <ColorPalette-->
  <!--            v-for="palette in favorites"-->
  <!--            :key="palette.id"-->
  <!--            :colors="palette.colors"-->
  <!--            :paletteId="palette.id"-->
  <!--            :fromFavorites="true"-->
  <!--        />-->
  <!--      </div>-->
</template>

<style scoped>
*,
*::before,
*::after {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

.container {
  text-align: center;
  margin-top: 250px;
  margin-bottom: 80px;
}

h2 {
  font-size: 36px;
}

p {
  color: #666;
  font-size: 24px;
}

/* .palette-list {
  display: grid;
  //grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  grid-template-columns: repeat(4, 1fr);
  width: 100%;
  padding: 0 40px;
  gap: 35px;
} */

</style>