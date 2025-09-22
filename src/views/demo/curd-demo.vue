<template>
  <div class="app-container h-full flex flex-1 flex-col">
    <div class="mb-10">
      <el-link
        href="https://gitee.com/youlaiorg/vue3-element-admin/blob/master/src/views/demo/curd-demo.vue"
        type="primary"
        target="_blank"
      >
        整合版示例源码 请点击>>>>
      </el-link>
    </div>

    <!-- 搜索 -->
    <page-search
      ref="searchRef"
      :search-config="searchConfig"
      @query-click="handleQueryClick"
      @reset-click="handleResetClick"
    />

    <!-- 列表 -->
    <page-content
      ref="contentRef"
      :content-config="contentConfig"
      @add-click="handleAddClick"
      @export-click="handleExportClick"
      @search-click="handleSearchClick"
      @toolbar-click="handleToolbarClick"
      @operate-click="handleOperateClick"
      @filter-change="handleFilterChange"
    >
      <template #status="scope">
        <el-tag :type="scope.row[scope.prop] == 1 ? 'success' : 'info'">
          {{ scope.row[scope.prop] == 1 ? "启用" : "禁用" }}
        </el-tag>
      </template>
      <template #gender="scope">
        <DictLabel v-model="scope.row[scope.prop]" code="gender" />
      </template>
      <template #mobile="scope">
        <el-text>{{ scope.row[scope.prop] }}</el-text>
        <copy-button
          v-if="scope.row[scope.prop]"
          :text="scope.row[scope.prop]"
          style="margin-left: 2px"
        />
      </template>
    </page-content>

    <!-- 新增 -->
    <page-modal ref="addModalRef" :modal-config="addModalConfig" @submit-click="handleSubmitClick">
      <template #gender="scope">
        <Dict v-model="scope.formData[scope.prop]" code="gender" v-bind="scope.attrs" />
      </template>
    </page-modal>

    <!-- 编辑 -->
    <page-modal
      ref="editModalRef"
      :modal-config="editModalConfig"
      @submit-click="handleSubmitClick"
    >
      <template #gender="scope">
        <Dict v-model="scope.formData[scope.prop]" code="gender" v-bind="scope.attrs" />
      </template>
    </page-modal>
  </div>
</template>

<script setup lang="ts">
import UserAPI from "@/api/system/user-api";
import DeptAPI from "@/api/system/dept-api";
import RoleAPI from "@/api/system/role-api";
import type { UserForm, UserPageQuery } from "@/api/system/user-api";
import type { IObject, IModalConfig, IContentConfig, ISearchConfig } from "@/components/CURD/types";
import { DeviceEnum } from "@/enums/settings/device-enum";
import { useAppStore } from "@/store";
import usePage from "@/components/CURD/usePage";

defineOptions({
  name: "CurdDemo",
  inheritAttrs: false,
});

// ========================= 选项数据管理 =========================
interface OptionType {
  label: string;
  value: any;
  [key: string]: any;
}

// 共享选项数据
const deptArr = ref<OptionType[]>([]);
const roleArr = ref<OptionType[]>([]);
const stateArr = ref<OptionType[]>([
  { label: "启用", value: 1 },
  { label: "禁用", value: 0 },
]);

// 初始化选项数据
const initOptions = async () => {
  try {
    const [dept, roles] = await Promise.all([DeptAPI.getOptions(), RoleAPI.getOptions()]);
    deptArr.value = dept;
    roleArr.value = roles;
  } catch (error) {
    console.error("初始化选项失败:", error);
  }
};

// ========================= 搜索配置 =========================
const searchConfig: ISearchConfig = reactive({
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
});

// ========================= 内容配置 =========================
const contentConfig: IContentConfig<UserPageQuery> = reactive({
  permPrefix: "sys:user",
  table: {
    border: true,
    highlightCurrentRow: true,
  },
  pagination: {
    background: true,
    layout: "prev,pager,next,jumper,total,sizes",
    pageSize: 20,
    pageSizes: [10, 20, 30, 50],
  },
  parseData(res: any) {
    return {
      total: res.total,
      list: res.list,
    };
  },
  indexAction(params: any) {
    return UserAPI.getPage(params);
  },
  deleteAction: UserAPI.deleteByIds,
  importAction(file: File) {
    return UserAPI.import("1", file);
  },
  exportAction: UserAPI.export,
  importTemplate: UserAPI.downloadTemplate,
  importsAction(data: any) {
    console.log("importsAction", data);
    return Promise.resolve();
  },
  async exportsAction(params: any) {
    const res = await UserAPI.getPage(params);
    console.log("exportsAction", res.list);
    return res.list;
  },
  pk: "id",
  toolbar: [
    "add",
    "delete",
    "import",
    "export",
    {
      name: "custom1",
      text: "自定义1",
      perm: "add",
      attrs: { icon: "plus", color: "#626AEF" },
    },
  ],
  defaultToolbar: ["refresh", "filter", "imports", "exports", "search"],
  cols: [
    { type: "selection", width: 50, align: "center" },
    { label: "编号", align: "center", prop: "id", width: 100, show: false },
    { label: "用户名", align: "center", prop: "username" },
    { label: "头像", align: "center", prop: "avatar", templet: "image" },
    { label: "用户昵称", align: "center", prop: "nickname", width: 120 },
    {
      label: "性别",
      align: "center",
      prop: "gender",
      width: 100,
      templet: "custom",
      slotName: "gender",
    },
    { label: "部门", align: "center", prop: "deptName", width: 120 },
    {
      label: "角色",
      align: "center",
      prop: "roleNames",
      width: 120,
      columnKey: "roleIds",
      filters: [],
      filterMultiple: true,
      filterJoin: ",",
      async initFn(colItem: any) {
        const roleOptions = await RoleAPI.getOptions();
        colItem.filters = roleOptions.map((item) => {
          return { text: item.label, value: item.value };
        });
      },
    },
    {
      label: "手机号码",
      align: "center",
      prop: "mobile",
      templet: "custom",
      slotName: "mobile",
      width: 150,
    },
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
      align: "center",
      fixed: "right",
      width: 280,
      templet: "tool",
      operat: [
        {
          name: "detail",
          text: "详情",
          attrs: { icon: "Document", type: "primary" },
        },
        {
          name: "reset_pwd",
          text: "重置密码",
          attrs: {
            icon: "refresh-left",
            style: {
              "--el-button-text-color": "#626AEF",
              "--el-button-hover-link-text-color": "#9197f4",
            },
          },
        },
        "edit",
        "delete",
      ],
    },
  ],
});

