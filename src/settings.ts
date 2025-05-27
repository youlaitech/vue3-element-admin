import { LayoutMode, ComponentSize, SidebarColor, ThemeMode, LanguageEnum } from "./enums";

const { pkg } = __APP_INFO__;

// 检查用户的操作系统是否使用深色模式
const mediaQueryList = window.matchMedia("(prefers-color-scheme: dark)");

export const defaultSettings: AppSettings = {
  // 系统Title
  title: pkg.name,
  // 系统版本
  version: pkg.version,
  // 是否显示设置
  showSettings: true,
  // 是否显示标签视图
  showTagsView: true,
  // 是否显示应用Logo
  showAppLogo: true,
  // 布局方式，默认为左侧布局
  layout: LayoutMode.LEFT,
  // 主题，根据操作系统的色彩方案自动选择
  theme: mediaQueryList.matches ? ThemeMode.DARK : ThemeMode.LIGHT,
  // 组件大小 default | medium | small | large
  size: ComponentSize.DEFAULT,
  // 语言
  language: LanguageEnum.ZH_CN,
  // 主题颜色 - 修改此值时需同步修改 src/styles/variables.scss
  themeColor: "#4080FF",
  // 是否显示水印
  showWatermark: false,
  // 水印内容
  watermarkContent: pkg.name,
  // 侧边栏配色方案
  sidebarColorScheme: SidebarColor.CLASSIC_BLUE,
};

// 主题色预设 - 经典配色方案
// 注意：修改默认主题色时，需要同步修改 src/styles/variables.scss 中的 primary.base 值
export const themeColorPresets = [
  "#4080FF", // Arco Design 蓝 - 现代感强
  "#1890FF", // Ant Design 蓝 - 经典商务
  "#409EFF", // Element Plus 蓝 - 清新自然
  "#FA8C16", // 活力橙 - 温暖友好
  "#722ED1", // 优雅紫 - 高端大气
  "#13C2C2", // 青色 - 科技感
  "#52C41A", // 成功绿 - 活力清新
  "#F5222D", // 警示红 - 醒目强烈
  "#2F54EB", // 深蓝 - 稳重专业
  "#EB2F96", // 品红 - 时尚个性
];
