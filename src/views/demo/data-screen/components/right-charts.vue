<template>
  <div class="rightChart">
    <!-- 实时告警看板 -->
    <RealTimeAlarm />
    <!-- 实时运行监控 -->
    <RealTimeOperation />
    <!-- 里程与能耗分析 -->
    <MileageEnergyConsumption />
    <!-- 电池健康度 -->
    <BatteryHealth />
  </div>
</template>
<script lang="ts" setup>
defineOptions({ name: "RightCharts" });
</script>
