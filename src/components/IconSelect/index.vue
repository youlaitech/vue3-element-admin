<script setup lang="ts">
const props = defineProps({
  modelValue: {
    type: String,
    require: false
  }
});

const emit = defineEmits(['update:modelValue']);
const visible = ref(false);
const inputValue = toRef(props, 'modelValue');
const iconList = ref<string[]>([]);

const filterValue = ref('');

const icon = ref('perm');

function loadIcons() {
  const modules = import.meta.glob('../../assets/icons/*.svg');
  for (const path in modules) {
    const icon = path.split('assets/icons/')[1].split('.svg')[0];
    iconList.value.push(icon);
  }
}

onMounted(() => {
  loadIcons();
});
</script>

<template>
  <div class="w-[400px] relative">
    <el-input v-model="inputValue" readonly>
      <template #prepend> <svg-icon :iconName="icon"></svg-icon> </template>
    </el-input>

    <el-popover
      shadow="none"
      :visible="visible"
      placement="bottom-end"
      trigger="click"
    >
      <template #reference>
        <div
          @click="visible = !visible"
          class="cursor-pointer text-[#999] absolute right-[10px] top-0"
        >
          <i-ep-caret-top v-show="visible"></i-ep-caret-top>
          <i-ep-caret-bottom v-show="!visible"></i-ep-caret-bottom>
        </div>
      </template>

      <!-- 下拉选择弹窗 -->
      <el-input
        class="p-2"
        v-model="filterValue"
        placeholder="搜索图标"
        clearable
      />
      <el-divider border-style="dashed" />

      <el-scrollbar height="300px">
        <ul class="icon-list">
          <li class="icon-item" v-for="(item, index) in iconList" :key="index">
            <svg-icon color="#999" :icon-name="item" />
            <span>{{ item }}</span>
          </li>
        </ul>
      </el-scrollbar>
    </el-popover>
  </div>
</template>

<style scoped lang="scss">
.icon-list {
  .icon-item {
    &:hover {
      border-color: var(--el-color-primary);
      color: var(--el-color-primary);
      transition: all 0.4s;
      transform: scaleX(1.05);
    }
  }
}
</style>
