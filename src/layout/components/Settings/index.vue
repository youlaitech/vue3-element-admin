<script setup lang="ts">
import { useSettingsStore } from "@/store/modules/settings";
import { usePermissionStore } from "@/store/modules/permission";
import { useAppStore } from "@/store/modules/app";
import IconEpSunny from "~icons/ep/sunny";
import IconEpMoon from "~icons/ep/moon";
import { useRoute } from "vue-router";
import defaultSettings from "@/settings";

const route = useRoute();

const settingsStore = useSettingsStore();
const permissionStore = usePermissionStore();
const appStore = useAppStore();

const isDark = useDark();
const toggleDark = () => useToggle(isDark);

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
const againActiveTop = (newVal: string) => {
  const parent = findOutermostParent(permissionStore.routes, newVal);
  if (appStore.activeTopMenu !== parent.path) {
    appStore.changeTopActive(parent.path);
  }
};

/**
 * 切换布局
 */
function changeLayout(layout: string) {
  settingsStore.changeSetting({ key: "layout", value: layout });
  window.document.body.setAttribute("layout", settingsStore.layout);
  if (layout === "mix") {
    route.name && againActiveTop(route.name as string);
  }
}

// 主题颜色
const themeColors = ref<string[]>([
  "#409EFF",
  "#304156",
  "#11a983",
  "#13c2c2",
  "#6959CD",
  "#f5222d",
]);

/**
 * 切换主题颜色
 */
function changeThemeColor(color: string) {
  document.documentElement.style.setProperty("--el-color-primary", color);
  // settingsStore.changeSetting({ key: "layout", value: color });
}

onMounted(() => {
  window.document.body.setAttribute("layout", settingsStore.layout);
  const theme =
    localStorage.getItem("vueuse-color-scheme") || defaultSettings.theme;
  localStorage.setItem("vueuse-color-scheme", theme);
});
</script>

<template>
  <div class="settings-container">
    <h3 class="text-base font-bold">项目配置</h3>
    <el-divider>主题</el-divider>

    <div class="flex justify-center" @click.stop>
      <el-switch
        v-model="isDark"
        inline-prompt
        :active-icon="IconEpMoon"
        :inactive-icon="IconEpSunny"
        active-color="var(--el-fill-color-dark)"
        inactive-color="var(--el-color-primary)"
        @change="toggleDark"
      />
    </div>

    <el-divider>界面设置</el-divider>
    <div class="py-[8px] flex justify-between">
      <span class="text-xs">开启 Tags-View</span>
      <el-switch v-model="settingsStore.tagsView" />
    </div>

    <div class="py-[8px] flex justify-between">
      <span class="text-xs">固定 Header</span>
      <el-switch v-model="settingsStore.fixedHeader" />
    </div>

    <div class="py-[8px] flex justify-between">
      <span class="text-xs">侧边栏 Logo</span>
      <el-switch v-model="settingsStore.sidebarLogo" />
    </div>

    <el-divider>主题颜色</el-divider>

    <ul class="w-full space-x-2 flex justify-center py-2">
      <li
        v-for="(color, index) in themeColors"
        :key="index"
        class="inline-block w-[30px] h-[30px] cursor-pointer"
        :style="{ background: color }"
        @click="changeThemeColor(color)"
      ></li>
    </ul>

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

<style lang="scss" scoped>
.settings-container {
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
</style>
