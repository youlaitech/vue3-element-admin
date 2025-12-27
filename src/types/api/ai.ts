/**
 * AI 模块类型定义
 */

/** AI命令请求参数 */
export interface AiCommandRequest {
  /** 用户输入的自然语言命令 */
  command: string;
  /** 当前页面路由（用于上下文） */
  currentRoute?: string;
  /** 当前激活的组件名称 */
  currentComponent?: string;
  /** 额外上下文信息 */
  context?: Record<string, any>;
}

/** 函数调用参数 */
export interface FunctionCall {
  /** 函数名称 */
  name: string;
  /** 函数描述 */
  description?: string;
  /** 参数对象 */
  arguments: Record<string, any>;
}

/** AI命令解析响应 */
export interface AiCommandResponse {
  /** 解析日志ID（用于关联执行记录） */
  parseLogId?: string;
  /** 是否成功解析 */
  success: boolean;
  /** 解析后的函数调用列表 */
  functionCalls: FunctionCall[];
  /** AI的理解和说明 */
  explanation?: string;
  /** 置信度(0-1) */
  confidence?: number;
  /** 错误信息 */
  error?: string;
  /** 原始LLM响应（用于调试） */
  rawResponse?: string;
}

/** AI命令执行请求 */
export interface AiExecuteRequest {
  /** 关联的解析日志ID */
  parseLogId?: string;
  /** 原始命令（用于审计） */
  originalCommand?: string;
  /** 要执行的函数调用 */
  functionCall: FunctionCall;
  /** 确认模式：auto=自动执行, manual=需要用户确认 */
  confirmMode?: "auto" | "manual";
  /** 用户确认标志 */
  userConfirmed?: boolean;
  /** 幂等性令牌（防止重复执行） */
  idempotencyKey?: string;
  /** 当前页面路由 */
  currentRoute?: string;
}

/** AI命令执行响应 */
export interface AiExecuteResponse {
  /** 是否执行成功 */
  success: boolean;
  /** 执行结果数据 */
  data?: any;
  /** 执行结果说明 */
  message?: string;
  /** 影响的记录数 */
  affectedRows?: number;
  /** 错误信息 */
  error?: string;
  /** 记录ID（用于追踪） */
  recordId?: string;
  /** 需要用户确认 */
  requiresConfirmation?: boolean;
  /** 确认提示信息 */
  confirmationPrompt?: string;
}

/** AI命令记录分页查询参数 */
export interface AiCommandRecordPageQuery extends PageQuery {
  /** 搜索关键字 */
  keywords?: string;
  /** 执行状态 */
  executeStatus?: number;
  /** 解析状态 */
  parseStatus?: number;
  /** 用户ID */
  userId?: number;
  /** AI提供商 */
  aiProvider?: string;
  /** AI模型 */
  aiModel?: string;
  /** 函数名称 */
  functionName?: string;
  /** 创建时间 */
  createTime?: [string, string];
}

/** AI命令记录视图对象 */
export interface AiCommandRecordVo {
  /** 记录ID */
  id: string;
  /** 用户ID */
  userId: number;
  /** 用户名 */
  username: string;
  /** 原始命令 */
  originalCommand: string;
  /** AI提供商 */
  aiProvider?: string;
  /** AI模型 */
  aiModel?: string;
  /** 解析状态 */
  parseStatus?: number;
  /** 函数调用列表 */
  functionCalls?: string;
  /** 解析说明 */
  explanation?: string;
  /** 置信度 */
  confidence?: number;
  /** 解析错误信息 */
  parseErrorMessage?: string;
  /** 输入Token数 */
  inputTokens?: number;
  /** 输出Token数 */
  outputTokens?: number;
  /** 解析耗时(毫秒) */
  parseDurationMs?: number;
  /** 函数名称 */
  functionName?: string;
  /** 函数参数 */
  functionArguments?: string;
  /** 执行状态 */
  executeStatus?: number;
  /** 执行错误信息 */
  executeErrorMessage?: string;
  /** IP地址 */
  ipAddress?: string;
  /** 创建时间 */
  createTime?: string;
  /** 更新时间 */
  updateTime?: string;
}
