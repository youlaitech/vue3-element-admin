import {defineStore} from "pinia";
import {store} from "@/store";
import {SettingState} from "@/store/interface";
import defaultSettings from '../../settings'
const {showSettings, tagsView, fixedHeader, sidebarLogo} = defaultSettings
import variables from '@/styles/element-variables.scss'

export const useSettingStore = defineStore({
    id: "setting",
    state: (): SettingState => ({
        theme: variables.theme,
        showSettings: showSettings,
        tagsView: tagsView,
        fixedHeader: fixedHeader,
        sidebarLogo: sidebarLogo,
    }),
    actions: {
        async changeSetting(payload: { key: string, value: any }) {
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
        }
    }
})

export function useSettingStoreHook() {
    return useSettingStore(store);
}

