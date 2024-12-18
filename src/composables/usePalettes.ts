import { ref, Ref } from 'vue'
import { axios } from '../utils/request'
import { getUserInfo, getFavorites } from "../api/user.ts"

export interface Palette {
  id: number
  colors: string[]
  name?: string
}

export interface Collection {
  name: string
  palettes: Palette[]
}

export function usePalettes() {
  const palettes = ref<Palette[]>([])
  const loading = ref(false)
  const favorites = ref<Palette[]>([])
  const collections = ref<string[]>([])
  const user = ref<{ name: string }>({ name: "" })
  const currentCollection = ref<string>('all')

  // 获取用户信息和收藏夹列表
  async function fetchUserInfoAndCollections() {
    try {
      const res = await getUserInfo()
      if (res.data.code === '000') {
        user.value = { name: res.data.result.name }
        collections.value = ['all', ...res.data.result.paletteCollections.map((c: any) => c.name)]
      }
    } catch (error) {
      console.error("Error fetching user info:", error)
    }
  }

  // 获取指定收藏夹的调色板
  async function fetchCollectionPalettes(collectionName: string = 'all') {
    if (!user.value.name) return
    
    try {
      loading.value = true
      const response = await getFavorites(user.value.name, collectionName === 'all' ? '' : collectionName)
      
      if (response.data.code === '000') {
        favorites.value = response.data.result.map((palette: any) => ({
          id: palette.id,
          colors: palette.colors,
          name: palette.name
        }))
      }
    } catch (error) {
      console.error("Error fetching collection palettes:", error)
    } finally {
      loading.value = false
    }
  }

  // 根据标签筛选收藏夹内容
  async function fetchFilteredFavorites(tags?: string[]) {
    if (!user.value.name) return

    try {
      loading.value = true
      if (tags && tags.length > 0) {
        const response = await axios.post('/api/users/searchFavorites', null, {
          params: {
            userName: user.value.name,
            tags,
            collectionName: currentCollection.value === 'all' ? '' : currentCollection.value
          }
        })
        
        if (response.data.code === '000') {
          favorites.value = response.data.result.map((palette: any) => ({
            id: palette.id,
            colors: palette.colors,
            name: palette.name
          }))
        }
      } else {
        await fetchCollectionPalettes(currentCollection.value)
      }
    } catch (error) {
      console.error("Error fetching filtered palettes:", error)
    } finally {
      loading.value = false
    }
  }
  
  // 获取探索页面的调色板
  async function fetchPalettes(tags?: string[]) {
    loading.value = true
    try {
      if (tags && tags.length > 0) {
        const response = await axios.post('/api/palettes/searchPalettes', null, {
          params: { tags }
        })
        if (response.data.code === '000') {
          palettes.value = response.data.result
        }
      } else {
        const response = await axios.post("/api/palettes")
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

  // 切换收藏夹
  async function switchCollection(collectionName: string) {
    currentCollection.value = collectionName
    await fetchCollectionPalettes(collectionName)
  }

  return {
    palettes,
    loading,
    favorites,
    collections,
    currentCollection,
    fetchPalettes,
    fetchUserInfoAndCollections,
    fetchCollectionPalettes,
    fetchFilteredFavorites,
    switchCollection
  }
}