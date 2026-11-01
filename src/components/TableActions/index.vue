<template>
  <div v-if="actions.length" class="table-actions">
    <template v-for="action in inlineActions" :key="action.key">
      <slot :name="'action-' + action.key" :action="getSlotAction(action)" :overflow="false">
        <el-button
          link
          size="small"
          type="primary"
          v-bind="action.buttonProps"
          :disabled="isDisabled(action)"
          :loading="action.loading || action.buttonProps?.loading"
          @click="run(action)"
        >
          {{ action.label }}
        </el-button>
      </slot>
    </template>
    <el-popover
      v-if="overflowActions.length"
      v-model:visible="expanded"
      trigger="click"
      placement="bottom-end"
      role="dialog"
      aria-label="更多操作"
      :width="128"
      :show-arrow="false"
      @after-enter="focusActions"
    >
      <template #reference>
        <el-button link size="small" type="primary">
          更多
          <el-icon class="el-icon--right"><ArrowDown /></el-icon>
        </el-button>
      </template>
      <div ref="overflowRef" class="table-actions__overflow" tabindex="-1">
        <template v-for="action in overflowActions" :key="action.key">
          <slot :name="'action-' + action.key" :action="getSlotAction(action)" :overflow="true">
            <el-button
              text
              size="small"
              type=""
              v-bind="action.buttonProps"
              :link="false"
              :disabled="isDisabled(action)"
              :loading="action.loading || action.buttonProps?.loading"
              @click="run(action)"
            >
              {{ action.label }}
            </el-button>
          </slot>
        </template>
      </div>
    </el-popover>
  </div>
</template>

<script setup lang="ts">
import { ArrowDown } from "@element-plus/icons-vue";
import type { TableAction } from "./types";

/**
 * 控制直接显示的操作数量；0 表示全部显示。
 */
const props = defineProps<{
  actions: readonly TableAction[];
  maxVisible?: number;
}>();

const expanded = ref(false);
const overflowRef = ref<HTMLDivElement>();
const visibleCount = computed(() => {
  const limit = props.maxVisible ?? 3;
  if (!Number.isInteger(limit) || limit < 0) return 3;
  return limit;
});
const inlineCount = computed(() => {
  if (visibleCount.value === 0 || props.actions.length <= visibleCount.value) {
    return props.actions.length;
  }
  return visibleCount.value;
});
const inlineActions = computed(() => props.actions.slice(0, inlineCount.value));
const overflowActions = computed(() => props.actions.slice(inlineCount.value));

watch(
  () => overflowActions.value.length,
  (count) => {
    if (count === 0) expanded.value = false;
  },
);

/**
 * 将焦点放入浮层，后续 Tab 与 Escape 由组件库处理。
 */
function focusActions(): void {
  overflowRef.value?.focus();
}

/**
 * 原生按钮属性与动作状态均可禁用操作。
 */
function isDisabled(action: TableAction): boolean {
  return !!(
    action.disabled ||
    action.loading ||
    action.buttonProps?.disabled ||
    action.buttonProps?.loading
  );
}

/**
 * 关闭浮层后执行操作，禁用或加载中的按钮不响应。
 */
function run(action: TableAction): void | Promise<unknown> {
  if (isDisabled(action)) return;
  expanded.value = false;
  return action.run();
}

/**
 * 自定义按钮沿用状态检查与浮层关闭行为。
 */
function getSlotAction(action: TableAction): TableAction {
  return {
    ...action,
    disabled: isDisabled(action),
    loading: action.loading || action.buttonProps?.loading,
    run: () => run(action),
  };
}
</script>

<style lang="scss" scoped>
.table-actions {
  display: inline-flex;
  gap: 12px;
  align-items: center;
  white-space: nowrap;
}

.table-actions__overflow {
  display: flex;
  flex-direction: column;
  gap: 4px;

  :deep(.el-button) {
    justify-content: flex-start;
  }
}

.table-actions,
.table-actions__overflow {
  :deep(.el-button + .el-button) {
    margin-left: 0;
  }
}
</style>
