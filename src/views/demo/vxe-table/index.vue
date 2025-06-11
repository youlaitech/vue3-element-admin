<template>
  <div class="app-container">
    <!-- 表格 -->
    <vxe-grid ref="xGrid" v-bind="gridOptions" v-on="gridEvents">
      <!-- 搜索 -->
      <!-- <template #form-roles="{ data }">
        <el-select
          v-model="data.roles"
          multiple
          collapse-tags
          collapse-tags-tooltip
          placeholder="请选择角色"
          filterable
          clearable
        >
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </template> -->
      <!-- 左侧按钮列表 -->
      <template #toolbar-btns>
        <vxe-button status="primary" icon="vxe-icon-add" @click="curd.onShowModal()">
          新增用户
        </vxe-button>
        <vxe-button status="danger" icon="vxe-icon-delete" @click="curd.onDelete()">
          批量删除
        </vxe-button>
      </template>
      <!-- 展开列 -->
      <template #column-expand="{ row }">
        <div style="padding: 20px">
          <ul>
            <li>
              <span>ID：</span>
              <span>{{ row.id }}</span>
            </li>
            <li>
              <span>UserName：</span>
              <span>{{ row.username }}</span>
            </li>
            <li>
              <span>CreateTime：</span>
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
        <el-button link type="primary" @click="curd.onShowModal(row)">修改</el-button>
        <el-button link type="danger" @click="curd.onDelete(row)">删除</el-button>
      </template>
    </vxe-grid>
    <!-- 弹窗 -->
    <vxe-modal ref="xModal" v-bind="modalOptions">
      <!-- 表单 -->
      <vxe-form ref="xForm" v-bind="formOptions" />
    </vxe-modal>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from "vue";
import type {
  VxeGridInstance,
  VxeGridProps,
  VxeGridListeners,
  VxeModalInstance,
  VxeModalProps,
  VxeFormInstance,
  VxeFormProps,
} from "vxe-table";
import { VXETable } from "vxe-table";

const options = [
  { label: "管理员", value: "admin" },
  { label: "用户", value: "user" },
  { label: "访客", value: "guest" },
];
onMounted(() => {
  setTimeout(() => {
    gridOptions!.formConfig!.items!.forEach((item) => {
      if (item.field === "roles") {
        item!.itemRender!.props!.options = options;
      }
    });
  }, 500);
});

