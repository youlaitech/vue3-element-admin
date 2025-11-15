import { useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import { onMounted, onBeforeUnmount, nextTick } from "vue";
import AiCommandApi from "@/api/ai";

/**
 * AI 操作处理器类型
 */
export type AiActionHandler = (args: any) => Promise<void> | void;

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
  // 存储待清理的 nextTick 回调
  let pendingCallbacks: (() => void)[] = [];

  /**
   * 执行 AI 操作
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
      await handler(fnCall.arguments);
      // 操作成功后刷新数据
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error: any) {
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
      const { ElMessageBox } = await import("element-plus");
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
   */
  function init() {
    if (isUnmounted) return;

    // 检查是否有 AI 助手传递的搜索参数
    const keywords = route.query.keywords as string;
    const autoSearch = route.query.autoSearch as string;
    const aiActionParam = route.query.aiAction as string;

    // 处理自动搜索
    if (autoSearch === "true" && keywords) {
      const callback = () => {
        if (!isUnmounted) {
          handleAutoSearch(keywords);
        }
      };
      pendingCallbacks.push(callback);
      nextTick(callback);
    }

    // 处理 AI 操作
    if (aiActionParam) {
      const callback = () => {
        if (!isUnmounted) {
          try {
            const aiAction = JSON.parse(decodeURIComponent(aiActionParam));
            executeAiAction(aiAction);
          } catch (error) {
            console.error("解析 AI 操作失败:", error);
            ElMessage.error("AI 操作参数解析失败");
          }
        }
      };
      pendingCallbacks.push(callback);
      nextTick(callback);
    }
  }

  // 组件挂载时自动初始化
  onMounted(() => {
    init();
  });

  // 组件卸载时清理
  onBeforeUnmount(() => {
    isUnmounted = true;
    // 清理待执行的回调（虽然 nextTick 的回调无法直接取消，但至少标记为已卸载）
    pendingCallbacks = [];
  });

  return {
    executeAiAction,
    executeCommand,
    handleAutoSearch,
    init,
  };
}
