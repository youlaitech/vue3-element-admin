<!-- 饼图 -->
<template>
  <el-card>
    <template #header> 产品分类饼图 </template>
    <div :id="id" :class="className" :style="{ height, width }" />
  </el-card>
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
    default: 'pieChart'
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
  const pieChart = init(document.getElementById(props.id) as HTMLDivElement);

  pieChart.setOption({
    grid: {
      left: '2%',
      right: '2%',
      bottom: '10%',
      containLabel: true
    },
    legend: {
      top: 'bottom',
      textStyle: {
        color: '#999'
      }
    },
    series: [
      {
        name: 'Nightingale Chart',
        type: 'pie',
        radius: [50, 130],
        center: ['50%', '50%'],
        roseType: 'area',
        itemStyle: {
          borderRadius: 1,
          color: function (params: any) {
            //自定义颜色
            const colorList = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C'];
            return colorList[params.dataIndex];
          }
        },
        data: [
          { value: 26, name: '家用电器' },
          { value: 27, name: '户外运动' },
          { value: 24, name: '汽车用品' },
          { value: 23, name: '手机数码' }
        ]
      }
    ]
  } as EChartsOption);

  chart.value = pieChart;
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
