<!-- 雷达图 -->
<template>
  <div :id="id" :class="className" :style="{ height, width }" />
</template>

<script setup lang="ts">
import {
  nextTick,
  onActivated,
  onBeforeUnmount,
  onDeactivated,
  onMounted
} from 'vue';
import { init, EChartsOption } from 'echarts';
import resize from '@/utils/resize';

const props = defineProps({
  id: {
    type: String,
    default: 'radarChart'
  },
  className: {
    type: String,
    default: ''
  },
  width: {
    type: String,
    default: '200px',
    required: true
  },
  height: {
    type: String,
    default: '200px',
    required: true
  }
});

const { mounted, chart, beforeDestroy, activated, deactivated } = resize();

function initChart() {
  const radarChart = init(document.getElementById(props.id) as HTMLDivElement);

  radarChart.setOption({
    title: {
      show: true,
      text: '订单状态统计',
      x: 'center',
      padding: 15,
      textStyle: {
        fontSize: 18,
        fontStyle: 'normal',
        fontWeight: 'bold',
        color: '#337ecc'
      }
    },
    grid: {
      left: '2%',
      right: '2%',
      bottom: '10%',
      containLabel: true
    },
    legend: {
      x: 'center',
      y: 'bottom',
      data: ['预定数量', '下单数量', '发货数量']
    },
    radar: {
      // shape: 'circle',
      radius: '60%',
      indicator: [
        { name: '家用电器', max: 6500 },
        { name: '服装箱包', max: 16000 },
        { name: '运动户外', max: 30000 },
        { name: '手机数码', max: 38000 },
        { name: '汽车用品', max: 52000 },
        { name: '家具厨具', max: 25000 }
      ]
    },
    series: [
      {
        name: 'Budget vs spending',
        type: 'radar',
        itemStyle: {
          borderRadius: 6,
          normal: {
            color: function (params: any) {
              //自定义颜色
              const colorList = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C'];
              return colorList[params.dataIndex];
            }
          }
        },
        data: [
          {
            value: [4200, 10000, 20000, 35000, 50000, 18000],
            name: '预定数量'
          },
          {
            value: [5000, 14000, 28000, 26000, 42000, 21000],
            name: '下单数量'
          },
          {
            value: [5000, 12000, 23000, 18000, 31000, 11000],
            name: '发货数量'
          }
        ]
      }
    ]
  } as EChartsOption);

  chart.value = radarChart;
}

onBeforeUnmount(() => {
  beforeDestroy();
});

onActivated(() => {
  activated();
});

onDeactivated(() => {
  deactivated();
});

onMounted(() => {
  mounted();
  nextTick(() => {
    initChart();
  });
});
</script>

<style lang="scss" scoped></style>