// ========================= 新增配置 =========================
const addModalConfig: IModalConfig<UserForm> = reactive({
  permPrefix: "sys:user",
  dialog: {
    title: "新增用户",
    width: 800,
    draggable: true,
  },
  form: {
    labelWidth: 100,
  },
  formAction: UserAPI.create,
  beforeSubmit(data: any) {
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
      col: {
        xs: 24,
        sm: 12,
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
      col: {
        xs: 24,
        sm: 12,
      },
    },
    {
      label: "所属部门",
      prop: "deptId",
      rules: [{ required: true, message: "所属部门不能为空", trigger: "change" }],
      type: "tree-select",
      attrs: {
        placeholder: "请选择所属部门",
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
    {
      label: "角色",
      prop: "roleIds",
      rules: [{ required: true, message: "用户角色不能为空", trigger: "change" }],
      type: "select",
      attrs: {
        placeholder: "请选择",
        multiple: true,
      },
      options: roleArr,
      initialValue: [],
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
});

// ========================= 编辑配置 =========================
const editModalConfig: IModalConfig<UserForm> = reactive({
  permPrefix: "sys:user",
  component: "drawer",
  drawer: {
    title: "修改用户",
    size: useAppStore().device === DeviceEnum.MOBILE ? "80%" : 500,
  },
  pk: "id",
  beforeSubmit(data: any) {
    console.log("beforeSubmit", data);
  },
  formAction(data: any) {
    return UserAPI.update(data.id as string, data);
  },
  formItems: [
    {
      label: "用户名",
      prop: "username",
      rules: [{ required: true, message: "用户名不能为空", trigger: "blur" }],
      type: "input",
      attrs: {
        placeholder: "请输入用户名",
        readonly: true,
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
    {
      label: "角色",
      prop: "roleIds",
      rules: [{ required: true, message: "用户角色不能为空", trigger: "blur" }],
      type: "select",
      attrs: {
        placeholder: "请选择",
        multiple: true,
      },
      options: roleArr,
      initialValue: [],
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
      type: "switch",
      attrs: {
        inlinePrompt: true,
        activeText: "正常",
        inactiveText: "禁用",
        activeValue: 1,
        inactiveValue: 0,
      },
    },
  ],
});

// ========================= 页面逻辑 =========================
const {
  searchRef,
  contentRef,
  addModalRef,
  editModalRef,
  handleQueryClick,
  handleResetClick,
  handleAddClick,
  handleEditClick,
  handleViewClick,
  handleSubmitClick,
  handleExportClick,
  handleSearchClick,
  handleFilterChange,
} = usePage();

// 其他工具栏
function handleToolbarClick(name: string) {
  console.log(name);
  if (name === "custom1") {
    ElMessage.success("点击了自定义1按钮");
  }
}

// 表格工具栏
const handleOperateClick = (data: IObject) => {
  if (data.name === "detail") {
    editModalConfig.drawer = { ...editModalConfig.drawer, title: "查看" };
    handleViewClick(data.row, async () => {
      return await UserAPI.getFormData(data.row.id);
    });
  } else if (data.name === "edit") {
    editModalConfig.drawer = { ...editModalConfig.drawer, title: "修改" };
    handleEditClick(data.row, async () => {
      return await UserAPI.getFormData(data.row.id);
    });
  } else if (data.name === "reset_pwd") {
    ElMessageBox.prompt("请输入用户「" + data.row.username + "」的新密码", "重置密码", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
    })
      .then(({ value }: any) => {
        if (!value || value.length < 6) {
          ElMessage.warning("密码至少需要6位字符，请重新输入");
          return false;
        }
        UserAPI.resetPassword(data.row.id, value).then(() => {
          ElMessage.success("密码重置成功，新密码是：" + value);
        });
      })
      .catch(() => {});
  }
};

// 初始化
onMounted(() => {
  initOptions();
});
</script>

<style scoped>
.app-container {
  padding: 20px;
}
</style>
