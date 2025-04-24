<template>
  <div class="app-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>性别字典WebSocket实时更新演示</span>
        </div>
      </template>

      <el-alert type="info" :closable="false" class="mb-4">
        本示例展示WebSocket实时更新字典缓存的效果。您可以编辑"男"性别字典项，保存后后端将通过WebSocket通知所有客户端刷新缓存。
      </el-alert>

      <el-row :gutter="16">
        <!-- 列1: 性别字典项编辑 -->
        <el-col :span="8">
          <el-card shadow="hover" class="dict-card">
            <template #header>
              <div class="flex justify-between items-center">
                <span>性别字典项 - 男</span>
                <el-button type="warning" size="small" @click="loadMaleDict">重新加载</el-button>
              </div>
            </template>
            <div v-loading="formLoading">
              <div v-if="dictForm" class="dict-form">
                <el-form :model="dictForm" label-width="80px">
                  <el-form-item label="字典编码">
                    <el-input v-model="dictForm.dictCode" disabled />
                  </el-form-item>
                  <el-form-item label="字典标签">
                    <el-input v-model="dictForm.label" />
                  </el-form-item>
                  <el-form-item label="字典值">
                    <el-input v-model="dictForm.value" disabled />
                  </el-form-item>
                  <el-form-item label="标记颜色">
                    <el-select
                      v-model="dictForm.tagType"
                      placeholder="选择标签类型"
                      style="width: 100%"
                    >
                      <el-option value="success" label="success">
                        <el-tag type="success">success</el-tag>
                      </el-option>
                      <el-option value="warning" label="warning">
                        <el-tag type="warning">warning</el-tag>
                      </el-option>
                      <el-option value="danger" label="danger">
                        <el-tag type="danger">danger</el-tag>
                      </el-option>
                      <el-option value="info" label="info">
                        <el-tag type="info">info</el-tag>
                      </el-option>
                      <el-option value="primary" label="primary">
                        <el-tag type="primary">primary</el-tag>
                      </el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" :loading="saving" @click="saveDict">保存</el-button>
                    <el-button @click="loadMaleDict">重置</el-button>
                  </el-form-item>
                </el-form>
              </div>
              <el-empty v-else description="暂无字典数据" />
            </div>
          </el-card>
        </el-col>

        <!-- 列2: WebSocket消息 -->
        <el-col :span="8">
          <el-card shadow="hover" class="dict-card">
            <template #header>
              <div class="flex justify-between items-center">
                <span>WebSocket消息</span>
              </div>
            </template>
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

        <!-- 列3: 字典缓存数据 -->
        <el-col :span="8">
          <el-card shadow="hover" class="dict-card">
            <template #header>
              <div class="flex justify-between items-center">
                <span>字典缓存数据</span>
                <div>
                  <span class="text-sm text-gray-500">最后更新: {{ lastUpdateTime }}</span>
                  <el-tag v-if="dictCacheStatus" type="success" class="ml-2" size="small">
                    已缓存
                  </el-tag>
                  <el-tag v-else type="danger" class="ml-2" size="small">未缓存</el-tag>
                </div>
              </div>
            </template>
            <div class="cache-content">
              <pre class="cache-data">{{
                JSON.stringify(dictStore.getDictItems("gender"), null, 2)
              }}</pre>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useDictStoreHook } from "@/store/modules/dict.store";
