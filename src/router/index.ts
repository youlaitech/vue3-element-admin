import {createRouter, createWebHashHistory, RouteRecordRaw} from 'vue-router'
import Layout from '@/layout/index.vue'

const routes: Array<RouteRecordRaw> = [
    {
        path: '/login',
        name: 'Login',
        component: () => import('@views/login/index.vue'),
        meta: {title: '登录'}
    }, {
        path: '/',
        component: Layout,
        redirect: '/dashboard',
        children: [
            {
                path: 'dashboard',
                component: () => import('@views/dashboard/index.vue'),
                name: 'Dashboard',
                meta: {title: '首页', icon: 'dashboard', affix: true}
            }
        ]
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes: routes
})

export default router