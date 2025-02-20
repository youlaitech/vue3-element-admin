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

  // 所有字典列表
  {
    url: "dict/list",
    method: ["GET"],
    body() {
      return {
        code: "00000",
        data: [
          {
            name: "通知级别",
            dictCode: "notice_level",
            dictDataList: [
              {
                value: "L",
                label: "低",
                tagType: "info",
              },
              {
                value: "M",
                label: "中",
                tagType: "warning",
              },
              {
                value: "H",
                label: "高",
                tagType: "danger",
              },
            ],
          },
          {
            name: "通知类型",
            dictCode: "notice_type",
            dictDataList: [
              {
                value: "1",
                label: "系统升级",
                tagType: "success",
              },
              {
                value: "2",
                label: "系统维护",
                tagType: "primary",
              },
              {
                value: "3",
                label: "安全警告",
                tagType: "danger",
              },
              {
                value: "4",
                label: "假期通知",
                tagType: "success",
              },
              {
                value: "5",
                label: "公司新闻",
                tagType: "primary",
              },
              {
                value: "99",
                label: "其他",
                tagType: "info",
              },
            ],
          },
          {
            name: "性别",
            dictCode: "gender",
            dictDataList: [
              {
                value: "1",
                label: "男",
                tagType: "primary",
              },
              {
                value: "2",
                label: "女",
                tagType: "danger",
              },
              {
                value: "0",
                label: "保密",
                tagType: "info",
              },
            ],
          },
        ],
        msg: "一切ok",
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
