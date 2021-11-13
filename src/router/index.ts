import {createRouter, createWebHashHistory, RouteRecordRaw} from 'vue-router'
import HelloWord from '../components/HelloWorld.vue'

const routes: Array<RouteRecordRaw> = [
    {
        path: '',
        redirect: (_) => {
            return {path: '/home'}
        }
    },
    {
        path: '/home',
        name: 'HelloWord',
        component: HelloWord
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes: routes
})

export default router