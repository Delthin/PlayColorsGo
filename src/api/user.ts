import {axios} from '../utils/request'
import {USER_MODULE, API_MODULE} from './_prefix'
import {UserVO, UserInfo} from './types'

// 用户登录
export const login = (userInfo: UserInfo) => {
    return axios.post(`${USER_MODULE}/login`, null, {params: userInfo})
        .then(res => {
            return res
        })
}


// 用户注册
export const register = (userInfo: UserInfo) => {
    return axios.post(`${USER_MODULE}/register`, userInfo,
        {headers: {'Content-Type': 'application/json'}})
        .then(res => {
            return res
        })
}


// 获取用户信息
export const getUserInfo = () => {
    return axios.get(`${USER_MODULE}`)
}

// 更新用户信息
export const updateUserInfo = (userInfo: UserInfo) => {
    return axios.post(`${USER_MODULE}`, userInfo, {headers: {'Content-Type': 'application/json'}})
        .then(res => {
            return res
        })
}


// 获取特定收藏夹中的调色板
export const getFavorites = (userName: string, collectionName: string) => {
    return axios.post(`${API_MODULE}/getFavorites`, null, {
        params: {userName, collectionName}
    })
}

// 添加调色板到收藏夹
export const addFavorite = (userName: string, paletteId: number, collectionName: string) => {
    return axios.post(`${API_MODULE}/addFavorite`, null, {
        params: {userName, paletteId, collectionName}
    })
}

// 在收藏夹中搜索
export const searchFavorites = (userName: string, tags: string[], collectionName: string) => {
    return axios.post(`${API_MODULE}/searchFavorites`, null, {
        params: {userName, tags, collectionName}
    })
}