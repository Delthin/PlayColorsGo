<script setup lang="ts">
import Navbar from '../components/layout/Navbar.vue';
import PaletteList from '../components/color/PaletteList.vue';
import { ref } from "vue";
import PageHeader from "../components/layout/PageHeader.vue";

const tags = ref<string[]>([]);

function updateTags(newTags: string[]) {
  tags.value = newTags;
}

</script>

<template>
  <Navbar @tags-update="updateTags"/>
  <PageHeader 
    title="Popular Color Palettes"
    subtitle="Get inspired by thousands of beautiful color schemes and make something cool!"
  />
  <PaletteList 
    layout="grid"
    size="large"
    :tags="tags"
    :mode="'normal'"
  />
</template>

