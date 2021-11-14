# Vue 3 + Typescript + Vite + Element-Plus

## 技术栈官网地址

- vue3: https://v3.cn.vuejs.org/guide/introduction.html

- vite2: https://cn.vitejs.dev/guide/

- next-vuex: https://next.vuex.vuejs.org/zh/index.html

- vue-next-router: https://next.router.vuejs.org/zh/introduction.html
  
- element-plus: https://element-plus.gitee.io/zh-CN/


## Vite项目构建

Vite是一种新型前端构建工具，能够显著提升前端开发体验。

[Vite 官方中文文档](https://cn.vitejs.dev/ )

```shell
npm init vite@latest vue3-element-admin --template vue-ts
cd vue3-element-admin
npm install
npm run dev
```

访问本地: http://localhost:3000

## vue-next-router

```text
npm install vue-router@next
```

src 下创建 router/index.ts

```typescript
import {createRouter, createWebHashHistory, RouteRecordRaw} from 'vue-router'
import HelloWord from '../components/HelloWorld.vue'

const routes: Array<RouteRecordRaw> = [
    {
        path: '',
        redirect: (_) => {
            return {path: '/home'}
        }
    },
    {
        path: '/home',
        name: 'HelloWord',
        component: HelloWord
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes: routes
})

export default router
```

**参考文档：**

- [路由的 hash 模式和 history 模式的区别](https://www.cnblogs.com/GGbondLearn/p/12239651.html)

## next-vuex

```shell
npm install vuex@next
```

src 下创建 store/index.ts

```typescript
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
```

**参考文档：**

- [Vue3 的 InjectionKey 解决提供者和消费者同步注入值的类型](https://www.jianshu.com/p/7064c5f8f143)



## element-plus

```shell
npm install element-plus
```

## main.ts

```typescript
import { createApp } from 'vue'
import App from './App.vue'
import router from "./router";
import {store,key} from './store'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app=createApp(App)
app
    .use(router)
    .use(store,key)
    .use(ElementPlus)
    .mount('#app')
```



## Vite 设置路径别名

#### 安装 @types/node

```shell
npm install --save-dev @types/node
```

或者简写

```shell
 npm i -D @types/node
```

#### vite.config.ts

```typescript
import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
// 在 ts 模块中加载 node 核心模块需要安装 node 的类型补充模块: npm i -D @types/node
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    resolve: {
        // Vite2设置别名路径方式一
        /**
         alias:{

           "/@":path.resolve("./src"),
         },
         **/

        // Vite2设置别名路径方式二
        alias: [
            {
                find: "@",
                replacement: path.resolve("./src")
            },
            {
                find: "@image",
                replacement: path.resolve("./src/assets/images")
            },
            {
                find: "@router",
                replacement: path.resolve("./src/router")
            },
            {
                find: "@store",
                replacement: path.resolve("./src/store")
            },
            {
                find: "@api",
                replacement: path.resolve("./src/api")
            }
        ]
    }
})

```

#### tsconfig.json

TS配置别名路径，否则使用别名路径会报错，下面关键配置 `baseUrl` 、`paths` 和 `include`

```json
{
  "compilerOptions": {
	...
    "baseUrl": "./",
    "paths": {
      "@": ["src"],
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"]
}

```

## HelloWorld.vue

```typescript
<template>
  <el-input v-model="num"/>
  <el-button @click="handleClick">点击+1</el-button>
</template>

<script  lang="ts">
import {defineComponent, computed} from 'vue'
import {userStore} from '@/store';


export default defineComponent({
  setup() {
    const store = userStore()
    const num = computed(()=>{
      return store.state.count
    })
    const handleClick = () => {
      store.commit('increment')
    }
    return {
      num,
      handleClick
    }
  },
})
</script>
```

## App.vue

```typescript

<template>
  <img alt="Vue logo" src="./assets/logo.png" />
  <router-view/>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>

```

## Vite 环境变量配置

**官方说明：** https://cn.vitejs.dev/guide/env-and-mode.html

项目根目录添加多个环境的配置文件

开发环境变量文件：`.env.development`

```properties
# 开发环境变量
ENV = 'development'

# base api
VUE_APP_BASE_API = '/dev-api'
```



生产环境变量文件：`.env.production`

```properties
# 生产环境变量
ENV = 'production'

# base api
VUE_APP_BASE_API = '/prod-api'
```



模拟环境变量文件：`.env.staging`

```properties
# 模拟环境变量
ENV = 'staging'

# base api
VUE_APP_BASE_API = '/stage-api'
```



## 生产打包配置

#### package.json

```json
"scripts": {
    "dev": "vite serve --mode development",
    "build:prod": "vue-tsc --noEmit && vite build --mode production",
    "serve": "vite preview"
}
```

#### tsconfig.json

```json
{
  "compilerOptions": {
  	...
    "skipLibCheck": true  // element-plus 生产打包报错，通过此配置修改 TS 不对第三方依赖类型检查
  }
}

```

执行 `npm run build:prod` 命令打包，生成的打包文件在项目根目录 `dist` 目录下 









