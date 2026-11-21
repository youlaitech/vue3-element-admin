<template>
  <div class="dash">
    <section class="dash-header">
      <div class="card dash-header__card">
        <div class="dash-header__start">
          <div class="dash-avatar">
            <img v-if="userStore.userInfo.avatar" :src="userStore.userInfo.avatar" alt="" />
            <el-icon v-else :size="22"><User /></el-icon>
          </div>
          <div class="dash-header__text">
            <h1 class="dash-header__greeting">{{ greetings }}</h1>
            <p class="dash-header__date">{{ currentDateStr }}</p>
          </div>
        </div>
        <div class="dash-header__end">
          <a
            href="https://github.com/youlaitech/vue3-element-admin"
            target="_blank"
            title="GitHub"
            class="quick-link"
          >
            <span class="i-svg:github" />
            <span>GitHub</span>
          </a>
          <a
            href="https://gitee.com/youlaiorg/vue3-element-admin"
            target="_blank"
            title="Gitee"
            class="quick-link"
          >
            <span class="i-svg:gitee" />
            <span>Gitee</span>
          </a>
          <a
            href="https://gitcode.com/youlai/vue3-element-admin"
            target="_blank"
            title="GitCode"
            class="quick-link"
          >
            <span class="i-svg:gitcode" />
            <span>GitCode</span>
          </a>
          <a
            href="https://juejin.cn/post/7228990409909108793"
            target="_blank"
            title="文档"
            class="quick-link"
          >
            <el-icon><Document /></el-icon>
            <span>文档</span>
          </a>
          <a
            href="https://www.bilibili.com/video/BV1eFUuYyEFj"
            target="_blank"
            title="视频"
            class="quick-link"
          >
            <el-icon><VideoPlay /></el-icon>
            <span>视频</span>
          </a>
        </div>
      </div>
    </section>

    <section class="dash-stats">
      <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-card__icon">
            <el-icon :size="18"><Monitor /></el-icon>
          </div>
          <div class="stat-card__body">
            <el-tooltip
              :content="
                presence
                  ? `节点 ${presence.nodeId} · ${presence.onlineConnections} 个连接`
                  : '当前节点在线用户，需在线人数查看权限'
              "
            >
              <span class="stat-card__label">本节点在线用户</span>
            </el-tooltip>
            <span class="stat-card__num">{{ onlineUserCount ?? "--" }}</span>
          </div>
          <span
            :class="[
              'stat-card__badge',
              isConnected ? 'stat-card__badge--on' : 'stat-card__badge--off',
            ]"
          >
            {{ isConnected ? "实时" : "离线" }}
          </span>
        </div>

        <div class="stat-card">
          <div class="stat-card__icon">
            <el-icon :size="18"><User /></el-icon>
          </div>
          <div class="stat-card__body">
            <span class="stat-card__label">今日访客</span>
            <span class="stat-card__num">{{ fmt(displayTransitionUvCount) }}</span>
          </div>
          <span
            v-if="uvGrowthText !== '--'"
            :class="[
              'stat-card__trend',
              uvIsUp ? 'stat-card__trend--success' : 'stat-card__trend--danger',
            ]"
          >
            <el-icon :size="12">
              <ArrowUpBold v-if="uvIsUp" />
              <ArrowDownBold v-else />
            </el-icon>
            {{ uvGrowthText }}
          </span>
        </div>

        <div class="stat-card">
          <div class="stat-card__icon">
            <el-icon :size="18"><Document /></el-icon>
          </div>
          <div class="stat-card__body">
            <span class="stat-card__label">今日浏览量</span>
            <span class="stat-card__num">{{ fmt(displayTransitionPvCount) }}</span>
          </div>
          <span
            v-if="pvGrowthText !== '--'"
            :class="[
              'stat-card__trend',
              pvIsUp ? 'stat-card__trend--success' : 'stat-card__trend--danger',
            ]"
          >
            <el-icon :size="12">
              <ArrowUpBold v-if="pvIsUp" />
              <ArrowDownBold v-else />
            </el-icon>
            {{ pvGrowthText }}
          </span>
        </div>

        <div class="stat-card">
          <div class="stat-card__icon">
            <el-icon :size="18"><Avatar /></el-icon>
          </div>
          <div class="stat-card__body">
            <span class="stat-card__label">系统用户</span>
            <span class="stat-card__num">{{ userStats ? fmt(userStats.users) : "--" }}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="dash-chart">
      <div class="card dash-chart__trend">
        <div class="card__head">
          <h3 class="card__title">访问趋势</h3>
          <el-segmented v-model="visitTrendDateRange" :options="visitTrendRangeOptions" />
        </div>
        <div class="card__body card__body--chart">
          <ECharts :options="visitTrendChartOptions" height="240px" />
        </div>
      </div>

      <div class="card dash-chart__overview">
        <div class="card__head">
          <h3 class="card__title">待办概览</h3>
          <el-tag type="primary" size="small" effect="plain">5 项待处理</el-tag>
        </div>
        <div class="card__body overview-card">
          <div class="overview-summary">
            <div v-for="item in todoSummaryItems" :key="item.label" class="overview-summary__item">
              <span class="overview-summary__label">{{ item.label }}</span>
              <strong class="overview-summary__value">{{ item.value }}</strong>
            </div>
          </div>
          <div class="overview-bars">
            <div
              v-for="item in todoOverviewItems"
              :key="item.label"
              class="overview-bars__item"
              :style="{ '--overview-percent': `${item.percent}%` }"
            >
              <div class="overview-bars__meta">
                <span class="overview-bars__label">{{ item.label }}</span>
                <span class="overview-bars__value">{{ item.value }} 项</span>
              </div>
              <span class="overview-bars__track">
                <span class="overview-bars__bar" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="dash-bottom">
      <div class="card">
        <div class="card__head">
          <h3 class="card__title">待办事项</h3>
          <span class="card__count">5 项</span>
        </div>
        <div class="card__body">
          <div
            v-for="todo in todoItems"
            :key="todo.id"
            class="todo-row"
            :class="{ 'todo-row--done': todo.done }"
          >
            <el-icon
              :size="16"
              :class="todo.done ? 'todo-row__icon--done' : 'todo-row__icon--pending'"
            >
              <CircleCheck v-if="todo.done" />
              <Clock v-else />
            </el-icon>
            <span class="todo-row__title">{{ todo.title }}</span>
            <span class="todo-row__tag">{{ todo.tag }}</span>
            <span class="todo-row__time">{{ todo.time }}</span>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card__head">
          <h3 class="card__title">系统动态</h3>
        </div>
        <div class="card__body card__body--scroll">
          <div class="feed">
            <div v-for="item in activities" :key="item.id" class="feed__item">
              <span class="feed__dot" />
              <span class="feed__text">{{ item.content }}</span>
              <span class="feed__time">{{ item.time }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "Dashboard", inheritAttrs: false });

