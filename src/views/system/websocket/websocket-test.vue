<template>
  <div class="app-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>WebSocket测试</span>
        </div>
      </template>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="连接状态" name="status">
          <el-alert
            :title="isConnected ? '已连接到WebSocket服务器' : '未连接到WebSocket服务器'"
            :type="isConnected ? 'success' : 'error'"
            :description="connectionMessage"
            show-icon
            :closable="false"
          />

          <div class="button-container">
            <el-button
              :type="isConnected ? 'warning' : 'primary'"
              :loading="connecting"
              @click="toggleConnection"
            >
              {{ isConnected ? "断开连接" : "连接" }}
            </el-button>
          </div>
        </el-tab-pane>

        <el-tab-pane label="字典更新通知" name="dict">
          <p class="section-desc">触发字典更新通知，所有在线用户会收到该通知</p>
          <div class="form-container">
            <el-form :model="dictForm" label-width="100px">
              <el-form-item label="字典编码">
                <el-input v-model="dictForm.dictCode" placeholder="请输入字典编码" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="sendDictUpdate">发送字典更新通知</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>

        <el-tab-pane label="用户消息" name="message">
          <p class="section-desc">向特定用户发送消息</p>
          <div class="form-container">
            <el-form :model="messageForm" label-width="100px">
              <el-form-item label="接收用户">
                <el-input v-model="messageForm.receiver" placeholder="请输入接收用户的用户名" />
              </el-form-item>
              <el-form-item label="消息内容">
                <el-input
                  v-model="messageForm.content"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入消息内容"
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="sendUserMessage">发送消息</el-button>
                <el-button type="success" @click="sendBroadcast">发送广播</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>

        <el-tab-pane label="在线用户" name="online">
          <div class="stats-container">
            <el-statistic title="当前在线用户数">
              <template #value>
                <div class="statistic-value">{{ onlineStats.total }}</div>
              </template>
            </el-statistic>
          </div>

          <el-table v-loading="loadingUsers" :data="onlineUsers" style="width: 100%">
            <el-table-column prop="username" label="用户名" width="180" />
            <el-table-column prop="nickname" label="昵称" width="180" />
            <el-table-column prop="loginTime" label="登录时间">
              <template #default="scope">
                {{ formatDate(scope.row.loginTime) }}
              </template>
            </el-table-column>
          </el-table>

          <div class="button-container">
            <el-button type="primary" @click="fetchOnlineUsers">刷新列表</el-button>
          </div>
        </el-tab-pane>

        <el-tab-pane label="消息记录" name="logs">
          <div class="logs-container">
            <div v-for="(log, index) in messageLogs" :key="index" class="log-item">
              <div class="log-time">{{ formatDate(log.timestamp) }}</div>
              <div class="log-content" :class="{ 'log-broadcast': log.isBroadcast }">
                <span class="log-sender">{{ log.sender }}</span>
                : {{ log.content }}
                <el-tag v-if="log.isBroadcast" size="small" type="warning">广播</el-tag>
              </div>
            </div>
            <div v-if="messageLogs.length === 0" class="empty-logs">暂无消息记录</div>
          </div>

          <div class="button-container">
            <el-button type="danger" @click="clearLogs">清空记录</el-button>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { ElMessage } from "element-plus";
import { useWebSocketDict } from "@/hooks/useWebSocketDict";
import { useUserStore } from "@/store/modules/user";
import { getDictList } from "@/api/dict";
import { getOnlineUsers, getOnlineStats } from "@/api/user";

const userStore = useUserStore();
const { connectWebSocket, disconnectWebSocket, isConnected, sendMessage, subscribe } =
  useWebSocketDict();

// 状态变量
const activeTab = ref("status");
const connecting = ref(false);
const connectionMessage = ref("WebSocket连接状态");
const messageLogs = ref([]);
const onlineUsers = ref([]);
const onlineStats = ref({ total: 0 });
const loadingUsers = ref(false);

// 表单数据
const dictForm = ref({
  dictCode: "gender",
});

const messageForm = ref({
  receiver: "",
  content: "",
});

// 连接和断开WebSocket
const toggleConnection = async () => {
  connecting.value = true;
  try {
    if (isConnected.value) {
      disconnectWebSocket();
      connectionMessage.value = "已断开连接";
    } else {
      await connectWebSocket();
      connectionMessage.value = "已成功连接到WebSocket服务器";
      setupSubscriptions();
    }
  } catch (error) {
    connectionMessage.value = `连接失败: ${error.message}`;
    ElMessage.error(`WebSocket连接失败: ${error.message}`);
  } finally {
    connecting.value = false;
  }
};

