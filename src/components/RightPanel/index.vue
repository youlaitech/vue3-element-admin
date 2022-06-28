<template>
  <div ref="rightPanel" :class="{ show: show }">
    <div class="right-panel-background" />
    <div class="right-panel">
      <div
        class="right-panel__button"
        :style="{ top: buttonTop + 'px', 'background-color': theme }"
        @click="show = !show"
      >
        <Close class="icon" v-show="show" />
        <Setting class="icon" v-show="!show" />
      </div>
      <div class="right-panel__items">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';

import { addClass, removeClass } from '@/utils/index';

import useStore from '@/store';

// 图标依赖
import { Close, Setting } from '@element-plus/icons-vue';
import { ElColorPicker } from 'element-plus';

const { setting } = useStore();

const theme = computed(() => setting.theme);
const show = ref(false);

defineProps({
  buttonTop: {
    default: 250,
    type: Number
  }
});

watch(show, value => {
  if (value) {
    addEventClick();
  }
  if (value) {
    addClass(document.body, 'showRightPanel');
  } else {
    removeClass(document.body, 'showRightPanel');
  }
});

function addEventClick() {
  window.addEventListener('click', closeSidebar, { passive: true });
}

function closeSidebar(evt: any) {
  // 主题选择点击不关闭
  let parent = evt.target.closest('.theme-picker-dropdown');
  if (parent) {
    return;
  }

  parent = evt.target.closest('.right-panel');
  if (!parent) {
    show.value = false;
    window.removeEventListener('click', closeSidebar);
  }
}

const rightPanel = ref(ElColorPicker);

function insertToBody() {
  const elx = rightPanel.value as any;
  const body = document.querySelector('body') as any;
  body.insertBefore(elx, body.firstChild);
}

onMounted(() => {
  insertToBody();
});

onBeforeUnmount(() => {
  const elx = rightPanel.value as any;
  elx.remove();
});
</script>

<style>
.showRightPanel {
  overflow: hidden;
  position: relative;
  width: calc(100% - 15px);
}
</style>

<style lang="scss" scoped>
.right-panel-background {
  position: fixed;
  top: 0;
  left: 0;
  opacity: 0;
  transition: opacity 0.3s cubic-bezier(0.7, 0.3, 0.1, 1);
  background: rgba(0, 0, 0, 0.2);
  z-index: -1;
}

.right-panel {
  width: 100%;
  max-width: 300px;
  height: 100vh;
  position: fixed;
  top: 0;
  right: 0;
  box-shadow: 0px 0px 15px 0px rgba(0, 0, 0, 0.05);
  transition: all 0.25s cubic-bezier(0.7, 0.3, 0.1, 1);
  transform: translate(100%);
  background: #fff;
  z-index: 199;

  .icon {
    width: 1em;
    height: 1em;
    vertical-align: middle;
  }
}

.show {
  transition: all 0.3s cubic-bezier(0.7, 0.3, 0.1, 1);

  .right-panel-background {
    z-index: 99;
    opacity: 1;
    width: 100%;
    height: 100%;
  }

  .right-panel {
    transform: translate(0);
  }
}

.right-panel__button {
  width: 48px;
  height: 48px;
  position: absolute;
  left: -48px;
  text-align: center;
  font-size: 24px;
  border-radius: 6px 0 0 6px !important;
  z-index: 0;
  pointer-events: auto;
  cursor: pointer;
  color: #fff;
  line-height: 48px;

  i {
    font-size: 24px;
    line-height: 48px;
  }
}
</style>
