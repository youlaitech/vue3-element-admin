<template>
  <div class="p-5 pb-0 sm:p-10 lg:p-20 w-full">
    <el-button icon="arrow-left" @click="router.back()">返回</el-button>
    <el-row>
      <el-col :xs="24" :span="12">
        <h1 class="text-6xl font-bold text-[#484848]">Oops!</h1>
        <h2>你没有权限去该页面</h2>
        <h6>如有不满请联系你领导</h6>
        <div class="flex flex-col items-start gap-1.5 text-sm">
          <span>或者你可以去:</span>
          <el-link type="primary" @click="router.push('/dashboard')">回首页</el-link>
          <el-link type="primary" href="https://www.youlai.tech/">随便看看</el-link>
        </div>
      </el-col>
      <el-col :xs="24" :span="12">
        <img src="@/assets/images/401.svg" class="w-full" />
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "Page401" });
const router = useRouter();
</script>
