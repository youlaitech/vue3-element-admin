import { ElNotification } from "element-plus";
import { onMounted, onUnmounted, ref } from "vue";

/**
 * 轮询部署版本，并提示用户刷新页面。
 */
export function useVersionCheck(interval = 60_000) {
  const hasNewVersion = ref(false);
  let notified = false;
  const safeInterval = Math.max(10_000, interval);

  /**
   * 查询部署版本并更新升级提示。
   */
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

  /**
   * 提示新版本，已有通知时不重复显示。
   */
  const showUpdateNotice = () => {
    if (notified) return;
    notified = true;

    // 使用非阻塞通知，避免中断当前操作。
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
  /**
   * 页面恢复可见时立即检查部署版本。
   */
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
