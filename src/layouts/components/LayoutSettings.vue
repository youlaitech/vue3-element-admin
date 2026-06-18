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
        <div class="section-title">{{ t("settings.theme") }}</div>

        <div class="theme-mode">
          <el-radio-group v-model="themeMode">
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

        <div class="config-card">
          <div class="config-card__header">
            <span>{{ t("settings.themePalette") }}</span>
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
        <div class="section-title">{{ t("settings.navigation") }}</div>

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
                @keydown.enter="handleLayoutChange(item.value)"
                @keydown.space.prevent="handleLayoutChange(item.value)"
              >
                <div class="layout-preview">
                  <div
                    v-if="item.value === LayoutMode.TOP || item.value === LayoutMode.MIX"
                    class="layout-header"
                  ></div>
                  <div v-if="item.value !== LayoutMode.TOP" class="layout-sidebar"></div>
                  <div v-if="item.value === LayoutMode.DOUBLE" class="layout-sub-sidebar"></div>
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

        <div
          v-if="settingsStore.resolvedTheme !== ThemeMode.DARK"
          class="config-item config-item--sidebar-color"
        >
          <span class="config-item__label text-xs">{{ t("settings.sidebarColorScheme") }}</span>
          <el-radio-group
            v-model="sidebarColor"
            class="config-item__control"
            @change="setSidebarColor"
          >
            <el-radio :value="SidebarColor.MINIMAL_WHITE">
              {{ t("settings.minimalWhite") }}
            </el-radio>
            <el-radio :value="SidebarColor.CLASSIC_BLUE">
              {{ t("settings.classicBlue") }}
            </el-radio>
          </el-radio-group>
        </div>
      </section>

      <section class="config-section">
        <div class="section-title">{{ t("settings.interface") }}</div>

        <div class="config-item flex-x-between">
          <span class="text-xs">{{ t("settings.showTagsView") }}</span>
          <el-switch v-model="settingsStore.showTagsView" />
        </div>

        <div v-if="settingsStore.showTagsView" class="config-item config-item--block">
          <div class="config-card__header">
            <span class="text-xs">{{ t("settings.tagsViewStyle") }}</span>
          </div>
          <div class="tags-style-grid">
            <button
              v-for="item in tagsViewStyleOptions"
              :key="item.value"
              type="button"
              :aria-label="item.label"
              :class="[
                'tags-style-option',
                { 'is-active': settingsStore.tagsViewStyle === item.value },
              ]"
              @click="settingsStore.tagsViewStyle = item.value"
            >
              <span :class="['tags-style-preview', `tags-style-preview--${item.value}`]">
                <i></i>
                <i></i>
                <i></i>
              </span>
              <span class="tags-style-option__label">{{ item.label }}</span>
            </button>
          </div>
        </div>

        <div class="config-item flex-x-between">
          <span class="text-xs">{{ t("settings.showAppLogo") }}</span>
          <el-switch v-model="settingsStore.showAppLogo" />
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
      </section>

      <section class="config-section">
        <div class="section-title">{{ t("settings.assist") }}</div>

        <div class="config-item flex-x-between">
          <span class="text-xs">{{ t("settings.showWatermark") }}</span>
          <el-switch v-model="settingsStore.showWatermark" />
        </div>

        <div class="config-item flex-x-between">
          <span class="text-xs">{{ t("settings.grayMode") }}</span>
          <el-switch v-model="settingsStore.grayMode" />
        </div>

        <div class="config-item flex-x-between">
          <span class="text-xs">{{ t("settings.colorWeak") }}</span>
          <el-switch v-model="settingsStore.colorWeak" />
        </div>
      </section>
    </div>

    <template #footer>
      <div class="settings-footer">
        <el-button
          type="primary"
          :icon="copyIcon"
          :loading="copyLoading"
          @click="copyCurrentSettings"
        >
          {{ copyLoading ? "复制中..." : t("settings.copyConfig") }}
        </el-button>
        <el-button
          type="default"
          :icon="resetIcon"
          :loading="resetLoading"
          @click="resetSettingsToDefault"
        >
          {{ resetLoading ? "重置中..." : t("settings.resetConfig") }}
        </el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { ArrowRight, Check, DocumentCopy, RefreshLeft } from "@element-plus/icons-vue";
import {
  LayoutMode,
  PageSwitchingAnimationOptions,
  SidebarColor,
  TagsViewStyle,
  ThemeMode,
} from "@/enums";
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

interface TagsViewStyleOption {
  value: TagsViewStyle;
  label: string;
}

interface ColorOption {
  name: ThemeColorName;
}

const layoutOptions: LayoutOption[] = [
  { value: LayoutMode.LEFT, label: t("settings.leftLayout"), className: "left" },
  { value: LayoutMode.TOP, label: t("settings.topLayout"), className: "top" },
  { value: LayoutMode.MIX, label: t("settings.mixLayout"), className: "mix" },
  { value: LayoutMode.DOUBLE, label: t("settings.doubleLayout"), className: "double" },
];

