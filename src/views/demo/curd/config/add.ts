import UserAPI from "@/api/user";
import type { UserForm } from "@/api/user/model";
import type { IModalConfig } from "@/components/PageModal/index.vue";

const modalConfig: IModalConfig<UserForm> = {
  pageName: "sys:user",
  dialog: {
    title: "新增用户",
    width: 800,
    draggable: true,
  },
  form: {
    labelWidth: 100,
  },
  formAction: UserAPI.add,
  beforeSubmit(data) {
    console.log("提交之前处理", data);
  },
  formItems: [
    {
      label: "用户名",
      prop: "username",
      rules: [{ required: true, message: "用户名不能为空", trigger: "blur" }],
      type: "input",
      attrs: {
        placeholder: "请输入用户名",
      },
    },
    {
      label: "用户昵称",
      prop: "nickname",
      rules: [{ required: true, message: "用户昵称不能为空", trigger: "blur" }],
      type: "input",
      attrs: {
        placeholder: "请输入用户昵称",
      },
    },
    {
      label: "所属部门",
      prop: "deptId",
      rules: [{ required: true, message: "所属部门不能为空", trigger: "blur" }],
      type: "tree-select",
      attrs: {
        placeholder: "请选择所属部门",
        data: [
          {
            value: 1,
            label: "有来技术",
            children: [
              {
                value: 2,
                label: "研发部门",
              },
              {
                value: 3,
                label: "测试部门",
              },
            ],
          },
        ],
        filterable: true,
        "check-strictly": true,
        "render-after-expand": false,
      },
    },
    {
      type: "select",
      label: "性别",
      prop: "gender",
      attrs: {
        placeholder: "请选择",
      },
      options: [
        { label: "男", value: 1 },
        { label: "女", value: 2 },
        { label: "未知", value: 0 },
      ],
    },
    {
      label: "角色",
      prop: "roleIds",
      rules: [{ required: true, message: "用户角色不能为空", trigger: "blur" }],
      type: "select",
      attrs: {
        placeholder: "请选择",
        multiple: true,
      },
      options: [
        { label: "系统管理员", value: 2 },
        { label: "系统管理员1", value: 4 },
        { label: "系统管理员2", value: 5 },
        { label: "系统管理员3", value: 6 },
        { label: "系统管理员4", value: 7 },
        { label: "系统管理员5", value: 8 },
        { label: "系统管理员6", value: 9 },
        { label: "系统管理员7", value: 10 },
        { label: "系统管理员8", value: 11 },
        { label: "访问游客", value: 3 },
      ],
    },
    {
      type: "input",
      label: "手机号码",
      prop: "mobile",
      rules: [
        {
          pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
          message: "请输入正确的手机号码",
          trigger: "blur",
        },
      ],
      attrs: {
        placeholder: "请输入手机号码",
        maxlength: 11,
      },
    },
    {
      label: "邮箱",
      prop: "email",
      rules: [
        {
          pattern: /\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}/,
          message: "请输入正确的邮箱地址",
          trigger: "blur",
        },
      ],
      type: "input",
      attrs: {
        placeholder: "请输入邮箱",
        maxlength: 50,
      },
    },
    {
      label: "状态",
      prop: "status",
      type: "radio",
      options: [
        { label: "正常", value: 1 },
        { label: "禁用", value: 0 },
      ],
      initialValue: 1,
    },
  ],
};

export default modalConfig;
