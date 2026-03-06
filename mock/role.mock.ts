import { defineMock } from "./base";

export default defineMock([
  {
    url: "roles/options",
    method: ["GET"],
    body: {
      code: "00000",
      data: [
        { value: 2, label: "系统管理员" },
        { value: 4, label: "部门主管" },
        { value: 5, label: "部门成员" },
        { value: 6, label: "普通员工" },
        { value: 7, label: "自定义权限用户" },
        { value: 3, label: "访问游客" },
      ],
      msg: "一切ok",
    },
  },

  {
    url: "roles",
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
            dataScope: 1,
            createTime: "2021-03-25 12:39:54",
            updateTime: null,
          },
          {
            id: 3,
            name: "访问游客",
            code: "GUEST",
            status: 1,
            sort: 3,
            dataScope: 3,
            createTime: "2021-05-26 15:49:05",
            updateTime: "2019-05-05 16:00:00",
          },
          {
            id: 4,
            name: "部门主管",
            code: "DEPT_MANAGER",
            status: 1,
            sort: 4,
            dataScope: 2,
            createTime: "2021-03-25 12:39:54",
            updateTime: null,
          },
          {
            id: 5,
            name: "部门成员",
            code: "DEPT_MEMBER",
            status: 1,
            sort: 5,
            dataScope: 3,
            createTime: "2021-03-25 12:39:54",
            updateTime: null,
          },
          {
            id: 6,
            name: "普通员工",
            code: "EMPLOYEE",
            status: 1,
            sort: 6,
            dataScope: 4,
            createTime: "2021-03-25 12:39:54",
            updateTime: null,
          },
          {
            id: 7,
            name: "自定义权限用户",
            code: "CUSTOM_USER",
            status: 1,
            sort: 7,
            dataScope: 5,
            createTime: "2021-03-25 12:39:54",
            updateTime: null,
          },
        ],
        total: 6,
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
    url: "roles/:id/menu-ids",
    method: ["GET"],
    body: () => {
      return {
        code: "00000",
        data: [
          1, 2, 31, 32, 33, 88, 3, 70, 71, 72, 4, 73, 75, 74, 5, 76, 77, 78, 6, 79, 81, 84, 85, 86,
          87, 40, 41, 26, 30, 20, 21, 22, 23, 24, 89, 90, 91, 36, 37, 38, 39, 93, 94, 95, 97, 102,
          89, 90, 91, 93, 94, 95, 97, 102, 103, 104,
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

  // 获取角色部门ID列表(自定义数据权限)
  {
    url: "roles/:id/dept-ids",
    method: ["GET"],
    body: ({ params }) => {
      const role = roleMap[params.id];
      return {
        code: "00000",
        data: role?.dataScope === 5 ? role.deptIds || [1, 2] : [],
        msg: "一切ok",
      };
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
    dataScope: 1,
    createTime: "2021-03-25 12:39:54",
    updateTime: null,
  },
  3: {
    id: 3,
    name: "访问游客",
    code: "GUEST",
    status: 1,
    sort: 3,
    dataScope: 3,
    createTime: "2021-05-26 15:49:05",
    updateTime: "2019-05-05 16:00:00",
  },
  4: {
    id: 4,
    name: "部门主管",
    code: "DEPT_MANAGER",
    status: 1,
    sort: 4,
    dataScope: 2,
    createTime: "2021-03-25 12:39:54",
    updateTime: null,
  },
  5: {
    id: 5,
    name: "部门成员",
    code: "DEPT_MEMBER",
    status: 1,
    sort: 5,
    dataScope: 3,
    createTime: "2021-03-25 12:39:54",
    updateTime: null,
  },
  6: {
    id: 6,
    name: "普通员工",
    code: "EMPLOYEE",
    status: 1,
    sort: 6,
    dataScope: 4,
    createTime: "2021-03-25 12:39:54",
    updateTime: null,
  },
  7: {
    id: 7,
    name: "自定义权限用户",
    code: "CUSTOM_USER",
    status: 1,
    sort: 7,
    dataScope: 5,
    deptIds: [1, 2],
    createTime: "2021-03-25 12:39:54",
    updateTime: null,
  },
};
