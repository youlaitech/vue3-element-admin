import UserAPI from "@/api/user";
import type { UserQuery } from "@/api/user/model";
import type { IContentConfig } from "@/components/PageContent/index.vue";

const contentConfig: IContentConfig<UserQuery> = {
  pageName: "sys:user",
  table: {
    border: true,
    highlightCurrentRow: true,
  },
  indexAction: function (params) {
    if ("createAt" in params) {
      const createAt = params.createAt as string[];
      params.startTime = createAt[0];
      params.endTime = createAt[1];
      delete params.createAt;
    }
    return UserAPI.getPage(params);
  },
  deleteAction: UserAPI.deleteByIds,
  exportAction: UserAPI.export,
  pk: "id",
  toolbar: [
    "add",
    "delete",
    "export",
    {
      name: "import",
      icon: "upload",
      text: "导入",
      auth: "import",
    },
  ],
  cols: [
    { type: "selection", width: 50, align: "center" },
    { label: "编号", align: "center", prop: "id", width: 100, show: false },
    { label: "用户名", align: "center", prop: "username" },
    { label: "头像", align: "center", prop: "avatar", templet: "image" },
    { label: "用户昵称", align: "center", prop: "nickname", width: 120 },
    { label: "性别", align: "center", prop: "genderLabel", width: 100 },
    { label: "部门", align: "center", prop: "deptName", width: 120 },
    { label: "手机号码", align: "center", prop: "mobile", width: 120 },
    {
      label: "状态",
      align: "center",
      prop: "status",
      templet: "custom",
      slotName: "status",
    },
    { label: "创建时间", align: "center", prop: "createTime", width: 180 },
    {
      label: "操作",
      fixed: "right",
      width: 220,
      templet: "tool",
      operat: [
        {
          name: "reset_pwd",
          auth: "password:reset",
          icon: "refresh-left",
          text: "重置密码",
        },
        "edit",
        "delete",
      ],
    },
  ],
};

export default contentConfig;
