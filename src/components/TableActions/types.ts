import type { ButtonProps } from "element-plus";
import type { CSSProperties } from "vue";

/**
 * 已完成权限筛选的表格行操作。
 */
export interface TableAction {
  key: string;
  label?: string;
  buttonProps?: Partial<ButtonProps> & { style?: CSSProperties };
  disabled?: boolean;
  loading?: boolean;
  run: () => void | Promise<unknown>;
}
