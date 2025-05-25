<template>
  <el-dropdown trigger="click" @command="handleDarkChange">
    <el-icon :size="20">
      <component :is="settingsStore.theme === ThemeMode.DARK ? Moon : Sunny" />
    </el-icon>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          v-for="item in theneList"
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
import { useSettingsStore } from "@/store";
import { ThemeMode } from "@/enums";
import { Moon, Sunny } from "@element-plus/icons-vue";

const { t } = useI18n();
const settingsStore = useSettingsStore();

const theneList = [
  { label: t("login.light"), value: ThemeMode.LIGHT, component: Sunny },
  { label: t("login.dark"), value: ThemeMode.DARK, component: Moon },
];

const handleDarkChange = (theme: ThemeMode) => {
  settingsStore.updateTheme(theme);
};
</script>
