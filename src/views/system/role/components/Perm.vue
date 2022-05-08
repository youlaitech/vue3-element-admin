<template>
  <div class="perm-container">
    <div v-if="permissionOptions.length > 0">
      <el-row>
        <el-col :span="12">
          <el-checkbox
            :indeterminate="isIndeterminate"
            v-model="checkAll"
            @change="handleCheckAllChange"
            >全选
          </el-checkbox>
        </el-col>
        <el-col :span="12" style="text-align: right">
          <el-button type="primary" :icon="Position" @click="handleSubmit"
            >提交</el-button
          >
        </el-col>
      </el-row>

      <el-row>
        <el-col
          :span="8"
          v-for="item in permissionOptions"
          style="margin-top: 20px"
          :key="item.id"
        >
          <el-checkbox
            border
            v-model="item.checked"
            :label="item.id"
            :key="item.id"
            @change="handleCheckedPermChange"
          >
            {{ item.name }}
          </el-checkbox>
        </el-col>
      </el-row>
    </div>
    <div style="text-align: center" v-else>
      <el-empty
        :description="
          !role
            ? '请选择角色'
            : !menu
            ? '请选择菜单'
            : '暂无数据，您可在【菜单管理】配置权限数据'
        "
      ></el-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, toRefs, watch } from 'vue';
import { listPerms } from '@/api/system/perm';
import { listRolePerms, saveRolePerms } from '@/api/system/role';
import { ElMessage } from 'element-plus';
import { Position } from '@element-plus/icons-vue';
import { PermQueryParam } from '@/types';

const props = defineProps({
  role: {
    type: Object,
    default: () => {
      return {};
    }
  },
  menu: {
    type: Object,
    default: () => {
      return {};
    }
  }
});

watch(
  () => props.menu.id,
  value => {
    if (value) {
      loadData();
    }
  }
);

const state = reactive({
  loading: false,
  permissionOptions: [] as Array<any>,
  isIndeterminate: true,
  checkAll: false,
  checkedPerms: []
});

const { permissionOptions, isIndeterminate, checkAll } = toRefs(state);

function handleCheckAllChange(checked: boolean) {
  state.isIndeterminate = false;
  if (checked) {
    state.permissionOptions.map(item => (item.checked = true));
  } else {
    // 全不选
    state.permissionOptions.map(item => (item.checked = false));
  }
}

function handleCheckedPermChange() {
  const checkedCount = state.permissionOptions.filter(
    item => item.checked
  ).length;
  state.checkAll = checkedCount === state.permissionOptions.length;
  state.isIndeterminate =
    checkedCount > 0 && checkedCount < state.permissionOptions.length;
}

function loadData() {
  if (!props.menu.id) {
    resetData();
    return false;
  }
  state.loading = true;

  const params = { menuId: props.menu.id } as PermQueryParam;
  listPerms(params).then(({ data }) => {
    state.permissionOptions = data;
    listRolePerms(props.role.id, props.menu.id).then(response => {
      const checkedPermIds = response.data;
      state.permissionOptions.map((item: any) => {
        if (checkedPermIds.includes(item.id)) {
          item.checked = true;
        } else {
          state.checkAll = false;
        }
      });
      state.loading = false;
    });
  });
}

function handleSubmit() {
  const checkedPermIds = state.permissionOptions
    .filter(item => item.checked)
    .map(item => item.id);
  saveRolePerms(props.role.id, props.menu.id, checkedPermIds).then(() => {
    ElMessage.success('提交成功');
  });
}

function resetData() {
  state.permissionOptions = [];
  state.isIndeterminate = true;
  state.checkAll = false;
}

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.perm-container {
  width: 100%;
}
</style>
