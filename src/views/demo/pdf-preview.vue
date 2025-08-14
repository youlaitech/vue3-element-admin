<template>
  <div class="app-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header flex justify-between items-center">
          <div class="flex items-center gap-2">
            <span>PDF预览组件演示</span>
            <el-tag type="info">vue-pdf-embed</el-tag>
          </div>
          <el-link
            :icon="Link"
            href="https://gitee.com/youlaiorg/vue3-element-admin/blob/master/src/views/demo/pdf-preview.vue"
            type="primary"
            target="_blank"
          >
            源码
          </el-link>
        </div>
      </template>

      <div class="pdf-layout">
        <!-- 左侧：控制面板 + 工具栏 + 设置 -->
        <div class="side-panel">
          <!-- 控制面板 -->
          <div class="control-panel mb-4">
            <el-row :gutter="16">
              <el-col :span="24">
                <el-form-item label="选择PDF文件:">
                  <el-select v-model="selectedPdf" placeholder="请选择PDF文件" style="width: 100%">
                    <el-option
                      v-for="pdf in pdfOptions"
                      :key="pdf.value"
                      :label="pdf.label"
                      :value="pdf.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="自定义PDF链接:">
                  <el-input
                    v-model="customPdfUrl"
                    placeholder="请输入PDF链接"
                    @keyup.enter="loadCustomPdf"
                  >
                    <template #append>
                      <el-button @click="loadCustomPdf">加载</el-button>
                    </template>
                  </el-input>
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <!-- PDF工具栏 -->
          <div class="pdf-toolbar mb-4">
            <el-row :gutter="12" class="items-center">
              <el-col :span="24">
                <div class="flex items-center gap-2 mb-2">
                  <el-button
                    type="primary"
                    :icon="ZoomIn"
                    size="small"
                    :disabled="!pdfSrc"
                    @click="zoomIn"
                  >
                    放大
                  </el-button>
                  <el-button
                    type="primary"
                    :icon="ZoomOut"
                    size="small"
                    :disabled="!pdfSrc"
                    @click="zoomOut"
                  >
                    缩小
                  </el-button>
                  <el-button size="small" :disabled="!pdfSrc" @click="resetZoom">
                    重置缩放
                  </el-button>
                </div>
                <div class="flex items-center gap-2">
                  <el-button
                    type="primary"
                    size="small"
                    :disabled="currentPage <= 1"
                    @click="prevPage"
                  >
                    上一页
                  </el-button>
                  <el-input-number
                    v-model="currentPage"
                    :min="minPage"
                    :max="maxPage"
                    size="small"
                    style="width: 120px"
                    :disabled="!pdfSrc"
                    @change="handlePageNumberChange"
                  />
                  <span class="text-sm text-gray-500">/ {{ totalPages }}</span>
                  <el-button
                    type="primary"
                    size="small"
                    :disabled="currentPage >= totalPages"
                    @click="nextPage"
                  >
                    下一页
                  </el-button>
                </div>
                <div class="flex items-center justify-between mt-2">
                  <span class="text-sm text-gray-500">缩放: {{ Math.round(scale * 100) }}%</span>
                  <el-button
                    type="success"
                    :icon="Download"
                    size="small"
                    :disabled="!pdfSrc"
                    @click="downloadPdf"
                  >
                    下载
                  </el-button>
                </div>
              </el-col>
            </el-row>
          </div>

          <!-- 设置面板 -->
          <div class="settings-panel">
            <el-row :gutter="16">
              <el-col :span="24">
                <el-form-item label="显示缩略图:">
                  <el-switch v-model="showThumbnails" />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="旋转角度:">
                  <el-select v-model="rotation" style="width: 100%">
                    <el-option label="0°" :value="0" />
                    <el-option label="90°" :value="90" />
                    <el-option label="180°" :value="180" />
                    <el-option label="270°" :value="270" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </div>

        <!-- 中间：预览区域 -->
        <div class="preview-panel">
          <div
            ref="previewWrapRef"
            v-loading="loading"
            class="pdf-container"
            element-loading-text="PDF加载中..."
            element-loading-background="rgba(255,255,255,0.6)"
          >
            <div v-if="error" class="error-container">
              <el-result icon="error" title="PDF加载失败" :sub-title="error">
                <template #extra>
                  <el-button type="primary" @click="retryLoad">重试</el-button>
                </template>
              </el-result>
            </div>

            <div v-else-if="!pdfSrc" class="empty-container">
              <el-empty description="请选择要预览的PDF文件" />
            </div>

            <div v-else class="pdf-viewer">
              <VuePdfEmbed
                ref="pdfRef"
                :source="pdfSrc"
                :page="currentPage"
                :width="pageWidth"
                :rotation="rotation"
                class="pdf-embed"
                @loaded="onPdfLoaded"
                @loading-failed="onLoadingFailed"
                @page-loaded="onPageLoaded"
                @password-requested="onPasswordRequested"
              />
            </div>
          </div>
        </div>

        <!-- 右侧：竖向缩略图栏 -->
        <div v-if="showThumbnails && pdfSrc" class="thumb-panel">
          <div class="thumbs-wrap">
            <div
              v-for="pageNum in totalPages"
              :key="pageNum"
              :class="['thumb-item', { active: pageNum === currentPage }]"
              @click="goToPage(pageNum)"
            >
              <VuePdfEmbed :source="pdfSrc" :page="pageNum" :scale="0.2" class="thumbnail-pdf" />
              <div class="thumb-label">{{ pageNum }}</div>
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import VuePdfEmbed from "vue-pdf-embed";
import { ZoomIn, ZoomOut, Download, Link } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";

