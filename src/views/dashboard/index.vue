<template>
  <div class="dashboard-container">
    <github-corner class="github-corner"/>

    <!-- 数据 -->
    <el-row :gutter="40" class="card-panel-col">
      <el-col :xs="12" :span="12" :lg="6">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper" style="margin-top: -10px">
            <el-image style="width:180px; height: 100px"
                      src="https://gitee.com/haoxr/image/raw/master/20210606213932.png"/>
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">
              {{ nickname }}
            </div>
            <div class="card-panel-text">
              <el-tag size="mini" type="danger">莫得感情</el-tag>
              <el-tag size="mini" type="success" style="margin-left: 5px">打工人</el-tag>
            </div>
          </div>
        </div>
      </el-col>

      <el-col :xs="12" :span="12" :lg="6" class="card-panel-col">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-people">
            <svg-icon icon-class="peoples" class-name="card-panel-icon"/>
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">
              总访问量
            </div>
            <div class="card-panel-num">123456</div>
          </div>
        </div>
      </el-col>

      <el-col :xs="12" :span="12" :lg="6" class="card-panel-col">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-money">
            <svg-icon icon-class="money" class-name="card-panel-icon"/>
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">
              支付金额
            </div>
            <div class="card-panel-num">123456</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :span="12" :lg="6" class="card-panel-col">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-shopping">
            <svg-icon icon-class="shopping" class-name="card-panel-icon"/>
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">
              订单数
            </div>
            <div class="card-panel-num">123456</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 项目 + 团队成员介绍 -->
    <el-row :gutter="40">

      <!-- 项目介绍 -->
      <el-col :sm="24" :lg="12">
        <el-card class="project-card">
          <template #header>
            <span class="fw-b">有来项目简介</span>
          </template>
          <div class="project-card__main">
            <!-- 项目简介 -->
            <el-link target="_blank" type="primary" href="https://gitee.com/haoxr">
              youlai-mall
            </el-link>
            是基于Spring Boot 2.5、Spring Cloud 2020 &
            Alibaba 2021、Vue3、Element-Plus、uni-app等主流技术栈构建的一整套全栈开源商城项目，
            涉及
            <el-link target="_blank" type="primary" href="https://gitee.com/youlaitech/youlai-mall">后端微服务</el-link>
            、
            <el-link target="_blank" type="success" href="https://gitee.com/youlaitech/youlai-mall-admin">前端管理</el-link>
            、
            <el-link target="_blank" type="warning" href="https://gitee.com/youlaitech/youlai-mall-weapp">微信小程序
            </el-link>
            和
            <el-link target="_blank" type="danger" href="https://gitee.com/youlaitech/youlai-mall-weapp">APP应用</el-link>
            等多端的开发。
            <el-divider/>

            <!-- 源码地址 -->
            <el-row :gutter="10">
              <el-col :span="4">
                <el-badge value="免费开源" class="fw-b">
                  源码地址
                </el-badge>
              </el-col>
              <el-col :span="4">
                <el-link target="_blank" type="primary" href="https://github.com/youlaitech">Github</el-link>
              </el-col>
              <el-col :span="16">
                <el-link target="_blank" type="success" href="https://gitee.com/youlaiorg">码云</el-link>
              </el-col>
            </el-row>
            <el-divider/>
            <!-- 技术栈 -->
            <el-row :gutter="10">
              <el-col :span="4" class="fw-b">
                后端技术栈
              </el-col>
              <el-col :span="20">
                Spring Boot、Spring Cloud & Alibaba、Spring Security
                OAuth2、JWT、Seata、Sentinel、Elastic Stack ...
              </el-col>
            </el-row>
            <el-divider/>
            <el-row :gutter="10">
              <el-col :span="4" class="fw-b">
                前端技术栈
              </el-col>
              <el-col :span="20">
                Vue3、TypeScript、Element-Plus、uni-app、vue3-element-admin ...
              </el-col>
            </el-row>
          </div>
        </el-card>
      </el-col>

      <!-- 团队介绍 -->
      <el-col :sm="24" :lg="12">
        <el-card class="team-card">
          <template #header>
            <span class="fw-b">有来开源组织 X 有来技术团队 </span>
          </template>
          <el-tabs v-model="teamActiveName">
            <el-tab-pane label="开发人员" name="developer">
              <div class="developer-wrapper">
                <ul class="developer-content">
                  <li>12</li>
                  <li>12</li>
                  <li>123</li>
                  <li>12</li>
                  <li>123</li>
                  <li>33</li>
                  <li>33</li>
                  <li>33</li>
                  <li>33</li>
                  <li>33</li>
                  <li>33</li>
                  <li>33</li>
                </ul>
              </div>
            </el-tab-pane>

            <el-tab-pane label="有来交流群" name="2">
            </el-tab-pane>

            <el-tab-pane label="加入开源组织" name="3">
            </el-tab-pane>

          </el-tabs>
        </el-card>
      </el-col>
    </el-row>


    <!-- Echarts 图表 -->
    <el-row :gutter="40" style="margin-top: 20px">
      <el-col :sm="24" :lg="8">
        <BarChart id="barChart" height="400px" width="100%" class="chart-container"/>
      </el-col>

      <el-col :xs="24" :sm="12" :lg="8">
        <PieChart id="pieChart" height="400px" width="100%" class="chart-container"/>
        <!--订单漏斗图-->
        <!--<FunnelChart id="funnelChart" height="400px" width="100%" class="chart-container"/>-->
      </el-col>

      <el-col :xs="24" :sm="12" :lg="8">
        <RadarChart id="radarChart" height="400px" width="100%" class="chart-container"/>
      </el-col>
    </el-row>

  </div>
