import { useRoute } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { onMounted, onBeforeUnmount, nextTick } from "vue";
import AiCommandApi from "@/api/ai";

/**
 * AI 操作处理器（简化版）
 *
 * 可以是简单函数，也可以是配置对象
 */
export type AiActionHandler<T = any> =
  | ((args: T) => Promise<void> | void)
  | {
      /** 执行函数 */
      execute: (args: T) => Promise<void> | void;
      /** 是否需要确认（默认 true） */
      needConfirm?: boolean;
      /** 确认消息（支持函数或字符串） */
      confirmMessage?: string | ((args: T) => string);
      /** 成功消息（支持函数或字符串） */
      successMessage?: string | ((args: T) => string);
      /** 是否调用后端 API（默认 false，如果为 true 则自动调用 executeCommand） */
      callBackendApi?: boolean;
    };

/**
 * AI 操作配置
 */
export interface UseAiActionOptions {
  /** 操作映射表：函数名 -> 处理器 */
  actionHandlers?: Record<string, AiActionHandler>;
  /** 数据刷新函数（操作完成后调用） */
  onRefresh?: () => Promise<void> | void;
  /** 自动搜索处理函数 */
  onAutoSearch?: (keywords: string) => void;
  /** 当前路由路径（用于执行命令时传递） */
  currentRoute?: string;
}

/**
 * AI 操作 Composable
 *
 * 统一处理 AI 助手传递的操作，支持：
 * - 自动搜索（通过 keywords + autoSearch 参数）
 * - 执行 AI 操作（通过 aiAction 参数）
 * - 配置化的操作处理器
 */
export function useAiAction(options: UseAiActionOptions = {}) {
  const route = useRoute();
  const { actionHandlers = {}, onRefresh, onAutoSearch, currentRoute = route.path } = options;

  // 用于跟踪是否已卸载，防止在卸载后执行回调
  let isUnmounted = false;

  /**
   * 执行 AI 操作（统一处理确认、执行、反馈流程）
   */
  async function executeAiAction(action: any) {
    if (isUnmounted) return;

    // 兼容两种入参：{ functionName, arguments } 或 { functionCall: { name, arguments } }
    const fnCall = action.functionCall ?? {
      name: action.functionName,
      arguments: action.arguments,
    };

    if (!fnCall?.name) {
      ElMessage.warning("未识别的 AI 操作");
      return;
    }

    // 查找对应的处理器
    const handler = actionHandlers[fnCall.name];
    if (!handler) {
      ElMessage.warning(`暂不支持操作: ${fnCall.name}`);
      return;
    }

    try {
      // 判断处理器类型（函数 or 配置对象）
      const isSimpleFunction = typeof handler === "function";

      if (isSimpleFunction) {
        // 简单函数形式：直接执行
        await handler(fnCall.arguments);
      } else {
        // 配置对象形式：统一处理确认、执行、反馈
        const config = handler;

        // 1. 确认阶段（默认需要确认）
        if (config.needConfirm !== false) {
          const confirmMsg =
            typeof config.confirmMessage === "function"
              ? config.confirmMessage(fnCall.arguments)
              : config.confirmMessage || "确认执行此操作吗？";

          await ElMessageBox.confirm(confirmMsg, "AI 助手操作确认", {
            confirmButtonText: "确认执行",
            cancelButtonText: "取消",
            type: "warning",
            dangerouslyUseHTMLString: true,
          });
        }

        // 2. 执行阶段
        if (config.callBackendApi) {
          // 自动调用后端 API
          await AiCommandApi.executeCommand({
            originalCommand: action.originalCommand || "",
            confirmMode: "manual",
            userConfirmed: true,
            currentRoute,
            functionCall: {
              name: fnCall.name,
              arguments: fnCall.arguments,
            },
          });
        } else {
          // 执行自定义函数
          await config.execute(fnCall.arguments);
        }

        // 3. 成功反馈
        const successMsg =
          typeof config.successMessage === "function"
            ? config.successMessage(fnCall.arguments)
            : config.successMessage || "操作执行成功";
        ElMessage.success(successMsg);
      }

      // 4. 刷新数据
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error: any) {
      // 处理取消操作
      if (error === "cancel") {
        ElMessage.info("已取消操作");
        return;
      }

      console.error("AI 操作执行失败:", error);
      ElMessage.error(error.message || "操作执行失败");
    }
  }

  /**
   * 执行后端命令（通用方法）
   */
  async function executeCommand(
    functionName: string,
    args: any,
    options: {
      originalCommand?: string;
      confirmMode?: "auto" | "manual";
      needConfirm?: boolean;
      confirmMessage?: string;
    } = {}
  ) {
    const {
      originalCommand = "",
      confirmMode = "manual",
      needConfirm = false,
      confirmMessage,
    } = options;

    // 如果需要确认，先显示确认对话框
    if (needConfirm && confirmMessage) {
      try {
        await ElMessageBox.confirm(confirmMessage, "AI 助手操作确认", {
          confirmButtonText: "确认执行",
          cancelButtonText: "取消",
          type: "warning",
          dangerouslyUseHTMLString: true,
        });
      } catch {
        ElMessage.info("已取消操作");
        return;
      }
    }

    try {
      await AiCommandApi.executeCommand({
        originalCommand,
        confirmMode,
        userConfirmed: true,
        currentRoute,
        functionCall: {
          name: functionName,
          arguments: args,
        },
      });

      ElMessage.success("操作执行成功");
    } catch (error: any) {
      if (error !== "cancel") {
        throw error;
      }
    }
  }

  /**
   * 处理自动搜索
   */
  function handleAutoSearch(keywords: string) {
    if (onAutoSearch) {
      onAutoSearch(keywords);
    } else {
      ElMessage.info(`AI 助手已为您自动搜索：${keywords}`);
    }
  }

  /**
   * 初始化：处理 URL 参数中的 AI 操作
   *
   * 注意：此方法只处理 AI 相关参数，不负责页面数据的初始加载
   * 页面数据加载应由组件的 onMounted 钩子自行处理
   */
  async function init() {
    if (isUnmounted) return;

    // 检查是否有 AI 助手传递的参数
    const keywords = route.query.keywords as string;
    const autoSearch = route.query.autoSearch as string;
    const aiActionParam = route.query.aiAction as string;

    // 如果没有任何 AI 参数，直接返回
    if (!keywords && !autoSearch && !aiActionParam) {
      return;
    }

    // 在 nextTick 中执行，确保页面数据已加载
    nextTick(async () => {
      if (isUnmounted) return;

      // 1. 处理自动搜索
      if (autoSearch === "true" && keywords) {
        handleAutoSearch(keywords);
      }

      // 2. 处理 AI 操作
      if (aiActionParam) {
        try {
          const aiAction = JSON.parse(decodeURIComponent(aiActionParam));
          await executeAiAction(aiAction);
        } catch (error) {
          console.error("解析 AI 操作失败:", error);
          ElMessage.error("AI 操作参数解析失败");
        }
      }
    });
  }

  // 组件挂载时自动初始化
  onMounted(() => {
    init();
  });

  // 组件卸载时清理
  onBeforeUnmount(() => {
    isUnmounted = true;
  });

  return {
    executeAiAction,
    executeCommand,
    handleAutoSearch,
  };
}
