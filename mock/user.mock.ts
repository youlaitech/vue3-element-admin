import path from "path";
import { createDefineMock } from "vite-plugin-mock-dev-server";

const defineMock = createDefineMock((mock) => {
  mock.url = path.join(import.meta.env.VITE_APP_BASE_API, mock.url); // 路径会拼接为: /dev-api + url
});

export default defineMock([
  {
    url: "/api/v1/users/me",
    method: ["GET"],
    body: {
      code: "00000",
      data: {
        userId: 2,
        nickname: "系统管理员",
        avatar:
          "https://oss.youlai.tech/youlai-boot/2023/05/16/811270ef31f548af9cffc026dfc3777b.gif",
        roles: ["ADMIN"],
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
          "sys:user:reset_pwd",
          "sys:dept:add",
          "sys:role:delete",
          "sys:dict_type:delete",
          "sys:menu:edit",
          "sys:dict:add",
          "sys:role:add",
        ],
      },
      msg: "一切ok",
    },
  },

  {
    url: "/api/v1/users/page",
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
            genderLabel: "男",
            avatar:
              "https://oss.youlai.tech/youlai-boot/2023/05/16/811270ef31f548af9cffc026dfc3777b.gif",
            email: null,
            status: 1,
            deptName: "有来技术",
            roleNames: "系统管理员",
            createTime: "2019-10-10",
          },
          {
            id: 3,
            username: "test",
            nickname: "测试小用户",
            mobile: "17621210366",
            genderLabel: "男",
            avatar:
              "https://oss.youlai.tech/youlai-boot/2023/05/16/811270ef31f548af9cffc026dfc3777b.gif",
            email: null,
            status: 1,
            deptName: "测试部门",
            roleNames: "访问游客",
            createTime: "2021-06-04",
          },
        ],
        total: 2,
      },
      msg: "一切ok",
    },
  },

  {
    url: "/api/v1/users/:userId/form",
    method: ["GET"],
    body: ({ params }) => {
      const userId = params.userId;
      let formData = null;
      if (userId == 2) {
        formData = {
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
        };
      } else if (userId == 3) {
        formData = {
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
