/**
 * Workflow 工作流类型定义
 */

import type { BaseQueryParams } from "@/api/common";

// ---------------------------------------------------------------
// 流程模型
// ---------------------------------------------------------------

/** 流程模型分页查询参数 */
export interface WorkflowModelQueryParams extends BaseQueryParams {
  /** 搜索关键字（模型名称） */
  keywords?: string;
}

/** 流程模型分页对象 */
export interface WorkflowModelItem {
  /** 模型ID */
  id: string;
  /** 模型名称 */
  name: string;
  /** 模型标识（创建后不可修改） */
  key: string;
  /** 模型描述 */
  description?: string;
  /** 版本号 */
  version: number;
  /** 最新发布定义ID（未发布为空） */
  definitionId?: string;
  /** 最新发布版本号（未发布为空） */
  publishedVersion?: number;
  /** 发布状态：true=已停用，false=已启用（未发布为空） */
  suspended?: boolean;
  /** 发布时间（未发布为空） */
  deploymentTime?: string;
  /** 创建时间 */
  createTime?: string;
  /** 最后更新时间 */
  updateTime?: string;
}

/** 流程模型表单对象 */
export interface WorkflowModelFormData {
  /** 模型名称 */
  name: string;
  /** 模型标识（创建后不可修改，仅新增时展示） */
  key?: string;
  /** 模型描述 */
  description?: string;
}

// ---------------------------------------------------------------
// 流程定义
// ---------------------------------------------------------------

/** 可发起流程对象（发起页流程选择列表） */
export interface StartableProcessItem {
  /** 流程定义ID */
  id: string;
  /** 流程定义标识 */
  key: string;
  /** 流程定义名称 */
  name: string;
  /** 版本号 */
  version: number;
  /** 绑定表单标识（未绑定为空；空则直接发起，无表单填写） */
  formKey?: string;
}

/** 流程审批阶段对象（发起页/审批弹窗展示流程走向与各环节办理人） */
export interface ProcessStageItem {
  /** 节点ID */
  nodeId: string;
  /** 节点名称（审批环节） */
  nodeName: string;
  /** 审批角色名称列表（角色候选组任务） */
  roleNames: string[];
  /** 角色成员账号列表 */
  userNames: string[];
  /** 是否发起人本人办理（assignee=${initiator}） */
  initiator: boolean;
}

// ---------------------------------------------------------------
// 流程实例
// ---------------------------------------------------------------

/** 发起流程表单对象 */
export interface StartProcessFormData {
  /** 流程定义ID */
  processDefinitionId: string;
  /** 流程实例名称（默认可自动拼接流程-姓名-时间，可修改；不传时取流程定义名称） */
  name?: string;
  /** 表单数据（field -> value 映射；流程绑定 formKey 时必填） */
  formData?: Record<string, unknown>;
  /** 流程变量（驱动网关条件；随实例提交） */
  variables?: Record<string, unknown>;
}

/** 流程实例分页查询参数 */
export interface WorkflowInstanceQueryParams extends BaseQueryParams {
  /** 搜索关键字（流程定义名称） */
  keywords?: string;
}

/** 实例状态 */
export type InstanceStatus = "running" | "finished" | "terminated";

/** 流程实例分页对象 */
export interface WorkflowInstanceItem {
  /** 流程实例ID */
  id: string;
  /** 流程定义标识 */
  processDefinitionKey: string;
  /** 流程定义名称 */
  processName: string;
  /** 业务主键（绑定的表单数据ID，未绑定表单为空） */
  businessKey?: string;
  /** 绑定表单标识（未绑定为空） */
  formKey?: string;
  /** 实例状态 */
  status: InstanceStatus;
  /** 终止原因（status=terminated 时有值） */
  deleteReason?: string;
  /** 发起时间 */
  startTime?: string;
  /** 结束时间（运行中为空） */
  endTime?: string;
}

/** 流程图数据对象（bpmn-js 渲染 + 节点高亮） */
export interface ProcessDiagramData {
  /** BPMN 2.0 XML */
  bpmnXml: string;
  /** 已办节点ID列表（高亮为走过路径） */
  executedActivityIds: string[];
  /** 进行中节点ID列表（高亮为当前待办） */
  activeActivityIds: string[];
}

