<template>
  <div class="leftChart">
    <!-- 车辆实时状态 -->
    <RealTimeStatus />

    <!-- 车辆分布 -->
    <VehicleDistribution />

    <!-- 区域运营 -->
    <RegionalOperation />
  </div>
</template>
<script lang="ts" setup>
defineOptions({ name: "LeftCharts" });
</script>
