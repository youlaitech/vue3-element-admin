<template>
  <div
    v-if="border"
    rounded="[4px]"
    p-x-2
    p-y-3
    wh-full
    relative
    z-90
    class="border border-[#2E6099] charts-bg"
    flex="~ col"
  >
    <!-- 边框装饰 -->
    <div
      v-for="item in 4"
      :key="item"
      class="ornamental"
      :style="{ borderColor: ornamentalColor }"
    />
    <slot name="before"></slot>
    <div ref="chart" wh-full />
    <slot name="after"></slot>
  </div>
  <div v-else ref="chart" wh-full />
</template>

<script lang="ts" setup>
import { useTemplateRef } from "vue";

/** 核心类型 */
import type { EChartsOption } from "echarts";
import type { EChartsType } from "echarts/core";

/** 核心模块 */
import * as echarts from "echarts/core";
/** 图表类型（按需注册） */
import {
  BarChart,
  PieChart,
  LineChart,
  LinesChart,
  RadarChart,
  ScatterChart,
  EffectScatterChart,
} from "echarts/charts";
/**功能组件（按需注册） */
import {
  GridComponent, // 直角坐标系网格
  LegendComponent, // 图例组件
  TooltipComponent, // 提示框组件
  TitleComponent, // 标题组件
  GeoComponent, // 地理坐标系组件
} from "echarts/components";

/** 渲染器 */
import { CanvasRenderer } from "echarts/renderers"; // 使用Canvas渲染

/** 注册必需组件（按需增减） */
echarts.use([
  /** 渲染器 */
  CanvasRenderer,

  TitleComponent, // 标题
  TooltipComponent, // 提示框
  GridComponent, // 网格系统
  LegendComponent, // 图例

  /** 图表类型 */
  BarChart, // 柱状图
  PieChart, // 饼图
  LineChart, // 折线图
  LinesChart, // 折线图
  RadarChart, // 雷达图
  ScatterChart, // 散点图
  GeoComponent, // 地理坐标系
  EffectScatterChart, // 带有涟漪效果的散点图
]);

defineOptions({ name: "BaseChart" });

/**
 * 数据大屏图表容器：主题、边框与装饰色
 */
const {
  theme = "light",
  border = true,
  ornamentalColor = "#7ce7fd",
} = defineProps({
  theme: { type: String },
  border: { type: Boolean },
  ornamentalColor: { type: String },
});

/**
 * 图表初始化完成后回传实例
 */
const emit = defineEmits<{
  (e: "onload", v: EChartsType): void;
}>();

const chartRef = useTemplateRef<HTMLDivElement>("chart");
const chartInstance = ref<EChartsType>();

/** 初始化图表实例 */
const init = async () => {
  await nextTick();
  if (!chartRef.value) return;

  chartInstance.value = echarts.getInstanceByDom(chartRef.value);
  if (!chartInstance.value) {
    chartInstance.value = markRaw(
      echarts.init(chartRef.value, theme, {
        renderer: "canvas", // 指定渲染模式（canvas性能更好）
      })
    );
  }
};

/** 初始化配置（清空后设置） */
const initOptions = async (options: EChartsOption) => {
  await nextTick();
  chartInstance.value?.clear(); // 清空旧配置
  chartInstance.value?.setOption(options); // 应用新配置
  emit("onload", chartInstance.value!);
};

/** 更新图表配置（增量更新） */
const updateCharts = async (options: EChartsOption) => {
  await nextTick();
  chartInstance.value?.setOption(options);
  // chartInstance.value?.hideLoading();
};

onMounted(() => init());

onBeforeUnmount(() => chartInstance.value?.dispose());

/**
 * 暴露图表实例与初始化、更新方法供父组件调用
 */
defineExpose({
  echarts,
  initOptions,
  updateCharts,
});
</script>
<style lang="scss" scoped>
.charts-bg {
  background: rgb(0 24 106 / 40%) url("../assets/images/line.webp");
}

.ornamental {
  position: absolute;
  width: 18px;
  height: 18px;
  border: 3px solid;
  border-right: none;
  border-bottom: none;
  border-radius: 4px 0;

  &:nth-child(1) {
    top: -2px;
    left: -2px;
  }

  &:nth-child(2) {
    top: -2px;
    right: -2px;
    transform: rotate(90deg);
  }

  &:nth-child(3) {
    bottom: -2px;
    left: -2px;
    transform: rotate(-90deg);
  }

  &:nth-child(4) {
    right: -2px;
    bottom: -2px;
    transform: rotate(180deg);
  }
}
</style>
