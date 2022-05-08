<!-- setup 无法设置组件名称，组件名称keepAlive必须 -->
<script lang="ts">
export default {
  name: 'cmenu'
};
</script>

<script setup lang="ts">
import { nextTick, onMounted, reactive, ref, toRefs, watch } from 'vue';
import { listSelectMenus } from '@/api/system/menu';
import { listRoleMenuIds, updateRoleMenu } from '@/api/system/role';
import { ElTree, ElMessage } from 'element-plus';
import { Switch, Position } from '@element-plus/icons-vue';
import { Option } from '@/types';

const emit = defineEmits(['menuClick']);
const props = defineProps({
  role: {
    type: Object,
    default: () => {}
  }
});

const menuRef = ref(ElTree); // 属性名必须和元素的ref属性值一致

watch(
  () => props.role.id,
  newVal => {
    if (newVal) {
      state.checkStrictly = true;
      // 获取角色拥有的的菜单ID
      listRoleMenuIds(newVal).then(({ data }) => {
        menuRef.value.setCheckedKeys(data);
        state.checkStrictly = false;
      });
    }
  }
);

const state = reactive({
  expandedKeys: [], // 展开的节点
  menuOptions: [] as Option[],
  checkStrictly: false,
  isExpandAll: true,
  refreshTree: true
});

const { expandedKeys, menuOptions, checkStrictly, isExpandAll, refreshTree } =
  toRefs(state);

/**
 * 加载菜单树
 */
async function loadMenuData() {
  await listSelectMenus().then(({ data }) => {
    state.menuOptions = data;
  });
}

function handleNodeClick(node: any) {
  emit('menuClick', node);
}

/**
 * 展开/收缩
 */
function toggleExpandAll() {
  state.refreshTree = false;
  state.isExpandAll = !state.isExpandAll;
  nextTick(() => {
    state.refreshTree = true;
  });
}

/**
 * 保存角色菜单
 */
function handleSubmit() {
  const checkedMenuIds = menuRef.value
    .getCheckedNodes(false, true)
    .map((node: any) => node.value);
  updateRoleMenu(props.role.id, checkedMenuIds).then(() => {
    ElMessage.success('提交成功');
  });
}

onMounted(() => {
  loadMenuData();
});
</script>

<template>
  <div class="app-container">
    <el-row>
      <el-col :span="12">
        <el-button plain :icon="Switch" @click="toggleExpandAll"
          >展开/折叠</el-button
        >
      </el-col>
      <el-col :span="12" style="text-align: right">
        <el-button type="primary" :icon="Position" @click="handleSubmit"
          >提交</el-button
        >
      </el-col>
    </el-row>

    <el-tree
      class="menu-tree"
      ref="menuRef"
      v-if="refreshTree"
      :default-expanded-keys="expandedKeys"
      :default-expand-all="isExpandAll"
      :data="menuOptions"
      show-checkbox
      node-key="value"
      empty-text="加载菜单中..."
      :check-strictly="checkStrictly"
      highlight-current
      @node-click="handleNodeClick"
    />
  </div>
</template>

<style lang="scss" scoped>
.menu-tree {
  margin-top: 10px;
}
</style>
