<template>
  <div class="component-container">
    <el-card class="project-card">
      <template #header>
        <span class="fw-b">有来项目简介</span>
      </template>
      <div class="project-card__main">
        <!-- 项目简介 -->
        <el-link target="_blank" type="primary" href="https://gitee.com/haoxr">
          youlai-mall
        </el-link>
        是基于Spring Boot 2.7、Spring Cloud 2021 & Alibaba
        2021、Vue3、Element-Plus、uni-app等主流技术栈构建的一整套全栈开源商城项目，
        涉及
        <el-link
          target="_blank"
          type="primary"
          href="https://gitee.com/youlaitech/youlai-mall"
          >后端微服务</el-link
        >
        、
        <el-link
          target="_blank"
          type="success"
          href="https://gitee.com/youlaitech/youlai-mall-admin"
          >前端管理</el-link
        >
        、
        <el-link
          target="_blank"
          type="warning"
          href="https://gitee.com/youlaitech/youlai-mall-weapp"
          >微信小程序
        </el-link>
        和
        <el-link
          target="_blank"
          type="danger"
          href="https://gitee.com/youlaitech/youlai-mall-weapp"
          >APP应用</el-link
        >
        等多端的开发。
        <el-divider />

        <!-- 源码地址 -->
        <el-row :gutter="10">
          <el-col :span="6">
            <el-badge value="免费开源" class="fw-b"> 项目地址 </el-badge>
          </el-col>
          <el-col :span="6">
            <el-link
              target="_blank"
              type="warning"
              href="https://www.youlai.tech/"
              >官方文档</el-link
            >
          </el-col>
          <el-col :span="6">
            <el-link
              target="_blank"
              type="primary"
              href="https://github.com/youlaitech"
              >Github</el-link
            >
          </el-col>
          <el-col :span="6">
            <el-link
              target="_blank"
              type="success"
              href="https://gitee.com/youlaiorg"
              >码云</el-link
            >
          </el-col>
        </el-row>
        <el-divider />
        <!-- 技术栈 -->
        <el-row :gutter="10">
          <el-col :span="6" class="fw-b"> 后端技术栈 </el-col>
          <el-col :span="18">
            Spring Boot、Spring Cloud & Alibaba、Spring Security
            OAuth2、JWT、Elastic Stack 、K8s...
          </el-col>
        </el-row>
        <el-divider />
        <el-row :gutter="10">
          <el-col :span="6" class="fw-b"> 前端技术栈 </el-col>
          <el-col :span="18">
            Vue3、TypeScript、Element-Plus、uni-app、vue3-element-admin ...
          </el-col>
        </el-row>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts">
export default {
  name: 'index'
};
</script>

<style lang="scss" scoped>
.component-container {
  .project-card {
    font-size: 14px;

    &__main {
      line-height: 28px;
      height: 320px;
      overflow-y: auto;
      overflow-x: hidden;
    }
  }

  .fw-b {
    font-weight: bold;
  }
}
</style>
