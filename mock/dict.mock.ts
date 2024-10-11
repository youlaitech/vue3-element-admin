import { defineMock } from "./base";

export default defineMock([
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
            dictCode: "gender",
            status: 1,
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
      dictCode: "gender",
      status: 1,
    },
    msg: "一切ok",
  },
};
