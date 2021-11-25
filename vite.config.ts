import {defineConfig, ConfigEnv, loadEnv} from 'vite'
import vue from '@vitejs/plugin-vue'
import viteSvgIcons from 'vite-plugin-svg-icons';
// 在 ts 模块中加载 node 核心模块需要安装 node 的类型补充模块: npm i -D @types/node
import path from 'path'

// https://vitejs.dev/config/
export default ({mode}: ConfigEnv) => {

    const env = loadEnv(mode, process.cwd())

    return defineConfig({
        plugins: [
            vue(),
            viteSvgIcons({
                // 指定需要缓存的图标文件夹
                iconDirs: [path.resolve(process.cwd(), 'src/assets/icons')],
                // 指定symbolId格式
                symbolId: 'icon-[dir]-[name]',
            })

        ],
        // 本地反向代理解决跨域
        server: {
            host: '0.0.0.0',
            port: Number(env.VITE_APP_PORT),
            open: true, // 运行自动打开浏览器
            proxy: {
                [env.VITE_APP_BASE_API]: {
                    target: 'http://localhost:9999',
                    changeOrigin: true,
                    rewrite:  path => path.replace(/^\/api/, '') //TODO
                }
            }
        },
        resolve: {
            // Vite2设置别名路径方式一
            // alias:{
            //     "/@":path.resolve("./src"),  // 相对路径别名配置，@表示src
            //  },
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
                    find: "@utils",
                    replacement: path.resolve("./src/utils")
                },
                {
                    find: "@views",
                    replacement: path.resolve("./src/views")
                },
                {
                    find: "@styles",
                    replacement: path.resolve("./src/styles")
                },
            ]
        }
    })


}





