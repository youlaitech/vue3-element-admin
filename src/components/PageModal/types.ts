import type {
  DialogProps,
  DrawerProps,
  FormProps,
  FormItemRule,
} from "element-plus";

// dialog组件属性
export type IDialog = Partial<Omit<DialogProps, "modelValue">>;

// drawer组件属性
export type IDrawer = Partial<Omit<DrawerProps, "modelValue">>;

// form组件属性
export type IForm = Partial<Omit<FormProps, "model" | "rules">>;

// 对象类型
export type IObject = Record<string, any>;

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
  watch?: (newValue: any, oldValue: any, data: T) => void;
  // 计算属性函数
  computed?: (data: T) => any;
  // 监听收集函数
  watchEffect?: (data: T) => void;
}>;
