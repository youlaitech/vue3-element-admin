<template>
  <div class="page-container">
    <!-- 表格 -->
    <VxeGrid ref="xGridDom" v-bind="xGridOpt" v-on="xGridEvents">
      <!-- 搜索 -->
      <template #search-createTime="{ data, field }">
        <el-date-picker
          v-model="data[field]"
          class="w-full"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="截止日期"
          value-format="YYYY-MM-DD"
          :editable="false"
          clearable
        />
      </template>
      <!-- 左侧按钮列表 -->
      <template #toolbar-btns>
        <VxeButton status="primary" icon="vxe-icon-add" @click="crudStore.onShowModal()">
          新增用户
        </VxeButton>
        <VxeButton status="danger" icon="vxe-icon-delete" @click="crudStore.onDelete()">
          批量删除
        </VxeButton>
      </template>
      <!-- 展开行 -->
      <template #column-expand="{ row }">
        <div style="padding: 20px">
          <ul>
            <li>
              <span>ID：</span>
              <span>{{ row.id }}</span>
            </li>
            <li>
              <span>用户名：</span>
              <span>{{ row.username }}</span>
            </li>
            <li>
              <span>创建时间：</span>
              <span>{{ row.createTime }}</span>
            </li>
          </ul>
        </div>
      </template>
      <!-- 角色列 -->
      <template #column-roles="{ row, column }">
        <el-tag
          v-for="(role, index) in row[column.field].split(',')"
          :key="index"
          :type="role === 'admin' ? 'primary' : 'warning'"
          effect="plain"
        >
          {{ role }}
        </el-tag>
      </template>
      <!-- 操作列 -->
      <template #column-operate="{ row }">
        <el-button link type="primary" @click="crudStore.onShowModal(row)">修改</el-button>
        <el-button link type="danger" @click="crudStore.onDelete(row)">删除</el-button>
      </template>
    </VxeGrid>

    <!-- 弹窗 -->
    <VxeModal ref="xModalDom" v-bind="xModalOpt" v-on="xModalEvent">
      <!-- 表单 -->
      <VxeForm ref="xFormDom" v-bind="xFormOpt" />
      <!-- 底部按钮 -->
      <template #footer>
        <VxeButton content="取消" @click="xModalDom?.close()" />
        <VxeButton status="primary" content="确定" @click="crudStore.onSubmitForm()" />
      </template>
    </VxeModal>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, useTemplateRef } from "vue";
import { configureVxeUI } from "@/plugins/vxe-table";
import type { VxeGridInstance, VxeGridProps, VxeGridListeners } from "vxe-table";
import { VxeGrid } from "vxe-table";
import type {
  VxeFormInstance,
  VxeFormProps,
  VxeModalInstance,
  VxeModalProps,
  VxeModalListeners,
} from "vxe-pc-ui";
import {
  VxeUI,
  VxeButton,
  VxeButtonGroup,
  VxeForm,
  VxeInput,
  VxeModal,
  VxeSelect,
} from "vxe-pc-ui";

defineOptions({
  components: {
    VxeButton,
    VxeButtonGroup,
    VxeForm,
    VxeGrid,
    VxeInput,
    VxeModal,
    VxeSelect,
  },
});

configureVxeUI();

onMounted(() => {
  // 模拟异步加载数据
  setTimeout(() => {
    const rolesItem = xGridDom.value
      ?.getFormItems()
      .find((item) => item.field === "roles" && item.folding !== true);
    if (rolesItem) {
      rolesItem.itemRender!.props!.options = [
        { label: "管理", value: "admin" },
        { label: "用户", value: "user" },
        { label: "访客", value: "guest" },
      ];
    }
  }, 500);
});

interface RowMeta {
  id: number;
  username: string;
  roles: string;
  phone: string;
  email: string;
  status: boolean;
  createTime: string;
}

