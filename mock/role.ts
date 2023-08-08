import { MockMethod } from "vite-plugin-mock";

export default [
  {
    url: "/api/v1/roles/options",
    method: "get",
    response: () => {
      return {
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
      };
    },
  },
  {
    url: "/api/v1/roles/page",
    method: "get",
    response: () => {
      return {
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
              code: "ADMIN1",
              status: 1,
              sort: 2,
              createTime: "2021-03-25 12:39:54",
              updateTime: null,
            },
            {
              id: 6,
              name: "系统管理员3",
              code: "ADMIN1",
              status: 1,
              sort: 2,
              createTime: "2021-03-25 12:39:54",
              updateTime: null,
            },
            {
              id: 7,
              name: "系统管理员4",
              code: "ADMIN1",
              status: 1,
              sort: 2,
              createTime: "2021-03-25 12:39:54",
              updateTime: null,
            },
            {
              id: 8,
              name: "系统管理员5",
              code: "ADMIN1",
              status: 1,
              sort: 2,
              createTime: "2021-03-25 12:39:54",
              updateTime: null,
            },
            {
              id: 9,
              name: "系统管理员6",
              code: "ADMIN1",
              status: 1,
              sort: 2,
              createTime: "2021-03-25 12:39:54",
              updateTime: null,
            },
            {
              id: 10,
              name: "系统管理员7",
              code: "ADMIN1",
              status: 1,
              sort: 2,
              createTime: "2021-03-25 12:39:54",
              updateTime: null,
            },
            {
              id: 11,
              name: "系统管理员8",
              code: "ADMIN1",
              status: 1,
              sort: 2,
              createTime: "2021-03-25 12:39:54",
              updateTime: null,
            },
          ],
          total: 11,
        },
        msg: "一切ok",
      };
    },
  },
] as MockMethod[];
