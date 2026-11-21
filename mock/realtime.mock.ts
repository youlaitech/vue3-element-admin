import { defineMock } from "./base";

export default defineMock([
  // mock 模式不启用实时服务：领票返回 503 + B0102，前端按协议优雅降级，
  // 避免请求穿透代理到线上触发 401 续期连锁退出登录
  {
    url: "realtime/tickets",
    method: ["POST"],
    status: 503,
    body: {
      code: "B0102",
      data: null,
      msg: "实时服务未启用",
    },
  },
  // 在线人数 HTTP 校准：返回单节点空快照，保持校准链路静默可用
  {
    url: "realtime/presence",
    method: ["GET"],
    body: () => ({
      code: "00000",
      data: {
        onlineUsers: 1,
        onlineConnections: 1,
        nodeId: "mock-node",
        observedAt: new Date().toISOString(),
      },
      msg: "一切ok",
    }),
  },
]);
