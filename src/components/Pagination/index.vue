<template>
  <el-scrollbar>
    <div :class="{ hidden: hidden }" class="pagination">
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
const props = defineProps({
  total: {
    type: Number as PropType<number>,
    default: 0,
  },
  pageSizes: {
    type: Array as PropType<number[]>,
    default() {
      return [10, 20, 30, 50];
    },
  },
  layout: {
    type: String,
    default: "total, sizes, prev, pager, next, jumper",
  },
  background: {
    type: Boolean,
    default: true,
  },
  autoScroll: {
    type: Boolean,
    default: true,
  },
  hidden: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["pagination"]);

const currentPage = defineModel("page", {
  type: Number,
  required: true,
  default: 1,
});

const pageSize = defineModel("limit", {
  type: Number,
  required: true,
  default: 10,
});

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

function handleSizeChange(val: number) {
  currentPage.value = 1;
  emit("pagination", { page: currentPage.value, limit: val });
}

function handleCurrentChange(val: number) {
  emit("pagination", { page: val, limit: pageSize.value });
}
</script>

<style lang="scss" scoped>
.pagination {
  padding: 12px;

  &.hidden {
    display: none;
  }
}
</style>
