import type { DialogProps, DrawerProps, FormItemRule, PaginationProps } from "element-plus";
import type { FormProps, TableProps, ColProps, ButtonProps, CardProps } from "element-plus";
import type CrudTable from "./CrudTable.vue";
import type CrudForm from "./CrudForm.vue";
import type CrudSearch from "./CrudSearch.vue";
import type { CSSProperties, Ref } from "vue";
import type { PageResult } from "@/api/common";
import type { AxiosResponse } from "axios";

/**
 * 搜索组件实例。
 */
export type CrudSearchInstance = InstanceType<typeof CrudSearch>;
/**
 * 表格组件实例。
 */
export type CrudTableInstance = InstanceType<typeof CrudTable>;
/**
 * 共用表单组件实例。
 */
export type CrudFormInstance = InstanceType<typeof CrudForm>;

/**
 * 动态控件与插槽的模型边界，业务接口仍使用具体类型。
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- 动态组件的 v-model 值由对应控件约束。
export type CrudRecord = Record<string, any>;

/**
 * 搜索字段支持的控件。
 */
export type CrudSearchFieldType =
  | "input"
  | "select"
  | "input-number"
  | "cascader"
  | "tree-select"
  | "date-picker"
  | "time-picker"
  | "time-select"
  | "custom-tag"
  | "input-tag"
  | "custom";
/**
 * 表单支持搜索控件及只读文本、单选、复选等控件。
 */
export type CrudFieldType =
  CrudSearchFieldType | "text" | "radio" | "checkbox" | "switch" | "icon-select";

/**
 * 业务工具栏的内置动作。
 */
type ToolbarActionKey = "create" | "delete" | "import" | "export";
/**
 * 表格右侧的内置工具。
 */
type TableToolKey = "refresh" | "columns" | "import" | "export" | "search";
/**
 * 行操作的内置动作。
 */
type RowActionKey = "edit" | "view" | "delete";
/**
 * 工具栏和行操作共用的权限、状态与回调。
 */
export type CrudAction = {
  key: string; // 动作标识，也用于按钮插槽
  label?: string; // 按钮文字
  permission?: string | string[]; // 完整权限或相对操作后缀
  buttonProps?: Partial<ButtonProps> & { style?: CSSProperties };
  visible?: boolean | ((context: CrudActionContext) => boolean); // 业务显示条件
  disabled?: boolean | ((context: CrudActionContext) => boolean); // 暂不可操作
  onClick?: (context: CrudActionContext) => void | Promise<unknown>;
};

/**
 * 当前按钮的行及选择上下文。
 */
export interface CrudActionContext {
  row?: CrudRecord;
  selectedRows: readonly CrudRecord[];
  selectedKeys: readonly (string | number)[];
}

/**
 * 交给页面处理的行操作。
 */
export interface CrudRowActionEvent {
  key: string;
  row: CrudRecord;
}

/**
 * 搜索字段及布局。
 */
export interface CrudSearchConfig {
  /** 标签冒号(默认：false) */
  colon?: boolean;
  /** 表单项(默认：[]) */
  fields?: CrudField<CrudSearchFieldType>[];
  /** 是否开启展开和收缩(默认：true) */
  isExpandable?: boolean;
  /** 默认展示的表单项数量(默认：3) */
  showNumber?: number;
  /** 卡片属性 */
  cardAttrs?: Partial<CardProps> & { style?: CSSProperties };
  /** form 组件属性 */
  form?: CrudFormProps;
  /** 自适应网格布局(使用时表单不要添加 style: { width: "200px" }) */
  grid?: boolean | "left" | "right";
}

/**
 * 列表接口、按钮、列及导入导出。
 */
