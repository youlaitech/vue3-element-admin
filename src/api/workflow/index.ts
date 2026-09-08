import request from "@/utils/request";
import type { PageResult } from "@/api/common";
import type {
  CompleteTaskFormData,
  DoneTaskItem,
  InstanceDetailData,
  ProcessDiagramData,
  ProcessStageItem,
  RejectTargetItem,
  RejectTaskFormData,
  StartProcessFormData,
  StartableProcessItem,
  TaskDetailData,
  TodoTaskItem,
  WorkflowInstanceItem,
  WorkflowInstanceQueryParams,
  WorkflowModelFormData,
  WorkflowModelItem,
  WorkflowModelQueryParams,
  WorkflowTaskQueryParams,
} from "./types";

const WORKFLOW_BASE_URL = "/api/v1/workflow";

/** 流程模型接口（设计器侧：模型 CRUD、XML、部署） */
const ModelAPI = {
  /** 流程模型分页列表 */
  getPage(queryParams: WorkflowModelQueryParams) {
    return request<unknown, PageResult<WorkflowModelItem>>({
      url: `${WORKFLOW_BASE_URL}/models`,
      method: "get",
      params: queryParams,
    });
  },
  /** 新增流程模型（内置开始-审批-结束模板） */
  create(data: WorkflowModelFormData) {
    return request({ url: `${WORKFLOW_BASE_URL}/models`, method: "post", data });
  },
  /** 修改流程模型（标识创建后不可修改） */
  update(modelId: string, data: WorkflowModelFormData) {
    return request({ url: `${WORKFLOW_BASE_URL}/models/${modelId}`, method: "put", data });
  },
  /** 删除流程模型（ids 多个用逗号拼接） */
  deleteByIds(ids: string) {
    return request({ url: `${WORKFLOW_BASE_URL}/models/${ids}`, method: "delete" });
  },
  /** 获取模型 BPMN XML（设计器回显） */
  getXml(modelId: string) {
    return request<unknown, { xml: string }>({
      url: `${WORKFLOW_BASE_URL}/models/${modelId}/xml`,
      method: "get",
    });
  },
  /** 保存模型 BPMN XML（设计器产出） */
  saveXml(modelId: string, xml: string) {
    return request({
      url: `${WORKFLOW_BASE_URL}/models/${modelId}/xml`,
      method: "put",
      data: { xml },
    });
  },
  /** 部署流程模型（发布为流程定义新版本） */
  deploy(modelId: string) {
    return request({ url: `${WORKFLOW_BASE_URL}/models/${modelId}/deploy`, method: "post" });
  },
  /** 重置工作流数据（清空所有流程含自建的模型/定义/实例/历史与关联表单数据，重建初始演示流程） */
  resetDemo() {
    return request({ url: `${WORKFLOW_BASE_URL}/models/demo/reset`, method: "post" });
  },
};

/** 流程定义接口（发布产物管理，入口在「流程设计」页行内操作） */
const DefinitionAPI = {
  /** 可发起流程列表（发起页下拉数据源） */
  listStartable() {
    return request<unknown, StartableProcessItem[]>({
      url: `${WORKFLOW_BASE_URL}/definitions/startable`,
      method: "get",
    });
  },
  /** 流程审批阶段预览（发起页/审批弹窗展示流程走向与各环节办理人） */
  listStages(definitionId: string) {
    return request<unknown, ProcessStageItem[]>({
      url: `${WORKFLOW_BASE_URL}/definitions/${definitionId}/stages`,
      method: "get",
    });
  },
  /** 获取流程定义 BPMN XML（流程图查看） */
  getXml(definitionId: string) {
    return request<unknown, { xml: string }>({
      url: `${WORKFLOW_BASE_URL}/definitions/${definitionId}/xml`,
      method: "get",
    });
  },
  /** 启用/停用流程（停用后不可发起新流程，运行中的实例不受影响） */
  updateState(definitionId: string, suspend: boolean) {
    return request({
      url: `${WORKFLOW_BASE_URL}/definitions/${definitionId}/state`,
      method: "put",
      data: { suspend },
    });
  },
};

/** 流程实例接口（发起、我的流程、详情、流程图、撤销/终止） */
const InstanceAPI = {
  /** 发起流程（返回流程实例ID） */
  start(data: StartProcessFormData) {
    return request<unknown, string>({
      url: `${WORKFLOW_BASE_URL}/instances`,
      method: "post",
      data,
    });
  },
  /** 我的流程分页列表 */
  getPage(queryParams: WorkflowInstanceQueryParams) {
    return request<unknown, PageResult<WorkflowInstanceItem>>({
      url: `${WORKFLOW_BASE_URL}/instances`,
      method: "get",
      params: queryParams,
    });
  },
  /** 获取流程图数据（节点高亮） */
  getDiagram(instanceId: string) {
    return request<unknown, ProcessDiagramData>({
      url: `${WORKFLOW_BASE_URL}/instances/${instanceId}/diagram`,
      method: "get",
    });
  },
  /** 获取流程实例详情 */
  getDetail(instanceId: string) {
    return request<unknown, InstanceDetailData>({
      url: `${WORKFLOW_BASE_URL}/instances/${instanceId}`,
      method: "get",
    });
  },
  /** 撤销流程（仅发起人） */
  cancel(instanceId: string) {
    return request({ url: `${WORKFLOW_BASE_URL}/instances/${instanceId}/cancel`, method: "put" });
  },
  /** 终止流程（管理员） */
  terminate(instanceId: string, reason?: string) {
    return request({
      url: `${WORKFLOW_BASE_URL}/instances/${instanceId}/terminate`,
      method: "put",
      params: { reason },
    });
  },
};

/** 流程任务接口（待办/已办、审批通过/驳回） */
const TaskAPI = {
  /** 待办任务分页列表 */
  getTodoPage(queryParams: WorkflowTaskQueryParams) {
    return request<unknown, PageResult<TodoTaskItem>>({
      url: `${WORKFLOW_BASE_URL}/tasks/todo`,
      method: "get",
      params: queryParams,
    });
  },
  /** 已办任务分页列表 */
  getDonePage(queryParams: WorkflowTaskQueryParams) {
    return request<unknown, PageResult<DoneTaskItem>>({
      url: `${WORKFLOW_BASE_URL}/tasks/done`,
      method: "get",
      params: queryParams,
    });
  },
  /** 获取待办任务详情（发起表单回显 + 审批记录） */
  getDetail(taskId: string) {
    return request<unknown, TaskDetailData>({
      url: `${WORKFLOW_BASE_URL}/tasks/${taskId}`,
      method: "get",
    });
  },
  /** 获取驳回目标节点列表 */
  listRejectTargets(taskId: string) {
    return request<unknown, RejectTargetItem[]>({
      url: `${WORKFLOW_BASE_URL}/tasks/${taskId}/reject-targets`,
      method: "get",
    });
  },
  /** 审批通过 */
  complete(taskId: string, data: CompleteTaskFormData) {
    return request({ url: `${WORKFLOW_BASE_URL}/tasks/${taskId}/complete`, method: "put", data });
  },
  /** 驳回 */
  reject(taskId: string, data: RejectTaskFormData) {
    return request({ url: `${WORKFLOW_BASE_URL}/tasks/${taskId}/reject`, method: "put", data });
  },
};

const WorkflowAPI = {
  model: ModelAPI,
  definition: DefinitionAPI,
  instance: InstanceAPI,
  task: TaskAPI,
};

export default WorkflowAPI;

// 重导出类型
export * from "./types";
