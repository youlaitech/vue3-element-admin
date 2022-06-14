<script lang="ts">
export default {
  name: 'member',
};
</script>

<script setup lang="ts">
import { reactive, onMounted, toRefs } from 'vue';
import { ElTable } from 'element-plus';
import { Search, Refresh } from '@element-plus/icons-vue';

import { listMemebersPage } from '@/api/ums/member';
import { MemberQueryParam, MemberItem } from '@/types/api/ums/member';

const state = reactive({
  // 遮罩层
  loading: true,
  // 选中数组
  ids: [],
  // 非单个禁用
  single: true,
  // 非多个禁用
  multiple: true,
  total: 0,
  queryParams: {
    pageNum: 1,
    pageSize: 10,
  } as MemberQueryParam,
  memberList: [] as MemberItem[],
});

const { loading, queryParams, memberList, total } = toRefs(state);

function handleQuery() {
  state.loading = true;
  listMemebersPage(state.queryParams).then(({ data }) => {
    state.memberList = data.list;
    state.total = data.total;
    state.loading = false;
  });
}

function resetQuery() {
  state.queryParams = {
    pageNum: 1,
    pageSize: 10,
    nickName: '',
  };
  handleQuery();
}

function handleSelectionChange(selection: any) {
  state.ids = selection.map((item: { id: any }) => item.id);
  state.single = selection.length != 1;
  state.multiple = !selection.length;
}

onMounted(() => {
  handleQuery();
});
</script>

<template>
  <div class="app-container">
    <el-form ref="queryFormRef" :model="queryParams" :inline="true">
      <el-form-item>
        <el-input
          v-model="queryParams.nickName"
          placeholder="会员昵称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="Search" @click="handleQuery"
          >搜索</el-button
        >
        <el-button :icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-table
      v-loading="loading"
      :data="memberList"
      border
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" align="center" />
      <el-table-column type="expand" width="120" label="会员地址">
        <template #default="scope">
          <el-table :data="scope.row.addressList" size="small" border>
            <el-table-column
              type="index"
              label="序号"
              width="100"
              align="center"
            />
            <el-table-column align="center" label="收货人" prop="name" />
            <el-table-column align="center" label="联系方式" prop="mobile" />
            <el-table-column align="center" label="收货地址">
              <template #default="scope">
                {{
                  scope.row.province +
                  scope.row.city +
                  scope.row.area +
                  scope.row.address
                }}
              </template>
            </el-table-column>
            <el-table-column align="center" label="邮编" prop="zipCode" />
            <el-table-column align="center" label="是否默认">
              <template #default="scope">
                <el-tag v-if="scope.row.defaulted == 1" type="success"
                  >是</el-tag
                >
                <el-tag v-if="scope.row.defaulted == 0" type="info">否</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </template>
      </el-table-column>

      <el-table-column type="index" label="序号" width="100" align="center" />
      <el-table-column prop="nickName" label="昵称" />
      <el-table-column label="性别" width="80">
        <template #default="scope">
          <span v-if="scope.row.gender === 0">未知</span>
          <span v-if="scope.row.gender === 1">男</span>
          <span v-if="scope.row.gender === 2">女</span>
        </template>
      </el-table-column>
      <el-table-column label="头像" width="100">
        <template #default="scope">
          <el-popover placement="right" :width="400" trigger="hover">
            <img :src="scope.row.avatarUrl" width="400" height="400" />
            <template #reference>
              <img
                :src="scope.row.avatarUrl"
                style="max-height: 60px; max-width: 60px"
              />
            </template>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column prop="mobile" label="手机号码" />
      <el-table-column prop="birthday" label="出生日期" />
      <el-table-column prop="status" width="80" label="状态">
        <template #default="scope">
          <el-tag v-if="scope.row.status === 1" type="success">正常</el-tag>
          <el-tag v-else type="info">禁用</el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="gmtCreate" label="注册时间" />

      <el-table-column label="账户余额">
        <template #default="scope">
          {{ scope.row.balance / 100 }}
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页工具条 -->
    <pagination
      v-if="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="handleQuery"
    />
  </div>
</template>

<style scoped></style>
