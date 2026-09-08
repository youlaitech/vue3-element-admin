/**
 * Form 动态表单类型定义
 */

import type { BaseQueryParams } from "@/api/common";

/** 表单定义分页查询参数 */
export interface FormDefinitionQueryParams extends BaseQueryParams {
  /** 搜索关键字（表单名称/标识） */
  keywords?: string;
  /** 状态(0草稿 1已发布 -1已停用) */
  status?: number;
  /** 表单类型(normal普通表单 workflow工作流表单，空串=全部) */
  category?: string;
}

/** 表单定义分页对象 */
export interface FormDefinitionItem {
  /** 表单ID */
  id: string;
  /** 表单唯一标识 */
  formKey: string;
  /** 表单名称 */
  formName: string;
  /** 表单描述 */
  description?: string;
  /** 状态(0草稿 1已发布 -1已停用) */
  status: number;
  /** 版本号 */
  version: number;
  /** 是否允许匿名公开访问(0否 1是) */
  isPublic?: number;
  /** 表单类型(normal普通表单 workflow工作流表单，空串=全部) */
  category?: string;
  /** 创建时间 */
  createTime?: string;
}

/** 表单定义表单对象 */
export interface FormDefinitionData {
  /** 表单ID */
  id?: string;
  /** 表单唯一标识（创建后不可修改） */
  formKey?: string;
  /** 表单名称 */
  formName?: string;
  /** 表单描述 */
  description?: string;
  /** 表单规则（form-create rule 数组 JSON 字符串，由设计器产出） */
  formJson?: string;
  /** 表单全局配置 JSON 字符串 */
  optionsJson?: string;
  /** 是否允许匿名公开访问(0否 1是)，公开访问总开关 */
  isPublic?: number;
  /** 表单类型(normal通用表单 workflow工作流表单，缺省normal) */
  category?: string;
}

/** 表单渲染对象（渲染端按 formKey 加载） */
export interface FormRenderData {
  /** 表单唯一标识 */
  formKey: string;
  /** 表单名称 */
  formName: string;
  /** 表单版本号 */
  version: number;
  /** 表单规则（form-create rule 数组 JSON 字符串） */
  formJson: string;
  /** 表单全局配置 JSON 字符串 */
  optionsJson?: string;
}

/** 表单数据分页查询参数 */
export type FormDataQueryParams = BaseQueryParams;

/** 表单数据分页对象 */
export interface FormDataItem {
  /** 数据ID */
  id: string;
  /** 表单版本（提交时快照） */
  formVersion: number;
  /** 表单数据（field -> value 映射的 JSON 字符串） */
  dataJson: string;
  /** 回显规则（提交时版本的快照；仅详情接口填充） */
  formJson?: string;
  /** 回显全局配置（提交时版本的快照；仅详情接口填充） */
  optionsJson?: string;
  /** 提交人ID（匿名提交为空） */
  createBy?: string;
  /** 提交人昵称（匿名提交为空） */
  createByName?: string;
  /** 提交时间 */
  createTime?: string;
}

/** 表单菜单配置（发布向导回显已生成的入口） */
export interface FormMenuConfig {
  /** 菜单ID（未生成过入口时为空） */
  menuId?: string;
  /** 菜单名称（侧边栏展示） */
  menuName: string;
  /** 上级菜单ID */
  parentId: string;
  /** 可见角色ID列表 */
  roleIds?: string[];
}

/** 表单菜单发布对象（发布向导"入口配置"步骤提交） */
export interface FormMenuFormData {
  /** 菜单名称（侧边栏展示） */
  menuName: string;
  /** 上级菜单ID（须为目录类型；留空时后端自动使用/创建默认目录"表单中心"） */
  parentId?: string;
  /** 可见角色ID列表（不选时仅超级管理员可见） */
  roleIds?: string[];
}
