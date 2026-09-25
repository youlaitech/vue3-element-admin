import { defineMock } from "./base";

export default defineMock([
  {
    url: "dicts",
    method: ["GET"],
    body: {
      code: "00000",
      data: {
        list: [
          {
            id: "1",
            name: "性别",
            dictCode: "gender",
            status: 1,
          },
          {
            id: "2",
            name: "通知类型",
            dictCode: "notice_type",
            status: 1,
          },
          {
            id: "3",
            name: "通知级别",
            dictCode: "notice_level",
            status: 1,
          },
        ],
        total: 3,
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
        {
          value: "notice_type",
          label: "通知类型",
        },
        {
          value: "notice_level",
          label: "通知级别",
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
    body: ({ params }) => {
      const list = dictItemList[params.dictCode] ?? [];
      return {
        code: "00000",
        data: {
          list,
          total: list.length,
        },
        msg: "一切ok",
      };
    },
  },
  // 字典项列表
  {
    url: "dicts/:dictCode/items/options",
    method: ["GET"],
    body: ({ params }) => {
      const dictCode = params.dictCode;

      let list = null;

      if (dictCode === "gender") {
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
      } else if (dictCode === "notice_level") {
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
      } else if (dictCode === "notice_type") {
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
    id: "1",
    name: "性别",
    dictCode: "gender",
    status: 1,
  },
  2: {
    id: "2",
    name: "通知类型",
    dictCode: "notice_type",
    status: 1,
  },
  3: {
    id: "3",
    name: "通知级别",
    dictCode: "notice_level",
    status: 1,
  },
};

// 字典项数据：tagType 用全称，与 sql/youlai-admin.sql 种子数据保持一致
const dictItemList: Record<string, any[]> = {
  gender: [
    {
      id: "1",
      dictCode: "gender",
      label: "男",
      value: "1",
      sort: 1,
      status: 1,
      tagType: "primary",
    },
    { id: "2", dictCode: "gender", label: "女", value: "2", sort: 2, status: 1, tagType: "danger" },
    { id: "3", dictCode: "gender", label: "保密", value: "0", sort: 3, status: 1, tagType: "info" },
  ],
  notice_type: [
    {
      id: "4",
      dictCode: "notice_type",
      label: "系统升级",
      value: "1",
      sort: 1,
      status: 1,
      tagType: "success",
    },
    {
      id: "5",
      dictCode: "notice_type",
      label: "系统维护",
      value: "2",
      sort: 2,
      status: 1,
      tagType: "primary",
    },
    {
      id: "6",
      dictCode: "notice_type",
      label: "安全警告",
      value: "3",
      sort: 3,
      status: 1,
      tagType: "danger",
    },
    {
      id: "7",
      dictCode: "notice_type",
      label: "假期通知",
      value: "4",
      sort: 4,
      status: 1,
      tagType: "success",
    },
    {
      id: "8",
      dictCode: "notice_type",
      label: "公司新闻",
      value: "5",
      sort: 5,
      status: 1,
      tagType: "primary",
    },
    {
      id: "9",
      dictCode: "notice_type",
      label: "其他",
      value: "99",
      sort: 99,
      status: 1,
      tagType: "info",
    },
  ],
  notice_level: [
    {
      id: "10",
      dictCode: "notice_level",
      label: "低",
      value: "L",
      sort: 1,
      status: 1,
      tagType: "info",
    },
    {
      id: "11",
      dictCode: "notice_level",
      label: "中",
      value: "M",
      sort: 2,
      status: 1,
      tagType: "warning",
    },
    {
      id: "12",
      dictCode: "notice_level",
      label: "高",
      value: "H",
      sort: 3,
      status: 1,
      tagType: "danger",
    },
  ],
};

// 字典项映射表数据（按 id 取单条，供编辑回显）
const dictItemMap: Record<string, any> = Object.values(dictItemList)
  .flat()
  .reduce((map, item) => ({ ...map, [item.id]: item }), {});
