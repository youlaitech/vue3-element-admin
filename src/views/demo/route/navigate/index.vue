<template>
  <div class="page-container">
    <RouteInfoPanel
      class="mb-4"
      title="列表 → 独立编辑页"
      description="点「编辑」跳到独立页面改数据，改完返回列表。本页开了 keepAlive，筛选条件不会丢，返回时还会重新读取数据源，把修改结果显示出来。"
    />

    <el-card class="page-content" shadow="never">
      <template #header>成员列表</template>

      <el-input v-model="keywords" placeholder="按姓名筛选" clearable />

      <el-table class="mt-4" :data="members" border>
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="dept" label="部门" />
        <el-table-column prop="post" label="岗位" />
        <el-table-column label="操作" width="200" align="center">
          <template #default="scope">
            <el-button type="primary" link @click="handleEditClick(scope.row as MemberItem)">
              编辑
            </el-button>
            <el-button type="warning" link @click="handleDialog(scope.row as MemberItem)">
              弹窗查看
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-alert
        class="mt-4"
        type="info"
        show-icon
        :closable="false"
        title="两种方式对比着看"
        description="「弹窗查看」地址栏不变、刷新即丢、链接没法分享；「编辑」会跳到带 ID 的独立地址，刷新和分享都能复现，浏览器返回键即可回到本页。"
      />
    </el-card>

    <el-dialog v-model="memberDialogVisible" :title="memberDialogTitle" width="420px">
      <p>这里是弹窗内容，地址栏没有变化，刷新页面后弹窗消失，也没法把这条记录分享给别人。</p>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import router from "@/router";
import RouteInfoPanel from "@/views/demo/route/components/RouteInfoPanel.vue";

import { listMembers } from "./data";
import type { MemberItem } from "./data";

defineOptions({
  name: "RouteNavigate",
});

// 列表筛选关键字
const keywords = ref("");
const members = ref<MemberItem[]>([]);

const memberDialogVisible = ref(false);
const memberDialogTitle = ref("");

/**
 * 加载成员列表
 */
function loadMembers(): void {
  members.value = listMembers(keywords.value);
}

// 从编辑页返回时重新读取数据源，让修改结果回显到列表
onActivated(loadMembers);

// 关键字变化后立即过滤
watch(keywords, loadMembers);

onMounted(loadMembers);

/**
 * 跳转独立编辑页，用路由参数携带要编辑的记录 ID
 */
function handleEditClick(row: MemberItem): void {
  router.push({ name: "RouteExampleEdit", params: { id: row.id } });
}

/**
 * 打开成员详情弹窗
 */
function handleDialog(row: MemberItem): void {
  memberDialogTitle.value = `${row.name} · ${row.dept}`;
  memberDialogVisible.value = true;
}
</script>
