<template>
  <BaseChart ref="chart">
    <template #before>
      <!-- 用电方式 -->
      <ElectricityUsageMode />
    </template>
  </BaseChart>
</template>
<script lang="ts" setup>
import { type EChartsOption } from "echarts";
import { useTemplateRef } from "vue";
import { useKeepTicking } from "../composables/useKeepTicking";

defineOptions({ name: "VehicleChargingChart" });

const chartRef = useTemplateRef("chart");

onMounted(() => {
  chartRef.value?.initOptions(options);
});
// 生成一个500到1000的随机数
const randomNum = () => Math.floor(Math.random() * 500) + 500;

const options: EChartsOption = {
  title: {
    text: "车辆充电统计",
    textStyle: {
      color: "#fff",
      fontSize: 20,
      fontFamily: "YouSheBiaoTiHei,Arial,sans-serif",
      fontWeight: "normal",
    },
    top: 0,
    left: 0,
  },
  tooltip: {
    trigger: "axis",
  },
  grid: {
    left: "0",
    right: "0",
    top: "20%",
    bottom: "0",
  },
  // color: ["#a4d8cc", "#25f3e6"],
  xAxis: {
    type: "category",
    boundaryGap: true, // 两边留白
    data: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    axisLabel: {
      color: "#ccc",
      fontSize: "12",
      rotate: 45,
    },
  },
  yAxis: {
    type: "value",
    axisLabel: { color: "#ccc", fontSize: "12" },
    axisLine: {
      lineStyle: {
        color: "rgba(160,160,160,0.3)",
      },
    },
    splitLine: {
      lineStyle: {
        color: "rgba(0, 255, 255, 0.15)",
        type: "dashed",
      },
    },
  },
  series: [
    {
      type: "line",
      name: "充电量（度）",
      symbol: "circle",
      symbolSize: 8,
      itemStyle: {
        color: "#04eef8",
        borderWidth: 2,
        borderColor: "#ffffff",
      },
      lineStyle: {
        width: 4,
        color: {
          type: "linear",
          x: 0,
          y: 0,
          x2: 1,
          y2: 0,
          colorStops: [
            { offset: 0, color: "#04eef8" },
            { offset: 1, color: "#047ee8" },
          ],
        },
        shadowColor: "rgba(4, 126, 232, 0.5)",
        shadowBlur: 15,
      },
      areaStyle: {
        color: {
          type: "linear",
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: "rgba(4, 126, 232, 0.8)" },
            { offset: 1, color: "rgba(4, 126, 232, 0.1)" },
          ],
        },
      },
      label: {
        show: true,
        position: "top",
        color: "#fff",
        fontSize: 12,
        formatter: "{c}",
        backgroundColor: "rgba(0, 0, 0, 0.3)",
        padding: [2, 4],
        borderRadius: 4,
      },
      smooth: true,
      data: Array.from({ length: 24 }, () => randomNum()),
    },
  ],
};

useKeepTicking(() => {
  chartRef.value?.updateCharts({
    series: [{ data: Array.from({ length: 24 }, () => randomNum()) }],
  });
});
</script>
