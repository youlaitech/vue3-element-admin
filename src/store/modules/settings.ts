import { defineStore } from "pinia";
import { store } from "@/store";
// import {Module} from "vuex";
import {SettingState, RootStateTypes} from "@store/interface";
import defaultSettings from '../../settings'

const {showSettings, tagsView, fixedHeader, sidebarLogo} = defaultSettings

export const useSettingStore = defineStore({
    id: "pure-setting",
    state:():SettingState =>({
        theme: '',
        showSettings: showSettings,
        tagsView: tagsView,
        fixedHeader: fixedHeader,
        sidebarLogo: sidebarLogo,
    }),
    actions: {
        async CHANGE_SETTING( payload: { key: string, value: any }){
            const {key, value} = payload
            switch (key) {
                case 'theme':
                   this.theme = value
                    break
                case 'showSettings':
                    this.showSettings = value
                    break
                case 'fixedHeader':
                    this.fixedHeader = value
                    break
                case 'tagsView':
                    this.tagsView = value
                    break
                case 'sidebarLogo':
                    this.sidebarLogo = value
                    break
                default:
                    break
            }
        },
        changeSetting(data:any) {
            this.CHANGE_SETTING(data)
        }
    }
})

export function useSettingStoreHook() {
    return useSettingStore(store);
}

