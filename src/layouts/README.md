# 布局系统

本项目的布局系统采用模块化、可组合式API的架构，支持三种不同的布局模式:

1. **左侧菜单布局 (LeftSideLayout)**: 传统的管理系统布局，左侧为菜单栏，顶部为导航栏
2. **顶部菜单布局 (TopMenuLayout)**: 顶部为主菜单栏，适合菜单项较少的应用
3. **混合菜单布局 (MixMenuLayout)**: 顶部为一级菜单，左侧为对应的子菜单，适合菜单层级较多的复杂应用

## 目录结构

```
layouts/
├── README.md                    # 文档说明
├── index.vue                    # 布局入口，根据设置选择对应的布局组件
├── composables/                 # 可组合式API
│   ├── useLayout.ts             # 布局通用逻辑
│   ├── useLayoutResponsive.ts   # 响应式布局逻辑
│   └── useLayoutMenu.ts         # 菜单处理逻辑
└── components/                  # 布局组件
    ├── LayoutBase.vue           # 基础布局组件
    ├── SidebarMenu.vue          # 菜单组件
    ├── common/                  # 公共组件
    │   └── LayoutSidebar.vue    # 侧边栏公共组件
    ├── LeftSideLayout/          # 左侧菜单布局
    │   └── index.vue
    ├── TopMenuLayout/           # 顶部菜单布局
    │   └── index.vue
    └── MixMenuLayout/           # 混合菜单布局
        └── index.vue
```

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