// 设置订阅
const setupSubscriptions = () => {
  // 订阅字典更新
  subscribe("/topic/dict", (message) => {
    addMessageLog({
      sender: "System",
      content: `字典 ${message.dictCode} 已更新`,
      timestamp: new Date().getTime(),
      isBroadcast: true,
    });
    ElMessage.success(`字典 ${message.dictCode} 已更新`);
  });

  // 订阅用户消息
  const username = userStore.userInfo.username;
  subscribe(`/user/${username}/messages`, (message) => {
    addMessageLog({
      sender: message.sender,
      content: message.content,
      timestamp: message.timestamp,
      isBroadcast: false,
    });
    ElMessage.info(`收到来自 ${message.sender} 的消息`);
  });

  // 订阅广播消息
  subscribe("/topic/public", (message) => {
    addMessageLog({
      sender: message.sender,
      content: message.content,
      timestamp: message.timestamp,
      isBroadcast: true,
    });
    ElMessage.info(`收到来自 ${message.sender} 的广播消息`);
  });

  // 订阅在线用户更新
  subscribe("/topic/users/online", (message) => {
    ElMessage.info(`用户 ${message.username} ${message.online ? "上线" : "下线"}`);
    fetchOnlineUsers();
    fetchOnlineStats();
  });
};

// 发送字典更新通知
const sendDictUpdate = async () => {
  try {
    // 调用字典API触发更新
    await getDictList({ dictCode: dictForm.value.dictCode });
    ElMessage.success("字典更新通知已发送");
  } catch (error) {
    ElMessage.error(`发送失败: ${error.message}`);
  }
};

// 发送用户消息
const sendUserMessage = () => {
  if (!messageForm.value.receiver || !messageForm.value.content) {
    ElMessage.warning("请输入接收用户和消息内容");
    return;
  }

  sendMessage(`/app/sendToUser/${messageForm.value.receiver}`, messageForm.value.content);

  // 记录发送的消息
  addMessageLog({
    sender: userStore.userInfo.username,
    content: `[发送给 ${messageForm.value.receiver}] ${messageForm.value.content}`,
    timestamp: new Date().getTime(),
    isBroadcast: false,
  });

  ElMessage.success("消息已发送");
};

// 发送广播消息
const sendBroadcast = () => {
  if (!messageForm.value.content) {
    ElMessage.warning("请输入消息内容");
    return;
  }

  sendMessage("/app/broadcast", messageForm.value.content);

  ElMessage.success("广播消息已发送");
};

// 获取在线用户
const fetchOnlineUsers = async () => {
  loadingUsers.value = true;
  try {
    const res = await getOnlineUsers();
    onlineUsers.value = res.data;
  } catch (error) {
    ElMessage.error(`获取在线用户失败: ${error.message}`);
  } finally {
    loadingUsers.value = false;
  }
};

// 获取在线用户统计
const fetchOnlineStats = async () => {
  try {
    const res = await getOnlineStats();
    onlineStats.value = res.data;
  } catch (error) {
    ElMessage.error(`获取在线统计失败: ${error.message}`);
  }
};

// 添加消息日志
const addMessageLog = (log) => {
  messageLogs.value.unshift(log);
  // 限制日志数量
  if (messageLogs.value.length > 100) {
    messageLogs.value = messageLogs.value.slice(0, 100);
  }
};

// 清空日志
const clearLogs = () => {
  messageLogs.value = [];
};

// 格式化日期
const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleString();
};

// 生命周期钩子
onMounted(async () => {
  try {
    await connectWebSocket();
    connectionMessage.value = "已成功连接到WebSocket服务器";
    setupSubscriptions();
    await fetchOnlineUsers();
    await fetchOnlineStats();
  } catch (error) {
    connectionMessage.value = `连接失败: ${error.message}`;
  }
});

onUnmounted(() => {
  disconnectWebSocket();
});
</script>

<style scoped>
.app-container {
  padding: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-desc {
  margin-bottom: 20px;
  color: #666;
}

.button-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.form-container {
  max-width: 600px;
  margin-top: 20px;
}

.logs-container {
  height: 400px;
  padding: 12px;
  margin-bottom: 20px;
  overflow-y: auto;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.log-item {
  padding-bottom: 12px;
  margin-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.log-time {
  margin-bottom: 4px;
  font-size: 12px;
  color: #909399;
}

.log-content {
  word-break: break-all;
}

.log-sender {
  font-weight: bold;
  color: #409eff;
}

.log-broadcast .log-sender {
  color: #e6a23c;
}

.empty-logs {
  padding: 20px;
  color: #909399;
  text-align: center;
}

.stats-container {
  display: flex;
  margin-bottom: 20px;
}

.statistic-value {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
}
</style>
