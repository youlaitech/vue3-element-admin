<template>
  <el-table-column
    :label="label"
    :fixed="fixed"
    :align="align"
    :show-overflow-tooltip="showOverflowTooltip"
    :width="finalWidth"
  >
    <template #default="{ row }">
      <div v-auto-width class="operation-buttons">
        <slot :row="row"></slot>
      </div>
    </template>
  </el-table-column>
</template>

<script setup lang="ts">
interface Props {
  listDataLength: number;
  prop?: string;
  label?: string;
  fixed?: string;
  align?: string;
  width?: number;
  showOverflowTooltip?: boolean;
  minWidth?: number;
}

const props = withDefaults(defineProps<Props>(), {
  label: "操作",
  fixed: "right",
  align: "center",
  minWidth: 80,
});

const count = ref(0);
const operationWidth = ref(props.minWidth || 80);

// 计算操作列宽�?
const calculateWidth = () => {
  count.value++;

  if (count.value !== props.listDataLength) return;
  const maxWidth = getOperationMaxWidth();
  operationWidth.value = Math.max(maxWidth, props.minWidth);
  count.value = 0;
};

// 计算最终宽�?
const finalWidth = computed(() => {
  return props.width || operationWidth.value || props.minWidth;
});

// 自适应宽度指令
const vAutoWidth = {
  mounted() {
    // 初次挂载的时候计算一�?
    calculateWidth();
  },
  updated() {
    // 数据更新时重新计算一�?
    calculateWidth();
  },
};

/**
 * 获取按钮数量和宽带来获取操作组的最大宽�?
 * 注意使用时需要使�?`class="operation-buttons"` 的标签包裹操作按�?
 * @returns {number} 返回操作组的最大宽�?
 */
const getOperationMaxWidth = () => {
  const el = document.getElementsByClassName("operation-buttons");

  // 取操作组的最大宽�?
  let maxWidth = 0;
  let totalWidth: any = 0;
  Array.prototype.forEach.call(el, (item) => {
    // 获取每个item的dom
    const buttons = item.querySelectorAll(".el-button");
    // 获取每行按钮的总宽�?
    totalWidth = Array.from(buttons).reduce((acc, button: any) => {
      return acc + button.scrollWidth + 22; // 每个按钮的宽度加上预留宽�?
    }, 0);

    // 获取最大的宽度
    if (totalWidth > maxWidth) maxWidth = totalWidth;
  });

  return maxWidth;
};
</script>
