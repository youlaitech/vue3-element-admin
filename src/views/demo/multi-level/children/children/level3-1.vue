<template>
  <div class="app-container">
    <div flex flex-col gap-20px>
      <MultiLevel1 />
      <MultiLevel2 />
      <el-alert :closable="false" title="菜单三级-1" type="error" />
      <el-input v-model="value" placeholder="缓存测试" />
      <ToDetail />
    </div>
  </div>
</template>
<script lang="ts" setup>
import ToDetail from "./detail";
import MultiLevel1 from "../../level1.vue";
import MultiLevel2 from "../level2.vue";

defineOptions({ name: "MultiLevel31" });

const value = ref("");
onMounted(() => {
  console.log("Multilevel31 onMounted");
});
</script>
