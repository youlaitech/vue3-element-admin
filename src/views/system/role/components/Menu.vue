<template>
  <div style="width: 100%;">
    <el-form size="mini" >
      <el-form-item>
        <el-row>
          <el-col :span="12">
            <el-button type="success" plain :icon="Switch" >展开/折叠</el-button>
          </el-col>
          <el-col :span="12"  style="text-align: right">
            <el-button type="primary" :icon="Check" @click="handleQuery">提交</el-button>
          </el-col>
        </el-row>
      </el-form-item>
    </el-form>


    <el-tree
        ref="menuRef"
        :default-expanded-keys="state.expandedKeys"
        :default-expand-all="true"
        :data="state.menuOptions"
        show-checkbox
        node-key="id"
        empty-text="加载菜单中..."
        :check-strictly="state.checkStrictly"
        highlight-current
        @node-click="handleNodeClick"
    />
  </div>
</template>

<script setup lang="ts">
import {listTreeSelectMenus} from "@/api/system/menu";
import {listRoleMenuIds, updateRoleMenu} from "@/api/system/role"
import {defineEmits, defineProps,onMounted, reactive, ref, watch} from "vue"
import {ElTree, ElMessage, ElMessageBox} from "element-plus"

import {Switch,Check} from '@element-plus/icons'

const emit = defineEmits(['menuClick'])
const props = defineProps({
  role: {
    type: Object,
    default: {}
  }
})

const menuRef = ref(ElTree) // 属性名必须和元素的ref属性值一致

watch(() => props.role.id as any, (newVal, oldVal) => {
  const roleId = props.role.id
  if (roleId) {
    state.checkStrictly = true
    listRoleMenuIds(roleId).then(response => {
      const checkedMenuIds = response.data
      console.log('选中的菜单',checkedMenuIds)
      menuRef.value.setCheckedKeys(checkedMenuIds)
      state.checkStrictly = false
    })
  }
})

const state = reactive({
  expandedKeys: [],  // 展开的节点
  menuOptions: [],
  checkStrictly: false
})


/**
 * 加载菜单树
 */
async function loadTreeSelectMenuOptions() {
  await listTreeSelectMenus().then(response => {
    state.menuOptions = response.data
  })
}

function handleNodeClick(node: any) {
  emit('menuClick', node)
}

onMounted(() => {
  loadTreeSelectMenuOptions()
})


</script>

<style lang="scss" scoped>

</style>
