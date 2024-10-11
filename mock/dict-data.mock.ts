import { defineMock } from "./base";

export default defineMock([
  {
    url: "dict-data/page",
    method: ["GET"],
    body: {
      code: "00000",
      data: {
        list: [
          {
            id: 1,
            dictCode: "gender",
            label: "男",
            value: "1",
            sort: 1,
            status: 1,
          },
          {
            id: 2,
            dictCode: "gender",
            label: "女",
            value: "2",
            sort: 2,
            status: 1,
          },
          {
            id: 3,
            dictCode: "gender",
            label: "保密",
            value: "0",
            sort: 3,
            status: 1,
          },
        ],
        total: 3,
      },
      msg: "一切ok",
    },
  },

  {
    url: "dict-data/:dictCode/options",
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
            tag: "info",
          },
          {
            value: "M",
            label: "中",
            tag: "warning",
          },
          {
            value: "H",
            label: "高",
            tag: "danger",
          },
        ];
      } else if (dictCode == "notice_type") {
        list = [
          {
            value: "1",
            label: "系统升级",
            tag: "success",
          },
          {
            value: "2",
            label: "系统维护",
            tag: "primary",
          },
          {
            value: "3",
            label: "安全警告",
            tag: "danger",
          },
          {
            value: "4",
            label: "假期通知",
            tag: "success",
          },
          {
            value: "5",
            label: "公司新闻",
            tag: "primary",
          },
          {
            value: "99",
            label: "其他",
            tag: "info",
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
  // 新增字典数据
  {
    url: "dict-data",
    method: ["POST"],
    body({ body }) {
      return {
        code: "00000",
        data: null,
        msg: "新增字典" + body.name + "成功",
      };
    },
  },

  // 获取字典数据表单
  {
    url: "dict-data/:id/form",
    method: ["GET"],
    body: ({ params }) => {
      return {
        code: "00000",
        data: dictMap[params.id],
        msg: "一切ok",
      };
    },
  },

  // 修改字典数据
  {
    url: "dict-data/:id",
    method: ["PUT"],
    body({ body }) {
      return {
        code: "00000",
        data: null,
        msg: "修改字典数据" + body.name + "成功",
      };
    },
  },

  // 删除字典
  {
    url: "dict-data/:id",
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

// 字典数据映射表数据
const dictMap: Record<string, any> = {
  1: {
    code: "00000",
    data: {
      id: 1,
      value: "1",
      label: "男",
      sort: 1,
      status: 1,
      tagType: "primary",
    },
    msg: "一切ok",
  },
  2: {
    code: "00000",
    data: {
      id: 2,
      value: "2",
      label: "女",
      sort: 2,
      status: 1,
      tagType: "danger",
    },
    msg: "一切ok",
  },
  3: {
    code: "00000",
    data: {
      id: 3,
      value: "0",
      label: "保密",
      sort: 3,
      status: 1,
      tagType: "info",
    },
    msg: "一切ok",
  },
};
