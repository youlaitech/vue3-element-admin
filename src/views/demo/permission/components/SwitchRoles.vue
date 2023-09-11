<template>
  <div>
    <div class="mb-[15px]">Your roles: {{ roles }}</div>
    Switch roles:
    <el-radio-group v-model="switchRoles">
      <el-radio-button label="EDITOR" />
      <el-radio-button label="ADMIN" />
    </el-radio-group>
  </div>
</template>

<script setup lang="ts">
import { useUserStoreHook } from "@/store/modules/user";
import { storeToRefs } from "pinia";

const emit = defineEmits(["change"]);
const store = storeToRefs(useUserStoreHook());
const { roles } = store.user.value;

const switchRoles = computed({
  get: () => roles[0],
  set: (val) => {
    Object.assign(roles, [val]);
    emit("change");
  },
});
</script>
