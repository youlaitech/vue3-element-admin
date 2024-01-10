import path from "path";
import { createDefineMock } from "vite-plugin-mock-dev-server";

const defineMock = createDefineMock((mock) => {
  mock.url = path.join(import.meta.env.VITE_APP_BASE_API, mock.url); // 路径会拼接为: /dev-api + url
});

export default defineMock([
  {
    url: "/api/v1/dict/:code/options",
    method: ["GET"],
    body: ({ params }) => {
      const typeCode = params.code;

      let list = null;

      if (typeCode == "gender") {
        list = [
          {
            value: "1",
            label: "男",
          },
          {
            value: "2",
            label: "女",
          },
          {
            value: "0",
            label: "未知",
          },
        ];
      }

      return {
        code: "00000",
        data: list,
        msg: "一切ok",
      };
    },
  },

  {
    url: "/api/v1/dict/types/page",
    method: ["GET"],
    body: {
      code: "00000",
      data: {
        list: [
          {
            id: 1,
            name: "性别",
            code: "gender",
            status: 1,
          },
          {
            id: 2,
            name: "状态",
            code: "status",
            status: 1,
          },
        ],
        total: 2,
      },
      msg: "一切ok",
    },
  },

  {
    url: "/api/v1/dict/page",
    method: ["GET"],
    body: {
      code: "00000",
      data: {
        list: [
          {
            id: 1,
            name: "男",
            value: "1",
            status: 1,
          },
          {
            id: 2,
            name: "女",
            value: "2",
            status: 1,
          },
          {
            id: 3,
            name: "未知",
            value: "0",
            status: 1,
          },
        ],
        total: 3,
      },
      msg: "一切ok",
    },
  },
]);
