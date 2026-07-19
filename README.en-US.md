<div align="center">

<img alt="vue3-element-admin" width="80" src="./src/assets/images/logo.png">

# vue3-element-admin

**Vue3 + Vite + TypeScript Enterprise Admin Frontend**

[![Vue](https://img.shields.io/badge/Vue-3.5.22-brightgreen.svg)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.3.0-green.svg)](https://vitejs.dev/)
[![Element Plus](https://img.shields.io/badge/Element%20Plus-2.3.2-blue.svg)](https://element-plus.org/)
[![Gitee Star](https://gitee.com/youlaiorg/vue3-element-admin/badge/star.svg)](https://gitee.com/youlaiorg/vue3-element-admin/stargazers)
[![GitHub Star](https://img.shields.io/github/stars/youlaitech/vue3-element-admin?style=social)](https://github.com/youlaitech/vue3-element-admin)
[![GitCode Star](https://gitcode.com/youlai/vue3-element-admin/star/badge.svg)](https://gitcode.com/youlai/vue3-element-admin/stargazers)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

![](https://foruda.gitee.com/images/1708618984641188532/a7cca095_716974.png "rainbow.png")

<div align="center">

[🖥️ Live Preview](https://vue.youlai.tech) | [� Mobile Preview](https://app.youlai.tech) | [� Documentation](https://www.youlai.tech/vue3-element-admin) | [💬 中文](README.md)

</div>

## Introduction

[vue3-element-admin](https://gitcode.com/youlai/vue3-element-admin) is a minimalist enterprise-level admin frontend template built with Vue3, Vite7, TypeScript, and Element-Plus. It comes with a Java backend [youlai-boot](https://gitee.com/youlaiorg/youlai-boot), a multi-tenant Java backend [youlai-boot-tenant](https://gitee.com/youlaiorg/youlai-boot-tenant), and a Node backend [youlai-nest](https://gitee.com/youlaiorg/youlai-nest). A simplified version [vue3-element-template](https://gitee.com/youlaiorg/vue3-element-template) and a JavaScript version [vue3-element-admin-js](https://gitee.com/youlaiorg/vue3-element-admin) are also available.

## Project Features

- **Simple and Easy-to-use**: Upgraded version of [vue-element-admin](https://gitee.com/panjiachen/vue-element-admin) for Vue3, with minimal encapsulation and easy to get started.
- **Data Interaction**: Support for `Mock` data and [online API documentation](https://www.apifox.cn/apidoc/shared-195e783f-4d85-4235-a038-eec696de4ea5), with accompanying [Java](https://gitee.com/youlaiorg/youlai-boot) and [Node](https://gitee.com/youlaiorg/youlai-nest) backend source code.

- **System Functions**: Provides user management, role management, menu management, department management, dictionary management, and other functional modules.
- **Permission Management**: Supports dynamic routing, button permissions, role permissions, and data permissions.

- **Multi-tenant**: Supports multi-tenant mode and tenant isolation.

- **Infrastructure**: Provides internationalization, multiple layouts, dark mode, full screen, watermark, API documentation, and code generator functionality.
- **Continuous Updates**: Project is continuously updated with real-time updates of tools and dependencies.

## System Preview

**PC**

<table align="center">
  <tr>
    <td><img alt="PC Preview 1" width="400" src="./public/images/preview/pc-01.png"></td>
    <td><img alt="PC Preview 2" width="400" src="./public/images/preview/pc-02.png"></td>
  </tr>
  <tr>
    <td><img alt="PC Preview 3" width="400" src="./public/images/preview/pc-03.png"></td>
    <td><img alt="PC Preview 4" width="400" src="./public/images/preview/pc-04.png"></td>
  </tr>
  <tr>
    <td><img alt="PC Preview 5" width="400" src="./public/images/preview/pc-05.png"></td>
    <td><img alt="PC Preview 6" width="400" src="./public/images/preview/pc-06.png"></td>
  </tr>
</table>

**Mobile**

<table align="center">
  <tr>
    <td><img alt="APP Preview 1" width="200" src="./public/images/preview/app-01.png"></td>
    <td><img alt="APP Preview 2" width="200" src="./public/images/preview/app-02.png"></td>
    <td><img alt="APP Preview 3" width="200" src="./public/images/preview/app-03.png"></td>
    <td><img alt="APP Preview 4" width="200" src="./public/images/preview/app-04.png"></td>
  </tr>
</table>

## Ecosystem

**Frontend**

| Project | Tech Stack | Description |
|:-----|:-------|:-----|
| [vue3-element-admin](https://gitee.com/youlaiorg/vue3-element-admin) | Vue 3 + Vite + TS + Element Plus | PC Admin (Main) |
| [vue3-element-admin-js](https://gitee.com/youlaiorg/vue3-element-admin-js) | Vue 3 + Vite + JS + Element Plus | JavaScript Version |
| [vue3-element-template](https://gitee.com/youlaiorg/vue3-element-template) | Vue 3 + Vite + TS + Element Plus | Lite Template |
| [youlai-app](https://gitee.com/youlaiorg/youlai-app) | Vue 3 + UniApp | Mobile App |

**Backend**

| Project | Tech Stack | Description |
|:-----|:-------|:-----|
| [youlai-boot](https://gitee.com/youlaiorg/youlai-boot) | Spring Boot 4 + MyBatis-Plus | Java (recommended) |
| [youlai-nest](https://gitee.com/youlaiorg/youlai-nest) | NestJS + TypeORM | Node.js |
| [youlai-gin](https://gitee.com/youlaiorg/youlai-gin) | Go + Gorm | Go |
| [youlai-django](https://gitee.com/youlaiorg/youlai-django) | Django + DRF | Python |
| [youlai-fastapi](https://gitee.com/youlaiorg/youlai-fastapi) | FastAPI + SQLAlchemy | Python |
| [youlai-think](https://gitee.com/youlaiorg/youlai-think) | ThinkPHP 8 | PHP |
| [youlai-aspnet](https://gitee.com/youlaiorg/youlai-aspnet) | ASP.NET Core | C# |
| [youlai-axum](https://gitee.com/youlaiorg/youlai-axum) | Axum + SeaORM | Rust |
> **youlai-boot** also provides variants: [Multi-tenant](https://gitee.com/youlaiorg/youlai-boot-tenant) · [MyBatis-Flex](https://gitee.com/youlaiorg/youlai-boot-flex) · [Spring Boot 3](https://gitee.com/youlaiorg/youlai-boot/tree/spring-boot-3) · [PostgreSQL](https://gitee.com/youlaiorg/youlai-boot/tree/db-pg) · [Multi-module](https://gitee.com/youlaiorg/youlai-boot/tree/multi-module)
>
> All eight backends share the same **RESTful API** and **database schema**, frontends can switch seamlessly.

## Development Guide

| Name                   | Link                                                                                                                                                          |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Video Tutorial         | [https://www.bilibili.com/video/BV1eFUuYyEFj](https://www.bilibili.com/video/BV1eFUuYyEFj)                                                                    |
| Project Setup          | [Building a Backend Management System from Scratch with Vue3, Vite, TypeScript, and Element-Plus](https://blog.csdn.net/u013737132/article/details/130191394) |
| Official Documentation | [https://www.youlai.tech/vue3-element-admin/](https://www.youlai.tech/vue3-element-admin/)                                                                    |
| Code Standards         | [ESLint V9 + Prettier + Stylelint + EditorConfig for Standardized and Unified Frontend Code Style](https://youlai.blog.csdn.net/article/details/145608723)    |
| Commit Standards       | [Husky + Lint-staged + Commitlint + Commitizen + cz-git for Git Commit Standards](https://youlai.blog.csdn.net/article/details/145615236)                     |
| API Documentation      | [https://www.apifox.cn/apidoc/shared-195e783f-4d85-4235-a038-eec696de4ea5](https://www.apifox.cn/apidoc/shared-195e783f-4d85-4235-a038-eec696de4ea5)          |

## Project Setup

- **Environment Preparation**

| Type                | Requirement                                                  | Notes                                    |
| ------------------- | ------------------------------------------------------------ | ---------------------------------------- |
| **Node.js**         | `^20.19.0` or `>=22.12.0`                                    | LTS is recommended (even major versions) |
| **Package Manager** | `pnpm >= 8.0.0`                                              | This project uses pnpm                   |
| **IDE**             | [Visual Studio Code](https://code.visualstudio.com/Download) | Recommended Vue/TypeScript extensions    |

- **Quick Start**

```bash
# Clone repository
git clone https://gitee.com/youlaiorg/vue3-element-admin.git

# Change directory
cd vue3-element-admin

# Install pnpm
npm install pnpm -g

# Set mirror source (optional)
pnpm config set registry https://registry.npmmirror.com

# Install dependencies
pnpm install

# Start development server
pnpm run dev
```

## Project Deployment

After executing the `pnpm run build` command, the project will be bundled and a `dist` directory will be generated. Next, upload the files from the `dist` directory to the `/usr/share/nginx/html` directory on your server and configure Nginx for reverse proxy.

```bash
pnpm run build
```

Here is an example Nginx configuration:

```nginx
server {
    listen      80;
    server_name localhost;

    location / {
        root   /usr/share/nginx/html;
        index  index.html index.htm;
    }

    # Reverse proxy configuration
    location /prod-api/ {
        # Please replace api.youlai.tech with your backend API address, and keep the trailing slash /
        proxy_pass http://api.youlai.tech/;
    }
}
```

For more detailed information, please refer to this article: [Nginx Installation and Configuration](https://blog.csdn.net/u013737132/article/details/145667694).

## Local Mock

The project supports both online and local Mock interfaces. By default, it uses online interfaces. To switch to Mock interfaces, modify the `VITE_MOCK_DEV_SERVER` value in the `.env.development` file to `true`.

## Backend API

> If you have a basic understanding of Java development, follow these steps to convert online API to local backend API and create an enterprise-level full-stack development environment to help you on your full-stack journey.

1. Get the backend source code based on `Java` and `SpringBoot` from [youlai-boot](https://gitee.com/youlaiorg/youlai-boot.git).
2. Follow the instructions in the backend project's README.md to [set up and run locally](https://gitee.com/youlaiorg/youlai-boot#%E9%A1%B9%E7%9B%AE%E8%BF%90%E8%A1%8C).
3. Modify the value of `VITE_APP_API_URL` in the `.env.development` file, changing it from https://api.youlai.tech to http://localhost:8989.

## Notes

- **Auto import plugin is disabled by default**

  Component type declarations have been automatically generated for the template project. If you add and use new components, follow the instructions in the screenshot to enable automatic generation. After automatic generation is complete, remember to set it back to `false` to avoid conflicts.

  ![](https://foruda.gitee.com/images/1687755823137387608/412ea803_716974.png)

- **Blank page when accessing the project**

  Try upgrading your browser, as older browser engines may not support certain new JavaScript syntax, such as optional chaining operator `?.`.

- **Project synchronization with repository updates**

  After synchronizing the project with repository updates, it is recommended to run `pnpm install` to update dependencies before starting.

- **Red highlight on project components, functions, and imports**

  Restart VSCode to try again.

- **Other issues**

  If you have any other issues or suggestions, please open an [ISSUE](https://gitee.com/youlaiorg/vue3-element-admin/issues/new).

## Commit Conventions

Execute `pnpm run commit` to invoke interactive git commit and complete the information input and selection according to the prompts.

![](https://foruda.gitee.com/images/1687755823165218215/c1705416_716974.png)

## Project Statistics

![](https://repobeats.axiom.co/api/embed/aa7cca3d6fa9c308fc659fa6e09af9a1910506c3.svg "Repobeats analytics image")

Thanks to all the contributors!
感谢所有的贡献者！

[![contributors](https://contrib.rocks/image?repo=youlaitech/vue3-element-admin)](https://github.com/youlaitech/vue3-element-admin/graphs/contributors)

---

<table align="center">
  <tr>
    <td align="center">
      <img src="./public/images/qrcode/wechat-official.png" height="180" alt="WeChat Official Account"><br>
      <sub>WeChat Official Account</sub>
    </td>
    <td>&nbsp;&nbsp;&nbsp;&nbsp;</td>
    <td align="center">
      <img src="./public/images/qrcode/wechat-mp.jpg" height="180" alt="Mini Program"><br>
      <sub>Mini Program</sub>
    </td>
    <td>&nbsp;&nbsp;&nbsp;&nbsp;</td>
    <td align="center">
      <img src="./public/images/qrcode/wechat-personal.png" height="180" alt="Add Author WeChat"><br>
      <sub>Add Author WeChat</sub>
    </td>
  </tr>
</table>

<p align="center"><em>Technical Exchange · Issue Feedback · Business Cooperation</em></p>

## License

[MIT](LICENSE)
