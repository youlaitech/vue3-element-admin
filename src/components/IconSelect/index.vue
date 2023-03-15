<script setup lang="ts">
const props = defineProps({
  modelValue: {
    type: String,
    require: false
  },
  /**
   * 图标选择器宽度
   */
  width: {
    type: String,
    require: false,
    default: '400px'
  }
});

const emit = defineEmits(['update:modelValue']);
const visible = ref(false);
const inputValue = toRef(props, 'modelValue');
const width = toRef(props, 'width');
const iconNames: string[] = [];
const filterIconNames = ref<string[]>([]);

const filterValue = ref('');

function loadIcons() {
  const icons = import.meta.glob('../../assets/icons/*.svg');
  for (const icon in icons) {
    const iconName = icon.split('assets/icons/')[1].split('.svg')[0];
    iconNames.push(iconName);
  }
  filterIconNames.value = iconNames;
}

/**
 * 筛选图标
 */
function handleIconFilter() {
  if (filterValue.value) {
    filterIconNames.value = iconNames.filter(iconName =>
      iconName.includes(filterValue.value)
    );
  } else {
    filterIconNames.value = iconNames;
  }
}

/**
 * 选择图标
 *
 * @param iconName 选择的图标名称
 */
function onIconSelect(iconName: string) {
  emit('update:modelValue', iconName);
  visible.value = false;
}

onMounted(() => {
  loadIcons();
});
</script>

<template>
  <div class="relative" :style="{ width: width }">
    <el-input
      v-model="inputValue"
      readonly
      @click="visible = !visible"
      placeholder="点击选择图标"
    >
      <template #prepend>
        <svg-icon :icon-class="inputValue" />
      </template>
    </el-input>

    <el-popover
      shadow="none"
      :visible="visible"
      placement="bottom-end"
      trigger="click"
      :width="400"
    >
      <template #reference>
        <div
          @click="visible = !visible"
          class="cursor-pointer text-[#999] absolute right-[10px] top-0 height-[32px] leading-[32px]"
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
        @input="handleIconFilter"
      />
      <el-divider border-style="dashed" />

      <el-scrollbar height="300px">
        <ul class="icon-list">
          <li
            class="icon-item"
            v-for="(iconName, index) in filterIconNames"
            :key="index"
            @click="onIconSelect(iconName)"
          >
            <el-tooltip :content="iconName" placement="bottom" effect="light">
              <svg-icon
                color="var(--el-text-color-regular)"
                :icon-class="iconName"
              />
            </el-tooltip>
          </li>
        </ul>
      </el-scrollbar>
    </el-popover>
  </div>
</template>

<style scoped lang="scss">
.el-divider--horizontal {
  margin: 10px auto !important;
}
.icon-list {
  display: flex;
  flex-wrap: wrap;
  padding-left: 10px;
  margin-top: 10px;

  .icon-item {
    cursor: pointer;
    width: 10%;
    margin: 0 10px 10px 0;
    padding: 5px;
    display: flex;
    flex-direction: column;
    justify-items: center;
    align-items: center;
    border: 1px solid #ccc;
    &:hover {
      border-color: var(--el-color-primary);
      color: var(--el-color-primary);
      transition: all 0.2s;
      transform: scaleX(1.1);
    }
  }
}
</style>