// #region vxe-grid
const xGridDom = useTemplateRef<VxeGridInstance<RowMeta>>("xGridDom");
const xGridOpt = reactive<VxeGridProps<RowMeta>>({
  // 唯一标识（被某些特定的功能所依赖 比如storage）
  id: "user",
  // 保持原始值的状态，被某些功能所依赖，比如编辑状态、还原数据等（开启后影响性能，具体取决于数据量）
  keepSource: true,
  // 自动监听父元素的变化去重新计算表格
  autoResize: true,
  // 表单配置项
  formConfig: {
    // 所有项的标题宽度
    titleWidth: 100,
    // 所有项的标题对齐方式
    titleAlign: "right",
    // NOTE: 表单数据 (不能和代理同时存在)
    // data: {},
    // 项配置
    items: [
      {
        field: "username",
        title: "用户名",
        // 前缀配置项
        titlePrefix: {
          useHTML: true,
          content:
            '点击链接 <a class="link" href="https://vxetable.cn" target="_blank">vxe-table官网</a>',
          icon: "vxe-icon-question-circle-fill",
        },
        // 项渲染器配置项
        itemRender: {
          // 渲染器名称
          name: "VxeInput",
          // 渲染的参数
          props: {
            type: "text",
            clearable: true,
            placeholder: "请输入用户名",
          },
          defaultValue: "",
        },
        resetValue: "",
      },
      {
        field: "roles",
        title: "角色",
        itemRender: {
          name: "VxeSelect",
          props: {
            multiple: true,
            multiCharOverflow: -1,
            filterable: true,
            clearable: true,
            options: [],
            placeholder: "请选择角色",
          },
          defaultValue: null,
        },
        resetValue: null,
      },
      {
        field: "createTime",
        title: "创建时间",
        // 默认收起
        folding: true,
        itemRender: {
          defaultValue: [],
        },
        resetValue: [],
        // 插槽
        slots: {
          // 自定义表单项
          default: "search-createTime",
        },
      },
      {
        span: 24,
        align: "left",
        collapseNode: true,
        itemRender: {
          name: "VxeButtonGroup",
          props: {
            options: [
              {
                type: "submit",
                status: "primary",
                icon: "vxe-icon-search",
                content: "搜索",
              },
              { type: "reset", icon: "vxe-icon-refresh", content: "重置" },
            ],
          },
        },
      },
    ],
  },
  // 工具栏配置
  toolbarConfig: {
    // 导入按钮配置（需要设置 "import-config"）
    import: true,
    // 导出按钮配置（需要设置 "export-config"）
    export: true,
    // 打印按钮配置（需要设置 "print-config"）
    print: true,
    // 刷新按钮配置
    refresh: true,
    // 是否允许最大化显示
    zoom: true,
    // 自定义列配置
    custom: true,
    //插槽
    slots: {
      // 按钮列表
      buttons: "toolbar-btns",
    },
  },
  // 导入配置项
  importConfig: {},
  // 导出配置项
  exportConfig: {
    // 默认选中文件类型
    type: "xlsx",
    // 可选文件类型列表
    types: ["xlsx", "csv", "html", "xml", "txt"],
    // 输出数据的方式
    mode: "current",
    // 输出数据的方式列表，如果为 all，则会通过 proxy-config.ajax.queryAll 获取数据之后进行导出
    modes: ["current", "selected"],
    // 指定列(列必须在表中显示，否则被忽略)
    columns: [{ field: "phone" }, { field: "email" }, { field: "status" }, { field: "createTime" }],
    // 列过滤方法，该函数的返回值用来决定是否过滤掉列
    columnFilterMethod({ column }) {
      return column.field !== undefined;
    },
  },
  // 打印配置项
  printConfig: {
    // 自定义文档的 css 样式信息
    style: `
    .my-title {
      text-align: center;
    }`,
    // 在打印之前触发，可以通过返回自定义打印的内容
    beforePrintMethod: ({ content, options }) => {
      console.debug({ options });
      return `<h1 class="my-title">用户列表</h1>${content}`;
    },
  },
  // 缩放配置项
  zoomConfig: {
    // 是否允许通过按下 ESC 键还原
    escRestore: true,
  },
  // 自定义列配置项
  customConfig: {
    // NOTE: 是否启用 localStorage 本地保存，会将列操作状态保留在本地（需要有 id）
    storage: {
      // 启用显示/隐藏列状态缓存
      visible: true,
      // 启用冻结列状态缓存
      fixed: true,
      // 启用列宽状态缓存
      resizable: true,
      // 启用列顺序缓存（popup操作模式允许列排序）
      sort: false,
    },
    // 操作模式
    mode: "simple",
    // 列勾选之后是否实时同步
    immediate: false,
    // 是否允许自定义冻结列
    allowFixed: true,
    // 是否显示底部操作按钮
    showFooter: true,
    // NOTE: 计算公式绑定的单元格的插槽列不允许隐藏，否则公式会不生效
    // 是否允许列选中 返回值用来决定这一列的 checkbox 是否可以选中
    checkMethod: ({ column }) => !["username"].includes(column.field),
    // 是否显示列 返回值用来决定这一列的 checkbox 是否显示
    visibleMethod: ({ column }) => column.type === undefined,
  },
  // 列配置
  columns: [
    { type: "checkbox", width: 60 },
    {
      type: "expand",
      width: 60,
      slots: {
        // 只对 type=expand 有效，自定义展开后的内容模板
        content: "column-expand",
      },
    },
    { type: "seq", width: 60 },
    { field: "id", title: "ID", visible: false },
    { field: "username", title: "用户名" },
    { field: "roles", title: "角色", slots: { default: "column-roles" } },
    { field: "phone", title: "手机号" },
    { field: "email", title: "邮箱" },
    {
      field: "status",
      title: "状态",
      filters: [
        { label: "启用", value: true },
        { label: "禁用", value: false },
      ],
      // 数据筛选，只对 filters 有效，筛选是否允许多选
      filterMultiple: false,
      // 默认的渲染器配置项
      cellRender: {
        name: "VxeSwitch",
        props: {
          openLabel: "启用",
          closeLabel: "禁用",
          openValue: true,
          closeValue: false,
        },
        events: {
          change: ({ row, column }, { value }) => {
            crudStore.onModify(row.id, column.field, value);
          },
        },
      },
    },
    { field: "createTime", title: "创建时间", sortable: true },
    {
      field: "operate",
      title: "操作",
      width: "150px",
      fixed: "right",
      showOverflow: false,
      slots: {
        default: "column-operate",
      },
    },
  ],
  // 行配置信息
  rowConfig: {
    // 自定义行数据唯一主键的字段名（默认自动生成 _X_ROW_KEY，刷新后值会变）
    keyField: "id",
    // 当鼠标点击行时，是否要高亮当前行
    isCurrent: true,
    // 当鼠标移到行时，是否要高亮当前行
    isHover: false,
  },
  // 列配置信息
  columnConfig: {
    // 每一列是否启用列宽调整
    resizable: true,
    // 每一列的最小宽度
    minWidth: 100,
    // 冻结列允许设置的最大数量（如果是分组，则一个分组算一个）
    maxFixedSize: 4,
  },
  // 复选框配置项
  checkboxConfig: {
    // 是否保留勾选状态（需要有 row-config.keyField）仅对分页切换时有效
    // reserve: true,
    // 高亮勾选行
    highlight: true,
    // 是否允许勾选 返回值用来决定这一行 checkbox 是否可以勾选
    checkMethod: ({ row }) => row.status === false,
    // 是否显示勾选 返回值用来决定这一行的 checkbox 是否显示
    visibleMethod: ({ row }) => row.status === false,
  },
  // 展开行配置项（不支持虚拟滚动）
  expandConfig: {
    // 展开列显示的字段名，可以直接显示在单元格中
    // labelField: "username",
    // 每次只能展开一行
    accordion: true,
  },
  // 设置所有内容过长时显示为省略号（如果是固定列建议设置该值，提升渲染速度）
  showOverflow: "tooltip",
  // 是否显示表尾
  showFooter: true,
  // 表尾数据（优先级比 footerMethod 高）
  // footerData: [
  //   {
  //     username: "-",
  //     roles: "-",
  //     phone: "-",
  //     email: "-",
  //     status: "启用/禁用",
  //     createTime: "-",
  //   },
  // ],
  // 表尾的数据获取方法，返回一个二维数组
  footerMethod({ columns, data }) {
    return [
      columns.map((column, columnIndex) => {
        if (columnIndex === 0 || column.field === undefined) {
          return "";
        } else if (column.field === "status") {
          return `启用 ${data.reduce((sum, row) => sum + (row.status ? 1 : 0), 0)} 条`;
        }
        return "-";
      }),
    ];
  },
  // NOTE: 分页配置项（含 pager-config 才会启用分页）
  pagerConfig: {
    // 对齐方式
    align: "right",
    // 每页大小
    pageSize: 10,
  },
  // 筛选配置项
  filterConfig: {
    // 所有列是否使用服务端筛选
    remote: true,
  },
  // 排序配置项
  sortConfig: {
    // 默认排序（只会在初始化时被触发一次）
    defaultSort: {
      // 列字段名
      field: "id",
      // 排序方式（asc升序 desc降序）
      order: "desc",
    },
    // 所有列是否使用服务端排序
    remote: true,
    // 是否启用多列组合筛选
    multiple: false,
    // 只对 multiple 有效，是否按照先后触发顺序进行排序
    chronological: true,
  },
  // 数据代理配置项"
  proxyConfig: {
    // 是否自动加载查询数据
    autoLoad: true,
    // 启用动态序号代理（分页之后索引自动计算为当前页的起始序号）
    seq: true,
    // 表单代理
    form: true,
    // 是否代理筛选（只对 filter-config.remote=true 时有效）
    filter: true,
    // 是否代理排序（只对 sort-config.remote=true 时有效）
    sort: true,
    // 获取响应的值配置
    response: {
      // 只对 pager-config 配置时有效，响应结果中获取数据列表的属性（分页场景）
      result: "result",
      // 只对 pager-config 配置时有效，响应结果中获取分页的属性（分页场景）
      total: "total",
    },
    ajax: {
      // 接收 Promise
      query: ({ page: { currentPage, pageSize }, form, filters, sort, sorts }) => {
        console.debug({ currentPage, pageSize, form, filters, sort, sorts });
        xGridOpt.loading = true;
        return new Promise<{ total: number; result: RowMeta[] }>((resolve) => {
          // 接口需要的参数
          // const params = {
          //   page: currentPage,
          //   limit: pageSize,
          //   username: form.username,
          //   roles: form.roles === null ? undefined : form.roles.join(","),
          //   createTime: form.createTime.length > 0 ? form.createTime.join(",") : undefined,
          // };
          // 模拟异步加载数据
          setTimeout(() => {
            const list = [
              {
                username: "Richard Clark",
                roles: "editor",
                phone: "18185826431",
                email: "y.djf@xiswx.fk",
                status: true,
                createTime: "2010-04-17 12:39:20",
                id: 810000201008060500,
              },
              {
                username: "Robert Garcia",
                roles: "admin",
                phone: "18125716043",
                email: "z.japgndxosu@inoudjxc.ie",
                status: false,
                createTime: "2020-01-02 11:51:58",
                id: 130000201904129330,
              },
              {
                username: "Thomas Moore",
                roles: "admin",
                phone: "18106622048",
                email: "j.fvsgnjjutm@fmjw.se",
                status: true,
                createTime: "1983-10-12 10:06:41",
                id: 420000198203053100,
              },
              {
                username: "Dorothy Lewis",
                roles: "admin",
                phone: "13321357284",
                email: "o.htso@iwxvehrs.tj",
                status: true,
                createTime: "1970-03-03 00:26:45",
                id: 150000201803243100,
              },
              {
                username: "George Rodriguez",
                roles: "admin",
                phone: "18158641167",
                email: "x.sigizx@fwknokiqn.tr",
                status: true,
                createTime: "1988-03-16 14:46:26",
                id: 610000199308265900,
              },
              {
                username: "Angela Jackson",
                roles: "admin",
                phone: "19810721230",
                email: "j.gqrdqaqtu@ipthgm.fj",
                status: true,
                createTime: "2006-09-26 12:53:37",
                id: 350000197310101440,
              },
              {
                username: "James Walker",
                roles: "admin",
                phone: "18123903251",
                email: "k.axmdcsl@mcmeudog.cl",
                status: true,
                createTime: "1981-01-19 12:51:34",
                id: 130000199308208900,
              },
              {
                username: "Paul Garcia",
                roles: "admin",
                phone: "18617930381",
                email: "c.glufsn@vwqntlllj.es",
                status: false,
                createTime: "2009-12-04 20:40:57",
                id: 510000199212239200,
              },
              {
                username: "Jeffrey Miller",
                roles: "admin",
                phone: "18145245413",
                email: "u.poqrqw@arto.rw",
                status: false,
                createTime: "1991-04-01 05:16:52",
                id: 330000198604109760,
              },
              {
                username: "Donna Lewis",
                roles: "editor",
                phone: "19839835537",
                email: "l.lmpeoupu@rujdlzdbk.gf",
                status: true,
                createTime: "1987-11-29 21:47:37",
                id: 640000197005230500,
              },
              {
                username: "Jennifer Smith",
                roles: "editor",
                phone: "18145245413",
                email: "j.jqx@xjxqx.jp",
                status: true,
                createTime: "1991-04-01 05:16:52",
                id: 640000197005230000,
              },
            ];
            xGridOpt.loading = false;
            resolve({
              result: list.slice((currentPage - 1) * pageSize, currentPage * pageSize),
              total: list.length,
            });
          }, 500);
        });
      },
    },
  },
});
const xGridEvents: VxeGridListeners<RowMeta> = {
  toggleRowExpand: ({ row, expanded }) => {
    console.debug("Toggle Row Expand", { row, expanded });
  },
};
// #endregion

