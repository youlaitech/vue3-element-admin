/* eslint-disable no-console */
/**
 * 构建并上传到服务器
 *
 * 服务器信息取自 deploy.config.mjs（已加入忽略，不会入库），缺该文件时回落到
 * 环境变量 DEPLOY_HOST / DEPLOY_USER / DEPLOY_PORT / DEPLOY_TARGET
 *
 * 前置：SSH 免密登录（只需一次）
 *   1. 没有 %USERPROFILE%\.ssh\id_rsa 就先 ssh-keygen -t rsa 回车到底
 *
 *   2. 拷贝公钥到服务器（会提示输一次服务器密码）：
 *      Windows: type %USERPROFILE%\.ssh\id_rsa.pub | ssh root@server "cat >> ~/.ssh/authorized_keys"
 *      Mac:     ssh-copy-id root@server
 *
 *   3. ssh root@server 不弹密码直接连上即成功
 */
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

/** 读取部署配置，配置文件缺失时回落到环境变量 */
async function readConfig() {
  const configPath = resolve("deploy.config.mjs");
  if (existsSync(configPath)) {
    return (await import(pathToFileURL(configPath).href)).default;
  }

  return {
    host: process.env.DEPLOY_HOST,
    user: process.env.DEPLOY_USER,
    port: Number(process.env.DEPLOY_PORT ?? 22),
    target: process.env.DEPLOY_TARGET,
  };
}

const config = await readConfig();

if (!config?.host || !config?.user || !config?.target) {
  console.error("缺少部署配置：在项目根目录创建 deploy.config.mjs 填写 host / user / port / target");
  process.exit(1);
}

const { host, user, port = 22, target } = config;

console.log("构建中...");
execSync("pnpm build-only", { stdio: "inherit" });

console.log(`部署 → ${user}@${host}:${target}`);
execSync(`scp -o StrictHostKeyChecking=no -P ${port} -r "dist/." "${user}@${host}:${target}/"`, {
  stdio: "inherit",
  shell: true,
});

console.log("部署完成");
