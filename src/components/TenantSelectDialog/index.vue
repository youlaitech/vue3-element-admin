<template>
  <el-dialog
    v-model="visible"
    title="选择租户"
    width="400px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
  >
    <div v-if="loading" class="tenant-dialog-loading">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>加载租户列表...</span>
    </div>

    <div v-else-if="tenantList.length === 0" class="tenant-dialog-empty">
      <el-empty description="暂无可用租户" />
    </div>

    <el-radio-group v-else v-model="selectedTenantId" class="tenant-radio-group">
      <el-radio
        v-for="tenant in tenantList"
        :key="tenant.id"
        :label="tenant.id"
        class="tenant-radio-item"
      >
        <div class="tenant-radio-content">
          <div class="tenant-radio-content__name">{{ tenant.name }}</div>
          <div v-if="tenant.code" class="tenant-radio-content__code">{{ tenant.code }}</div>
        </div>
      </el-radio>
    </el-radio-group>

    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" :loading="switching" @click="handleConfirm">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useTenantStoreHook } from "@/store/modules/tenant-store";
import { ElMessage } from "element-plus";
import { Loading } from "@element-plus/icons-vue";

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  confirm: [];
}>();

const tenantStore = useTenantStoreHook();

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const loading = ref(false);
const switching = ref(false);
const selectedTenantId = ref<number | null>(null);
const tenantList = computed(() => tenantStore.tenantList);

// 监听对话框打开，加载租户列表
watch(visible, (newVal) => {
  if (newVal) {
    loadTenantList();
    // 默认选择当前租户或第一个租户
    selectedTenantId.value = tenantStore.currentTenantId || tenantList.value[0]?.id || null;
  }
});

/**
 * 加载租户列表
 */
async function loadTenantList() {
  loading.value = true;
  try {
    await tenantStore.fetchTenantList();
    // 如果列表为空，自动关闭对话框
    if (tenantList.value.length === 0) {
      visible.value = false;
      ElMessage.warning("您暂无可用租户");
    }
  } catch (error: any) {
    ElMessage.error(error.message || "获取租户列表失败");
  } finally {
    loading.value = false;
  }
}

/**
 * 确认选择
 */
async function handleConfirm() {
  if (!selectedTenantId.value) {
    ElMessage.warning("请选择租户");
    return;
  }

  switching.value = true;
  try {
    await tenantStore.switchTenant(selectedTenantId.value);
    ElMessage.success("切换租户成功");
    visible.value = false;
    emit("confirm");
  } catch (error: any) {
    ElMessage.error(error.message || "切换租户失败");
  } finally {
    switching.value = false;
  }
}

/**
 * 取消
 */
function handleCancel() {
  // 如果用户没有租户，不允许取消
  if (tenantList.value.length === 0) {
    return;
  }
  visible.value = false;
}
</script>

<style lang="scss" scoped>
.tenant-dialog-loading {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: var(--el-text-color-secondary);
}

.tenant-dialog-empty {
  padding: 20px 0;
}

.tenant-radio-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.tenant-radio-item {
  width: 100%;
  padding: 12px;
  margin: 0;
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
  transition: all 0.3s;

  &:hover {
    background-color: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary);
  }

  :deep(.el-radio__input.is-checked) {
    .el-radio__inner {
      background-color: var(--el-color-primary);
      border-color: var(--el-color-primary);
    }
  }
}

.tenant-radio-content {
  display: flex;
  flex-direction: column;
  gap: 4px;

  &__name {
    font-size: 14px;
    font-weight: 500;
    color: var(--el-text-color-primary);
  }

  &__code {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
}
</style>
