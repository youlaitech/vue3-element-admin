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
            },
            {
                find:"@utils",
                replacement: path.resolve("./src/utils")
            }
        ]
    }
})
