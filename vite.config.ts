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
            },
            resolve: {
                // Vite 设置别名路径
                alias: {
                    "@": path.resolve("./src"),  // 相对路径别名配置，@表示src
                }
            },
            // SCSS 变量导出
            // @see https://www.vitejs.net/config/#css-preprocessoroptions
            css: {
                preprocessorOptions: {
                    scss: {
                        additionalData:  `@import "./src/styles/element-variables.scss";`,
                        javascriptEnabled: true
                    }
                }
            }
        }
    )
}





