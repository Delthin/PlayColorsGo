import {axios} from '../utils/request'
import {COLLECTION_MODULE} from './_prefix'

// 创建收藏夹
export const createCollection = (collectionName: string, userName: string) => {
    return axios.post(`${COLLECTION_MODULE}/create`, null, {
        params: {collectionName, userName}
    })
}