<template>
  <div class="logo">
    <transition enter-active-class="animate__animated animate__fadeInLeft">
      <router-link :key="+collapse" class="wh-full flex-center" to="/">
        <img :src="logo" class="w20px h20px" />
        <span v-if="!collapse" class="title">
          {{ defaultSettings.title }}
        </span>
      </router-link>
    </transition>
  </div>
</template>

<script lang="ts" setup>
import defaultSettings from "@/settings";
import logo from "@/assets/logo.png";

defineProps({
  collapse: {
    type: Boolean,
    required: true,
  },
});
</script>

<style lang="scss" scoped>
.logo {
  width: 100%;
  height: $navbar-height;
  background-color: $sidebar-logo-background;

  .title {
    flex-shrink: 0;
    margin-left: 10px;
    font-size: 14px;
    font-weight: bold;
    color: $sidebar-logo-text-color;
  }
}
</style>

<style lang="scss">
// 全局样式：针对顶部布局和混合布局的特殊处理
.layout-top,
.layout-mix {
  .logo {
    // 在顶部和混合布局中，移除背景色，使其透明
    background-color: transparent !important;

    .title {
      // 确保标题颜色适配当前主题
      color: var(--menu-text);
    }
  }
}

// 顶部布局的响应式宽度控制
.layout-top {
  .layout__header-left .logo {
    flex-shrink: 0; // 防止Logo被压缩
    width: $sidebar-width; // 默认宽度：显示logo+文字
    margin-right: 20px;

    // 中屏设备优化（800px-1100px）：适度缩小但保持显示文字
    @media (min-width: 768px) and (max-width: 1100px) {
      width: 180px; // 缩小到180px，为菜单腾出空间
      margin-right: 16px; // 减少右边距
    }

    // 小屏设备：只显示logo，使用收缩宽度
    @media (max-width: 767px) {
      width: $sidebar-width-collapsed; // 只显示logo：54px
      margin-right: 12px; // 减少右边距
    }
  }
}

// 混合布局的响应式宽度控制
.layout-mix {
  .layout__header-logo .logo {
    flex-shrink: 0;
    width: $sidebar-width; // 默认宽度：显示logo+文字

    // 中屏设备优化（800px-1100px）：适度缩小但保持显示文字
    @media (min-width: 768px) and (max-width: 1100px) {
      width: 180px; // 缩小到180px，为菜单腾出空间
    }

    // 小屏设备：只显示logo，使用收缩宽度
    @media (max-width: 767px) {
      width: $sidebar-width-collapsed; // 只显示logo：54px
    }
  }
}
</style>
