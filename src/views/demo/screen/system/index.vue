<template>
  <div class="page-container">
    <div ref="screenRef" class="screen flex min-h-0 flex-1 flex-col gap-3 p-4">
      <ScreenHeader
        :title="SCREEN_TITLE"
        :subtitle="SCREEN_SUBTITLE"
        :is-fullscreen="isFullscreen"
        @toggle-fullscreen="toggleFullscreen()"
      />

      <!-- 布局范式：等权监控墙 —— 顶部细状态条（不是大卡片）+ 4×3 等分网格，无单一视觉中心 -->
      <div class="grid shrink-0 grid-cols-6 gap-3">
        <div
          v-for="item in metrics"
          :key="item.label"
          class="screen__metric flex items-center gap-2 px-3 py-2"
          :style="{ '--metric-color': item.color }"
        >
          <el-icon :size="16" :style="{ color: item.color }">
            <component :is="item.icon" />
          </el-icon>
          <span class="truncate text-12px text-[var(--screen-text-2)]">{{ item.label }}</span>
          <span class="screen__metric-value ml-auto text-16px font-700">
            {{ formatNumber(item.value) }}
          </span>
          <span
            class="shrink-0 text-11px"
            :class="item.up ? 'text-[var(--screen-success)]' : 'text-[var(--screen-danger)]'"
          >
            {{ item.up ? "↑" : "↓" }}{{ item.trend }}%
          </span>
        </div>
      </div>

      <div class="grid min-h-0 flex-1 grid-cols-4 grid-rows-3 gap-3">
        <section class="screen__panel col-start-1 row-start-1 flex min-h-0 flex-col">
          <h2 class="screen__panel-title">
            <el-icon :size="14"><TrendCharts /></el-icon>
            <span>24 小时接口调用趋势</span>
          </h2>
          <div class="min-h-0 flex-1">
            <ECharts :options="hourlyOptions" width="100%" height="100%" />
          </div>
        </section>

        <section class="screen__panel col-start-2 row-start-1 flex min-h-0 flex-col">
          <h2 class="screen__panel-title">
            <el-icon :size="14"><Histogram /></el-icon>
            <span>近 7 日活跃用户</span>
          </h2>
          <div class="min-h-0 flex-1">
            <ECharts :options="weekOptions" width="100%" height="100%" />
          </div>
        </section>

        <section class="screen__panel col-start-3 row-start-1 flex min-h-0 flex-col">
          <h2 class="screen__panel-title">
            <el-icon :size="14"><Menu /></el-icon>
            <span>系统模块访问 TOP 5</span>
          </h2>
          <div class="min-h-0 flex-1">
            <ECharts :options="moduleOptions" width="100%" height="100%" />
          </div>
        </section>

        <section class="screen__panel col-start-4 row-start-1 flex min-h-0 flex-col">
          <h2 class="screen__panel-title">
            <el-icon :size="14"><PieChart /></el-icon>
            <span>登录终端占比</span>
          </h2>
          <div class="min-h-0 flex-1">
            <ECharts :options="terminalOptions" width="100%" height="100%" />
          </div>
        </section>

        <section
          class="screen__panel screen__panel--map col-span-2 col-start-1 row-span-2 row-start-2 flex min-h-0 flex-col"
        >
          <h2 class="screen__panel-title">
            <el-icon :size="14"><MapLocation /></el-icon>
            <span>用户地域分布</span>
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

        <section class="screen__panel col-start-3 row-start-2 flex min-h-0 flex-col">
          <h2 class="screen__panel-title">
            <el-icon :size="14"><Timer /></el-icon>
            <span>24 小时接口响应耗时</span>
          </h2>
          <div class="min-h-0 flex-1">
            <ECharts :options="responseOptions" width="100%" height="100%" />
          </div>
        </section>

        <section class="screen__panel col-start-4 row-start-2 flex min-h-0 flex-col">
          <h2 class="screen__panel-title">
            <el-icon :size="14"><Clock /></el-icon>
            <span>24 小时登录时段分布</span>
          </h2>
          <div class="min-h-0 flex-1">
            <ECharts :options="loginOptions" width="100%" height="100%" />
          </div>
        </section>

        <section class="screen__panel col-start-3 row-start-3 flex min-h-0 flex-col">
          <h2 class="screen__panel-title">
            <el-icon :size="14"><Odometer /></el-icon>
            <span>服务健康度</span>
          </h2>
          <ul class="flex min-h-0 flex-1 flex-col justify-center gap-3 px-1">
            <li v-for="item in healthItems" :key="item.label">
              <div class="mb-1 flex items-center justify-between text-12px">
                <span class="text-[var(--screen-text-2)]">{{ item.label }}</span>
                <span class="text-[var(--screen-text-1)]">{{ item.value }}%</span>
              </div>
              <div class="health-bar">
                <div
                  class="h-full transition-all duration-500"
                  :style="{ width: `${item.value}%`, backgroundColor: item.color }"
                />
              </div>
            </li>
          </ul>
        </section>

        <section class="screen__panel col-start-4 row-start-3 flex min-h-0 flex-col">
          <h2 class="screen__panel-title">
            <el-icon :size="14"><Bell /></el-icon>
            <span>实时系统日志</span>
          </h2>
          <ul class="min-h-0 flex-1 overflow-hidden">
            <li v-for="item in logs" :key="item.id" class="log-item">
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
  registerChinaMap,
  SCREEN_COLORS,
  tweenValue,
  verticalGradient,
} from "@/views/demo/screen/utils";

