export default {
  // 菜单国际化
  route: {
    dashboard: "Dashboard",
    document: "Document",
  },
  // 登录页面国际化
  login: {
    themeToggle: "Theme Switch",
    languageToggle: "Language Switch",
    dark: "Dark",
    light: "Light",
    username: "Username",
    password: "Password",
    login: "Login",
    captchaCode: "Verify Code",
    capsLock: "Caps Lock is On",
    rememberMe: "Remember Me",
    forgetPassword: "Forget Password?",
    message: {
      username: {
        required: "Please enter Username",
      },
      password: {
        required: "Please enter Password",
        min: "The password can not be less than 6 digits",
        confirm: "Please confirm the password again",
        inconformity: "The two password entries are inconsistent",
      },
      captchaCode: {
        required: "Please enter Verify Code",
      },
    },
    otherLoginMethods: "Other",
    resetPassword: "Reset password",
    thinkOfPasswd: "Remember your password?",
    register: "Register account",
    agree: "I have read and agree to the",
    userAgreement: "User Agreement",
    haveAccount: "Already have an account?",
    noAccount: "Don't have an account?",
    quickFill: "Quick fill",
    reg: "Register",
  },
  // 导航栏国际化
  navbar: {
    dashboard: "Dashboard",
    logout: "Logout",
    document: "Document",
    gitee: "Gitee",
    profile: "User Profile",
  },
  sizeSelect: {
    tooltip: "Layout Size",
    default: "Default",
    large: "Large",
    small: "Small",
    message: {
      success: "Switch Layout Size Successful!",
    },
  },
  langSelect: {
    message: {
      success: "Switch Language Successful!",
    },
  },
  settings: {
    project: "Project Settings",
    theme: "Theme",
    interface: "Interface",
    navigation: "Navigation",
    themeColor: "Theme Color",
    showTagsView: "Show Tags View",
    showAppLogo: "Show App Logo",
    sidebarColorScheme: "Sidebar Color Scheme",
    showWatermark: "Show Watermark",
    classicBlue: "Classic Blue",
    minimalWhite: "Minimal White",
    copyConfig: "Copy Config",
    resetConfig: "Reset Default",
    copySuccess: "Configuration copied to clipboard",
    resetSuccess: "Reset to default configuration",
    copyDescription:
      "Copy config will generate current settings code, reset will restore all settings to default",
    confirmReset: "Are you sure to reset all settings to default? This operation cannot be undone.",
    applyToFile: "Apply to File",
    onlyCopy: "Only Copy",
    leftLayout: "Left Mode",
    topLayout: "Top Mode",
    mixLayout: "Mix Mode",
    configManagement: "Config Management",
    copyConfigDescription:
      "Generate current settings code and copy to clipboard, then overwrite src/settings.ts file",
    resetConfigDescription: "Restore all settings to system default values",
  },
};
