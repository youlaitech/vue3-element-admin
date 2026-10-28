<!-- 文本滚动公告：水平滚动、预设样式、打字机效果，悬停暂停 -->
<template>
  <div
    v-if="!closed"
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
        <div class="scroll-item">{{ displayText }}</div>
        <div class="scroll-item" aria-hidden="true">{{ displayText }}</div>
      </div>
    </div>
    <button
      v-if="showClose"
      type="button"
      class="right-icon"
      aria-label="关闭公告"
      @click="handleClose"
    >
      <el-icon aria-hidden="true"><Close /></el-icon>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useElementHover, useResizeObserver } from "@vueuse/core";

/**
 * 关闭公告时触发
 */
const emit = defineEmits<{ close: [] }>();

interface Props {
  /** 纯文本内容，不解析 HTML。 */
  text: string;
  /** 每秒移动的像素数，非正数时暂停。 */
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

/**
 * 文字横向滚动：速度、方向与打字机效果
 */
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
const closed = ref(false);
// 动画持续时间（秒）
const animationDuration = ref(0);
const scrollDistance = ref(0);

const currentText = ref("");
// 打字机定时器，组件卸载时清理
let typewriterTimer: ReturnType<typeof setTimeout> | null = null;
const isTypewriterComplete = ref(false);

// 鼠标未悬停，且启用打字机时需等打字完成
const shouldScroll = computed(() => {
  if (closed.value || props.speed <= 0) return false;
  if (props.typewriter) {
    return !isHovered.value && isTypewriterComplete.value;
  }
  return !isHovered.value;
});

const displayText = computed(() => (props.typewriter ? currentText.value : props.text));

// 动画时长、播放状态与方向通过 CSS 变量传给样式
const scrollStyle = computed(() => ({
  "--animation-duration": `${animationDuration.value}s`,
  "--scroll-distance": `-${scrollDistance.value}px`,
  "--animation-play-state": shouldScroll.value ? "running" : "paused",
  "--animation-direction": props.direction === "left" ? "normal" : "reverse",
}));

/**
 * 内容复制两份做无缝滚动，宽度取一半；速度越小动画越长
 */
const calculateDuration = () => {
  if (scrollContent.value) {
    const contentWidth = scrollContent.value.scrollWidth / 2;
    scrollDistance.value = contentWidth;
    animationDuration.value = props.speed > 0 ? contentWidth / props.speed : 0;
  }
};

/**
 * 内部隐藏并停止资源，父组件可通过 close 同步显示状态。
 */
function handleClose(): void {
  closed.value = true;
  stopTypewriter();
  stopResize();
  emit("close");
}

/**
 * 取消打字动画的定时任务。
 */
function stopTypewriter(): void {
  if (typewriterTimer !== null) clearTimeout(typewriterTimer);
  typewriterTimer = null;
}

/**
 * 逐字显示文本，打完后置完成标记以开始滚动
 */
const startTypewriter = () => {
  stopTypewriter();
  let index = 0;
  // 按 Unicode 码点拆分，避免从代理对中间截断表情等字符。
  const characters = Array.from(props.text);
  currentText.value = "";
  isTypewriterComplete.value = false;

  /**
   * 逐字更新当前显示文本。
   */
  const type = () => {
    if (closed.value) return;
    if (index < characters.length) {
      currentText.value += characters[index];
      index++;
      typewriterTimer = setTimeout(type, Math.max(1, props.typewriterSpeed));
    } else {
      typewriterTimer = null;
      isTypewriterComplete.value = true;
    }
  };

  type();
};

const { stop: stopResize } = useResizeObserver([containerRef, scrollContent], calculateDuration);
onBeforeUnmount(stopTypewriter);

watch(
  () => [props.text, props.typewriter, props.typewriterSpeed],
  () => {
    stopTypewriter();
    if (!closed.value && props.typewriter) startTypewriter();
  },
  { immediate: true }
);
watch(() => [displayText.value, props.speed], calculateDuration, { flush: "post" });
onMounted(calculateDuration);
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
    padding: 0;
    cursor: pointer;
    background-color: transparent !important;
    border: 0;

    &:focus-visible {
      outline: 2px solid var(--el-color-primary);
      outline-offset: -3px;
    }
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
      transform: translateX(var(--scroll-distance));
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
