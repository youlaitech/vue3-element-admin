<template>
  <el-drawer
    v-model="drawerVisible"
    size="380"
    :title="t('settings.project')"
    :before-close="handleCloseDrawer"
    class="settings-drawer"
  >
    <div class="settings-content">
      <section class="config-section">
        <el-divider>{{ t("settings.theme") }}</el-divider>

        <div class="flex-center">
          <el-radio-group v-model="themeMode" class="theme-mode-group">
            <el-radio-button :value="ThemeMode.LIGHT">
              {{ t("login.light") }}
            </el-radio-button>
            <el-radio-button :value="ThemeMode.DARK">
              {{ t("login.dark") }}
            </el-radio-button>
            <el-radio-button :value="ThemeMode.AUTO">
              {{ t("login.auto") }}
            </el-radio-button>
          </el-radio-group>
        </div>

        <div class="config-block config-block--tight">
          <div class="config-item__header">
            <span class="text-xs">{{ t("settings.themePalette") }}</span>
            <button
              type="button"
              :class="['custom-color-trigger', { 'is-open': isCustomColorsOpen }]"
              @click="toggleCustomColors"
            >
              <span>{{ t("settings.customColors") }}</span>
              <el-icon><ArrowRight /></el-icon>
            </button>
          </div>

          <div class="palette-strip">
            <el-tooltip
              v-for="item in themePalettePresets"
              :key="item.id"
              :content="getPaletteDescription(item)"
              placement="bottom"
            >
              <button
                type="button"
                :aria-label="getPaletteName(item)"
                :class="['palette-option', { 'is-active': settingsStore.themePalette === item.id }]"
                @click="settingsStore.applyThemePalette(item.id)"
              >
                <span class="palette-option__name">{{ getPaletteName(item) }}</span>
                <span class="palette-option__colors">
                  <span
                    v-for="color in getPaletteColors(item.colors)"
                    :key="color"
                    class="palette-option__dot"
                    :style="{ backgroundColor: color }"
                  />
                </span>
              </button>
            </el-tooltip>
          </div>
        </div>

        <el-collapse-transition>
          <div v-show="isCustomColorsOpen" class="custom-colors-panel">
            <div class="custom-colors-panel__header">
              <span>{{ t("settings.customColors") }}</span>
              <span>{{ activePaletteName }}</span>
            </div>

            <div class="custom-color-list">
              <div v-for="item in colorOptions" :key="item.name" class="custom-color-row">
                <span class="custom-color-row__label">{{ getColorLabel(item.name) }}</span>
                <span class="custom-color-row__value">
                  {{ settingsStore.themeColors[item.name] }}
                </span>
                <el-color-picker
                  :model-value="settingsStore.themeColors[item.name]"
                  :predefine="colorPresets[item.name]"
                  popper-class="theme-picker-dropdown"
                  @update:model-value="(color) => handleThemeColorChange(item.name, color)"
                />
              </div>
            </div>
          </div>
        </el-collapse-transition>
      </section>

      <section class="config-section">
        <el-divider>{{ t("settings.navigation") }}</el-divider>

        <div class="layout-select">
          <div class="layout-grid">
            <el-tooltip
              v-for="item in layoutOptions"
              :key="item.value"
              :content="item.label"
              placement="bottom"
            >
              <div
                role="button"
                tabindex="0"
                :class="[
                  'layout-item',
                  item.className,
                  {
                    'is-active': settingsStore.layout === item.value,
                  },
                ]"
                @click="handleLayoutChange(item.value)"
                @keydown.enter.space="handleLayoutChange(item.value)"
              >
                <div class="layout-preview">
                  <div v-if="item.value !== LayoutMode.LEFT" class="layout-header"></div>
                  <div v-if="item.value !== LayoutMode.TOP" class="layout-sidebar"></div>
                  <div class="layout-main"></div>
                </div>
                <div class="layout-name">{{ item.label }}</div>
                <div v-if="settingsStore.layout === item.value" class="layout-check">
                  <el-icon><Check /></el-icon>
                </div>
              </div>
            </el-tooltip>
          </div>
        </div>
      </section>

      <section class="config-section">
        <el-divider>{{ t("settings.interface") }}</el-divider>

        <div class="config-item flex-x-between">
          <span class="text-xs">{{ t("settings.showTagsView") }}</span>
          <el-switch v-model="settingsStore.showTagsView" />
        </div>

        <div class="config-item flex-x-between">
          <span class="text-xs">{{ t("settings.showAppLogo") }}</span>
          <el-switch v-model="settingsStore.showAppLogo" />
        </div>

        <div class="config-item flex-x-between">
          <span class="text-xs">{{ t("settings.showWatermark") }}</span>
          <el-switch v-model="settingsStore.showWatermark" />
        </div>

        <div class="config-item flex-x-between">
          <span class="text-xs">{{ t("settings.pageSwitchingAnimation") }}</span>
          <el-select v-model="settingsStore.pageSwitchingAnimation" style="width: 150px">
            <el-option
              v-for="(item, key) in pageSwitchingAnimationOptions"
              :key
              :label="t(`settings.${item.value}`)"
              :value="item.value"
            />
          </el-select>
        </div>

        <div class="config-item flex-x-between">
          <span class="text-xs">灰色模式</span>
          <el-switch v-model="settingsStore.grayMode" />
        </div>

        <div class="config-item flex-x-between">
          <span class="text-xs">色弱模式</span>
          <el-switch v-model="settingsStore.colorWeak" />
        </div>

        <div
          v-if="settingsStore.resolvedTheme !== ThemeMode.DARK"
          class="config-item flex-x-between"
        >
          <span class="text-xs">{{ t("settings.sidebarColorScheme") }}</span>
          <el-radio-group v-model="sidebarColor" @change="changeSidebarColor">
            <el-radio :value="SidebarColor.CLASSIC_BLUE">
              {{ t("settings.classicBlue") }}
            </el-radio>
            <el-radio :value="SidebarColor.MINIMAL_WHITE">
              {{ t("settings.minimalWhite") }}
            </el-radio>
          </el-radio-group>
        </div>
      </section>
    </div>

    <template #footer>
      <div class="action-buttons">
        <el-tooltip content="复制当前 defaults 片段，方便覆盖到 src/settings.ts" placement="top">
          <el-button
            type="primary"
            size="default"
            :icon="copyIcon"
            :loading="copyLoading"
            @click="handleCopySettings"
          >
            {{ copyLoading ? "复制中..." : t("settings.copyConfig") }}
          </el-button>
        </el-tooltip>
        <el-tooltip content="重置将恢复所有设置为默认值" placement="top">
          <el-button
            type="warning"
            size="default"
            :icon="resetIcon"
            :loading="resetLoading"
            @click="handleResetSettings"
          >
            {{ resetLoading ? "重置中..." : t("settings.resetConfig") }}
          </el-button>
        </el-tooltip>
      </div>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { ArrowRight, Check, DocumentCopy, RefreshLeft } from "@element-plus/icons-vue";
