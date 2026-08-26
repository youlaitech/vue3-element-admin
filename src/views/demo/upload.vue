<!-- 文件上传组件示例 -->
<template>
  <div class="page-container upload-demo">
    <!-- 页头 -->
    <header class="page-header">
      <div class="page-header__info">
        <h2 class="page-header__title">文件上传</h2>
        <p class="page-header__desc">
          SingleImageUpload、MultiImageUpload、FileUpload 通用上传组件演示，右侧实时预览 v-model
          绑定值
        </p>
      </div>
      <el-button
        class="page-header__link"
        tag="a"
        href="https://gitee.com/youlaiorg/vue3-element-admin/blob/master/src/views/demo/upload.vue"
        target="_blank"
        type="primary"
        plain
        round
      >
        <template #icon>
          <el-icon><Link /></el-icon>
        </template>
        示例源码
      </el-button>
    </header>

    <!-- 单图上传 -->
    <section class="demo-card">
      <header class="demo-card__header">
        <span class="demo-card__icon demo-card__icon--primary">
          <el-icon :size="18"><Picture /></el-icon>
        </span>
        <div class="demo-card__meta">
          <h3 class="demo-card__title">单图上传</h3>
          <p class="demo-card__desc">
            头像、封面等仅需一张图片的场景，自带格式与大小校验，支持预览、删除
          </p>
        </div>
        <el-tag effect="plain" size="small">SingleImageUpload</el-tag>
      </header>

      <div class="demo-card__body">
        <div class="demo-card__stage">
          <SingleImageUpload v-model="picUrl" />
        </div>
        <aside class="value-panel">
          <div class="value-panel__caption">
            <span class="value-panel__label">v-model</span>
            <code class="value-panel__type">string</code>
          </div>
          <pre class="value-panel__code" :class="{ 'is-empty': !picUrl }">{{ picUrlJson }}</pre>
        </aside>
      </div>
    </section>

    <!-- 多图上传 -->
    <section class="demo-card">
      <header class="demo-card__header">
        <span class="demo-card__icon demo-card__icon--success">
          <el-icon :size="18"><Pictures /></el-icon>
        </span>
        <div class="demo-card__meta">
          <h3 class="demo-card__title">多图上传</h3>
          <p class="demo-card__desc">
            相册、轮播等需要多张图片的场景，数量上限 limit 可配（示例 limit=2），支持预览、删除
          </p>
        </div>
        <el-tag effect="plain" size="small" type="success">MultiImageUpload</el-tag>
      </header>

      <div class="demo-card__body">
        <div class="demo-card__stage">
          <MultiImageUpload v-model="picUrls" :limit="2" />
        </div>
        <aside class="value-panel">
          <div class="value-panel__caption">
            <span class="value-panel__label">v-model</span>
            <code class="value-panel__type">string[]</code>
          </div>
          <pre class="value-panel__code" :class="{ 'is-empty': picUrls.length === 0 }">{{
            picUrlsJson
          }}</pre>
        </aside>
      </div>
    </section>

    <!-- 文件上传 -->
    <section class="demo-card">
      <header class="demo-card__header">
        <span class="demo-card__icon demo-card__icon--warning">
          <el-icon :size="18"><Files /></el-icon>
        </span>
        <div class="demo-card__meta">
          <h3 class="demo-card__title">文件上传</h3>
          <p class="demo-card__desc">任意类型文件多选上传，实时展示上传进度，支持下载、删除</p>
        </div>
        <el-tag effect="plain" size="small" type="warning">FileUpload</el-tag>
      </header>

      <div class="demo-card__body">
        <div class="demo-card__stage">
          <FileUpload v-model="fileUrls" />
        </div>
        <aside class="value-panel">
          <div class="value-panel__caption">
            <span class="value-panel__label">v-model</span>
            <code class="value-panel__type">FileInfo[]</code>
          </div>
          <pre class="value-panel__code" :class="{ 'is-empty': fileUrls.length === 0 }">{{
            fileUrlsJson
          }}</pre>
        </aside>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
