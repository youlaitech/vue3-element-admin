/* eslint-disable no-console */
/**
 * 部署管理后台到服务器 | 用法：pnpm run deploy
 *
 * 前置：SSH 免密登录（只需一次）
 *   1. 如果 %USERPROFILE%\.ssh\id_rsa 已存在跳过，否则 ssh-keygen -t rsa 回车到底
 *
 *   2. 拷贝公钥到服务器（会提示输一次服务器密码）：
 *      Windows: type %USERPROFILE%\.ssh\id_rsa.pub | ssh root@server "cat >> ~/.ssh/authorized_keys"
 *      Mac:     ssh-copy-id root@server
 *
 *   3. ssh root@server 输完不弹密码直接连上即成功
 */
import { execSync } from "node:child_process";

const HOST = "www.youlai.tech"; // 服务器 IP，改为你的
const USER = "root"; // SSH 用户名，改为你的
const PORT = 1010; // SSH 端口，改为你的
const TARGET = "/mnt/nginx/html/vue"; // 部署目录，改为你的
// =========================================================

console.log("构建中...");
execSync("pnpm build-only", { stdio: "inherit" });

console.log(`部署 → ${USER}@${HOST}:${TARGET}`);
execSync(`scp -o StrictHostKeyChecking=no -P ${PORT} -r "dist/." "${USER}@${HOST}:${TARGET}/"`, {
  stdio: "inherit",
  shell: true,
});

console.log("部署完成");
