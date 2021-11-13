import {InjectionKey} from 'vue'
import {createStore, Store} from 'vuex'

export interface State {
    count: number
}

export const key: InjectionKey<Store<State>> = Symbol()

export const store = createStore<State>({
    state() {
        return {
            count: 0
        }
    },
    mutations: {
        increment(state: { count: number }) {
            state.count++
        }
    }
})