defineOptions({
  name: "PdfPreview",
  inheritAttrs: false,
});

// PDF源文件
const pdfSrc = ref<string>("");
const selectedPdf = ref<string>("");
const customPdfUrl = ref<string>("");

// PDF状态
const loading = ref(false);
const error = ref<string>("");
const totalPages = ref(0);
const currentPage = ref(1);
const scale = ref(1.0);
const rotation = ref(0);
// 确保 InputNumber 的 min <= max
const minPage = computed(() => 1);
const maxPage = computed(() => Math.max(totalPages.value, 1));

// 设置选项
const showThumbnails = ref(false);

// PDF引用
const pdfRef = ref();
const previewWrapRef = ref<HTMLElement | null>(null);

// 缩放以“容器宽度”为基准：pageWidth = containerWidth * scale
const pageWidth = ref<number | undefined>(undefined);
const updatePageWidth = () => {
  const wrap = previewWrapRef.value;
  if (!wrap) return;
  // 预留左右 padding
  const containerWidth = Math.max(200, wrap.clientWidth - 40);
  pageWidth.value = Math.round(containerWidth * scale.value);
};

// 预设PDF选项
const pdfOptions = [
  {
    label: "示例PDF文档",
    value: "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf",
  },
];

// 监听选中的PDF变化
watch(selectedPdf, (newVal) => {
  if (newVal) loadPdf(newVal);
});

// 默认选中第一个示例并加载
onMounted(() => {
  if (!selectedPdf.value && pdfOptions.length > 0) {
    selectedPdf.value = pdfOptions[0].value;
  }
  // 初始计算
  nextTick(updatePageWidth);
  window.addEventListener("resize", updatePageWidth);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", updatePageWidth);
});

// 加载PDF
const loadPdf = async (url: string) => {
  loading.value = true;
  error.value = "";
  pdfSrc.value = url;
  currentPage.value = 1;
  scale.value = 1.0;
  rotation.value = 0;
  nextTick(updatePageWidth);
};

// 加载自定义PDF
const loadCustomPdf = () => {
  if (!customPdfUrl.value.trim()) return ElMessage.warning("请输入PDF链接");
  if (!customPdfUrl.value.toLowerCase().endsWith(".pdf"))
    return ElMessage.warning("请输入有效的PDF链接");
  loadPdf(customPdfUrl.value.trim());
};

// 仅在首次/切换 source 时提示加载完成
const lastLoadedSrc = ref<string>("");
const onPdfLoaded = (pdf: any) => {
  loading.value = false;
  totalPages.value = pdf.numPages;
  if (pdfSrc.value !== lastLoadedSrc.value) {
    lastLoadedSrc.value = pdfSrc.value;
    ElMessage.success(`PDF加载成功，共 ${pdf.numPages} 页`);
  }
};

// PDF加载失败
const onLoadingFailed = (error: any) => {
  loading.value = false;
  error.value = error.message || "PDF加载失败";
  ElMessage.error("PDF加载失败: " + error.value);
};

// 页面加载完成
const onPageLoaded = () => {};

// 密码保护的PDF
const onPasswordRequested = async (callback: any) => {
  try {
    const { value: password } = await ElMessageBox.prompt(
      "此PDF文件受密码保护，请输入密码",
      "密码验证",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        inputType: "password",
      }
    );
    callback(password);
  } catch {
    callback(null);
  }
};

// 重试加载
const retryLoad = () => {
  if (pdfSrc.value) loadPdf(pdfSrc.value);
};

// 放大/缩小/重置
const zoomIn = () => {
  scale.value = Math.min(scale.value + 0.25, 3.0);
  updatePageWidth();
};
const zoomOut = () => {
  scale.value = Math.max(scale.value - 0.25, 0.25);
  updatePageWidth();
};
const resetZoom = () => {
  scale.value = 1.0;
  updatePageWidth();
};

// 上一页/下一页
const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--;
};
const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++;
};

