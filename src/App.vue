<template>
  <el-config-provider :locale="locale" :size="size">
    <!-- 开启水�?-->
    <el-watermark
      :font="{ color: fontColor }"
      :content="showWatermark ? watermarkContent : ''"
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
import { useAppStore, useSettingsStore, useUserStore } from "@/store";
import { appConfig } from "@/settings";
import { ThemeMode, ComponentSize } from "@/enums";
import AiAssistant from "@/components/AiAssistant/index.vue";

const appStore = useAppStore();
const settingsStore = useSettingsStore();
const userStore = useUserStore();

const locale = computed(() => appStore.locale);
const size = computed(() => appStore.size as ComponentSize);
const showWatermark = computed(() => settingsStore.showWatermark);
const watermarkContent = appConfig.name;

// 只有在启�?AI 助手且用户已登录时才显示
// 使用 userInfo 作为响应式依赖，当用户退出登录时会自动更�?
const enableAiAssistant = computed(() => {
  const isEnabled = settingsStore.enableAiAssistant;
  const isLoggedIn = userStore.userInfo && Object.keys(userStore.userInfo).length > 0;
  return isEnabled && isLoggedIn;
});

// 明亮/暗黑主题水印字体颜色适配
const fontColor = computed(() => {
  return settingsStore.theme === ThemeMode.DARK ? "rgba(255, 255, 255, .15)" : "rgba(0, 0, 0, .15)";
});
</script>
