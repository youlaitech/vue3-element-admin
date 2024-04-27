import { defineMock } from "./base";

export default defineMock([
  {
    url: "users/me",
    method: ["GET"],
    body: {
      code: "00000",
      data: {
        userId: 2,
        nickname: "系统管理员",
        username: "admin",
        avatar:
          "https://oss.youlai.tech/youlai-boot/2023/05/16/811270ef31f548af9cffc026dfc3777b.gif",
        roles: ["ROOT"],
        perms: [
          "sys:menu:delete",
          "sys:dept:edit",
          "sys:dict_type:add",
          "sys:dict:edit",
          "sys:dict:delete",
          "sys:dict_type:edit",
          "sys:menu:add",
          "sys:user:add",
          "sys:role:edit",
          "sys:dept:delete",
          "sys:user:edit",
          "sys:user:delete",
          "sys:user:password:reset",
          "sys:dept:add",
          "sys:role:delete",
          "sys:dict_type:delete",
          "sys:menu:edit",
          "sys:dict:add",
          "sys:role:add",
          "sys:user:query",
          "sys:user:export",
        ],
      },
      msg: "一切ok",
    },
  },

  {
    url: "users/page",
    method: ["GET"],
    body: {
      code: "00000",
      data: {
        list: [
          {
            id: 2,
            username: "admin",
            nickname: "系统管理员",
            mobile: "17621210366",
            gender: 1,
            avatar:
              "https://oss.youlai.tech/youlai-boot/2023/05/16/811270ef31f548af9cffc026dfc3777b.gif",
            email: "",
            status: 1,
            deptId: 1,
            roleIds: [2],
          },
          {
            id: 3,
            username: "test",
            nickname: "测试小用户",
            mobile: "17621210366",
            gender: 1,
            avatar:
              "https://oss.youlai.tech/youlai-boot/2023/05/16/811270ef31f548af9cffc026dfc3777b.gif",
            email: "youlaitech@163.com",
            status: 1,
            deptId: 3,
            roleIds: [3],
          },
        ],
        total: 2,
      },
      msg: "一切ok",
    },
  },

  // 新增用户
  {
    url: "users",
    method: ["POST"],
    body({ body }) {
      return {
        code: "00000",
        data: null,
        msg: "新增用户" + body.nickname + "成功",
      };
    },
  },

  // 获取用户表单数据
  {
    url: "users/:userId/form",
    method: ["GET"],
    body: ({ params }) => {
      return {
        code: "00000",
        data: userMap[params.userId],
        msg: "一切ok",
      };
    },
  },
  // 修改用户
  {
    url: "users/:userId",
    method: ["PUT"],
    body({ body }) {
      return {
        code: "00000",
        data: null,
        msg: "修改用户" + body.nickname + "成功",
      };
    },
  },

  // 删除用户
  {
    url: "users/:userId",
    method: ["DELETE"],
    body({ params }) {
      return {
        code: "00000",
        data: null,
        msg: "删除用户" + params.id + "成功",
      };
    },
  },

  // 重置密码
  {
    url: "users/:userId/password",
    method: ["PATCH"],
    body({ query }) {
      return {
        code: "00000",
        data: null,
        msg: "重置密码成功，新密码为：" + query.password,
      };
    },
  },

  // 导出Excel
  {
    url: "users/_export",
    method: ["GET"],
    headers: {
      "Content-Disposition":
        "attachment; filename=%E7%94%A8%E6%88%B7%E5%88%97%E8%A1%A8.xlsx",
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
  },
]);

// 用户映射表数据
const userMap: Record<string, any> = {
  2: {
    id: 2,
    username: "admin",
    nickname: "系统管理员",
    mobile: "17621210366",
    gender: 1,
    avatar:
      "https://oss.youlai.tech/youlai-boot/2023/05/16/811270ef31f548af9cffc026dfc3777b.gif",
    email: "",
    status: 1,
    deptId: 1,
    roleIds: [2],
  },
  3: {
    id: 3,
    username: "test",
    nickname: "测试小用户",
    mobile: "17621210366",
    gender: 1,
    avatar:
      "https://oss.youlai.tech/youlai-boot/2023/05/16/811270ef31f548af9cffc026dfc3777b.gif",
    email: "youlaitech@163.com",
    status: 1,
    deptId: 3,
    roleIds: [3],
  },
};
