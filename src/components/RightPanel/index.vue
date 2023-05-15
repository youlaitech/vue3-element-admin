<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue";

import { addClass, removeClass } from "@/utils/index";

const show = ref(false);

defineProps({
  buttonTop: {
    default: 250,
    type: Number,
  },
});

watch(show, (value) => {
  if (value) {
    addEventClick();
  }
  if (value) {
    addClass(document.body, "showRightPanel");
  } else {
    removeClass(document.body, "showRightPanel");
  }
});

function addEventClick() {
  window.addEventListener("click", closeSidebar, { passive: true });
}

function closeSidebar(evt: any) {
  // 主题选择点击不关闭
  let parent = evt.target.closest(".right-panel-container");
  if (!parent) {
    show.value = false;
    window.removeEventListener("click", closeSidebar);
  }
}

const rightPanel = ref();

function insertToBody() {
  const body = document.querySelector("body") as any;
  body.insertBefore(rightPanel.value, body.firstChild);
}

onMounted(() => {
  insertToBody();
});

onBeforeUnmount(() => {
  rightPanel.value.remove();
});
</script>

<template>
  <div ref="rightPanel" :class="{ show: show }">
    <div class="right-panel-overlay" />
    <div class="right-panel-container">
      <div
        class="right-panel-btn"
        :style="{
          top: buttonTop + 'px',
        }"
        @click="show = !show"
      >
        <i-ep-close v-show="show" />
        <i-ep-setting v-show="!show" />
      </div>
      <div>
        <slot />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.showRightPanel {
  position: relative;
  width: calc(100% - 15px);
  overflow: hidden;
}

.right-panel-overlay {
  position: fixed;
  top: 0;
  left: 0;
  background: rgb(0 0 0 / 20%);
}

.right-panel-container {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 999;
  width: 100%;
  max-width: 300px;
  height: 100vh;
  background-color: var(--el-bg-color-overlay);
  box-shadow: 0 0 15px 0 rgb(0 0 0 / 5%);
  transition: all 0.25s cubic-bezier(0.7, 0.3, 0.1, 1);
  transform: translate(100%);
}

.show {
  transition: all 0.3s cubic-bezier(0.7, 0.3, 0.1, 1);

  .right-panel-overlay {
    z-index: 99;
    width: 100%;
    height: 100%;
    opacity: 1;
  }

  .right-panel-container {
    transform: translate(0);
  }
}

.right-panel-btn {
  position: absolute;
  left: -36px;
  width: 36px;
  height: 36px;
  color: var(--el-color-white);
  text-align: center;
  cursor: pointer;
  background-color: var(--el-color-primary);
  border-radius: 6px 0 0 6px;

  svg {
    width: 20px;
    height: 20px;
    vertical-align: -10px;
  }
}
</style>
