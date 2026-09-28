import { ElNotification } from "element-plus";
import { onMounted, onUnmounted, ref } from "vue";

/** 版本检查 */
export function useVersionCheck(interval = 60_000) {
  const hasNewVersion = ref(false);
  let notified = false;
  const safeInterval = Math.max(10_000, interval);

  const checkVersion = async () => {
    try {
      const base = import.meta.env.BASE_URL;
      const baseUrl = base.endsWith("/") ? base : `${base}/`;
      // 时间戳防 CDN/代理缓存，no-cache 防浏览器磁盘缓存
      const res = await fetch(`${baseUrl}version.json?t=${Date.now()}`, {
        cache: "no-cache",
      });
      if (!res.ok) return; // 非核心功能，网络异常不影响正常使用

      const data = await res.json();
      if (data.version && data.version !== __APP_INFO__.buildTimestamp) {
        hasNewVersion.value = true;
        showUpdateNotice();
      }
    } catch (e) {
      console.warn("版本检测失败", e);
    }
  };

  const showUpdateNotice = () => {
    if (notified) return;
    notified = true;

    // 使用 Notification 而非 Modal，不打断用户操作
    ElNotification({
      title: "🎉 发现新版本",
      message: "系统已更新，点击刷新以获取最新功能",
      duration: 0, // 不自动关闭
      position: "bottom-right",
      onClick: () => window.location.reload(),
      onClose: () => {
        notified = false;
      },
      customClass: "version-update-notice",
    });
  };

  let timer: ReturnType<typeof setInterval>;
  // 用户从其他标签页切回时立即检测，无需等待下一次轮询
  const handleVisibilityChange = () => {
    if (!document.hidden) checkVersion();
  };

  onMounted(() => {
    checkVersion();
    timer = setInterval(checkVersion, safeInterval);
    document.addEventListener("visibilitychange", handleVisibilityChange);
  });

  onUnmounted(() => {
    clearInterval(timer);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  });

  return { hasNewVersion };
}