import { dayjs } from "element-plus";
import { ref } from "vue";
import LogAPI from "@/api/system/log";
import UserAPI from "@/api/system/user";
import type { VisitOverviewDetail, VisitTrendDetail } from "@/api/system/log";
import { useUserStore } from "@/stores/user";
import { useSettingsStore } from "@/stores/settings";
import { formatGrowthRate } from "@/utils";
import { useTransition } from "@vueuse/core";
import {
  User,
  Avatar,
  Monitor,
  ArrowUpBold,
  ArrowDownBold,
  Clock,
  CircleCheck,
  Document,
  VideoPlay,
} from "@element-plus/icons-vue";
import { useOnlineUserCount } from "./composables/useOnlineUserCount";

const userStore = useUserStore();
const settingsStore = useSettingsStore();
const { onlineUserCount, isConnected, presence } = useOnlineUserCount();

const hours = new Date().getHours();
const greetings = computed(() => {
  const n = userStore.userInfo.nickname;
  if (hours >= 6 && hours < 8) return `早安，${n}`;
  if (hours >= 8 && hours < 12) return `上午好，${n}`;
  if (hours >= 12 && hours < 18) return `下午好，${n}`;
  if (hours >= 18 && hours < 24) return `晚上好，${n}`;
  return `夜深了，${n}`;
});

