import GeneratorAPI from "@/api/codegen";
import type { GenConfigForm } from "@/api/codegen";
import {
  buildFileTree,
  filterTree,
  findFirstLeaf,
  findLeafByKey,
  getFileIcon,
} from "../utils/tree-builder";
import type { TreeNode } from "../utils/tree-builder";

export function useCodePreview(genConfigFormData: Ref<GenConfigForm>) {
  const treeData = ref<TreeNode[]>([]);
  const previewScope = ref<"all" | "frontend" | "backend">("all");
  const previewTypeOptions = ref<string[]>([]);
  const previewTypes = ref<string[]>([]);

  const filteredTreeData = computed(() => {
    if (!treeData.value.length) return [];
    return filterTree(treeData.value, previewScope.value, previewTypes.value);
  });

  const code = ref("");
  const currentFileKey = ref("");
  const fileTreeRef = ref();

  const { copy, copied } = useClipboard();

  watch(copied, () => {
    if (copied.value) ElMessage.success("复制成功");
  });

  /** 获取预览数据并构建文件树 */
  async function handlePreview(tableName: string) {
    treeData.value = [];
    const pageType = genConfigFormData.value.pageType || "classic";
    const data = await GeneratorAPI.getPreviewData(tableName, pageType as "classic" | "curd", "ts");
    const previewList = data || [];

    // 提取语言类型选项
    const typeOptions = Array.from(
      new Set(
        previewList
          .map((item) => item.language || item.fileName.split(".").pop() || "")
          .filter(Boolean)
      )
    );
    previewTypeOptions.value = typeOptions;
    previewTypes.value = [...typeOptions];

    // 构建树
    const tree = buildFileTree(previewList);
    treeData.value = tree?.children ? [...tree.children] : [];

    // 选中第一个叶子节点
    const firstLeaf = findFirstLeaf(tree);
    if (firstLeaf) {
      code.value = firstLeaf.content || "";
      currentFileKey.value = firstLeaf.key || "";
      await nextTick();
      fileTreeRef.value?.setCurrentKey?.(currentFileKey.value);
    }

    return previewList;
  }

  /** 点击文件树节点 */
  function handleFileTreeNodeClick(data: TreeNode) {
    if (!data.children || data.children.length === 0) {
      code.value = data.content || "";
      currentFileKey.value = data.key || "";
    }
  }

  /** 复制代码 */
  function handleCopyCode() {
    if (code.value) copy(code.value);
  }

  // 过滤条件变了之后，如果当前选中的文件还在就继续高亮，否则选第一个
  watch(
    () => filteredTreeData.value,
    async (nodes) => {
      if (!nodes.length) {
        currentFileKey.value = "";
        code.value = "";
        return;
      }
      if (currentFileKey.value) {
        const leaf = findLeafByKey(nodes, currentFileKey.value);
        if (leaf) {
          await nextTick();
          fileTreeRef.value?.setCurrentKey?.(currentFileKey.value);
          return;
        }
      }
      const first = findFirstLeaf({ label: "root", key: "root", children: nodes });
      if (first) {
        code.value = first.content || "";
        currentFileKey.value = first.key || "";
        await nextTick();
        fileTreeRef.value?.setCurrentKey?.(currentFileKey.value);
      }
    },
    { immediate: true }
  );

  return {
    treeData,
    filteredTreeData,
    previewScope,
    previewTypes,
    previewTypeOptions,
    code,
    currentFileKey,
    fileTreeRef,
    handlePreview,
    handleFileTreeNodeClick,
    handleCopyCode,
    getFileIcon,
  };
}
