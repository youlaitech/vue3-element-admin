import {Module} from "vuex";
import {SettingState, RootStateTypes} from "@store/interface";
import defaultSettings from '../../settings'

const {showSettings, tagsView, fixedHeader, sidebarLogo} = defaultSettings

const settingModule: Module<SettingState, RootStateTypes> = {
    namespaced: true,
    state: {
        theme: '',
        showSettings: showSettings,
        tagsView: tagsView,
        fixedHeader: fixedHeader,
        sidebarLogo: sidebarLogo,
    },
    mutations: {
        CHANGE_SETTING: (state: SettingState, payload: { key: string, value: any }) => {
            const {key, value} = payload
            switch (key) {
                case 'theme':
                    state.theme = value
                    break
                case 'showSettings':
                    state.showSettings = value
                    break
                case 'fixedHeader':
                    state.fixedHeader = value
                    break
                case 'tagsView':
                    state.tagsView = value
                    break
                case 'sidebarLogo':
                    state.sidebarLogo = value
                    break
                default:
                    break
            }
        }
    },
    actions: {
        changeSetting({commit}, data) {
            commit('CHANGE_SETTING', data)
        }
    }
}

export default settingModule;


