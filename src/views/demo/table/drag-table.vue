<template>
  <div class="app-container">
    <!-- Note that row-key is necessary to get a correct row order. -->
    <el-table
      class="draggable"
      ref="dragTable"
      v-loading="listLoading"
      :data="list"
      row-key="id"
      border
      fit
      highlight-current-row
      style="width: 100%"
    >
      <el-table-column align="center" label="ID" width="65">
        <template #default="{ row }">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>

      <el-table-column width="180px" align="center" label="Date">
        <template #default="{ row }">
          <span>{{ formatDate(row.timestamp) }}</span>
        </template>
      </el-table-column>

      <el-table-column min-width="300px" label="Title">
        <template #default="{ row }">
          <span>{{ row.title }}</span>
        </template>
      </el-table-column>

      <el-table-column width="110px" align="center" label="Author">
        <template #default="{ row }">
          <span>{{ row.author }}</span>
        </template>
      </el-table-column>

      <el-table-column width="110px" label="Importance">
        <template #default="{ row }">
          <svg-icon
            v-for="n in +row.importance ? +row.importance : 0"
            :key="n"
            icon-class="star"
            class="icon-star"
          />
        </template>
      </el-table-column>

      <el-table-column align="center" label="Readings" width="95">
        <template #default="{ row }">
          <span>{{ row.pageviews }}</span>
        </template>
      </el-table-column>

      <el-table-column class-name="status-col" label="Status" width="110">
        <template #default="{ row }">
          <el-tag :type="statusType(row.status)">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column align="center" label="Drag" width="80">
        <template #default="{}">
          <svg-icon class="drag-handler" icon-class="drag" />
        </template>
      </el-table-column>
    </el-table>
    <div class="show-d"><el-tag>The default order :</el-tag> {{ oldList }}</div>
    <div class="show-d">
      <el-tag>The after dragging order :</el-tag>
      {{ list.map((v: any) => v.id) }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { default as Sortable, SortableEvent } from "sortablejs";
import { fetchList } from "@/api/article";

defineOptions({
  // eslint-disable-next-line
  name: "DragTable",
  inheritAttrs: false,
});

interface List {
  id: number;
  timestamp: number;
  title: string;
  pageviews: number;
  status: string;
}

const listLoading = ref<boolean>(true);
const list: Ref = ref<List[]>([]);
const oldList = ref<List[]>([]);

const formatDate = (timestamp: any) => {
  const date = new Date(timestamp);
  return date
    .toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
    .replace(/\//g, "-");
};

const statusType = (status: string) => {
  const statusMap = {
    published: "success",
    draft: "info",
    deleted: "danger",
  };
  return statusMap[status as keyof typeof statusMap];
};

// 行拖拽
const rowDrag = function () {
  // 要拖拽元素的父容器
  const tbody = document.querySelector(
    ".draggable .el-table__body-wrapper tbody"
  );
  if (!tbody) return;
  Sortable.create(tbody as HTMLElement, {
    //  可被拖拽的子元素
    draggable: ".draggable .el-table__row",
    onEnd(event: SortableEvent) {
      if (event.oldIndex !== undefined && event.newIndex !== undefined) {
        const currRow = list.value.splice(event.oldIndex, 1)[0];
        list.value.splice(event.newIndex, 0, currRow);
      }
    },
  });
};

onMounted(() => {
  fetchList({}).then((res) => {
    listLoading.value = false;
    list.value = res.data.items;
    oldList.value = list.value.map((v: any) => v.id);
    rowDrag();
  });
});
</script>

<style>
.sortable-ghost {
  color: #fff !important;
  background: #42b983 !important;
  opacity: 0.8;
}
</style>

<style scoped>
.icon-star {
  margin-right: 2px;
}

.drag-handler {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.show-d {
  margin-top: 15px;
}
</style>
