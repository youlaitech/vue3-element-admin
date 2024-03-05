import { defineMock } from "./base";

export default defineMock([
  {
    url: "roles/options",
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
    url: "roles/page",
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

  // 新增角色
  {
    url: "roles",
    method: ["POST"],
    body({ body }) {
      return {
        code: "00000",
        data: null,
        msg: "新增角色" + body.name + "成功",
      };
    },
  },

  // 获取角色表单数据
  {
    url: "roles/:id/form",
    method: ["GET"],
    body: ({ params }) => {
      return {
        code: "00000",
        data: roleMap[params.id],
        msg: "一切ok",
      };
    },
  },
  // 修改角色
  {
    url: "roles/:id",
    method: ["PUT"],
    body({ body }) {
      return {
        code: "00000",
        data: null,
        msg: "修改角色" + body.name + "成功",
      };
    },
  },

  // 删除角色
  {
    url: "roles/:id",
    method: ["DELETE"],
    body({ params }) {
      return {
        code: "00000",
        data: null,
        msg: "删除角色" + params.id + "成功",
      };
    },
  },
  // 获取角色拥有的菜单ID
  {
    url: "roles/:id/menuIds",
    method: ["GET"],
    body: ({ params }) => {
      return {
        code: "00000",
        data: [
          1, 2, 31, 32, 33, 88, 3, 70, 71, 72, 4, 73, 75, 74, 5, 76, 77, 78, 6,
          79, 81, 84, 85, 86, 87, 40, 41, 26, 30, 20, 21, 22, 23, 24, 89, 90,
          91, 36, 37, 38, 39, 93, 94, 95, 97, 102, 89, 90, 91, 93, 94, 95, 97,
          102, 103, 104,
        ],
        msg: "一切ok",
      };
    },
  },
  // 保存角色菜单
  {
    url: "roles/:id/menus",
    method: ["PUT"],
    body: {
      code: "00000",
      data: null,
      msg: "一切ok",
    },
  },
]);

// 角色映射表数据
const roleMap: Record<string, any> = {
  2: {
    id: 2,
    name: "系统管理员",
    code: "ADMIN",
    status: 1,
    sort: 2,
    createTime: "2021-03-25 12:39:54",
    updateTime: null,
  },
  3: {
    id: 3,
    name: "访问游客",
    code: "GUEST",
    status: 1,
    sort: 3,
    createTime: "2021-05-26 15:49:05",
    updateTime: "2019-05-05 16:00:00",
  },
  4: {
    id: 4,
    name: "系统管理员1",
    code: "ADMIN1",
    status: 1,
    sort: 2,
    createTime: "2021-03-25 12:39:54",
    updateTime: null,
  },
  5: {
    id: 5,
    name: "系统管理员2",
    code: "ADMIN2",
    status: 1,
    sort: 2,
    createTime: "2021-03-25 12:39:54",
    updateTime: null,
  },

  6: {
    id: 6,
    name: "系统管理员3",
    code: "ADMIN3",
    status: 1,
    sort: 2,
    createTime: "2021-03-25 12:39:54",
    updateTime: null,
  },
  7: {
    id: 7,
    name: "系统管理员4",
    code: "ADMIN4",
    status: 1,
    sort: 2,
    createTime: "2021-03-25 12:39:54",
    updateTime: null,
  },
  8: {
    id: 8,
    name: "系统管理员5",
    code: "ADMIN5",
    status: 1,
    sort: 2,
    createTime: "2021-03-25 12:39:54",
    updateTime: null,
  },
  9: {
    id: 9,
    name: "系统管理员6",
    code: "ADMIN6",
    status: 1,
    sort: 2,
    createTime: "2021-03-25 12:39:54",
    updateTime: "2023-12-04 11:43:15",
  },
  10: {
    id: 10,
    name: "系统管理员7",
    code: "ADMIN7",
    status: 1,
    sort: 2,
    createTime: "2021-03-25 12:39:54",
    updateTime: null,
  },
  11: {
    id: 11,
    name: "系统管理员8",
    code: "ADMIN8",
    status: 1,
    sort: 2,
    createTime: "2021-03-25 12:39:54",
    updateTime: null,
  },
};
