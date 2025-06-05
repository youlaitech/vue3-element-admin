import type { ISearchConfig } from "@/components/CURD/types";
import { deptArr, stateArr } from "../config/options";

const searchConfig: ISearchConfig = {
  grid: "right",
  colon: true,
  showNumber: 3,
  form: { labelPosition: "right", labelWidth: "90px" },
  cardAttrs: { shadow: "hover", style: { "margin-bottom": "12px" } },
  formItems: [
    {
      tips: { effect: "light", placement: "top", content: "自定义文字提示" },
      type: "input",
      label: "输入框",
      prop: "testInput",
      attrs: { placeholder: "请输入", clearable: true },
      events: {
        change: (e) => {
          console.log("输入框的值: ", e);
          // 级联操作示例，需要使用reactive提前定义数组
          // selectOptions.push({ label: e, value: e });
        },
      },
    },
    {
      type: "input-number",
      label: "数字输入框",
      prop: "testInputNumber",
      attrs: { placeholder: "请输入", controls: false },
    },
    {
      type: "select",
      label: "下拉选择框",
      prop: "testSelect",
      attrs: { placeholder: "全部", clearable: true },
      options: stateArr as any,
      events: {
        change(e) {
          console.log("选中的值: ", e);
        },
      },
    },
    {
      type: "tree-select",
      label: "树形选择框",
      prop: "testTreeSelect",
      attrs: {
        placeholder: "请选择",
        data: deptArr,
        filterable: true,
        "check-strictly": true,
        "render-after-expand": false,
        clearable: true,
      },
      // async initFn(formItem) {
      //   // 注意:如果initFn函数不是箭头函数,this会指向此配置项对象,那么也就可以用this来替代形参formItem
      //   formItem.attrs.data = await DeptAPI.getOptions();
      // },
    },
    {
      type: "cascader",
      label: "级联选择器",
      prop: "testCascader",
      attrs: {
        placeholder: "请选择",
        clearable: true,
        props: {
          expandTrigger: "hover",
          label: "label",
          value: "value",
          children: "children",
        },
        options: [
          {
            value: "guide",
            label: "Guide",
            children: [
              {
                value: "disciplines",
                label: "Disciplines",
                children: [
                  {
                    value: "consistency",
                    label: "Consistency",
                  },
                ],
              },
              {
                value: "navigation",
                label: "Navigation",
                children: [
                  {
                    value: "side nav",
                    label: "Side Navigation",
                  },
                ],
              },
            ],
          },
        ],
      },
    },
    {
      type: "date-picker",
      label: "范围选择器",
      prop: "createAt",
      attrs: {
        type: "daterange",
        "range-separator": "~",
        "start-placeholder": "开始时间",
        "end-placeholder": "截止时间",
        "value-format": "YYYY-MM-DD",
      },
    },
    {
      type: "date-picker",
      label: "日期选择器",
      prop: "testDataPicker",
      attrs: { placeholder: "请选择", type: "date" },
    },
    {
      type: "time-picker",
      label: "时间选择器",
      prop: "testTimePicker",
      attrs: { placeholder: "请选择", clearable: true },
    },
    {
      type: "time-select",
      label: "时间选择",
      prop: "testTimeSelect",
      attrs: { placeholder: "请选择", clearable: true },
    },
    {
      type: "input-tag",
      label: "标签选择器",
      prop: "testInputTags",
      attrs: { placeholder: "请选择", clearable: true },
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
  ],
};

export default searchConfig;