// 单图
const picUrl = ref("https://s2.loli.net/2023/05/24/yNsxFC8rLHMZQcK.jpg");
const picUrls = ref(["https://s2.loli.net/2023/05/24/yNsxFC8rLHMZQcK.jpg"]);

const fileUrls = ref([
  { name: "照片1.jpg", url: "https://s2.loli.net/2023/05/24/yNsxFC8rLHMZQcK.jpg" },
  { name: "照片2.jpg", url: "https://s2.loli.net/2023/05/24/RuHFMwW4rG5lIqs.jpg" },
]);

// 绑定值 JSON 预览
const picUrlJson = computed(() => (picUrl.value ? JSON.stringify(picUrl.value) : "// 暂无数据"));
const picUrlsJson = computed(() =>
  picUrls.value.length ? JSON.stringify(picUrls.value, null, 2) : "// 暂无数据"
);
const fileUrlsJson = computed(() =>
  fileUrls.value.length ? JSON.stringify(fileUrls.value, null, 2) : "// 暂无数据"
);
</script>

<style scoped lang="scss">
$code-font: ui-monospace, SFMono-Regular, "Cascadia Mono", Consolas, monospace;

.upload-demo {
  overflow: auto;
}

.page-header {
  display: flex;
  flex-shrink: 0;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  padding: 4px 4px 0;

  &__info {
    min-width: 0;
  }

  &__title {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    line-height: 28px;
    color: var(--el-text-color-primary);
  }

  &__desc {
    margin: 4px 0 0;
    font-size: 13px;
    line-height: 20px;
    color: var(--el-text-color-secondary);
  }

  &__link {
    flex-shrink: 0;
  }
}

.demo-card {
  flex-shrink: 0;
  padding: 20px 24px;
  background: var(--content-bg);
  border: 1px solid var(--card-border);
  border-radius: var(--card-radius);
  box-shadow: var(--card-shadow);
  transition:
    border-color 0.2s,
    box-shadow 0.2s;

  &:hover {
    border-color: var(--card-border-hover);
    box-shadow: var(--card-shadow-hover);
  }

  &__header {
    display: flex;
    gap: 14px;
    align-items: center;
    margin-bottom: 18px;
  }

  &__icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 10px;

    &--primary {
      color: var(--el-color-primary);
      background: var(--el-color-primary-light-9);
    }

    &--success {
      color: var(--el-color-success);
      background: var(--el-color-success-light-9);
    }

    &--warning {
      color: var(--el-color-warning);
      background: var(--el-color-warning-light-9);
    }
  }

  &__meta {
    flex: 1;
    min-width: 0;
  }

  &__title {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    line-height: 22px;
    color: var(--el-text-color-primary);
  }

  &__desc {
    margin: 2px 0 0;
    font-size: 12px;
    line-height: 18px;
    color: var(--el-text-color-secondary);
  }

  &__body {
    display: flex;
    gap: 24px;
    align-items: stretch;
  }

  &__stage {
    flex-shrink: 0;
    min-width: 0;
  }
}

.value-panel {
  display: flex;
  flex: 1 1 0;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  padding-left: 24px;
  border-left: 1px dashed var(--card-border);

  &__caption {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  &__label {
    font-size: 12px;
    font-weight: 600;
    color: var(--el-text-color-regular);
  }

  &__type {
    padding: 1px 8px;
    font-family: $code-font;
    font-size: 11px;
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
    border-radius: 4px;
  }

  &__code {
    flex: 1;
    max-height: 180px;
    padding: 12px 14px;
    margin: 0;
    overflow: auto;
    font-family: $code-font;
    font-size: 12px;
    line-height: 1.7;
    color: var(--el-text-color-regular);
    word-break: break-all;
    white-space: pre-wrap;
    background: var(--el-fill-color-light);
    border-radius: 6px;

    &.is-empty {
      font-style: italic;
      color: var(--el-text-color-placeholder);
    }
  }
}

// 窄屏时上下排列
@media (max-width: 992px) {
  .demo-card__body {
    flex-direction: column;
  }

  .value-panel {
    padding-top: 16px;
    padding-left: 0;
    border-top: 1px dashed var(--card-border);
    border-left: none;
  }
}
</style>
