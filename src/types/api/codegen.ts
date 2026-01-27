/**
 * CodeGen 代码生成类型定义
 */

import type { BaseQueryParams } from "./common";

/** 代码生成预览对象 */
export interface GeneratorPreviewItem {
  /** 文件生成路径 */
  path: string;
  /** 文件名称 */
  fileName: string;
  /** 文件内容 */
  content: string;
  /** 文件范围(frontend/backend) */
  scope: "frontend" | "backend";
  /** 文件语言(扩展名) */
  language: string;
}

/** 数据表分页查询参数 */
export interface TableQueryParams extends BaseQueryParams {
  /** 搜索关键字(表名) */
  keywords?: string;
}

/** 数据表分页对象 */
export interface TableItem {
  /** 表名称 */
  tableName: string;
  /** 表描述 */
  tableComment: string;
  /** 是否已配置(1:是;0:否) */
  isConfigured?: number;
  /** 存储引擎 */
  engine: string;
  /** 字符集排序规则 */
  tableCollation: string;
  /** 创建时间 */
  createTime: string;
}

/** 代码生成配置表单 */
export interface GenConfigForm {
  /** 主键 */
  id?: string;
  /** 表名 */
  tableName?: string;
  /** 业务名 */
  businessName?: string;
  /** 模块名 */
  moduleName?: string;
  /** 包名 */
  packageName?: string;
  /** 实体名 */
  entityName?: string;
  /** 作者 */
  author?: string;
  /** 上级菜单 */
  parentMenuId?: string;
  /** 后端应用名 */
  backendAppName?: string;
  /** 前端应用名 */
  frontendAppName?: string;
  /** 字段配置列表 */
  fieldConfigs?: FieldConfig[];
  /** 页面类型 classic|curd */
  pageType?: "classic" | "curd";
  /** 要移除的表前缀，如 sys_ */
  removeTablePrefix?: string;
}

/** 字段配置 */
export interface FieldConfig {
  /** 主键 */
  id?: string;
  /** 列名 */
  columnName?: string;
  /** 列类型 */
  columnType?: string;
  /** 字段名 */
  fieldName?: string;
  /** 字段类型 */
  fieldType?: string;
  /** 字段描述 */
  fieldComment?: string;
  /** 是否在列表显示 */
  isShowInList?: number;
  /** 是否在表单显示 */
  isShowInForm?: number;
  /** 是否在查询条件显示 */
  isShowInQuery?: number;
  /** 是否必填 */
  isRequired?: number;
  /** 表单类型 */
  formType?: number;
  /** 查询类型 */
  queryType?: number;
  /** 字段长度 */
  maxLength?: number;
  /** 字段排序 */
  fieldSort?: number;
  /** 字典类型 */
  dictType?: string;
}
