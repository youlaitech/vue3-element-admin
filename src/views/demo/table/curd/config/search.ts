import type { ISearchConfig } from "@/components/CURD/types";
import { deptArr, stateArr } from "./options";

const searchConfig: ISearchConfig = {
  permPrefix: "sys:user",
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
    },
    {
      type: "tree-select",
      label: "部门",
      prop: "deptId",
      attrs: {
        placeholder: "请选择",
        data: deptArr,
        filterable: true,
        "check-strictly": true,
        "render-after-expand": false,
        clearable: true,
        style: { width: "200px" },
      },
      // async initFn(formItem) {
      //   // 注意:如果initFn函数不是箭头函数,this会指向此配置项对象,那么也就可以用this来替代形参formItem
      //   formItem.attrs.data = await DeptAPI.getOptions();
      // },
    },
    {
      type: "select",
      label: "状态",
      prop: "status",
      attrs: {
        placeholder: "全部",
        clearable: true,
        style: { width: "200px" },
      },
      options: stateArr,
    },
    {
      type: "date-picker",
      label: "创建时间",
      prop: "createTime",
      attrs: {
        type: "daterange",
        "range-separator": "~",
        "start-placeholder": "开始时间",
        "end-placeholder": "截止时间",
        "value-format": "YYYY-MM-DD",
        style: { width: "200px" },
      },
    },
  ],
};

export default searchConfig;