const currentDateStr = computed(() => {
  const d = new Date();
  const w = ["日", "一", "二", "三", "四", "五", "六"];
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 星期${w[d.getDay()]}`;
});

interface TodoItem {
  id: number;
  title: string;
  tag: string;
  time: string;
  done: boolean;
}

const todoItems: TodoItem[] = [
  {
    id: 1,
    title: "审批：张三提交的请假申请",
    tag: "审批",
    time: "10分钟前",
    done: false,
  },
  {
    id: 2,
    title: "审核：新用户注册信息核实",
    tag: "审核",
    time: "30分钟前",
    done: false,
  },
  {
    id: 3,
    title: "发布：系统维护通知公告",
    tag: "通知",
    time: "1小时前",
    done: false,
  },
  {
    id: 4,
    title: "处理：工单 #TSK-20240509",
    tag: "工单",
    time: "2小时前",
    done: false,
  },
  {
    id: 5,
    title: "更新：用户角色权限配置",
    tag: "配置",
    time: "昨天 15:30",
    done: true,
  },
];

interface Activity {
  id: number;
  content: string;
  time: string;
}

const activities: Activity[] = [
  { id: 1, content: "管理员 admin 登录系统", time: "3分钟前" },
  { id: 2, content: "新增用户李四，角色为普通用户", time: "25分钟前" },
  { id: 3, content: "系统配置项「登录策略」已更新", time: "1小时前" },
  { id: 4, content: "数据库自动备份任务执行完成", time: "3小时前" },
  { id: 5, content: "角色权限批量修改：运营组新增导出权限", time: "昨天 16:42" },
  { id: 6, content: "SSL 证书已自动续期", time: "昨天 09:15" },
];

const todoOverviewItems = [
  { label: "审批", value: "2", percent: 40 },
  { label: "审核", value: "1", percent: 20 },
  { label: "通知", value: "1", percent: 20 },
  { label: "工单", value: "1", percent: 20 },
];

const todoSummaryItems = [
  { label: "今日新增", value: "3" },
  { label: "即将超时", value: "1" },
  { label: "今日完成", value: "1" },
];

const visitOverviewData = ref<VisitOverviewDetail>({
  todayUvCount: 0,
  uvGrowthRate: 0,
  totalUvCount: 0,
  todayPvCount: 0,
  pvGrowthRate: 0,
  totalPvCount: 0,
});

const uvGrowthText = computed(() => {
  const r = visitOverviewData.value.uvGrowthRate;
  return r == null ? "--" : formatGrowthRate(r);
});
const pvGrowthText = computed(() => {
  const r = visitOverviewData.value.pvGrowthRate;
  return r == null ? "--" : formatGrowthRate(r);
});
const uvIsUp = computed(() => (visitOverviewData.value.uvGrowthRate || 0) > 0);
const pvIsUp = computed(() => (visitOverviewData.value.pvGrowthRate || 0) > 0);
/** 千分位格式化，空值显示占位符 */
const fmt = (n?: number | null) => (n == null ? "--" : n.toLocaleString("en-US"));

// 用户统计：总数取接口真实数据，无权限时降级为占位符
const userStats = ref<{ users: number } | null>(null);
function fetchUserStats() {
  UserAPI.getPage({ pageNum: 1, pageSize: 1 })
    .then((all) => {
      userStats.value = { users: all.total ?? 0 };
    })
    .catch(() => {
      userStats.value = null;
    });
}

const tUv = useTransition(
  computed(() => visitOverviewData.value.todayUvCount),
  {
    duration: 800,
    transition: [0.25, 0.1, 0.25, 1.0],
  },
);
const tPv = useTransition(
  computed(() => visitOverviewData.value.todayPvCount),
  {
    duration: 800,
    transition: [0.25, 0.1, 0.25, 1.0],
  },
);
const displayTransitionUvCount = computed(() => Math.round(Number(tUv.value)));
const displayTransitionPvCount = computed(() => Math.round(Number(tPv.value)));

const visitTrendDateRange = ref(7);
const visitTrendRangeOptions = [
  { label: "近7天", value: 7 },
  { label: "近30天", value: 30 },
];
const visitTrendData = ref<VisitTrendDetail>();
const visitTrendChartOptions = ref({});

/**
 * 读取 CSS 变量，取不到时用兜底值
 */
function getCssVar(name: string, fallback: string) {
  if (typeof window === "undefined") return fallback;

  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

/**
 * 给颜色加上透明度
 */
function colorWithAlpha(color: string, alpha: number) {
  const value = color.trim();

  if (value.startsWith("#")) {
    const hex =
      value.length === 4
        ? `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`
        : value;
    const rgb = Number.parseInt(hex.slice(1), 16);
    const r = (rgb >> 16) & 255;
    const g = (rgb >> 8) & 255;
    const b = rgb & 255;

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  const parts = value.match(/\d+(\.\d+)?/g);
  if (parts && parts.length >= 3) {
    return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${alpha})`;
  }

  return value;
}

/**
 * 拉取访问概览数据
 */
