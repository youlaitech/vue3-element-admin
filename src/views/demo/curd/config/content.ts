import type { IContentConfig } from "@/components/PageContent/index.vue";
import { exportUser } from "@/api/user";

const contentConfig: IContentConfig = {
  pageName: "sys:user",
  table: {
    border: true,
    highlightCurrentRow: true,
  },
  indexAction: function (data) {
    console.log("index", data);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve({
          code: "00000",
          data: {
            list: [
              {
                id: 2,
                username: "admin",
                nickname: "系统管理员",
                mobile: "17621210366",
                genderLabel: "男",
                avatar:
                  "https://oss.youlai.tech/youlai-boot/2023/05/16/811270ef31f548af9cffc026dfc3777b.gif",
                email: null,
                status: 1,
                deptName: "有来技术",
                roleNames: "系统管理员",
                createTime: "2019-10-10",
              },
              {
                id: 3,
                username: "test",
                nickname: "测试小用户",
                mobile: "17621210366",
                genderLabel: "男",
                avatar:
                  "https://oss.youlai.tech/youlai-boot/2023/05/16/811270ef31f548af9cffc026dfc3777b.gif",
                email: null,
                status: 1,
                deptName: "测试部门",
                roleNames: "访问游客",
                createTime: "2021-06-05",
              },
            ],
            total: 2,
          },
          msg: "一切ok",
        });
      }, 800);
    });
  },
  deleteAction: function (id) {
    console.log("delete", id);
    return new Promise((resolve, reject) => {
      resolve({
        code: "00000",
        data: null,
        msg: "删除成功",
      });
    });
  },
  exportAction: function (queryParams) {
    // 导出Excel文件
    return exportUser(queryParams as any);
  },
  pk: "id",
  toolbar: [
    "refresh",
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
    { label: "编号", align: "center", prop: "id", width: 100 },
    { label: "用户名", align: "center", prop: "username" },
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
          auth: "reset_pwd",
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
