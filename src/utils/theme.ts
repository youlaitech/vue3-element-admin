import { ThemeMode } from "@/enums";
import { themeColorNames } from "@/settings";
import type { ThemeColorMap, ThemeColorName } from "@/settings";

const SYSTEM_DARK_MEDIA = "(prefers-color-scheme: dark)";

function hexToRgb(hex: string): [number, number, number] {
  const bigint = parseInt(hex.slice(1), 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

/**
 * 加深颜色值
 * @param {String} color 颜色值字符串
 * @param {Number} level 加深的程度，限0-1之间
 * @returns {String} 返回处理后的颜色值
 */
export function getDarkColor(color: string, level: number): string {
  const rgb = hexToRgb(color);
  for (let i = 0; i < 3; i++) rgb[i] = Math.round(20.5 * level + rgb[i] * (1 - level));
  return rgbToHex(rgb[0], rgb[1], rgb[2]);
}

/**
 * 变浅颜色值
 * @param {String} color 颜色值字符串
 * @param {Number} level 变浅的程度，限0-1之间
 * @returns {String} 返回处理后的颜色值
 */
export const getLightColor = (color: string, level: number): string => {
  const rgb = hexToRgb(color);
  for (let i = 0; i < 3; i++) rgb[i] = Math.round(255 * level + rgb[i] * (1 - level));
  return rgbToHex(rgb[0], rgb[1], rgb[2]);
};

/**
 * Element Plus 运行时需要 base、light-1..9 和 dark-2。
 * 这里从完整颜色方案一次性生成，避免主色和功能色来自不同体系。
 */
export function generateThemeColors(palette: ThemeColorMap, theme: ThemeMode) {
  const resolvedTheme = resolveThemeMode(theme);
  const colors: Record<string, string> = {};

  themeColorNames.forEach((name: ThemeColorName) => {
    const base = palette[name];
    colors[name] = base;

    for (let i = 1; i <= 9; i++) {
      colors[`${name}-light-${i}`] =
        resolvedTheme === ThemeMode.LIGHT
          ? `${getLightColor(base, i / 10)}`
          : `${getDarkColor(base, i / 10)}`;
    }
    colors[`${name}-dark-2`] =
      resolvedTheme === ThemeMode.LIGHT
        ? `${getLightColor(base, 0.2)}`
        : `${getDarkColor(base, 0.3)}`;
  });

  return colors;
}

export function getSystemTheme() {
  return window.matchMedia(SYSTEM_DARK_MEDIA).matches ? ThemeMode.DARK : ThemeMode.LIGHT;
}

export function resolveThemeMode(theme: ThemeMode) {
  return theme === ThemeMode.AUTO ? getSystemTheme() : theme;
}

export function watchSystemTheme(callback: (theme: ThemeMode) => void) {
  const mediaQuery = window.matchMedia(SYSTEM_DARK_MEDIA);
  const handler = () => callback(mediaQuery.matches ? ThemeMode.DARK : ThemeMode.LIGHT);

  mediaQuery.addEventListener("change", handler);

  return () => {
    mediaQuery.removeEventListener("change", handler);
  };
}

export function applyTheme(colors: Record<string, string>) {
  const el = document.documentElement;

  Object.entries(colors).forEach(([key, value]) => {
    el.style.setProperty(`--el-color-${key}`, value);
  });

  requestAnimationFrame(() => {
    // 给依赖 CSS 变量的组件一次明确的样式刷新信号。
    el.style.setProperty("--theme-update-trigger", Date.now().toString());
  });
}

/**
 * 切换暗黑模式
 *
 * @param isDark 是否启用暗黑模式
 */
export function toggleDarkMode(isDark: boolean) {
  if (isDark) {
    document.documentElement.classList.add(ThemeMode.DARK);
  } else {
    document.documentElement.classList.remove(ThemeMode.DARK);
  }
}

/**
 * 切换浅色主题下的侧边栏颜色方案
 *
 * @param isBlue 布尔值，表示是否开启深蓝色侧边栏颜色方案
 */
export function toggleSidebarColor(isBlueSidebar: boolean) {
  if (isBlueSidebar) {
    document.documentElement.classList.add("sidebar-color-blue");
  } else {
    document.documentElement.classList.remove("sidebar-color-blue");
  }
}
