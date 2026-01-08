import { defineMock } from "./base";

export default defineMock([
  {
    url: "dicts",
    method: ["GET"],
    body: {
      code: "00000",
      data: [
        {
          id: 1,
          name: "性别",
          dictCode: "gender",
          status: 1,
        },
      ],
      page: {
        pageNum: 1,
        pageSize: 10,
        total: 1,
      },
      msg: "一切ok",
    },
  },

  /**
   * 字典列表
   */
  {
    url: "dicts/options",
    method: ["GET"],
    body: {
      code: "00000",
      data: [
        {
          value: "gender",
          label: "性别",
        },
      ],
      msg: "一切ok",
    },
  },

  // 新增字典
  {
    url: "dicts",
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
    url: "dicts/:id/form",
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
    url: "dicts/:id",
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
    url: "dicts/:ids",
    method: ["DELETE"],
    body({ params }) {
      return {
        code: "00000",
        data: null,
        msg: "删除字典" + params.ids + "成功",
      };
    },
  },

  //---------------------------------------------------
  // 字典项相关接口
  //---------------------------------------------------

  // 字典项分页列表
  {
    url: "dicts/:dictCode/items",
    method: ["GET"],
    body: {
      code: "00000",
      data: [
        {
          id: 1,
          dictCode: "gender",
          label: "男",
          value: "1",
          sort: 1,
          status: 1,
          tagType: "P",
        },
        {
          id: 2,
          dictCode: "gender",
          label: "女",
          value: "2",
          sort: 2,
          status: 1,
          tagType: "D",
        },
        {
          id: 3,
          dictCode: "gender",
          label: "保密",
          value: "0",
          sort: 3,
          status: 1,
          tagType: "I",
        },
      ],
      page: {
        pageNum: 1,
        pageSize: 10,
        total: 3,
      },
      msg: "一切ok",
    },
  },
  // 字典项列表
  {
    url: "dicts/:dictCode/items/options",
    method: ["GET"],
    body: ({ params }) => {
      const dictCode = params.dictCode;

      let list = null;

      if (dictCode == "gender") {
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
      } else if (dictCode == "notice_level") {
        list = [
          {
            value: "L",
            label: "低",
            tagType: "I",
          },
          {
            value: "M",
            label: "中",
            tagType: "W",
          },
          {
            value: "H",
            label: "高",
            tagType: "D",
          },
        ];
      } else if (dictCode == "notice_type") {
        list = [
          {
            value: "1",
            label: "系统升级",
            tagType: "S",
          },
          {
            value: "2",
            label: "系统维护",
            tagType: "P",
          },
          {
            value: "3",
            label: "安全警告",
            tagType: "D",
          },
          {
            value: "4",
            label: "假期通知",
            tagType: "S",
          },
          {
            value: "5",
            label: "公司新闻",
            tagType: "P",
          },
          {
            value: "99",
            label: "其他",
            tagType: "I",
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
  // 新增字典项
  {
    url: "dicts/:dictCode/items",
    method: ["POST"],
    body({ body }) {
      return {
        code: "00000",
        data: null,
        msg: "新增字典项" + body.label + "成功",
      };
    },
  },

  // 字典项表单数据
  {
    url: "dicts/:dictCode/items/:itemId/form",
    method: ["GET"],
    body: ({ params }) => {
      return {
        code: "00000",
        data: dictItemMap[params.itemId],
        msg: "一切ok",
      };
    },
  },

  // 修改字典项
  {
    url: "dicts/:dictCode/items/:itemId",
    method: ["PUT"],
    body({ body }) {
      return {
        code: "00000",
        data: null,
        msg: "修改字典项" + body.label + "成功",
      };
    },
  },

  // 删除字典
  {
    url: "dicts/:dictCode/items/:itemId",
    method: ["DELETE"],
    body({ params }) {
      return {
        code: "00000",
        data: null,
        msg: "删除字典" + params.itemId + "成功",
      };
    },
  },
]);

// 字典映射表数据
const dictMap: Record<string, any> = {
  1: {
    id: 1,
    name: "性别",
    dictCode: "gender",
    status: 1,
  },
};

// 字典项映射表数据
const dictItemMap: Record<string, any> = {
  1: {
    id: 1,
    value: "1",
    label: "男",
    sort: 1,
    status: 1,
    tagType: "P",
  },
  2: {
    id: 2,
    value: "2",
    label: "女",
    sort: 2,
    status: 1,
    tagType: "D",
  },
  3: {
    id: 3,
    value: "0",
    label: "保密",
    sort: 3,
    status: 1,
    tagType: "I",
  },
};
