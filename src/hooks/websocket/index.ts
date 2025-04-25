/**
 * WebSocket相关Hook入口文件
 * 统一导出所有WebSocket相关Hook
 */

// 核心基础Hook
export { useStomp } from "./core/useStomp";

// 业务服务Hook
export { useOnlineCount } from "./services/useOnlineCount";
export { useDictSync } from "./services/useDictSync";
