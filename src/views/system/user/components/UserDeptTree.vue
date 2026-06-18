<template>
  <el-card shadow="never" class="dept-card">
    <el-input v-model="deptName" class="dept-card__search" placeholder="搜索部门" clearable>
      <template #prefix>
        <el-icon><Search /></el-icon>
      </template>
    </el-input>

    <el-tree
      ref="deptTreeRef"
      class="dept-card__tree"
      :data="deptList"
      :props="{ children: 'children', label: 'label', disabled: '' }"
      :expand-on-click-node="false"
      :filter-node-method="handleFilter"
      default-expand-all
      @node-click="handleNodeClick"
    />
  </el-card>
</template>

<script setup lang="ts">
import DeptAPI from "@/api/system/dept";
import type { OptionItem } from "@/api/common";
import type { TreeNodeData } from "element-plus/es/components/tree";

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: undefined,
  },
});

const deptList = ref<OptionItem[]>();
const deptTreeRef = ref();
const deptName = ref("");

const emits = defineEmits(["node-click"]);

const deptId = useVModel(props, "modelValue", emits);

watchEffect(
  () => {
    deptTreeRef.value?.filter(deptName.value);
  },
  {
    flush: "post",
  }
);

function handleFilter(value: string, data: TreeNodeData): boolean {
  if (!value) {
    return true;
  }
  return String(data.label ?? "").includes(value);
}

function handleNodeClick(data: OptionItem): void {
  deptId.value = data.value;
  emits("node-click");
}

onBeforeMount(() => {
  DeptAPI.getOptions().then((data) => {
    deptList.value = data;
  });
});
</script>

<style lang="scss" scoped>
.dept-card {
  :deep(.el-card__body) {
    display: flex;
    flex-direction: column;
  }
}

.dept-card__search {
  margin-bottom: 12px;
}

.dept-card__tree {
  flex: 1;
  min-height: 0;
  overflow: auto;
}
</style>
