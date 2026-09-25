// 数据大屏示例共用的工具函数与配色

import type * as echartsCore from "echarts/core";

/**
 * 图表通用配色
 */
export const SCREEN_COLORS = {
  /** 坐标轴文字 */
  axis: "#5c7fa8",
  /** 分隔线 */
  grid: "rgba(92, 127, 168, 0.16)",
  /** 主题色 */
  accent: "#3ba9ff",
  /** 正向色 */
  success: "#34d399",
  /** 强调色 */
  purple: "#a78bfa",
  /** 环形图配色：同一冷色系内的明度递进，避免彩虹色观感 */
  pie: ["#2f8fd4", "#3ba9ff", "#38bdf8", "#22d3ee"],
} as const;

/**
 * hex 转 rgba，用于指标图标的半透明底色
 */
export function hexToRgba(hex: string, alpha: number): string {
  const value = Number.parseInt(hex.slice(1), 16);
  return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}, ${alpha})`;
}

/**
 * 竖向渐变填充，面积图与柱状图共用
 */
export function verticalGradient(from: string, to: string) {
  return {
    type: "linear" as const,
    x: 0,
    y: 0,
    x2: 0,
    y2: 1,
    colorStops: [
      { offset: 0, color: from },
      { offset: 1, color: to },
    ],
  };
}

/**
 * 千分位格式化
 */
export function formatNumber(value: number): string {
  return value.toLocaleString("zh-CN");
}

/**
 * 数值平滑过渡到目标值（easeOutCubic）
 *
 * 大屏多处需要「数字滚动」效果：首次进入时 0 → 真实值，定时刷新时小幅增涨
 *
 * @param from 当前值
 * @param to 目标值
 * @param onUpdate 每帧回调
 * @param duration 动画时长，单位毫秒
 */
export function tweenValue(
  from: number,
  to: number,
  onUpdate: (value: number) => void,
  duration = 1200
): void {
  const startAt = performance.now();

  // 逐帧推进动画
  const step = (now: number) => {
    const progress = Math.min(1, (now - startAt) / duration);
    const eased = 1 - (1 - progress) ** 3;
    onUpdate(Math.round(from + (to - from) * eased));
    if (progress < 1) requestAnimationFrame(step);
  };

  requestAnimationFrame(step);
}

/**
 * 加载并注册中国地图
 *
 * 地图数据放在 public 下运行时加载，避免 582KB 的 GeoJSON 打进主包
 *
 * @param echarts echarts 核心模块
 * @returns 省份中心点坐标，用于绘制散点与飞线
 */
export async function registerChinaMap(
  echarts: typeof echartsCore
): Promise<Record<string, [number, number]>> {
  const response = await fetch(`${import.meta.env.BASE_URL}map/china.json`);
  const geoJson = await response.json();
  echarts.registerMap("china", geoJson);

  const centers: Record<string, [number, number]> = {};
  (geoJson.features as { properties: { name: string; cp?: [number, number] } }[]).forEach(
    (feature) => {
      const { name, cp } = feature.properties;
      if (cp) centers[name] = cp;
    }
  );
  return centers;
}
