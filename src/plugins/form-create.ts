/**
 * FormCreate 动态表单全局注册
 *
 * @description 注册 form-create 渲染器（@form-create/element-ui 3.x）、可视化设计器
 * （@form-create/designer 3.x）与业务组件拖拽规则
 *
 * <p>ElementPlus 只能全量注册：两个包的产物在运行时用 resolveComponent 解析 el-xxx
 * 标签，unplugin-vue-components 只转换项目源码、不处理 node_modules 里的预编译产物，
 * 按需导入会让设计器内部组件解析失败并抛出 vnode 为 null 的报错</p>
 *
 * @see https://www.form-create.com/v3/guide/
 */

import type { App } from "vue";

import ElementPlus from "element-plus";
import formCreate from "@form-create/element-ui";
import FcDesigner from "@form-create/designer";
import type { DragRule } from "@form-create/designer";

import DictSelect from "@/components/DictSelect/index.vue";
import FileUpload from "@/components/Upload/FileUpload.vue";

import "element-plus/dist/index.css";

/**
 * 注册 ElementPlus 全量组件、form-create 渲染器、设计器与业务组件
 *
 * @param app Vue 应用实例
 */
export function setupFormCreate(app: App): void {
  app.use(ElementPlus);
  app.use(formCreate);
  app.use(FcDesigner);
  // 业务组件（字典/文件上传）注册必须先于设计器实例挂载
  setupFormCreateComponents();
}

// ---------------------------------------------------------------------------
// 业务组件拖拽规则
// ---------------------------------------------------------------------------

/** 字段名自增序号（拖入画布时生成唯一 field，语义前缀便于数据侧识别） */
let fieldSeed = 0;

/**
 * 生成唯一字段名
 *
 * @param prefix 字段前缀（如 dict/user/dept/file）
 */
function uniqueField(prefix: string): string {
  return `${prefix}_${++fieldSeed}`;
}

/** 字典选择：选项由字典编码在运行时从字典中心加载，设计时无需配置选项 */
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

/** 文件上传：直连项目对象存储，值存文件信息数组 [{name, url}] */
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

/**
 * 注册业务组件到设计器与运行态渲染器
 *
 * <p>拖入画布的组件在运行态渲染（render/preview/share/data 页）同样可解析：
 * FcDesigner.component() 会同时挂载到设计态渲染器（designerForm）与
 * 运行态渲染器（@form-create/element-ui 默认实例，即全局 &lt;form-create&gt;）</p>
 *
 * <p>注意：业务组件选项数据来自需登录的管理端接口，仅适用于系统内嵌表单；
 * 公开表单（匿名访问）请使用设计器自带基础组件，否则选项接口会 401</p>
 *
 * 幂等保护：HMR 或多次调用时跳过重复注册
 */
let registered = false;

function setupFormCreateComponents(): void {
  if (registered) return;
  registered = true;

  // 新增左侧菜单分组，业务组件与设计器基础组件区分开
  FcDesigner.addMenu({ name: "biz", title: "业务组件", list: [] });

  // 组件本体：同时挂载到设计态渲染器与运行态渲染器
  FcDesigner.component("DictSelect", DictSelect);
  FcDesigner.component("FileUpload", FileUpload);

  // 拖拽规则：定义左侧菜单项、拖入画布的默认规则与右侧属性面板
  FcDesigner.addDragRule([dictSelectRule, fileUploadRule]);
}
