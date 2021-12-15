import {UserConfig, ConfigEnv, loadEnv} from 'vite'
import vue from '@vitejs/plugin-vue'
import viteSvgIcons from 'vite-plugin-svg-icons';
// 如果编辑器提示 path 模块找不到，则可以安装一下 @types/node -> npm i @types/node -D
import path from 'path'

// @see: https://gitee.com/holysheng/vite2-config-description/blob/master/vite.config.ts

export default ({command, mode}: ConfigEnv): UserConfig => {
    // 获取 .env 环境配置文件
    const env = loadEnv(mode, process.cwd())

    return (
        {
            plugins: [
                vue(),
                viteSvgIcons({
                    // 指定需要缓存的图标文件夹
                    iconDirs: [path.resolve(process.cwd(), 'src/assets/icons/svg')],
                    // 指定symbolId格式
                    symbolId: 'icon-[dir]-[name]',
                })

            ],
            // 本地反向代理解决跨域
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
        }


    )
}





