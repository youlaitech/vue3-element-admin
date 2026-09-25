<template>
  <el-scrollbar>
    <div :class="{ 'is-hidden': hidden }" class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :background="background"
        :layout="layout"
        :page-sizes="pageSizes"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </el-scrollbar>
</template>

<script setup lang="ts">
interface Props {
  /** 数据总条数 */
  total?: number;
  /** 每页条数选项，默认 [10, 20, 50, 100] */
  pageSizes?: number[];
  /** 分页布局，控制显示哪些子组件及其顺序 */
  layout?: string;
  /** 是否为分页按钮添加背景色 */
  background?: boolean;
  /** 是否隐藏整个分页条 */
  hidden?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  total: 0,
  pageSizes: () => [10, 20, 50, 100],
  layout: "total, sizes, prev, pager, next, jumper",
  background: true,
  hidden: false,
});

const emit = defineEmits<{
  /** 页码或每页条数变化时触发，回调当前页码与每页条数 */
  pagination: [query: { page: number; limit: number }];
}>();

/**
 * 当前页码，双向绑定到父组件的 page
 */
const currentPage = defineModel<number>("page", { default: 1 });

/**
 * 每页条数，双向绑定到父组件的 limit
 */
const pageSize = defineModel<number>("limit", { default: 10 });

// 数据总量变化后，若当前页超出最后一页，则回退到最后一页
watch(
  () => props.total,
  (newVal: number) => {
    const lastPage = Math.ceil(newVal / pageSize.value);
    if (newVal > 0 && currentPage.value > lastPage) {
      currentPage.value = lastPage;
      emit("pagination", { page: currentPage.value, limit: pageSize.value });
    }
  }
);

/**
 * 切换每页条数时回到第一页，并触发分页请求
 */
function handleSizeChange(val: number) {
  currentPage.value = 1;
  emit("pagination", { page: currentPage.value, limit: val });
}

/**
 * 切换页码时触发分页请求
 */
function handleCurrentChange(val: number) {
  emit("pagination", { page: val, limit: pageSize.value });
}
</script>

<style lang="scss" scoped>
.pagination-container {
  display: flex;
  justify-content: flex-end;
  padding-top: 14px;
  overflow: visible;
}

.pagination-container.is-hidden {
  display: none;
}
</style>