// #region vxe-form
const xFormDom = useTemplateRef<VxeFormInstance>("xFormDom");
const xFormOpt = reactive<VxeFormProps>({
  // 所有项的栅格占据的列数
  span: 24,
  // 所有项的标题宽度
  titleWidth: 100,
  // 表单数据
  data: {
    username: "",
    password: "",
  },
  // 项配置
  items: [
    {
      field: "username",
      title: "用户名",
      itemRender: {
        name: "VxeInput",
        props: {
          placeholder: "请输入",
        },
      },
      resetValue: "",
    },
    {
      field: "password",
      title: "密码",
      itemRender: {
        name: "VxeInput",
        props: {
          placeholder: "请输入",
        },
      },
      resetValue: "",
    },
  ],
  /** 校验规则 */
  rules: {
    username: [
      {
        required: true,
        validator: ({ itemValue }: { itemValue: string }) => {
          switch (true) {
            case !itemValue:
              return new Error("请输入");
            case !itemValue.trim():
              return new Error("空格无效");
          }
        },
      },
    ],
    password: [
      {
        required: true,
        validator: ({ itemValue }: { itemValue: string }) => {
          switch (true) {
            case !itemValue:
              return new Error("请输入");
            case !itemValue.trim():
              return new Error("空格无效");
          }
        },
      },
    ],
  },
});
// #endregion

