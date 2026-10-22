<template>
  <BaseChart ref="chart" flex-1 />
</template>
<script setup lang="ts">
import type { EChartsOption } from "echarts";
import { useTemplateRef } from "vue";
import { useKeepTicking } from "../composables/useKeepTicking";

defineOptions({ name: "BatteryHealth" });

const chartRef = useTemplateRef("chart");

onMounted(() => {
  chartRef.value?.initOptions(options);
});

/**
 * 生成一个100到5000的随机数
 */
const randomNumber = () => Math.floor(Math.random() * 5000) + 100;

const healthRanges = ["70-75%", "75-80%", "80-85%", "85-90%", "90-95%", "95-100%"];
const healthData = Array.from({ length: healthRanges.length }, () => randomNumber());

useKeepTicking(() => {
  chartRef.value?.updateCharts({
    series: [{ data: Array.from({ length: healthRanges.length }, () => randomNumber()) }],
  });
});

const options: EChartsOption = {
  backgroundColor: "transparent",
  title: {
    text: "电池健康度",
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
  },
  xAxis: {
    type: "category",
    data: healthRanges,
    axisLine: { lineStyle: { color: "rgba(0, 255, 255, 0.5)" } },
    axisLabel: { color: "#ffffff", fontSize: 10 },
  },
  yAxis: {
    type: "value",
    name: "车辆数量",
    nameTextStyle: { color: "#00ffff" },
    axisLine: { lineStyle: { color: "rgba(0, 255, 255, 0.5)" } },
    axisLabel: { color: "#ffffff" },
    splitLine: { lineStyle: { color: "rgba(0, 255, 255, 0.1)" } },
  },
  series: [
    {
      type: "bar",
      data: healthData,
      itemStyle: {
        color: (params) =>
          ["#ff6b6b", "#ffc107", "#28a745", "#00ff7f", "#00ffff", "#007bff"][params.dataIndex],
        borderRadius: [5, 5, 0, 0],
        borderWidth: 0,
      },
      barWidth: "60%",
      label: {
        show: true,
        color: "#fff",
        position: "top",
        formatter: "{c} 辆",
      },
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
