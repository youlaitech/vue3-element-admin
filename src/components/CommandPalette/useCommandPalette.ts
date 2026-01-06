/**
 * 菜单搜索逻辑
 */
import { ref, onMounted, onBeforeUnmount, toRaw } from "vue";
import { RouteRecordRaw, LocationQueryRaw } from "vue-router";
import router from "@/router";
import { usePermissionStore } from "@/store";
import { isExternal } from "@/utils";

/** 搜索项类型 */
interface SearchItem {
  title: string;
  path: string;
  name?: string;
  icon?: string;
  redirect?: string;
  params?: LocationQueryRaw;
}

const STORAGE_KEY = "menu_search_history";
const MAX_HISTORY = 5;

export function useCommandPalette() {
  const permissionStore = usePermissionStore();

  // 状态
  const visible = ref(false);
  const keyword = ref("");
  const activeIndex = ref(-1);
  const inputRef = ref<HTMLInputElement>();
  const menuItems = ref<SearchItem[]>([]);
  const results = ref<SearchItem[]>([]);
  const history = ref<SearchItem[]>([]);

  // 排除的路由
  const excludedPaths = ["/redirect", "/login", "/401", "/404"];

  // ============================================
  // 弹窗控制
  // ============================================

  function open() {
    keyword.value = "";
    results.value = [];
    activeIndex.value = -1;
    visible.value = true;
    setTimeout(() => inputRef.value?.focus(), 100);
  }

  function close() {
    visible.value = false;
  }

  // ============================================
  // 搜索逻辑
  // ============================================

  function onSearch() {
    activeIndex.value = -1;
    if (!keyword.value.trim()) {
      results.value = [];
      return;
    }
    const kw = keyword.value.toLowerCase();
    results.value = menuItems.value.filter((item) => item.title.toLowerCase().includes(kw));
  }

  function getDisplayList() {
    return results.value.length ? results.value : history.value;
  }

  function onSelect() {
    const list = getDisplayList();
    if (list.length === 0) return;
    if (activeIndex.value < 0) return;
    const item = list[activeIndex.value];
    if (!item) return;
    onGo(item);
  }

  function onNavigate(direction: "up" | "down") {
    const list = getDisplayList();
    if (list.length === 0) return;

    if (direction === "up") {
      activeIndex.value = activeIndex.value <= 0 ? list.length - 1 : activeIndex.value - 1;
    } else {
      activeIndex.value = activeIndex.value >= list.length - 1 ? 0 : activeIndex.value + 1;
    }
  }

  function onGo(item: SearchItem) {
    close();
    addHistory(item);

    if (isExternal(item.path)) {
      window.open(item.path, "_blank");
    } else {
      router.push({ path: item.path, query: item.params });
    }
  }

  // ============================================
  // 历史记录
  // ============================================

  function loadHistory() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      history.value = data ? JSON.parse(data) : [];
    } catch {
      history.value = [];
    }
  }

  function saveHistory() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.value));
  }

  function addHistory(item: SearchItem) {
    // 去重
    const idx = history.value.findIndex((i) => i.path === item.path);
    if (idx !== -1) history.value.splice(idx, 1);

    // 添加到开头
    history.value.unshift(item);

    // 限制数量
    if (history.value.length > MAX_HISTORY) {
      history.value = history.value.slice(0, MAX_HISTORY);
    }

    saveHistory();
  }

  function removeHistory(index: number) {
    history.value.splice(index, 1);
    saveHistory();
  }

  function clearHistory() {
    history.value = [];
    localStorage.removeItem(STORAGE_KEY);
  }

  // ============================================
  // 路由解析
  // ============================================

  function loadRoutes(routes: RouteRecordRaw[], parentPath = "") {
    routes.forEach((route) => {
      const path = route.path.startsWith("/")
        ? route.path
        : `${parentPath}${parentPath.endsWith("/") ? "" : "/"}${route.path}`;

      if (excludedPaths.includes(route.path) || isExternal(route.path)) return;

      if (route.children) {
        loadRoutes(route.children, path);
      } else if (route.meta?.title) {
        menuItems.value.push({
          title: route.meta.title === "dashboard" ? "首页" : route.meta.title,
          path,
          name: typeof route.name === "string" ? route.name : undefined,
          icon: route.meta.icon,
          redirect: typeof route.redirect === "string" ? route.redirect : undefined,
          params: route.meta.params
            ? JSON.parse(JSON.stringify(toRaw(route.meta.params)))
            : undefined,
        });
      }
    });
  }

  // ============================================
  // 快捷键
  // ============================================

  function handleKeydown(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      open();
    }
  }

  // ============================================
  // 生命周期
  // ============================================

  onMounted(() => {
    loadRoutes(permissionStore.routes);
    loadHistory();
    document.addEventListener("keydown", handleKeydown);
  });

  onBeforeUnmount(() => {
    document.removeEventListener("keydown", handleKeydown);
  });

  return {
    visible,
    keyword,
    results,
    history,
    activeIndex,
    inputRef,
    open,
    close,
    onSearch,
    onSelect,
    onNavigate,
    onGo,
    removeHistory,
    clearHistory,
  };
}
