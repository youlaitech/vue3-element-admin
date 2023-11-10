<script lang="ts" setup>
import { computed, watchEffect } from "vue";
import { useWindowSize } from "@vueuse/core";
import { AppMain, Navbar, Settings, TagsView } from "./components/index";
import RightPanel from "@/components/RightPanel/index.vue";

import { useAppStore } from "@/store/modules/app";
import { useSettingsStore } from "@/store/modules/settings";
const { width } = useWindowSize();

/**
 * 响应式布局容器固定宽度
 *
 * 大屏（>=1200px）
 * 中屏（>=992px）
 * 小屏（>=768px）
 */
const WIDTH = 992;

const appStore = useAppStore();
const settingsStore = useSettingsStore();

const fixedHeader = computed(() => settingsStore.fixedHeader);
const showTagsView = computed(() => settingsStore.tagsView);
const showSettings = computed(() => settingsStore.showSettings);
const layout = computed(() => settingsStore.layout);
const device = computed(() => appStore.device);

watchEffect(() => {
  if (width.value < WIDTH) {
    appStore.toggleDevice("mobile");
    appStore.closeSideBar(true);
  } else {
    appStore.toggleDevice("desktop");

    if (width.value >= 1200) {
      //大屏
      appStore.openSideBar(true);
    } else {
      appStore.closeSideBar(true);
    }
  }
});
</script>
<template>
  <div :class="{ hasTagsView: showTagsView }" class="main-container">
    <div :class="{ 'fixed-header': fixedHeader, device: device }">
      <navbar v-if="layout === 'left'" />
      <tags-view v-if="showTagsView" />
    </div>
    <!--主页面-->
    <app-main />
    <!-- 设置面板 -->
    <RightPanel v-if="showSettings">
      <settings />
    </RightPanel>
  </div>
</template>

<style lang="scss" scoped>
.fixed-header {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 9;
  width: calc(100% - #{$sideBarWidth});
  transition: width 0.28s;
}

.hideSidebar .fixed-header {
  width: calc(100% - 54px);
}

.hideSidebar.mobile .fixed-header {
  width: 100%;
}

.isTop .fixed-header {
  width: 100% !important;
}

.isMix,
.isTop {
  .fixed-header {
    top: 50px;
  }
}
</style>
