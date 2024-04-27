import type { IModalConfig } from "@/components/PageModal/index.vue";

const modalConfig: IModalConfig = {
  pageName: "sys:user",
  dialog: {
    title: "修改用户",
    width: 800,
    appendToBody: true,
  },
  formAction: function (data) {
    console.log("edit", data);
    return new Promise((resolve, reject) => {
      resolve({
        code: "00000",
        data: null,
        msg: "修改成功",
      });
    });
  },
  formItems: [
    {
      type: "input",
      label: "用户名",
      prop: "username",
      attrs: {
        placeholder: "请输入用户名",
        readonly: true,
      },
    },
    {
      type: "input",
      label: "用户昵称",
      prop: "nickname",
      attrs: {
        placeholder: "请输入用户昵称",
      },
    },
    {
      type: "tree-select",
      label: "所属部门",
      prop: "deptId",
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
      type: "select",
      label: "角色",
      prop: "roleIds",
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
      attrs: {
        placeholder: "请输入手机号码",
        maxlength: 11,
      },
    },
    {
      type: "input",
      label: "邮箱",
      prop: "email",
      attrs: {
        placeholder: "请输入邮箱",
        maxlength: 50,
      },
    },
    {
      type: "radio",
      label: "状态",
      prop: "status",
      options: [
        { label: "正常", value: 1 },
        { label: "禁用", value: 0 },
      ],
      initialValue: 1,
    },
  ],
  formRules: {
    username: [{ required: true, message: "用户名不能为空", trigger: "blur" }],
    nickname: [
      { required: true, message: "用户昵称不能为空", trigger: "blur" },
    ],
    deptId: [{ required: true, message: "所属部门不能为空", trigger: "blur" }],
    roleIds: [{ required: true, message: "用户角色不能为空", trigger: "blur" }],
    email: [
      {
        pattern: /\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}/,
        message: "请输入正确的邮箱地址",
        trigger: "blur",
      },
    ],
    mobile: [
      {
        pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
        message: "请输入正确的手机号码",
        trigger: "blur",
      },
    ],
  },
};

export default modalConfig;
