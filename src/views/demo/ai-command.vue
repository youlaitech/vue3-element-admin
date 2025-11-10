<template>
  <div class="app-container">
    <div class="ai-command-panel">
      <!-- 命令输入区 -->
      <el-card class="command-input-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span class="title">
              <el-icon><MagicStick /></el-icon>
              AI 命令助手
            </span>
            <el-tag v-if="mcpConnected" type="success" size="small">
              <el-icon><Connection /></el-icon>
              MCP 已连接
            </el-tag>
            <el-tag v-else type="info" size="small">
              <el-icon><CircleClose /></el-icon>
              MCP 未连接
            </el-tag>
          </div>
        </template>

        <el-input
          v-model="commandText"
          type="textarea"
          :rows="3"
          placeholder="输入自然语言命令，例如：删除姓名为张三的用户"
          :disabled="loading"
          @keydown.ctrl.enter="handleParseCommand"
        />

        <div class="action-buttons">
          <el-button
            type="primary"
            :loading="loading"
            :disabled="!commandText.trim()"
            @click="handleParseCommand"
          >
            <el-icon><Search /></el-icon>
            解析命令 (Ctrl+Enter)
          </el-button>
          <el-button @click="handleClear">
            <el-icon><Delete /></el-icon>
            清空
          </el-button>
          <el-button @click="handleShowHistory">
            <el-icon><Clock /></el-icon>
            历史记录
          </el-button>
        </div>
      </el-card>

      <!-- 解析结果展示 -->
      <el-card v-if="parseResult" class="result-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span class="title">解析结果</span>
            <el-tag v-if="parseResult.success" type="success" size="small">
              置信度: {{ ((parseResult.confidence ?? 0) * 100).toFixed(1) }}%
            </el-tag>
            <el-tag v-else type="danger" size="small">解析失败</el-tag>
          </div>
        </template>

        <!-- AI 理解说明 -->
        <el-alert
          v-if="parseResult.explanation"
          :title="parseResult.explanation"
          type="info"
          :closable="false"
          show-icon
          class="explanation-alert"
        />

        <!-- 错误信息 -->
        <el-alert
          v-if="parseResult.error"
          :title="parseResult.error"
          type="error"
          :closable="false"
          show-icon
          class="error-alert"
        />

        <!-- 函数调用列表 -->
        <div
          v-if="parseResult.functionCalls && parseResult.functionCalls.length > 0"
          class="function-calls"
        >
          <div
            v-for="(funcCall, index) in parseResult.functionCalls"
            :key="index"
            class="function-call-item"
          >
            <el-card shadow="hover">
              <template #header>
                <div class="function-header">
                  <span class="function-name">
                    <el-icon><Tools /></el-icon>
                    {{ funcCall.name }}
                  </span>
                  <el-tag type="primary" size="small">步骤 {{ index + 1 }}</el-tag>
                </div>
              </template>

              <div class="function-content">
                <div v-if="funcCall.description" class="function-description">
                  <strong>说明：</strong>
                  {{ funcCall.description }}
                </div>

                <div class="function-arguments">
                  <strong>参数：</strong>
                  <el-descriptions :column="1" border size="small">
                    <el-descriptions-item
                      v-for="(value, key) in funcCall.arguments"
                      :key="key"
                      :label="key"
                    >
                      <el-tag v-if="typeof value === 'boolean'" :type="value ? 'success' : 'info'">
                        {{ value }}
                      </el-tag>
                      <el-tag v-else-if="typeof value === 'number'" type="warning">
                        {{ value }}
                      </el-tag>
                      <span v-else-if="typeof value === 'object'">
                        <code>{{ JSON.stringify(value, null, 2) }}</code>
                      </span>
                      <span v-else>{{ value }}</span>
                    </el-descriptions-item>
                  </el-descriptions>
                </div>

                <div class="function-actions">
                  <el-button
                    type="primary"
                    size="small"
                    :loading="executingIndex === index"
                    @click="handleExecute(funcCall, index)"
                  >
                    <el-icon><VideoPlay /></el-icon>
                    执行此步骤
                  </el-button>
                  <el-button
                    v-if="executeResults[index]"
                    type="success"
                    size="small"
                    @click="handleViewResult(index)"
                  >
                    <el-icon><View /></el-icon>
                    查看结果
                  </el-button>
                </div>

                <!-- 执行结果 -->
                <div v-if="executeResults[index]" class="execute-result">
                  <el-divider />
                  <el-alert
                    :title="executeResults[index].success ? '执行成功' : '执行失败'"
                    :type="executeResults[index].success ? 'success' : 'error'"
                    :closable="false"
                    show-icon
                  >
                    <template v-if="executeResults[index].message">
                      {{ executeResults[index].message }}
                    </template>
                    <template v-if="executeResults[index].affectedRows">
                      （影响 {{ executeResults[index].affectedRows }} 条记录）
                    </template>
                  </el-alert>
                </div>
              </div>
            </el-card>
          </div>

          <!-- 批量执行 -->
          <div class="batch-actions">
            <el-button
              type="primary"
              :loading="batchExecuting"
              :disabled="allExecuted"
              @click="handleBatchExecute"
            >
              <el-icon><DArrowRight /></el-icon>
              批量执行所有步骤
            </el-button>
            <el-button v-if="hasExecutedSteps" type="danger" @click="handleClearResults">
              <el-icon><RefreshLeft /></el-icon>
              清除结果
            </el-button>
          </div>
        </div>
      </el-card>

      <!-- 上下文信息（开发模式） -->
      <el-card v-if="showContext && contextInfo" class="context-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span class="title">当前上下文</span>
            <el-button type="info" size="small" @click="showContext = !showContext">
              {{ showContext ? "隐藏" : "显示" }}上下文
            </el-button>
          </div>
        </template>
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="当前路由">
            {{ contextInfo.currentRoute }}
          </el-descriptions-item>
          <el-descriptions-item label="当前组件">
            {{ contextInfo.currentComponent }}
          </el-descriptions-item>
          <el-descriptions-item label="MCP 端点">
            {{ contextInfo.mcpEndpoint || "未配置" }}
          </el-descriptions-item>
          <el-descriptions-item label="用户角色">
            {{ contextInfo.userRole || "未知" }}
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 底部操作按钮 -->
      <div class="footer-actions">
        <el-button type="info" @click="showContext = !showContext">
          {{ showContext ? "隐藏" : "显示" }}上下文
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import AiCommandApi, {
  type FunctionCall,
  type AiCommandResponse,
  type AiExecuteResponse,
} from "@/api/ai";
import { useUserStoreHook } from "@/store/modules/user-store";