// #region vxe-modal
const xModalDom = useTemplateRef<VxeModalInstance>("xModalDom");
const xModalOpt = reactive<VxeModalProps>({
  // 窗口的标题
  title: "",
  // 窗口的高度
  // height: 500,
  // 窗口宽度
  // width: "60%",
  // 窗口打开时自动最大化显示
  // fullscreen: true,
  // 标题是否标显示最大化与还原按钮
  showZoom: true,
  // 是否显示关闭按钮
  showClose: true,
  // 是否允许点击遮罩层关闭窗口
  maskClosable: true,
  // 是否允许按 Esc 键关闭窗口
  escClosable: true,
  // // 是否显示底部栏
  showFooter: true,
  // 在窗口关闭时销毁内容
  destroyOnClose: false,
  // 在窗口隐藏之前执行，可以返回 Error 阻止关闭，支持异步
  beforeHideMethod: ({ type }) => {
    console.debug("beforeHideMethod", type);
    xFormDom.value?.clearValidate();
    return Promise.resolve();
  },
});
const xModalEvent: VxeModalListeners = {
  // 显示时触发
  show: () => {
    console.debug("🚀 ~ show");
  },
  // 隐藏时触发
  hide: ({ type }) => {
    console.debug("🚀 ~ hide", type);
    const $form = xFormDom.value;
    if ($form) {
      $form.reset();
      $form.clearValidate();
      // 重置自定义表单项
      $form.getItems().forEach((item) => {
        if (item.slots?.default) {
          xFormOpt.data[item.field] = item.resetValue;
        }
      });
      // 重置表单数据(解决reset后数据不清空的问题)
      delete xFormOpt.data.id;
      // xFormOpt.data.id = 0
    }
  },
};
// #endregion

