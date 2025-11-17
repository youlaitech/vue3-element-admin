<template>
  <!-- 悬浮按钮 -->
  <div class="ai-assistant">
    <!-- AI 助手图标按钮 -->
    <el-button
      v-if="!dialogVisible"
      class="ai-fab-button"
      type="primary"
      circle
      size="large"
      @click="handleOpen"
    >
      <div class="i-svg:ai ai-icon" />
    </el-button>

    <!-- AI 对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="AI 智能助手"
      width="600px"
      :close-on-click-modal="false"
      draggable
      class="ai-assistant-dialog"
    >
      <template #header>
        <div class="dialog-header">
          <div class="i-svg:ai header-icon" />
          <span class="title">AI 智能助手</span>
        </div>
      </template>

      <!-- 命令输入 -->
      <div class="command-input">
        <el-input
          v-model="command"
          type="textarea"
          :rows="3"
          placeholder="试试说：修改test用户的姓名为测试人员&#10;或者：跳转到用户管理&#10;按 Ctrl+Enter 快速发送"
          :disabled="loading"
          @keydown.ctrl.enter="handleExecute"
        />
      </div>

      <!-- 快捷命令示例 -->
      <div class="quick-commands">
        <div class="section-title">💡 试试这些命令：</div>
        <el-tag
          v-for="example in examples"
          :key="example"
          class="command-tag"
          @click="command = example"
        >
          {{ example }}
        </el-tag>
      </div>

      <!-- AI 响应结果 -->
      <div v-if="response" class="ai-response">
        <el-alert :title="response.explanation" type="success" :closable="false" show-icon />

        <!-- 将要执行的操作 -->
        <div v-if="response.action" class="action-preview">
          <div class="action-title">🎯 将要执行：</div>
          <div class="action-content">
            <div v-if="response.action.type === 'navigate'">
              <el-icon><Position /></el-icon>
              跳转到：
              <strong>{{ response.action.pageName }}</strong>
              <span v-if="response.action.query" class="query-info">
                并搜索：
                <el-tag type="warning" size="small">{{ response.action.query }}</el-tag>
              </span>
            </div>
            <div v-if="response.action.type === 'navigate-and-execute'">
              <el-icon><Position /></el-icon>
              跳转至：
              <strong>{{ response.action.pageName }}</strong>
              <span v-if="response.action.query" class="query-info">
                并搜索：
                <el-tag type="warning" size="small">{{ response.action.query }}</el-tag>
              </span>
              <el-divider direction="vertical" />
              <el-icon><Tools /></el-icon>
              执行：
              <strong>{{ response.action.functionCall.name }}</strong>
            </div>
            <div v-if="response.action.type === 'execute'">
              <el-icon><Tools /></el-icon>
              执行：
              <strong>{{ response.action.functionName }}</strong>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleClose">取消</el-button>
          <el-button type="primary" :loading="loading" @click="handleExecute">
            <el-icon><MagicStick /></el-icon>
            执行命令
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import AiCommandApi from "@/api/ai";

type ToolFunctionCall = {
  name: string;
  arguments: Record<string, any>;
};

// 统一的动作描述（区分“跳转”、“跳转+执行”、“仅执行”三种场景）
type AiAction =
  | {
      type: "navigate";
      path: string;
      pageName: string;
      query?: string;
    }
  | {
      type: "navigate-and-execute";
      path: string;
      pageName: string;
      query?: string;
      functionCall: ToolFunctionCall;
    }
  | {
      type: "execute";
      functionName: string;
      functionCall: ToolFunctionCall;
    };

type AiResponse = {
  explanation: string;
  action: AiAction | null;
};

const router = useRouter();

// 状态管理
const dialogVisible = ref(false);
const command = ref("");
const loading = ref(false);
const response = ref<AiResponse | null>(null);

// 快捷命令示例
const examples = [
  "修改test用户的姓名为测试人员",
  "获取姓名为张三的用户信息",
  "跳转到用户管理",
  "打开角色管理页面",
];

// 打开对话框
const handleOpen = () => {
  dialogVisible.value = true;
  command.value = "";
  response.value = null;
};

// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false;
  command.value = "";
  response.value = null;
};

