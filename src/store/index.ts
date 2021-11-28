import {InjectionKey} from 'vue'
import {createStore,useStore as baseUseStore ,Store} from 'vuex'
import {RootStateTypes} from "@store/interface";

// Vite 使用特殊的 import.meta.glob 函数从文件系统导入多个模块
// @see https://cn.vitejs.dev/guide/features.html#glob-import
const moduleFiles = import.meta.globEager('./modules/*.ts')
const paths:string[]=[]

for (const path in moduleFiles) {
    paths.push(path)
}

const modules = paths.reduce((modules: { [x: string]: any }, modulePath: string) => {
    const moduleKey = modulePath.replace(/^\.\/modules\/(.*)\.\w+$/, '$1');
    modules[moduleKey] = moduleFiles[modulePath].default;
    return modules;
}, {});

export const key: InjectionKey<Store<RootStateTypes>> = Symbol()

export const store = createStore<RootStateTypes>({modules})

export function useStore(){
    return baseUseStore(key)
}

