<template>
  <div class="field-config-step">
    <!-- 统计与批量操作 -->
    <div class="stats-bar">
      <span>
        共
        <b>{{ fieldConfigs.length }}</b>
        个字段
      </span>
      <span>
        查询
        <b>{{ queryCount }}</b>
      </span>
      <span>
        列表
        <b>{{ listCount }}</b>
      </span>
      <span>
        表单
        <b>{{ formCount }}</b>
      </span>

      <!-- 批量操作 -->
      <div class="bulk-actions">
        <el-checkbox v-if="aiChangedCount" v-model="onlyAiChanged">
          只看 AI 改动（{{ aiChangedCount }}）
        </el-checkbox>
        <el-divider v-if="aiChangedCount" direction="vertical" />
        <span class="text-sm text-gray-500">批量:</span>
        <el-dropdown @command="(cmd: any) => bulkSet(cmd.key, cmd.value)">
          <el-button size="small" type="primary" plain>
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item :command="{ key: 'isShowInQuery', value: 1 }">
                全选
              </el-dropdown-item>
              <el-dropdown-item :command="{ key: 'isShowInQuery', value: 0 }">
                全不选
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-dropdown @command="(cmd: any) => bulkSet(cmd.key, cmd.value)">
          <el-button size="small" type="success" plain>
            <el-icon><List /></el-icon>
            列表
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item :command="{ key: 'isShowInList', value: 1 }">全选</el-dropdown-item>
              <el-dropdown-item :command="{ key: 'isShowInList', value: 0 }">
                全不选
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-dropdown @command="(cmd: any) => bulkSet(cmd.key, cmd.value)">
          <el-button size="small" type="warning" plain>
            <el-icon><EditPen /></el-icon>
            表单
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item :command="{ key: 'isShowInForm', value: 1 }">全选</el-dropdown-item>
              <el-dropdown-item :command="{ key: 'isShowInForm', value: 0 }">
                全不选
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- 字段卡片：取代原来的宽表，设置项在卡片内分行排布 -->
    <div v-loading="loading" :element-loading-text="loadingText" class="field-cards-wrap">
      <div ref="listRef" class="field-cards">
        <div
          v-for="row in visibleFields"
          :key="row.columnName"
          class="field-card"
          :class="{
            'is-ai': isAiChanged(row.columnName),
            'is-located': locatedColumn === row.columnName,
          }"
        >
          <el-icon class="sortable-handle cursor-move text-gray-400 hover:text-primary">
            <Rank />
          </el-icon>
          <span class="field-column" :title="row.columnName">{{ row.columnName }}</span>
          <el-tooltip v-if="aiChangesOf(row.columnName)?.length" placement="top" effect="light">
            <template #content>
              <div
                v-for="item in aiChangesOf(row.columnName)"
                :key="item.label"
                class="ai-change-line"
              >
                {{ item.label }}：{{ item.from }} → {{ item.to }}
              </div>
            </template>
            <el-tag size="small" type="primary" effect="plain">AI</el-tag>
          </el-tooltip>
          <span class="field-meta" :title="`${row.columnType} → ${row.fieldType}`">
            {{ row.columnType }} → {{ row.fieldType }}
            <span v-if="row.maxLength">({{ row.maxLength }})</span>
          </span>

          <div class="field-naming">
            <span class="field-label">字段名</span>
            <el-input v-model="row.fieldName" size="small" class="field-input" />
            <span class="field-label">注释</span>
            <el-input v-model="row.fieldComment" size="small" class="field-input" />
          </div>

          <div class="field-settings">
            <div class="setting-group">
              <el-checkbox v-model="row.isShowInQuery" :true-value="1" :false-value="0">
                查询
              </el-checkbox>
              <el-select
                v-model="row.queryType"
                :disabled="row.isShowInQuery !== 1"
                size="small"
                placeholder="未启用"
                class="field-select"
              >
                <el-option
                  v-for="(item, key) in queryTypeOptions"
                  :key="key"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </div>
            <div class="setting-group">
              <el-checkbox v-model="row.isShowInList" :true-value="1" :false-value="0">
                列表
              </el-checkbox>
            </div>
            <div class="setting-group">
              <el-checkbox v-model="row.isShowInForm" :true-value="1" :false-value="0">
                表单
              </el-checkbox>
              <el-select
                v-model="row.formType"
                :disabled="row.isShowInForm !== 1 && row.isShowInQuery !== 1"
                size="small"
                placeholder="未启用"
                class="field-select"
              >
                <el-option
                  v-for="(item, key) in formTypeOptions"
                  :key="key"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
              <el-select
                v-if="row.formType === FormTypeEnum.SELECT.value"
                v-model="row.dictType"
                clearable
                size="small"
                placeholder="字典"
                class="field-select"
              >
                <el-option
                  v-for="item in dictOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
              <div class="field-required">
                <span class="field-label">必填</span>
                <el-switch
                  v-model="row.isRequired"
                  :active-value="1"
                  :inactive-value="0"
                  :disabled="row.isShowInForm !== 1"
                  size="small"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <el-empty v-if="!visibleFields.length" description="没有字段" :image-size="80" />
    </div>
  </div>
