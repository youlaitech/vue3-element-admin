/**
 * 字典类型查询参数
 */
export interface DictTypeQuery extends PageQuery {
  /**
   * 字典类型名称
   */
  name?: string;
}

/**
 * 字典类型分页对象
 */
export interface DictTypePageVO {
  /**
   * 字典类型ID
   */
  id: number;
  /**
   * 类型编码
   */
  code: string;
  /**
   * 类型名称
   */
  name: string;
  /**
   * 状态(1:启用;0:禁用)
   */
  status?: number;
  /**
   * 备注
   */
  remark?: string;
}

/**
 * 字典分页项类型声明
 */
export type DictTypePageResult = PageResult<DictTypePageVO[]>;

/**
 * 字典表单类型声明
 */
export interface DictTypeForm {
  /**
   * 字典类型ID
   */
  id?: number;
  /**
   * 类型名称
   */
  name?: string;
  /**
   * 类型编码
   */
  code?: string;
  /**
   * 类型状态：1:启用;0:禁用
   */
  status: number;
  /**
   * 备注
   */
  remark?: string;
}

/**
 * 字典查询参数
 */
export interface DictQuery extends PageQuery {
  /**
   * 字典项名称
   */
  name?: string;
  /**
   * 字典类型编码
   */
  typeCode?: string;
}

/**
 * 字典分页对象
 */
export interface DictPageVO {
  /**
   * 字典ID
   */
  id?: number;
  /**
   * 字典名称
   */
  name?: string;
  /**
   * 状态(1:启用;0:禁用)
   */
  status?: number;
  /**
   * 字典值
   */
  value?: string;
}

/**
 * 字典分页
 */
export type DictPageResult = PageResult<DictPageVO[]>;

/**
 * 字典表单
 */
export interface DictForm {
  /**
   * 字典ID
   */
  id?: number;
  /**
   * 字典名称
   */
  name?: string;
  /**
   * 排序
   */
  sort?: number;
  /**
   * 状态(1:启用;0:禁用)
   */
  status?: number;
  /**
   * 类型编码
   */
  typeCode?: string;
  /**
   * 值
   */
  value?: string;

  /**
   * 备注
   */
  remark?: string;
}
