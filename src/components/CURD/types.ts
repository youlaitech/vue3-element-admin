import type {
  DialogProps,
  DrawerProps,
  FormItemRule,
  FormProps,
  PaginationProps,
  TableProps,
} from "element-plus";
import PageContent from "./PageContent.vue";
import PageForm from "./PageForm.vue";
import PageModal from "./PageModal.vue";
import PageSearch from "./PageSearch.vue";

export type PageSearchInstance = InstanceType<typeof PageSearch>;
export type PageContentInstance = InstanceType<typeof PageContent>;
export type PageModalInstance = InstanceType<typeof PageModal>;
export type PageFormInstance = InstanceType<typeof PageForm>;

export type IObject = Record<string, any>;

export interface IOperatData {
  name: string;
  row: IObject;
  column: IObject;
  $index: number;
}

export interface ISearchConfig {
  // 页面名称(参与组成权限标识,如sys:user:xxx)
  pageName: string;
  // 表单项
  formItems: Array<{
    // 组件类型(如input,select等)
    type?: "input" | "select" | "tree-select" | "date-picker" | "input-tag";
    // 标签文本
    label: string;
    // 标签提示
    tips?: string;
    // 键名
    prop: string;
    // 组件属性(input-tag组件支持join,btnText,size属性)
    attrs?: IObject;
    // 初始值
    initialValue?: any;
    // 可选项(适用于select组件)
    options?: { label: string; value: any }[];
    // 初始化数据函数扩展
    initFn?: (formItem: IObject) => void;
  }>;
  // 是否开启展开和收缩
  isExpandable?: boolean;
  // 默认展示的表单项数量
  showNumber?: number;
}

export interface IContentConfig<T = any> {
  // 页面名称(参与组成权限标识,如sys:user:xxx)
  pageName: string;
  // table组件属性
  table?: Omit<TableProps<any>, "data">;
  // pagination组件属性
  pagination?:
    | boolean
    | Partial<
        Omit<
          PaginationProps,
          "v-model:page-size" | "v-model:current-page" | "total" | "currentPage"
        >
      >;
  // 列表的网络请求函数(需返回promise)
  indexAction: (queryParams: T) => Promise<any>;
  // 默认的分页相关的请求参数
  request?: {
    pageName: string;
    limitName: string;
  };
  // 数据格式解析的回调函数
  parseData?: (res: any) => {
    total: number;
    list: IObject[];
    [key: string]: any;
  };
  // 修改属性的网络请求函数(需返回promise)
  modifyAction?: (data: {
    [key: string]: any;
    field: string;
    value: boolean | string | number;
  }) => Promise<any>;
  // 删除的网络请求函数(需返回promise)
  deleteAction?: (ids: string) => Promise<any>;
  // 后端导出的网络请求函数(需返回promise)
  exportAction?: (queryParams: T) => Promise<any>;
  // 前端全量导出的网络请求函数(需返回promise)
  exportsAction?: (queryParams: T) => Promise<IObject[]>;
  // 导入模板
  importTemplate?: string | (() => Promise<any>);
  // 后端导入的网络请求函数(需返回promise)
  importAction?: (file: File) => Promise<any>;
  // 前端导入的网络请求函数(需返回promise)
  importsAction?: (data: IObject[]) => Promise<any>;
  // 主键名(默认为id)
  pk?: string;
  // 表格工具栏(默认支持add,delete,export,也可自定义)
  toolbar?: Array<
    | "add"
    | "delete"
    | "import"
    | "export"
    | {
        auth: string;
        icon?: string;
        name: string;
        text: string;
        type?: "primary" | "success" | "warning" | "danger" | "info";
      }
  >;
  // 表格工具栏右侧图标
  defaultToolbar?: Array<
    | "refresh"
    | "filter"
    | "imports"
    | "exports"
    | "search"
    | {
        name: string;
        icon: string;
        title?: string;
        auth?: string;
      }
  >;
  // table组件列属性(额外的属性templet,operat,slotName)
  cols: Array<{
    type?: "default" | "selection" | "index" | "expand";
    label?: string;
    prop?: string;
    width?: string | number;
    align?: "left" | "center" | "right";
    columnKey?: string;
    reserveSelection?: boolean;
    // 列是否显示
    show?: boolean;
    // 模板
    templet?:
      | "image"
      | "list"
      | "url"
      | "switch"
      | "input"
      | "price"
      | "percent"
      | "icon"
      | "date"
      | "tool"
      | "custom";
    // image模板相关参数
    imageWidth?: number;
    imageHeight?: number;
    // list模板相关参数
    selectList?: IObject;
    // switch模板相关参数
    activeValue?: boolean | string | number;
    inactiveValue?: boolean | string | number;
    activeText?: string;
    inactiveText?: string;
    // input模板相关参数
    inputType?: string;
    // price模板相关参数
    priceFormat?: string;
    // date模板相关参数
    dateFormat?: string;
    // tool模板相关参数
    operat?: Array<
      | "edit"
      | "delete"
      | {
          auth: string;
          icon?: string;
          name: string;
          text: string;
          type?: "primary" | "success" | "warning" | "danger" | "info";
          render?: (row: IObject) => boolean;
        }
    >;
    // filter值拼接符
    filterJoin?: string;
    [key: string]: any;
    // 初始化数据函数
    initFn?: (item: IObject) => void;
  }>;
}

export interface IModalConfig<T = any> {
  // 页面名称
  pageName?: string;
  // 主键名(主要用于编辑数据,默认为id)
  pk?: string;
  // 组件类型
  component?: "dialog" | "drawer";
  // dialog组件属性
  dialog?: Partial<Omit<DialogProps, "modelValue">>;
  // drawer组件属性
  drawer?: Partial<Omit<DrawerProps, "modelValue">>;
  // form组件属性
  form?: IForm;
  // 表单项
  formItems: IFormItems<T>;
  // 提交之前处理
  beforeSubmit?: (data: T) => void;
  // 提交的网络请求函数(需返回promise)
  formAction: (data: T) => Promise<any>;
}

export type IForm = Partial<Omit<FormProps, "model" | "rules">>;

// 表单项
export type IFormItems<T = any> = Array<{
  // 组件类型(如input,select,radio,custom等，默认input)
  type?:
    | "input"
    | "select"
    | "radio"
    | "checkbox"
    | "tree-select"
    | "date-picker"
    | "input-number"
    | "text"
    | "custom";
  // 组件属性
  attrs?: IObject;
  // 组件可选项(适用于select,radio,checkbox组件)
  options?: Array<{
    label: string;
    value: any;
    disabled?: boolean;
    [key: string]: any;
  }>;
  // 插槽名(适用于组件类型为custom)
  slotName?: string;
  // 标签文本
  label: string;
  // 标签提示
  tips?: string;
  // 键名
  prop: string;
  // 验证规则
  rules?: FormItemRule[];
  // 初始值
  initialValue?: any;
  // 是否隐藏
  hidden?: boolean;
  // 监听函数
  watch?: (newValue: any, oldValue: any, data: T, items: IObject[]) => void;
  // 计算属性函数
  computed?: (data: T) => any;
  // 监听收集函数
  watchEffect?: (data: T) => void;
  // 初始化数据函数扩展
  initFn?: (item: IObject) => void;
}>;

export interface IPageForm {
  // 主键名(主要用于编辑数据,默认为id)
  pk?: string;
  // form组件属性
  form?: IForm;
  // 表单项
  formItems: IFormItems;
}
