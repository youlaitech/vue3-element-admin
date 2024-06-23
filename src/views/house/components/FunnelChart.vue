<!-- 漏斗图 -->
<template>
  <div :id="id" :class="className" :style="{ height, width }"></div>
</template>

<script setup lang="ts">
import * as echarts from "echarts";

const props = defineProps({
  id: {
    type: String,
    default: "funnelChart",
  },
  className: {
    type: String,
    default: "",
  },
  width: {
    type: String,
    default: "200px",
    required: true,
  },
  height: {
    type: String,
    default: "200px",
    required: true,
  },
});

const options = {
  title: {
    show: true,
    text: "订单线索转化漏斗图",
    x: "center",
    padding: 15,
    textStyle: {
      fontSize: 18,
      fontStyle: "normal",
      fontWeight: "bold",
      color: "#337ecc",
    },
  },
  grid: {
    left: "2%",
    right: "2%",
    bottom: "10%",
    containLabel: true,
  },
  legend: {
    x: "center",
    y: "bottom",
    data: ["Show", "Click", "Visit", "Inquiry", "Order"],
  },

  series: [
    {
      name: "Funnel",
      type: "funnel",
      left: "20%",
      top: 60,
      bottom: 60,
      width: "60%",
      sort: "descending",
      gap: 2,
      label: {
        show: true,
        position: "inside",
      },
      labelLine: {
        length: 10,
        lineStyle: {
          width: 1,
          type: "solid",
        },
      },
      itemStyle: {
        borderColor: "#fff",
        borderWidth: 1,
      },
      emphasis: {
        label: {
          fontSize: 20,
        },
      },
      data: [
        { value: 60, name: "Visit" },
        { value: 40, name: "Inquiry" },
        { value: 20, name: "Order" },
        { value: 80, name: "Click" },
        { value: 100, name: "Show" },
      ],
    },
  ],
};

const chart = ref<any>("");

onMounted(() => {
  chart.value = markRaw(
    echarts.init(document.getElementById(props.id) as HTMLDivElement)
  );

  chart.value.setOption(options);

  window.addEventListener("resize", () => {
    chart.value.resize();
  });
});

onActivated(() => {
  if (chart.value) {
    chart.value.resize();
  }
});
</script>