export interface CrudTableConfig<TQuery = CrudRecord, TItem = CrudRecord> {
  /** 权限前缀，如 sys:user；动作可用完整权限覆盖 */
  permissionPrefix?: string;
  /** table 组件属性 */
  table?: Partial<Omit<TableProps<CrudRecord>, "data" | "rowKey">>;
  /** 分页组件位置(默认：left) */
  pagePosition?: "left" | "right";
  /** pagination 组件属性 */
  pagination?:
    | boolean
    | Partial<
        Omit<
          PaginationProps,
          "v-model:page-size" | "v-model:current-page" | "total" | "currentPage"
        >
      >;
  /** 返回分页结果或数组，其他接口结构在此转换 */
  fetchData(queryParams: TQuery): Promise<PageResult<TItem> | TItem[]>;
  /** 分页参数名，默认 pageNum、pageSize */
  paginationKeys?: {
    page: string;
    size: string;
  };
  /** 保存单个字段，失败时组件回滚 */
  updateField?: (data: {
    [key: string]: unknown;
    field: string;
    value: boolean | string | number;
  }) => Promise<unknown>;
  /** 删除记录，主键使用英文逗号拼接 */
  deleteByIds?: (ids: string) => Promise<unknown>;
  /** 后端导出的网络请求函数(需返回 promise) */
  exportFile?: (queryParams: Partial<TQuery>) => Promise<AxiosResponse<Blob>>;
  /** 前端全量导出的网络请求函数(需返回 promise) */
  fetchExportRows?: (queryParams: Partial<TQuery>) => Promise<TItem[]>;
  /** 导入模板 */
  importTemplate?: string | (() => Promise<AxiosResponse<Blob>>);
  /** 后端导入的网络请求函数(需返回 promise) */
  importFile?: (file: File) => Promise<unknown>;
  /** 前端导入的网络请求函数(需返回 promise) */
  importRows?: (data: CrudRecord[]) => Promise<unknown>;
  /** 同时提供两种导入回调时必须指定 */
  importMode?: "file" | "rows";
  /** 同时提供两种导出回调时必须指定 */
  exportMode?: "file" | "rows";
  /** 主键名(默认为 id) */
  rowKey?: string;
  /** 左侧按钮，未配置时不显示 */
  toolbarActions?: Array<ToolbarActionKey | CrudAction>;
  /** 右侧按钮，未配置时不显示 */
  tableTools?: Array<TableToolKey | CrudAction>;
  /** table 组件列属性(额外的属性 cellType,actions,slotName) */
  columns: Array<{
    type?: "default" | "selection" | "index" | "expand";
    label?: string;
    prop?: string;
    width?: string | number;
    align?: "left" | "center" | "right";
    columnKey?: string;
    reserveSelection?: boolean;
    /** 列是否显示 */
    show?: boolean;
    /** 不允许用户在列设置中隐藏 */
    hideable?: boolean;
    /** 远程排序对应的 API 属性，不是数据库列名 */
    sortField?: string;
    /** 模板 */
    cellType?:
      | "image"
      | "list"
      | "url"
      | "switch"
      | "input"
      | "price"
      | "percent"
      | "icon"
      | "date"
      | "actions"
      | "custom";
    /** image 模板相关参数 */
    imageWidth?: number;
    imageHeight?: number;
    /** list 模板相关参数 */
    selectList?: CrudRecord;
    /** switch 模板相关参数 */
    activeValue?: boolean | string | number;
    inactiveValue?: boolean | string | number;
    activeText?: string;
    inactiveText?: string;
    /** input 模板相关参数 */
    inputType?: string;
    /** price 模板相关参数 */
    priceFormat?: string;
    /** date 模板相关参数 */
    dateFormat?: string;
    /** 行操作按钮 */
    actions?: Array<RowActionKey | CrudAction>;
    /** 直接显示的操作上限，默认 3，0 表示全部显示 */
    maxVisibleActions?: number;
    /** filter 值拼接符 */
    filterJoin?: string;
    [key: string]: unknown;
    /** 初始化数据函数 */
    onInit?: (item: CrudRecord) => void | Promise<void>;
  }>;
}

/**
 * 新增、编辑和查看共用的弹窗表单。
 */
export interface CrudFormConfig<T = CrudRecord> {
  /** 标签冒号(默认：false) */
  colon?: boolean;
  /** 主键名(主要用于编辑数据,默认为 id) */
  rowKey?: string;
  /** 组件类型(默认：dialog) */
  component?: "dialog" | "drawer";
  /** dialog 组件属性 */
  dialog?: Partial<Omit<DialogProps, "modelValue">>;
  /** drawer 组件属性 */
  drawer?: Partial<Omit<DrawerProps, "modelValue">>;
  /** form 组件属性 */
  form?: CrudFormProps;
  /** 表单项 */
  fields: CrudFormField[];
  /** 按当前模式显示表单标题 */
  title?: string | ((context: CrudFormContext) => string);
  /** 提交之前处理 */
  beforeSubmit?(data: T): void | Promise<void>;
  /** 保存数据，查看模式不调用 */
  submitForm?(data: T, context: CrudFormContext): Promise<unknown>;
  /** 保存成功提示，false 不提示(默认：保存成功) */
  successMessage?: string | false;
}

/**
 * 同一表单支持的操作模式。
 */
export type CrudFormMode = "create" | "edit" | "view";

/**
 * 表单条件和提交所用的模式、路径主键及当前数据。
 */
export interface CrudFormContext {
  mode: CrudFormMode;
  id?: string | number;
  model: Readonly<CrudRecord>;
}

/**
 * 新增、编辑和查看共用的字段配置。
 */
export type CrudFormField = Omit<CrudField, "label"> & {
  label: string | ((context: CrudFormContext) => string);
  visible?: boolean | ((context: CrudFormContext) => boolean);
  readonly?: boolean | ((context: CrudFormContext) => boolean);
  required?: boolean | ((context: CrudFormContext) => boolean);
};

/**
 * 原生表单属性，模型与校验规则由组件维护。
 */
export type CrudFormProps = Partial<Omit<FormProps, "model" | "rules">>;

/**
 * 搜索与表单共用的字段配置。
 */
export type CrudField<T = CrudFieldType> = {
  /** 组件类型(如 input,select,radio,custom 等) */
  type: T;
  /** 标签提示 */
  tips?: string | CrudRecord;
  /** 标签文本 */
  label: string;
  /** 键名 */
  prop: string;
  /** 组件属性 */
  attrs?: CrudRecord;
  /** 组件可选项(只适用于 select,radio,checkbox 组件) */
  options?:
    | Array<{ label: string; value: string | number | boolean; [key: string]: unknown }>
    | Ref<Array<{ label: string; value: string | number | boolean }>>;
  /** 验证规则 */
  rules?: FormItemRule[];
  /** 初始值 */
  initialValue?: unknown;
  /** 插槽名(适用于自定义组件，设置类型为 custom) */
  slotName?: string;
  /** 是否隐藏 */
  hidden?: boolean;
  /** layout 组件 Col 属性 */
  col?: Partial<ColProps>;
  /** 组件事件 */
  events?: Record<string, (...args: never[]) => void>;
  /** 初始化数据函数扩展 */
  onInit?: (item: CrudRecord) => void | Promise<void>;
};
