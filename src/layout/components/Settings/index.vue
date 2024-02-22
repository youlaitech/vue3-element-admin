<template>
  <div
    :class="['settings-button', { show: settingsVisible }]"
    @click="settingsVisible = !settingsVisible"
  >
    <i-ep-close v-show="settingsVisible" />
    <i-ep-setting v-show="!settingsVisible" />
  </div>

  <el-drawer v-model="settingsVisible" size="300" title="项目配置">
    <el-divider>主题设置</el-divider>

    <div class="flex-center">
      <el-switch
        v-model="isDark"
        :active-icon="Moon"
        :inactive-icon="Sunny"
        @change="changeTheme"
      />
    </div>

    <el-divider>界面设置</el-divider>

    <div class="settings-option">
      <el-text>主题颜色</el-text>
      <ThemeColorPicker
        v-model="settingsStore.themeColor"
        @update:model-value="changeThemeColor"
      />
    </div>

    <div class="settings-option">
      <el-text>开启 Tags-View</el-text>
      <el-switch v-model="settingsStore.tagsView" />
    </div>

    <div class="settings-option">
      <span class="text-xs">固定 Header</span>
      <el-switch v-model="settingsStore.fixedHeader" />
    </div>

    <div class="settings-option">
      <span class="text-xs">侧边栏 Logo</span>
      <el-switch v-model="settingsStore.sidebarLogo" />
    </div>

    <div class="settings-option">
      <span class="text-xs">开启水印</span>
      <el-switch v-model="settingsStore.watermarkEnabled" />
    </div>

    <el-divider>导航设置</el-divider>

    <LayoutSelect
      v-model="settingsStore.layout"
      @update:model-value="changeLayout"
    />
  </el-drawer>
</template>

<script setup lang="ts">
import { useSettingsStore, usePermissionStore, useAppStore } from "@/store";
import { Sunny, Moon } from "@element-plus/icons-vue";
import { LayoutEnum } from "@/enums/LayoutEnum";
import { ThemeEnum } from "@/enums/ThemeEnum";
import { genMixColor } from "@/utils/color";

const route = useRoute();
const appStore = useAppStore();
const settingsStore = useSettingsStore();
const permissionStore = usePermissionStore();

const settingsVisible = ref(false);

/**
 * 切换主题颜色
 */
function changeThemeColor(color: string) {
  settingsStore.changeThemeColor(color);

  const { DEFAULT, dark, light } = genMixColor(color);
  setStyleProperty(`--el-color-primary`, DEFAULT);
  setStyleProperty(`--el-color-primary-dark-2`, dark[2]);
  setStyleProperty(`--el-color-primary-light-3`, light[3]);
  setStyleProperty(`--el-color-primary-light-5`, light[5]);
  setStyleProperty(`--el-color-primary-light-7`, light[7]);
  setStyleProperty(`--el-color-primary-light-8`, light[8]);
  setStyleProperty(`--el-color-primary-light-9`, light[9]);
}

function setStyleProperty(propName: string, value: string) {
  document.documentElement.style.setProperty(propName, value);
}

/**
 * 切换主题
 */
const isDark = ref<boolean>(settingsStore.theme === ThemeEnum.DARK);
const changeTheme = (isDark: any) => {
  useToggle(isDark);
  const theme = isDark ? ThemeEnum.DARK : ThemeEnum.LIGHT;
  settingsStore.changeTheme(theme);
  document.documentElement.classList.toggle("dark", theme === ThemeEnum.DARK);
};

/**
 * 切换布局
 */
function changeLayout(layout: string) {
  settingsStore.changeLayout(layout);
  if (layout === LayoutEnum.MIX) {
    route.name && againActiveTop(route.name as string);
  } else if (layout === LayoutEnum.TOP) {
    appStore.openSideBar();
  }
}

function againActiveTop(newVal: string) {
  const parent = findOutermostParent(permissionStore.routes, newVal);
  if (appStore.activeTopMenu !== parent.path) {
    appStore.activeTopMenu(parent.path);
  }
}

function findOutermostParent(tree: any[], findName: string) {
  let parentMap: any = {};

  function buildParentMap(node: any, parent: any) {
    parentMap[node.name] = parent;

    if (node.children) {
      for (let i = 0; i < node.children.length; i++) {
        buildParentMap(node.children[i], node);
      }
    }
  }

  for (let i = 0; i < tree.length; i++) {
    buildParentMap(tree[i], null);
  }

  let currentNode = parentMap[findName];
  while (currentNode) {
    if (!parentMap[currentNode.name]) {
      return currentNode;
    }
    currentNode = parentMap[currentNode.name];
  }

  return null;
}

onMounted(() => {
  changeTheme(settingsStore.theme == ThemeEnum.DARK); // 初始化主题
  changeThemeColor(settingsStore.themeColor); // 初始化主题颜色
});
</script>

<style lang="scss" scoped>
.settings-button {
  position: fixed;
  top: 250px;
  right: 0;
  z-index: 2001;
  width: 40px;
  height: 40px;
  color: var(--el-color-white);
  cursor: pointer;
  background-color: var(--el-color-primary);
  border-radius: 6px 0 0 6px;

  @apply flex-center;

  &.show {
    right: 300px;
    transition: all 0.25s cubic-bezier(0.7, 0.3, 0.1, 1);
  }
}

.settings-option {
  @apply py-1 flex-x-between;
}
</style>
@/utils/color
