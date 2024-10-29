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
];

const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

export {router};