const route = useRoute();
const userStore = useUserStoreHook();

// ==================== 状态管理 ====================
const commandText = ref("");
const loading = ref(false);
const parseResult = ref<AiCommandResponse | null>(null);
const executeResults = ref<Record<number, AiExecuteResponse>>({});
const executingIndex = ref<number | null>(null);
const batchExecuting = ref(false);
const showContext = ref(false);
const mcpConnected = ref(false);

// ==================== 上下文信息 ====================
const contextInfo = computed(() => ({
  currentRoute: route.path,
  currentComponent: route.name as string,
  mcpEndpoint: import.meta.env.DEV
    ? `http://localhost:${import.meta.env.VITE_APP_PORT}/__mcp/sse`
    : null,
  userRole: userStore.userInfo?.roles?.join(", ") || "未知",
}));

// ==================== 计算属性 ====================
const allExecuted = computed(() => {
  if (!parseResult.value?.functionCalls) return false;
  return parseResult.value.functionCalls.every((_, index) => executeResults.value[index]?.success);
});

const hasExecutedSteps = computed(() => {
  return Object.keys(executeResults.value).length > 0;
});

// ==================== 方法 ====================

/**
 * 解析命令
 */
const handleParseCommand = async () => {
  if (!commandText.value.trim()) {
    ElMessage.warning("请输入命令");
    return;
  }

  loading.value = true;
  parseResult.value = null;
  executeResults.value = {};

  try {
    const response = await AiCommandApi.parseCommand({
      command: commandText.value,
      currentRoute: contextInfo.value.currentRoute,
      currentComponent: contextInfo.value.currentComponent,
      context: {
        userRoles: userStore.userInfo?.roles || [],
      },
    });

    parseResult.value = response;

    if (response.success && response.functionCalls.length > 0) {
      ElMessage.success(`成功解析为 ${response.functionCalls.length} 个操作步骤`);
    } else if (!response.success) {
      ElMessage.error(response.error || "命令解析失败");
    }
  } catch (error: any) {
    console.error("解析命令失败:", error);
    ElMessage.error(error.message || "命令解析失败");
  } finally {
    loading.value = false;
  }
};

/**
 * 执行单个函数调用
 */
const handleExecute = async (funcCall: FunctionCall, index: number) => {
  // 危险操作需要确认
  const isDangerous = ["delete", "remove", "drop", "truncate"].some((keyword) =>
    funcCall.name.toLowerCase().includes(keyword)
  );

  if (isDangerous) {
    try {
      await ElMessageBox.confirm(
        `确认执行此操作吗？\n\n函数：${funcCall.name}\n参数：${JSON.stringify(funcCall.arguments, null, 2)}`,
        "危险操作确认",
        {
          confirmButtonText: "确认执行",
          cancelButtonText: "取消",
          type: "warning",
          dangerouslyUseHTMLString: false,
        }
      );
    } catch {
      ElMessage.info("已取消操作");
      return;
    }
  }

  executingIndex.value = index;

  try {
    const result = await AiCommandApi.executeCommand({
      functionCall: funcCall,
      confirmMode: isDangerous ? "manual" : "auto",
      userConfirmed: isDangerous,
      idempotencyKey: `${Date.now()}-${index}`,
    });

    executeResults.value[index] = result;

    if (result.success) {
      ElMessage.success(result.message || "执行成功");
    } else {
      ElMessage.error(result.error || "执行失败");
    }
  } catch (error: any) {
    console.error("执行命令失败:", error);
    ElMessage.error(error.message || "执行失败");
  } finally {
    executingIndex.value = null;
  }
};

