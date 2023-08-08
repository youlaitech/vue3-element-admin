import { MockMethod } from "vite-plugin-mock";

export default [
  {
    url: "/api/v1/dept/options",
    method: "get",
    response: () => {
      return {
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
      };
    },
  },
] as MockMethod[];