// 跳转到指定页（用于按钮/缩略图）
const goToPage = (page: number) => {
  if (typeof page !== "number") return;
  if (page >= 1 && page <= totalPages.value) currentPage.value = page;
};

// 处理 el-input-number 的 @change 回调签名 (cur, prev)
const handlePageNumberChange = (cur?: number) => {
  if (typeof cur !== "number") return;
  goToPage(cur);
};

// 下载PDF
const downloadPdf = () => {
  if (!pdfSrc.value) return;
  const src = pdfSrc.value as string;

  // 如果是 http(s) 链接，用 fetch 以 Blob 下载，确保进入浏览器下载管理器
  if (/^https?:/i.test(src)) {
    (async () => {
      try {
        const response = await fetch(src, { mode: "cors" });
        const blob = await response.blob();

        // 从响应头或 URL 推断文件名
        const getFileName = () => {
          const cd = response.headers.get("content-disposition") || "";
          const m = cd.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i);
          if (m) return decodeURIComponent(m[1] || m[2]);
          try {
            const u = new URL(src, window.location.href);
            const name = u.pathname.split("/").pop() || "";
            return name || `document-${Date.now()}.pdf`;
          } catch {
            return `document-${Date.now()}.pdf`;
          }
        };

        const fileName = getFileName();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        ElMessage.success("已开始下载");
      } catch {
        // 回退到组件内置下载
        try {
          await (pdfRef.value as any)?.download?.(`document-${Date.now()}.pdf`);
        } catch {
          ElMessage.error("下载失败");
        }
      }
    })();
    return;
  }

  // 其他来源（如 base64、本地 Blob 等）使用组件自带方法
  try {
    (pdfRef.value as any)?.download?.(`document-${Date.now()}.pdf`);
  } catch {
    // 最后兜底：创建本地链接
    const link = document.createElement("a");
    link.href = src;
    link.download = `document-${Date.now()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
</script>

<style lang="scss" scoped>
.app-container {
  .card-header {
    font-weight: 600;
  }

  .pdf-layout {
    display: flex;
    gap: 16px;
  }

  .side-panel {
    position: sticky;
    top: 0;
    flex-shrink: 0;
    align-self: flex-start;
    width: 320px;
  }

  .control-panel {
    padding: 16px;
    background-color: var(--el-bg-color-page);
    border-radius: 6px;
  }

  .pdf-toolbar {
    padding: 12px;
    background-color: var(--el-fill-color-lighter);
    border: 1px solid var(--el-border-color-light);
    border-radius: 6px;
  }

  .preview-panel {
    flex: 1;
    min-width: 0;
  }

  .pdf-container {
    position: relative;
    min-height: 400px;
    max-height: 80vh; /* 预览区域上限高度，超出出现滚动条 */
    overflow: auto; /* 允许横向滚动以展示放大效果 */
    background-color: #f5f5f5;
    border: 1px solid var(--el-border-color);
    border-radius: 6px;

    .loading-container,
    .error-container,
    .empty-container {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 400px;
    }

    .pdf-viewer {
      display: flex;
      justify-content: flex-start; /* 放大后从左侧开始，避免被居中压缩 */
      padding: 20px;

      .pdf-embed {
        border: 1px solid #ddd;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        :deep(canvas) {
          display: block;
          max-width: none !important; /* 允许超出容器按实际像素渲染 */
        }
        /* 让 overlay 图层不参与流式高度计算 */
        :deep(.textLayer),
        :deep(.annotationLayer) {
          position: absolute !important;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          pointer-events: auto;
        }
      }
    }
  }

  /* 右侧缩略图栏 */
  .thumb-panel {
    flex-shrink: 0;
    align-self: flex-start;
    width: 220px;
  }
  .thumbs-wrap {
    max-height: 80vh;
    padding: 8px;
    overflow-y: auto;
    background: var(--el-bg-color-page);
    border: 1px solid var(--el-border-color-light);
    border-radius: 6px;
  }
  .thumb-item {
    position: relative;
    padding: 8px;
    margin-bottom: 8px;
    cursor: pointer;
    border: 2px solid transparent;
    border-radius: 4px;
    transition: all 0.2s ease;
    &:hover {
      background-color: var(--el-color-primary-light-9);
      border-color: var(--el-color-primary);
    }
    &.active {
      background-color: var(--el-color-primary-light-8);
      border-color: var(--el-color-primary);
    }
    .thumbnail-pdf {
      width: 100%;
      border: 1px solid #ddd;
    }
    .thumb-label {
      margin-top: 4px;
      font-size: 12px;
      color: var(--el-text-color-regular);
      text-align: center;
    }
  }

  .settings-panel {
    padding: 16px;
    background-color: var(--el-bg-color-page);
    border-radius: 6px;
  }
}
</style>
