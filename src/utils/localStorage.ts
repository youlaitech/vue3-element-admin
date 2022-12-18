/**
 * window.localStorage 浏览器永久缓存
 */
export const localStorage = {
  // 设置永久缓存
  set(key: string, val: any) {
    window.localStorage.setItem(key, JSON.stringify(val));
  },
  // 获取永久缓存
  get(key: string) {
    const json: any = window.localStorage.getItem(key);
    return JSON.parse(json);
  },
  // 移除永久缓存
  remove(key: string) {
    window.localStorage.removeItem(key);
  },
  // 移除全部永久缓存
  clear() {
    window.localStorage.clear();
  }
};

// 侧边栏状态(显示/隐藏)
const SidebarStatusKey = 'sidebarStatus';
export function getSidebarStatus() {
  return localStorage.get(SidebarStatusKey);
}

export function setSidebarStatus(sidebarStatus: string) {
  localStorage.set(SidebarStatusKey, sidebarStatus);
}
// 布局大小
const SizeKey = 'size';

export function getSize() {
  return localStorage.get(SizeKey);
}

export function setSize(size: string) {
  localStorage.set(SizeKey, size);
}

// 语言
const LanguageKey = 'language';

export function getLanguage() {
  return localStorage.get(LanguageKey);
}

export function setLanguage(language: string) {
  localStorage.set(LanguageKey, language);
}