import { LayoutMode, PageSwitchingAnimationOptions, SidebarColor, ThemeMode } from "@/enums";
import { useSettingsStore } from "@/stores";
import { themeColorNames, themePalettePresets } from "@/settings";
import type { ThemeColorMap, ThemeColorName, ThemePalettePreset } from "@/settings";

const { t } = useI18n();

const pageSwitchingAnimationOptions = PageSwitchingAnimationOptions;

const copyIcon = markRaw(DocumentCopy);
const resetIcon = markRaw(RefreshLeft);

const copyLoading = ref(false);
const resetLoading = ref(false);

interface LayoutOption {
  value: LayoutMode;
  label: string;
  className: string;
}

interface ColorOption {
  name: ThemeColorName;
}

const layoutOptions: LayoutOption[] = [
  { value: LayoutMode.LEFT, label: t("settings.leftLayout"), className: "left" },
  { value: LayoutMode.TOP, label: t("settings.topLayout"), className: "top" },
  { value: LayoutMode.MIX, label: t("settings.mixLayout"), className: "mix" },
];

const colorOptions: ColorOption[] = themeColorNames.map((name) => ({ name }));

const colorPresets: Record<ThemeColorName, string[]> = {
  primary: ["#165DFF", "#1677FF", "#409EFF", "#FF7D00", "#14C9C9", "#EB2F96", "#722ED1"],
  success: ["#00B42A", "#23C343", "#67C23A", "#22C55E"],
  warning: ["#FF7D00", "#FF9A2E", "#E6A23C", "#FAAD14"],
  danger: ["#F53F3F", "#F76560", "#F56C6C", "#FF4D4F"],
  info: ["#86909C", "#909399", "#788896", "#6B7785"],
};

