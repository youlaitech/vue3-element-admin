<template>
  <div ref="iconSelectRef" :style="'width:' + width" class="relative">
    <el-input
      v-model="inputValue"
      readonly
      placeholder="点击选择图标"
      @click="visible = !visible"
    >
      <template #prepend>
        <svg-icon :icon-class="inputValue" />
      </template>
    </el-input>

    <el-popover
      :visible="visible"
      placement="bottom-end"
      trigger="click"
      :width="width"
    >
      <template #reference>
        <div
          class="cursor-pointer text-[#999] absolute-tr height-[32px] leading-[32px] px-1"
          @click="visible = !visible"
        >
          <i-ep-caret-top v-show="visible" />
          <i-ep-caret-bottom v-show="!visible" />
        </div>
      </template>

      <!-- 下拉选择弹窗 -->
      <div ref="iconSelectDialogRef">
        <el-input
          v-model="filterValue"
          placeholder="搜索图标"
          clearable
          @input="handleFilter"
        />
        <el-divider border-style="dashed" />

        <el-scrollbar height="300px">
          <ul class="flex flex-wrap">
            <li
              v-for="(iconName, index) in filterIconNames"
              :key="index"
              class="p-2 border border-solid border-gray-300 cursor-pointer hover:border-color-[var(--el-color-primary)] hover:text-[var(--el-color-primary)] hover:scale-110 hover:transition-all mt-1 ml-1"
              @click="handleSelect(iconName)"
            >
              <el-tooltip :content="iconName" placement="bottom" effect="light">
                <svg-icon :icon-class="iconName" />
              </el-tooltip>
            </li>
          </ul>
        </el-scrollbar>
      </div>
    </el-popover>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  modelValue: {
    type: String,
    require: false,
    default: "",
  },
  width: {
    type: String,
    require: false,
    default: "500px",
  },
});

const emit = defineEmits(["update:modelValue"]);
const inputValue = toRef(props, "modelValue");
const width = toRef(props, "width");

const visible = ref(false); // 弹窗显示状态

const allIconNames: string[] = []; // 所有的图标名称集合

const filterValue = ref(""); // 筛选的值
const filterIconNames = ref<string[]>([]); // 过滤后的图标名称集合

const iconSelectRef = ref();
const iconSelectDialogRef = ref();

/**
 * icon 筛选
 */
function handleFilter() {
  if (filterValue.value) {
    filterIconNames.value = allIconNames.filter((iconName) =>
      iconName.includes(filterValue.value)
    );
  } else {
    filterIconNames.value = allIconNames;
  }
}

/**
 * icon 选择
 */
function handleSelect(iconName: string) {
  emit("update:modelValue", iconName);
  visible.value = false;
}

/**
 * 点击容器外的区域关闭弹窗 VueUse onClickOutside
 */
onClickOutside(iconSelectRef, () => (visible.value = false), {
  ignore: [iconSelectDialogRef],
});

/**
 * icon 加载
 */
function loadIcons() {
  const icons = import.meta.glob("../../assets/icons/*.svg");
  for (const icon in icons) {
    const iconName = icon.split("assets/icons/")[1].split(".svg")[0];
    allIconNames.push(iconName);
  }
  filterIconNames.value = allIconNames;
}

onMounted(() => {
  loadIcons();
});
</script>

<style scoped lang="scss"></style>
