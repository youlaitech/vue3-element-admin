<!-- 雷达图 -->
<template>
  <div
      :id="id"
      :class="className"
      :style="{height, width}"
  />
</template>

<script setup lang="ts">
import {nextTick, onMounted} from "vue";
import {init, EChartsOption} from 'echarts'

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
})

function initChart() {
  const pieChart = init(document.getElementById(props.id) as HTMLDivElement)

  pieChart.setOption({
    title: {
      show: true,
      text: '订单状态总雷达图',
      x: 'center',
      padding: 15,
      textStyle: {
        fontSize: 18,
        fontStyle: 'normal',
        fontWeight: 'bold',
        color:'#096b92'
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
      data: ['待支付', '已发货']
    },
    radar: {
      // shape: 'circle',
      indicator: [
        { name: 'Sales', max: 6500 },
        { name: 'Administration', max: 16000 },
        { name: 'Information Technology', max: 30000 },
        { name: 'Customer Support', max: 38000 },
        { name: 'Development', max: 52000 },
        { name: 'Marketing', max: 25000 }
      ]
    },
    series: [
      {
        name: 'Budget vs spending',
        type: 'radar',
        data: [
          {
            value: [4200, 3000, 20000, 35000, 50000, 18000],
            name: '待支付'
          },
          {
            value: [5000, 14000, 28000, 26000, 42000, 21000],
            name: '已发货'
          }
        ]
      }
    ]
  })
}

onMounted(() => {
  nextTick(() => {
    initChart()
  })
})
</script>

<style lang="scss" scoped>

</style>