/** 审批记录对象 */
export interface ApprovalHistoryItem {
  /** 节点ID（与流程走向环节 nodeId 对应） */
  activityId?: string;
  /** 节点名称 */
  activityName: string;
  /** 办理人（用户名） */
  assignee?: string;
  /** 审批意见（无则为空） */
  comment?: string;
  /** 任务开始时间 */
  startTime?: string;
  /** 任务办理时间 */
  endTime?: string;
}

/** 流程实例详情对象 */
export interface InstanceDetailData {
  /** 流程实例ID */
  id: string;
  /** 流程定义名称 */
  processName: string;
  /** 发起人（用户名） */
  startUser?: string;
  /** 绑定表单标识（未绑定表单为空） */
  formKey?: string;
  /** 发起表单规则（按提交时快照严格回显） */
  formJson?: string;
  /** 发起表单全局配置（快照） */
  optionsJson?: string;
  /** 发起表单数据（field -> value 映射的 JSON 字符串） */
  dataJson?: string;
  /** 实例状态 */
  status: InstanceStatus;
  /** 终止原因（status=terminated 时有值） */
  deleteReason?: string;
  /** 发起时间 */
  startTime?: string;
  /** 结束时间（运行中为空） */
  endTime?: string;
  /** 审批记录（按时间正序） */
  history: ApprovalHistoryItem[];
  /** 流程走向预览（按 BPMN 编排顺序） */
  stages: ProcessStageItem[];
  /** 当前进行中的环节下标（正常结束为环节总数；终止/撤销为最后办完环节的下一位置） */
  activeStageIndex?: number;
}

// ---------------------------------------------------------------
// 流程任务
// ---------------------------------------------------------------

/** 任务分页查询参数（待办/已办共用） */
export interface WorkflowTaskQueryParams extends BaseQueryParams {
  /** 搜索关键字（任务名称） */
  keywords?: string;
}

/** 待办任务分页对象 */
export interface TodoTaskItem {
  /** 任务ID */
  id: string;
  /** 任务名称 */
  name: string;
  /** 流程实例ID */
  processInstanceId: string;
  /** 流程定义名称 */
  processName: string;
  /** 业务主键（绑定的表单数据ID，未绑定表单为空） */
  businessKey?: string;
  /** 绑定表单标识（未绑定为空） */
  formKey?: string;
  /** 任务创建时间 */
  createTime?: string;
}

/** 已办任务分页对象 */
export interface DoneTaskItem {
  /** 任务ID */
  id: string;
  /** 任务名称 */
  name: string;
  /** 流程实例ID */
  processInstanceId: string;
  /** 流程定义名称 */
  processName: string;
  /** 任务办理时间 */
  endTime?: string;
  /** 处理意见（未填写为空） */
  comment?: string;
}

/** 待办任务详情对象（审批页渲染：发起表单只读回显 + 审批记录） */
export interface TaskDetailData {
  /** 任务ID */
  taskId: string;
  /** 任务名称 */
  taskName: string;
  /** 当前任务节点ID（BPMN 节点，用于流程走向高亮定位） */
  taskDefinitionKey?: string;
  /** 流程实例ID */
  processInstanceId: string;
  /** 流程定义名称 */
  processName: string;
  /** 发起表单标识（未绑定表单为空） */
  formKey?: string;
  /** 发起表单规则（按提交时快照严格回显） */
  formJson?: string;
  /** 发起表单全局配置（快照） */
  optionsJson?: string;
  /** 发起表单数据（field -> value 映射的 JSON 字符串） */
  dataJson?: string;
  /** 当前任务绑定表单标识（任务节点 formKey，未绑定为空） */
  taskFormKey?: string;
  /** 审批记录（按时间正序） */
  history: ApprovalHistoryItem[];
  /** 流程走向预览（按 BPMN 编排顺序） */
  stages: ProcessStageItem[];
}

/** 审批任务表单对象（通过） */
export interface CompleteTaskFormData {
  /** 审批意见 */
  comment?: string;
  /** 流程变量（驱动后续网关条件） */
  variables?: Record<string, unknown>;
}

/** 驳回任务表单对象 */
export interface RejectTaskFormData {
  /** 目标节点ID（驳回到的历史节点） */
  targetActivityId: string;
  /** 驳回意见 */
  comment?: string;
}

/** 驳回目标节点对象 */
export interface RejectTargetItem {
  /** 节点ID */
  activityId: string;
  /** 节点名称 */
  activityName: string;
}
