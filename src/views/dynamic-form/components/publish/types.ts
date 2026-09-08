/** 发布方式 */
export type PublishMethod = "menu" | "share";

/** 目录树节点（el-tree-select 数据源） */
export interface CatalogNode {
  value: string;
  label: string;
  routePath?: string;
  children?: CatalogNode[];
}
