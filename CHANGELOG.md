# 2.9.2 (2024/03/05)
### ✨ feat
- vscode开发扩展推荐 （author by [cshaptx4869](https://github.com/cshaptx4869)）
- 完善基础增删改查Mock接口 （author by [haoxianrui](https://github.com/haoxianrui)）

### ♻️ refactor
- 修改login密码框功能实现（author by [cshaptx4869](https://github.com/cshaptx4869)）
- 弱化页面进入动画效果（author by [cshaptx4869](https://github.com/cshaptx4869)）
- 取消推荐TypeScript Vue Plugin （author by [cshaptx4869](https://github.com/cshaptx4869)）
- 网站加载动画替换 （author by [haoxianrui](https://github.com/haoxianrui)）
- 优化主题和主题色监听，避免多个页面重复初始化 （author by [haoxianrui](https://github.com/haoxianrui)）

### 🐛 fix
- AppMain 高度在非固定头部不正确导致出现滚动条问题修复 （author by [haoxianrui](https://github.com/haoxianrui)）
- 修复混合模式开启固定Head时的样式问题 （author by [cshaptx4869](https://github.com/cshaptx4869)）
- 设置面板统一字体大小 （author by [cshaptx4869](https://github.com/cshaptx4869)）

### 📦️build
- 通过env配置控制mock服务 （author by [cshaptx4869](https://github.com/cshaptx4869)）
- 升级依赖包至最新版本 （author by [haoxianrui](https://github.com/haoxianrui)）
- 定义vite全局常量替换项目标题和版本 （author by [cshaptx4869](https://github.com/cshaptx4869)）

# 2.9.1 (2024/02/28)
### ♻️ refactor
- 项目配置按钮移入navbar（author by [cshaptx4869](https://github.com/cshaptx4869)）
- 优化user数据定义（author by [cshaptx4869](https://github.com/cshaptx4869)）
- 统一设置栏的 SVG 图标风格 

### 🐛 fix
- 规整一些开发依赖 （author by [cshaptx4869](https://github.com/cshaptx4869)）
- 修复登录页主题切换问题 （author by [cshaptx4869](https://github.com/cshaptx4869)）

### 🚀 pref

- 压缩图片资源  （author by [cshaptx4869](https://github.com/cshaptx4869)）


# 2.9.0 (2024/02/25)

### ✨ feat
- 引入 animate.css 动画库
- 新增水印和配置
- 动态路由菜单支持 element plus 的图标

### ♻️ refactor
- Layout 布局重构和相关问题修复
- sass 使用 @use 替代 @import 引入外部文件指令

### 🐛 fix
- 修复管理页面部分弹窗无法打开问题
- 主题颜色设置按钮 hover 等未变化问题修复


# 2.8.1 (2024/01/10)

### ✨ feat
- 替换 Mock 解决方案 vite-plugin-mock 为 vite-plugin-mock-dev-server 适配 Vite5 

# 2.8.0 (2023/12/27)

### ⬆️ chore
- 升级 Vite4 至 Vite5

# 2.7.1 (2023/12/12)

### ♻️ refactor
- 将打包后的文件进行分类 （author by [ityangzhiwen](https://gitee.com/ityangzhiwen)）

# 2.7.0 (2023/11/19)

### ♻️ refactor
- 代码重构优化
- 修改自动导入组件类型声明文件路径
- 完善 typescript 类型

### 🐛 fix
- 修复管理页面部分弹窗无法打开问题


# 2.7.0 (2023/11/19)

### ♻️ refactor
- 代码重构
- 修改自动导入组件类型声明文件路径
- 完善 typescript 类型

### 🐛 fix
- 修复管理页面部分弹窗无法打开问题


# 2.6.3 (2023/10/22)

### ✨ feat
- 菜单管理新增目录只有一级子路由是否始终显示(alwaysShow)和路由页面是否缓存(keepAlive)的配置
- 接口文档新增 swagger、knife4j
- 引入和支持 tsx 

### ♻️ refactor
- 代码瘦身，整理并删除未使用的 svg
- 控制台样式优化

### 🐛 fix
- 菜单栏折叠和展开的图标暗黑模式显示问题修复


# 2.6.2 (2023/10/11)

### 🐛 fix
- 主题设置未持久化问题
- UnoCSS 插件无智能提示

### ♻️ refactor
- WebSocket 演示样式和代码优化
- 用户管理代码重构

# 2.6.1 (2023/9/4)

### 🐛 fix
- 导航顶部模式、混合模式样式在固定 Header 出现的样式问题修复
- 固定 Header 没有持久化问题修复
- 字典回显兼容 String 和 Number 类型

# 2.6.0 (2023/8/24)💥💥💥

### ✨ feat
- 导航顶部模式、混合模式支持（author by [april-tong](https://april-tong.com/)）
- 平台文档(内嵌)（author by [april-tong](https://april-tong.com/)）

# 2.5.0 (2023/8/8)

### ✨ feat
- 新增 Mock（author by [ygcaicn](https://github.com/ygcaicn)）
- 图标 DEMO（author by [ygcaicn](https://github.com/ygcaicn)）

### 🐛 fix
- 字典支持 Number 类型

# 2.4.1 (2023/7/20)

### ✨ feat
- 整合 vite-plugin-compression 插件打包优化(3.66MB → 1.58MB) （author by [april-tong](https://april-tong.com/)）
- 字典组件封装（author by [haoxr](https://juejin.cn/user/4187394044331261/posts)）

### 🐛 fix
- 分页组件hidden无效 
- 签名无法保存至后端
- Git 提交 stylelint 校验部分机器报错

# 2.4.0 (2023/6/17)

### ✨ feat
- 新增组件标签输入框（author by [april-tong](https://april-tong.com/)）
- 新增组件签名（author by [april-tong](https://april-tong.com/)）
- 新增组件表格（author by [april-tong](https://april-tong.com/)）
- Echarts 图表添加下载功能 author by [april-tong](https://april-tong.com/)）

### ♻️ refactor
- 限制包管理器为 pnpm 和 node 版本16+
- 自定义组件自动导入配置
- 搜索框样式写法优化

### 🐛 fix
- 用户导入的部门回显成数字问题修复

### ⬆️ chore
- element-plus 版本升级 2.3.5 → 2.3.6

# 2.3.1 (2023/5/21)

### 🔄 refactor
- 组件示例文件名称优化

# 2.2.2 (2023/5/11)

### ✨ feat
- 组件封装示例添加源码地址
- 角色、菜单、部门、字段按钮添加权限控制


# 2.3.0 (2023/5/12)

### ⬆️ chore
- vue 版本升级 3.2.45 → 3.3.1 ([CHANGELOG](https://github.com/vuejs/core/blob/main/CHANGELOG.md))
- vite 版本升级 4.3.1 → 4.3.5

### ♻️ refactor
- 使用 vue 3.3 版本新特性 `defineOptions` 在 `setup` 定义组件名称，移除重复的 `script` 标签

# 2.2.2 (2023/5/11)

### ✨ feat
-  用户新增提交添加 `vueUse` 的 `useDebounceFn` 函数实现按钮防抖节流


# 2.2.1 (2023/4/25)

### 🐛 fix
- 图标选择器组件使用 `onClickOutside` 未排除下拉弹出框元素导致无法输入搜索。

