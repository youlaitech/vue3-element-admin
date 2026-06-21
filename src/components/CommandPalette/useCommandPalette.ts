import { onBeforeUnmount, onMounted, ref, toRaw } from "vue";
import type { LocationQueryRaw, RouteRecordRaw } from "vue-router";
import router from "@/router";
import { usePermissionStore } from "@/stores";
import { isExternal } from "@/utils";

/** 命令面板中的可搜索菜单项。 */
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
const EXCLUDED_PATHS = ["/redirect", "/login", "/401", "/404"];

export function useCommandPalette() {
  const permissionStore = usePermissionStore();

  // 面板状态
  const visible = ref(false);
  const keyword = ref("");
  const activeIndex = ref(-1);
  const inputRef = ref<HTMLInputElement>();

  // 菜单数据
  const menuItems = ref<SearchItem[]>([]);
  const results = ref<SearchItem[]>([]);
  const history = ref<SearchItem[]>([]);

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

  /**
   * 搜索仅匹配菜单标题，避免路径命中过多造成结果噪音。
   */
  function onSearch() {
    activeIndex.value = -1;
    if (!keyword.value.trim()) {
      results.value = [];
      return;
    }
    const keywordText = keyword.value.toLowerCase();
    results.value = menuItems.value.filter((item) =>
      item.title.toLowerCase().includes(keywordText)
    );
  }

  function getDisplayList(): SearchItem[] {
    return results.value.length ? results.value : history.value;
  }

  /**
   * 键盘选择当前展示列表，搜索为空时回退历史记录。
   */
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

  /**
   * 历史记录按最近使用排序，并限制本地缓存数量。
   */
  function addHistory(item: SearchItem) {
    const index = history.value.findIndex((historyItem) => historyItem.path === item.path);
    if (index !== -1) history.value.splice(index, 1);

    history.value.unshift(item);

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

  /**
   * 将权限路由拍平成命令面板可搜索的菜单项。
   */
  function loadRoutes(routes: RouteRecordRaw[], parentPath = "") {
    routes.forEach((route) => {
      const path = route.path.startsWith("/")
        ? route.path
        : `${parentPath}${parentPath.endsWith("/") ? "" : "/"}${route.path}`;

      if (EXCLUDED_PATHS.includes(route.path) || isExternal(route.path)) return;

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

  /**
   * Ctrl/Cmd + K 打开命令面板，并阻止浏览器默认搜索。
   */
  function handleKeydown(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      open();
    }
  }

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
