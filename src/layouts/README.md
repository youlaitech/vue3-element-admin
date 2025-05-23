# 布局系统

## 目录结构

```
layouts/
├── index.vue              # 布局系统入口，根据设置动态加载布局
├── BaseLayout.vue         # 基础布局容器，提供通用功能
├── LeftLayout.vue         # 左侧菜单布局
├── TopLayout.vue          # 顶部菜单布局
├── MixLayout.vue          # 混合布局（顶部+左侧）
├── components/            # 布局相关组件
│   ├── AppMain.vue        # 主内容区域
│   ├── NavBar.vue         # 导航栏
│   ├── NavbarActions.vue  # 导航栏右侧操作区
│   ├── TagsView.vue       # 标签页视图
│   ├── LayoutMenu.vue     # 菜单组件
│   ├── Sidebar/           # 侧边栏相关组件
│   │   ├── SidebarLogo.vue         # Logo 组件
│   │   ├── SidebarMenu.vue         # 菜单主体（未使用）
│   │   ├── SidebarMenuItem.vue     # 菜单项
│   │   ├── SidebarMenuItemTitle.vue # 菜单项标题
│   │   └── SidebarMixTopMenu.vue   # 混合布局顶部菜单
│   ├── Settings/          # 设置面板
│   │   └── index.vue      # 设置面板主组件（包含布局选择）
│   └── common/            # 通用组件
│       └── LayoutSidebar.vue # 侧边栏容器
└── composables/           # 组合式函数
    ├── useLayout.ts       # 布局相关逻辑
    ├── useLayoutMenu.ts   # 菜单相关逻辑
    └── useLayoutResponsive.ts # 响应式处理
```

## 布局说明

### 1. LeftLayout（左侧布局）
- 传统的左侧固定菜单布局
- 支持菜单折叠/展开
- 适合大多数管理系统

### 2. TopLayout（顶部布局）
- 菜单位于顶部横向排列
- 适合一级菜单较少的系统
- 节省横向空间

### 3. MixLayout（混合布局）
- 一级菜单在顶部，二级菜单在左侧
- 适合菜单层级较多的大型系统
- 提供更好的菜单组织方式

## 使用方式

布局系统会根据 `settings store` 中的 `layout` 配置自动切换：

```typescript
// 在设置面板中切换布局
// 或通过代码：
settingsStore.layout = LayoutMode.LEFT; // 'left' | 'top' | 'mix'
```

## 自定义布局

如需添加新布局：

1. 在 `layouts/` 目录下创建新的布局组件（如 `CustomLayout.vue`）
2. 在 `index.vue` 中导入并添加到切换逻辑
3. 在 `enums/settings/layout.enum.ts` 中添加新的布局类型

## 主要功能

1. **响应式适配**: 自动适配桌面端和移动端，移动端下自动收起侧边栏
2. **多种布局模式**: 支持左侧菜单、顶部菜单、混合菜单三种模式
3. **主题切换**: 支持明亮/暗黑主题
4. **标签页**: 支持多标签页功能，可通过设置开启/关闭

## 可组合式API

### useLayout

提供布局相关的基础功能:
- 侧边栏展开/收起控制
- 布局模式获取
- 布局样式类计算

### useLayoutResponsive

提供响应式布局功能:
- 根据屏幕尺寸自动调整设备类型
- 根据设备类型自动调整侧边栏状态

### useLayoutMenu

提供菜单相关功能:
- 获取菜单数据
- 处理菜单激活状态
- 混合布局下的菜单联动