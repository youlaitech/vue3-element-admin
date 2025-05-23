import type { UserForm } from "@/api/system/user.api";
import type { IModalConfig } from "@/components/CURD/types";
import { deptArr } from "../config/options";

const modalConfig: IModalConfig<UserForm> = {
  colon: true,
  dialog: {
    title: "二级弹窗",
    width: 500,
    draggable: true,
  },
  form: {
    labelWidth: "auto",
    labelPosition: "top",
  },
  formItems: [
    {
      label: "用户名",
      prop: "username",
      rules: [{ required: true, message: "用户名不能为空", trigger: "blur" }],
      type: "input",
      attrs: { placeholder: "请输入" },
    },
    {
      label: "用户昵称",
      prop: "nickname",
      rules: [{ required: true, message: "用户昵称不能为空", trigger: "blur" }],
      type: "input",
      attrs: { placeholder: "请输入" },
    },
    {
      label: "所属部门",
      prop: "deptId",
      rules: [{ required: true, message: "所属部门不能为空", trigger: "change" }],
      type: "tree-select",
      attrs: {
        placeholder: "请选择",
        data: deptArr,
        filterable: true,
        "check-strictly": true,
        "render-after-expand": false,
      },
    },
    {
      type: "custom",
      label: "性别",
      prop: "gender",
      initialValue: 1,
      attrs: { style: { width: "100%" } },
    },
  ],
};

// 如果有异步数据会修改配置的，推荐用reactive包裹，而纯静态配置的可以直接导出
export default reactive(modalConfig);
