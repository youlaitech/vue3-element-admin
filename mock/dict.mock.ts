import { defineMock } from "./base";

export default defineMock([
  {
    url: "dict/:code/options",
    method: ["GET"],
    body: ({ params }) => {
      const typeCode = params.code;

      let list = null;

      if (typeCode == "gender") {
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
            label: "未知",
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
    url: "dict/types/page",
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
          },
          {
            id: 2,
            name: "状态",
            code: "status",
            status: 1,
          },
        ],
        total: 2,
      },
      msg: "一切ok",
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
            name: "男",
            value: "1",
            status: 1,
          },
          {
            id: 2,
            name: "女",
            value: "2",
            status: 1,
          },
          {
            id: 3,
            name: "未知",
            value: "0",
            status: 1,
          },
        ],
        total: 3,
      },
      msg: "一切ok",
    },
  },

  // 新增字典类型
  {
    url: "dict/types",
    method: ["POST"],
    body({ body }) {
      return {
        code: "00000",
        data: null,
        msg: "新增字典类型" + body.name + "成功",
      };
    },
  },

  // 获取字典类型表单数据
  {
    url: "dict/types/:id/form",
    method: ["GET"],
    body: ({ params }) => {
      return {
        code: "00000",
        data: dictTypeMap[params.id],
        msg: "一切ok",
      };
    },
  },

  // 修改字典类型
  {
    url: "dict/types/:id",
    method: ["PUT"],
    body({ body }) {
      return {
        code: "00000",
        data: null,
        msg: "修改字典类型" + body.name + "成功",
      };
    },
  },

  // 删除字典类型
  {
    url: "dict/types/:id",
    method: ["DELETE"],
    body({ params }) {
      return {
        code: "00000",
        data: null,
        msg: "删除字典类型" + params.id + "成功",
      };
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
        msg: "修改字典类型" + body.name + "成功",
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

// 字典类型映射表数据
const dictTypeMap: Record<string, any> = {
  1: {
    id: 1,
    name: "性别",
    code: "gender",
    status: 1,
    remark: null,
  },
  2: {
    id: 2,
    name: "状态",
    code: "status",
    status: 1,
    remark: null,
  },
};

// 字典映射表数据
const dictMap: Record<string, any> = {
  1: {
    id: 1,
    typeCode: "gender",
    name: "男",
    value: "1",
    status: 1,
    sort: 1,
    remark: null,
  },
  2: {
    id: 2,
    typeCode: "gender",
    name: "女",
    value: "2",
    status: 1,
    sort: 2,
    remark: null,
  },
  3: {
    id: 3,
    typeCode: "gender",
    name: "未知",
    value: "0",
    status: 1,
    sort: 1,
    remark: null,
  },
};
