<template>
  <div class="app-container">
    <div flex flex-col gap-20px>
      <MultiLevel1 />
      <MultiLevel2 />
      <el-alert :closable="false" title="菜单三级-2" type="warning" />
      <el-input v-model="value" placeholder="缓存测试" />
      <ToDetail />
    </div>
  </div>
</template>

<script lang="ts" setup>
import ToDetail from "./detail";
import MultiLevel1 from "../../level1.vue";
import MultiLevel2 from "../level2.vue";

defineOptions({ name: "MultiLevel32" });
const value = ref("");
onMounted(() => {
  console.log("Multilevel32 onMounted");
});
</script>