const paletteI18nKeys: Record<string, string> = {
  arco: "arco",
  "ant-design": "antDesign",
  "element-plus": "elementPlus",
};

const settingsStore = useSettingsStore();

const isCustomColorsOpen = ref(false);
const sidebarColor = ref(settingsStore.sidebarColorScheme);
const themeMode = computed({
  get: () => settingsStore.theme,
  set: (value: ThemeMode) => {
    settingsStore.theme = value;
  },
});

const drawerVisible = computed({
  get: () => settingsStore.settingsVisible,
  set: (value) => (settingsStore.settingsVisible = value),
});

const getPaletteColors = (colors: ThemeColorMap) => colorOptions.map((item) => colors[item.name]);

const getPaletteName = (palette: ThemePalettePreset) => {
  const key = paletteI18nKeys[palette.id];
  return key ? t(`settings.themePalettes.${key}.name`) : palette.name;
};

const getPaletteDescription = (palette: ThemePalettePreset) => {
  const key = paletteI18nKeys[palette.id];
  return key ? t(`settings.themePalettes.${key}.description`) : palette.description;
};

const getColorLabel = (name: ThemeColorName) => t(`settings.themeColorNames.${name}`);

const activePaletteName = computed(() =>
  settingsStore.activeThemePalette
    ? getPaletteName(settingsStore.activeThemePalette)
    : t("settings.customPalette")
);

const toggleCustomColors = () => {
  isCustomColorsOpen.value = !isCustomColorsOpen.value;
};

const handleThemeColorChange = (name: ThemeColorName, color: string | null) => {
  if (!color) return;
  settingsStore.updateThemeColor(name, color);
};

const changeSidebarColor = (val: SidebarColor) => {
  settingsStore.sidebarColorScheme = val;
};

const handleLayoutChange = (layout: LayoutMode) => {
  if (settingsStore.layout === layout) return;

  settingsStore.layout = layout;
};

const handleCopySettings = async () => {
  try {
    copyLoading.value = true;

    const configCode = generateSettingsCode();

    await navigator.clipboard.writeText(configCode);

    ElMessage.success({
      message: t("settings.copySuccess"),
      duration: 3000,
    });
  } catch {
    ElMessage.error("复制配置失败");
  } finally {
    copyLoading.value = false;
  }
};

const handleResetSettings = async () => {
  resetLoading.value = true;

  try {
    settingsStore.resetSettings();

    sidebarColor.value = settingsStore.sidebarColorScheme;

    ElMessage.success(t("settings.resetSuccess"));
  } catch {
    ElMessage.error("重置配置失败");
  } finally {
    resetLoading.value = false;
  }
};

