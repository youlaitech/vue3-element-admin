<div align="center">
  <img alt="vue3-element-admin" width="80" height="80" src="./src/assets/logo.png">
  <h1>vue3-element-admin</h1>

  <img src="https://img.shields.io/badge/Vue-3.5.13-brightgreen.svg"/>
  <img src="https://img.shields.io/badge/Vite-6.2.2-green.svg"/>
  <img src="https://img.shields.io/badge/Element Plus-2.9.7-blue.svg"/>
  <img src="https://img.shields.io/badge/license-MIT-green.svg"/>
  <a href="https://gitee.com/youlaiorg" target="_blank">
      <img src="https://img.shields.io/badge/Author-有来开源组织-orange.svg"/>
  </a>

  <a href="https://gitee.com/youlaiorg/youlai-boot" target="_blank">
     <img alt="有来技术" src="https://gitee.com/youlaiorg/vue3-element-admin/badge/star.svg"/>
   </a>
  <a href="https://github.com/youlaitech/vue3-element-admin" target="_blank">
    <img alt="有来技术" src="https://img.shields.io/github/stars/youlaitech/vue3-element-admin.svg?style=social&label=Stars"/>
  </a>
  <a href="https://gitcode.com/youlai/vue3-element-admin" target="_blank">
    <img alt="有来技术" src="https://gitcode.com/youlai/vue3-element-admin/star/badge.svg"/>
  </a>

</div>

