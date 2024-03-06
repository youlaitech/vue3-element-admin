const { pkg } = __APP_INFO__;

const defaultSettings: AppSettings = {
  title: pkg.name,
  version: pkg.version,
  showSettings: true,
  tagsView: true,
  fixedHeader: true,
  sidebarLogo: true,
  layout: "left",
  theme: "light",
  size: "default",
  language: "zh-cn",
  themeColor: "#409EFF",
  watermarkEnabled: false,
  watermarkContent: pkg.name,
};

export default defaultSettings;
