import {Module} from "vuex";
import {RootStateTypes, AppState} from "@store/interface";
import {Local} from "@utils/storage";

const appModule: Module<AppState, RootStateTypes> = {
    namespaced: true,
    state: {
        device: 'desktop',
        sidebar: {
            opened: Local.get('sidebarStatus') ? !!+Local.get('sidebarStatus') : true,
            withoutAnimation: false
        }
    },
    mutations: {
        TOGGLE_SIDEBAR: state => {
            state.sidebar.opened = !state.sidebar.opened
            state.sidebar.withoutAnimation = false
            if (state.sidebar.opened) {
                Local.set('sidebarStatus', 1)
            } else {
                Local.set('sidebarStatus', 0)
            }
        },
        CLOSE_SIDEBAR: (state, withoutAnimation) => {
            Local.set('sidebarStatus', 0)
            state.sidebar.opened = false
            state.sidebar.withoutAnimation = withoutAnimation
        },
        TOGGLE_DEVICE: (state, device) => {
            state.device = device
        }
    },
    actions: {
        toggleSideBar({commit}) {
            commit('TOGGLE_SIDEBAR')
        },
        closeSideBar({commit}, {withoutAnimation}) {
            commit('CLOSE_SIDEBAR', withoutAnimation)
        },
        toggleDevice({commit}, device) {
            commit('TOGGLE_DEVICE', device)
        }
    }
}

export default appModule;

