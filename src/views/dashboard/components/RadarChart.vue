<!-- 雷达图 -->
<template>
  <el-card>
    <template #header> 订单状态雷达图 </template>
    <div :id="id" :class="className" :style="{ height, width }"></div>
  </el-card>
</template>

<script setup lang="ts">
import * as echarts from "echarts";

const props = defineProps({
  id: {
    type: String,
    default: "radarChart",
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
  grid: {
    left: "2%",
    right: "2%",
    bottom: "10%",
    containLabel: true,
  },
  legend: {
    x: "center",
    y: "bottom",
    data: ["预定数量", "下单数量", "发货数量"],
    textStyle: {
      color: "#999",
    },
  },
  radar: {
    // shape: 'circle',
    radius: "60%",
    indicator: [
      { name: "家用电器" },
      { name: "服装箱包" },
      { name: "运动户外" },
      { name: "手机数码" },
      { name: "汽车用品" },
      { name: "家具厨具" },
    ],
  },
  series: [
    {
      name: "Budget vs spending",
      type: "radar",
      itemStyle: {
        borderRadius: 6,
        color: function (params: any) {
          //自定义颜色
          const colorList = ["#409EFF", "#67C23A", "#E6A23C", "#F56C6C"];
          return colorList[params.dataIndex];
        },
      },
      data: [
        {
          value: [400, 400, 400, 400, 400, 400],
          name: "预定数量",
        },
        {
          value: [300, 300, 300, 300, 300, 300],
          name: "下单数量",
        },
        {
          value: [200, 200, 200, 200, 200, 200],
          name: "发货数量",
        },
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
