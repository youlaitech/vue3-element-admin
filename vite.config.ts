import vue from '@vitejs/plugin-vue';

import { UserConfig, ConfigEnv, loadEnv, defineConfig } from 'vite';

import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';

import Icons from 'unplugin-icons/vite';
import IconsResolver from 'unplugin-icons/resolver';

import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';

import path from 'path';
const pathSrc = path.resolve(__dirname, 'src');

export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
  const env = loadEnv(mode, process.cwd());
  return {
    resolve: {
      // 别名配置 @替代src
      alias: {
        '@': pathSrc
      }
    },
    css: {
      // CSS 预处理器
      preprocessorOptions: {
        //define global scss variable
        scss: {
          javascriptEnabled: true,
          additionalData: `
            @use "@/styles/variables.module.scss" as *;
          `
        }
      }
    },
    // 本地反向代理解决浏览器跨域限制
    server: {
      host: '0.0.0.0',
      port: Number(env.VITE_APP_PORT),
      open: true, // 运行自动打开浏览器
      proxy: {
        [env.VITE_APP_BASE_API]: {
          // 线上API地址
          target: 'http://vapi.youlai.tech',
          // 本地API地址
          // target: 'http://localhost:8989',
          changeOrigin: true,
          rewrite: path =>
            path.replace(new RegExp('^' + env.VITE_APP_BASE_API), '')
        }
      }
    },
    plugins: [
      vue(),
      AutoImport({
        // 自动导入 Vue 相关函数，如：ref, reactive, toRef 等
        imports: ['vue', '@vueuse/core'],
        eslintrc: {
          enabled: false, // 没有此json文件，开启生成后关闭
          filepath: './.eslintrc-auto-import.json',
          globalsPropValue: true
        },
        resolvers: [
          // 自动导入 Element Plus 相关函数，如：ElMessage, ElMessageBox... (带样式)
          ElementPlusResolver(),
          // 自动导入图标组件
          IconsResolver({
            prefix: 'Icon'
          })
        ],
        vueTemplate: true,
        dts: path.resolve(pathSrc, 'types', 'auto-imports.d.ts')
      }),

      Components({
        resolvers: [
          // 自动注册图标组件
          IconsResolver({
            // element-plus图标库，其他图标库 https://icon-sets.iconify.design/
            enabledCollections: ['ep']
          }),
          // 自动导入 Element Plus 组件
          ElementPlusResolver()
        ],
        dts: path.resolve(pathSrc, 'types', 'components.d.ts')
      }),

      Icons({
        // 自动安装图标库
        autoInstall: true
      }),

      createSvgIconsPlugin({
        // 指定需要缓存的图标文件夹
        iconDirs: [path.resolve(pathSrc, 'assets/icons')],
        // 指定symbolId格式
        symbolId: 'icon-[dir]-[name]'
      })
    ],
    optimizeDeps: {
      include: [
        'vue',
        'vue-router',
        'element-plus/es/locale/lang/zh-cn',
        'element-plus/es/locale/lang/en',
        '@vueuse/core',
        'axios',
        'echarts',
        '@wangeditor/editor',
        '@wangeditor/editor-for-vue'
      ]
    }
  };
});
