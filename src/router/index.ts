import {createRouter, createWebHashHistory} from 'vue-router';

const routes = [
    {
        path: '/',
        redirect: '/colors',
    },
    {
        path: '/colors',
        name: 'Colors',
        component: () => import('../views/colors.vue'),
    },
    {
        path: '/preview',
        name: 'Preview',
        component: () => import('../views/preview.vue'),
    },
    {
        path: '/account',
        name: 'Account',
        component: () => import('../views/account.vue'),
    },
    {
        path: '/favorites',
        name: 'Favorites',
        component: () => import('../views/favorites.vue'),
    },
    {
        path: '/image-picker',
        name: 'ImagePicker',
        component: () => import('../views/image-picker.vue'),
    }
];

const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

export {router};
