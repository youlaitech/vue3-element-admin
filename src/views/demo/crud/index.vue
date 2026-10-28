<template>
  <CrudPage
    :search-config="searchConfig"
    :table-config="tableConfig"
    :form-config="formConfig"
    :load-form-data="loadUserForm"
  >
    <!-- 字典字段用字典标签展示，状态字段用标签区分 -->
    <template #table-cell-gender="{ row }">
      <DictTag :model-value="row.gender" code="gender" />
    </template>
    <template #table-cell-status="{ row }">
      <el-tag :type="row.status === 1 ? 'success' : 'info'">
        {{ row.status === 1 ? "启用" : "禁用" }}
      </el-tag>
    </template>
    <!-- 表单里的性别改为字典下拉，插槽内自行绑定 v-model -->
    <template #form-gender="{ formData, prop, attrs }">
      <DictSelect v-model="formData[prop]" code="gender" v-bind="attrs" />
    </template>
  </CrudPage>
</template>

<script setup lang="ts">
import { ref } from "vue";
import DeptAPI from "@/api/system/dept";
import RoleAPI from "@/api/system/role";
import UserAPI from "@/api/system/user";
import type { OptionItem } from "@/api/common";
import type { UserForm, UserItem, UserQuery } from "@/api/system/user";
import type {
  CrudFormConfig,
  CrudRecord,
  CrudSearchConfig,
  CrudTableConfig,
} from "@/components/Crud/types";

// 部门、角色选项供搜索区和表单共用
const departments = ref<OptionItem[]>([]);
const roles = ref<OptionItem[]>([]);
const roleRequest = RoleAPI.getOptions();
void roleRequest
  .then((value) => {
    roles.value = value;
  })
  .catch(() => undefined);
void DeptAPI.getOptions()
  .then((value) => {
    departments.value = value;
  })
  .catch(() => undefined);

// 搜索区字段
const searchConfig: CrudSearchConfig = {
  fields: [
    {
      type: "input",
      prop: "keywords",
      label: "关键词",
      attrs: { placeholder: "用户名、昵称或手机", clearable: true },
    },
    {
      type: "tree-select",
      prop: "deptId",
      label: "部门",
      attrs: { data: departments, checkStrictly: true, filterable: true, clearable: true },
    },
    {
      type: "select",
      prop: "status",
      label: "状态",
      initialValue: null,
      attrs: { clearable: true },
      options: [
        { label: "启用", value: 1 },
        { label: "禁用", value: 0 },
      ],
    },
    {
      type: "date-picker",
      prop: "createTime",
      label: "创建时间",
      initialValue: [],
      attrs: {
        type: "daterange",
        valueFormat: "YYYY-MM-DD",
        startPlaceholder: "开始日期",
        endPlaceholder: "结束日期",
      },
    },
  ],
};

// 列表配置
const tableConfig: CrudTableConfig<UserQuery, UserItem> = {
  permissionPrefix: "sys:user",
  table: { border: true },
  fetchData: UserAPI.getPage,
  deleteByIds: UserAPI.deleteByIds,
  importFile: UserAPI.import,
  exportFile: UserAPI.export,
  importTemplate: UserAPI.downloadTemplate,
  toolbarActions: ["create", "delete", "import", "export"],
  tableTools: ["refresh", "columns", "search"],
  columns: [
    { type: "selection", width: 50 },
    { prop: "id", label: "编号", show: false },
    { prop: "username", label: "用户名", minWidth: 130 },
    { prop: "nickname", label: "昵称", minWidth: 120 },
    { prop: "avatar", label: "头像", cellType: "image", width: 80 },
    { prop: "gender", label: "性别", width: 80 },
    { prop: "deptName", label: "部门", minWidth: 120 },
    {
      prop: "roleNames",
      columnKey: "roleIds",
      label: "角色",
      minWidth: 140,
      filterJoin: ",",
      /**
       * 加载角色筛选项，提交值为角色 ID。
       */
      async onInit(column) {
        column.filters = (await roleRequest).map((role) => ({
          text: role.label,
          value: role.value,
        }));
      },
    },
    { prop: "mobile", label: "手机号码", minWidth: 150 },
    { prop: "status", label: "状态", width: 90 },
    { prop: "createTime", label: "创建时间", width: 180, sortable: "custom" },
    {
      prop: "actions",
      label: "操作",
      cellType: "actions",
      fixed: "right",
      width: 240,
      actions: [
        "edit",
        "delete",
        "view",
        {
          key: "resetPassword",
          label: "重置密码",
          permission: "sys:user:reset-password",
          /**
           * 输入新密码并提交重置请求，取消时不提交。
           */
          async onClick({ row }) {
            if (!row) return;
            const result = await ElMessageBox.prompt("请输入新密码", "重置密码", {
              inputType: "password",
              inputPattern: /^.{6,20}$/,
              inputErrorMessage: "密码长度为 6 至 20 位",
            }).catch(() => undefined);
            if (!result) return;
            await UserAPI.resetPassword(String(row.id), result.value);
            ElMessage.success("密码已重置");
          },
        },
      ],
    },
  ],
};

// 表单配置
const formConfig: CrudFormConfig<UserForm> = {
  title: ({ mode }) => ({ create: "新增用户", edit: "编辑用户", view: "查看用户" })[mode],
  dialog: { width: 560 },
  /**
   * 保存用户，更新目标使用打开表单时的主键。
   */
  submitForm(data, { mode, id }) {
    if (mode === "create") return UserAPI.create(data);
    if (id === undefined) throw new Error("缺少用户 ID");
    return UserAPI.update(String(id), data);
  },
  fields: [
    {
      type: "input",
      prop: "username",
      label: "用户名",
      required: true,
      readonly: ({ mode }) => mode !== "create",
    },
    { type: "input", prop: "nickname", label: "用户昵称", required: true },
    // 更新接口会写入头像，表单不展示时也需保留原值。
    { type: "input", prop: "avatar", label: "头像", hidden: true },
    {
      type: "tree-select",
      prop: "deptId",
      label: "所属部门",
      required: true,
      attrs: {
        data: departments,
        checkStrictly: true,
        filterable: true,
        renderAfterExpand: false,
      },
    },
    { type: "custom", prop: "gender", label: "性别", initialValue: 1 },
    {
      type: "select",
      prop: "roleIds",
      label: "角色",
      options: roles,
      initialValue: [],
      attrs: { multiple: true },
      rules: [{ type: "array", required: true, min: 1, message: "请选择角色", trigger: "change" }],
    },
    {
      type: "input",
      prop: "mobile",
      label: "手机号码",
      attrs: { maxlength: 11 },
      // 允许留空，填写时与后端校验规则一致。
      rules: [
        {
          pattern: /^1(3\d|4[5-9]|5[0-35-9]|6[2567]|7[0-8]|8\d|9[0-35-9])\d{8}$/,
          message: "手机号码格式不正确",
          trigger: "blur",
        },
      ],
    },
    {
      type: "input",
      prop: "email",
      label: "邮箱",
      rules: [{ type: "email", message: "请输入有效邮箱", trigger: "blur" }],
    },
    {
      type: "switch",
      prop: "status",
      label: "状态",
      initialValue: 1,
      attrs: { activeValue: 1, inactiveValue: 0 },
    },
  ],
};

/**
 * 加载编辑和查看所需的用户详情。
 */
function loadUserForm(row: CrudRecord): Promise<UserForm> {
  return UserAPI.getFormData(String(row.id));
}
</script>
