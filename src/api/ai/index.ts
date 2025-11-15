import request from "@/utils/request";

/**
 * AI 命令请求参数
 */
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

/**
 * 函数调用参数
 */
export interface FunctionCall {
  /** 函数名称 */
  name: string;
  /** 函数描述 */
  description?: string;
  /** 参数对象 */
  arguments: Record<string, any>;
}

/**
 * AI 命令解析响应
 */
export interface AiCommandResponse {
  /** 解析日志ID（用于关联执行记录） */
  parseLogId?: string;
  /** 是否成功解析 */
  success: boolean;
  /** 解析后的函数调用列表 */
  functionCalls: FunctionCall[];
  /** AI 的理解和说明 */
  explanation?: string;
  /** 置信度 (0-1) */
  confidence?: number;
  /** 错误信息 */
  error?: string;
  /** 原始 LLM 响应（用于调试） */
  rawResponse?: string;
}

/**
 * AI 命令执行请求
 */
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

/**
 * AI 命令执行响应
 */
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

export interface AiCommandRecordPageQuery extends PageQuery {
  keywords?: string;
  executeStatus?: string;
  parseSuccess?: boolean;
  userId?: number;
  isDangerous?: boolean;
  provider?: string;
  model?: string;
  functionName?: string;
  createTime?: [string, string];
}

export interface AiCommandRecordVO {
  id: string;
  userId: number;
  username: string;
  originalCommand: string;
  provider?: string;
  model?: string;
  parseSuccess?: boolean;
  functionCalls?: string;
  explanation?: string;
  confidence?: number;
  parseErrorMessage?: string;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  parseTime?: number;
  functionName?: string;
  functionArguments?: string;
  executeStatus?: string;
  executeResult?: string;
  executeErrorMessage?: string;
  affectedRows?: number;
  isDangerous?: boolean;
  requiresConfirmation?: boolean;
  userConfirmed?: boolean;
  executionTime?: number;
  ipAddress?: string;
  userAgent?: string;
  currentRoute?: string;
  createTime?: string;
  updateTime?: string;
  remark?: string;
}

/**
 * AI 命令 API
 */
class AiCommandApi {
  /**
   * 解析自然语言命令
   *
   * @param data 命令请求参数
   * @returns 解析结果
   */
  static parseCommand(data: AiCommandRequest): Promise<AiCommandResponse> {
    return request<any, AiCommandResponse>({
      url: "/api/v1/ai/command/parse",
      method: "post",
      data,
    });
  }

  /**
   * 执行已解析的命令
   *
   * @param data 执行请求参数
   * @returns 执行结果数据（成功时返回，失败时抛出异常）
   */
  static executeCommand(data: AiExecuteRequest): Promise<any> {
    return request<any, any>({
      url: "/api/v1/ai/command/execute",
      method: "post",
      data,
    });
  }

  /**
   * 获取命令记录分页列表
   */
  static getCommandRecordPage(queryParams: AiCommandRecordPageQuery) {
    return request<any, PageResult<AiCommandRecordVO[]>>({
      url: "/api/v1/ai/command/records",
      method: "get",
      params: queryParams,
    });
  }

  /**
   * 撤销命令执行（如果支持）
   */
  static rollbackCommand(recordId: string) {
    return request({
      url: `/api/v1/ai/command/rollback/${recordId}`,
      method: "post",
    });
  }
}

export default AiCommandApi;
