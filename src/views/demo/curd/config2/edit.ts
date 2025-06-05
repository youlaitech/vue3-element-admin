import type { IModalConfig } from "@/components/CURD/types";
import { DeviceEnum } from "@/enums/settings/device.enum";
import { useAppStore } from "@/store";

const modalConfig: IModalConfig = {
  permPrefix: "sys:user",
  component: "drawer",
  colon: true,
  pk: "id",
  drawer: {
    title: "修改用户",
    size: useAppStore().device === DeviceEnum.MOBILE ? "80%" : 500,
  },
  form: { labelPosition: "right", labelWidth: "auto" },
  beforeSubmit(data) {
    console.log("beforeSubmit", data);
  },
  formAction(data) {
    // return UserAPI.update(data.id as string, data);
    // 模拟发起网络请求修改字段
    ElMessage.success(JSON.stringify(data));
    return Promise.resolve(null);
  },
  formItems: [
    {
      tips: { effect: "light", placement: "top", content: "自定义文字提示" },
      type: "input",
      label: "文本",
      prop: "username",
      attrs: { placeholder: "请输入", clearable: true },
    },
    {
      type: "input-number",
      label: "百分比",
      prop: "percent",
      attrs: { placeholder: "请输入", controls: false },
      slotName: "suffix",
    },
    {
      type: "input-number",
      label: "货币符",
      prop: "price",
      attrs: { placeholder: "请输入", controls: false },
      slotName: "prefix",
    },
    {
      type: "input",
      label: "链接",
      prop: "url",
      attrs: { placeholder: "请输入", clearable: true },
    },
    {
      type: "icon-select",
      label: "链接",
      prop: "icon",
    },
    {
      type: "custom",
      label: "列表值",
      prop: "gender",
      slotName: "gender",
      attrs: { style: { width: "100%" } },
    },
    {
      type: "select",
      label: "自定义",
      prop: "status",
      attrs: { placeholder: "全部", clearable: true },
      options: [
        { label: "启用", value: 1 },
        { label: "禁用", value: 0 },
      ],
    },
    {
      type: "switch",
      label: "Switch",
      prop: "status2",
      attrs: {
        inlinePrompt: true,
        activeValue: 1,
        inactiveValue: 0,
        activeText: "启用",
        inactiveText: "禁用",
      },
    },
    {
      type: "input-number",
      label: "输入框",
      prop: "sort",
      attrs: { placeholder: "请输入", controls: false },
    },
    {
      type: "date-picker",
      label: "日期格式化",
      prop: "createTime",
      attrs: {
        type: "datetime",
        format: "YYYY/MM/DD hh:mm:ss",
        "value-format": "x",
      },
    },
  ],
};

export default reactive(modalConfig);
