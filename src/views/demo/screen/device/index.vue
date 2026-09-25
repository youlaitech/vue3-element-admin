<template>
  <div class="page-container">
    <div ref="screenRef" class="screen flex min-h-0 flex-1 flex-col gap-3 p-4">
      <ScreenHeader
        :title="SCREEN_TITLE"
        :subtitle="SCREEN_SUBTITLE"
        :is-fullscreen="isFullscreen"
        @toggle-fullscreen="toggleFullscreen()"
      />

      <div class="grid shrink-0 grid-cols-6 gap-3">
        <div
          v-for="item in metrics"
          :key="item.label"
          class="screen__metric flex items-center gap-3 p-3"
          :style="{ '--metric-color': item.color }"
        >
          <div
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-md"
            :style="{
              color: item.color,
              backgroundColor: hexToRgba(item.color, 0.14),
              border: `1px solid ${hexToRgba(item.color, 0.35)}`,
            }"
          >
            <el-icon :size="19"><component :is="item.icon" /></el-icon>
          </div>
          <div class="min-w-0">
            <div class="truncate text-12px text-[var(--screen-text-2)]">{{ item.label }}</div>
            <div class="flex items-baseline gap-1">
              <span class="screen__metric-value text-22px font-700">
                {{ formatNumber(item.value) }}
              </span>
              <span class="text-12px text-[var(--screen-text-2)]">{{ item.unit }}</span>
            </div>
          </div>
          <span
            class="ml-auto shrink-0 text-11px"
            :class="item.up ? 'text-[var(--screen-success)]' : 'text-[var(--screen-danger)]'"
          >
            {{ item.up ? "↑" : "↓" }}{{ item.trend }}%
          </span>
        </div>
      </div>

      <!-- 布局范式：左右分屏 —— 左大地图跨两行，右列竖排两图，底部三格（告警列表并入网格） -->
      <div class="grid min-h-0 flex-1 grid-cols-12 grid-rows-3 gap-3">
        <section
          class="screen__panel screen__panel--map col-span-8 col-start-1 row-span-2 row-start-1 flex min-h-0 flex-col"
        >
          <h2 class="screen__panel-title">
            <el-icon :size="14"><MapLocation /></el-icon>
            <span>设备地域分布</span>
          </h2>
          <div class="min-h-0 flex-1">
            <ECharts
              v-if="mapStatus === 'ready'"
              :options="mapOptions"
              width="100%"
              height="100%"
            />
            <div
              v-else
              class="flex h-full items-center justify-center text-13px text-[var(--screen-text-2)]"
            >
              {{ mapStatus === "loading" ? "地图数据加载中…" : "地图数据加载失败" }}
            </div>
          </div>
        </section>

        <section class="screen__panel col-span-4 col-start-9 row-start-1 flex min-h-0 flex-col">
          <h2 class="screen__panel-title">
            <el-icon :size="14"><TrendCharts /></el-icon>
            <span>24 小时数据采集量</span>
          </h2>
          <div class="min-h-0 flex-1">
            <ECharts :options="hourlyOptions" width="100%" height="100%" />
          </div>
        </section>

        <section class="screen__panel col-span-4 col-start-9 row-start-2 flex min-h-0 flex-col">
          <h2 class="screen__panel-title">
            <el-icon :size="14"><Odometer /></el-icon>
            <span>近 7 日设备在线率</span>
          </h2>
          <div class="min-h-0 flex-1">
            <ECharts :options="weekOptions" width="100%" height="100%" />
          </div>
        </section>

        <section class="screen__panel col-span-4 col-start-1 row-start-3 flex min-h-0 flex-col">
          <h2 class="screen__panel-title">
            <el-icon :size="14"><Histogram /></el-icon>
            <span>区域设备数 TOP 5</span>
          </h2>
          <div class="min-h-0 flex-1">
            <ECharts :options="regionOptions" width="100%" height="100%" />
          </div>
        </section>

        <section class="screen__panel col-span-4 col-start-5 row-start-3 flex min-h-0 flex-col">
          <h2 class="screen__panel-title">
            <el-icon :size="14"><PieChart /></el-icon>
            <span>设备类型占比</span>
          </h2>
          <div class="min-h-0 flex-1">
            <ECharts :options="typeOptions" width="100%" height="100%" />
          </div>
        </section>

        <section class="screen__panel col-span-4 col-start-9 row-start-3 flex min-h-0 flex-col">
          <h2 class="screen__panel-title">
            <el-icon :size="14"><Bell /></el-icon>
            <span>实时告警</span>
          </h2>
          <ul class="min-h-0 flex-1 overflow-hidden">
            <li v-for="item in logs" :key="item.id" class="alert-item">
              <span class="shrink-0 text-12px text-[var(--screen-text-2)]">{{ item.time }}</span>
              <span class="flex-1 truncate text-12px text-[var(--screen-text-1)]">
                {{ item.text }}
              </span>
            </li>
          </ul>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFullscreen } from "@vueuse/core";