const crudStore = {
  /** 表单类型，true 表示修改，false 表示新增 */
  isUpdate: true,
  /** 加载表格数据 */
  commitQuery: () => xGridDom.value?.commitProxy("query"),
  /** 清空表格数据 */
  clearTable: () => xGridDom.value?.reloadData([]),
  /** 新增后是否跳入最后一页 */
  afterInsert: () => {
    const pager = xGridDom.value?.getProxyInfo()?.pager;
    if (pager) {
      const currentTotal = pager.currentPage * pager.pageSize;
      if (currentTotal === pager.total) {
        ++pager.currentPage;
      }
    }
  },
  /** 删除后是否返回上一页 */
  afterDelete: () => {
    const tableData: RowMeta[] = xGridDom.value!.getData();
    const pager = xGridDom.value?.getProxyInfo()?.pager;
    if (pager && pager.currentPage > 1 && tableData.length === 1) {
      --pager.currentPage;
    }
  },
  /** 点击显示弹窗 */
  onShowModal: (row?: RowMeta) => {
    if (row) {
      crudStore.isUpdate = true;
      xModalOpt.title = "修改用户";
      xFormOpt.data = { ...row };
    } else {
      crudStore.isUpdate = false;
      xModalOpt.title = "新增用户";
    }
    xModalDom.value?.open();
  },
  /** 确定并保存 */
  onSubmitForm: () => {
    if (xModalOpt.loading) return;
    // 表单校验
    xFormDom.value?.validate((errMap) => {
      if (errMap) return;
      xModalOpt.loading = true;
      const callback = () => {
        xModalOpt.loading = false;
        xModalDom.value?.close();
        VxeUI.modal.message({ status: "success", content: "操作成功" });
        if (!crudStore.isUpdate) {
          crudStore.afterInsert();
        }
        crudStore.commitQuery();
      };
      // 模拟异步操作
      callback();
    });
  },
  /** 删除 */
  onDelete: (row?: RowMeta) => {
    let ids = [];
    if (row === undefined) {
      // 获取当前已选中的行数据
      const selected = xGridDom.value?.getCheckboxRecords();
      if (!selected || selected.length === 0) {
        VxeUI.modal.message({
          content: "请至少选择一条数据",
          status: "warning",
        });
        return;
      }
      ids = selected.map((item) => item.id);
    } else {
      ids = [row.id];
    }
    VxeUI.modal.confirm("确定要删除吗？").then((type) => {
      if (type === "confirm") {
        const callback = () => {
          // 执行删除操作
          VxeUI.modal.message({ status: "success", content: `已删除 ${ids.length} 条数据` });
          crudStore.afterDelete();
          crudStore.commitQuery();
        };
        // 模拟异步操作
        callback();
      }
    });
  },
  onModify: (id: number, field: string, value: any) => {
    console.debug("🚀 ~ onModify", { id, field, value });
  },
  /** 更多自定义方法 */
  moreFn: () => {},
};
</script>

