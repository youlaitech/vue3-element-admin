<script setup lang="ts">
const props = defineProps({
  modelValue: {
    type: String,
    require: false
  }
});

const emit = defineEmits(['update:modelValue']);
const inputValue = toRef(props, 'modelValue');

const visible = ref(false); // 弹窗显示状态

const iconNames: string[] = []; // 所有的图标名称集合

const filterValue = ref(''); // 筛选的值
const filterIconNames = ref<string[]>([]); // 过滤后的图标名称集合

const iconSelectorRef = ref(null);
/**
 * icon 加载
 */
function loadIcons() {
  const icons = import.meta.glob('../../assets/icons/*.svg');
  for (const icon in icons) {
    const iconName = icon.split('assets/icons/')[1].split('.svg')[0];
    iconNames.push(iconName);
  }
  filterIconNames.value = iconNames;
}

/**
 * icon 筛选
 */
function handleFilter() {
  if (filterValue.value) {
    filterIconNames.value = iconNames.filter(iconName =>
      iconName.includes(filterValue.value)
    );
  } else {
    filterIconNames.value = iconNames;
  }
}

/**
 * icon 选择
 */
function handleSelect(iconName: string) {
  emit('update:modelValue', iconName);
  visible.value = false;
}

/**
 * 点击容器外的区域关闭弹窗 VueUse onClickOutside
 */
onClickOutside(iconSelectorRef, () => (visible.value = false));

onMounted(() => {
  loadIcons();
});
</script>

<template>
  <div class="iconselect-container" ref="iconSelectorRef">
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
      width="400"
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
        @input="handleFilter"
      />
      <el-divider border-style="dashed" />

      <el-scrollbar height="300px">
        <ul class="icon-list">
          <li
            class="icon-item"
            v-for="(iconName, index) in filterIconNames"
            :key="index"
            @click="handleSelect(iconName)"
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
.iconselect-container {
  position: relative;
  width: 400px;
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
