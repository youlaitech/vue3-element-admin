<template>
  <div class="drawer-container">
    <h3 class="drawer-title">系统布局配置</h3>
    <div class="drawer-item">
      <span>主题颜色</span>
      <div style="float: right; height: 26px; margin: -3px 8px 0 0">
        <theme-picker @change="themeChange" />
      </div>
    </div>

    <div class="drawer-item">
      <span>开启 Tags-View</span>
      <el-switch v-model="tagsView" class="drawer-switch" />
    </div>

    <div class="drawer-item">
      <span>固定 Header</span>
      <el-switch v-model="fixedHeader" class="drawer-switch" />
    </div>

    <div class="drawer-item">
      <span>侧边栏 Logo</span>
      <el-switch v-model="sidebarLogo" class="drawer-switch" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, toRefs, watch } from 'vue';

import ThemePicker from '@/components/ThemePicker/index.vue';

import useStore from '@/store';

const { setting } = useStore();

const state = reactive({
  fixedHeader: setting.fixedHeader,
  tagsView: setting.tagsView,
  sidebarLogo: setting.sidebarLogo
});

const { fixedHeader, tagsView, sidebarLogo } = toRefs(state);

function themeChange(val: any) {
  setting.changeSetting({ key: 'theme', value: val });
}

watch(
  () => state.fixedHeader,
  value => {
    setting.changeSetting({ key: 'fixedHeader', value: value });
  }
);

watch(
  () => state.tagsView,
  value => {
    setting.changeSetting({ key: 'tagsView', value: value });
  }
);

watch(
  () => state.sidebarLogo,
  value => {
    setting.changeSetting({ key: 'sidebarLogo', value: value });
  }
);
</script>

<style lang="scss" scoped>
.drawer-container {
  padding: 24px;
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;

  .drawer-title {
    margin-bottom: 12px;
    color: rgba(0, 0, 0, 0.85);
    font-size: 14px;
    line-height: 22px;
  }

  .drawer-item {
    color: rgba(0, 0, 0, 0.65);
    font-size: 14px;
    padding: 12px 0;
  }

  .drawer-switch {
    float: right;
  }

  .job-link {
    display: block;
    position: absolute;
    width: 100%;
    left: 0;
    bottom: 0;
  }
}
</style>