<style lang="scss">
:root {
  /* color */
  --vxe-ui-font-color: var(--el-text-color-regular);
  --vxe-ui-font-lighten-color: var(--el-text-color-primary);
  --vxe-ui-font-darken-color: var(--el-text-color-secondary);
  --vxe-ui-font-disabled-color: var(--el-text-color-disabled);

  /*font status color*/
  --vxe-ui-font-primary-color: var(--el-color-primary);
  --vxe-ui-font-primary-lighten-color: var(--el-color-primary-light-3);
  --vxe-ui-font-primary-darken-color: var(--el-color-primary-dark-2);
  --vxe-ui-font-primary-disabled-color: var(--el-color-primary-light-5);

  --vxe-ui-status-success-color: var(--el-color-success);
  --vxe-ui-status-info-color: var(--el-color-info);
  --vxe-ui-status-warning-color: var(--el-color-warning);
  --vxe-ui-status-danger-color: var(--el-color-danger);

  --vxe-ui-status-success-lighten-color: var(--el-color-success-light-3);
  --vxe-ui-status-info-lighten-color: var(--el-color-info-light-3);
  --vxe-ui-status-warning-lighten-color: var(--el-color-warning-light-3);
  --vxe-ui-status-danger-lighten-color: var(--el-color-danger-light-3);

  --vxe-ui-status-success-darken-color: var(--el-color-success-dark-2);
  --vxe-ui-status-info-darken-color: var(--el-color-info-dark-2);
  --vxe-ui-status-warning-darken-color: var(--el-color-warning-dark-2);
  --vxe-ui-status-danger-darken-color: var(--el-color-danger-dark-2);

  --vxe-ui-status-success-disabled-color: var(--el-color-success-light-5);
  --vxe-ui-status-info-disabled-color: var(--el-color-info-light-5);
  --vxe-ui-status-warning-disabled-color: var(--el-color-warning-light-5);
  --vxe-ui-status-danger-disabled-color: var(--el-color-danger-light-5);

  /*base*/
  --vxe-ui-base-popup-border-color: var(--el-border-color);

  /* layout */
  --vxe-ui-layout-background-color: var(--el-bg-color);

  /* input/radio/checkbox */
  --vxe-ui-input-border-color: var(--el-border-color);
  --vxe-ui-input-disabled-color: var(--el-text-color-disabled);
  --vxe-ui-input-disabled-background-color: var(--el-fill-color-light);
  --vxe-ui-input-placeholder-color: var(--el-text-color-placeholder);

  /* table */
  --vxe-ui-table-border-color: var(--el-border-color-lighter);
  --vxe-ui-table-header-background-color: var(--el-bg-color);
  --vxe-ui-table-row-hover-background-color: var(--el-fill-color-light);
  --vxe-ui-table-row-current-background-color: var(--el-fill-color-light);
  --vxe-ui-table-row-hover-current-background-color: var(--el-fill-color-light);

  /* loading */
  --vxe-ui-loading-color: var(--el-color-primary);
  --vxe-ui-loading-background-color: var(--el-mask-color);

  /* modal */
  --vxe-ui-modal-header-background-color: var(--el-bg-color);

  /* form */
  --vxe-ui-form-validate-error-color: var(--el-color-danger);
}

