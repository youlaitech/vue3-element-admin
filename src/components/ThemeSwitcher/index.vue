<template>
  <el-dropdown trigger="click" @command="handleThemeChange">
    <el-icon :size="20">
      <component :is="currentThemeIcon" />
    </el-icon>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          v-for="item in themeList"
          :key="item.value"
          :command="item.value"
          :disabled="settingsStore.theme === item.value"
        >
          <el-icon>
            <component :is="item.component" />
          </el-icon>
          {{ item.label }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>
<script setup lang="ts">
import { useSettingsStore } from "@/stores";
import { ThemeMode } from "@/enums";
import { Moon, Sunny, Monitor } from "@element-plus/icons-vue";

const { t } = useI18n();
const settingsStore = useSettingsStore();

const themeList = [
  { label: t("login.light"), value: ThemeMode.LIGHT, component: Sunny },
  { label: t("login.dark"), value: ThemeMode.DARK, component: Moon },
  { label: t("login.auto"), value: ThemeMode.AUTO, component: Monitor },
];

// 自动模式跟随系统，故显示显示器图标；否则按实际生效主题显示太阳/月亮
const currentThemeIcon = computed(() => {
  if (settingsStore.theme === ThemeMode.AUTO) {
    return Monitor;
  }

  return settingsStore.resolvedTheme === ThemeMode.DARK ? Moon : Sunny;
});

/**
 * 切换主题模式
 */
const handleThemeChange = (theme: ThemeMode) => {
  settingsStore.theme = theme;
};
</script>
