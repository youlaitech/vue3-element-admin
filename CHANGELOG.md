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

### 🔄 refactor
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

### 🔄 refactor
- 使用 vue 3.3 版本新特性 `defineOptions` 在 `setup` 定义组件名称，移除重复的 `script` 标签

# 2.2.2 (2023/5/11)

### ✨ feat
-  用户新增提交添加 `vueUse` 的 `useDebounceFn` 函数实现按钮防抖节流


# 2.2.1 (2023/4/25)

### 🐛 fix
- 图标选择器组件使用 `onClickOutside` 未排除下拉弹出框元素导致无法输入搜索。