import { ref, computed, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { useDateFormat } from "@vueuse/core";
import DictAPI from "@/api/system/dict.api";

// 性别字典编码
const DICT_CODE = "gender";
// 男性字典项ID
const MALE_ITEM_ID = 1;

// 字典store
const dictStore = useDictStoreHook();
// 表单加载状态
const formLoading = ref(false);
// 保存状态
const saving = ref(false);
// 最后更新时间
const lastUpdateTime = ref("-");
// 字典表单数据
const dictForm = ref<{
  id?: number;
  dictCode: string;
  label: string;
  value: string;
  tagType?: string;
  status?: number;
} | null>(null);

// 日志消息类型
interface LogMessage {
  title: string;
  type: string;
  data: any;
  time: Date;
}

// 当前选中字典的缓存状态
const dictCacheStatus = computed(() => {
  // 检查字典是否在缓存中
  return dictStore.getDictItems(DICT_CODE).length > 0;
});

// WebSocket日志消息
const logMessages = ref<LogMessage[]>([]);

// 加载男性字典表单数据
const loadMaleDict = async () => {
  formLoading.value = true;
  try {
    // 先确保字典缓存已加载
    if (!dictCacheStatus.value) {
      await dictStore.loadDictItems(DICT_CODE);
    }

    // 获取男性字典项表单数据 - 使用接口 /dicts/gender/items/1/form
    const data = await DictAPI.getDictItemFormData(DICT_CODE, MALE_ITEM_ID);

    // 调试日志
    console.log("表单数据响应:", data);

    if (data) {
      dictForm.value = data;
      // 确保字典值类型为字符串
      if (dictForm.value && dictForm.value.value) {
        dictForm.value.value = String(dictForm.value.value);
      }
    } else {
      // 创建一个默认的表单数据用于显示
      dictForm.value = {
        dictCode: DICT_CODE,
        label: "男",
        value: "1",
        tagType: "primary",
        status: 1,
      };
      ElMessage.warning("未获取到表单数据，已创建默认数据");
    }

    // 更新时间
    lastUpdateTime.value = useDateFormat(new Date(), "YYYY-MM-DD HH:mm:ss").value;

    // 添加WebSocket连接日志
    addLogMessage({
      title: "WebSocket连接成功",
      type: "success",
      data: {
        message: "已与服务器建立WebSocket连接",
        time: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("加载字典数据失败:", error);
    ElMessage.error("加载字典数据失败: " + (error.message || "未知错误"));
    // 创建一个默认的表单数据用于显示
    dictForm.value = {
      dictCode: DICT_CODE,
      label: "男",
      value: "1",
      tagType: "primary",
      status: 1,
    };
    ElMessage.warning("加载失败，已创建默认数据");
  } finally {
    formLoading.value = false;
  }
};

// 保存字典项
const saveDict = async () => {
  if (!dictForm.value) return;

  saving.value = true;
  try {
    // 调用API保存
    await DictAPI.updateDictItem(DICT_CODE, MALE_ITEM_ID, dictForm.value);

    // 清除缓存
    dictStore.removeDictItem(DICT_CODE);

    // 更新时间
    lastUpdateTime.value = useDateFormat(new Date(), "YYYY-MM-DD HH:mm:ss").value;

    // 添加WebSocket消息推送日志
    addLogMessage({
      title: "接收到WebSocket消息",
      type: "info",
      data: {
        type: "DICT_UPDATED",
        dictCode: DICT_CODE,
        item: {
          id: MALE_ITEM_ID,
          label: dictForm.value.label,
          value: dictForm.value.value,
        },
        timestamp: Date.now(),
      },
    });

    ElMessage.success("保存成功，后端已触发WebSocket通知");

    // 重新加载字典数据以显示最新缓存
    setTimeout(() => {
      dictStore.loadDictItems(DICT_CODE);
    }, 500);
  } catch (error) {
    console.error("保存字典项失败:", error);
    ElMessage.error("保存失败: " + (error.message || "未知错误"));

    addLogMessage({
      title: "保存字典项失败",
      type: "error",
      data: {
        dictCode: DICT_CODE,
        error: error.message || "未知错误",
      },
    });
  } finally {
    saving.value = false;
  }
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

// 组件挂载时加载性别字典
onMounted(() => {
  loadMaleDict();
});
</script>

<style scoped>
.dict-card {
  display: flex;
  flex-direction: column;
  height: 600px;
  overflow: hidden;
}

.dict-card :deep(.el-card__body) {
  flex: 1;
  overflow: auto;
}

.websocket-log {
  height: 100%;
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

.cache-content {
  height: 100%;
  overflow: hidden;
}

pre {
  padding: 8px;
  overflow-y: auto;
  word-wrap: break-word;
  white-space: pre-wrap;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.cache-data {
  height: 100%;
  padding: 8px;
  overflow-y: auto;
  font-size: 12px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.dict-form {
  margin-bottom: 20px;
}
</style>
