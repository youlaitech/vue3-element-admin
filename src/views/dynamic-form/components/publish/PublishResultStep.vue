<template>
  <div class="entry-config">
    <EntrySection v-if="showMenu" kind="menu" title="系统内嵌" sub="已生效">
      <div class="entry-summary">
        <div class="entry-summary__row">
          <span class="entry-summary__label">菜单位置</span>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item v-for="name in menuBreadcrumb" :key="name">
              {{ name }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="entry-summary__row">
          <span class="entry-summary__label">可见角色</span>
          <template v-if="grantedRoleNames.length">
            <el-tag
              v-for="name in grantedRoleNames"
              :key="name"
              size="small"
              type="info"
              effect="plain"
            >
              {{ name }}
            </el-tag>
          </template>
          <span v-else class="entry-summary__empty">未授权，仅超级管理员可见</span>
        </div>
        <el-button type="primary" class="entry-summary__action" @click="emit('goView')">
          前往查看
        </el-button>
      </div>
    </EntrySection>

    <EntrySection v-if="shareVisible" kind="share" title="对外分享" sub="已开启">
      <div class="entry-summary entry-summary--share">
        <canvas ref="qrCanvasRef" class="entry-summary__qrcode" />
        <div class="entry-summary__link">
          <el-link type="primary" :href="shareUrl" target="_blank">{{ shareUrl }}</el-link>
          <el-button size="small" @click="emit('copy')">复制链接</el-button>
        </div>
        <div class="entry-summary__tip">扫码或复制链接分享，微信打开即可填写</div>
      </div>
    </EntrySection>

    <div class="publish-result__subtitle">{{ subtitle }}</div>
  </div>
</template>

<script setup lang="ts">
import QRCode from "qrcode";

import EntrySection from "./EntrySection.vue";

defineOptions({
  name: "FormPublishResultStep",
});

/** 发布完成汇总（向导第③步：菜单位置、可见角色、分享二维码与链接） */
const props = defineProps<{
  /** 是否展示菜单入口汇总 */
  showMenu: boolean;
  /** 菜单位置面包屑（目录名称链 + 菜单名） */
  menuBreadcrumb: string[];
  /** 已授权角色名称列表 */
  grantedRoleNames: string[];
  /** 是否展示分享汇总 */
  shareVisible: boolean;
  /** 分享链接 */
  shareUrl: string;
  /** 副标题（按入口组合变化） */
  subtitle: string;
}>();

const emit = defineEmits<{
  /** 前往查看（容器负责重载动态路由后跳转） */
  goView: [];
  /** 复制分享链接（统一由容器执行剪贴板写入与提示） */
  copy: [];
}>();

/** 分享二维码画布 */
const qrCanvasRef = ref<HTMLCanvasElement>();

// 仅在第③步渲染（v-else-if 挂载），配置已定，挂载后绘制一次即可
onMounted(async () => {
  if (!props.shareVisible) return;
  await nextTick();
  if (qrCanvasRef.value) {
    await QRCode.toCanvas(qrCanvasRef.value, props.shareUrl, { width: 140, margin: 1 });
  }
});
</script>

<style lang="scss" scoped>
.entry-config {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px 16px 0;
}

.entry-summary {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px 14px 12px;

  &__row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
    font-size: 13px;
  }

  &__label {
    width: 60px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  &__empty {
    font-size: 13px;
    color: var(--el-text-color-placeholder);
  }

  &__action {
    align-self: flex-start;
    margin-left: 60px;
  }

  &--share {
    align-items: center;
  }

  &__qrcode {
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 6px;
  }

  &__link {
    display: flex;
    gap: 8px;
    align-items: center;
    max-width: 100%;
  }

  &__tip {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
}

.publish-result__subtitle {
  padding: 8px 0 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  text-align: center;
}
</style>