import * as echarts from "echarts/core";

import ScreenHeader from "@/views/demo/screen/components/ScreenHeader.vue";
import {
  formatNumber,
  hexToRgba,
  registerChinaMap,
  SCREEN_COLORS,
  tweenValue,
  verticalGradient,
} from "@/views/demo/screen/utils";

defineOptions({
  name: "ScreenDevice",
});

// 大屏主题
const SCREEN_TITLE = "设备监控大屏";

const SCREEN_SUBTITLE = "DEVICE MONITOR CENTER";

// 顶部核心指标
const METRICS = [
  {
    label: "设备总数",
    value: 12860,
    unit: "台",
    trend: 2.4,
    up: true,
    icon: "Monitor",
    color: "#a78bfa",
  },
  {
    label: "在线设备",
    value: 11842,
    unit: "台",
    trend: 3.1,
    up: true,
    icon: "Connection",
    color: "#3ba9ff",
  },
  {
    label: "离线设备",
    value: 1018,
    unit: "台",
    trend: 5.2,
    up: false,
    icon: "SwitchButton",
    color: "#38bdf8",
  },
  {
    label: "告警设备",
    value: 24,
    unit: "台",
    trend: 12.6,
    up: false,
    icon: "Warning",
    color: "#f87171",
  },
  {
    label: "今日采集",
    value: 486240,
    unit: "条",
    trend: 7.8,
    up: true,
    icon: "DataLine",
    color: "#22d3ee",
  },
  {
    label: "采集网关",
    value: 186,
    unit: "个",
    trend: 1.2,
    up: true,
    icon: "Odometer",
    color: "#818cf8",
  },
];

// 各省设备数（台），名称需与 GeoJSON 中的 properties.name 完全一致
const PROVINCE_DEVICES: Record<string, number> = {
  北京市: 862,
  天津市: 420,
  河北省: 640,
  山西省: 320,
  内蒙古自治区: 260,
  辽宁省: 480,
  吉林省: 240,
  黑龙江省: 280,
  上海市: 940,
  江苏省: 1120,
  浙江省: 1060,
  安徽省: 580,
  福建省: 640,
  江西省: 380,
  山东省: 1020,
  河南省: 820,
  湖北省: 680,
  湖南省: 620,
  广东省: 1480,
  广西壮族自治区: 360,
  海南省: 180,
  重庆市: 460,
  四川省: 780,
  贵州省: 280,
  云南省: 320,
  西藏自治区: 60,
  陕西省: 440,
  甘肃省: 200,
  青海省: 80,
  宁夏回族自治区: 90,
  新疆维吾尔自治区: 220,
  台湾省: 160,
  香港特别行政区: 280,
  澳门特别行政区: 90,
};

/**
 * 日内维度：近 24 小时数据采集量（条）
 */
const HOURLY_LABELS = Array.from(
  { length: 24 },
  (_, hour) => `${String(hour).padStart(2, "0")}:00`
);

const HOURLY_COLLECTED = [
  2860, 1980, 1620, 1480, 1420, 1680, 3260, 6840, 12460, 18620, 22480, 24620, 19860, 21240, 23460,
  25680, 26820, 24860, 27640, 30240, 31620, 28460, 18620, 8620,
];

// 周维度：近 7 日设备在线率（%）
const WEEK_LABELS = ["09-13", "09-14", "09-15", "09-16", "09-17", "09-18", "09-19"];

const WEEK_ONLINE_RATE = [91.2, 92.4, 93.1, 90.8, 94.2, 95.6, 92.8];

// 设备类型占比
const DEVICE_TYPE_SHARE = [
  { value: 4860, name: "智能电表" },
  { value: 3240, name: "环境传感器" },
  { value: 2680, name: "视频监控" },
  { value: 1420, name: "工业网关" },
  { value: 660, name: "其它" },
];

// 区域设备数 TOP 5
const REGION_DEVICES = [
  { name: "华东", value: 4620 },
  { name: "华南", value: 3480 },
  { name: "华北", value: 2860 },
  { name: "西南", value: 1840 },
  { name: "西北", value: 1060 },
];

// 实时告警池
const LOG_TEMPLATES = [
  "设备 DEV-10284 通信中断，已持续 5 分钟",
  "华东区域网关 GW-0231 心跳超时",
  "智能电表 MET-4820 数据异常",
  "设备 DEV-33820 已恢复在线",
  "华南区域 3 台传感器电量不足",
  "网关 GW-0118 固件升级至 v2.4.1",
  "环境传感器 SEN-2840 温度超阈值",
  "设备 DEV-19820 离线超过 30 分钟",
];

