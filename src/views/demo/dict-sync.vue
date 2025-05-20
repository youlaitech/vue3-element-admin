<template>
  <div class="app-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>字典WebSocket实时更新演示</span>
          <el-tag :type="wsConnected ? 'success' : 'danger'" size="small" class="ml-2">
            WebSocket {{ wsStatusText }}
          </el-tag>
        </div>
      </template>

      <el-alert type="info" :closable="false" class="mb-4">
        本示例展示WebSocket实时更新字典缓存的效果。您可以编辑"男"性别字典项，保存后后端将通过WebSocket通知所有客户端刷新缓存。
      </el-alert>

      <el-row :gutter="16">
        <el-col :span="8">
          <el-card shadow="hover" class="dict-card">
            <template #header>
              <div class="flex justify-between items-center">
                <span>性别字典项 - 男</span>
                <el-button type="warning" size="small" @click="loadMaleDict">重新加载</el-button>
              </div>
            </template>
            <div>
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

        <!-- 列2: 字典组件展示 -->
        <el-col :span="8">
          <el-card shadow="hover" class="dict-card">
            <template #header>
              <div class="flex justify-between items-center">
                <span>字典组件展示</span>
                <el-button type="primary" size="small" @click="refreshDictComponent">
                  手动刷新
                </el-button>
              </div>
            </template>
            <div class="dict-component-demo">
              <h4 class="mt-4 mb-3">性别组件</h4>
              <el-radio-group v-model="selectedGender">
                <el-radio
                  v-for="item in dictStore.getDictItems('gender')"
                  :key="item.value"
                  :value="item.value"
                >
                  {{ item.label }}
                </el-radio>
              </el-radio-group>

              <h4 class="mt-4 mb-3">性别标签</h4>
              <div>
                <el-tag
                  v-for="item in dictStore.getDictItems('gender')"
                  :key="item.value"
                  :type="item.tagType || undefined"
                  class="mr-2"
                >
                  {{ item.label }}
                </el-tag>
              </div>

              <div class="mt-4 pt-3 border-top">
                <div class="text-muted mb-2">已选择值: {{ selectedGender }}</div>
                <div class="text-muted">最后更新: {{ lastUpdateTime }}</div>
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
import { useDateFormat } from "@vueuse/core";
import DictAPI, { DictItemForm } from "@/api/system/dict.api";
import { useDictSync, DictMessage } from "@/composables/useDictSync";

// 性别字典编码
const DICT_CODE = "gender";
// 男性字典项ID
const MALE_ITEM_ID = "1";

// 字典store
const dictStore = useDictStoreHook();
// 保存状态
const saving = ref(false);
// 最后更新时间
const lastUpdateTime = ref("-");
// 字典表单数据
const dictForm = ref<DictItemForm | null>(null);
// 选中的性别
const selectedGender = ref("");

// 初始化WebSocket
const dictWebSocket = useDictSync();

// 获取连接状态
const wsConnected = computed(() => dictWebSocket.isConnected);

// WebSocket连接状态显示文本
const wsStatusText = computed(() => (wsConnected.value ? "已连接" : "未连接"));

// 保存WebSocket清理函数
let unregisterCallback: (() => void) | null = null;

// 当前选中字典的缓存状态
const dictCacheStatus = computed(() => {
  // 检查字典是否在缓存中
  return dictStore.getDictItems(DICT_CODE).length > 0;
});

// 设置WebSocket
const setupWebSocket = () => {
  // 初始化WebSocket连接
  dictWebSocket.initWebSocket();

  // 注册字典消息回调
  unregisterCallback = dictWebSocket.onDictMessage((message: DictMessage) => {
    // 只有当消息是关于性别字典的更新时才处理
    if (message.dictCode === DICT_CODE) {
      // 更新最后更新时间
      lastUpdateTime.value = useDateFormat(new Date(), "YYYY-MM-DD HH:mm:ss").value;

      // 触发字典组件重新加载
      nextTick(() => {
        refreshDictComponent();
      });
    }
  });
};

// 刷新字典组件，强制重新加载字典数据
const refreshDictComponent = async () => {
  // 这里重新获取字典数据以触发按需加载
  await dictStore.loadDictItems(DICT_CODE);
  ElMessage.success("字典组件已刷新");
};

// 加载男性字典表单数据
const loadMaleDict = async () => {
  // 获取男性字典项表单数据 - 使用接口 /dicts/gender/items/1/form
  const data = await DictAPI.getDictItemFormData(DICT_CODE, MALE_ITEM_ID);
  dictForm.value = data;
};

// 保存字典项
const saveDict = async () => {
  if (!dictForm.value) return;

  saving.value = true;
  try {
    // dictForm的类型已经是DictItemForm，直接传入
    await DictAPI.updateDictItem(DICT_CODE, MALE_ITEM_ID, dictForm.value);

    // 更新时间
    lastUpdateTime.value = useDateFormat(new Date(), "YYYY-MM-DD HH:mm:ss").value;

    ElMessage.success("保存成功，后端将通过WebSocket通知所有客户端");
  } catch (error) {
    console.error("保存字典项失败:", error);
    ElMessage.error("保存失败");
  } finally {
    saving.value = false;
  }
};

// 组件挂载时加载性别字典
onMounted(async () => {
  await loadMaleDict();
  // 加载初始字典数据
  await dictStore.loadDictItems(DICT_CODE);
  // 初始化选中性别为男
  selectedGender.value = "1";
  // 设置WebSocket
  setupWebSocket();
});

// 组件卸载时清理WebSocket
onUnmounted(() => {
  unregisterCallback?.();
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

.dict-component-demo {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 12px;
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

.text-muted {
  font-size: 0.9em;
  color: #909399;
}

.border-top {
  border-top: 1px solid #ebeef5;
}
</style>