defineOptions({
  name: "ScreenSystem",
});

// 大屏主题
const SCREEN_TITLE = "系统运营监控大屏";

const SCREEN_SUBTITLE = "SYSTEM OPERATION MONITOR";

// 顶部状态条指标
const METRICS = [
  {
    label: "注册用户",
    value: 286450,
    unit: "人",
    trend: 6.2,
    up: true,
    icon: "User",
    color: "#22d3ee",
  },
  {
    label: "在线用户",
    value: 3842,
    unit: "人",
    trend: 12.8,
    up: true,
    icon: "Avatar",
    color: "#3ba9ff",
  },
  {
    label: "今日登录",
    value: 18620,
    unit: "次",
    trend: 4.5,
    up: true,
    icon: "Key",
    color: "#38bdf8",
  },
  {
    label: "待办任务",
    value: 128,
    unit: "项",
    trend: 8.3,
    up: false,
    icon: "Tickets",
    color: "#818cf8",
  },
  {
    label: "消息推送",
    value: 46820,
    unit: "条",
    trend: 9.1,
    up: true,
    icon: "Bell",
    color: "#a78bfa",
  },
  {
    label: "异常告警",
    value: 7,
    unit: "条",
    trend: 15.4,
    up: false,
    icon: "Warning",
    color: "#f87171",
  },
];

// 各省用户数（人），名称需与 GeoJSON 中的 properties.name 完全一致
const PROVINCE_USERS: Record<string, number> = {
  北京市: 18620,
  天津市: 8420,
  河北省: 14260,
  山西省: 6840,
  内蒙古自治区: 4620,
  辽宁省: 9860,
  吉林省: 5240,
  黑龙江省: 6180,
  上海市: 22480,
  江苏省: 26840,
  浙江省: 24260,
  安徽省: 12840,
  福建省: 14620,
  江西省: 8620,
  山东省: 22640,
  河南省: 18640,
  湖北省: 15260,
  湖南省: 14860,
  广东省: 32680,
  广西壮族自治区: 8260,
  海南省: 4260,
  重庆市: 11240,
  四川省: 19860,
  贵州省: 6840,
  云南省: 7620,
  西藏自治区: 1240,
  陕西省: 10620,
  甘肃省: 4620,
  青海省: 1580,
  宁夏回族自治区: 1860,
  新疆维吾尔自治区: 5240,
  台湾省: 3860,
  香港特别行政区: 6840,
  澳门特别行政区: 2060,
};

const HOURLY_LABELS = Array.from(
  { length: 24 },
  (_, hour) => `${String(hour).padStart(2, "0")}:00`
);

