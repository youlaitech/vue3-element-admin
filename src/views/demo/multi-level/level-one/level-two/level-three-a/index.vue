<template>
  <div class="page-container">
    <div flex flex-col gap-20px>
      <LevelOnePanel />
      <LevelTwoPanel />
      <el-alert :closable="false" title="三级菜单 A" type="error" />
      <el-input v-model="value" placeholder="缓存测试" />
      <ToDetail />
    </div>
  </div>
</template>
<script lang="ts" setup>
import LevelOnePanel from "../../../components/LevelOnePanel.vue";
import LevelTwoPanel from "../../../components/LevelTwoPanel.vue";
import ToDetail from "../../../components/ToDetail";

defineOptions({ name: "MultiLevelLevelThreeA" });

const value = ref("");
</script>
