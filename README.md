## 技术栈官网

- vue3: https://v3.cn.vuejs.org/guide/introduction.html

- vite2: https://cn.vitejs.dev/guide/

- element-plus: https://element-plus.gitee.io/zh-CN/component/button.html

- vue-next-router : https://next.router.vuejs.org/zh/introduction.html
  
- ~~next-vuex：https://next.vuex.vuejs.org/zh/index.html~~ (替换解决方案：pinia)
  
- pinia: https://pinia.vuejs.org 


## Vite项目构建

Vite是一种新型前端构建工具，能够显著提升前端开发体验。

[Vite 官方中文文档](https://cn.vitejs.dev/ )

项目构建命令：

```shell
npm init vite@latest vue3-element-admin --template vue-ts
cd vue3-element-admin
npm install
npm run dev
```

访问本地: http://localhost:3000

## vue-router

```text
npm install vue-router@next
```

src 下创建 router/interface.ts

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

## pinia

```shell
npm install pinia
```

src 下创建 store/index.ts

```typescript
import { createPinia } from "pinia";
const store = createPinia();
export { store };
```
  main.ts

```typescript
import {createApp} from 'vue'
import App from './App.vue'
import router from "./router";
import '@/styles/index.scss'
import { store } from "./store";
import ElementPlus from 'element-plus'
import 'element-plus/theme-chalk/index.css'
import locale from 'element-plus/lib/locale/lang/zh-cn'
import 'virtual:svg-icons-register';


// @see https://blog.csdn.net/qq_37213281/article/details/121422027
import * as ElIconModules from '@element-plus/icons'
import '@/permission'


import Pagination from '@/components/Pagination/index.vue'
import {getDictItemsByCode} from '@/api/system/dict'


const app = createApp(App)

// 统一注册el-icon图标
// @link https://blog.csdn.net/Alloom/article/details/119415984
for (let iconName in ElIconModules) {
    app.component(iconName, (ElIconModules as any)[iconName])
}

// 全局方法
app.config.globalProperties.$getDictItemsByCode = getDictItemsByCode
app.component('Pagination', Pagination) // 全局组件
     .use(store)
    .use(router)
    .use(ElementPlus, {locale})
    .mount('#app')

```


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
                find: "@/router",
                replacement: path.resolve("./src/router")
            },
            {
                find: "@/store",
                replacement: path.resolve("./src/store")
            },
            {
                find: "@/api",
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
      "@*": ["src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"]
}

```



## Vite 环境变量配置

**官方环境变量配置文档：** https://cn.vitejs.dev/guide/env-and-mode.html

#### 配置文件

在项目根目录分别添加 `开发环境配置` 、 `生产环境配置`和`模拟环境配置`文件

开发环境配置：`.env.development`

```properties
# 开发环境变量 注意：变量必须以 VITE_ 为前缀才能暴露给外部读取
VITE_APP_TITLE = '管理系统'
VITE_APP_PORT = 3000
VITE_APP_BASE_API = '/dev-api'
```


生产环境配置：`.env.production`

```properties
# 生产环境变量
VITE_APP_TITLE = '管理系统'
VITE_APP_PORT = 3000
VITE_APP_BASE_API = '/prod-api'
```


模拟环境配置：`.env.staging`

```properties
# 模拟环境变量
VITE_APP_TITLE = '管理系统'
VITE_APP_PORT = 3000
VITE_APP_BASE_API = '/stage-api'
```

#### 环境变量智能提示

`src/env.d.ts` 添加以下配置

```typescript
// 环境变量智能提示
interface ImportMetaEnv {
    VITE_APP_TITLE: string,
    VITE_APP_PORT: string,
    VITE_APP_BASE_API: string
}
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



##  axios 封装

#### 安装axios

```
 npm i axios
```

#### 缓存工具类

**src/utils/storage.ts**

