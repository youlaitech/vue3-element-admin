import { defineMock } from "./base";

export default defineMock([
  {
    url: "dict/:code/options",
    method: ["GET"],
    body: ({ params }) => {
      const code = params.code;

      let list = null;

      if (code == "gender") {
        list = [
          {
            value: "1",
            label: "男",
          },
          {
            value: "2",
            label: "女",
          },
          {
            value: "0",
            label: "保密",
          },
        ];
      }

      return {
        code: "00000",
        data: list,
        msg: "一切ok",
      };
    },
  },

  {
    url: "dict/page",
    method: ["GET"],
    body: {
      code: "00000",
      data: {
        list: [
          {
            id: 1,
            name: "性别",
            code: "gender",
            status: 1,
            dictItems: [
              {
                id: 1,
                name: "男",
                value: "1",
                sort: 1,
                status: 1,
              },
              {
                id: 2,
                name: "女",
                value: "2",
                sort: 2,
                status: 1,
              },
              {
                id: 3,
                name: "保密",
                value: "0",
                sort: 3,
                status: 1,
              },
            ],
          },
        ],
        total: 1,
      },
      msg: "一切ok",
    },
  },

  // 新增字典
  {
    url: "dict",
    method: ["POST"],
    body({ body }) {
      return {
        code: "00000",
        data: null,
        msg: "新增字典" + body.name + "成功",
      };
    },
  },

  // 获取字典表单数据
  {
    url: "dict/:id/form",
    method: ["GET"],
    body: ({ params }) => {
      return {
        code: "00000",
        data: dictMap[params.id],
        msg: "一切ok",
      };
    },
  },

  // 修改字典
  {
    url: "dict/:id",
    method: ["PUT"],
    body({ body }) {
      return {
        code: "00000",
        data: null,
        msg: "修改字典" + body.name + "成功",
      };
    },
  },

  // 删除字典
  {
    url: "dict/:id",
    method: ["DELETE"],
    body({ params }) {
      return {
        code: "00000",
        data: null,
        msg: "删除字典" + params.id + "成功",
      };
    },
  },
]);

// 字典映射表数据
const dictMap: Record<string, any> = {
  1: {
    code: "00000",
    data: {
      id: 1,
      name: "性别",
      code: "gender",
      status: 1,
      dictItems: [
        {
          id: 1,
          name: "男",
          value: "1",
          sort: 1,
          status: 1,
        },
        {
          id: 2,
          name: "女",
          value: "2",
          sort: 2,
          status: 1,
        },
        {
          id: 3,
          name: "未知",
          value: "0",
          sort: 3,
          status: 1,
        },
      ],
    },
    msg: "一切ok",
  },
};