// 执行命令
const handleExecute = async () => {
  const rawCommand = command.value.trim();
  if (!rawCommand) {
    ElMessage.warning("请输入命令");
    return;
  }

  // 优先检测无需调用 AI 的纯跳转命令
  const directNavigation = tryDirectNavigate(rawCommand);
  if (directNavigation && directNavigation.action) {
    response.value = directNavigation;
    await executeAction(directNavigation.action);
    return;
  }

  loading.value = true;

  try {
    // 调用 AI API 解析命令
    const result = await AiCommandApi.parseCommand({
      command: rawCommand,
      currentRoute: router.currentRoute.value.path,
      currentComponent: router.currentRoute.value.name as string,
      context: {
        userRoles: [],
      },
    });

    if (!result.success) {
      ElMessage.error(result.error || "命令解析失败");
      return;
    }

    // 解析 AI 返回的操作类型
    const action = parseAction(result, rawCommand);
    response.value = {
      explanation: result.explanation ?? "命令解析成功，准备执行操作",
      action,
    };

    // 等待用户确认后执行
    if (action) {
      await executeAction(action);
    }
  } catch (error: any) {
    console.error("AI 命令执行失败:", error);
    ElMessage.error(error.message || "命令执行失败");
  } finally {
    loading.value = false;
  }
};

// 路由配置映射表（支持扩展）
const routeConfig = [
  { keywords: ["用户", "user", "user list"], path: "/system/user", name: "用户管理" },
  { keywords: ["角色", "role"], path: "/system/role", name: "角色管理" },
  { keywords: ["菜单", "menu"], path: "/system/menu", name: "菜单管理" },
  { keywords: ["部门", "dept"], path: "/system/dept", name: "部门管理" },
  { keywords: ["字典", "dict"], path: "/system/dict", name: "字典管理" },
  { keywords: ["日志", "log"], path: "/system/log", name: "系统日志" },
];

// 根据函数名推断路由（如 getUserInfo -> /system/user）
const normalizeText = (text: string) => text.replace(/\s+/g, " ").trim().toLowerCase();

const inferRouteFromFunction = (functionName: string) => {
  const fnLower = normalizeText(functionName);
  for (const config of routeConfig) {
    // 检查函数名是否包含关键词（如 getUserInfo 包含 user）
    if (config.keywords.some((kw) => fnLower.includes(kw.toLowerCase()))) {
      return { path: config.path, name: config.name };
    }
  }
  return null;
};

// 根据命令文本匹配路由
const matchRouteFromCommand = (cmd: string) => {
  const normalized = normalizeText(cmd);
  for (const config of routeConfig) {
    if (config.keywords.some((kw) => normalized.includes(kw.toLowerCase()))) {
      return { path: config.path, name: config.name };
    }
  }
  return null;
};

const extractKeywordFromCommand = (cmd: string): string => {
  const normalized = normalizeText(cmd);
  // 从 routeConfig 动态获取所有数据类型关键词
  const allKeywords = routeConfig.flatMap((config) =>
    config.keywords.map((kw) => kw.toLowerCase())
  );
  const keywordsPattern = allKeywords.join("|");

  const patterns = [
    new RegExp(`(?:查询|获取|搜索|查找|找).*?([^\\s，,。]+?)(?:的)?(?:${keywordsPattern})`, "i"),
    new RegExp(`(?:${keywordsPattern}).*?([^\\s，,。]+?)(?:的|信息|详情)?`, "i"),
    new RegExp(
      `(?:姓名为|名字叫|叫做|名称为|名是|为)([^\\s，,。]+?)(?:的)?(?:${keywordsPattern})?`,
      "i"
    ),
    new RegExp(`([^\\s，,。]+?)(?:的)?(?:${keywordsPattern})(?:信息|详情)?`, "i"),
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    if (match && match[1]) {
      let extracted = match[1].trim();
      extracted = extracted.replace(/姓名为|名字叫|叫做|名称为|名是|为|的|信息|详情/g, "");
      if (
        extracted &&
        !allKeywords.some((type) => extracted.toLowerCase().includes(type.toLowerCase()))
      ) {
        return extracted;
      }
    }
  }
  return "";
};

