<!-- 文本滚动公告：水平滚动、预设样式、打字机效果，悬停暂停 -->
<template>
  <div
    ref="containerRef"
    class="text-scroll-container"
    :class="[`text-scroll--${props.type}`]"
    :typewriter="props.typewriter ? 'true' : undefined"
  >
    <div class="left-icon">
      <el-icon><Bell /></el-icon>
    </div>
    <div class="scroll-wrapper">
      <div
        ref="scrollContent"
        class="text-scroll-content"
        :class="{ scrolling: shouldScroll }"
        :style="scrollStyle"
      >
        <!-- 滚动内容，复制两份以实现无缝滚动 -->
        <div class="scroll-item" v-html="sanitizedContent" />
        <div class="scroll-item" v-html="sanitizedContent" />
      </div>
    </div>
    <div v-if="showClose" class="right-icon" @click="handleRightIconClick">
      <el-icon><Close /></el-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useElementHover } from "@vueuse/core";

const emit = defineEmits(["close"]);

interface Props {
  /** 滚动文本内容（必填） */
  text: string;
  /** 滚动速度，数值越小滚动越慢 */
  speed?: number;
  /** 滚动方向：左侧或右侧 */
  direction?: "left" | "right";
  /** 样式类型 */
  type?: "default" | "success" | "warning" | "danger" | "info";
  /** 是否显示关闭按钮 */
  showClose?: boolean;
  /** 是否启用打字机效果 */
  typewriter?: boolean;
  /** 打字机效果的速度，数值越小打字越快 */
  typewriterSpeed?: number;
}

const props = withDefaults(defineProps<Props>(), {
  speed: 70,
  direction: "left",
  type: "default",
  showClose: false,
  typewriter: false,
  typewriterSpeed: 100,
});

const containerRef = ref<HTMLElement | null>(null);
const isHovered = useElementHover(containerRef);
const scrollContent = ref<HTMLElement | null>(null);
// 动画持续时间（秒）
const animationDuration = ref(0);

const currentText = ref("");
// 打字机定时器，组件卸载时清理
let typewriterTimer: ReturnType<typeof setTimeout> | null = null;
const isTypewriterComplete = ref(false);

// 鼠标未悬停，且启用打字机时需等打字完成
const shouldScroll = computed(() => {
  if (props.typewriter) {
    return !isHovered.value && isTypewriterComplete.value;
  }
  return !isHovered.value;
});

// 打字机模式下显示当前已打出的文本，否则显示完整文本；内容支持 HTML，注意 XSS 风险
const sanitizedContent = computed(() => (props.typewriter ? currentText.value : props.text));

// 动画时长、播放状态与方向通过 CSS 变量传给样式
const scrollStyle = computed(() => ({
  "--animation-duration": `${animationDuration.value}s`,
  "--animation-play-state": shouldScroll.value ? "running" : "paused",
  "--animation-direction": props.direction === "left" ? "normal" : "reverse",
}));

/**
 * 内容复制两份做无缝滚动，宽度取一半；速度越小动画越长
 */
const calculateDuration = () => {
  if (scrollContent.value) {
    const contentWidth = scrollContent.value.scrollWidth / 2;
    animationDuration.value = contentWidth / props.speed;
  }
};

/**
 * 触发 close 事件并直接销毁组件
 */
const handleRightIconClick = () => {
  emit("close");
  if (containerRef.value) {
    containerRef.value.remove();
  }
};

/**
 * 逐字显示文本，打完后置完成标记以开始滚动
 */
const startTypewriter = () => {
  let index = 0;
  currentText.value = "";
  isTypewriterComplete.value = false;

  /**
   * 打字机效果：逐字追加文本
   */
  const type = () => {
    if (index < props.text.length) {
      currentText.value += props.text[index];
      index++;
      typewriterTimer = setTimeout(type, props.typewriterSpeed);
    } else {
      isTypewriterComplete.value = true;
    }
  };

  type();
};

onMounted(() => {
  calculateDuration();
  window.addEventListener("resize", calculateDuration);

  if (props.typewriter) {
    startTypewriter();
  }
});

