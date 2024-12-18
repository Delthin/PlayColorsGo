import {axios} from '../utils/request'
import {PALETTE_MODULE} from './_prefix'

// 获取所有调色板
export const getAllPalettes = () => {
    return axios.get(`${PALETTE_MODULE}`)
}

// 搜索调色板
export const searchPalettes = (tags: string[]) => {
    return axios.get(`${PALETTE_MODULE}/searchPalettes`, {
        params: {tags}
    })
}