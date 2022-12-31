interface DefaultSettings {
  title: string;
  showSettings: boolean;
  tagsView: boolean;
  fixedHeader: boolean;
  sidebarLogo: boolean;
  errorLog: string;
  layout: string;
  theme: string;
}

const defaultSettings: DefaultSettings = {
  title: 'vue3-element-admin',
  showSettings: true,
  tagsView: true,
  fixedHeader: false,
  sidebarLogo: true,
  errorLog: 'production',
  layout: 'left',
  theme: 'light'
};

export default defaultSettings;
