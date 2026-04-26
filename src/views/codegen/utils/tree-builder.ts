import type { GeneratorPreviewItem } from "@/api/codegen";

/** 文件树节点 */
export interface TreeNode {
  label: string;
  key?: string;
  content?: string;
  children?: TreeNode[];
  scope?: "frontend" | "backend";
  language?: string;
}

/**
 * 递归构建文件树
 * 将扁平的预览文件列表转为树形结构
 */
export function buildFileTree(data: GeneratorPreviewItem[]): TreeNode {
  const root: TreeNode = { label: "前后端代码", key: "root", children: [] };

  data.forEach((item) => {
    const normalizedPath = item.path.replace(/\\/g, "/");
    const parts = normalizedPath.split("/").filter(Boolean);

    let currentNode = root;
    let currentKey = root.key || "root";

    parts.forEach((part) => {
      let node = currentNode.children?.find((child) => child.label === part);
      if (!node) {
        currentKey = `${currentKey}/${part}`;
        node = { label: part, key: currentKey, children: [] };
        currentNode.children?.push(node);
      } else {
        currentKey = node.key || `${currentKey}/${part}`;
      }
      currentNode = node;
    });

    currentNode.children?.push({
      label: item.fileName,
      key: `${item.scope || ""}:${normalizedPath}/${item.fileName}`,
      content: item?.content,
      scope: item.scope,
      language: item.language,
    });
  });

  return root;
}

/** 递归查找第一个叶子节点 */
export function findFirstLeaf(node: TreeNode): TreeNode | null {
  if (!node.children || node.children.length === 0) {
    return node;
  }
  for (const child of node.children) {
    const leaf = findFirstLeaf(child);
    if (leaf) return leaf;
  }
  return null;
}

/** 根据 key 查找叶子节点 */
export function findLeafByKey(nodes: TreeNode[], key: string): TreeNode | null {
  for (const node of nodes) {
    if (!node.children || node.children.length === 0) {
      if (node.key === key) return node;
      continue;
    }
    const found = findLeafByKey(node.children, key);
    if (found) return found;
  }
  return null;
}

/** 根据文件扩展名获取图标名 */
export function getFileIcon(node: TreeNode): string {
  const ext = (node.language || node.label.split(".").pop() || "").toLowerCase();
  const iconMap: Record<string, string> = {
    java: "java",
    html: "html",
    vue: "vue",
    ts: "typescript",
    xml: "xml",
  };
  if (iconMap[ext]) return iconMap[ext];
  if (["cs", "go", "py", "php", "js"].includes(ext)) return "code";
  return "file";
}

/**
 * 过滤树节点（基于 scope 和 language）
 * 返回过滤后的新树
 */
export function filterTree(
  nodes: TreeNode[],
  scope: "all" | "frontend" | "backend",
  types: string[]
): TreeNode[] {
  const match = (node: TreeNode): boolean => {
    if (scope !== "all" && node.scope !== scope) return false;
    if (!types.length) return true;
    const language = node.language || node.label.split(".").pop() || "";
    return types.includes(language);
  };

  const cloneFilter = (node: TreeNode): TreeNode | null => {
    if (!node.children || node.children.length === 0) {
      return match(node) ? { ...node } : null;
    }
    const children = node.children.map((c) => cloneFilter(c)).filter(Boolean) as TreeNode[];
    if (!children.length) return null;
    return { label: node.label, key: node.key, children };
  };

  return nodes.map((n) => cloneFilter(n)).filter(Boolean) as TreeNode[];
}