function fetchVisitOverviewData() {
  LogAPI.getVisitOverview().then((d) => {
    visitOverviewData.value = d;
  });
}

/**
 * 拉取访问趋势数据
 */
function fetchVisitTrendData() {
  const s = dayjs()
    .subtract(visitTrendDateRange.value - 1, "day")
    .toDate();
  LogAPI.getVisitTrend({
    startDate: dayjs(s).format("YYYY-MM-DD"),
    endDate: dayjs(new Date()).format("YYYY-MM-DD"),
  }).then((d) => {
    visitTrendData.value = d;
    updateVisitTrendChartOptions(d);
  });
}

/**
 * 更新访问趋势图表配置
 */
function updateVisitTrendChartOptions(d: VisitTrendDetail) {
  const primary = getCssVar("--chart-1", "#165dff");
  const second = getCssVar("--chart-2", "#14c9c9");
  const textSecondary = getCssVar("--el-text-color-secondary", "#909399");
  const borderLighter = getCssVar("--el-border-color-lighter", "#ebeef5");
  const gridLine = colorWithAlpha(borderLighter, 0.72);

  visitTrendChartOptions.value = {
    tooltip: {
      trigger: "axis",
      borderWidth: 0,
      padding: [8, 12],
      extraCssText: "box-shadow: var(--el-box-shadow-light); border-radius: 6px;",
    },
    legend: {
      data: ["浏览量", "访客量"],
      bottom: 0,
      textStyle: { fontSize: 12, color: textSecondary },
      itemWidth: 10,
      itemHeight: 8,
      itemGap: 24,
    },
    grid: { left: "0%", right: "3%", bottom: "14%", top: "5%", containLabel: true },
    xAxis: {
      type: "category",
      data: d.dates,
      axisTick: { show: false },
      axisLine: { lineStyle: { color: colorWithAlpha(borderLighter, 0.82) } },
      axisLabel: { fontSize: 11, color: textSecondary },
      splitLine: { show: false },
    },
    yAxis: {
      type: "value",
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { type: "dashed", color: gridLine, width: 1 } },
      axisLabel: { fontSize: 11, color: textSecondary },
    },
    series: [
      {
        name: "浏览量",
        type: "line",
        data: d.pvList,
        smooth: true,
        symbol: "circle",
        symbolSize: 5,
        showSymbol: false,
        lineStyle: { color: primary, width: 2.2 },
        itemStyle: { color: primary },
        areaStyle: {
          opacity: 1,
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: colorWithAlpha(primary, 0.18) },
              { offset: 0.52, color: colorWithAlpha(primary, 0.08) },
              { offset: 1, color: colorWithAlpha(primary, 0.01) },
            ],
          },
        },
      },
      {
        name: "访客量",
        type: "line",
        data: d.uvList,
        smooth: true,
        symbol: "circle",
        symbolSize: 5,
        showSymbol: false,
        lineStyle: { color: colorWithAlpha(second, 0.9), width: 1.8, opacity: 0.86 },
        itemStyle: { color: second },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: colorWithAlpha(second, 0.08) },
              { offset: 1, color: colorWithAlpha(second, 0) },
            ],
          },
        },
      },
    ],
  };
}

watch(
  () => visitTrendDateRange.value,
  () => fetchVisitTrendData(),
  { immediate: true },
);

watch(
  () => [settingsStore.resolvedTheme, settingsStore.themeColors],
  () => {
    if (!visitTrendData.value) return;

    requestAnimationFrame(() => {
      if (visitTrendData.value) updateVisitTrendChartOptions(visitTrendData.value);
    });
  },
  { deep: true },
);
onMounted(() => {
  fetchVisitOverviewData();
  fetchUserStats();
});
</script>

<style lang="scss" scoped>
// Tokens
$gap: 16px;
$pad: var(--page-padding);
%card {
  overflow: hidden;
  background: var(--content-bg);
  border: 1px solid var(--card-border);
  border-radius: var(--card-radius);
  box-shadow: var(--card-shadow);
}

// Page
.dash {
  display: flex;
  flex-direction: column;
  gap: $gap;
  padding: $pad;
  background: var(--page-bg);

  // 入场节奏：区块与统计卡依次浮现
  > section {
    animation: dash-rise 0.5s cubic-bezier(0.22, 1, 0.36, 1) backwards;

    &:nth-child(2) {
      animation-delay: 0.06s;
    }

    &:nth-child(3) {
      animation-delay: 0.12s;
    }

    &:nth-child(4) {
      animation-delay: 0.18s;
    }
  }
}

