<template>
  <el-dropdown class="size-select" trigger="click" @command="handleSetSize">
    <div class="size-select__icon">
      <svg-icon class-name="size-icon" icon-class="size" />
    </div>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          v-for="item of sizeOptions"
          :key="item.value"
          :disabled="(size || 'default') == item.value"
          :command="item.value"
        >
          {{ item.label }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';

import useStore from '@/store';
import SvgIcon from '@/components/SvgIcon/index.vue';

const { app } = useStore();
const size = computed(() => app.size);

const sizeOptions = ref([
  { label: '默认', value: 'default' },
  { label: '大型', value: 'large' },
  { label: '小型', value: 'small' }
]);

function handleSetSize(size: string) {
  app.setSize(size);
  ElMessage.success('切换布局大小成功');
}
</script>

<style lang="scss" scoped>
.size-select__icon {
  line-height: 50px;
}
</style>
