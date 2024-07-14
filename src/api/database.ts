import request from "@/utils/request";

const DATABASE_BASE_URL = "/api/v1/databases";

class DatabaseAPI {
  /** 获取数据表分页列表 */
  static getTablePage(params: TablePageQuery) {
    return request<any, PageResult<TablePageVO[]>>({
      url: `${DATABASE_BASE_URL}/table/page`,
      method: "get",
      params: params,
    });
  }

  /** 获取代码生成预览数据 */
  static getTableColumns(tableName: string) {
    return request<any, TableColumnVO[]>({
      url: `${DATABASE_BASE_URL}/${tableName}/columns`,
      method: "get",
    });
  }

  /** 获取代码生成预览数据 */
  static getPreviewData(tableName: string) {
    return request<any, GeneratorPreviewVO>({
      url: `${DATABASE_BASE_URL}/table/${tableName}/generate-preview`,
      method: "get",
    });
  }
}

export default DatabaseAPI;

/** 代码生成预览对象 */
export interface GeneratorPreviewVO {
  /** 文件生成路径 */
  path: string;
  /** 文件名称 */
  fileName: string;
  /** 文件内容 */
  content: string;
}

/**  数据表分页查询参数 */
export interface TablePageQuery extends PageQuery {
  /** 关键字(表名) */
  keywords?: string;
}

/** 数据表分页对象 */
export interface TablePageVO {
  /** 表名称 */
  tableName: string;

  /** 表描述 */
  tableComment: string;

  /** 存储引擎 */
  engine: string;

  /** 字符集排序规则 */
  tableCollation: string;

  /** 创建时间 */
  createTime: string;
}

/** 数据表字段VO */
export interface TableColumnVO {
  /** 字段名称 */
  columnName: string;

  /** 字段类型 */
  dataType: string;

  /** 字段描述 */
  columnComment: string;

  /** 字段长度 */
  characterMaximumLength: number;

  /** 是否主键(1-是 0-否) */
  isPrimaryKey: number;

  /** 是否可为空(1-是 0-否) */
  isNullable: string;

  /** 字符集 */
  characterSetName: string;

  /** 字符集排序规则 */
  collationName: string;
}
