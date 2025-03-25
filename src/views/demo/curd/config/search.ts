import DeptAPI from "@/api/system/dept.api";
import type { ISearchConfig } from "@/components/CURD/types";

const searchConfig: ISearchConfig = {
  pageName: "sys:user",
  colon: false,
  formItems: [
    {
      tips: "支持模糊搜索",
      type: "input",
      label: "关键字",
      prop: "keywords",
      attrs: {
        placeholder: "用户名/昵称/手机号",
        clearable: true,
        style: { width: "200px" },
      },
      events: {
        // 监听输入框输入事件
        blur: (e) => console.log("失去焦点: ", e),
        focus: (e) => console.log("获得焦点: ", e),
      },
    },
    {
      type: "tree-select",
      label: "部门",
      prop: "deptId",
      attrs: {
        placeholder: "请选择",
        data: [],
        filterable: true,
        "check-strictly": true,
        "render-after-expand": false,
        clearable: true,
        style: { width: "200px" },
      },
      async initFn(formItem) {
        formItem.attrs.data = await DeptAPI.getOptions();
        // 注意:如果initFn函数不是箭头函数,this会指向此配置项对象,那么也就可以用this来替代形参formItem
        // this.attrs!.data = await DeptAPI.getOptions();
      },
    },
    {
      tips: { effect: "light", placement: "top", content: "自定义文字提示" },
      type: "select",
      label: "状态",
      prop: "status",
      attrs: {
        placeholder: "全部",
        clearable: true,
        style: { width: "200px" },
      },
      options: [
        { label: "启用", value: 1 },
        { label: "禁用", value: 0 },
      ],
      events: {
        change: (e) => console.log("发生变化: ", e),
      },
    },
    {
      type: "date-picker",
      label: "创建时间",
      prop: "createAt",
      attrs: {
        type: "daterange",
        "range-separator": "~",
        "start-placeholder": "开始时间",
        "end-placeholder": "截止时间",
        "value-format": "YYYY-MM-DD",
        style: { width: "200px" },
      },
    },
    {
      type: "date-picker",
      label: "日期选择器",
      prop: "testDataPicker",
      attrs: {
        type: "date",
        placeholder: "选择日期",
        style: { width: "200px" },
      },
    },
    {
      type: "input-number",
      label: "数字输入框",
      prop: "testInputNumber",
      attrs: {
        controls: false,
        placeholder: "请输入数字",
        style: { width: "200px" },
      },
    },
    {
      type: "input-tag",
      label: "标签选择器",
      prop: "testInputTags",
      attrs: {
        clearable: true,
        placeholder: "请输入",
      },
    },
    {
      type: "custom-tag",
      label: "标签选择器",
      prop: "testCustomTags",
      attrs: {
        buttonAttrs: { btnText: "+ New Tag" },
        inputAttrs: {},
        tagAttrs: {},
      },
    },
    {
      type: "time-picker",
      label: "时间选择器",
      prop: "testTimePicker",
      attrs: {
        style: { width: "200px" },
      },
    },
    {
      type: "time-select",
      label: "时间选择",
      prop: "testTimeSelect",
      attrs: {
        style: { width: "200px" },
      },
    },
  ],
};

export default searchConfig;
