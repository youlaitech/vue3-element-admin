<template>
  <el-dropdown trigger="click" @command="handleSetSize">
    <div class="size-icon--style">
      <svg-icon class-name="size-icon" icon-class="size"/>
    </div>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
            v-for="item of sizeOptions"
            :key="item.value"
            :disabled="(size||'default')==item.value"
            :command="item.value">
          {{ item.label }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">

import {ref, computed} from "vue";
import {useRoute, useRouter} from "vue-router"

import {ElMessage} from 'element-plus'

import {useAppStoreHook} from '@/store/modules/app'
import SvgIcon from '@/components/SvgIcon/index.vue'

const route = useRoute()
const router = useRouter()
const size = computed(() => useAppStoreHook().size)

const sizeOptions = ref([
  {label: '默认', value: 'default'},
  {label: '大型', value: 'large'},
  {label: '小型', value: 'small'}
])

function handleSetSize(size: string) {
  useAppStoreHook().setSize(size)
  window.location.reload()
  ElMessage.success('切换全局大小成功')
}

</script>

<style lang='scss' scoped>
.size-icon--style {
  font-size: 18px;
  line-height: 50px;
  padding-right: 7px;
}
</style>