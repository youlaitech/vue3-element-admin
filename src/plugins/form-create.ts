import type { App, Component } from "vue";
// 设计器默认导出：既是可 app.use 的插件，也提供 addMenu/component/addDragRule 静态方法
import type DesignerPlugin from "@form-create/designer";
import type { DragRule } from "@form-create/designer";

// 启动时登记的应用实例
let appRef: App | null = null;

// 注册任务，重复调用复用同一次加载
let registering: Promise<void> | null = null;

/**
 * 登记应用实例，实际加载和注册延后到首次进入表单页。
 */
export function setupFormCreate(app: App): void {
  appRef = app;
}

/**
 * 首次加载并注册表单依赖，后续调用复用注册任务。
 * 加载失败会释放任务，允许再次进入页面时重试。
 */
export function ensureFormCreate(): Promise<void> {
  if (!registering) {
    const pending = register().catch((error) => {
      // 只释放本次失败任务，不影响后续已启动的注册。
      if (registering === pending) registering = null;
      throw error;
    });
    registering = pending;
  }
  return registering;
}

/**
 * 加载依赖并完成注册
 */
async function register(): Promise<void> {
  const app = appRef;
  if (!app) {
    throw new Error("未登记应用实例，需先调用 setupFormCreate");
  }

  const [elementPlus, formCreate, designer, dictSelect, fileUpload] = await Promise.all([
    import("element-plus"),
    import("@form-create/element-ui"),
    import("@form-create/designer"),
    import("@/components/DictSelect/index.vue"),
    import("@/components/Upload/FileUpload.vue"),
    import("element-plus/dist/index.css"),
  ]);

  // 预编译的 form-create 在运行时解析 Element Plus 组件，需全量注册。
  app.use(elementPlus.default);
  app.use(formCreate.default);
  app.use(designer.default);
  // 业务组件注册必须先于设计器实例挂载
  registerComponents(designer.default, dictSelect.default, fileUpload.default);
}

// 业务组件拖拽规则

// 时间前缀区分页面重载，序号区分同一毫秒内拖入的字段。
let fieldSeed = 0;

/**
 * 生成唯一字段名
 *
 * @param prefix 字段前缀（如 dict/user/dept/file）
 */
function uniqueField(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${++fieldSeed}`;
}

// 字典选择：选项由字典编码在运行时从字典中心加载，设计时无需配置选项
const dictSelectRule: DragRule = {
  name: "DictSelect",
  label: "字典选择",
  icon: "icon-select",
  menu: "biz",
  input: true,
  event: ["change"],
  languageKey: [],
  validate: ["string", "number", "array"],
  rule: () => ({
    type: "DictSelect",
    field: uniqueField("dict"),
    title: "字典选择",
    info: "",
    $required: false,
    props: {
      code: "",
      type: "select",
      placeholder: "请选择",
    },
  }),
  props: () => [
    { type: "input", field: "code", title: "字典编码" },
    {
      type: "select",
      field: "type",
      title: "展示形态",
      value: "select",
      options: [
        { label: "下拉", value: "select" },
        { label: "单选", value: "radio" },
        { label: "多选", value: "checkbox" },
      ],
    },
    { type: "input", field: "placeholder", title: "提示文字" },
  ],
};

// 文件上传：直连项目对象存储，值存文件信息数组 [{name, url}]
const fileUploadRule: DragRule = {
  name: "FileUpload",
  label: "文件上传",
  icon: "icon-import-file",
  menu: "biz",
  input: true,
  event: ["change"],
  languageKey: [],
  validate: ["array"],
  rule: () => ({
    type: "FileUpload",
    field: uniqueField("file"),
    title: "附件上传",
    info: "",
    $required: false,
    props: {
      limit: 5,
      maxFileSize: 10,
      accept: "*",
      uploadBtnText: "上传文件",
    },
  }),
  props: () => [
    { type: "inputNumber", field: "limit", title: "数量上限", props: { min: 1 } },
    {
      type: "inputNumber",
      field: "maxFileSize",
      title: "单文件大小上限(MB)",
      props: { min: 1 },
    },
    { type: "input", field: "accept", title: "文件类型" },
    { type: "input", field: "uploadBtnText", title: "按钮文本" },
  ],
};

// 业务组件依赖登录接口；匿名表单应使用设计器基础组件。
let registered = false;

/**
 * 同时登记设计态、运行态组件，并补充设计器拖拽规则。
 */
function registerComponents(
  designer: typeof DesignerPlugin,
  dictSelect: Component,
  fileUpload: Component
): void {
  if (registered) return;

  // 新增左侧菜单分组，业务组件与设计器基础组件区分开
  designer.addMenu({ name: "biz", title: "业务组件", list: [] });

  // 组件本体：同时挂载到设计态渲染器与运行态渲染器
  designer.component("DictSelect", dictSelect);
  designer.component("FileUpload", fileUpload);

  // 拖拽规则：定义左侧菜单项、拖入画布的默认规则与右侧属性面板
  designer.addDragRule([dictSelectRule, fileUploadRule]);
  registered = true;
}
