import type { IContentConfig } from "@/components/PageContent/index.vue";

const contentConfig: IContentConfig = {
  pageName: "sys:user",
  indexAction: function (params) {
    return Promise.resolve({
      total: 2,
      list: [
        {
          id: 1,
          username: "tom",
          avatar:
            "https://oss.youlai.tech/youlai-boot/2023/05/16/811270ef31f548af9cffc026dfc3777b.gif",
          percent: 99,
          price: 10,
          url: "https://www.baidu.com",
          icon: "el-icon-setting",
          gender: 1,
          status: 1,
          createTime: 1715647982437,
        },
        {
          id: 2,
          username: "jerry",
          avatar:
            "https://oss.youlai.tech/youlai-boot/2023/05/16/811270ef31f548af9cffc026dfc3777b.gif",
          percent: 88,
          price: 999,
          url: "https://www.google.com",
          icon: "el-icon-user",
          gender: 0,
          status: 0,
          createTime: 1715648977426,
        },
      ],
    });
  },
  cols: [
    { type: "selection", width: 50, align: "center" },
    { label: "ID", align: "center", prop: "id" },
    { label: "用户名", align: "center", prop: "username" },
    { label: "图片", align: "center", prop: "avatar", templet: "image" },
    {
      label: "百分比",
      align: "center",
      prop: "percent",
      templet: "percent",
    },
    {
      label: "价格",
      align: "center",
      prop: "price",
      templet: "price",
      priceFormat: "$",
    },
    { label: "链接", align: "center", prop: "url", width: 180, templet: "url" },
    { label: "图标", align: "center", prop: "icon", templet: "icon" },
    {
      label: "列表值",
      align: "center",
      prop: "gender",
      templet: "list",
      selectList: { 0: "女", 1: "男" },
    },
    {
      label: "自定义",
      align: "center",
      prop: "status",
      templet: "custom",
      slotName: "status",
    },
    {
      label: "创建时间",
      align: "center",
      prop: "createTime",
      minWidth: 120,
      templet: "date",
      dateFormat: "YYYY/MM/DD HH:mm:ss",
    },
    {
      label: "操作",
      align: "center",
      fixed: "right",
      width: 150,
      templet: "tool",
      operat: ["edit", "delete"],
    },
  ],
};

export default contentConfig;
