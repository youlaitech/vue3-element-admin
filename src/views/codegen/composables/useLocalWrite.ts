import type { GeneratorPreviewItem, GenConfigForm } from "@/api/codegen";
import { ElLoading } from "element-plus";

/**
 * 把生成的代码写入本地目录
 */
export function useLocalWrite(genConfigFormData: Ref<GenConfigForm>) {
  const supportsFSAccess = typeof (window as any).showDirectoryPicker === "function";

  const writeDialog = reactive({ visible: false });
  const frontendDirHandle = ref<FileSystemDirectoryHandle | null>(null);
  const backendDirHandle = ref<FileSystemDirectoryHandle | null>(null);
  const frontendDirPath = ref("");
  const backendDirPath = ref("");
  const writeScope = ref<"all" | "frontend" | "backend">("all");
  const overwriteMode = ref<"overwrite" | "skip" | "ifChanged">("overwrite");
  const writeProgress = reactive({ total: 0, done: 0, percent: 0, current: "" });
  const writeRunning = ref(false);
  const lastPreviewFiles = ref<GeneratorPreviewItem[]>([]);

  const needFrontend = computed(() =>
    lastPreviewFiles.value.some((f) => resolveRootForItem(f) === "frontend")
  );
  const needBackend = computed(() =>
    lastPreviewFiles.value.some((f) => resolveRootForItem(f) === "backend")
  );
  // 只要有预览文件就可以点写入按钮，目录在弹窗里选
  const canWriteToLocal = computed(() => lastPreviewFiles.value.length > 0);

  /**
   * 打开写入本地弹窗
   */
  function openWriteDialog() {
    writeDialog.visible = true;
  }

  /**
   * 暂存预览文件列表
   */
  function setPreviewFiles(files: GeneratorPreviewItem[]) {
    lastPreviewFiles.value = files;
  }

  /**
   * 选择前端项目目录
   */
  async function pickFrontendDir() {
    try {
      frontendDirHandle.value = await (window as any).showDirectoryPicker();
      frontendDirPath.value = frontendDirHandle.value?.name || "";
      ElMessage.success("前端目录选择成功");
    } catch {
      // 用户取消
    }
  }

  /**
   * 选择后端项目目录
   */
  async function pickBackendDir() {
    try {
      backendDirHandle.value = await (window as any).showDirectoryPicker();
      backendDirPath.value = backendDirHandle.value?.name || "";
      ElMessage.success("后端目录选择成功");
    } catch {
      // 用户取消
    }
  }

  /**
   * 确认写入本地
   */
  async function confirmWrite() {
    await writeGeneratedCode();
    writeDialog.visible = false;
  }

  // ---- 内部工具函数 ----

  /**
   * 判断生成项写入前端还是后端根目录
   */
  function resolveRootForItem(item: GeneratorPreviewItem): "frontend" | "backend" {
    return item.scope === "backend" ? "backend" : "frontend";
  }

  /**
   * 去掉路径里的项目根目录前缀
   */
  function stripProjectRoot(p: string): string {
    const normalized = p.replace(/\\/g, "/");
    const frontApp = genConfigFormData.value.frontendAppName;
    const backApp = genConfigFormData.value.backendAppName;
    if (frontApp && normalized.startsWith(`${frontApp}/`))
      return normalized.slice(frontApp.length + 1);
    if (backApp && normalized.startsWith(`${backApp}/`))
      return normalized.slice(backApp.length + 1);
    const idx = normalized.indexOf("/src/");
    if (idx > -1) return normalized.slice(idx + 1);
    if (normalized.startsWith("src/")) return normalized;
    return normalized;
  }

  /**
   * 逐级创建/获取目录句柄
   */
  async function ensureDir(root: FileSystemDirectoryHandle, path: string[], create = true) {
    let current = root;
    for (const segment of path) {
      current = await current.getDirectoryHandle(segment, { create });
    }
    return current;
  }

  /**
   * 把单个文件写入目录
   */
  async function writeFileToDir(
    dirHandle: FileSystemDirectoryHandle,
    filePath: string,
    content: string
  ) {
    const normalized = filePath.replace(/\\/g, "/");
    const parts = normalized.split("/").filter(Boolean);
    const fileName = parts.pop();
    if (!fileName) return;
    const targetDir = await ensureDir(dirHandle, parts, true);
    const fileHandle = await targetDir.getFileHandle(fileName, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(content ?? "");
    await writable.close();
  }

  /**
   * 判断目录下的文件是否存在
   */
  async function pathExists(
    dirHandle: FileSystemDirectoryHandle,
    filePath: string
  ): Promise<boolean> {
    try {
      const normalized = filePath.replace(/\\/g, "/");
      const parts = normalized.split("/").filter(Boolean);
      const fileName = parts.pop();
      if (!fileName) return false;
      const targetDir = await ensureDir(dirHandle, parts, false);
      await targetDir.getFileHandle(fileName, { create: false });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 判断文件内容是否与本地一致
   */
  async function isSameFile(
    dirHandle: FileSystemDirectoryHandle,
    filePath: string,
    content: string
  ): Promise<boolean> {
    try {
      const normalized = filePath.replace(/\\/g, "/");
      const parts = normalized.split("/").filter(Boolean);
      const fileName = parts.pop();
      if (!fileName) return false;
      const targetDir = await ensureDir(dirHandle, parts, false);
      const fileHandle = await targetDir.getFileHandle(fileName, { create: false });
      const file = await fileHandle.getFile();
      const text = await file.text();
      return text === (content ?? "");
    } catch {
      return false;
    }
  }

  /**
   * 按选择的目录写入全部生成文件
   */
  async function writeGeneratedCode() {
    if (!supportsFSAccess) {
      ElMessage.warning("当前浏览器不支持本地写入，请选择下载ZIP");
      return;
    }
    if (
      (needFrontend.value && !frontendDirHandle.value) ||
      (needBackend.value && !backendDirHandle.value)
    ) {
      ElMessage.warning("请先选择所需的前/后端目录");
      return;
    }
    if (!lastPreviewFiles.value.length) {
      ElMessage.warning("请先生成预览");
      return;
    }

    const loadingSvc = ElLoading.service({ lock: true, text: "正在写入代码..." });
    writeRunning.value = true;
    let frontCount = 0;
    let backCount = 0;
    const failed: string[] = [];

    const files = lastPreviewFiles.value.filter(
      (f) => writeScope.value === "all" || resolveRootForItem(f) === writeScope.value
    );
    writeProgress.total = files.length;
    writeProgress.done = 0;
    writeProgress.percent = 0;
    writeProgress.current = "";

    const concurrency = 4;
    const queue = files.slice();

    /**
     * 并发写入队列的工作函数
     */
    async function worker() {
      while (queue.length) {
        const item = queue.shift();
        if (!item) break;
        try {
          await (async () => {
            const root = resolveRootForItem(item);
            const relativePath = stripProjectRoot(`${item.path}/${item.fileName}`);
            writeProgress.current = relativePath;

            const targetRoot =
              root === "frontend" ? frontendDirHandle.value : backendDirHandle.value;

            if (!targetRoot) return;

            if (overwriteMode.value === "ifChanged") {
              const same = await isSameFile(targetRoot, relativePath, item.content || "");
              if (same) return;
            }
            if (overwriteMode.value === "skip") {
              const exists = await pathExists(targetRoot, relativePath);
              if (exists) return;
            }

            await writeFileToDir(targetRoot, relativePath, item.content || "");
            if (root === "frontend") frontCount++;
            else backCount++;
          })().catch((err) => {
            console.error("写入失败:", item.path, err);
            failed.push(item.path);
          });
        } finally {
          writeProgress.done++;
          writeProgress.percent = Math.round((writeProgress.done / writeProgress.total) * 100);
        }
      }
    }

    await Promise.all(Array.from({ length: concurrency }, () => worker()));
    loadingSvc.close();
    writeRunning.value = false;

    if (failed.length) {
      ElMessage.warning(
        `部分文件写入失败 ${failed.length} 个，成功 前端 ${frontCount} 个，后端 ${backCount} 个`
      );
    } else {
      ElMessage.success(`写入完成：前端 ${frontCount} 个文件，后端 ${backCount} 个文件`);
    }
  }

  return {
    supportsFSAccess,
    writeDialog,
    frontendDirPath,
    backendDirPath,
    writeScope,
    overwriteMode,
    writeProgress,
    writeRunning,
    canWriteToLocal,
    openWriteDialog,
    setPreviewFiles,
    pickFrontendDir,
    pickBackendDir,
    confirmWrite,
  };
}
