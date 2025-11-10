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
  /** 要执行的函数调用 */
  functionCall: FunctionCall;
  /** 确认模式：auto=自动执行, manual=需要用户确认 */
  confirmMode?: "auto" | "manual";
  /** 用户确认标志 */
  userConfirmed?: boolean;
  /** 幂等性令牌（防止重复执行） */
  idempotencyKey?: string;
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
  /** 审计ID（用于追踪） */
  auditId?: string;
  /** 需要用户确认 */
  requiresConfirmation?: boolean;
  /** 确认提示信息 */
  confirmationPrompt?: string;
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
   * @returns 执行结果
   */
  static executeCommand(data: AiExecuteRequest): Promise<AiExecuteResponse> {
    return request<any, AiExecuteResponse>({
      url: "/api/v1/ai/command/execute",
      method: "post",
      data,
    });
  }

  /**
   * 获取命令执行历史
   *
   * @param params 查询参数
   * @returns 历史记录列表
   */
  static getCommandHistory(params?: {
    page?: number;
    size?: number;
    startTime?: string;
    endTime?: string;
  }) {
    return request({
      url: "/api/v1/ai/command/history",
      method: "get",
      params,
    });
  }

  /**
   * 获取可用的函数列表（用于展示或调试）
   *
   * @returns 函数列表
   */
  static getAvailableFunctions() {
    return request({
      url: "/api/v1/ai/command/functions",
      method: "get",
    });
  }

  /**
   * 撤销命令执行（如果支持）
   *
   * @param auditId 审计ID
   * @returns 撤销结果
   */
  static rollbackCommand(auditId: string) {
    return request({
      url: `/api/v1/ai/command/rollback/${auditId}`,
      method: "post",
    });
  }
}

export default AiCommandApi;
