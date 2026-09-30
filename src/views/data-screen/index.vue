<template>
  <div class="dataScreen-container">
    <!-- 适配屏幕容器：按 1920×1080 设计稿等比缩放 -->
    <div v-fit-screen pt-10px flex flex-col>
      <!-- 头部区域 -->
      <Cephalosome />

      <!-- 图表区域 -->
      <div flex-1 p-10px flex gap="10px" relative>
        <!-- 漂浮地图 -->
        <MapChart />
        <!-- 左侧图表 -->
        <LeftCharts />
        <!-- 中间图表 -->
        <CenterCharts />
        <!-- 右侧图表 -->
        <RightCharts />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { type Directive } from "vue";

import "./assets/styles/index.scss";

defineOptions({ name: "DataScreen" });

/** 设计稿宽度 */
const DESIGN_WIDTH = 1920;

/** 设计稿高度 */
const DESIGN_HEIGHT = 1080;

/** 元素与 resize 回调的映射，卸载时按引用移除监听 */
const resizeHandlers = new WeakMap<HTMLElement, () => void>();

/**
 * 按视口与设计稿的较小比例缩放，并平移回视口中心
 */
function applyScale(el: HTMLElement): void {
  const scale = Math.min(window.innerWidth / DESIGN_WIDTH, window.innerHeight / DESIGN_HEIGHT);
  el.style.transform = `scale(${scale}) translate(-50%, -50%)`;
}

/**
 * 大屏适配指令：元素固定为设计稿尺寸后等比缩放，版式不随窗口比例变形
 */
const vFitScreen: Directive<HTMLElement> = {
  mounted(el) {
    Object.assign(el.style, {
      position: "fixed",
      top: "50%",
      left: "50%",
      zIndex: "999",
      width: `${DESIGN_WIDTH}px`,
      height: `${DESIGN_HEIGHT}px`,
      transformOrigin: "top left",
      transition: "all 0.3s",
    });

    const resize = () => applyScale(el);
    resizeHandlers.set(el, resize);
    applyScale(el);
    window.addEventListener("resize", resize);
  },
  unmounted(el) {
    const resize = resizeHandlers.get(el);
    if (resize) {
      window.removeEventListener("resize", resize);
      resizeHandlers.delete(el);
    }
  },
};
</script>
