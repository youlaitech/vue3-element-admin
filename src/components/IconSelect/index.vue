<template>
  <div ref="iconSelectRef" :style="'width:' + width">
    <el-popover :visible="popoverVisible" :width="width" placement="bottom-end">
      <template #reference>
        <el-input
          class="reference"
          v-model="selectedIcon"
          readonly
          placeholder="点击选择图标"
          @click="popoverVisible = !popoverVisible"
        >
          <template #prepend>
            <template
              v-if="selectedIcon && selectedIcon.startsWith('el-icon-')"
            >
              <el-icon>
                <component :is="selectedIcon.replace('el-icon-', '')" />
              </el-icon>
            </template>
            <template v-else>
              <svg-icon :icon-class="selectedIcon" />
            </template>
          </template>
          <template #suffix>
            <el-icon
              :style="{
                transform: popoverVisible ? 'rotate(180deg)' : 'rotate(0)',
                transition: 'transform .5s',
              }"
              @click="popoverVisible = !popoverVisible"
            >
              <ArrowDown />
            </el-icon>
          </template>
        </el-input>
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
              <ul class="icon-container">
                <li
                  v-for="icon in filteredSvgIcons"
                  :key="'svg-' + icon"
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
              <ul class="icon-container">
                <li
                  v-for="icon in filteredEpIcons"
                  :key="icon"
                  class="icon-item"
                  @click="selectIcon(icon)"
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

const iconSelectRef = ref();
const popoverContentRef = ref();

const activeTab = ref("svg"); // 默认激活的Tab
const searchText = ref(""); // 筛选的值
const popoverVisible = ref(false); // 弹窗显示状态

const svgIcons: string[] = []; //  SVG图标集合
const filteredSvgIcons = ref<string[]>([]); // 过滤后的SVG图标名称集合

const epIcons: string[] = Object.keys(ElementPlusIconsVue); // Element Plus图标集合
const filteredEpIcons = ref<string[]>([]); // 过滤后的Element Plus图标名称集合

onMounted(() => {
  loadIcons();
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
 * 选项卡切换
 */
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
      ? svgIcons.filter((iconName) =>
          iconName.toLowerCase().includes(searchText.value.toLowerCase())
        )
      : svgIcons;
  } else {
    // 过滤Element Plus图标逻辑 TODO
    filteredEpIcons.value = searchText.value
      ? epIcons.filter((iconName) =>
          iconName.toLowerCase().includes(searchText.value.toLowerCase())
        )
      : epIcons;
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
</script>

<style scoped lang="scss">
.reference :deep(.el-input__wrapper),
.reference :deep(.el-input__inner) {
  cursor: pointer;
}

.icon-container {
  display: flex;
  flex-wrap: wrap;

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
}
</style>
