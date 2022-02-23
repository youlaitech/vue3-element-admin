import {AppState} from "@/store/interface";
import {localStorage} from "@/utils/storage";
import {store} from "@/store";
import {defineStore} from "pinia";
import { getLanguage } from '@/lang/index'

export const useAppStore = defineStore({
    id: "app",
    state: (): AppState => ({
        device: 'desktop',
        sidebar: {
            opened: localStorage.get('sidebarStatus') ? !!+localStorage.get('sidebarStatus') : true,
            withoutAnimation: false
        },
        language: getLanguage(),
        size: localStorage.get('size')||'default'
    }),
    actions: {
        toggleSidebar() {
            this.sidebar.opened = !this.sidebar.opened
            this.sidebar.withoutAnimation = false
            if (this.sidebar.opened) {
                localStorage.set('sidebarStatus', 1)
            } else {
                localStorage.set('sidebarStatus', 0)
            }
        },
        closeSideBar(withoutAnimation: any) {
            localStorage.set('sidebarStatus', 0)
            this.sidebar.opened = false
            this.sidebar.withoutAnimation = withoutAnimation
        },
        toggleDevice(device: string) {
            this.device = device
        },
        setSize(size: string) {
            this.size = size
            localStorage.set('size', size)
        },
        setLanguage(language: string) {
            this.language = language
            localStorage.set('language', language)
        }
    }
})

export function useAppStoreHook() {
    return useAppStore(store);
}
