// 视图组件注册表
// 维护「菜单 component 字符串 → src/views 视图文件」的映射，路由注册与菜单表单共用
// 表单的「页面路径」选项树也由此派生：跳过错误页与页面内部组件，index.vue 归并到目录

/**
 * 全部视图模块，键形如 /src/views/system/user/index.vue
 */
export const viewModules = import.meta.glob("/src/views/**/*.vue");

const VIEW_PREFIX = "/src/views/";

/**
 * 视图文件路径集合，元素形如 system/user/index
 */
export const viewPaths = new Set(
  Object.keys(viewModules).map((key) => key.slice(VIEW_PREFIX.length).replace(/\.vue$/, ""))
);

/**
 * 规整组件路径：去首尾空白、开头斜杠与 .vue 后缀
 */
export function normalizeViewPath(componentPath: string): string {
  return componentPath
    .trim()
    .replace(/^\/+/, "")
    .replace(/\.vue$/i, "");
}

/**
 * 解析组件：支持 system/user 与 system/user/index 两种写法，未命中回退 404
 */
export function resolveComponent(componentPath: string) {
  const path = normalizeViewPath(componentPath);
  return (
    viewModules[`${VIEW_PREFIX}${path}.vue`] ||
    viewModules[`${VIEW_PREFIX}${path}/index.vue`] ||
    viewModules[`${VIEW_PREFIX}error/404.vue`]
  );
}

/**
 * 判断组件路径是否存在对应视图文件，目录写法命中其 index.vue
 */
export function isViewComponent(componentPath?: string): boolean {
  if (!componentPath) return false;
  const path = normalizeViewPath(componentPath);
  return viewPaths.has(path) || viewPaths.has(`${path}/index`);
}

/**
 * 选项树节点
 */
export interface PageComponentNode {
  /** 表单取值：真实文件路径，目录无 index.vue 时不可选 */
  value?: string;
  label: string;
  children?: PageComponentNode[];
  disabled?: boolean;
}

/**
 * 判断路径是否可以作为页面组件选择项
 */
function isSelectable(path: string): boolean {
  const segments = path.split("/");
  if (segments.includes("components")) return false;
  return segments[0] !== "error" && path !== "redirect";
}

/**
 * 把页面路径列表构造成组件树
 */
function buildTree(): PageComponentNode[] {
  const tree: PageComponentNode[] = [];

  [...viewPaths].filter(isSelectable).forEach((path) => insertPath(tree, path));

  sortTree(tree);
  markDisabled(tree);
  return tree;
}

/**
 * 将视图路径插入选项树，index.vue 归并到所在目录
 */
function insertPath(tree: PageComponentNode[], path: string): void {
  const segments = path.split("/");
  if (segments[segments.length - 1] === "index") segments.pop();

  let level = tree;
  segments.forEach((segment, index) => {
    const isLeaf = index === segments.length - 1;
    let node = level.find((item) => item.label === segment);

    if (!node) {
      node = { label: segment };
      level.push(node);
    }

    if (isLeaf) {
      // 取值始终是真实文件路径，与历史数据和列表展示一致
      node.value = path;
      return;
    }

    node.children ??= [];
    level = node.children;
  });
}

/**
 * 目录下没有 index.vue 时不可选，只用于展开
 */
function markDisabled(nodes: PageComponentNode[]): void {
  nodes.forEach((node) => {
    if (!node.value) node.disabled = true;
    if (node.children) markDisabled(node.children);
  });
}

/**
 * 按名称排序树节点
 */
function sortTree(nodes: PageComponentNode[]): void {
  nodes.sort((a, b) => a.label.localeCompare(b.label));
  nodes.forEach((node) => node.children && sortTree(node.children));
}

/**
 * 页面组件选项树
 */
export const pageComponentTree = buildTree();

/**
 * 节点筛选：名称与文件路径都参与匹配，输入 index 可筛出所有主页
 */
export function filterPageComponent(
  query: string,
  node: { label?: string; value?: string }
): boolean {
  if (!query) return true;
  const keyword = query.toLowerCase();
  return (
    (node.label ?? "").toLowerCase().includes(keyword) ||
    (node.value ?? "").toLowerCase().includes(keyword)
  );
}
