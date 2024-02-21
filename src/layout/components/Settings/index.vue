<template>
  <div class="setting-container">
    <el-text tag="b">项目配置</el-text>
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

    <div class="py-1 flex-x-between">
      <el-text>主题颜色</el-text>
      <el-color-picker
        v-model="settingsStore.themeColor"
        :predefine="[
          '#409EFF',
          '#1890ff',
          '#304156',
          '#212121',
          '#11a983',
          '#13c2c2',
          '#6959CD',
          '#f5222d',
        ]"
        @change="changeThemeColor"
        popper-class="theme-picker-dropdown"
      />
    </div>

    <div class="py-1 flex-x-between">
      <el-text>开启 Tags-View</el-text>
      <el-switch v-model="settingsStore.tagsView" />
    </div>

    <div class="py-1 flex-x-between">
      <span class="text-xs">固定 Header</span>
      <el-switch v-model="settingsStore.fixedHeader" />
    </div>

    <div class="py-1 flex-x-between">
      <span class="text-xs">侧边栏 Logo</span>
      <el-switch v-model="settingsStore.sidebarLogo" />
    </div>

    <div class="py-1 flex-x-between">
      <span class="text-xs">开启水印</span>
      <el-switch v-model="settingsStore.watermarkEnabled" />
    </div>

    <el-divider>导航设置</el-divider>

    <ul class="layout">
      <el-tooltip content="左侧模式" placement="bottom">
        <li
          :class="
            'layout-item layout-left ' +
            (settingsStore.layout === 'left' ? 'is-active' : '')
          "
          @click="changeLayout('left')"
        >
          <div></div>
          <div></div>
        </li>
      </el-tooltip>
      <el-tooltip content="顶部模式" placement="bottom">
        <li
          :class="
            'layout-item layout-top ' +
            (settingsStore.layout === 'top' ? 'is-active' : '')
          "
          @click="changeLayout('top')"
        >
          <div></div>
          <div></div>
        </li>
      </el-tooltip>
      <el-tooltip content="混合模式" placement="bottom">
        <li
          :class="
            'layout-item layout-mix ' +
            (settingsStore.layout === 'mix' ? 'is-active' : '')
          "
          @click="changeLayout('mix')"
        >
          <div></div>
          <div></div>
        </li>
      </el-tooltip>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useSettingsStore, usePermissionStore, useAppStore } from "@/store";
import { Sunny, Moon } from "@element-plus/icons-vue";

const route = useRoute();
const appStore = useAppStore();
const settingsStore = useSettingsStore();
const permissionStore = usePermissionStore();
/**
 * 切换布局
 */
function changeLayout(layout: string) {
  settingsStore.changeSetting({ key: "layout", value: layout });
  if (layout === "mix") {
    route.name && againActiveTop(route.name as string);
  } else if (layout === "top") {
    appStore.openSideBar();
  }
}

function againActiveTop(newVal: string) {
  const parent = findOutermostParent(permissionStore.routes, newVal);
  if (appStore.activeTopMenu !== parent.path) {
    appStore.activeTopMenu(parent.path);
  }
}

/**
 * 切换主题颜色
 */
function changeThemeColor(color: string) {
  window.document.documentElement.style.setProperty(
    "--el-color-primary",
    color
  );
  settingsStore.changeSetting({ key: "themeColor", value: color });
}

/**
 * 切换暗黑模式
 */
const isDark = ref<boolean>(settingsStore.theme === "dark");
const changeTheme = (isDark: any) => {
  useToggle(isDark);
  settingsStore.changeSetting({
    key: "theme",
    value: isDark ? "dark" : "light",
  });
};

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
  window.document.body.setAttribute("layout", settingsStore.layout);
  const theme = settingsStore.theme;
  if (theme == "dark") {
    document.documentElement.classList.add("dark");
  }

  document.documentElement.style.setProperty(
    "--el-color-primary",
    settingsStore.themeColor
  );
});
</script>

<style lang="scss" scoped>
.setting-container {
  padding: 16px;

  .layout {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    width: 100%;
    height: 50px;

    &-item {
      position: relative;
      width: 18%;
      height: 45px;
      overflow: hidden;
      cursor: pointer;
      background: #f0f2f5;
      border-radius: 4px;
    }

    &-item.is-active {
      border: 2px solid var(--el-color-primary);
    }

    &-mix div:nth-child(1) {
      width: 100%;
      height: 30%;
      background: #1b2a47;
      box-shadow: 0 0 1px #888;
    }

    &-mix div:nth-child(2) {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 30%;
      height: 70%;
      background: #1b2a47;
      box-shadow: 0 0 1px #888;
    }

    &-top div:nth-child(1) {
      width: 100%;
      height: 30%;
      background: #1b2a47;
      box-shadow: 0 0 1px #888;
    }

    &-left div:nth-child(1) {
      width: 30%;
      height: 100%;
      background: #1b2a47;
    }

    &-left div:nth-child(2) {
      position: absolute;
      top: 0;
      right: 0;
      width: 70%;
      height: 30%;
      background: #fff;
      box-shadow: 0 0 1px #888;
    }
  }
}

:deep(.theme-picker-dropdown) {
  z-index: 99999 !important;
}
</style>