// 近 24 小时接口调用量（次）
const HOURLY_REQUESTS = [
  1260, 980, 820, 760, 720, 860, 1580, 3260, 5860, 8240, 9860, 10420, 8620, 9240, 10260, 11240,
  11860, 10820, 12240, 13620, 14260, 12680, 8420, 4260,
];

// 近 24 小时接口平均响应耗时（ms）
const HOURLY_RESPONSE = [
  86, 72, 64, 58, 56, 62, 78, 96, 128, 146, 158, 162, 138, 142, 152, 166, 172, 158, 176, 192, 204,
  186, 142, 98,
];

// 近 24 小时登录次数
const HOURLY_LOGINS = [
  12, 6, 4, 3, 2, 5, 42, 186, 486, 862, 1124, 1286, 846, 924, 1086, 1248, 1362, 1186, 1428, 1682,
  1846, 1524, 642, 186,
];

// 周维度：近 7 日活跃用户（人）
const WEEK_LABELS = ["09-13", "09-14", "09-15", "09-16", "09-17", "09-18", "09-19"];

const WEEK_ACTIVE_USERS = [8620, 9240, 8860, 10240, 11260, 12680, 9860];

// 模块访问 TOP 5
const MODULE_VISITS = [
  { name: "用户管理", value: 8620 },
  { name: "角色权限", value: 6240 },
  { name: "系统配置", value: 4860 },
  { name: "数据字典", value: 3840 },
  { name: "操作日志", value: 2680 },
];

// 登录终端占比
const TERMINAL_SHARE = [
  { value: 46820, name: "PC 浏览器" },
  { value: 18640, name: "移动端" },
  { value: 8620, name: "小程序" },
  { value: 3240, name: "平板" },
];

// 服务健康度
const HEALTH_ITEMS = [
  { label: "CPU 使用率", value: 42, color: "#22d3ee" },
  { label: "内存占用", value: 68, color: "#3ba9ff" },
  { label: "磁盘空间", value: 54, color: "#818cf8" },
  { label: "网络带宽", value: 76, color: "#a78bfa" },
];

// 实时系统日志池
const LOG_TEMPLATES = [
  "用户 admin 通过 PC 浏览器登录",
  "角色「运营专员」权限变更",
  "定时任务「日志归档」执行成功",
  "接口 /api/v1/users 平均耗时 86ms",
  "配置项 sys.upload.limit 已更新",
  "用户 zhangsan 连续 3 次登录失败",
  "部门「研发中心」新增成员 6 人",
  "系统缓存已刷新",
];

// 系统运营大屏主题色为青色，与电商大屏的蓝色区分
const ACCENT_COLOR = "#22d3ee";
const {
  axis: AXIS_COLOR,
  grid: GRID_COLOR,
  success: SUCCESS_COLOR,
  pie: PIE_COLORS,
} = SCREEN_COLORS;

// 初始为 0，进入页面后滚动到真实值
const metrics = ref(METRICS.map((item) => ({ ...item, value: 0 })));

const healthItems = ref(HEALTH_ITEMS.map((item) => ({ ...item })));

const logs = ref([
  { id: 5, time: "15:50:12", text: "用户 admin 通过 PC 浏览器登录" },
  { id: 4, time: "15:49:38", text: "角色「运营专员」权限变更" },
  { id: 3, time: "15:48:05", text: "定时任务「日志归档」执行成功" },
  { id: 2, time: "15:46:52", text: "配置项 sys.upload.limit 已更新" },
  { id: 1, time: "15:45:20", text: "部门「研发中心」新增成员 6 人" },
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

// 用户数前 8 的省份，作为地图上的涟漪散点
const scatterData = computed(() =>
  Object.entries(PROVINCE_USERS)
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
      return `${params.name}<br/>用户数：${formatNumber(value)} 人`;
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
    max: 34000,
    left: 8,
    bottom: 8,
    text: ["高", "低"],
    textStyle: { color: AXIS_COLOR },
    inRange: { color: ["#0d3b45", "#116b7d", "#189bb5", ACCENT_COLOR] },
    calculable: true,
  },
  series: [
    {
      name: "用户数",
      type: "map",
      map: "china",
      roam: false,
      label: { show: false },
      itemStyle: {
        areaColor: "#0d3b45",
        borderColor: "#2f9fb5",
        borderWidth: 0.8,
        shadowColor: "rgba(34, 211, 238, 0.5)",
        shadowBlur: 18,
      },
      emphasis: {
        label: { show: true, color: "#ffffff", fontSize: 11 },
        itemStyle: { areaColor: ACCENT_COLOR },
      },
      select: { disabled: true },
      data: Object.entries(PROVINCE_USERS).map(([name, value]) => ({ name, value })),
    },
    {
      name: "重点省份",
      type: "effectScatter",
      coordinateSystem: "geo",
      data: scatterData.value,
      symbolSize: (value: number[]) => Math.max(6, Math.round(value[2] / 3000)),
      rippleEffect: { brushType: "stroke", scale: 3.5 },
      itemStyle: { color: SUCCESS_COLOR, shadowBlur: 12, shadowColor: SUCCESS_COLOR },
    },
  ],
}));

