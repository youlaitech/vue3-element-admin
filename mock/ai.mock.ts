import { defineMock } from "./base";

export default defineMock([
  {
    url: "ai/assistant/parse",
    method: ["POST"],
    body: ({ body }) => {
      return {
        code: "00000",
        data: {
          parseLogId: "10001",
          success: true,
          functionCalls: [
            {
              name: "navigate",
              arguments: {
                path: "/system/user",
              },
            },
          ],
          explanation: `Mock: 已解析命令：${body?.command ?? ""}`,
          confidence: 0.92,
        },
        msg: "一切ok",
      };
    },
  },
  {
    url: "ai/assistant/execute",
    method: ["POST"],
    body: {
      code: "00000",
      data: {
        success: true,
        message: "Mock: 执行成功",
      },
      msg: "一切ok",
    },
  },
  {
    url: "ai/assistant/records",
    method: ["GET"],
    body: ({ query }) => {
      const pageNum = Number(query?.pageNum ?? 1);
      const pageSize = Number(query?.pageSize ?? 10);
      const total = 2;

      return {
        code: "00000",
        data: [
          {
            id: "10001",
            userId: 1,
            username: "admin",
            originalCommand: "跳转到用户管理",
            aiProvider: "qwen",
            aiModel: "qwen-plus",
            parseStatus: 1,
            functionCalls: JSON.stringify(
              [
                {
                  name: "navigate",
                  arguments: { path: "/system/user" },
                },
              ],
              null,
              0
            ),
            explanation: "Mock: 识别到跳转用户管理",
            confidence: 0.92,
            parseDurationMs: 128,
            functionName: "navigate",
            functionArguments: JSON.stringify({ path: "/system/user" }),
            executeStatus: 1,
            ipAddress: "127.0.0.1",
            createTime: "2025-12-17 15:00:00",
            updateTime: "2025-12-17 15:00:00",
          },
          {
            id: "10002",
            userId: 1,
            username: "admin",
            originalCommand: "获取姓名为张三的用户信息",
            aiProvider: "qwen",
            aiModel: "qwen-plus",
            parseStatus: 0,
            functionCalls: "[]",
            explanation: "Mock: 解析失败示例",
            confidence: 0.2,
            parseErrorMessage: "Mock: 无法匹配函数",
            parseDurationMs: 256,
            executeStatus: 0,
            ipAddress: "127.0.0.1",
            createTime: "2025-12-17 15:01:00",
            updateTime: "2025-12-17 15:01:00",
          },
        ].slice((pageNum - 1) * pageSize, pageNum * pageSize),
        page: {
          pageNum,
          pageSize,
          total,
        },
        msg: "一切ok",
      };
    },
  },
  {
    url: "ai/assistant/records/:ids",
    method: ["DELETE"],
    body: ({ params }) => {
      return {
        code: "00000",
        data: {
          ids: params?.ids,
        },
        msg: "一切ok",
      };
    },
  },
]);