</template>

<script setup lang="ts">

// Vue引用
import {computed, nextTick, onMounted, reactive, toRefs, watchEffect} from "vue";

// 组件引用
import GithubCorner from '@/components/GithubCorner/index.vue'
import TodoList from './components/TodoList/index.vue'
import SvgIcon from '@/components/SvgIcon/index.vue'
import BarChart from "./components/BarChart.vue";
import PieChart from "./components/PieChart.vue";
import RadarChart from "./components/RadarChart.vue";
import FunnelChart from "./components/FunnelChart.vue";
import BScroll from 'better-scroll'

import {useUserStoreHook} from "@/store/modules/user"

const roles = computed(() => useUserStoreHook().roles);
const avatar = computed(() => useUserStoreHook().avatar);
const nickname = computed(() => useUserStoreHook().nickname);

const state = reactive({
  teamActiveName: 'developer'
})

const {teamActiveName} = toRefs(state)

let bScroll = reactive({})

onMounted(() => {
  bScroll = new BScroll(document.querySelector('.developer-wrapper') as any, {
    startX: 0,
    click: true,
    scrollX: true,
    scrollY: false,
    eventPassthrough: "vertical" // 横向滚动，保留纵向原生滚动
  })
})

watchEffect(() => {
  nextTick(() => {
    bScroll && (bScroll as any).refresh()
  })
})
</script>


<style lang="scss" scoped>

.dashboard-container {
  padding: 24px;
  background-color: rgb(240, 242, 245);
  position: relative;

  .github-corner {
    position: absolute;
    top: 0px;
    border: 0;
    right: 0;
    z-index: 99;
  }

  .box-center {
    margin: 0 auto;
    display: table;
  }

  .user-profile {
    .user-name {
    }

    .box-center {
      padding-top: 10px;
    }

    .user-role {
      padding-top: 10px;
      font-weight: 400;
      font-size: 14px;
    }

    .box-social {
      padding-top: 30px;

      .el-table {
        border-top: 1px solid #dfe6ec;
      }
    }

    .user-follow {
      padding-top: 20px;
    }
  }

  .card-panel-col {
    margin-bottom: 12px;
  }

  .card-panel {
    height: 108px;
    cursor: pointer;
    font-size: 12px;
    position: relative;
    overflow: hidden;
    color: #666;
    background: #fff;
    box-shadow: 4px 4px 40px rgba(0, 0, 0, .05);
    border-color: rgba(0, 0, 0, .05);

    &:hover {
      .card-panel-icon-wrapper {
        color: #fff;
      }

      .icon-user {
        background: #e77541;
      }

      .icon-people {
        background: #40c9c6;
      }


      .icon-money {
        background: #f4516c;
      }

      .icon-shopping {
        background: #34bfa3
      }
    }

    .icon-people {
      color: #40c9c6;

      .svg-icon {
        width: 3em !important;
        height: 3em !important;
      }
    }

    .icon-message {
      color: #36a3f7;

      .svg-icon {
        width: 3em !important;
        height: 3em !important;
      }
    }

    .icon-money {
      color: #f4516c;

      .svg-icon {
        width: 3.2em !important;
        height: 3.2em !important;
      }
    }

    .icon-shopping {
      color: #34bfa3;

      .svg-icon {
        width: 3em !important;
        height: 3em !important;
      }
    }

    .card-panel-icon-wrapper {
      float: left;
      margin: 14px 0 0 14px;
      padding: 16px;
      transition: all 0.38s ease-out;
      border-radius: 6px;
    }

    .card-panel-description {
      float: right;
      font-weight: bold;
      margin: 26px 20px 0;

      .card-panel-text {
        line-height: 18px;
        color: rgba(0, 0, 0, 0.45);
        font-size: 16px;
        margin-bottom: 12px;
      }

      .card-panel-num {
        font-size: 20px;
      }
    }
  }

  .project-card {
    font-size: 14px;

    &__main {
      line-height: 28px;
    }
  }

  .team-card {
    font-size: 14px;

    &__main {
      line-height: 28px;
    }
  }

  .chart-container {
    background: #ffffff;
  }

  .fw-b {
    font-weight: bold;
  }

}

</style>
