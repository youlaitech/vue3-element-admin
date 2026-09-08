<template>
  <div class="publish-method">
    <div
      class="method-card"
      :class="{ 'method-card--active': selected.includes('menu') }"
      @click="emit('toggle', 'menu')"
    >
      <div class="method-card__header">
        <el-icon :size="18" class="method-card__icon method-card__icon--menu">
          <Monitor />
        </el-icon>
        <div class="method-card__titles">
          <span class="method-card__name">系统内嵌</span>
          <span class="method-card__name-en">MENU</span>
        </div>
        <el-tag v-if="menuGenerated" size="small" type="success">已生成入口</el-tag>
      </div>
      <p class="method-card__desc">员工登录系统从侧边栏进入填写，需配置可见角色</p>
    </div>

    <div
      class="method-card"
      :class="{ 'method-card--active': selected.includes('share') }"
      @click="emit('toggle', 'share')"
    >
      <div class="method-card__header">
        <el-icon :size="18" class="method-card__icon method-card__icon--share"><Link /></el-icon>
        <div class="method-card__titles">
          <span class="method-card__name">对外分享</span>
          <span class="method-card__name-en">SHARE</span>
        </div>
        <el-tag v-if="shareOpened" size="small" type="success">已开启</el-tag>
      </div>
      <p class="method-card__desc">微信发链接或扫码即可填写，无需账号</p>
    </div>

    <div class="publish-method__tip">不确定？两种方式可同时开启</div>
  </div>
</template>

<script setup lang="ts">
import { Link, Monitor } from "@element-plus/icons-vue";

import type { PublishMethod } from "./types";

defineOptions({
  name: "FormPublishMethodStep",
});

/** 发布方式选择（向导第①步；卡片单选/全选，已配置过的入口带标签提示） */
defineProps<{
  /** 选中的发布方式 */
  selected: PublishMethod[];
  /** 是否已生成菜单入口（卡片标签） */
  menuGenerated: boolean;
  /** 是否已开启公开分享（卡片标签） */
  shareOpened: boolean;
}>();

const emit = defineEmits<{
  /** 切换发布方式选中态 */
  toggle: [method: PublishMethod];
}>();
</script>

<style lang="scss" scoped>
.publish-method {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 24px 16px 0;
}

.method-card {
  padding: 16px;
  cursor: pointer;
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  transition: border-color 0.2s;

  &:hover {
    border-color: var(--el-color-primary-light-5);
  }

  &--active {
    background-color: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary);
  }

  &__header {
    display: flex;
    gap: 10px;
    align-items: center;
    font-size: 15px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  &__titles {
    display: flex;
    gap: 6px;
    align-items: baseline;
  }

  &__name-en {
    font-size: 11px;
    font-weight: 400;
    color: var(--el-text-color-placeholder);
    letter-spacing: 1px;
  }

  &__icon {
    &--menu {
      color: var(--el-color-primary);
    }

    &--share {
      color: var(--el-color-success);
    }
  }

  &__desc {
    margin: 8px 0 0;
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }
}

.publish-method__tip {
  padding: 8px 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  text-align: center;
}
</style>