@keyframes dash-rise {
  from {
    opacity: 0;
    transform: translateY(12px);
  }

  to {
    opacity: 1;
    transform: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .dash > section {
    animation: none;
  }
}

// Header
.dash-header {
  &__card {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    gap: 18px;
    align-items: center;
    justify-content: space-between;
    min-height: 96px;
    padding: 24px 28px;
    background:
      radial-gradient(
        560px 220px at 88% -60%,
        color-mix(in srgb, var(--el-color-primary) 12%, transparent),
        transparent 70%
      ),
      radial-gradient(
        420px 180px at 4% 140%,
        color-mix(in srgb, var(--chart-2) 10%, transparent),
        transparent 72%
      ),
      var(--content-bg);

    // 细网格纹理：向右上晕染处淡出
    &::before {
      position: absolute;
      inset: 0;
      pointer-events: none;
      content: "";
      background-image:
        linear-gradient(
          to right,
          color-mix(in srgb, var(--el-color-primary) 7%, transparent) 1px,
          transparent 1px
        ),
        linear-gradient(
          to bottom,
          color-mix(in srgb, var(--el-color-primary) 7%, transparent) 1px,
          transparent 1px
        );
      background-size: 28px 28px;
      mask-image: radial-gradient(420px 160px at 85% 0%, #000 0%, transparent 75%);
    }
  }

  &__start {
    position: relative;
    display: flex;
    flex: 1;
    gap: 12px;
    align-items: center;
    min-width: 260px;
  }

  &__text {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__greeting {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
    line-height: 1.3;
    color: var(--el-text-color-primary);
    letter-spacing: -0.015em;
  }

  &__date {
    margin: 0;
    font-size: var(--font-size-secondary);
    color: var(--el-text-color-secondary);
  }

  &__end {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    justify-content: flex-end;
  }
}

.dash-avatar {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  overflow: hidden;
  color: var(--el-color-primary);
  background: color-mix(in srgb, var(--el-color-primary) 14%, var(--content-bg));
  border: 1px solid color-mix(in srgb, var(--el-color-primary) 18%, transparent);
  border-radius: 50%;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

// Quick links
.quick-link {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  justify-content: center;
  height: 32px;
  padding: 0 14px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  text-decoration: none;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-pill);
  transition:
    color 0.15s,
    background-color 0.15s,
    border-color 0.15s,
    transform 0.15s;

  .el-icon,
  [class^="i-svg:"] {
    width: 15px;
    height: 15px;
    font-size: 15px;
    color: currentcolor;
  }

  &:hover {
    color: var(--el-color-primary);
    background: color-mix(in srgb, var(--el-color-primary) 6%, transparent);
    border-color: color-mix(in srgb, var(--el-color-primary) 35%, transparent);
    transform: translateY(-1px);
  }
}

// Stat cards：图标 + 指标 + 状态，单行结构
.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: $gap;
}

.stat-card {
  display: flex;
  gap: 12px;
  align-items: center;
  min-height: 76px;
  padding: 16px 18px;
  @extend %card;

  &__icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    color: var(--el-color-primary);
    background: color-mix(in srgb, var(--el-color-primary) 9%, var(--content-bg));
    border-radius: 8px;
  }

  &__body {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
  }

  &__label {
    margin-bottom: 2px;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 13px;
    color: var(--el-text-color-secondary);
    white-space: nowrap;
  }

  &__num {
    font-size: 24px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    line-height: 1.15;
    color: var(--el-text-color-regular);
  }

  &__badge {
    flex-shrink: 0;
    font-size: 12px;
    font-weight: 500;
    color: var(--el-text-color-secondary);

    &--on {
      color: var(--el-color-success);
    }

    &--off {
      color: var(--el-text-color-secondary);
    }
  }

  &__trend {
    display: inline-flex;
    flex-shrink: 0;
    gap: 3px;
    align-items: center;
    font-size: 12px;
    font-weight: 600;
    color: var(--el-text-color-secondary);

    &--success {
      color: var(--el-color-success);
    }

    &--danger {
      color: var(--el-color-danger);
    }
  }
}

// Generic card
.card {
  display: flex;
  flex-direction: column;
  @extend %card;

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 52px;
    padding: 14px 20px;
    border-bottom: 1px solid var(--card-border);
  }

  &__title {
    margin: 0;
    font-size: var(--font-size-card-title);
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  &__count {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  &__body {
    padding: 18px 20px 20px;

    &--chart {
      padding: 14px 20px 16px;
    }

    &--scroll {
      flex: 1;
      padding: 0;
      overflow-y: auto;
    }
  }
}

.dash-header__card {
  flex-direction: row;
}

// Chart & bottom grids
.dash-chart {
  display: grid;
  grid-template-columns: minmax(0, 3fr) minmax(280px, 1fr);
  gap: $gap;
}

.dash-chart__trend,
.dash-chart__overview {
  min-width: 0;
}

.overview-card {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 20px;
  min-height: 0;
}

.overview-bars {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
  min-height: 142px;
  padding: 0;

  &__item {
    display: flex;
    flex-direction: column;
    gap: 7px;
  }

  &__meta {
    display: flex;
    gap: 10px;
    align-items: center;
    justify-content: space-between;
    min-width: 0;
  }

  &__label,
  &__value {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  &__value {
    flex-shrink: 0;
    text-align: right;
  }

  &__label {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    min-width: 0;
  }

  &__track {
    height: 5px;
    overflow: hidden;
    background: color-mix(in srgb, var(--el-color-primary) 10%, var(--el-fill-color-light));
    border-radius: 999px;
  }

  &__bar {
    display: block;
    width: var(--overview-percent);
    height: 100%;
    background: linear-gradient(90deg, var(--el-color-primary), var(--el-color-primary-light-3));
    border-radius: inherit;
  }
}

.overview-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0;
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);

  &__item {
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-width: 0;
    min-height: 56px;
    padding: 8px 12px;

    &:first-child {
      padding-left: 0;
    }

    &:last-child {
      padding-right: 0;
    }

    & + & {
      border-left: 1px solid var(--border-color);
    }

    &:nth-child(2) .overview-summary__value {
      color: var(--el-color-warning);
    }

    &:nth-child(3) .overview-summary__value {
      color: var(--el-color-success);
    }
  }

  &__label {
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    white-space: nowrap;
  }

  &__value {
    flex-shrink: 0;
    margin-top: 4px;
    font-size: 20px;
    font-weight: 600;
    line-height: 1.1;
    color: var(--el-color-primary);
  }
}

.dash-bottom {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $gap;
}

// Todo rows
.todo-row {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 11px 0;

  & + & {
    border-top: 1px solid var(--el-border-color-lighter);
  }

  &--done {
    .todo-row__title {
      color: var(--el-text-color-placeholder);
      text-decoration: line-through;
    }
  }

  &__icon--pending {
    flex-shrink: 0;
    color: var(--el-color-primary);
  }
  &__icon--done {
    flex-shrink: 0;
    color: var(--el-color-success);
  }

  &__title {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 13px;
    color: var(--el-text-color-regular);
    white-space: nowrap;
  }

  &__tag {
    flex-shrink: 0;
    padding: 1px 8px;
    font-size: 11px;
    line-height: 18px;
    color: var(--el-text-color-secondary);
    background: var(--el-fill-color-light);
    border-radius: var(--radius-pill);
  }

  &__time {
    flex-shrink: 0;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
}

// Activity feed
.feed {
  display: flex;
  flex-direction: column;
  padding: 10px 20px 16px;

  &__item {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: baseline;
    padding: 10px 0 10px 16px;

    &::before {
      position: absolute;
      top: 22px;
      bottom: -4px;
      left: 3px;
      width: 1px;
      content: "";
      background: var(--el-border-color-lighter);
    }

    &:last-child::before {
      display: none;
    }
  }

  &__dot {
    position: absolute;
    top: 12px;
    left: 0;
    width: 7px;
    height: 7px;
    background: var(--el-color-primary);
    border: 2px solid var(--el-color-primary-light-8);
    border-radius: 50%;
  }

  &__text {
    flex: 1;
    min-width: 0;
    font-size: 13px;
    line-height: 1.4;
    color: var(--el-text-color-regular);
  }

  &__time {
    flex-shrink: 0;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
}

// Responsive
@media (max-width: 1200px) {
  .stat-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .dash-header__card {
    flex-direction: column;
    align-items: flex-start;
  }

  .dash-header__end {
    justify-content: flex-start;
  }
}

@media (max-width: 992px) {
  .dash-chart {
    grid-template-columns: 1fr;
  }

  .dash-bottom {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dash {
    gap: 12px;
    padding: 12px;
  }

  .stat-grid {
    grid-template-columns: 1fr;
  }
}
</style>