const tryDirectNavigate = (rawCommand: string): AiResponse | null => {
  const navigationIntents = ["跳转", "打开", "进入", "前往", "去", "浏览", "查看"];
  const operationIntents = [
    "修改",
    "更新",
    "变更",
    "删除",
    "添加",
    "创建",
    "设置",
    "获取",
    "查询",
    "搜索",
  ];

  const hasNavigationIntent = navigationIntents.some((keyword) => rawCommand.includes(keyword));
  const hasOperationIntent = operationIntents.some((keyword) => rawCommand.includes(keyword));

  if (!hasNavigationIntent || hasOperationIntent) {
    return null;
  }

  const routeInfo = matchRouteFromCommand(rawCommand);
  if (!routeInfo) {
    return null;
  }

  const keyword = extractKeywordFromCommand(rawCommand);
  const action: AiAction = {
    type: "navigate",
    path: routeInfo.path,
    pageName: routeInfo.name,
    query: keyword || undefined,
  };

  return {
    explanation: `检测到跳转命令，正在前往 ${routeInfo.name}`,
    action,
  };
};

// 解析 AI 返回的操作类型
const parseAction = (result: any, rawCommand: string): AiAction | null => {
  const cmd = normalizeText(rawCommand);
  const primaryCall = result.functionCalls?.[0];
  const functionName = primaryCall?.name;

  // 优先从函数名推断路由，其次从命令文本匹配
  let routeInfo = functionName ? inferRouteFromFunction(functionName) : null;
  if (!routeInfo) {
    routeInfo = matchRouteFromCommand(cmd);
  }

  const routePath = routeInfo?.path || "";
  const pageName = routeInfo?.name || "";
  const keyword = extractKeywordFromCommand(cmd);

  if (primaryCall && functionName) {
    const fnNameLower = functionName.toLowerCase();

    // 1) 查询类函数（query/search/list/get）-> 跳转并执行筛选操作
    const isQueryFunction =
      fnNameLower.includes("query") ||
      fnNameLower.includes("search") ||
      fnNameLower.includes("list") ||
      fnNameLower.includes("get");

    if (isQueryFunction) {
      // 统一使用 keywords 参数（约定大于配置）
      const args = (primaryCall.arguments || {}) as Record<string, unknown>;
      const keywords =
        typeof args.keywords === "string" && args.keywords.trim().length > 0
          ? args.keywords
          : keyword;

      if (routePath) {
        return {
          type: "navigate-and-execute",
          path: routePath,
          pageName,
          functionCall: primaryCall,
          query: keywords || undefined,
        };
      }
    }

    // 2) 其他操作类函数（修改/删除/创建/更新等）-> 跳转并执行
    const isModifyFunction =
      fnNameLower.includes("update") ||
      fnNameLower.includes("modify") ||
      fnNameLower.includes("edit") ||
      fnNameLower.includes("delete") ||
      fnNameLower.includes("remove") ||
      fnNameLower.includes("create") ||
      fnNameLower.includes("add") ||
      fnNameLower.includes("save");

    if (isModifyFunction && routePath) {
      return {
        type: "navigate-and-execute",
        path: routePath,
        pageName,
        functionCall: primaryCall,
      };
    }

    // 3) 其他未匹配的函数，如果有路由则跳转，否则执行
    if (routePath) {
      return {
        type: "navigate-and-execute",
        path: routePath,
        pageName,
        functionCall: primaryCall,
      };
    }

    return {
      type: "execute",
      functionName,
      functionCall: primaryCall,
    };
  }

  // 4) 无函数调用，仅跳转
  if (routePath) {
    return {
      type: "navigate",
      path: routePath,
      pageName,
      query: keyword || undefined,
    };
  }

  return null;
};

// 定时器引用（用于清理）
let navigationTimer: ReturnType<typeof setTimeout> | null = null;
let executeTimer: ReturnType<typeof setTimeout> | null = null;

