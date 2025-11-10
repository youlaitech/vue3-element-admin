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
          placeholder="试试说：查询姓名为张三用户&#10;或者：跳转到用户管理&#10;按 Ctrl+Enter 快速发送"
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
import { ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import AiCommandApi from "@/api/ai";

const router = useRouter();

// 状态管理
const dialogVisible = ref(false);
const command = ref("");
const loading = ref(false);
const response = ref<any>(null);

// 快捷命令示例
const examples = ["查询姓名为张三的用户", "跳转到用户管理", "打开角色管理页面", "查看系统日志"];

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
  if (!command.value.trim()) {
    ElMessage.warning("请输入命令");
    return;
  }

  loading.value = true;

  try {
    // 调用 AI API 解析命令
    const result = await AiCommandApi.parseCommand({
      command: command.value,
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
    const action = parseAction(result);
    response.value = {
      explanation: result.explanation,
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

// 解析 AI 返回的操作类型
const parseAction = (result: any) => {
  const cmd = command.value.toLowerCase();

  // 判断是否是导航命令
  if (
    cmd.includes("跳转") ||
    cmd.includes("打开") ||
    cmd.includes("进入") ||
    cmd.includes("查询")
  ) {
    // 提取关键字
    let keyword = "";
    let routePath = "";
    let pageName = "";

    if (cmd.includes("用户")) {
      routePath = "/system/user";
      pageName = "用户管理";

      // 提取查询关键字
      const match = cmd.match(/查询.*?([^\s]+).*?用户|用户.*?([^\s]+)/);
      if (match) {
        keyword = match[1] || match[2] || "";
        // 去掉常见的修饰词
        keyword = keyword.replace(/姓名为|名字叫|叫做|为/g, "");
      }
    } else if (cmd.includes("角色")) {
      routePath = "/system/role";
      pageName = "角色管理";
    } else if (cmd.includes("菜单")) {
      routePath = "/system/menu";
      pageName = "菜单管理";
    } else if (cmd.includes("部门")) {
      routePath = "/system/dept";
      pageName = "部门管理";
    } else if (cmd.includes("字典")) {
      routePath = "/system/dict";
      pageName = "字典管理";
    } else if (cmd.includes("日志")) {
      routePath = "/system/log";
      pageName = "系统日志";
    }

    if (routePath) {
      return {
        type: "navigate",
        path: routePath,
        pageName,
        query: keyword || undefined,
      };
    }
  }

  // 如果不是导航命令，则是执行命令
  if (result.functionCalls && result.functionCalls.length > 0) {
    return {
      type: "execute",
      functionName: result.functionCalls[0].name,
      functionCall: result.functionCalls[0],
    };
  }

  return null;
};

// 执行操作
const executeAction = async (action: any) => {
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

    // 延迟一下让用户看到提示
    setTimeout(() => {
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

    // 可以跳转到完整的 AI 命令页面
    setTimeout(() => {
      router.push("/function/ai-command");
      handleClose();
    }, 1000);
  }
};
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