// 设备监控大屏主题色为紫色，与电商（蓝）、系统（青）区分
const ACCENT_COLOR = "#a78bfa";
const {
  axis: AXIS_COLOR,
  grid: GRID_COLOR,
  success: SUCCESS_COLOR,
  pie: PIE_COLORS,
} = SCREEN_COLORS;

// 初始为 0，进入页面后滚动到真实值
const metrics = ref(METRICS.map((item) => ({ ...item, value: 0 })));

const logs = ref([
  { id: 5, time: "15:50:12", text: "设备 DEV-10284 通信中断，已持续 5 分钟" },
  { id: 4, time: "15:49:38", text: "华东区域网关 GW-0231 心跳超时" },
  { id: 3, time: "15:48:05", text: "智能电表 MET-4820 数据异常" },
  { id: 2, time: "15:46:52", text: "设备 DEV-33820 已恢复在线" },
  { id: 1, time: "15:45:20", text: "华南区域 3 台传感器电量不足" },
]);

/**
 * 指标值平滑过渡到目标值
 */
function tweenMetrics(targets: number[], duration: number): void {
  metrics.value.forEach((item, index) => {
    tweenValue(
      item.value,
      targets[index],
      (value) => {
        item.value = value;
      },
      duration
    );
  });
}

// 中国地图数据体积较大，放在 public 下运行时加载，避免打进主包
const mapStatus = ref<"loading" | "ready" | "error">("loading");

// 省份中心点坐标，加载地图后填充，用于绘制散点
const provinceCenters = ref<Record<string, [number, number]>>({});

/**
 * 注册中国地图并取省份坐标
 */
async function loadChinaMap(): Promise<void> {
  try {
    provinceCenters.value = await registerChinaMap(echarts);
    mapStatus.value = "ready";
  } catch {
    // 地图失败不影响其它图表，面板内显示占位文案
    mapStatus.value = "error";
  }
}

// 设备数前 8 的省份，作为地图上的涟漪散点
const scatterData = computed(() =>
  Object.entries(PROVINCE_DEVICES)
    .filter(([name]) => provinceCenters.value[name])
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([name, value]) => ({ name, value: [...provinceCenters.value[name], value] }))
);

const mapOptions = computed<echarts.EChartsCoreOption>(() => ({
  tooltip: {
    trigger: "item",
    formatter: (params: { name: string; value?: number | number[] }) => {
      const value = Array.isArray(params.value) ? params.value[2] : (params.value ?? 0);
      return `${params.name}<br/>设备数：${formatNumber(value)} 台`;
    },
  },
  // geo 只提供投影坐标系，地图着色交给 map 系列，避免与散点错位
  geo: {
    map: "china",
    roam: false,
    silent: true,
    itemStyle: { areaColor: "transparent", borderColor: "transparent" },
  },
  visualMap: {
    min: 0,
    max: 1500,
    left: 8,
    bottom: 8,
    text: ["高", "低"],
    textStyle: { color: AXIS_COLOR },
    inRange: { color: ["#241f4d", "#40348a", "#6a55c4", ACCENT_COLOR] },
    calculable: true,
  },
  series: [
    {
      name: "设备数",
      type: "map",
      map: "china",
      roam: false,
      label: { show: false },
      itemStyle: {
        areaColor: "#241f4d",
        borderColor: "#6f5fc4",
        borderWidth: 0.8,
        shadowColor: "rgba(167, 139, 250, 0.5)",
        shadowBlur: 18,
      },
      emphasis: {
        label: { show: true, color: "#ffffff", fontSize: 11 },
        itemStyle: { areaColor: ACCENT_COLOR },
      },
      select: { disabled: true },
      data: Object.entries(PROVINCE_DEVICES).map(([name, value]) => ({ name, value })),
    },
    {
      name: "重点省份",
      type: "effectScatter",
      coordinateSystem: "geo",
      data: scatterData.value,
      symbolSize: (value: number[]) => Math.max(6, Math.round(value[2] / 120)),
      rippleEffect: { brushType: "stroke", scale: 3.5 },
      itemStyle: { color: SUCCESS_COLOR, shadowBlur: 12, shadowColor: SUCCESS_COLOR },
    },
  ],
}));

const hourlyOptions = {
  tooltip: { trigger: "axis" },
  grid: { left: 60, right: 20, top: 20, bottom: 28 },
  xAxis: {
    type: "category",
    boundaryGap: false,
    data: HOURLY_LABELS,
    axisLine: { lineStyle: { color: AXIS_COLOR } },
    axisLabel: { color: AXIS_COLOR, interval: 3 },
    axisTick: { show: false },
  },
  yAxis: {
    type: "value",
    name: "条",
    nameTextStyle: { color: AXIS_COLOR },
    splitLine: { lineStyle: { color: GRID_COLOR } },
    axisLabel: { color: AXIS_COLOR },
  },
  series: [
    {
      name: "采集量",
      type: "line",
      smooth: true,
      showSymbol: false,
      data: HOURLY_COLLECTED,
      itemStyle: { color: ACCENT_COLOR },
      lineStyle: { width: 2, color: ACCENT_COLOR, shadowColor: ACCENT_COLOR, shadowBlur: 8 },
      areaStyle: { color: verticalGradient("rgba(167, 139, 250, 0.45)", "rgba(167, 139, 250, 0)") },
    },
  ],
};

