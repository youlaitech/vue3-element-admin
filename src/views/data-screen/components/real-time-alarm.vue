<template>
  <BaseChart ref="chart" flex-1 />
</template>
<script setup lang="ts">
import { useTemplateRef } from "vue";
import { type EChartsOption } from "echarts";

defineOptions({ name: "RealTimeAlarm" });

const chartRef = useTemplateRef("chart");

onMounted(() => {
  chartRef.value?.initOptions(options);
});

const options: EChartsOption = {
  backgroundColor: "transparent",
  title: {
    text: "实时告警看板",
    textStyle: {
      color: "#fff",
      fontSize: 20,
      fontFamily: "YouSheBiaoTiHei,Arial,sans-serif",
      fontWeight: "normal",
    },
    top: 0,
    left: 0,
  },
  radar: {
    indicator: [
      { name: "电池故障", max: 100 },
      { name: "电机故障", max: 100 },
      { name: "电控故障", max: 100 },
      { name: "网络故障", max: 100 },
      { name: "传感器故障", max: 100 },
      { name: "其他故障", max: 100 },
    ],
    center: ["50%", "50%"],
    radius: "70%",
    axisName: {
      color: "#ffffff",
      fontSize: 14,
      // backgroundColor: "#0175FC",
      // padding: [5, 5, 3, 5],
      // borderRadius: 4,
    },
    splitLine: {
      lineStyle: { color: "rgba(0, 255, 255, 0.3)" },
    },
    splitArea: {
      areaStyle: {
        color: ["rgba(0, 255, 255, 0.1)", "rgba(0, 255, 255, 0.05)"],
      },
    },
  },
  series: [
    {
      type: "radar",
      data: [
        {
          value: [65, 45, 30, 25, 40, 35],
          name: "故障分布",
          areaStyle: {
            color: "rgba(255, 107, 107, 0.3)",
          },
          lineStyle: {
            color: "#ff6b6b",
            width: 2,
          },
          symbol: "circle",
          symbolSize: 5,
          itemStyle: {
            color: "#ff6b6b",
          },
        },
      ],
    },
  ],
  tooltip: {
    backgroundColor: "rgba(26, 35, 50, 0.9)",
    borderColor: "rgba(0, 255, 255, 0.5)",
    textStyle: { color: "#ffffff" },
  },
};
</script>
