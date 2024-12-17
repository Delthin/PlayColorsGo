import { ref, Ref } from 'vue'
import { axios } from '../utils/request'

export interface Palette {
  id: number
  colors: string[]
  name?: string
}

export function usePalettes() {
  const palettes = ref<Palette[]>([])
  const loading = ref(false)
  
  async function fetchPalettes(tags?: string[]) {
    loading.value = true
    try {
      if (tags && tags.length > 0) {
        const tagsString = tags.map(tag => encodeURIComponent(tag)).join('&tags=')
        const response = await axios.get(`/api/palettes/searchPalettes?tags=${tagsString}`)
        if (response.data.code === '000') {
          palettes.value = response.data.result
        }
      } else {
        const response = await axios.get("/api/palettes")
        if (response.data.code === '000') {
          palettes.value = response.data.result
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
    fetchPalettes
  }
}