<template>
  <el-dropdown class="notice__dropdown" trigger="click" @visible-change="handleVisibleChange">
    <div class="notice__trigger">
      <div class="notice__icon">
        <el-icon class="notice__bell" :size="16">
          <Bell />
        </el-icon>
        <span v-if="unreadTotal > 0" class="notice__pulse" />
      </div>
    </div>

    <template #dropdown>
      <div class="notice__panel">
        <div class="notice__tabs">
          <button
            type="button"
            :class="['notice__tab', { 'is-active': activeStatus === 0 }]"
            @click.stop="switchStatus(0)"
          >
            <span>未读</span>
            <span v-if="unreadTotal > 0" class="notice__count">
              {{ unreadTotal > 99 ? "99+" : unreadTotal }}
            </span>
          </button>
          <button
            type="button"
            :class="['notice__tab', { 'is-active': activeStatus === 1 }]"
            @click.stop="switchStatus(1)"
          >
            已读
          </button>
        </div>

        <div v-if="list.length > 0" class="notice__list">
          <div
            v-for="item in list"
            :key="item.id"
            :class="['notice__item', { 'is-read': item.isRead === 1 }]"
          >
            <DictTag v-model="item.type" code="notice_type" size="small" />
            <el-text size="small" class="notice__title" truncated @click="read(item.id)">
              {{ item.title }}
            </el-text>

            <div class="notice__time">
              {{ item.publishTime }}
            </div>
          </div>
        </div>
        <div v-else class="notice__empty">
          <el-empty :image-size="54" :description="emptyText" />
        </div>

        <el-divider class="notice__divider" />
        <div class="notice__footer">
          <el-link type="primary" underline="never" @click="goMore">
            <span class="text-xs">查看更多</span>
            <el-icon class="text-xs">
              <ArrowRight />
            </el-icon>
          </el-link>
          <el-link v-if="unreadTotal > 0" type="primary" underline="never" @click="readAll">
            <span class="text-xs">全部已读</span>
          </el-link>
        </div>
      </div>
    </template>
  </el-dropdown>

  <el-dialog
    v-model="dialogVisible"
    :title="detail?.title ?? '通知详情'"
    width="800px"
    custom-class="notification-detail"
  >
    <div v-if="detail" class="p-x-20px">
      <div class="flex-y-center mb-16px text-13px text-color-secondary">
        <span class="flex-y-center">
          <el-icon><User /></el-icon>
          {{ detail.publisherName }}
        </span>
        <span class="ml-2 flex-y-center">
          <el-icon><Timer /></el-icon>
          {{ detail.publishTime }}
        </span>
      </div>

      <div class="max-h-60vh pt-16px mb-24px overflow-y-auto border-t border-solid border-color">
        <div v-html="detail.content"></div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { useNotice } from "./useNotice";

const {
  list,
  unreadTotal,
  activeStatus,
  emptyText,
  detail,
  dialogVisible,
  switchStatus,
  refresh,
  read,
  readAll,
  goMore,
} = useNotice();

function handleVisibleChange(visible: boolean) {
  if (visible) refresh();
}
</script>

<style lang="scss" scoped>
.notice {
  &__dropdown {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  &__trigger {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  &__icon {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 6px;
  }

  &__bell {
    color: var(--el-text-color-regular);
  }

  &__pulse {
    position: absolute;
    top: 4px;
    right: 5px;
    width: 6px;
    height: 6px;
    background: var(--el-color-danger);
    border: 1px solid var(--el-bg-color);
    border-radius: 50%;

    &::after {
      position: absolute;
      inset: -1px;
      content: "";
      background: var(--el-color-danger);
      border-radius: inherit;
      animation: notice-pulse 1.8s ease-out infinite;
    }
  }

  &__panel {
    width: 390px;
    padding: 12px;
  }

  &__tabs {
    display: flex;
    gap: 4px;
    padding: 3px;
    margin-bottom: 8px;
    background: var(--el-fill-color-light);
    border-radius: 6px;
  }

  &__tab {
    display: inline-flex;
    flex: 1;
    gap: 6px;
    align-items: center;
    justify-content: center;
    height: 28px;
    padding: 0 10px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    cursor: pointer;
    background: transparent;
    border: 0;
    border-radius: 5px;

    &.is-active {
      font-weight: 500;
      color: var(--el-color-primary);
      background: var(--el-bg-color-overlay);
      box-shadow: 0 1px 2px rgb(15 23 42 / 5%);
    }
  }

  &__count {
    min-width: 18px;
    height: 16px;
    padding: 0 5px;
    font-size: 10px;
    line-height: 16px;
    color: #fff;
    text-align: center;
    background: var(--el-color-danger);
    border-radius: 999px;
  }

  &__list {
    max-height: 280px;
    overflow-y: auto;
  }

  &__item {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    gap: 8px;
    align-items: center;
    padding: 10px 2px;

    & + & {
      border-top: 1px solid var(--el-border-color-lighter);
    }

    &.is-read {
      opacity: 0.72;
    }
  }

  &__title {
    min-width: 0;
    cursor: pointer;
  }

  &__time {
    flex-shrink: 0;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    white-space: nowrap;
  }

  &__empty {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 150px;
  }

  &__divider {
    margin: 10px 0;
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}

@keyframes notice-pulse {
  0% {
    opacity: 0.45;
    transform: scale(1);
  }

  70% {
    opacity: 0;
    transform: scale(2.8);
  }

  100% {
    opacity: 0;
    transform: scale(2.8);
  }
}
</style>