</template>

<script setup lang="ts">
import Sortable from "sortablejs";
import { FormTypeEnum, QueryTypeEnum } from "@/enums/codegen";
import type { GenConfigForm } from "@/api/codegen";
import type { OptionItem } from "@/api/common";
import type { AiChangeItem } from "../composables/useAiFillDiff";

const formData = defineModel<GenConfigForm>({ required: true });

const props = defineProps<{
  loading: boolean;
  loadingText: string;
  dictOptions?: OptionItem[];
  /** AI 改动明细：列名 → 各改动项 */
  aiChanges?: Record<string, AiChangeItem[]>;
}>();

const formTypeOptions: Record<string, OptionItem> = FormTypeEnum;
const queryTypeOptions: Record<string, OptionItem> = QueryTypeEnum;

const listRef = ref<HTMLElement>();
const sortFlag = ref<Sortable | null>(null);

const fieldConfigs = computed(() => formData.value?.fieldConfigs || []);

// 只看 AI 改动过的字段
const onlyAiChanged = ref(false);

// AI 改动过的字段数
const aiChangedCount = computed(() => Object.keys(props.aiChanges ?? {}).length);

// 展示的字段，开启筛选时只保留 AI 改动过的字段
const visibleFields = computed(() => {
  if (!onlyAiChanged.value) return fieldConfigs.value;
  return fieldConfigs.value.filter(
    (row) => row.columnName && props.aiChanges?.[row.columnName]?.length
  );
});

/**
 * 取某列的 AI 改动明细
 */
function aiChangesOf(columnName?: string) {
  return columnName ? props.aiChanges?.[columnName] : undefined;
}

/**
 * 是否给卡片加改动底色；全部字段都被改过时不再整片高亮，那已经没有对比意义
 */
function isAiChanged(columnName?: string) {
  const changed = aiChangesOf(columnName)?.length;
  return !!changed && aiChangedCount.value < fieldConfigs.value.length;
}

/**
 * 只看 AI 改动过的字段，AI 填充完成后由父级调用
 */
function showOnlyAiChanged() {
  if (!aiChangedCount.value) return;
  onlyAiChanged.value = true;
}

// 定位目标字段，短暂高亮用
const locatedColumn = ref("");
let locateTimer: ReturnType<typeof setTimeout> | undefined;

/**
 * 滚动到指定字段卡片并短暂高亮，供父级从 AI 改动明细定位时调用
 */
async function locateField(columnName: string) {
  if (!columnName) return;
  // 等字段列表按当前筛选渲染完，再取节点，否则可能定位到上一帧已不存在的卡片
  await nextTick();
  const cards = listRef.value?.querySelectorAll<HTMLElement>(".field-card");
  const target = Array.from(cards ?? []).find(
    (card) => card.querySelector(".field-column")?.textContent?.trim() === columnName
  );
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "center" });
  locatedColumn.value = columnName;
  clearTimeout(locateTimer);
  locateTimer = setTimeout(() => (locatedColumn.value = ""), 2000);
}

// 筛选时关掉拖拽，避免显示的序号和真实数据错位
watch(onlyAiChanged, (only) => {
  if (only) {
    destroySort();
  } else {
    nextTick(() => initSort());
  }
});

// 统计数量
const queryCount = computed(() => fieldConfigs.value.filter((f) => f.isShowInQuery === 1).length);
const listCount = computed(() => fieldConfigs.value.filter((f) => f.isShowInList === 1).length);
const formCount = computed(() => fieldConfigs.value.filter((f) => f.isShowInForm === 1).length);

