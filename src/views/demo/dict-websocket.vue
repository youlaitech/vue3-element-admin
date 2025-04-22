<template>
  <div class="app-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>字典WebSocket实时更新演示</span>
        </div>
      </template>
      <el-alert type="info" :closable="false">
        <p>本示例展示了当字典数据在服务端更新时，如何通过WebSocket实时更新前端缓存。</p>
        <p class="mt-2">
          当管理员修改字典数据后，其他在线用户的字典缓存将自动刷新，无需手动刷新页面。
        </p>
      </el-alert>

      <div class="mt-4">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-card shadow="hover">
              <template #header>字典选择</template>
              <div>
                <el-form>
                  <el-form-item label="选择字典">
                    <el-select v-model="selectedDict" placeholder="请选择字典" @change="loadDict">
                      <el-option
                        v-for="item in dictList"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      />
                    </el-select>
                  </el-form-item>
                </el-form>

                <el-table v-if="dictItems.length > 0" :data="dictItems" border>
                  <el-table-column prop="label" label="字典标签" />
                  <el-table-column prop="value" label="字典值" />
                </el-table>
                <el-empty v-else description="请选择字典类型" />
              </div>
            </el-card>
          </el-col>

          <el-col :span="12">
            <el-card shadow="hover">
              <template #header>WebSocket消息</template>
              <div class="websocket-log">
                <div v-if="logMessages.length === 0" class="text-center py-4 text-gray-400">
                  暂无WebSocket消息
                </div>
                <div v-else>
                  <div
                    v-for="(msg, index) in logMessages"
                    :key="index"
                    class="log-message"
                    :class="{
                      'bg-blue-50': msg.type === 'info',
                      'bg-green-50': msg.type === 'success',
                      'bg-red-50': msg.type === 'error',
                    }"
                  >
                    <div class="flex justify-between">
                      <span class="font-bold">{{ msg.title }}</span>
                      <span class="text-gray-500 text-sm">{{ formatTime(msg.time) }}</span>
                    </div>
                    <pre class="text-sm mt-1">{{ JSON.stringify(msg.data, null, 2) }}</pre>
                  </div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <div class="mt-4">
        <el-card shadow="hover">
          <template #header>模拟服务端更新字典</template>
          <p>这里模拟后端管理员更新字典数据后发送WebSocket通知</p>
          <p class="mt-2 mb-4 text-gray-500">注意：这只是前端模拟，实际应用中由后端触发</p>

          <el-form :model="simulateForm" label-width="100px" class="demo-form">
            <el-form-item label="字典编码">
              <el-input v-model="simulateForm.dictCode" />
            </el-form-item>
            <el-form-item label="事件类型">
              <el-radio-group v-model="simulateForm.eventType">
                <el-radio label="DICT_UPDATED">字典更新</el-radio>
                <el-radio label="DICT_DELETED">字典删除</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="simulateDictEvent">模拟发送WebSocket消息</el-button>
              <el-button type="danger" @click="clearCache">清空字典缓存</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useDictStoreHook } from "@/store/modules/dict.store";
import { DictWebSocketEvent } from "@/types/websocket";
import { ref, reactive } from "vue";
import { ElMessage } from "element-plus";
import { DictItemOption } from "@/api/system/dict.api";
import { useDateFormat } from "@vueuse/core";
import { useWebSocketDict } from "@/hooks/useWebSocketDict";

// 字典列表
const dictList = ref([
  { label: "性别", value: "gender" },
  { label: "状态", value: "status" },
  { label: "用户类型", value: "user_type" },
]);

// 选中的字典
const selectedDict = ref("");
// 字典项列表
const dictItems = ref<DictItemOption[]>([]);
// 字典store
const dictStore = useDictStoreHook();

// 日志消息类型
interface LogMessage {
  title: string;
  type: string;
  data: any;
  time: Date;
}

// WebSocket日志消息
const logMessages = ref<LogMessage[]>([]);

// 模拟表单
const simulateForm = reactive({
  dictCode: "",
  eventType: "DICT_UPDATED",
});

// 加载字典数据
const loadDict = async (dictCode: string) => {
  await dictStore.loadDictItems(dictCode);
  dictItems.value = dictStore.getDictItems(dictCode);

  // 添加日志
  addLogMessage({
    title: "加载字典数据",
    type: "info",
    data: {
      dictCode,
      items: dictItems.value,
    },
  });
};

// 模拟字典事件
const simulateDictEvent = () => {
  const { dictCode, eventType } = simulateForm;

  if (!dictCode) {
    ElMessage.warning("请输入字典编码");
    return;
  }

  // 构造字典事件
  const event: DictWebSocketEvent = {
    type: eventType as "DICT_UPDATED" | "DICT_DELETED",
    dictCode,
    timestamp: Date.now(),
  };

  // 添加日志
  addLogMessage({
    title: "模拟WebSocket消息",
    type: "success",
    data: event,
  });

  // 导入WebSocket字典钩子
  const { handleDictEvent } = useWebSocketDict();

  // 手动调用处理函数，模拟收到WebSocket消息
  handleDictEvent(event);

  // 如果是当前选中的字典被更新，则刷新显示
  if (selectedDict.value === dictCode) {
    setTimeout(() => {
      dictItems.value = dictStore.getDictItems(dictCode);

      addLogMessage({
        title: "字典数据已更新",
        type: "info",
        data: {
          dictCode,
          items: dictItems.value,
        },
      });
    }, 500);
  }
};

// 清空字典缓存
const clearCache = () => {
  dictStore.clearDictCache();
  dictItems.value = [];
  selectedDict.value = "";

  addLogMessage({
    title: "字典缓存已清空",
    type: "error",
    data: {},
  });

  ElMessage.success("字典缓存已清空");
};

// 添加日志消息
const addLogMessage = (message: { title: string; type: string; data: any }) => {
  logMessages.value.unshift({
    ...message,
    time: new Date(),
  });

  // 最多显示20条日志
  if (logMessages.value.length > 20) {
    logMessages.value.pop();
  }
};

// 格式化时间
const formatTime = (date: Date) => {
  return useDateFormat(date, "HH:mm:ss").value;
};
</script>

<style scoped>
.websocket-log {
  max-height: 400px;
  overflow-y: auto;
}

.log-message {
  padding: 10px;
  margin-bottom: 10px;
  border-left: 4px solid #409eff;
  border-radius: 4px;
}

.log-message:last-child {
  margin-bottom: 0;
}

pre {
  word-wrap: break-word;
  white-space: pre-wrap;
}
</style>
