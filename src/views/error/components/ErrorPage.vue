<template>
  <section class="error-page">
    <div class="error-page__inner">
      <div class="error-page__content">
        <div class="error-page__label">{{ label }}</div>
        <h1 class="error-page__code">{{ statusCode }}</h1>
        <h2 class="error-page__title">{{ title }}</h2>
        <p class="error-page__description">{{ description }}</p>
        <div class="error-page__actions">
          <slot name="actions" />
        </div>
      </div>

      <div class="error-page__visual" aria-hidden="true">
        <div class="error-visual">
          <div class="error-visual__header">
            <span />
            <span />
            <span />
          </div>

          <div class="error-visual__body">
            <div class="error-visual__summary">
              <div class="error-visual__icon">
                <el-icon :size="34">
                  <component :is="visualIcon" />
                </el-icon>
              </div>
              <div>
                <div class="error-visual__status">{{ statusCode }}</div>
                <div class="error-visual__name">{{ visualName }}</div>
              </div>
            </div>

            <svg class="error-visual__route" viewBox="0 0 360 136">
              <path class="error-visual__route-line" d="M56 48 H148 C174 48 174 88 200 88 H302" />
              <rect class="error-visual__node" x="24" y="30" width="64" height="36" rx="6" />
              <rect class="error-visual__node" x="136" y="30" width="64" height="36" rx="6" />
              <rect
                class="error-visual__node error-visual__node--muted"
                x="272"
                y="70"
                width="64"
                height="36"
                rx="6"
              />
              <path class="error-visual__break" d="M224 76 L246 98 M246 76 L224 98" />
            </svg>

            <div class="error-visual__meta">
              <span>{{ visualMeta }}</span>
              <strong>{{ statusCode }}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, type Component } from "vue";
import { Lock, Search } from "@element-plus/icons-vue";

interface ErrorPageProps {
  statusCode: string;
  label: string;
  title: string;
  description: string;
  variant: "locked" | "missing";
}

const props = defineProps<ErrorPageProps>();

// 使用系统色生成异常页视觉，避免固定插画破坏主题一致性
const visualIcon = computed<Component>(() => (props.variant === "locked" ? Lock : Search));
const visualName = computed(() => (props.variant === "locked" ? "ACCESS CONTROL" : "ROUTE TRACE"));
const visualMeta = computed(() =>
  props.variant === "locked" ? "权限校验未通过" : "目标路由未匹配"
);
</script>

<style lang="scss" scoped>
.error-page {
  display: grid;
  place-items: center;
  min-height: 100%;
  padding: 56px 32px;
  color: var(--el-text-color-primary);
  background: var(--page-bg);
}

.error-page__inner {
  display: grid;
  grid-template-columns: minmax(0, 0.88fr) minmax(360px, 1fr);
  gap: 56px;
  align-items: center;
  width: min(1040px, 100%);
}

.error-page__content {
  min-width: 0;
}

.error-page__label {
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 10px;
  margin-bottom: 18px;
  font-size: 13px;
  font-weight: 500;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  border: 1px solid var(--el-color-primary-light-8);
  border-radius: 6px;
}

.error-page__code {
  margin: 0;
  font-size: 112px;
  font-weight: 700;
  line-height: 0.9;
  color: var(--el-color-primary);
  letter-spacing: 0;
}

.error-page__title {
  margin: 28px 0 0;
  font-size: 26px;
  font-weight: 600;
  line-height: 1.35;
  color: var(--el-text-color-primary);
  letter-spacing: 0;
}

.error-page__description {
  max-width: 440px;
  margin: 12px 0 0;
  font-size: 15px;
  line-height: 1.8;
  color: var(--el-text-color-secondary);
}

.error-page__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  margin-top: 28px;

  :deep(.el-button) {
    margin-left: 0;
  }
}

.error-page__visual {
  display: flex;
  justify-content: center;
  min-width: 0;
}

.error-visual {
  width: min(420px, 100%);
  overflow: hidden;
  background: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  box-shadow: var(--card-shadow, 0 16px 40px rgb(0 0 0 / 8%));
}

.error-visual__header {
  display: flex;
  gap: 6px;
  align-items: center;
  height: 42px;
  padding: 0 16px;
  background: var(--el-fill-color-lighter);
  border-bottom: 1px solid var(--el-border-color-lighter);

  span {
    width: 18px;
    height: 6px;
    background: var(--el-fill-color-dark);
    border-radius: 3px;
  }
}

.error-visual__body {
  padding: 28px;
}

.error-visual__summary {
  display: flex;
  gap: 16px;
  align-items: center;
}

.error-visual__icon {
  display: grid;
  place-items: center;
  width: 68px;
  height: 68px;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  border: 1px solid var(--el-color-primary-light-8);
  border-radius: 8px;
}

.error-visual__status {
  font-size: 34px;
  font-weight: 700;
  line-height: 1;
  color: var(--el-text-color-primary);
  letter-spacing: 0;
}

.error-visual__name {
  margin-top: 8px;
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-secondary);
  letter-spacing: 0;
}

.error-visual__route {
  display: block;
  width: 100%;
  height: auto;
  margin-top: 28px;
}

.error-visual__route-line {
  fill: none;
  stroke: var(--el-color-primary-light-5);
  stroke-width: 4;
  stroke-linecap: round;
  stroke-dasharray: 8 10;
}

.error-visual__node {
  fill: var(--el-color-primary-light-9);
  stroke: var(--el-color-primary-light-7);
  stroke-width: 2;
}

.error-visual__node--muted {
  fill: var(--el-fill-color-lighter);
  stroke: var(--el-border-color);
}

.error-visual__break {
  fill: none;
  stroke: var(--el-color-primary);
  stroke-width: 4;
  stroke-linecap: round;
}

.error-visual__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 40px;
  padding: 0 12px;
  margin-top: 18px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-lighter);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;

  strong {
    font-size: 14px;
    font-weight: 700;
    color: var(--el-color-primary);
  }
}

@media (width <= 900px) {
  .error-page {
    padding: 40px 20px;
  }

  .error-page__inner {
    grid-template-columns: 1fr;
    gap: 36px;
  }

  .error-page__code {
    font-size: 84px;
  }

  .error-page__title {
    font-size: 22px;
  }
}

@media (width <= 520px) {
  .error-page {
    padding: 28px 16px;
  }

  .error-page__code {
    font-size: 68px;
  }

  .error-page__visual {
    display: none;
  }
}
</style>
