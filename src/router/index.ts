import {createRouter, createWebHashHistory, RouteRecordRaw} from 'vue-router'
import Layout from '@/layout/index.vue'

export const constantRoutes: Array<RouteRecordRaw> = [
    {
        path: '/redirect',
        component: Layout,
        meta: {hidden: true},
        children: [
            {
                path: '/redirect/:path(.*)',
                component: () => import('@/views/redirect/index.vue')
            }
        ]
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/login/index.vue'),
        meta: {title: '登录'}
    },
    {
        path: '/404',
        component: () => import('@/views/error-page/404.vue'),
        meta: {hidden: true}
    },
    {
        path: '/401',
        component: () => import('@/views/error-page/401.vue'),
        meta: {hidden: true}
    },
    {
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
    routes: constantRoutes
})

export function resetRouter() {
    const newRouter = router;
    (router as any).matcher = (newRouter as any).matcher
}

export default router