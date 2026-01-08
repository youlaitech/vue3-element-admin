import type { IContentConfig } from "@/components/CURD/types";

interface DemoQueryParams {
  pageNum?: number;
  pageSize?: number;
  [key: string]: any;
}

interface DemoItem {
  id: number;
  username: string;
  avatar: string;
  percent: number;
  price: number;
  url: string;
  icon: string;
  gender: number;
  status: number;
  status2: number;
  sort: number;
  createTime: number;
}

const contentConfig: IContentConfig<DemoQueryParams, DemoItem> = {
  // permPrefix: "sys:demo", // 不写不进行按钮权限校验
  table: {
    showOverflowTooltip: true,
  },
  pagePosition: "right",
  toolbar: [],
  indexAction(params) {
    // 模拟发起网络请求获取列表数据
    console.log("indexAction:", params);
    const list = [
      {
        id: 1,
        username: "root",
        avatar: "https://foruda.gitee.com/images/1723603502796844527/03cdca2a_716974.gif",
        percent: 99,
        price: 10,
        url: "https://www.baidu.com",
        icon: "el-icon-setting",
        gender: 1,
        status: 1,
        status2: 1,
        sort: 99,
        createTime: 1715647982437,
      },
      {
        id: 2,
        username: "jerry",
        avatar: "https://foruda.gitee.com/images/1723603502796844527/03cdca2a_716974.gif",
        percent: 88,
        price: 999,
        url: "https://www.google.com",
        icon: "el-icon-user",
        gender: 0,
        status: 0,
        status2: 0,
        sort: 0,
        createTime: 1715648977426,
      },
    ];

    const pageNum = Number(params?.pageNum ?? 1) || 1;
    const pageSize = Number(params?.pageSize ?? list.length) || list.length;
    const start = (pageNum - 1) * pageSize;
    const end = start + pageSize;

    return Promise.resolve({
      data: list.slice(start, end),
      page: {
        pageNum,
        pageSize,
        total: list.length,
      },
    });
  },
  modifyAction(data) {
    // 模拟发起网络请求修改字段
    // console.log("modifyAction:", data);
    ElMessage.success(JSON.stringify(data));
    return Promise.resolve(null);
  },
  cols: [
    { type: "index", width: 50, align: "center" },
    { label: "ID", align: "center", prop: "id", show: false },
    { label: "文本", align: "center", prop: "username" },
    { label: "图片", align: "center", prop: "avatar", templet: "image" },
    {
      label: "百分比",
      align: "center",
      prop: "percent",
      templet: "percent",
    },
    {
      label: "货币符",
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
      selectList: { "0": "女", "1": "男" },
    },
    {
      label: "自定义",
      align: "center",
      prop: "status",
      templet: "custom",
      slotName: "status",
    },
    {
      label: "Switch",
      align: "center",
      prop: "status2",
      templet: "switch",
      activeValue: 1,
      inactiveValue: 0,
      activeText: "启用",
      inactiveText: "禁用",
    },
    {
      label: "输入框",
      align: "center",
      prop: "sort",
      templet: "input",
      inputType: "number",
    },
    {
      label: "日期格式化",
      align: "center",
      prop: "createTime",
      minWidth: 120,
      templet: "date",
      dateFormat: "YYYY/MM/DD HH:mm:ss",
    },
    {
      label: "操作栏",
      align: "center",
      fixed: "right",
      width: 220,
      templet: "tool",
      operat: [
        "view",
        "edit",
        {
          name: "delete",
          text: "展示删除",
          perm: "delete",
          attrs: { icon: "delete", type: "danger" },
          render(row) {
            // 根据条件，显示或隐藏
            return row.id !== 1;
          },
        },
      ],
    },
  ],
};

export default contentConfig;
