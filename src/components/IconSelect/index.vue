<template>
  <div ref="iconSelectRef" :style="'width:' + width" class="relative">
    <el-input
      v-model="selectedIcon"
      readonly
      placeholder="点击选择图标"
      @click="popoverVisible = !popoverVisible"
    >
      <template #prepend>
        <template v-if="selectedIcon && selectedIcon.startsWith('el-icon-')">
          <el-icon>
            <component :is="renderIcon(selectedIcon.replace('el-icon-', ''))" />
          </el-icon>
        </template>
        <template v-else>
          <svg-icon :icon-class="selectedIcon" />
        </template>
      </template>
    </el-input>

    <el-popover
      :popoverVisible="popoverVisible"
      placement="bottom-end"
      trigger="click"
      :width="width"
    >
      <template #reference>
        <div
          class="cursor-pointer text-[#999] absolute-rt height-[32px] leading-[32px] px-1"
          @click="popoverVisible = !popoverVisible"
        >
          <i-ep-caret-top v-show="popoverVisible" />
          <i-ep-caret-bottom v-show="!popoverVisible" />
        </div>
      </template>

      <!-- 下拉选择弹窗 -->
      <div ref="popoverContentRef">
        <el-input
          v-model="searchText"
          placeholder="搜索图标"
          clearable
          @input="filterIcons"
        />
        <el-tabs v-model="activeTab" @tab-click="handleTabClick">
          <el-tab-pane label="SVG 图标" name="svg">
            <el-scrollbar height="300px">
              <ul class="flex flex-wrap">
                <li
                  v-for="(icon, index) in filteredSvgIcons"
                  :key="'svg-' + index"
                  class="icon-item"
                  @click="selectIcon(icon)"
                >
                  <el-tooltip :content="icon" placement="bottom" effect="light">
                    <svg-icon :icon-class="icon" />
                  </el-tooltip>
                </li>
              </ul>
            </el-scrollbar>
          </el-tab-pane>
          <el-tab-pane label="Element 图标" name="element">
            <el-scrollbar height="300px">
              <ul class="flex flex-wrap">
                <li
                  v-for="(icon, name) in elementIcons"
                  :key="name"
                  class="icon-item"
                  @click="selectIcon(name)"
                >
                  <el-icon>
                    <component :is="icon" />
                  </el-icon>
                </li>
              </ul>
            </el-scrollbar>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-popover>
  </div>
</template>

<script setup lang="ts">
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import { ElTabPane } from "element-plus";

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
const selectedIcon = toRef(props, "modelValue");
const width = toRef(props, "width");

const iconSelectRef = ref();
const popoverContentRef = ref();

const activeTab = ref("svg"); // 默认激活的Tab
const searchText = ref(""); // 筛选的值
const popoverVisible = ref(false); // 弹窗显示状态

const svgIcons: string[] = []; //  SVG图标集合
const filteredSvgIcons = ref<string[]>([]); // 过滤后的SVG图标名称集合

const elementIcons = ref(ElementPlusIconsVue); // Element Plus图标集合

function handleTabClick(tabPane: any) {
  activeTab.value = tabPane.name;
  filterIcons();
}

/**
 * icon 筛选
 */
function filterIcons() {
  if (activeTab.value === "svg") {
    // 过滤SVG图标逻辑
    filteredSvgIcons.value = searchText.value
      ? svgIcons.filter((iconName) => iconName.includes(searchText.value))
      : svgIcons;
  } else {
    // 过滤Element Plus图标逻辑 TODO
  }
}

/**
 * 选择图标
 */
function selectIcon(iconName: string) {
  if (activeTab.value === "element") {
    iconName = "el-icon-" + iconName;
  }
  emit("update:modelValue", iconName);
  popoverVisible.value = false;
}

/**
 * 点击容器外的区域关闭弹窗 VueUse onClickOutside
 */
onClickOutside(iconSelectRef, () => (popoverVisible.value = false), {
  ignore: [popoverContentRef],
});

/**
 * icon 加载
 */
function loadIcons() {
  const icons = import.meta.glob("../../assets/icons/*.svg");
  for (const path in icons) {
    const iconName = path.replace(/.*\/(.*)\.svg$/, "$1");
    svgIcons.push(iconName);
  }
  filteredSvgIcons.value = svgIcons;
}

/**
 * 渲染图标组件
 */
type IconNames = keyof typeof ElementPlusIconsVue;
const renderIcon = (iconName: string) => {
  const iconComponent = ElementPlusIconsVue[iconName as IconNames];
  if (iconComponent && iconComponent.name) {
    return h(resolveComponent(iconComponent.name));
  }
  return null;
};

onMounted(() => {
  loadIcons();
});
</script>

<style scoped lang="scss">
.icon-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  margin: 4px;
  cursor: pointer;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  transition: all 0.3s;
}

.icon-item:hover {
  border-color: #409eff;
  scale: 1.2;
}
</style>
