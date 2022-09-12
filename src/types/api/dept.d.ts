/**
 * 部门查询参数类型声明
 */
export interface DeptQueryParam {
  name: string | undefined;
  status: number | undefined;
}

/**
 * 部门列表项声明
 */

export interface DeptItem {
  id: string;
  name: string;
  parentId: string;
  treePath: string;
  sort: number;
  status: number;
  leader?: string;
  mobile?: string;
  email?: string;
  children: DeptItem[];
}

/**
 * 部门表单类型声明
 */
export interface DeptFormData {
  id?: string;
  parentId: string;
  name: string;
  sort: number;
  status: number;
}
