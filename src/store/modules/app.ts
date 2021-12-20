// import {Module} from "vuex";
import {AppState} from "@store/interface";
import {Local} from "@utils/storage";

// import { storageLocal } from "/@/utils/storage";
import { store } from "@/store";
// import { appType } from "./types";
import { defineStore } from "pinia";
// import { getConfig } from "/@/config";

export const useAppStore = defineStore({
    id: "youlai-app",
    state: ():AppState=>({
        device: 'desktop',
        sidebar: {
            opened: Local.get('sidebarStatus') ? !!+Local.get('sidebarStatus') : true,
            withoutAnimation: false
        }
    }),
    actions: {
        async TOGGLE_SIDEBAR(state:any) {
            state.sidebar.opened = !state.sidebar.opened
            console.log('state.sidebar.opened',state.sidebar.opened)
            state.sidebar.withoutAnimation = false
            if (state.sidebar.opened) {
                Local.set('sidebarStatus', 1)
            } else {
                Local.set('sidebarStatus', 0)
            }
        },
        async CLOSE_SIDEBAR (state:any, withoutAnimation:any) {
            Local.set('sidebarStatus', 0)
            state.sidebar.opened = false
            state.sidebar.withoutAnimation = withoutAnimation
        },
       async TOGGLE_DEVICE(state:any, device:any) {
            console.log('TOGGLE_DEVICE',device)
            state.device = device
        },
       //  toggleSideBar({commit}) {
       //      commit('TOGGLE_SIDEBAR')
       //  },
       //  closeSideBar({commit}, {withoutAnimation}) {
       //      commit('CLOSE_SIDEBAR', withoutAnimation)
       //  },
       // async toggleDevice({commit}, device) {
       //      commit('TOGGLE_DEVICE', device)
       //  }
    }
})
export function useAppStoreHook() {
    return useAppStore(store);
}