// 这里只生成 defaults，避免复制出来的代码和 src/settings.ts 的真实结构对不上。
const generateSettingsCode = (): string => {
  const themeColorsCode = JSON.stringify(settingsStore.themeColors, null, 4)
    .replace(/"([^"]+)":/g, "$1:")
    .replace(/^/gm, "  ");
  const settings = {
    theme: `ThemeMode.${settingsStore.theme.toUpperCase()}`,
    themePalette: `"${settingsStore.themePalette}"`,
    themeColors: themeColorsCode.trimStart(),
    sidebarColorScheme: `SidebarColor.${settingsStore.sidebarColorScheme.toUpperCase().replace("-", "_")}`,
    layout: `LayoutMode.${settingsStore.layout.toUpperCase()}`,
    size: "ComponentSize.DEFAULT",
    language: "LanguageEnum.ZH_CN",
    showTagsView: settingsStore.showTagsView,
    showAppLogo: settingsStore.showAppLogo,
    showWatermark: settingsStore.showWatermark,
    pageSwitchingAnimation: `"${settingsStore.pageSwitchingAnimation}"`,
    showSettings: true,
    watermarkContent: "pkg.name",
  };

  return `export const defaults = {
  theme: ${settings.theme},
  themePalette: ${settings.themePalette},
  themeColors: ${settings.themeColors},
  sidebarColorScheme: ${settings.sidebarColorScheme},
  layout: ${settings.layout},
  size: ${settings.size},
  language: ${settings.language},
  showTagsView: ${settings.showTagsView},
  showAppLogo: ${settings.showAppLogo},
  showWatermark: ${settings.showWatermark},
  pageSwitchingAnimation: ${settings.pageSwitchingAnimation},
  showSettings: ${settings.showSettings},
  watermarkContent: ${settings.watermarkContent},
} as const;`;
};

const handleCloseDrawer = () => {
  settingsStore.settingsVisible = false;
};
</script>

<style lang="scss" scoped>
.settings-drawer {
  :deep(.el-drawer__body) {
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 0;
    overflow: hidden;
  }
}

.settings-content {
  flex: 1 1 auto;
  padding: 16px 18px;
  overflow-y: auto;
}

.action-buttons {
  display: flex;

  & > .el-button {
    flex: 1;
    font-size: 14px;
    border-radius: 8px;
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transform: translateY(-2px);
    }
  }
}

.config-section {
  margin-bottom: 16px;

  .config-item {
    padding: 10px 0;
    border-bottom: 1px solid var(--el-border-color-light);
    transition: all 0.3s ease;

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      padding-right: 8px;
      padding-left: 8px;
      margin: 0 -8px;
      background-color: var(--el-fill-color-light);
      border-radius: 6px;
    }
  }

  .config-item--block {
    display: block;

    &:hover {
      padding-right: 0;
      padding-left: 0;
      margin: 0;
      background-color: transparent;
    }
  }
}

.config-block {
  margin-top: 12px;
}

.config-block--tight {
  margin-top: 10px;
}

.config-item__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.palette-strip {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;
}

.palette-option {
  display: grid;
  gap: 5px;
  align-content: center;
  justify-items: start;
  width: 100%;
  height: 44px;
  padding: 6px 8px;
  font: inherit;
  color: var(--el-text-color-regular);
  text-align: left;
  appearance: none;
  cursor: pointer;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  transition:
    background-color 0.18s,
    border-color 0.18s,
    box-shadow 0.18s,
    transform 0.18s;

  &:hover {
    background: var(--el-fill-color-lighter);
    border-color: var(--el-color-primary-light-5);
  }

  &.is-active {
    background: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary-light-5);
    box-shadow: inset 0 0 0 1px var(--el-color-primary-light-5);
  }
}

.palette-option__name {
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.1;
  color: var(--el-text-color-primary);
  white-space: nowrap;
}

.palette-option__colors {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
}

.palette-option__dot {
  width: 10px;
  height: 10px;
  margin-left: -2px;
  border: 1px solid var(--el-bg-color);
  border-radius: 50%;
  box-shadow: 0 0 0 1px rgb(0 0 0 / 4%);

  &:first-child {
    margin-left: 0;
  }
}

.custom-color-trigger {
  display: inline-flex;
  gap: 3px;
  align-items: center;
  height: 24px;
  padding: 0 6px 0 8px;
  font: inherit;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  appearance: none;
  cursor: pointer;
  background: transparent;
  border: none;
  border-radius: 6px;
  transition:
    color 0.18s,
    background-color 0.18s;

  .el-icon {
    font-size: 12px;
    transition: transform 0.18s;
  }

  &:hover,
  &.is-open {
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
  }

  &.is-open .el-icon {
    transform: rotate(90deg);
  }
}