onUnmounted(() => {
  window.removeEventListener("resize", calculateDuration);
  if (typewriterTimer) {
    clearTimeout(typewriterTimer);
  }
});

// 文本变化后重开打字机
watch(
  () => props.text,
  () => {
    if (props.typewriter) {
      if (typewriterTimer) {
        clearTimeout(typewriterTimer);
      }
      startTypewriter();
    }
  }
);
</script>

<style scoped lang="scss">
.text-scroll-container {
  position: relative;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  width: 100%;
  padding-right: 16px;
  overflow: hidden;
  background-color: var(--el-color-primary-light-9) !important;
  border: 1px solid var(--main-color);
  border-radius: calc(var(--custom-radius) / 2 + 2px) !important;

  .left-icon,
  .right-icon {
    position: absolute;
    top: 0;
    bottom: 0;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 100%;
    text-align: center;
    background-color: var(--el-color-primary-light-9) !important;
  }

  .left-icon {
    left: 0;
  }

  .right-icon {
    right: 0;
    cursor: pointer;
    background-color: transparent !important;
  }

  .scroll-wrapper {
    flex: 1;
    margin-left: 34px;
    overflow: hidden;
  }

  .text-scroll-content {
    display: flex;
    height: 34px;
    line-height: 34px;
    white-space: nowrap;
    animation: scroll linear infinite;
    animation-duration: var(--animation-duration);
    animation-direction: var(--animation-direction);
    animation-play-state: var(--animation-play-state);

    .scroll-item {
      display: inline-block;
      min-width: 100%;
      padding: 0 10px;
      font-size: 14px;
      color: var(--el-color-primary-light-2) !important;
      text-align: left;
      text-align: center;

      :deep(a) {
        color: #fd4e4e !important;
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  }

  @keyframes scroll {
    0% {
      transform: translateX(0);
    }

    100% {
      transform: translateX(-100%);
    }
  }

  // 添加类型样式
  &.text-scroll--default {
    background-color: var(--el-color-primary-light-9) !important;
    border-color: var(--el-color-primary);

    .right-icon,
    .left-icon i {
      color: var(--el-color-primary) !important;
    }

    .scroll-item {
      color: var(--el-color-primary) !important;
    }
  }

  &.text-scroll--success {
    background-color: var(--el-color-success-light-9) !important;
    border-color: var(--el-color-success);

    .left-icon {
      background-color: var(--el-color-success-light-9) !important;

      i {
        color: var(--el-color-success);
      }
    }

    .scroll-item {
      color: var(--el-color-success) !important;
    }
  }

  &.text-scroll--warning {
    background-color: var(--el-color-warning-light-9) !important;
    border-color: var(--el-color-warning);

    .left-icon {
      background-color: var(--el-color-warning-light-9) !important;

      i {
        color: var(--el-color-warning);
      }
    }

    .scroll-item {
      color: var(--el-color-warning) !important;
    }
  }

  &.text-scroll--danger {
    background-color: var(--el-color-danger-light-9) !important;
    border-color: var(--el-color-danger);

    .left-icon {
      background-color: var(--el-color-danger-light-9) !important;

      i {
        color: var(--el-color-danger);
      }
    }

    .scroll-item {
      color: var(--el-color-danger) !important;
    }
  }

  &.text-scroll--info {
    background-color: var(--el-color-info-light-9) !important;
    border-color: var(--el-color-info);

    .left-icon {
      background-color: var(--el-color-info-light-9) !important;

      i {
        color: var(--el-color-info);
      }
    }

    .scroll-item {
      color: var(--el-color-info) !important;
    }
  }
}

// 添加打字机效果的光标样式
.text-scroll-content .scroll-item {
  &::after {
    content: "";
    opacity: 0;
    animation: none;
  }
}

// 仅在启用打字机效果时显示光标
.text-scroll-container[typewriter] .text-scroll-content .scroll-item::after {
  content: "|";
  opacity: 0;
  animation: cursor 1s infinite;
}

@keyframes cursor {
  0%,
  100% {
    opacity: 0;
  }

  50% {
    opacity: 1;
  }
}
</style>
