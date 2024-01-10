import path from "path";
import { createDefineMock } from "vite-plugin-mock-dev-server";

const defineMock = createDefineMock((mock) => {
  mock.url = path.join(import.meta.env.VITE_APP_BASE_API, mock.url); // 路径会拼接为: /dev-api + url
});

export default defineMock([
  {
    url: "/api/v1/roles/options",
    method: ["GET"],
    body: {
      code: "00000",
      data: [
        {
          value: 2,
          label: "系统管理员",
        },
        {
          value: 4,
          label: "系统管理员1",
        },
        {
          value: 5,
          label: "系统管理员2",
        },
        {
          value: 6,
          label: "系统管理员3",
        },
        {
          value: 7,
          label: "系统管理员4",
        },
        {
          value: 8,
          label: "系统管理员5",
        },
        {
          value: 9,
          label: "系统管理员6",
        },
        {
          value: 10,
          label: "系统管理员7",
        },
        {
          value: 11,
          label: "系统管理员8",
        },
        {
          value: 12,
          label: "系统管理员9",
        },
        {
          value: 3,
          label: "访问游客",
        },
      ],
      msg: "一切ok",
    },
  },
]);
