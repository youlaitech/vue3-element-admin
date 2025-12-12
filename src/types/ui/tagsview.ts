/**
 * 标签页相关类型定义
 */

export interface TagView {
  name: string;
  title: string;
  path: string;
  fullPath: string;
  icon?: string;
  affix?: boolean;
  keepAlive?: boolean;
  query?: any;
}
