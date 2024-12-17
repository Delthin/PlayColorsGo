import { ref, Ref } from 'vue'
import { axios } from '../utils/request'
import {userInfo} from "../api/user.ts";

export interface Palette {
  id: number
  colors: string[]
  name?: string
}

export function usePalettes() {
  const palettes = ref<Palette[]>([])
  const loading = ref(false)
  const favorites = ref<Array<{ id: number; colors: string[] }>>([]);
  const user = ref<{ name: string } >({ name: "" });

  async function fetchUserInfoAndFavorites() {
    console.log("fetchUserInfoAndFavorites in favorites.vue_begin!");
    try {
      const res = await userInfo();
      if (res.data.code === '000') {
        console.log("fetchUserInfo in favorites.vue!");
        user.value = { name: res.data.result.name };
        console.log(user.value.name);
      } else {
        console.error("Failed to fetch user info:", res.data.msg);
        return;
      }
      if (user.value.name) {
        const response = await axios.get("/api/users/getFavorites", {
          params: { name: user.value.name }
        });
        if (response.data.code === '000') {
          favorites.value = response.data.result.map((palette: any) => ({
            id: palette.id,
            colors: palette.colors
          }));
          console.log("!!!", favorites.value);
        } else {
          console.error("Failed to fetch favorites:", response.data.msg);
        }
      } else {
        console.warn("Username is not available yet");
      }
    } catch (error) {
      console.error("Error fetching user info or favorites:", error);
    }
    console.log("fetchUserInfoAndFavorites in favorites.vue_end!");
  }

  async function fetchFilteredFavorites(tags?: string[]) {
    try {
      if (tags && tags.length > 0) {
        console.log('Fetching filtered palettes with tags:', tags);
        const tagsString = tags.map(tag => encodeURIComponent(tag)).join('&tags=');
        const response = await axios.get(`/api/users/searchFavorites`, {
          params: {
            name: user.value.name,
            tags: tagsString,
          }
        });
        if (response.data.code === '000') {
          favorites.value = response.data.result.map((palette: any) => ({
            id: palette.id,
            colors: palette.colors,
          }));
        } else {
          console.error("Failed to fetch filtered palettes:", response.data.msg);
        }
      } else {
        const response = await axios.get("/api/users/getFavorites", {
          params: { name: user.value.name }
        });
        if (response.data.code === '000') {
          favorites.value = response.data.result.map((palette: any) => ({
            id: palette.id,
            colors: palette.colors,
          }));
        } else {
          console.error("Failed to fetch palettes:", response.data.msg);
        }
      }
    } catch (error) {
      console.error("Error fetching filtered palettes:", error);
    }
  }
  
  async function fetchPalettes(tags?: string[]) {
    loading.value = true
    try {
      if (tags && tags.length > 0) {
        console.log('Fetching palettes with tags:', tags)
        const tagsString = tags.map(tag => encodeURIComponent(tag)).join('&tags=')
        const response = await axios.get(`/api/palettes/searchPalettes?tags=${tagsString}`)
        if (response.data.code === '000') {
          palettes.value = response.data.result
          console.log('Fetched palettes:', palettes.value)
        }
      } else {
        console.log('Fetching all palettes')
        const response = await axios.get("/api/palettes")
        if (response.data.code === '000') {
          palettes.value = response.data.result
          console.log('Fetched palettes:', palettes.value)
        }
      }
    } catch (error) {
      console.error("Error fetching palettes:", error)
    } finally {
      loading.value = false
    }
  }

  return {
    palettes,
    loading,
    fetchPalettes,
    fetchUserInfoAndFavorites,
    fetchFilteredFavorites,
    favorites
  }
}