const hourlyOptions = {
  tooltip: { trigger: "axis" },
  grid: { left: 56, right: 16, top: 16, bottom: 24 },
  xAxis: {
    type: "category",
    boundaryGap: false,
    data: HOURLY_LABELS,
    axisLine: { lineStyle: { color: AXIS_COLOR } },
    axisLabel: { color: AXIS_COLOR, interval: 5, fontSize: 10 },
    axisTick: { show: false },
  },
  yAxis: {
    type: "value",
    name: "次",
    nameTextStyle: { color: AXIS_COLOR, fontSize: 10 },
    splitLine: { lineStyle: { color: GRID_COLOR } },
    axisLabel: { color: AXIS_COLOR, fontSize: 10 },
  },
  series: [
    {
      name: "调用量",
      type: "line",
      smooth: true,
      showSymbol: false,
      data: HOURLY_REQUESTS,
      itemStyle: { color: ACCENT_COLOR },
      lineStyle: { width: 2, color: ACCENT_COLOR, shadowColor: ACCENT_COLOR, shadowBlur: 8 },
      areaStyle: { color: verticalGradient("rgba(34, 211, 238, 0.42)", "rgba(34, 211, 238, 0)") },
    },
  ],
};

const responseOptions = {
  tooltip: { trigger: "axis" },
  grid: { left: 48, right: 16, top: 16, bottom: 24 },
  xAxis: {
    type: "category",
    boundaryGap: false,
    data: HOURLY_LABELS,
    axisLine: { lineStyle: { color: AXIS_COLOR } },
    axisLabel: { color: AXIS_COLOR, interval: 5, fontSize: 10 },
    axisTick: { show: false },
  },
  yAxis: {
    type: "value",
    name: "ms",
    nameTextStyle: { color: AXIS_COLOR, fontSize: 10 },
    splitLine: { lineStyle: { color: GRID_COLOR } },
    axisLabel: { color: AXIS_COLOR, fontSize: 10 },
  },
  series: [
    {
      name: "响应耗时",
      type: "line",
      smooth: true,
      showSymbol: false,
      data: HOURLY_RESPONSE,
      itemStyle: { color: SUCCESS_COLOR },
      lineStyle: { width: 2, color: SUCCESS_COLOR, shadowColor: SUCCESS_COLOR, shadowBlur: 8 },
      areaStyle: { color: verticalGradient("rgba(52, 211, 153, 0.4)", "rgba(52, 211, 153, 0)") },
    },
  ],
};

const loginOptions = {
  tooltip: { trigger: "axis" },
  grid: { left: 56, right: 16, top: 16, bottom: 24 },
  xAxis: {
    type: "category",
    data: HOURLY_LABELS,
    axisLine: { lineStyle: { color: AXIS_COLOR } },
    axisLabel: { color: AXIS_COLOR, interval: 5, fontSize: 10 },
    axisTick: { show: false },
  },
  yAxis: {
    type: "value",
    name: "次",
    nameTextStyle: { color: AXIS_COLOR, fontSize: 10 },
    splitLine: { lineStyle: { color: GRID_COLOR } },
    axisLabel: { color: AXIS_COLOR, fontSize: 10 },
  },
  series: [
    {
      name: "登录次数",
      type: "bar",
      barWidth: "55%",
      data: HOURLY_LOGINS,
      itemStyle: {
        borderRadius: [2, 2, 0, 0],
        color: verticalGradient(ACCENT_COLOR, "rgba(34, 211, 238, 0.2)"),
      },
    },
  ],
};