const weekOptions = {
  tooltip: { trigger: "axis" },
  grid: { left: 60, right: 20, top: 20, bottom: 28 },
  xAxis: {
    type: "category",
    boundaryGap: false,
    data: WEEK_LABELS,
    axisLine: { lineStyle: { color: AXIS_COLOR } },
    axisLabel: { color: AXIS_COLOR },
    axisTick: { show: false },
  },
  yAxis: {
    type: "value",
    name: "%",
    nameTextStyle: { color: AXIS_COLOR },
    min: 85,
    max: 100,
    splitLine: { lineStyle: { color: GRID_COLOR } },
    axisLabel: { color: AXIS_COLOR },
  },
  series: [
    {
      name: "在线率",
      type: "line",
      smooth: true,
      symbolSize: 6,
      data: WEEK_ONLINE_RATE,
      itemStyle: { color: ACCENT_COLOR },
      lineStyle: { width: 2, color: ACCENT_COLOR, shadowColor: ACCENT_COLOR, shadowBlur: 8 },
      areaStyle: { color: verticalGradient("rgba(167, 139, 250, 0.35)", "rgba(167, 139, 250, 0)") },
    },
  ],
};

const regionOptions = {
  tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
  grid: { left: 76, right: 40, top: 12, bottom: 12 },
  xAxis: {
    type: "value",
    splitLine: { lineStyle: { color: GRID_COLOR } },
    axisLabel: { color: AXIS_COLOR },
  },
  yAxis: {
    type: "category",
    // 反转后最大值显示在顶部
    data: REGION_DEVICES.map((item) => item.name).reverse(),
    axisLine: { lineStyle: { color: AXIS_COLOR } },
    axisLabel: { color: AXIS_COLOR, fontSize: 11 },
    axisTick: { show: false },
  },
  series: [
    {
      name: "设备数",
      type: "bar",
      barWidth: 10,
      data: REGION_DEVICES.map((item) => item.value).reverse(),
      itemStyle: {
        borderRadius: [0, 4, 4, 0],
        color: verticalGradient("rgba(167, 139, 250, 0.85)", "rgba(167, 139, 250, 0.22)"),
      },
      label: { show: true, position: "right", color: AXIS_COLOR, fontSize: 11 },
    },
  ],
};

const typeOptions = {
  tooltip: { trigger: "item" },
  legend: {
    bottom: 0,
    itemWidth: 10,
    itemHeight: 10,
    textStyle: { color: AXIS_COLOR, fontSize: 11 },
  },
  series: [
    {
      name: "设备类型",
      type: "pie",
      radius: ["42%", "64%"],
      center: ["50%", "42%"],
      label: { color: AXIS_COLOR, fontSize: 11 },
      labelLine: { lineStyle: { color: AXIS_COLOR } },
      data: DEVICE_TYPE_SHARE.map((item, index) => ({
        ...item,
        itemStyle: { color: [...PIE_COLORS, "#c4b5fd"][index] },
      })),
    },
  ],
};

const screenRef = ref<HTMLElement | null>(null);
const { isFullscreen, toggle: toggleFullscreen } = useFullscreen(screenRef);

let logId = 5;

/**
 * 追加一条实时日志
 */
function pushLog(): void {
  logs.value.unshift({
    id: ++logId,
    time: new Date().toLocaleTimeString("zh-CN", { hour12: false }),
    text: LOG_TEMPLATES[Math.floor(Math.random() * LOG_TEMPLATES.length)],
  });
  logs.value = logs.value.slice(0, 6);
}

let dataTimer: number | undefined;

onMounted(() => {
  dataTimer = window.setInterval(() => {
    tweenMetrics(
      metrics.value.map((item) => item.value + Math.round(Math.random() * 60)),
      900
    );
    pushLog();
  }, 3000);

  loadChinaMap();
  tweenMetrics(
    METRICS.map((item) => item.value),
    1200
  );
});

onBeforeUnmount(() => {
  window.clearInterval(dataTimer);
});
</script>

<style lang="scss" scoped>
/* 覆盖公共大屏样式里的主题色变量 */
.screen {
  --screen-accent: #a78bfa;
  --screen-accent-rgb: 167 139 250;
}

/* 告警列表项分隔线 */
.alert-item {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px dashed rgb(var(--screen-accent-rgb) / 12%);
}
</style>