/**
 * 批量设置
 */
function bulkSet(key: "isShowInQuery" | "isShowInList" | "isShowInForm", value: 0 | 1) {
  fieldConfigs.value.forEach((row) => {
    row[key] = value;
  });
}

/**
 * 用 Sortable.js 实现卡片拖拽排序，需要在字段配置步骤显示后调用
 */
function initSort() {
  if (sortFlag.value || onlyAiChanged.value) return;
  if (!listRef.value) return;
  sortFlag.value = Sortable.create(listRef.value, {
    animation: 150,
    ghostClass: "sortable-ghost",
    handle: ".sortable-handle",
    easing: "cubic-bezier(1, 0, 0, 1)",
    onEnd: (evt: any) => {
      const { oldIndex, newIndex } = evt;
      if (oldIndex === undefined || newIndex === undefined || oldIndex === newIndex) return;
      const list = formData.value?.fieldConfigs || [];
      const [item] = list.splice(oldIndex, 1);
      list.splice(newIndex, 0, item);
    },
  });
}

/**
 * 销毁拖拽排序实例
 */
function destroySort() {
  sortFlag.value?.destroy();
  sortFlag.value = null;
}

/**
 * 暴露给父组件
 */
defineExpose({ initSort, destroySort, showOnlyAiChanged, locateField });

onBeforeUnmount(() => {
  destroySort();
  clearTimeout(locateTimer);
});
</script>

<style scoped lang="scss">
.field-config-step {
  .stats-bar {
    display: flex;
    gap: 16px;
    align-items: center;
    padding: 12px 16px;
    margin-bottom: 16px;
    font-size: 13px;
    color: var(--el-text-color-secondary);
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 10px;

    b {
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    .bulk-actions {
      display: flex;
      gap: 8px;
      align-items: center;
      margin-left: auto;

      :deep(.el-button) {
        display: inline-flex;
        gap: 4px;
        align-items: center;
      }
    }
  }

  .field-cards {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .field-card {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    padding: 10px 16px;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 10px;
    transition: border-color 0.2s ease;

    &:hover {
      border-color: var(--el-border-color);
    }

    // AI 改动过的字段：左侧标记 + 淡色底
    &.is-ai {
      background: var(--el-color-primary-light-9);
      border-color: var(--el-color-primary-light-7);
      box-shadow: inset 3px 0 0 0 var(--el-color-primary);
    }

    // 从 AI 改动明细定位过来：用 outline 描边，不和 is-ai 的 box-shadow 打架
    &.is-located {
      outline: 2px solid var(--el-color-primary-light-5);
      outline-offset: 1px;
      border-color: var(--el-color-primary);
    }

    // 列名与类型固定宽度，保证各字段纵向对齐好扫读
    .field-column {
      flex: none;
      width: 108px;
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 14px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      white-space: nowrap;
    }

    .field-meta {
      flex: none;
      width: 150px;
      overflow: hidden;
      text-overflow: ellipsis;
      font-family: var(--el-font-family-mono, monospace);
      font-size: 12px;
      color: var(--el-text-color-secondary);
      white-space: nowrap;
    }

    .field-label {
      font-size: 12px;
      color: var(--el-text-color-secondary);
      white-space: nowrap;
    }

    .field-naming {
      display: flex;
      gap: 8px;
      align-items: center;
      padding-left: 12px;
      border-left: 1px dashed var(--el-border-color-lighter);

      .field-input {
        width: 120px;
      }
    }

    .field-settings {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      align-items: center;
      padding-left: 12px;
      border-left: 1px dashed var(--el-border-color-lighter);

      .setting-group {
        display: flex;
        gap: 8px;
        align-items: center;

        // 查询、列表、表单三组之间用虚线分隔
        & + .setting-group {
          padding-left: 16px;
          border-left: 1px dashed var(--el-border-color-lighter);
        }

        .field-required {
          display: flex;
          gap: 6px;
          align-items: center;
        }
      }

      .field-select {
        width: 118px;
      }
    }
  }
}

.ai-change-line {
  line-height: 1.7;
}

.sortable-ghost {
  background: var(--el-color-primary-light-9) !important;
  border: 1px dashed var(--el-color-primary);
  opacity: 0.5;
}
</style>