const weekOptions = {
  tooltip: { trigger: "axis" },
  grid: { left: 56, right: 16, top: 16, bottom: 24 },
  xAxis: {
    type: "category",
    data: WEEK_LABELS,
    axisLine: { lineStyle: { color: AXIS_COLOR } },
    axisLabel: { color: AXIS_COLOR, fontSize: 10 },
    axisTick: { show: false },
  },
  yAxis: {
    type: "value",
    name: "人",
    nameTextStyle: { color: AXIS_COLOR, fontSize: 10 },
    splitLine: { lineStyle: { color: GRID_COLOR } },
    axisLabel: { color: AXIS_COLOR, fontSize: 10 },
  },
  series: [
    {
      name: "活跃用户",
      type: "bar",
      barWidth: 14,
      data: WEEK_ACTIVE_USERS,
      itemStyle: {
        borderRadius: [3, 3, 0, 0],
        color: verticalGradient(ACCENT_COLOR, "rgba(34, 211, 238, 0.2)"),
      },
    },
  ],
};

const moduleOptions = {
  tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
  grid: { left: 68, right: 32, top: 10, bottom: 10 },
  xAxis: {
    type: "value",
    splitLine: { lineStyle: { color: GRID_COLOR } },
    axisLabel: { color: AXIS_COLOR, fontSize: 10 },
  },
  yAxis: {
    type: "category",
    // 反转后最大值显示在顶部
    data: MODULE_VISITS.map((item) => item.name).reverse(),
    axisLine: { lineStyle: { color: AXIS_COLOR } },
    axisLabel: { color: AXIS_COLOR, fontSize: 10 },
    axisTick: { show: false },
  },
  series: [
    {
      name: "访问量",
      type: "bar",
      barWidth: 9,
      data: MODULE_VISITS.map((item) => item.value).reverse(),
      itemStyle: {
        borderRadius: [0, 4, 4, 0],
        color: verticalGradient("rgba(56, 189, 248, 0.85)", "rgba(56, 189, 248, 0.22)"),
      },
      label: { show: true, position: "right", color: AXIS_COLOR, fontSize: 10 },
    },
  ],
};

const terminalOptions = {
  tooltip: { trigger: "item" },
  legend: {
    bottom: 0,
    itemWidth: 9,
    itemHeight: 9,
    textStyle: { color: AXIS_COLOR, fontSize: 10 },
  },
  series: [
    {
      name: "登录终端",
      type: "pie",
      radius: ["42%", "64%"],
      center: ["50%", "42%"],
      label: { color: AXIS_COLOR, fontSize: 10 },
      labelLine: { lineStyle: { color: AXIS_COLOR } },
      data: TERMINAL_SHARE.map((item, index) => ({
        ...item,
        itemStyle: { color: PIE_COLORS[index] },
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

/**
 * 健康度小幅波动，模拟实时采集
 */
function refreshHealth(): void {
  healthItems.value.forEach((item) => {
    item.value = Math.min(99, Math.max(10, item.value + Math.round(Math.random() * 8) - 4));
  });
}

let dataTimer: number | undefined;

onMounted(() => {
  dataTimer = window.setInterval(() => {
    tweenMetrics(
      metrics.value.map((item) => item.value + Math.round(Math.random() * 60)),
      900
    );
    refreshHealth();
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
  --screen-accent: #22d3ee;
  --screen-accent-rgb: 34 211 238;
}

/* 服务健康度进度条轨道：圆角只由外层裁切，内层保持直角，避免两层圆角叠加出缺口 */
.health-bar {
  height: 6px;
  overflow: hidden;
  background: rgb(var(--screen-accent-rgb) / 18%);
  border-radius: 3px;
}

/* 日志列表项分隔线 */
.log-item {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px dashed rgb(var(--screen-accent-rgb) / 12%);
}
</style>
