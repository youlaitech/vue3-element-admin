<template>
  <BaseChart ref="chart" flex-1 />
</template>
<script lang="ts" setup>
import { type EChartsOption } from "echarts";
import { city } from "../utils/seriesData";
import { useTemplateRef } from "vue";
import { useKeepTicking } from "../composables/useKeepTicking";

defineOptions({ name: "VehicleDistribution" });

const chartRef = useTemplateRef("chart");

onMounted(() => {
  chartRef.value?.initOptions(options);
});

// 生成一个500到2000的数值
const randomNum = () => Math.floor(Math.random() * (500 - 2000 + 1)) + 2000;

const buildGeoData = () =>
  Array.from({ length: 20 }).map(() => {
    const cityData = city[Math.floor(Math.random() * city.length)];

    const {
      name,
      value: [a, b],
    } = cityData;

    return {
      name,
      value: [a, b, randomNum()],
    };
  });

useKeepTicking(() => {
  chartRef.value?.updateCharts({
    series: [{ data: buildGeoData() }],
  });
});

const options: EChartsOption = {
  backgroundColor: "transparent",
  title: {
    text: "车辆分布热力图",
    textStyle: {
      color: "#fff",
      fontSize: 20,
      fontFamily: "YouSheBiaoTiHei,Arial,sans-serif",
      fontWeight: "normal",
    },
    top: 0,
    left: "center",
  },
  tooltip: {
    trigger: "item",
    backgroundColor: "rgba(26, 35, 50, 0.9)",
    borderColor: "rgba(0, 255, 255, 0.5)",
    textStyle: { color: "#ffffff" },
    formatter(params: any) {
      return params.name + "<br/>车辆数: " + params.value[2];
    },
  },
  grid: {
    left: "8%",
    right: "8%",
    top: "13%",
    bottom: 0,
  },
  xAxis: {
    type: "value",
    name: "经度",
    nameTextStyle: { color: "#00ffff" },
    axisLine: { lineStyle: { color: "rgba(0, 255, 255, 0.5)" } },
    axisLabel: { color: "#ffffff", fontSize: 10 },
    splitLine: { lineStyle: { color: "rgba(0, 255, 255, 0.1)" } },
    min: 100,
    max: 125,
  },
  yAxis: {
    type: "value",
    name: "纬度",
    nameTextStyle: { color: "#00ffff" },
    axisLine: { lineStyle: { color: "rgba(0, 255, 255, 0.5)" } },
    axisLabel: { color: "#ffffff", fontSize: 10 },
    splitLine: { lineStyle: { color: "rgba(0, 255, 255, 0.1)" } },
    min: 20,
    max: 50,
  },
  series: [
    {
      type: "scatter",
      data: buildGeoData(),
      symbolSize(val) {
        return Math.max(val[2] / 100, 8);
      },
      itemStyle: {
        color(params: any) {
          const colors = ["#00ffff", "#00ff7f", "#ffc107", "#ff6b6b"];
          const index = Math.floor(params.value[2] / 600);

          return colors[Math.min(index, 3)];
        },
        shadowBlur: 10,
        shadowColor: "#00ffff",
        opacity: 0.8,
      },
      label: {
        show: true,
        formatter: "{b}",
        position: "top",
        color: "#ffffff",
        fontSize: 10,
      },
    },
  ],
};
</script>
