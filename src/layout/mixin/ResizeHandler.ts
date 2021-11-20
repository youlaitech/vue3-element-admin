import {userStore} from '@/store'
import {computed, watch} from "vue";
import { useRoute } from 'vue-router'
const store = userStore()

const {body} = document
const WIDTH = 992 // refer to Bootstrap's responsive design


export default function () {
    const device = computed(() => {
        return store.state.app.device
    })

    const sidebar = computed(() => {
        return store.state.app.sidebar
    })

    const isMobile = () => {
        const rect = body.getBoundingClientRect()
        return rect.width - 1 < WIDTH
    }

    const resizeHandler = () => {
        if (!document.hidden) {
            store.dispatch('app/toggleDevice', isMobile() ? 'mobile' : 'desktop')
            if (isMobile()) {
                store.dispatch('app/closeSideBar', {withoutAnimation: true})
            }
        }
    }

    const resizeMounted = () => {
        if(isMobile()){
            store.dispatch('app/toggleDevice', 'mobile')
            store.dispatch('app/closeSideBar', {withoutAnimation: true})
        }
    }
    const addEventListenerOnResize = () => {
        window.addEventListener('resize', resizeHandler)
    }

    const removeEventListenerResize = () => {
        window.removeEventListener('resize', resizeHandler)
    }


    const currentRoute = useRoute()
    const watchRouter = watch(() => currentRoute.name, () => {
        if (store.state.app.device === 'mobile' && store.state.app.sidebar.opened) {
            store.dispatch('app/closeSideBar', false)
        }
    })

    return {
        device,
        sidebar,
        resizeMounted,
        addEventListenerOnResize,
        removeEventListenerResize,
        watchRouter
    }
}
