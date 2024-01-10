import path from "path";
import { createDefineMock } from "vite-plugin-mock-dev-server";

const defineMock = createDefineMock((mock) => {
  mock.url = path.join(import.meta.env.VITE_APP_BASE_API, mock.url); // 路径会拼接为: /dev-api + url
});

export default defineMock([
  {
    url: "/api/v1/dept/options",
    method: ["GET"],
    body: {
      code: "00000",
      data: [
        {
          value: 1,
          label: "有来技术",
          children: [
            {
              value: 2,
              label: "研发部门",
            },
            {
              value: 3,
              label: "测试部门",
            },
          ],
        },
      ],
      msg: "一切ok",
    },
  },

  {
    url: "/api/v1/dept",
    method: ["GET"],
    body: {
      code: "00000",
      data: [
        {
          id: 1,
          parentId: 0,
          name: "有来技术",
          sort: 1,
          status: 1,
          children: [
            {
              id: 2,
              parentId: 1,
              name: "研发部门",
              sort: 1,
              status: 1,
              children: [],
              createTime: null,
              updateTime: "2022-04-19 12:46",
            },
            {
              id: 3,
              parentId: 1,
              name: "测试部门",
              sort: 1,
              status: 1,
              children: [],
              createTime: null,
              updateTime: "2022-04-19 12:46",
            },
          ],
          createTime: null,
          updateTime: null,
        },
      ],
      msg: "一切ok",
    },
  },
]);