// 执行操作
const executeAction = async (action: AiAction) => {
  // 🎯 新增：跳转并执行操作
  if (action.type === "navigate-and-execute") {
    ElMessage.success(`正在跳转到 ${action.pageName} 并执行操作...`);

    // 清理之前的定时器
    if (navigationTimer) {
      clearTimeout(navigationTimer);
    }

    // 跳转并传递待执行的操作信息
    navigationTimer = setTimeout(() => {
      navigationTimer = null;
      const queryParams: any = {
        // 通过 URL 参数传递 AI 操作信息
        aiAction: encodeURIComponent(
          JSON.stringify({
            functionName: action.functionCall.name,
            arguments: action.functionCall.arguments,
            timestamp: Date.now(),
          })
        ),
      };

      // 如果有查询关键字，也一并传递
      if (action.query) {
        queryParams.keywords = action.query;
        queryParams.autoSearch = "true";
      }

      router.push({
        path: action.path,
        query: queryParams,
      });

      // 关闭对话框
      handleClose();
    }, 800);
    return;
  }

  if (action.type === "navigate") {
    // 检查是否已经在目标页面
    const currentPath = router.currentRoute.value.path;

    if (currentPath === action.path) {
      // 如果已经在目标页面
      if (action.query) {
        // 有查询关键字，直接在当前页面执行搜索
        ElMessage.info(`您已在 ${action.pageName} 页面，为您执行搜索：${action.query}`);

        // 触发路由更新，让页面执行搜索
        router.replace({
          path: action.path,
          query: {
            keywords: action.query,
            autoSearch: "true",
            _t: Date.now().toString(), // 添加时间戳强制刷新
          },
        });
      } else {
        // 没有查询关键字，只是跳转，给出提示
        ElMessage.warning(`您已经在 ${action.pageName} 页面了`);
      }

      // 关闭对话框
      handleClose();
      return;
    }

    // 不在目标页面，正常跳转
    ElMessage.success(`正在跳转到 ${action.pageName}...`);

    // 清理之前的定时器
    if (navigationTimer) {
      clearTimeout(navigationTimer);
    }

    // 延迟一下让用户看到提示
    navigationTimer = setTimeout(() => {
      navigationTimer = null;
      // 跳转并传递查询参数
      router.push({
        path: action.path,
        query: action.query
          ? {
              keywords: action.query, // 传递关键字参数
              autoSearch: "true", // 标记自动搜索
            }
          : undefined,
      });

      // 关闭对话框
      handleClose();
    }, 800);
  } else if (action.type === "execute") {
    // 执行函数调用
    ElMessage.info("功能开发中，请前往 AI 命令助手页面体验完整功能");

    // 清理之前的定时器
    if (executeTimer) {
      clearTimeout(executeTimer);
    }

    // 可以跳转到完整的 AI 命令页面
    executeTimer = setTimeout(() => {
      executeTimer = null;
      router.push("/function/ai-command");
      handleClose();
    }, 1000);
  }
};

// 组件卸载时清理定时器
onBeforeUnmount(() => {
  if (navigationTimer) {
    clearTimeout(navigationTimer);
    navigationTimer = null;
  }
  if (executeTimer) {
    clearTimeout(executeTimer);
    executeTimer = null;
  }
});
</script>

<style scoped lang="scss">
.ai-assistant {
  .ai-fab-button {
    position: fixed;
    right: 30px;
    bottom: 80px;
    z-index: 9999;
    width: 60px;
    height: 60px;
    box-shadow: 0 4px 12px rgba(2, 119, 252, 0.4);
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 6px 20px rgba(2, 119, 252, 0.6);
      transform: scale(1.1);
    }

    .ai-icon {
      width: 32px;
      height: 32px;
    }
  }
}

.ai-assistant-dialog {
  .dialog-header {
    display: flex;
    gap: 12px;
    align-items: center;

    .header-icon {
      width: 28px;
      height: 28px;
    }

    .title {
      font-size: 18px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
  }

  .command-input {
    margin-bottom: 16px;
  }

  .quick-commands {
    margin-bottom: 20px;

    .section-title {
      margin-bottom: 8px;
      font-size: 14px;
      color: var(--el-text-color-secondary);
    }

    .command-tag {
      margin-right: 8px;
      margin-bottom: 8px;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        transform: translateY(-2px);
      }
    }
  }

  .ai-response {
    margin-top: 16px;

    .action-preview {
      padding: 12px;
      margin-top: 12px;
      background-color: var(--el-fill-color-light);
      border-radius: 8px;

      .action-title {
        margin-bottom: 8px;
        font-size: 14px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }

      .action-content {
        display: flex;
        gap: 8px;
        align-items: center;
        color: var(--el-text-color-regular);

        .el-icon {
          color: var(--el-color-primary);
        }

        .query-info {
          margin-left: 8px;
        }
      }
    }
  }

  .dialog-footer {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }
}
</style>
