import { MockMethod } from "vite-plugin-mock";

export default [
  {
    url: "/api/hello_world",
    method: "get",
    response: (request) => {
      return {
        msg: "hello world",
        headers: request.headers,
      };
    },
  },
  {
    url: "/api/v1/auth/captcha",
    method: "get",
    response: () => {
      return {
        code: "00000",
        data: {
          verifyCodeKey: "534b8ef2b0a24121bec76391ddd159f9",
          verifyCodeBase64:
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAAkCAIAAADNSmkJAAAFKUlEQVR4Xu2ZXUwcVRiGV70wMWo08V5NvPXCrDbFaGpMaZW2hqQxaoiJTRsaMBCNSYtpa2JTKiFSelFa+Q/QZcMWqEhBlh+htbEpZhMrBQrlJ0hBywLLyrJ0WZbje3bqOvPNLHPWrDvdOE9ONmfe78zkzMs335wzWJhJQrBQweS/wTQ6QWgYHdoIOcecOe05O+t2WkutO+p2ZF3Ksg/YV9ZW6FATYajR3nveg60H9327r3O8c35lHgp+r05dPdJzBL73TPSQ8SaCKIxGLsPlop+K0JHrEkPuoT31e5qGmmjARACF0agYyGVNlyVm/pzZXrN9fHGcBkz0UBid+31u93i3XFFT80vN8cvHqWqih8Lo1NpUqS5vwh3vnd223VQ10UNh9NbyrcFQUK6oCawHUipSqGqiB83oBf+CXFGDMp1mS6OqiR4Ko7FexkpOrqhpHGw82nOUqiZ6KIzGrkRuorW0dJMmOy+hOCfYGzb2RBFv6HRO0gEJw/U7y+pgL1bwmTxexN6sZ31TdEwEhdG+gA+7EqyXpUO1uZH20cWL8hMTRt1N9tBXzCJrOIRoCPJpSO2RAp4HmtCdIfZ+2JWgEBN9LbR28seTGU0Zue1tMLp+YIAMSADzfvbkKX4/eb28j4YODiGin3heqmIlLja5hAUCu+nmGY3JWKvpMAlqNGgebsauBOvlqSX+JEx7p7EbTLen53XlzfmWUioqXikrc68Y8N2juJ/fyVsNChGHEE//rBANYWaZz+TRQqpLaBgNsPfDrgSpbS21YtV87IdjrlkX9JZbt5DOma2t9ITo5F+5glN22WwL/n+yDv00mw06orKxOqQ5+J04hhViwzAXETIcJDVm8uxZqktoGx2Nj9t43Wgaul/ERQiGQvtbWnDWgZYW9CXlQFjZ/7ciyHNn+Z2MexTimIeLz59TiIln0M1e+IbPpOAaDUnEYPTi6iqKxpbycs/qKo1tCslfKcffPn9enuMiPPY1vxO/ckeFQ4h46cdGqUWoidE/y54q5tPY5WDrGzQqIXot4BgchEE57e00IMCw2/1qZSVO/7SjA78o9INzcxsbrL+fnTnDDh9mmZn8F30oG1Hm+nABv5mQMopDS/h1HxtqTzWbABMe9sxpPoe9zezeOo1GELqWhPS8t46M0IAYHbdvR1aHbaOjbjfLz2eFhez6dba4yAfgF30o0BFVE8+Mjh/wFxPI+I5mAEHU6Ls+38vhTFwOBGhMDF8gkFpbC5ffsdv/uBs6dIj19dExEtARVXv9YNbop8NFY3aZ6gRRo+tu3IBHnzmdNCBMXldXJKPfL74WzWUJRE+coDUknqsOdZXQbAJYwluVTbOZI3Qt8GFzMwxyjo3RgBiN4fr+elXVpZGRLWXl6PdOTtJBSlBDUK/lnIrjOlrtqWYTQDJaF6FrTXu9sOa1ysrVoM5HVE1GFxZQcyJ/p+xzv6K/rbr6N6+XDpUBl0tKFIrbz78qWB6YnWFMCBld4XLBms+7df75ook/GNzb0GCV7U1Qfz9p64TyQWNjYD3qe9rj4SMJtQP3MyjSDPzWIRHPjH7X4YAvfXoPuyZf9Pbi3PcuXIh4mp3NllYC6XY79C+jl2o8PBipxjnBttn4MgMNnWgfcRJGPI2OL8hTj3LloIlmRicvBhiNykvecpqoa3RSY4DRcLAwyicuOepVR1JjgNFYHWONHL04czTX0UmNAUYD7Pr+xc4wqTHGaBb2OtZvHUmNYUazcA2J6etdUmOk0f8rTKMTxF91RG0D1SwYGwAAAABJRU5ErkJggg==",
        },
        msg: "一切ok",
      };
    },
  },
  {
    url: "/api/v1/auth/login",
    method: "post",
    response: () => {
      return {
        code: "00000",
        data: {
          accessToken:
            "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsImp0aSI6IjE2YWJkNTlkOTAxNzQwZDliYmI3ZjczODBhZDkyNzNhIiwidXNlcklkIjoyLCJ1c2VybmFtZSI6ImFkbWluIiwiZGVwdElkIjoxLCJkYXRhU2NvcGUiOjEsImF1dGhvcml0aWVzIjpbIlJPTEVfQURNSU4iXSwiZXhwIjoxNjkxMTAzMzgyfQ.P4cuIfmPepl3HuguhMS7NXn5a7IUPpsLbmtA_rHOhHk",
          tokenType: "Bearer",
          refreshToken: null,
          expires: null,
        },
        msg: "一切ok",
      };
    },
  },
  {
    url: "/api/v1/users/me",
    method: "get",
    response: () => {
      return {
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
      };
    },
  },
  {
    url: "/api/v1/auth/logout",
    method: "delete",
    response: () => {
      return {
        code: "00000",
        data: {},
        msg: "string",
      };
    },
  },
  {
    url: "/api/v1/users/page",
    method: "get",
    response: () => {
      return {
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
      };
    },
  },

  {
    url: "/api/v1/users/:id/form",
    method: "get",
    response: ({ url }) => {
      const id = url.match(/\/api\/v1\/users\/(\d+)\/form/)[1];
      let formData = null;
      if (id == 2) {
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
      } else if (id == 3) {
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
] as MockMethod[];
