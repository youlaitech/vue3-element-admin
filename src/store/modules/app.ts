import {AppState} from "@/store/interface";
import {Local} from "@/utils/storage";
import {store} from "@/store";
import {defineStore} from "pinia";

export const useAppStore = defineStore({
    id: "app",
    state: (): AppState => ({
        device: 'desktop',
        sidebar: {
            opened: Local.get('sidebarStatus') ? !!+Local.get('sidebarStatus') : true,
            withoutAnimation: false
        },
        language: 'zh',
        size: Local.get('size')||'default'
    }),
    actions: {
        toggleSidebar() {
            this.sidebar.opened = !this.sidebar.opened
            this.sidebar.withoutAnimation = false
            if (this.sidebar.opened) {
                Local.set('sidebarStatus', 1)
            } else {
                Local.set('sidebarStatus', 0)
            }
        },
        closeSideBar(withoutAnimation: any) {
            Local.set('sidebarStatus', 0)
            this.sidebar.opened = false
            this.sidebar.withoutAnimation = withoutAnimation
        },
        toggleDevice(device: string) {
            this.device = device
        },
        setSize(size: string) {
            this.size = size
            Local.set('size', size)
        }
    }
})

export function useAppStoreHook() {
    return useAppStore(store);
}
