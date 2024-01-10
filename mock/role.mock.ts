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

  {
    url: "/api/v1/roles/page",
    method: ["GET"],
    body: {
      code: "00000",
      data: {
        list: [
          {
            id: 2,
            name: "系统管理员",
            code: "ADMIN",
            status: 1,
            sort: 2,
            createTime: "2021-03-25 12:39:54",
            updateTime: null,
          },
          {
            id: 3,
            name: "访问游客",
            code: "GUEST",
            status: 1,
            sort: 3,
            createTime: "2021-05-26 15:49:05",
            updateTime: "2019-05-05 16:00:00",
          },
          {
            id: 4,
            name: "系统管理员1",
            code: "ADMIN1",
            status: 1,
            sort: 2,
            createTime: "2021-03-25 12:39:54",
            updateTime: null,
          },
          {
            id: 5,
            name: "系统管理员2",
            code: "ADMIN2",
            status: 1,
            sort: 2,
            createTime: "2021-03-25 12:39:54",
            updateTime: null,
          },
          {
            id: 6,
            name: "系统管理员3",
            code: "ADMIN3",
            status: 1,
            sort: 2,
            createTime: "2021-03-25 12:39:54",
            updateTime: null,
          },
          {
            id: 7,
            name: "系统管理员4",
            code: "ADMIN4",
            status: 1,
            sort: 2,
            createTime: "2021-03-25 12:39:54",
            updateTime: null,
          },
          {
            id: 8,
            name: "系统管理员5",
            code: "ADMIN5",
            status: 1,
            sort: 2,
            createTime: "2021-03-25 12:39:54",
            updateTime: null,
          },
          {
            id: 9,
            name: "系统管理员6",
            code: "ADMIN6",
            status: 1,
            sort: 2,
            createTime: "2021-03-25 12:39:54",
            updateTime: "2023-12-04 11:43:15",
          },
          {
            id: 10,
            name: "系统管理员7",
            code: "ADMIN7",
            status: 1,
            sort: 2,
            createTime: "2021-03-25 12:39:54",
            updateTime: null,
          },
          {
            id: 11,
            name: "系统管理员8",
            code: "ADMIN8",
            status: 1,
            sort: 2,
            createTime: "2021-03-25 12:39:54",
            updateTime: null,
          },
        ],
        total: 10,
      },
      msg: "一切ok",
    },
  },

  {
    url: "/api/v1/roles/:id/form",
    method: ["GET"],
    body: ({ params }) => {
      const id = params.id;
      let formData = null;
      if (id == 2) {
        formData = {
          id: 2,
          name: "系统管理员",
          code: "ADMIN",
          sort: 2,
          status: 1,
          dataScope: 1,
        };
      } else if (id == 3) {
        formData = {
          id: 3,
          name: "访问游客",
          code: "GUEST",
          sort: 3,
          status: 1,
          dataScope: 2,
        };
      } else {
        formData = {
          id: 4,
          name: "系统管理员1",
          code: "ADMIN1",
          sort: 2,
          status: 1,
          dataScope: 1,
        };
      }

      return {
        code: "00000",
        data: formData,
        msg: "一切ok",
      };
    },
  },
]);
