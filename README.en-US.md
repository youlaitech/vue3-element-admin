<div align="center">

<img alt="logo" width="40" valign="middle" src="./src/assets/images/logo.png"> vue3-element-admin

**Vue3 + Vite + TypeScript Enterprise Admin Frontend**

[![Vue](https://img.shields.io/badge/Vue-3.5.30-brightgreen.svg)](https://vuejs.org/)
[![Element Plus](https://img.shields.io/badge/Element%20Plus-2.13.6-blue.svg)](https://element-plus.org/)
[![Gitee Star](https://gitee.com/youlaiorg/vue3-element-admin/badge/star.svg)](https://gitee.com/youlaiorg/vue3-element-admin/stargazers)
[![GitHub Star](https://img.shields.io/github/stars/youlaitech/vue3-element-admin?style=social)](https://github.com/youlaitech/vue3-element-admin)
[![GitCode Star](https://gitcode.com/youlai/vue3-element-admin/star/badge.svg)](https://gitcode.com/youlai/vue3-element-admin/stargazers)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

![](https://foruda.gitee.com/images/1708618984641188532/a7cca095_716974.png "rainbow.png")

<div align="center">

[![Online Preview](https://img.shields.io/badge/Online%20Preview-2D8CF0?style=for-the-badge&logo=google-chrome&logoColor=white)](https://vue.youlai.tech)
[![Mobile Preview](https://img.shields.io/badge/Mobile%20Preview-19BE6B?style=for-the-badge&logo=android&logoColor=white)](https://app.youlai.tech)
[![Documentation](https://img.shields.io/badge/Documentation-8B5CF6?style=for-the-badge&logo=gitbook&logoColor=white)](https://www.youlai.tech/docs/web/)
[![Official Site](https://img.shields.io/badge/Official%20Site-FF9F1C?style=for-the-badge&logo=safari&logoColor=white)](https://www.youlai.tech/docs/web/)
[![中文](https://img.shields.io/badge/中文-00B4D8?style=for-the-badge&logo=google-translate&logoColor=white)](./README.md)

</div>

## Introduction

[vue3-element-admin](https://gitcode.com/youlai/vue3-element-admin) is an enterprise-level admin frontend built with Vue 3, Vite, TypeScript, and Element Plus, paired with [9 mainstream backends + derivatives](#ecosystem) (covering Java / Node.js / Go / Python / PHP / C# / Rust 7 languages) and the mobile app [youlai-app](https://gitee.com/youlaiorg/youlai-app). Other frontend versions: [JavaScript](https://gitee.com/youlaiorg/vue3-element-admin-js) · [Lite](https://gitee.com/youlaiorg/vue3-element-template) · [NaiveUI](https://gitee.com/youlaiorg/vue3-naiveui-admin).

## Project Features

- **Simple and Easy-to-use** — A Vue3 upgrade of [vue-element-admin](https://gitee.com/panjiachen/vue-element-admin) with no over-encapsulation, easy to get started.
- **Permission System** — Dynamic routing, button permissions, role permissions, and data permissions.
- **Multi-tenant** — Supports multi-tenant mode and tenant isolation.
- **Infrastructure** — Internationalization, multiple layouts, dark mode, full screen, watermark, API documentation, and code generator.
- **Data Interaction** — Supports Mock data and online API documentation, with accompanying Java / Node backend source code.
- **Continuous Updates** — The project is continuously open-sourced and updated, keeping pace with the mainstream tech stack.

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

## Quick Start

**Environment Requirements**: Node.js `^20.19.0` or `>=22.12.0` · pnpm `>=8.0.0`

| Environment Type | Version Requirement | Notes |
| -------- | -------- | ---- |
| **Node.js** | `^20.19.0` or `>=22.12.0` | LTS is recommended (even major versions) |
| **Package Manager** | `pnpm >= 8.0.0` | This project uses pnpm as the package manager |
| **IDE** | [Visual Studio Code](https://code.visualstudio.com/Download) | Vue and TypeScript extensions recommended |

```bash
# Clone repository
git clone https://gitee.com/youlaiorg/vue3-element-admin.git
cd vue3-element-admin

# Install pnpm (skip if already installed)
npm install pnpm -g

# Set mirror source (optional)
pnpm config set registry https://registry.npmmirror.com

# Install dependencies
pnpm install

# Start development server
pnpm run dev
```

After starting, visit http://localhost:3000 and log in with `admin` / `123456`.

> For more, see the official docs: [Quick Start](https://www.youlai.tech/docs/web/) · [Deployment Guide](https://www.youlai.tech/docs/web/deployment/deploy.html)

## AI Programming

This project ships with an [Agent Skill](https://skills.sh/youlaitech/youlai-skills). Once installed, the AI coding assistant automatically follows this project's Vue3 development conventions (naming, directory structure, BEM + UnoCSS, component and API conventions). It supports 70+ agents including CodeBuddy, Claude Code, Cursor, Codex, and GitHub Copilot.

```bash
npx skills add https://github.com/youlaitech/youlai-skills --skill vue
```

## Ecosystem Matrix

**Frontend**

| Project | Tech Stack | Description | Status |
|:-----|:-------|:-----|:---------|
| [vue3-element-admin](https://gitee.com/youlaiorg/vue3-element-admin) | Vue 3 + Vite + TS + Element Plus | PC Admin (Main) | ✅️ |
| [vue3-element-admin-js](https://gitee.com/youlaiorg/vue3-element-admin-js) | Vue 3 + Vite + JS + Element Plus | JavaScript Version | ✅️ |
| [vue3-element-template](https://gitee.com/youlaiorg/vue3-element-template) | Vue 3 + Vite + TS + Element Plus | Lite Template | ✅️ |
| [vue3-naiveui-admin](https://gitee.com/youlaiorg/vue3-naiveui-admin) | Vue 3 + Vite + TS + Naive UI | Naive UI Version | ✅️ |
| [youlai-app](https://gitee.com/youlaiorg/youlai-app) | Vue 3 + UniApp | Mobile App | ✅️ |

**Backend**

| Project | Tech Stack | Description | Status |
|:-----|:-------|:-----|:---------|
| [youlai-boot](https://gitee.com/youlaiorg/youlai-boot) | Spring Boot + MyBatis-Plus | Java (Main) | ✅️ |
| [youlai-nest](https://gitee.com/youlaiorg/youlai-nest) | NestJS + TypeORM | Node.js | ✅️ |
| [youlai-gin](https://gitee.com/youlaiorg/youlai-gin) | Go + Gorm | Go | ✅️ |
| [youlai-django](https://gitee.com/youlaiorg/youlai-django) | Django + DRF | Python | ✅️ |
| [youlai-fastapi](https://gitee.com/youlaiorg/youlai-fastapi) | FastAPI + SQLAlchemy | Python | ✅️ |
| [youlai-laravel](https://gitee.com/youlaiorg/youlai-laravel) | Laravel + Eloquent | PHP | ✅️ |
| [youlai-think](https://gitee.com/youlaiorg/youlai-think) | ThinkPHP + ThinkORM | PHP | ✅️ |
| [youlai-aspnet](https://gitee.com/youlaiorg/youlai-aspnet) | ASP.NET Core + EF Core | C# | ✅️ |
| [youlai-axum](https://gitee.com/youlaiorg/youlai-axum) | Axum + SeaORM | Rust | ✅️ |

> All nine backends share the same **RESTful API** and **database schema**, frontends can switch seamlessly.

**Derivatives**

| Project | Based On | Type | Description | Status |
|:-----|:-----|:-----|:-----|:---------|
| [youlai-boot-tenant](https://gitee.com/youlaiorg/youlai-boot-tenant) | youlai-boot | Repo | Multi-tenant SaaS, tenant isolation and tenant config | ✅️ |
| [youlai-nest (multi-tenant)](https://gitee.com/youlaiorg/youlai-nest/tree/multi-tenant) | youlai-nest | Branch | Multi-tenant SaaS, tenant isolation and tenant config | ✅️ |
| [youlai-boot-flex](https://gitee.com/youlaiorg/youlai-boot-flex) | youlai-boot | Repo | Switched to MyBatis-Flex | ✅️ |
| [youlai-boot (db-pg)](https://gitee.com/youlaiorg/youlai-boot/tree/db-pg) | youlai-boot | Branch | PostgreSQL database branch | ✅️ |
| [youlai-boot (multi-module)](https://gitee.com/youlaiorg/youlai-boot/tree/multi-module) | youlai-boot | Branch | Multi-module project split | ✅️ |
| [youlai-boot (spring-boot-3)](https://gitee.com/youlaiorg/youlai-boot/tree/spring-boot-3) | youlai-boot | Branch | Spring Boot 3 compatible branch | ✅️ |

## Development Guide

| Name | Link |
| -------- | -------- |
| Video Tutorial | [https://www.bilibili.com/video/BV1eFUuYyEFj](https://www.bilibili.com/video/BV1eFUuYyEFj) |
| Project Setup | [Building a Backend Management System from Scratch with Vue3, Vite, TypeScript, and Element-Plus](https://blog.csdn.net/u013737132/article/details/130191394) |
| Official Documentation | [https://www.youlai.tech/docs/web/](https://www.youlai.tech/docs/web/) |
| Deployment Guide | [https://www.youlai.tech/docs/web/deployment/deploy.html](https://www.youlai.tech/docs/web/deployment/deploy.html) |
| FAQ | [https://www.youlai.tech/docs/faq/](https://www.youlai.tech/docs/faq/) |
| Code Standards | [ESLint V9 + Prettier + Stylelint + EditorConfig for Standardized and Unified Frontend Code Style](https://youlai.blog.csdn.net/article/details/145608723) |
| Commit Standards | [Husky + Lint-staged + Commitlint + Commitizen + cz-git for Git Commit Standards](https://youlai.blog.csdn.net/article/details/145615236) |
| API Documentation | [https://www.apifox.cn](https://www.apifox.cn/apidoc/shared-195e783f-4d85-4235-a038-eec696de4ea5) |

## Project Deployment

Run `pnpm run build` to bundle and generate the `dist` directory, upload it to the server and configure Nginx reverse proxy.

```bash
pnpm run build
```

For the detailed deployment flow (Nginx config, reverse proxy, HTTPS, etc.), see the [Deployment Guide](https://www.youlai.tech/docs/web/deployment/deploy.html).

## Data Interface

The frontend uses the online API by default, and can also switch to local Mock or connect to a local backend.

**Local Mock**: Set `VITE_MOCK_DEV_SERVER` in `.env.development` to `true` to enable local Mock interfaces, allowing standalone development without a backend.

**Connect to Backend**: All nine backends use the default port `8000`. Change `VITE_APP_API_URL` in `.env.development` to `http://localhost:8000` and start the corresponding backend (the recommended Java backend is [youlai-boot](https://gitee.com/youlaiorg/youlai-boot.git); see each repo's README for the rest).

## Commit Conventions

Run `pnpm run commit` to invoke the interactive git commit and complete the information input and selection according to the prompts.

![](https://foruda.gitee.com/images/1687755823165218215/c1705416_716974.png)

## Technical Cooperation

This project is open-sourced under the [MIT](LICENSE) license and free for commercial use. Feel free to submit issues or feedback in [Issue](https://gitee.com/youlaiorg/vue3-element-admin/issues), and pull requests in [Pull Request](https://gitee.com/youlaiorg/vue3-element-admin/pulls) are also welcome. For technical support, business cooperation, secondary development, or project customization, contact the author via WeChat (see QR code below).

<table align="center">
  <tr>
    <td align="center">
      <img src="./public/images/qrcode/wechat-official.jpg" height="180" alt="WeChat Official Account"><br>
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
