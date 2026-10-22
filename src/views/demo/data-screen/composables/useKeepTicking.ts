import { onMounted, onUnmounted } from "vue";

/**
 * 常驻定时器：组件存活期间按固定间隔执行回调，页面隐藏时自动暂停
 *
 * @param callback 定时器每次触发时执行的回调
 * @param interval 间隔毫秒数，默认 3000
 */
export function useKeepTicking(callback: () => void, interval = 3000) {
  /** 定时器是否正在运行 */
  let ticking = false;
  /** 定时器标识 */
  let timerId: ReturnType<typeof setInterval> | null = null;

  const startTicker = () => {
    if (!ticking) {
      ticking = true;
      timerId = setInterval(callback, interval);
    }
  };

  const stopTicker = () => {
    if (ticking) {
      ticking = false;
      if (timerId) clearInterval(timerId);
      timerId = null;
    }
  };

  const handleVisibilityChange = () => {
    if (document.hidden) {
      stopTicker();
    } else {
      startTicker();
    }
  };

  onMounted(() => {
    document.addEventListener("visibilitychange", handleVisibilityChange);
    startTicker();
  });

  onUnmounted(() => {
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    stopTicker();
  });

  return {
    startTicker,
    stopTicker,
  };
}
