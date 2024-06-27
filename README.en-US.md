<div align="center">
    <img src="https://img.shields.io/badge/Vue-3.4.29-brightgreen.svg"/>
    <img src="https://img.shields.io/badge/Vite-5.3.1-green.svg"/>
    <img src="https://img.shields.io/badge/Element Plus-2.7.5-blue.svg"/>
    <img src="https://img.shields.io/badge/license-MIT-green.svg"/>
    <a href="https://gitee.com/youlaiorg" target="_blank">
        <img src="https://img.shields.io/badge/Author-有来开源组织-orange.svg"/>
    </a>
    <div align="center"> 中文 | <a href="./README.en-US.md">English</div>
</div>


![](https://foruda.gitee.com/images/1708618984641188532/a7cca095_716974.png "rainbow.png")

<div align="center">
 <a target="_blank" href="http://vue3.youlai.tech">👀 Live Preview</a> |  <a target="_blank" href="https://juejin.cn/post/7228990409909108793">📖 Read Documentation</a>  
</div>


## Introduction

[vue3-element-admin](https://gitee.com/youlaiorg/vue3-element-admin) is a free and open-source admin template for backend management frontend, built with popular technologies such as Vue3, Vite5, TypeScript, Element-Plus, and Pinia (with accompanying [backend source code](https://gitee.com/youlaiorg/youlai-boot)).




## Project Features

- **Simple and Easy-to-use**: Upgraded version of [vue-element-admin](https://gitee.com/panjiachen/vue-element-admin) for Vue3, with minimal encapsulation and easy to get started.

- **Data Interaction**: Support both local `Mock` data and remote API. Comes with [Java backend source code](https://gitee.com/youlaiorg/youlai-boot) and online API documentation.

- **Permission Management**: Complete permission system for users, roles, menus, dictionaries, and departments.

- **Essential Infrastructure**: Dynamic routing, button permissions, internationalization, code style, Git commit conventions, and common component encapsulation.

- **Continuous Updates**: Since 2021, the project has maintained an open-source status with continuous updates, integrating new tools and dependencies in real time, and has accumulated a broad user base.

## Project Preview

![Light Mode](https://foruda.gitee.com/images/1709651876583793739/0ba1ee1c_716974.png)

![Dark Mode](https://foruda.gitee.com/images/1709651875494206224/2a2b0b53_716974.png)

![API Documentation](https://foruda.gitee.com/images/1687755822857820115/96054330_716974.png)

## Project Links

| Project | Gitee                                                        | Github                                                       | GitCode                                                      |
| ---- | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| Frontend | [vue3-element-admin](https://gitee.com/youlaiorg/vue3-element-admin) | [vue3-element-admin](https://github.com/youlaitech/vue3-element-admin) | [vue3-element-admin](https://gitcode.net/youlai/vue3-element-admin) |
| Backend | [youlai-boot](https://gitee.com/youlaiorg/youlai-boot)       | [youlai-boot](https://github.com/haoxianrui/youlai-boot.git) | [youlai-boot](https://gitcode.net/youlai/youlai-boot)        |

## Environment Setup

| Environment         | Name and Version                                             | Download Link                                               |
| -------------------- | :----------------------------------------------------------- | ------------------------------------------------------------ |
| **Development Tool** | VSCode                                                       | [Download](https://code.visualstudio.com/Download)           |
| **Runtime Environment** | Node ≥18                                                    | [Download](http://nodejs.cn/download)                        |


## Project Setup

```bash
# Clone the repository
git clone https://gitee.com/youlaiorg/vue3-element-admin.git

# Change directory
cd vue3-element-admin

# Install pnpm
npm install pnpm -g

# Install dependencies
pnpm install

# Start the project
pnpm run dev
```

## Project Deployment

```bash
# Build the project
pnpm run build

# Upload files to the remote server
Copy the files generated in the `dist` directory to the `/usr/share/nginx/html` directory.

# nginx.cofig configuration
server {
	listen     80;
	server_name  localhost;
	location / {
			root /usr/share/nginx/html;
			index index.html index.htm;
	}
	# Reverse proxy configuration
	location /prod-api/ {
			proxy_pass http://vapi.youlai.tech/; # Replace vapi.youlai.tech with your backend API address
	}
}
```

## Local Mock

The project supports both online API and local mock API. By default, it uses the online API. If you want to switch to the mock API, modify the value of `VITE_MOCK_DEV_SERVER` in the `.env.development` file to `true`.

## Backend API

> If you have a basic understanding of Java development, follow these steps to convert online API to local backend API and set up a full-stack development environment.

1. Get the backend source code based on `Java` and `SpringBoot` from [youlai-boot](https://gitee.com/youlaiorg/youlai-boot.git).
2. Follow the instructions in the backend project's README.md to set up the local environment.
3. Modify the value of `VITE_APP_API_URL` in the `.env.development` file to `http://localhost:8989`, replacing it with the backend API URL.

## Notes

- **Auto import plugin is disabled by default**

  Component type declarations have been automatically generated for the template project. If you add and use new components, follow the instructions in the screenshot to enable automatic generation. After automatic generation is complete, remember to set it back to `false` to avoid conflicts.

  ![](https://foruda.gitee.com/images/1687755823137387608/412ea803_716974.png)

- **Blank page when accessing the project**

  Try upgrading your browser, as older browser engines may not support certain new JavaScript syntax, such as optional chaining operator `?.`.

- **Red highlight on project components, functions, and imports**

  Restart VSCode to try again.

- **Other issues**

  If you have any other issues or suggestions, please open an [issue](https://gitee.com/youlaiorg/vue3-element-admin/issues/new).

## Project Documentation

- [Building a Backend Management System from Scratch with Vue3, Vite, TypeScript, and Element-Plus](https://blog.csdn.net/u013737132/article/details/130191394)

- [ESLint+Prettier+Stylelint+EditorConfig for Standardized and Unified Frontend Code Style](https://blog.csdn.net/u013737132/article/details/130190788)
- [Git Commit Conventions with Husky, Lint-staged, Commitlint, Commitizen, and cz-git](https://blog.csdn.net/u013737132/article/details/130191363)

## Commit Conventions

Execute `pnpm run commit` to invoke interactive git commit and complete the information input and selection according to the prompts.

![](https://foruda.gitee.com/images/1687755823165218215/c1705416_716974.png)

## Community 🚀

> **Follow "Youlai Tech" WeChat Official Account to get the QR code for the community.**
>
> If the QR code for the community has expired, please add my WeChat (haoxianrui) and indicate whether you are interested in "Frontend", "Backend", or "Full Stack" to get the latest QR code.
>
> This measure is taken to ensure the quality of the community and prevent marketing advertising from infiltrating. Thank you for your understanding!

| Official Account | Community |
|:----:|:----:|
| ![Youlai Tech WeChat Official Account QR Code](https://foruda.gitee.com/images/1687689212187063809/3c69eaee_716974.png) | ![Community QR Code](https://foruda.gitee.com/images/1687689212139273561/6a65ef69_716974.png) |

