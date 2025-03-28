<!--
  TextScroll 组件 - 文本滚动公告
  
  功能：
  - 支持水平方向文本滚动
  - 提供多种预设样式（默认、成功、警告、危险、信息）
  - 支持自定义滚动速度和方向
  - 可选的打字机输入效果
  - 鼠标悬停时暂停滚动
  - 可选的关闭按钮
-->
<template>
  <div
    ref="containerRef"
    class="text-scroll-container"
    :class="[`text-scroll--${props.type}`]"
    :typewriter="props.typewriter ? 'true' : undefined"
  >
    <!-- 左侧图标 -->
    <div class="left-icon">
      <el-icon><Bell /></el-icon>
    </div>
    <!-- 滚动内容包装器 -->
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
    <!-- 可选的关闭按钮 -->
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

// 定义组件属性及默认值
const props = withDefaults(defineProps<Props>(), {
  speed: 70,
  direction: "left",
  type: "default",
  showClose: false,
  typewriter: false,
  typewriterSpeed: 100,
});

// 容器元素引用
const containerRef = ref<HTMLElement | null>(null);
// 使用 vueuse 的 useElementHover 检测鼠标悬停状态
const isHovered = useElementHover(containerRef);
// 滚动内容元素引用
const scrollContent = ref<HTMLElement | null>(null);
// 动画持续时间（秒）
const animationDuration = ref(0);

/**
 * 打字机效果相关状态
 */
// 当前已显示的文本内容
const currentText = ref("");
// 打字机定时器引用，用于清理
let typewriterTimer: ReturnType<typeof setTimeout> | null = null;
// 打字机效果是否已完成
const isTypewriterComplete = ref(false);

/**
 * 计算是否应该滚动
 * 条件：
 * 1. 鼠标未悬停在组件上
 * 2. 如果启用了打字机效果，则需要等待打字效果完成
 */
const shouldScroll = computed(() => {
  if (props.typewriter) {
    return !isHovered.value && isTypewriterComplete.value;
  }
  return !isHovered.value;
});

/**
 * 计算最终显示的内容
 * 如果启用了打字机效果，则显示当前已打出的文本
 * 否则直接显示完整文本
 * 注意：内容支持 HTML，使用时需注意 XSS 风险
 */
const sanitizedContent = computed(() => (props.typewriter ? currentText.value : props.text));

/**
 * 计算滚动样式
 * 包括动画持续时间、播放状态和方向
 * 这些值通过 CSS 变量传递给样式
 */
const scrollStyle = computed(() => ({
  "--animation-duration": `${animationDuration.value}s`,
  "--animation-play-state": shouldScroll.value ? "running" : "paused",
  "--animation-direction": props.direction === "left" ? "normal" : "reverse",
}));

/**
 * 计算动画持续时间
 * 根据内容宽度和设定的速度计算出合适的动画持续时间
 * 内容越长或速度值越小，动画持续时间越长
 */
const calculateDuration = () => {
  if (scrollContent.value) {
    const contentWidth = scrollContent.value.scrollWidth / 2;
    animationDuration.value = contentWidth / props.speed;
  }
};

/**
 * 处理关闭按钮点击事件
 * 触发 close 事件，并直接销毁当前组件
 */
const handleRightIconClick = () => {
  emit("close");
  // 获取当前组件的DOM元素
  if (containerRef.value) {
    // 从DOM中移除元素
    containerRef.value.remove();
  }
};

/**
 * 启动打字机效果
 * 逐字显示文本内容，完成后设置状态以开始滚动
 */
const startTypewriter = () => {
  let index = 0;
  currentText.value = "";
  isTypewriterComplete.value = false; // 重置状态

  // 递归函数，逐字添加文本
  const type = () => {
    if (index < props.text.length) {
      // 添加一个字符
      currentText.value += props.text[index];
      index++;
      // 设置下一个字符的延迟
      typewriterTimer = setTimeout(type, props.typewriterSpeed);
    } else {
      // 所有字符都已添加，设置完成状态
      isTypewriterComplete.value = true;
    }
  };

  // 开始打字过程
  type();
};

onMounted(() => {
  // 计算初始动画持续时间
  calculateDuration();
  // 监听窗口大小变化，重新计算动画持续时间
  window.addEventListener("resize", calculateDuration);

  // 如果启用了打字机效果，开始打字
  if (props.typewriter) {
    startTypewriter();
  }
});

onUnmounted(() => {
  // 移除事件监听
  window.removeEventListener("resize", calculateDuration);
  // 清除打字机定时器
  if (typewriterTimer) {
    clearTimeout(typewriterTimer);
  }
});

/**
 * 监听文本内容变化
 * 当文本内容变化时，如果启用了打字机效果，重新开始打字
 */
watch(
  () => props.text,
  () => {
    if (props.typewriter) {
      // 清除现有定时器
      if (typewriterTimer) {
        clearTimeout(typewriterTimer);
      }
      // 重新开始打字效果
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
