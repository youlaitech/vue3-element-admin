<template>
  <el-config-provider :locale="locale" :size="size">
    <!-- 开启水印 -->
    <el-watermark
      :font="{ color: fontColor }"
      :content="showWatermark ? defaultSettings.watermarkContent : ''"
      :z-index="9999"
      class="wh-full"
    >
      <router-view />

      <!-- AI 助手 -->
      <AiAssistant v-if="enableAiAssistant" />
    </el-watermark>
  </el-config-provider>
</template>

<script setup lang="ts">
import { useAppStore, useSettingsStore } from "@/store";
import { defaultSettings } from "@/settings";
import { ThemeMode, ComponentSize } from "@/enums";
import AiAssistant from "@/components/AiAssistant/index.vue";
import { AuthStorage } from "@/utils/auth";

const appStore = useAppStore();
const settingsStore = useSettingsStore();

const locale = computed(() => appStore.locale);
const size = computed(() => appStore.size as ComponentSize);
const showWatermark = computed(() => settingsStore.showWatermark);

// 只有在启用 AI 助手且用户已登录时才显示
const enableAiAssistant = computed(() => {
  const isEnabled = settingsStore.enableAiAssistant;
  const isLoggedIn = !!AuthStorage.getAccessToken();
  return isEnabled && isLoggedIn;
});

// 明亮/暗黑主题水印字体颜色适配
const fontColor = computed(() => {
  return settingsStore.theme === ThemeMode.DARK ? "rgba(255, 255, 255, .15)" : "rgba(0, 0, 0, .15)";
});
</script>