![](https://foruda.gitee.com/images/1708618984641188532/a7cca095_716974.png "rainbow.png")


<div align="center">
  <a target="_blank" href="https://vue.youlai.tech">🖥️ 在线预览</a> |  <a target="_blank" href="https://juejin.cn/post/7228990409909108793">📑 阅读文档</a> | <a href="./README.en-US.md">💬 English
</div>


## 项目简介

[vue3-element-admin](https://gitcode.com/youlai/vue3-element-admin) 基于 Vue3、Vite、TypeScript 和 Element-Plus 搭建的极简开箱即用企业级后台管理前端模板。 （配套 Java 后端 [youlai-boot](https://gitee.com/youlaiorg/youlai-boot) 和 Node 后端 [youlai-nest](https://gitee.com/youlaiorg/youlai-nest)）。


## 项目特色

- **简洁易用**：基于 [vue-element-admin](https://gitee.com/panjiachen/vue-element-admin) 升级的 Vue3 版本，无过渡封装 ，易上手。
- **数据交互**： 支持 `Mock` 数据和[线上接口文档](https://www.apifox.cn/apidoc/shared-195e783f-4d85-4235-a038-eec696de4ea5)，并提供配套的 [Java](https://gitee.com/youlaiorg/youlai-boot) 和 [Node](https://gitee.com/youlaiorg/youlai-nest) 后端源码。

- **系统功能：** 提供用户管理、角色管理、菜单管理、部门管理、字典管理等功能模块。
- **权限管理：** 支持动态路由、按钮权限、角色权限和数据权限等多种权限管理方式。

- **基础设施：** 提供国际化、多布局、暗黑模式、全屏、水印、接口文档和代码生成器等功能。
- **持续更新**：项目持续开源更新，实时更新工具和依赖。


## 项目截图

![](https://www.youlai.tech/storage/blog/2025/01/18/20250118160647.png)

![](https://www.youlai.tech/storage/blog/2025/01/18/20250118183539.png)

## 项目源码

| 项目 | Gitee   | Github    | GitCode|
| ---- | ----| ---- | ---- |
| 前端 | [vue3-element-admin](https://gitee.com/youlaiorg/vue3-element-admin) | [vue3-element-admin](https://github.com/youlaitech/vue3-element-admin) | [vue3-element-admin](https://gitcode.com/youlai/vue3-element-admin) |
| 精简版 | [vue3-element-template](https://gitee.com/youlaiorg/vue3-element-template) | [vue3-element-template](https://github.com/youlaitech/vue3-element-template) |-|
| 后端 | [youlai-boot](https://gitee.com/youlaiorg/youlai-boot)       | [youlai-boot](https://github.com/haoxianrui/youlai-boot.git) |[youlai-boot](https://gitcode.com/youlai/youlai-boot.git)|

## 环境准备

| 环境                 | 名称版本                                                     | 下载地址                                                     |
| -------------------- | :----------------------------------------------------------- | ------------------------------------------------------------ |
| **开发工具**         | VSCode    | [下载](https://code.visualstudio.com/Download)           |
| **运行环境**         | Node ≥18 (其中 20.6.0 版本不可用)    | [下载](http://nodejs.cn/download)                        |


## 项目启动

```bash
# 克隆代码
git clone https://gitee.com/youlaiorg/vue3-element-admin.git

# 切换目录
cd vue3-element-admin

# 安装 pnpm
npm install pnpm -g

# 设置镜像源(可忽略)
pnpm config set registry https://registry.npmmirror.com

# 安装依赖
pnpm install

# 启动运行
pnpm run dev
```



## 项目部署

执行 `pnpm run build` 命令后，项目将被打包并生成 `dist` 目录。接下来，将 `dist` 目录下的文件上传到服务器 `/usr/share/nginx/html` 目录下，并配置 Nginx 进行反向代理。

```bash
pnpm run build
```

以下是 Nginx 的配置示例：

```nginx
server {
    listen      80;
    server_name localhost;

    location / {
        root   /usr/share/nginx/html;
        index  index.html index.htm;
    }

    # 反向代理配置
    location /prod-api/ {
        # 请将 api.youlai.tech 替换为您的后端 API 地址，并注意保留后面的斜杠 /
        proxy_pass http://api.youlai.tech/;
    }
}
```

更多详细信息，请参考这篇文章：[Nginx 安装和配置](https://blog.csdn.net/u013737132/article/details/145667694)。

## 本地Mock

项目同时支持在线和本地 Mock 接口，默认使用线上接口，如需替换为 Mock 接口，修改文件 `.env.development` 的 `VITE_MOCK_DEV_SERVER` 为  `true` **即可**。

## 后端接口

> 如果您具备Java开发基础，按照以下步骤将在线接口转为本地后端接口，创建企业级前后端分离开发环境，助您走向全栈之路。

1. 获取基于 `Java` 和 `SpringBoot` 开发的后端 [youlai-boot](https://gitee.com/youlaiorg/youlai-boot.git) 源码。
2. 根据后端工程的说明文档 [README.md](https://gitee.com/youlaiorg/youlai-boot#%E9%A1%B9%E7%9B%AE%E8%BF%90%E8%A1%8C) 完成本地启动。
3. 修改 `.env.development` 文件中的 `VITE_APP_API_URL` 的值，将其从 https://api.youlai.tech 更改为 http://localhost:8989 即可。


## 注意事项

- **自动导入插件自动生成默认关闭**

  模板项目的组件类型声明已自动生成。如果添加和使用新的组件，请按照图示方法开启自动生成。在自动生成完成后，记得将其设置为 `false`，避免重复执行引发冲突。

  ![](https://foruda.gitee.com/images/1687755823137387608/412ea803_716974.png)

- **项目启动浏览器访问空白**

  请升级浏览器尝试，低版本浏览器内核可能不支持某些新的 JavaScript 语法，比如可选链操作符 `?.`。

- **项目同步仓库更新升级**

  项目同步仓库更新升级之后，建议 `pnpm install` 安装更新依赖之后启动 。

- **项目组件、函数和引用爆红**

	重启 VSCode 尝试

- **其他问题**

  如果有其他问题或者建议，建议 [ISSUE](https://gitee.com/youlaiorg/vue3-element-admin/issues/new)



## 项目文档

- [基于 Vue3 + Vite + TypeScript + Element-Plus 从0到1搭建后台管理系统](https://blog.csdn.net/u013737132/article/details/130191394)
- [ESLint+Prettier+Stylelint+EditorConfig 约束和统一前端代码规范](https://youlai.blog.csdn.net/article/details/145608723)
- [Husky + Lint-staged + Commitlint + Commitizen + cz-git 配置 Git 提交规范](https://youlai.blog.csdn.net/article/details/145615236)


## 提交规范

执行 `pnpm run commit` 唤起 git commit 交互，根据提示完成信息的输入和选择。

![](https://foruda.gitee.com/images/1687755823165218215/c1705416_716974.png)


## 项目统计

![](https://repobeats.axiom.co/api/embed/aa7cca3d6fa9c308fc659fa6e09af9a1910506c3.svg "Repobeats analytics image")


Thanks to all the contributors!

[![contributors](https://contrib.rocks/image?repo=youlaitech/vue3-element-admin)](https://github.com/youlaitech/vue3-element-admin/graphs/contributors)

## G-Star

![](https://foruda.gitee.com/images/1728577513089814203/95f2a70d_716974.jpeg)

## 加群交流

> **关注「有来技术」公众号，点击菜单“交流群”获取加群二维码。**
>
> 如果二维码过期，请加微信(haoxianrui)备注「前端」、「后端」或「全栈」拉你进群。
>
> 交流群仅限技术交流，为过滤广告营销暂设此门槛，感谢理解与配合

![有来技术公众号二维码](https://foruda.gitee.com/images/1737108820762592766/3390ed0d_716974.png)