/**
 * 批量执行所有步骤
 */
const handleBatchExecute = async () => {
  if (!parseResult.value?.functionCalls) return;

  const confirmMessage = `确认批量执行 ${parseResult.value.functionCalls.length} 个步骤吗？`;

  try {
    await ElMessageBox.confirm(confirmMessage, "批量执行确认", {
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      type: "warning",
    });
  } catch {
    return;
  }

  batchExecuting.value = true;

  for (let i = 0; i < parseResult.value.functionCalls.length; i++) {
    if (executeResults.value[i]?.success) {
      continue; // 跳过已成功执行的
    }

    await handleExecute(parseResult.value.functionCalls[i], i);

    // 如果执行失败，停止后续执行
    if (!executeResults.value[i]?.success) {
      ElMessage.warning(`步骤 ${i + 1} 执行失败，已停止后续步骤`);
      break;
    }
  }

  batchExecuting.value = false;
};

/**
 * 查看执行结果
 */
const handleViewResult = (index: number) => {
  const result = executeResults.value[index];
  if (!result) return;

  ElMessageBox.alert(`<pre>${JSON.stringify(result.data, null, 2)}</pre>`, "执行结果详情", {
    dangerouslyUseHTMLString: true,
    confirmButtonText: "关闭",
  });
};

/**
 * 清空输入
 */
const handleClear = () => {
  commandText.value = "";
  parseResult.value = null;
  executeResults.value = {};
};

/**
 * 清除执行结果
 */
const handleClearResults = () => {
  executeResults.value = {};
  ElMessage.success("已清除执行结果");
};

/**
 * 显示历史记录
 */
const handleShowHistory = () => {
  ElMessage.info("历史记录功能开发中...");
  // TODO: 实现历史记录弹窗
};

/**
 * 检查 MCP 连接状态
 */
const checkMcpConnection = async () => {
  if (!import.meta.env.DEV) {
    mcpConnected.value = false;
    return;
  }

  try {
    const endpoint = contextInfo.value.mcpEndpoint;
    if (!endpoint) {
      mcpConnected.value = false;
      return;
    }

    // 简单的连接检查（实际应该有更可靠的方式）
    const response = await fetch(endpoint, { method: "HEAD" });
    mcpConnected.value = response.ok;
  } catch {
    mcpConnected.value = false;
  }
};

// ==================== 生命周期 ====================
onMounted(() => {
  checkMcpConnection();
});
</script>

<style scoped lang="scss">
.ai-command-panel {
  .command-input-card {
    margin-bottom: 16px;

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .title {
        display: flex;
        gap: 8px;
        align-items: center;
        font-weight: 600;
      }
    }

    .action-buttons {
      display: flex;
      gap: 8px;
      margin-top: 12px;
    }
  }

  .result-card {
    margin-bottom: 16px;

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .title {
        font-weight: 600;
      }
    }

    .explanation-alert,
    .error-alert {
      margin-bottom: 16px;
    }

    .function-calls {
      .function-call-item {
        margin-bottom: 12px;

        &:last-child {
          margin-bottom: 0;
        }

        .function-header {
          display: flex;
          align-items: center;
          justify-content: space-between;

          .function-name {
            display: flex;
            gap: 8px;
            align-items: center;
            font-size: 14px;
            font-weight: 600;
          }
        }

        .function-content {
          .function-description {
            padding: 8px;
            margin-bottom: 12px;
            background-color: var(--el-fill-color-light);
            border-radius: 4px;
          }

          .function-arguments {
            margin-bottom: 12px;

            code {
              display: block;
              padding: 8px;
              font-size: 12px;
              word-break: break-all;
              white-space: pre-wrap;
              background-color: var(--el-fill-color);
              border-radius: 4px;
            }
          }

          .function-actions {
            display: flex;
            gap: 8px;
          }

          .execute-result {
            margin-top: 12px;
          }
        }
      }

      .batch-actions {
        display: flex;
        gap: 8px;
        padding-top: 16px;
        margin-top: 16px;
        border-top: 1px dashed var(--el-border-color);
      }
    }
  }

  .context-card {
    margin-bottom: 16px;

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .title {
        font-weight: 600;
      }
    }
  }

  .footer-actions {
    display: flex;
    justify-content: center;
    margin-top: 16px;
  }
}
</style>