const tagsViewStyleOptions: TagsViewStyleOption[] = [
  { value: TagsViewStyle.LINE, label: t("settings.tagsViewStyles.line") },
  { value: TagsViewStyle.CARD, label: t("settings.tagsViewStyles.card") },
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

function getPaletteColors(colors: ThemeColorMap) {
  return colorOptions.map((item) => colors[item.name]);
}

function getPaletteName(palette: ThemePalettePreset) {
  const key = paletteI18nKeys[palette.id];
  return key ? t(`settings.themePalettes.${key}.name`) : palette.name;
}

function getPaletteDescription(palette: ThemePalettePreset) {
  const key = paletteI18nKeys[palette.id];
  return key ? t(`settings.themePalettes.${key}.description`) : palette.description;
}

function getColorLabel(name: ThemeColorName) {
  return t(`settings.themeColorNames.${name}`);
}

const activePaletteName = computed(() =>
  settingsStore.activeThemePalette
    ? getPaletteName(settingsStore.activeThemePalette)
    : t("settings.customPalette")
);

/**
 * 展开或收起自定义颜色
 */
function toggleCustomColors(): void {
  isCustomColorsOpen.value = !isCustomColorsOpen.value;
}

/**
 * 更新单个主题色
 */
function handleThemeColorChange(name: ThemeColorName, color: string | null): void {
  if (!color) return;
  settingsStore.updateThemeColor(name, color);
}

/**
 * 切换侧边栏配色
 */
function setSidebarColor(value: string | number | boolean | undefined): void {
  if (value !== SidebarColor.CLASSIC_BLUE && value !== SidebarColor.MINIMAL_WHITE) return;

  settingsStore.sidebarColorScheme = value;
}

/**
 * 切换导航布局
 */
function handleLayoutChange(layout: LayoutMode): void {
  if (settingsStore.layout === layout) return;

  settingsStore.layout = layout;
}

/**
 * 复制当前 settings 默认配置片段
 */
async function copyCurrentSettings(): Promise<void> {
  try {
    copyLoading.value = true;

    const configCode = buildDefaultsCode();

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
}

/**
 * 恢复所有设置为默认值
 */
async function resetSettingsToDefault(): Promise<void> {
  try {
    await ElMessageBox.confirm(t("settings.confirmReset"), t("settings.resetConfig"), {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });

    resetLoading.value = true;
    settingsStore.resetSettings();

    sidebarColor.value = settingsStore.sidebarColorScheme;

    ElMessage.success(t("settings.resetSuccess"));
  } catch {
    // 用户取消时不提示
  } finally {
    resetLoading.value = false;
  }
}

/**
 * 生成 src/settings.ts 中 defaults 的配置片段
 */
function buildDefaultsCode(): string {
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
    tagsViewStyle: `TagsViewStyle.${settingsStore.tagsViewStyle.toUpperCase()}`,
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
  tagsViewStyle: ${settings.tagsViewStyle},
  showAppLogo: ${settings.showAppLogo},
  showWatermark: ${settings.showWatermark},
  pageSwitchingAnimation: ${settings.pageSwitchingAnimation},
  showSettings: ${settings.showSettings},
  watermarkContent: ${settings.watermarkContent},
} as const;`;
}

function handleCloseDrawer(): void {
  settingsStore.settingsVisible = false;
}
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
    color: var(--el-text-color-regular);
  }

  :deep(.el-drawer__footer) {
    padding: 12px 18px 16px;
    border-top: 1px solid var(--el-border-color-lighter);
  }
}

.settings-content {
  flex: 1 1 auto;
  padding: 16px 18px 20px;
  overflow-y: auto;
  color: var(--el-text-color-regular);
}

.config-section {
  & + & {
    margin-top: 20px;
  }

  .config-item {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    min-height: 42px;
    padding: 8px 0;
    border-bottom: 1px solid var(--el-border-color-lighter);

    &:last-child {
      border-bottom: none;
    }

    > .text-xs {
      flex-shrink: 0;
      color: var(--el-text-color-regular);
      white-space: nowrap;
    }
  }

  .config-item--sidebar-color {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    column-gap: 14px;
    padding: 12px;
    margin-top: 12px;
    background: var(--el-fill-color-extra-light);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;

    .config-item__label {
      min-width: 64px;
      color: var(--el-text-color-regular);
      white-space: nowrap;
    }

    .config-item__control {
      justify-content: flex-end;
      min-width: 0;
    }

    :deep(.el-radio) {
      margin-right: 0;

      & + .el-radio {
        margin-left: 18px;
      }
    }

    :deep(.el-radio__label) {
      color: var(--el-text-color-regular);
    }

    :deep(.el-radio.is-checked .el-radio__label) {
      color: var(--el-color-primary);
    }
  }

  .config-item--block {
    display: block;
    min-height: 0;
    padding-top: 10px;
    padding-bottom: 12px;

    border-bottom: 1px solid var(--el-border-color-lighter);
  }
}

.section-title {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 12px;
  font-size: 13px;
  font-weight: 600;
  line-height: 1;
  color: var(--el-text-color-primary);

  &::before,
  &::after {
    flex: 1;
    height: 1px;
    content: "";
    background: var(--el-border-color-lighter);
  }
}

.theme-mode {
  display: flex;
  justify-content: center;
}

.config-card {
  margin-top: 14px;
}

.config-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 12px;
  color: var(--el-text-color-regular);

  > span {
    font-weight: 500;
  }
}

.settings-footer {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;

  .el-button {
    margin: 0;
  }
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
    box-shadow 0.18s;

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
  background: var(--el-fill-color-blank);
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
  padding-top: 10px;

  .layout-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 8px;
  }
}

.layout-item {
  position: relative;
  height: 72px;
  overflow: hidden;
  cursor: pointer;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  transition:
    background-color 0.18s,
    border-color 0.18s,
    box-shadow 0.18s;

  &:hover {
    background: var(--el-fill-color-lighter);
    border-color: var(--el-color-primary-light-5);
  }

  .layout-preview {
    position: relative;
    width: 54px;
    height: 34px;
    margin: 8px auto 4px;
  }

  .layout-header {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    height: 8px;
    background: var(--el-color-primary);
    border-radius: 2px;
  }

  .layout-sidebar {
    position: absolute;
    left: 0;
    width: 12px;
    background: var(--el-color-primary);
    border-radius: 2px;
  }

  .layout-sub-sidebar {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 15px;
    width: 14px;
    background: var(--el-color-primary-light-9);
    border: 1px solid var(--el-color-primary-light-6);
    border-radius: 2px;
  }

  .layout-main {
    position: absolute;
    background:
      linear-gradient(var(--el-fill-color-light) 0 0) 7px 7px / 18px 3px no-repeat,
      linear-gradient(var(--el-fill-color-light) 0 0) 7px 14px / 24px 3px no-repeat,
      var(--el-fill-color-lighter);
    border: 1px solid var(--el-border-color-extra-light);
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
    width: 15px;
    height: 15px;
    font-size: 10px;
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
    border: 1px solid var(--el-color-primary-light-5);
    border-radius: 50%;
  }

  &.left {
    .layout-sidebar {
      top: 4px;
      bottom: 4px;
    }
    .layout-main {
      top: 4px;
      right: 0;
      bottom: 4px;
      left: 16px;
    }
  }

  &.top {
    .layout-header {
      height: 12px;
    }
    .layout-main {
      top: 16px;
      right: 0;
      bottom: 0;
      left: 0;
    }
  }

  &.mix {
    .layout-header {
      height: 10px;
    }
    .layout-sidebar {
      top: 14px;
      bottom: 0;
    }
    .layout-main {
      top: 14px;
      right: 0;
      bottom: 0;
      left: 16px;
    }
  }

  &.double {
    .layout-sidebar {
      top: 0;
      bottom: 0;
      width: 10px;
    }
    .layout-main {
      top: 0;
      right: 0;
      bottom: 0;
      left: 33px;
    }
  }

  &.is-active {
    background: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary-light-5);
    box-shadow: inset 0 0 0 1px var(--el-color-primary-light-6);

    .layout-name {
      font-weight: 600;
      color: var(--el-color-primary);
    }
  }
}

.tags-style-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.tags-style-option {
  display: grid;
  gap: 6px;
  align-content: center;
  justify-items: center;
  height: 58px;
  padding: 7px 6px;
  font: inherit;
  color: var(--el-text-color-regular);
  appearance: none;
  cursor: pointer;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  transition:
    background-color 0.16s,
    border-color 0.16s;

  &:hover {
    background: var(--el-fill-color-lighter);
    border-color: var(--el-color-primary-light-5);
  }

  &.is-active {
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary-light-5);
  }
}

.tags-style-option__label {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.1;
  white-space: nowrap;
}

.tags-style-preview {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 54px;
  height: 20px;

  i {
    display: block;
    width: 16px;
    height: 12px;
    background: var(--el-fill-color-light);
    border: 1px solid var(--el-border-color-lighter);
  }
}

.tags-style-preview--line {
  gap: 4px;
  align-items: flex-end;
  border-bottom: 1px solid var(--el-border-color-lighter);

  i {
    width: 13px;
    height: 10px;
    background: transparent;
    border: 0;
    border-bottom: 2px solid transparent;

    &:nth-child(2) {
      border-bottom-color: var(--el-color-primary);
    }
  }
}

.tags-style-preview--card {
  gap: 4px;

  i {
    width: 14px;
    height: 12px;
    background: transparent;
    border-color: transparent;
    border-radius: 4px;

    &:nth-child(2) {
      background: var(--el-color-primary-light-9);
      border-color: var(--el-color-primary-light-6);
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