// VxeTable 自定义样式
.vxe-grid {
  // 表单
  &--form-wrapper {
    .vxe-form {
      padding: 10px 20px;
      margin-bottom: 20px;
    }
  }

  // 工具栏
  &--toolbar-wrapper {
    .vxe-toolbar {
      padding: 20px;
    }
  }

  // 分页
  &--pager-wrapper {
    .vxe-pager {
      height: 70px;
      padding: 0 20px;
      &--wrapper {
        // 参考 Bootstrap 的响应式设计 WIDTH = 768
        @media screen and (max-width: 768px) {
          .vxe-pager--total,
          .vxe-pager--sizes,
          .vxe-pager--jump,
          .vxe-pager--jump-prev,
          .vxe-pager--jump-next {
            display: none;
          }
        }
      }
    }
  }
}

.vxe-table {
  // 自定义列配置
  &-custom {
    &--body {
      min-height: 80px;
    }
  }
}

/* 恢复 4.6 版本弹窗 loading 样式 */
.vxe-modal--v46.vxe-modal--wrapper.is--loading {
  .vxe-modal--footer,
  .vxe-modal--header {
    &:before {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 1;
      width: 100%;
      height: 100%;
      user-select: none;
      content: "";
      background-color: var(--vxe-ui-loading-background-color);
    }
  }
}
</style>