```typescript
/**
 * window.localStorage 浏览器永久缓存
 */
export const Local = {
	// 设置永久缓存
	set(key: string, val: any) {
		window.localStorage.setItem(key, JSON.stringify(val));
	},
	// 获取永久缓存
	get(key: string) {
		let json: any = window.localStorage.getItem(key);
		return JSON.parse(json);
	},
	// 移除永久缓存
	remove(key: string) {
		window.localStorage.removeItem(key);
	},
	// 移除全部永久缓存
	clear() {
		window.localStorage.clear();
	},
};

/**
 * window.sessionStorage 浏览器临时缓存
 */
export const Session = {
	// 设置临时缓存
	set(key: string, val: any) {
		window.sessionStorage.setItem(key, JSON.stringify(val));
	},
	// 获取临时缓存
	get(key: string) {
		let json: any = window.sessionStorage.getItem(key);
		return JSON.parse(json);
	},
	// 移除临时缓存
	remove(key: string) {
		window.sessionStorage.removeItem(key);
	},
	// 移除全部临时缓存
	clear() {
		window.sessionStorage.clear();
	}
};

```



#### 创建axios实例

**src/utils/request.ts**

```typescript
import axios from "axios";
import {ElMessage, ElMessageBox} from "element-plus";
import {Session} from "@/utils/storage";


// 创建 axios 实例
const service = axios.create({
    baseURL: import.meta.env.VITE_BASE_API as any,
    timeout: 50000,
    headers: {'Content-Type': 'application/json;charset=utf-8'}
})

// 请求拦截器
service.interceptors.request.use(
    (config) => {
        if (!config?.headers) {
            throw new Error(`Expected 'config' and 'config.headers' not to be undefined`);
        }
        if (Session.get('token')) {
            config.headers.Authorization = `${Session.get('token')}`;
        }

    }, (error) => {
        return Promise.reject(error);
    }
)

// 响应拦截器
service.interceptors.response.use(
    ({data}) => {
        // 对响应数据做点什么
        const {code, msg} = data;
        if (code === '00000') {
            return data;
        } else {
            ElMessage({
                message: msg || '系统出错',
                type: 'error'
            })
            return Promise.reject(new Error(msg || 'Error'))
        }
    },
    (error) => {
        const {code, msg} = error.response.data
        if (code === 'A0230') {  // token 过期
            Session.clear(); // 清除浏览器全部临时缓存
            window.location.href = '/'; // 跳转登录页
            ElMessageBox.alert('当前页面已失效，请重新登录', '提示', {})
                .then(() => {
                })
                .catch(() => {
                });
        }
        return Promise.reject(new Error(msg || 'Error'))
    }
);

// 导出 axios 实例
export default service
```



## HelloWorld.vue

```typescript
<template>
  <el-input v-model="num"/>
  <el-button @click="handleClick">点击+1</el-button>
</template>

<script  lang="ts">
import {defineComponent, computed} from 'vue'
import {useStore} from '@/store';


export default defineComponent({
  setup() {
    const store = useStore()
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


## SVG图标

vite-plugin-svg-icons 使用说明：https://github.com/anncwb/vite-plugin-svg-icons/blob/main/README.zh_CN.md

**安装**

```
npm i -D vite-plugin-svg-icons
```



## 跨域处理


**vite.config.ts**
```
// 本地反向代理解决浏览器跨域限制
server: {
    host: 'localhost',
    port: Number(env.VITE_APP_PORT),
    open: true, // 运行自动打开浏览器
    proxy: {
        [env.VITE_APP_BASE_API]: {
            target: 'http://localhost:9999',
            changeOrigin: true,
            rewrite: path => path.replace(new RegExp('^' + env.VITE_APP_BASE_API), '')
        }
    }
}
```

## NProgress 进度条

**安装**
```
npm install --save nprogress
```

**permission.ts**
```
import NProgress from 'nprogress';
import 'nprogress/nprogress.css'
NProgress.configure({showSpinner: false}) // 进度环显示/隐藏

router.beforeEach((to, from, next) => {
  NProgress.start()
  ...
})

router.afterEach(() => {
  NProgress.done()
})

```

## TinyMCE 富文本编辑器

**官网：** http://tinymce.ax-z.cn/integrations/integrate-index.php

**安装**

```
npm i -S tinymce

npm i -S @tinymce/tinymce-vue

npm i -D @types/tinymce
```


