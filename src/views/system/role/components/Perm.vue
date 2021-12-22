<template>
  <div class="perm-container">
    <el-form size="mini">
      <el-form-item>
        <el-row>
          <el-col :span="12">
            <el-button type="success" plain :icon="Switch" @click="toggleExpandAll">展开/折叠</el-button>
          </el-col>
          <el-col :span="12" style="text-align: right">
            <el-button type="primary" :icon="Check" @click="handleSubmit">提交</el-button>
          </el-col>
        </el-row>
      </el-form-item>
    </el-form>


    <div v-if="permissionOptions.length > 0">
      <el-checkbox
          :indeterminate="isIndeterminate"
          v-model="checkAll"
          @change="handleCheckAllChange"
          style="margin-top: 20px"
      >全选
      </el-checkbox>
      <el-row>
        <el-col
            :span="8"
            v-for="item in permissionOptions"
            style="margin-top: 20px"
        >
          <el-checkbox
              border
              v-model="item.checked"
              :label="item.id"
              :key="item.id"
              @change="handleCheckedPermChange"
              size="mini"
          >
            {{ permission.name }}
          </el-checkbox>
        </el-col>
      </el-row>
    </div>
    <div style="text-align: center" v-else>
      <el-empty :description=" !role? '请选择角色': !menu? '请选择菜单': '暂无数据，您可在【菜单管理】配置权限数据'"></el-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import {listPerms} from "@/api/system/perm";
import { listRolePerms, saveRolePerms} from "@/api/system/role";
import {defineProps, onMounted, reactive, toRefs, watch} from "vue";
import {ElMessage} from "element-plus";


const props = defineProps({
  role: {
    type: Object,
    default: {}
  },
  menu: {
    type: Object,
    default: {}
  }
})

watch(() => props.role.id as any, (newVal, oldVal) => {
  const roleId = props.role.id
  if (roleId) {
  }
})

watch(() => props.menu.id as any, (newVal, oldVal) => {
  const menuId = props.menu.id
  if (menuId) {
  }
})

const state = reactive({
  loading: false,
  permissionOptions: [] as Array<any>,
  isIndeterminate: true,
  checkAll: false,
  checkedPerms: []
})

const {permissionOptions, isIndeterminate, checkAll, checkedPerms} = toRefs(state)

function handleCheckAllChange(checked: Boolean) {
  state.isIndeterminate = false;
  if (checked) {
    state.permissionOptions.map((item) => (item.checked = true));
  } else {
    // 全不选
    state.permissionOptions.map((item) => (item.checked = false));
  }
}

function handleCheckedPermChange(value: any) {
  const checkedCount = value.length;
  state.checkAll = checkedCount === state.permissionOptions.length;
  state.isIndeterminate = checkedCount > 0 && checkedCount < state.permissionOptions.length;
}

function loadData() {
  if(! props.menu.id){
    return false
  }

  state.loading = true;
  listPerms({menuId: props.menu.id}).then(response => {
    state.permissionOptions =  response.data
    listRolePerms(props.role.id, props.menu.id).then(res => {
      const checkedPermIds = res.data
      state.permissionOptions.map((item:any)=> {
        if (checkedPermIds.includes(item.id)) {
          item.checked = true;
        } else {
          state.checkAll = false
        }
      });

      state.loading=false

    })
  })
}

function handleSubmit(){
  const checkedPermIds = state.permissionOptions
      .filter((item) => item.checked)
      .map((item) => item.id);


saveRolePerms(  props.menu.id,
    props.role.id,
    checkedPermIds
).then(() => {
  ElMessage.success("提交成功");
});

}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.perm-container {
  width: 100%;
}
</style>