.custom-colors-panel {
  padding: 10px;
  margin-top: 8px;
  background:
    linear-gradient(180deg, var(--el-fill-color-blank), var(--el-fill-color-lighter)),
    var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
}

.custom-colors-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 12px;
  color: var(--el-text-color-placeholder);

  span:first-child {
    font-weight: 700;
    color: var(--el-text-color-regular);
  }
}

.custom-color-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.custom-color-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 28px;
  gap: 6px;
  align-items: center;
  min-height: 34px;
  padding: 0 8px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
}

.custom-color-row__label {
  font-size: 12px;
  font-weight: 700;
  color: var(--el-text-color-regular);
}

.custom-color-row__value {
  display: none;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}

.custom-color-row :deep(.el-color-picker) {
  width: 28px;
  height: 28px;
}

.custom-color-row :deep(.el-color-picker__trigger) {
  width: 28px;
  height: 28px;
  padding: 2px;
  border-color: var(--el-border-color);
}

.layout-select {
  padding: 10px 4px 4px;

  .layout-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    justify-items: center;
  }
}

.layout-item {
  position: relative;
  width: 64px;
  height: 72px;
  overflow: hidden;
  cursor: pointer;
  background: linear-gradient(145deg, var(--el-bg-color) 0%, var(--el-bg-color-page) 100%);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    background: linear-gradient(
      145deg,
      var(--el-bg-color) 0%,
      var(--el-color-primary-light-9) 100%
    );
    border-color: var(--el-color-primary-light-3);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(-1px);
  }

  .layout-preview {
    position: relative;
    width: 100%;
    height: 42px;
    margin: 7px 0 3px;
  }

  .layout-header {
    position: absolute;
    top: 0;
    right: 4px;
    left: 4px;
    height: 8px;
    background: linear-gradient(
      90deg,
      var(--el-color-primary) 0%,
      var(--el-color-primary-light-3) 100%
    );
    border-radius: 2px;
  }

  .layout-sidebar {
    position: absolute;
    left: 4px;
    width: 12px;
    background: linear-gradient(
      180deg,
      var(--el-color-primary-dark-2) 0%,
      var(--el-color-primary) 100%
    );
    border-radius: 2px;
  }

  .layout-main {
    position: absolute;
    background: linear-gradient(135deg, var(--el-fill-color-light) 0%, var(--el-fill-color) 100%);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 2px;
  }

  .layout-name {
    position: absolute;
    right: 0;
    bottom: 5px;
    left: 0;
    font-size: 10px;
    font-weight: 500;
    color: var(--el-text-color-regular);
    text-align: center;
    transition: color 0.3s ease;
  }

  .layout-check {
    position: absolute;
    top: 4px;
    right: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    font-size: 10px;
    color: white;
    background: var(--el-color-success);
    border-radius: 50%;
  }

  &.left {
    .layout-sidebar {
      top: 4px;
      bottom: 4px;
    }
    .layout-main {
      top: 4px;
      right: 4px;
      bottom: 4px;
      left: 20px;
    }
  }

  &.top {
    .layout-header {
      height: 12px;
    }
    .layout-main {
      top: 16px;
      right: 4px;
      bottom: 4px;
      left: 4px;
    }
  }

  &.mix {
    .layout-header {
      height: 10px;
    }
    .layout-sidebar {
      top: 14px;
      bottom: 4px;
    }
    .layout-main {
      top: 14px;
      right: 4px;
      bottom: 4px;
      left: 20px;
    }
  }

  &.is-active {
    background: linear-gradient(
      145deg,
      var(--el-color-primary-light-9) 0%,
      var(--el-color-primary-light-8) 100%
    );
    border-color: var(--el-color-primary);
    box-shadow: inset 0 0 0 1px var(--el-color-primary);
    transform: translateY(-1px);

    .layout-name {
      font-weight: 600;
      color: var(--el-color-primary);
    }
  }
}

:deep(.copy-config-dialog) {
  .el-message-box__content {
    max-height: 400px;
    overflow-y: auto;
  }
}
</style>
