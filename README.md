<p align="center">
    <img src="https://img.shields.io/badge/Vue-3.3.1-brightgreen.svg"/>
    <img src="https://img.shields.io/badge/Vite-4.3.5-green.svg"/>
    <img src="https://img.shields.io/badge/Element Plus-2.3.4-blue.svg"/>
    <img src="https://img.shields.io/badge/license-MIT-green.svg"/>
    <a href="https://gitee.com/youlaiorg" target="_blank">
        <img src="https://img.shields.io/badge/Author-有来开源组织-orange.svg"/>
    </a>
</p>
<p align="center">
 <a target="_blank" href="https://juejin.cn/post/7228990409909108793">vue3-element-admin官方文档</a> |  <a target="_blank" href="http://vue3.youlai.tech">在线预览</a> 
</p>

## 项目介绍

[vue3-element-admin](https://gitee.com/youlaiorg/vue3-element-admin) 是基于 Vue3 + Vite4+ TypeScript5 + Element-Plus + Pinia 等技术栈构建的后台管理前端模板（配套后端源码）。

## 项目特色

- 基于 `vue-element-admin` 升级的 `Vue3` 版本，主流技术栈，无过度自定义封装，极易上手，减少学习成本；
- 配套 `Java` 后台接口，非 `Mock` 数据，[在线接口文档](https://www.apifox.cn/apidoc/shared-195e783f-4d85-4235-a038-eec696de4ea5/api-65851240)；
- 系统功能：用户、角色、菜单、字典管和部门管理等；
- 基础设施：动态路由，按钮权限，常用组件封装。


## 项目预览

- **在线预览地址**： [https://vue3.youlai.tech/](https://vue3.youlai.tech/)

- **控制台**
![暗黑模式](https://s2.loli.net/2023/03/13/QvjY4zf3VCGteNF.png)

- **接口文档**
![接口文档](https://s2.loli.net/2023/03/13/bH4J3O6WRgCUpwt.png) 


- **权限管理系统**
| ![用户管理](https://s2.loli.net/2023/03/13/L9xgT5sSMVZukQj.png) | ![image-20230313003008012](https://s2.loli.net/2023/03/13/nQg6HmrtFUkPDYv.png) |
| --- | --- |
| ![image-20230313003028425](https://s2.loli.net/2023/03/13/C4fDRJeTuUO7gPI.png) | ![字典管理](https://s2.loli.net/2023/03/13/BzqjHpa64wfeWhE.png) |

## 项目地址

| 项目 | Gitee | Github |GitCode |
| --- | --- | --- | --- |
| 前端 | [vue3-element-admin](https://gitee.com/youlaiorg/vue3-element-admin) | [vue3-element-admin](https://github.com/youlaitech/vue3-element-admin) |[vue3-element-admin](https://gitcode.net/youlai/vue3-element-admin)|
| 后端 | [youlai-boot](https://gitee.com/youlaiorg/youlai-boot) | [youlai-boot](https://github.com/hxrui/youlai-boot.git) |[youlai-boot](https://gitcode.net/youlai/youlai-boot)|

## 环境准备

|     环境     | 名称版本    | 备注            |
| ----------- | :-------- | --------------|
| **开发工具**         | VSCode       | [下载地址](https://code.visualstudio.com/Download)                                                            |
| **运行环境**         | Node 16+                 |  [下载地址](http://nodejs.cn/download)   |
| **VSCode插件(必装)** | 1. `Vue Language Features (Volar) ` <br/> 2. `TypeScript Vue Plugin (Volar) `  <br/>3. 禁用 Vetur | ![image-20230224222541797](https://s2.loli.net/2023/02/24/Qt4XDGHFOWqfsyB.png) |


## 项目启动

```bash
# 克隆代码
git clone https://gitee.com/youlaiorg/vue3-element-admin.git

# 安装 pnpm
npm install pnpm -g

# 安装依赖
pnpm install

# 启动运行
pnpm run dev
```

## 项目部署

```bash
# 项目打包
pnpm run build:prod

# 上传文件至远程服务器
将打包生成在 `dist` 目录下的文件拷贝至 `/usr/share/nginx/html` 目录

# nginx.cofig 配置
server {
	listen     80;
	server_name  localhost;
	location / {
			root /usr/share/nginx/html;
			index index.html index.htm;
	}
	# 反向代理配置
	location /prod-api/ {
			proxy_pass http://vapi.youlai.tech/; # vapi.youlai.tech替换成你的后端API地址
	}
}
``` 


## 接口支持

- **接口调用地址**：[https://vapi.youlai.tech](https://vapi.youlai.tech)
- **接口文档地址**：[在线接口文档](https://www.apifox.cn/apidoc/shared-195e783f-4d85-4235-a038-eec696de4ea5)
- **OpenAPI文档地址**：[http://vapi.youlai.tech/v3/api-docs](http://vapi.youlai.tech/v3/api-docs)
- **本地接口**：默认使用线上接口，你可以通过以下步骤完成本地接口环境搭建：

	> 1. 获取基于 `Java 、SpringBoot` 开发的后端 [youlai-boot](https://gitee.com/youlaiorg/youlai-boot.git) 源码 ;
	>	2. 根据后端工程说明文档 [README.md](https://gitee.com/youlaiorg/youlai-boot#%E9%A1%B9%E7%9B%AE%E8%BF%90%E8%A1%8C) 完成本地启动; 
	> 3. 替换 [vite.config.ts](vite.config.ts) 的代理目标地址 [vapi.youlai.tech](vapi.youlai.tech) 为本地的 [localhost:8989](localhost:8989).



## 项目文档

- [基于 Vue3 + Vite4 + TypeScript + Element-Plus 从0到1搭建后台管理系统](https://blog.csdn.net/u013737132/article/details/130191394)

- [ESLint+Prettier+Stylelint+EditorConfig 约束和统一前端代码规范](https://blog.csdn.net/u013737132/article/details/130190788)
- [Husky + Lint-staged + Commitlint + Commitizen + cz-git 配置 Git 提交规范](https://blog.csdn.net/u013737132/article/details/130191363)


## Git 提交规范

执行唤起 git commit 交互，根据提示完成信息的输入和选择。

![](https://oss.youlai.tech/youlai-boot/2023/05/21/d9863c6ded9e4363824b0d8c4c1f0642.png)


## 联系我们

> 如果交流群的二维码已过期，请加我微信，备注「前端」或「全栈」，我将邀请您加入相应的群组。

![](https://oss.youlai.tech/youlai-boot/2023/05/21/dc20acb05acf4e2d875de5a786e55f51.jpg)