// #region vxe-grid
interface RowMeta {
  id: number;
  username: string;
  roles: string;
  phone: string;
  email: string;
  status: boolean;
  createTime: string;
}
const xGrid = ref<VxeGridInstance<RowMeta>>();
const gridOptions = reactive<VxeGridProps<RowMeta>>({
  // 自动监听父元素的变化去重新计算表格
  autoResize: true,
  // 是否显示表尾
  showFooter: true,
  // 表尾数据（优先级比 footerMethod 高）
  // footerData: [
  //   {
  //     username: "-",
  //     roles: "-",
  //     phone: "-",
  //     email: "-",
  //     status: "启用：7条",
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
          return `启用：${data.reduce((sum, row) => sum + (row.status ? 1 : 0), 0)}条`;
        }
        return "-";
      }),
    ];
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
      sortable: true,
      filters: [
        { label: "启用", value: true },
        { label: "禁用", value: false },
      ],
      // 数据筛选，只对 filters 有效，筛选是否允许多选
      filterMultiple: false,
      formatter({ cellValue }) {
        return cellValue === true ? "启用" : "禁用";
      },
    },
    { field: "createTime", title: "创建时间", sortable: true },
    {
      title: "操作",
      width: "150px",
      fixed: "right",
      showOverflow: false,
      slots: {
        default: "column-operate",
      },
    },
  ],
  // 列配置信息
  columnConfig: {
    // 每一列是否启用列宽调整
    resizable: true,
  },
  // 自定义列配置项
  customConfig: {
    // 是否允许列选中
    checkMethod: ({ column }) => !["username"].includes(column.field),
  },
  // 复选框配置项
  checkboxConfig: {
    // 是否保留勾选状态（需要有 row-config.keyField）
    // reserve: true,
  },
  // 展开行配置项（不支持虚拟滚动）
  expandConfig: {
    // 展开列显示的字段名，可以直接显示在单元格中
    // labelField: "username",
    // 每次只能展开一行
    accordion: true,
  },
  // 行配置信息
  rowConfig: {
    // 自定义行数据唯一主键的字段名
    keyField: "id",
    // 当鼠标点击行时，是否要高亮当前行
    isCurrent: true,
  },
  // 表单配置项
  formConfig: {
    // 项配置
    items: [
      {
        span: 4,
        field: "username",
        title: "用户名",
        // 前缀配置项
        titlePrefix: {
          useHTML: true,
          content:
            '点击链接：<a class="link" href="https://vxetable.cn" target="_blank">vxe-table官网</a>',
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
        },
      },
      {
        span: 4,
        field: "roles",
        title: "角色",
        // 默认收起
        folding: true,
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
        },
      },
      // {
      //   span: 4,
      //   field: "roles",
      //   title: "角色",
      //   // 默认收起
      //   folding: true,
      //   // 插槽
      //   slots: {
      //     // 自定义表单项
      //     default: "form-roles",
      //   },
      // },
      {
        collapseNode: true,
        itemRender: {
          name: "VxeButtonGroup",
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
    // 指定列
    columns: [{ field: "phone" }, { field: "email" }, { field: "status" }, { field: "createTime" }],
  },
  // 打印配置项
  printConfig: {},
  // 筛选配置项
  filterConfig: {
    // 所有列是否使用服务端筛选
    remote: false,
  },
  // 排序配置项
  sortConfig: {
    // 所有列是否使用服务端排序
    remote: false,
    // 是否启用多列组合筛选
    multiple: false,
    // 只对 multiple 有效，是否按照先后触发顺序进行排序
    chronological: true,
  },
  // 分页配置项
  pagerConfig: {
    enabled: true,
    pageSize: 10,
  },
  // 数据代理配置项
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
      // 只对 pager-config 配置了有效，响应结果中获取数据列表的属性（分页场景）
      result: "result",
      // 只对 pager-config 配置了有效，响应结果中获取分页的属性（分页场景）
      total: "total",
    },
    ajax: {
      // 接收 Promise
      query: ({ page: { currentPage, pageSize }, form, filters, sort, sorts }) => {
        console.log({ currentPage, pageSize, form, filters, sort, sorts });
        return new Promise<{ total: number; result: RowMeta[] }>((resolve) => {
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
const gridEvents: VxeGridListeners<RowMeta> = {
  // 只对 form-config 配置时有效，表单重置时会触发该事件
  formReset() {
    console.log("Form Reset");
  },
};
// #endregion

// #region vxe-modal
const xModal = ref<VxeModalInstance>();
const modalOptions = reactive<VxeModalProps>({
  // 窗口的标题
  title: "",
  // 是否允许点击遮罩层关闭窗口
  maskClosable: true,
  // 是否允许按 Esc 键关闭窗口
  escClosable: true,
  // 在窗口隐藏之前执行
  beforeHideMethod: () => {
    xForm.value?.clearValidate();
    return Promise.resolve();
  },
});
// #endregion

// #region vxe-form
const xForm = ref<VxeFormInstance>();
const formOptions = reactive<VxeFormProps>({
  // 所有项的栅格占据的列数
  span: 24,
  // 所有项的标题宽度
  titleWidth: 100,
  // 表单数据
  data: {
    username: "",
    password: "",
  },
  // 项列表
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
    },
    {
      align: "right",
      itemRender: {
        name: "$buttons",
        children: [
          {
            props: {
              content: "取消",
            },
            events: {
              click: () => xModal.value?.close(),
            },
          },
          {
            props: {
              type: "submit",
              content: "确定",
              status: "primary",
            },
            events: {
              click: () => curd.onSubmitForm(),
            },
          },
        ],
      },
    },
  ],
  /** 校验规则 */
  rules: {
    username: [
      {
        required: true,
        validator: ({ itemValue }) => {
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
        validator: ({ itemValue }) => {
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

const curd = {
  commitQuery: () => xGrid.value?.commitProxy("query"),
  onShowModal: (row?: RowMeta) => {
    if (row) {
      modalOptions.title = "修改用户";
    } else {
      modalOptions.title = "新增用户";
    }
    xModal.value?.open();
  },
  /** 确定并保存 */
  onSubmitForm: () => {
    console.log("提交表单");
  },
  onDelete: (row?: RowMeta) => {
    let ids = [];
    if (row === undefined) {
      // 获取当前已选中的行数据
      const selected = xGrid.value?.getCheckboxRecords();
      if (!selected || selected.length === 0) {
        VXETable.modal.message({
          content: "请至少选择一条数据",
          status: "warning",
        });
        return;
      }
      ids = selected.map((item) => item.id);
    } else {
      ids = [row.id];
    }
    VXETable.modal.confirm("确定要删除吗？").then((type) => {
      if (type === "confirm") {
        // 执行删除操作
        console.log("删除的ID：", ids);
      }
    });
  },
};
</script>

<style scoped></style>
