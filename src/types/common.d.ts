/**
 * 组件类型声明
 */

/**
 * 弹窗属性类型声明
 */
export interface Dialog {
  title: string;
  visible: boolean;
}

/**
 * 通用组件选择项类型声明
 */
export interface Option {
  value: string;
  label: string;
  children?: Option[];
}
