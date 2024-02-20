<template>
  <el-config-provider :locale="locale" :size="size">
    <!-- 开启水印 -->
    <el-watermark
      v-if="watermarkEnabled"
      :content="watermarkContent"
      class="wh-full"
    >
      <router-view />
    </el-watermark>
    <!-- 关闭水印 -->
    <router-view v-else />
  </el-config-provider>
</template>

<script setup lang="ts">
import { useAppStore, useSettingsStore } from "@/store";
import defaultSettings from "@/settings";

const appStore = useAppStore();
const locale = computed(() => appStore.locale);
const size = computed(() => appStore.size);

const watermarkContent = defaultSettings.watermarkContent;
const settingsStore = useSettingsStore();
const watermarkEnabled = computed(() => settingsStore.watermarkEnabled);
</script>
