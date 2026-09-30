<template>
  <BaseChart ref="chart" flex-1 />
</template>
<script setup lang="ts">
import type { EChartsOption } from "echarts";
import { useTemplateRef } from "vue";
import { useKeepTicking } from "../composables/useKeepTicking";

defineOptions({ name: "MileageEnergyConsumption" });

const chartRef = useTemplateRef("chart");

onMounted(() => {
  chartRef.value?.initOptions(options);
});

/**
 * 生成一个800到1500的随机数
 */
const randomMileage = () => Math.floor(Math.random() * (1500 - 800 + 1)) + 800;

/**
 * 生成一个15到20的随机数
 */
const randomEnergy = () => Math.floor(Math.random() * (20 - 15 + 1)) + 15;

const days = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
const mileageData = Array.from({ length: 7 }, () => randomMileage());
const energyData = Array.from({ length: 7 }, () => randomEnergy());

useKeepTicking(() => {
  chartRef.value?.updateCharts({
    series: [
      { data: Array.from({ length: 7 }, () => randomMileage()) },
      { data: Array.from({ length: 7 }, () => randomEnergy()) },
    ],
  });
});

const options: EChartsOption = {
  backgroundColor: "transparent",
  animation: true,
  animationDuration: 1500,
  animationEasing: "cubicInOut",
  title: {
    text: "里程与能耗分析",
    textStyle: {
      color: "#fff",
      fontSize: 20,
      fontFamily: "YouSheBiaoTiHei,Arial,sans-serif",
      fontWeight: "normal",
    },
    top: 0,
    left: "center",
  },
  grid: {
    left: 0,
    right: "2%",
    top: "20%",
    bottom: 0,
    // containLabel: true, // 已过时的方式
  },
  xAxis: {
    type: "category",
    data: days,
    axisLine: {
      lineStyle: {
        color: "rgba(0, 255, 255, 0.6)",
        width: 2,
      },
    },
    axisLabel: {
      color: "#a0e7ff",
      fontSize: 12,
      margin: 10,
    },
    axisTick: {
      alignWithLabel: true,
      lineStyle: {
        color: "rgba(0, 255, 255, 0.3)",
      },
    },
  },
  yAxis: [
    {
      type: "value",
      name: "km",
      nameTextStyle: { color: "#00ff7f" },
      axisLine: { lineStyle: { color: "rgba(0, 255, 127, 0.5)" } },
      axisLabel: { color: "#00ff7f" },
      splitLine: { show: false },
    },
    {
      type: "value",
      name: "kWh/100km",
      nameTextStyle: { color: "#00ffff" },
      axisLine: { lineStyle: { color: "rgba(0, 255, 255, 0.5)" } },
      axisLabel: { color: "#00ffff" },
      splitLine: { lineStyle: { color: "rgba(0, 255, 255, 0.1)" } },
    },
  ],
  series: [
    {
      name: "日行驶里程",
      type: "bar",
      yAxisIndex: 0,
      data: mileageData,
      barWidth: "42%",
      itemStyle: {
        color: {
          type: "linear",
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: "#00ff7f" },
            { offset: 0.5, color: "rgba(0, 255, 127, 0.7)" },
            { offset: 1, color: "rgba(0, 255, 127, 0.3)" },
          ],
          global: false,
        },
        borderRadius: [5, 5, 0, 0],
        borderWidth: 0,
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 15,
          shadowColor: "rgba(0, 255, 127, 0.8)",
        },
      },
      // label: {
      //   show: true,
      //   position: "top",
      //   color: "#00ff7f",
      //   formatter: "{c}",
      // },
      z: 2,
    },
    {
      name: "平均能耗",
      type: "line",
      smooth: true,
      yAxisIndex: 1,
      data: energyData,
      lineStyle: {
        color: "#00ffff",
        width: 3,
        shadowColor: "rgba(0, 255, 255, 0.5)",
        shadowBlur: 10,
      },
      symbol: "circle",
      symbolSize: 10,
      itemStyle: {
        color: "#00ffff",
        borderWidth: 2,
        borderColor: "#0d1825",
      },
      emphasis: {
        scale: 1.5,
        itemStyle: {
          borderWidth: 2,
          borderColor: "#0d1825",
          shadowBlur: 10,
          shadowColor: "rgba(0, 255, 255, 0.8)",
        },
      },
      // label: {
      //   show: true,
      //   position: "top",
      //   color: "#00ffff",
      //   formatter: "{c}",
      // },
      areaStyle: {
        color: {
          type: "linear",
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            {
              offset: 0,
              color: "rgba(0, 255, 255, 0.3)",
            },
            {
              offset: 1,
              color: "rgba(0, 255, 255, 0.05)",
            },
          ],
        },
      },
      z: 3,
    },
  ],
  tooltip: {
    trigger: "axis",
    backgroundColor: "rgba(26, 35, 50, 0.9)",
    borderColor: "rgba(0, 255, 255, 0.5)",
    textStyle: { color: "#ffffff" },
  },
};
</script>
