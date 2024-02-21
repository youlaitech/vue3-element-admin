<template>
  <div ref="rightPanelRef" :class="{ show: show }">
    <div class="rightPanel-background"></div>
    <div class="rightPanel">
      <div class="handle-button" @click="show = !show">
        <i-ep-close v-show="show" />
        <i-ep-setting v-show="!show" />
      </div>
      <div>
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { addClass, removeClass } from "@/utils/index";

const show = ref(false);
const rightPanelRef = ref<HTMLElement | null>(null);

watch(show, (value) => {
  if (value) {
    window.addEventListener("click", closeSidebar, { passive: true });
    addClass(document.body, "showRightPanel");
  } else {
    removeClass(document.body, "showRightPanel");
  }
});

function closeSidebar(evt: MouseEvent) {
  const target = evt.target as HTMLElement;
  console.log("target", target);
  console.log("closest", target.closest(".rightPanel"));
  if (show.value && target && !target.closest(".rightPanel")) {
    show.value = false;
    window.removeEventListener("click", closeSidebar);
  }
}

function insertToBody() {
  const body = document.querySelector("body");
  if (body && rightPanelRef.value instanceof Node) {
    body.insertBefore(rightPanelRef.value, body.firstChild);
  }
}

onMounted(() => {
  insertToBody();
});

onBeforeUnmount(() => {
  if (rightPanelRef.value) {
    rightPanelRef.value.remove();
  }
});
</script>

<style>
.showRightPanel {
  position: relative;
  width: 100%;
  overflow: hidden;
}
</style>

<style lang="scss" scoped>
.rightPanel-background {
  position: fixed;
  top: 0;
  left: 0;
  background: rgb(0 0 0 / 20%);
}

.rightPanel {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 1000;
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

  .rightPanel-background {
    z-index: 99;
    width: 100%;
    height: 100%;
    opacity: 1;
  }

  .rightPanel {
    transform: translate(0);
  }
}

.handle-button {
  position: absolute;
  top: 250px;
  left: -36px;
  width: 36px;
  height: 36px;
  line-height: 36px;
  color: var(--el-color-white);
  text-align: center;
  cursor: pointer;
  background-color: var(--el-color-primary);
  border-radius: 6px 0 0 6px;
}
</style>
