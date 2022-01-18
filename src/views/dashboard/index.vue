<template>
  <div class="dashboard-container">
    <github-corner class="github-corner"/>

    <el-row :gutter="40" class="card-panel-col">
      <el-col :xs="12" :span="12" :lg="6">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper" style="margin-top: -10px">
            <el-image style="width:200px; height: 90px"
                      src="https://gitee.com/haoxr/image/raw/master/20210606213932.png"></el-image>
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
            <div class="card-panel-num">123456 </div>
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
            <div class="card-panel-num">123456 </div>
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
            <div class="card-panel-num">123456 </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="40">
      <el-col :span="12" :xs="24">
        <el-card class="project-brief-introduction" style="height: 420px;">
          <div slot="header" class="clearfix">
            <span>有来项目简介</span>
          </div>
          <div style="font-size: 14px">
            <div class="content">
              <el-link target="_blank" style="font-weight: bold" type="primary" href="https://gitee.com/youlaitech/youlai-mall">
                youlai-mall
              </el-link>
              是基于Spring Boot 2.5.0、Spring Cloud 2020 &
              Alibaba 2021、vue、element-ui、uni-app快速构建的一套全栈开源商城项目。
              <el-divider/>
              项目采用微服务、前后端分离开发模式。
              <br/>
              汇集全栈主流的技术栈；
              涉及
              <el-link target="_blank" type="primary" size="mini" href="https://gitee.com/youlaitech/youlai-mall">后端微服务</el-link>
              、
              <el-link target="_blank" type="success" size="mini" href="https://gitee.com/youlaitech/youlai-mall-admin">前端管理</el-link>
              、
              <el-link target="_blank" type="warning" size="mini" href="https://gitee.com/youlaitech/youlai-mall-weapp">微信小程序</el-link>
              和
              <el-link target="_blank" type="danger" size="mini" href="https://gitee.com/youlaitech/youlai-mall-weapp">APP应用</el-link>
              等多端的开发。
            </div>
            <el-divider/>
            <el-row :gutter="10">
              <el-col :span="8">
                <el-badge value="免费开源" style="font-weight: bold">
                  项目源码地址
                </el-badge>
              </el-col>
              <el-col :span="8">
                <el-link target="_blank" type="primary" href="https://github.com/hxrui">github</el-link>
              </el-col>
              <el-col :span="8">
                <el-link target="_blank" type="success" href="https://gitee.com/haoxr">码云</el-link>
              </el-col>
            </el-row>
            <el-divider/>
            <el-row :gutter="10">
              <el-col :span="8" style="font-weight: bold">
                接口文档地址
              </el-col>
              <el-col :span="8">
                <el-link target="_blank" type="primary" href="http://www.youlai.tech:9999/doc.html">线上</el-link>
              </el-col>
              <el-col :span="8">
                <el-link target="_blank" type="success" href="http://localhost:9999/doc.html">本地</el-link>
              </el-col>
            </el-row>
            <el-divider/>
            <el-row :gutter="10">
              <el-col :span="8" style="font-weight: bold">
                后端技术栈
              </el-col>
              <el-col :span="16">
                Spring Boot、Spring Cloud、Spring Cloud Alibaba、Spring Security OAuth2、JWT、Mybatis-Plus、Seata、Sentinel、ELK、Redis
              </el-col>
            </el-row>
            <el-divider/>
            <el-row :gutter="10">
              <el-col :span="8" style="font-weight: bold">
                前端技术栈
              </el-col>
              <el-col :span="16">
                vue、element-ui、uni-app、vue-element-admin
              </el-col>
            </el-row>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12" :xs="24">
        <el-card class="technology-stack" style="height: 420px;">
          <div slot="header" class="clearfix">
            <span>联系信息</span>
          </div>
          <div style="font-size: 14px">
            <el-tabs v-model="contactActiveName">
              <el-tab-pane label="开发人员" name="1">
                <el-row :gutter="5">
                  <el-col :span="8">
                    <el-card :body-style="{ padding: '0px' }" align="center">
                      <el-image
                        style="width: 60px; height: 60px"
                        src="https://gitee.com/haoxr/image/raw/master/hxr.jpg"
                        :preview-src-list="['https://gitee.com/haoxr/image/raw/master/hxr.jpg']">
                      </el-image>
                      <div style="padding: 6px;">
                        <span tyle="font-size: 14px">郝先瑞</span>
                        <div class="bottom clearfix" style="margin-top: 5px">
                          <el-tag  size="mini">后端</el-tag>
                          <el-tag type="success" style="margin-left: 5px" size="mini">前端</el-tag>
                          <el-tag type="danger" style="margin-left: 5px" size="mini">运维</el-tag>
                        </div>
                      </div>
                    </el-card>
                  </el-col>
                    <el-col :span="8">
                      <el-card :body-style="{ padding: '0px' }" align="center">
                        <el-image
                            style="width: 60px; height: 60px"
                            src="https://gitee.com/haoxr/image/raw/master/20210606203219.png"
                            :preview-src-list="['https://gitee.com/haoxr/image/raw/master/20210606203219.png']">
                        </el-image>
                        <div style="padding: 6px;">
                          <span>Mr.</span>
                          <div class="bottom clearfix" style="margin-top: 5px">
                            <el-tag  size="mini">后端</el-tag>
                            <el-tag type="success" style="margin-left: 5px" size="mini">前端</el-tag>
                            <el-tag type="danger" style="margin-left: 5px" size="mini">运维</el-tag>
                          </div>
                        </div>
                      </el-card>
                    </el-col>
                    <el-col :span="8">
                      <el-card :body-style="{ padding: '0px' }" align="center">
                        <el-image
                            style="width: 60px; height: 60px"
                            src="  https://gitee.com/haoxr/image/raw/master/20210606203659.png"
                            :preview-src-list="['https://gitee.com/haoxr/image/raw/master/20210606203659.png']">
                        </el-image>
                        <div style="padding: 6px;">
                          <span>???</span>
                          <div class="bottom clearfix" style="margin-top: 5px">
                            <el-tag type="warning" size="mini">??</el-tag>
                          </div>
                        </div>
                      </el-card>
                  </el-col>

                </el-row>
              </el-tab-pane>
              <el-tab-pane label="微信群" name="2">
                <el-image
                  style="width: 210px; height: 210px"
                  src="https://gitee.com/haoxr/image/raw/master/default/%E5%9B%A2%E9%98%9FLOGO_%E5%89%AF%E6%9C%AC.png"
                  :preview-src-list="['https://gitee.com/haoxr/image/raw/master/default/%E5%9B%A2%E9%98%9FLOGO_%E5%89%AF%E6%9C%AC.png']">
                </el-image>
                <el-link style="margin-top: 10px" type="danger" :underline="false">群二维码过期，请添加开发人员微信备注“有来”</el-link>
              </el-tab-pane>
              <el-tab-pane label="微信小程序体验码" name="3">
                <el-image
                  style="width: 210px; height: 210px"
                  src="https://gitee.com/haoxr/image/raw/master/default/%E5%9B%A2%E9%98%9FLOGO_%E5%89%AF%E6%9C%AC.png"
                  :preview-src-list="['https://gitee.com/haoxr/image/raw/master/default/%E5%9B%A2%E9%98%9FLOGO_%E5%89%AF%E6%9C%AC.png']">
                </el-image>
              </el-tab-pane>
            </el-tabs>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="40">
      <el-col :span="6" :xs="24">
        <el-card class="technology-stack">
          <div slot="header" class="clearfix">
            <span>更新日志</span>
          </div>
          <div style="font-size: 14px">
            <el-collapse v-model="updateLogActiveName" accordion>
              <el-collapse-item name="1">
                <template slot="title">
                  v1.0.0 - 2021.06.06
                  <el-tooltip content="版本重大更新" placement="right">
                    <i style="margin-left: 5px;color: red" class="header-icon el-icon-star-on"></i>
                  </el-tooltip>
                </template>
                <div>1. 权限重构，RESTFul URL权限和按钮权限数据归并</div>
                <div>2. 新增角色编码逻辑</div>
                <div>3. 网关新增本地公钥的方式</div>
                <div>4. 认证中心移除MySQL数据源</div>
                <div>5. OAuth2客户端官方表oauth_client_details重命名sys_oauth_client</div>
                <div>6. 自定义实现ClientDetailsService接口loadClientByClientId方法</div>
                <div>7. JWT的权限属性authorities将角色ID调整为角色编码</div>
                <div>8. 网关统一鉴权优化，设置了权限规则的请求进行拦截鉴权</div>
                <div>9. 菜单、角色管理界面针对小尺寸屏幕友好优化</div>
                <div>10. Spring Boot升级 2.4.4 <i class="el-icon-right"></i> 2.5.0</div>
                <div>11. Spring Cloud升级 2020.0.2<i class="el-icon-right"></i>2020.0.3</div>
                <div>12. Spring Cloud Alibaba升级 2020.0.RC1<i class="el-icon-right"></i>2021.1</div>
                <div>13. Nacos服务升级 2.0.0<i class="el-icon-right"></i>2.0.1</div>
                <div>14. 表字段统一调整gmt_create<i class="el-icon-right"></i>create_time，gmt_update<i
                  class="el-icon-right"></i>update-time
                </div>
                <div>15. 前端管理控制台优化</div>
                <div>16. JWT的密钥对修改，youlai.jks<i class="el-icon-right"></i>jwt.jks</div>
              </el-collapse-item>
            </el-collapse>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6" :xs="24">
        <el-card class="technology-stack">
          <div slot="header" class="clearfix">
            <span>计划事项</span>
          </div>
          <div style="font-size: 14px">
            <todo-list/>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12" :xs="24">
        <el-card class="technology-stack">
          <div slot="header" class="clearfix">
            <span>项目文档</span>
          </div>
          <div style="font-size: 14px">
            <el-tabs v-model="documentActiveName">
              <el-tab-pane label="后端文档" name="1">
                <el-link target="_blank" type="primary" href="https://www.cnblogs.com/haoxianrui/p/13581881.html">1. Spring Cloud实战 |
                  第一篇：Windows搭建Nacos服务
                </el-link>
                <el-divider/>
                <el-link target="_blank" type="primary" href="https://www.cnblogs.com/haoxianrui/p/13584204.html">2. Spring Cloud实战 |
                  第二篇：Spring Cloud整合Nacos实现注册中心
                </el-link>
                <el-divider/>
                <el-link target="_blank" type="primary" href="https://www.cnblogs.com/haoxianrui/p/13585125.html">3. Spring Cloud实战 |
                  第三篇：Spring Cloud整合Nacos实现配置中心
                </el-link>
                <el-divider/>
                <el-link target="_blank" type="primary" href="https://www.cnblogs.com/haoxianrui/p/13608650.html">4. Spring Cloud实战 |
                  第四篇：Spring Cloud整合Gateway实现API网关
                </el-link>
                <el-divider/>
                <el-link target="_blank" type="primary" href="https://www.cnblogs.com/haoxianrui/p/13615592.html">5. Spring Cloud实战 |
                  第五篇：Spring Cloud整合OpenFeign实现微服务之间的调用
                </el-link>
                <el-divider/>
                <el-badge value="热">
                  <el-link target="_blank" type="primary" href="https://www.cnblogs.com/haoxianrui/p/13719356.html">6. Spring Cloud实战 |
                    第六篇：Spring Cloud Gateway+Spring Security OAuth2+JWT实现微服务统一认证授权
                  </el-link>
                </el-badge>
                <el-divider/>
                <el-link target="_blank" type="primary" href="https://www.cnblogs.com/haoxianrui/p/13740264.html">7. Spring Cloud实战
                  |
                  最七篇：Spring Cloud Gateway+Spring Security OAuth2集成统一认证授权平台下实现注销使JWT失效方案
                </el-link>
                <el-divider/>
                <el-link target="_blank" type="primary" href="https://www.cnblogs.com/haoxianrui/p/14022632.html">8. Spring Cloud实战
                  |
                  最八篇：Spring Cloud +Spring Security OAuth2+ Vue前后端分离模式下无感知刷新实现JWT续期
                </el-link>
                <el-divider/>
                <el-link target="_blank" type="primary" href="https://www.cnblogs.com/haoxianrui/p/14028366.html">9. Spring Cloud实战
                  |
                  最九篇：Spring Security OAuth2认证服务器统一认证自定义异常处理
                </el-link>
                <el-divider/>
                <el-link target="_blank" type="primary" href="https://www.cnblogs.com/haoxianrui/p/14280184.html">10. Spring Cloud&
                  Alibaba 实战 | 第十篇 ：Spring Cloud + Nacos整合Seata 1.4.1最新版本实现微服务架构中的分布式事务，进阶之路必须要迈过的槛
                </el-link>
                <el-divider/>
                <el-link target="_blank" type="primary" href="https://www.cnblogs.com/haoxianrui/p/14396990.html">11. Spring Cloud &
                  Alibaba 实战 | 第十一篇 ：Spring Cloud Gateway网关实现对RESTful接口权限和按钮权限细粒度控制
                </el-link>
                <el-divider/>
                <el-link target="_blank" type="primary" href="https://www.cnblogs.com/haoxianrui/p/14720405.html">12. Spring Cloud &
                  Alibaba 实战 | 第十二篇： Sentinel+Nacos实现流控、熔断降级，赋能拥有降级功能的Feign新技能熔断，做到熔断降级双剑合璧
                </el-link>
              </el-tab-pane>
              <el-tab-pane label="前端文档" name="2">
                <el-link target="_blank" type="primary" href="https://www.cnblogs.com/haoxianrui/p/13624548.html">
                  1. vue-element-admin实战 | 第一篇： 移除mock接入微服务接口，搭建SpringCloud+Vue前后端分离管理平台
                </el-link>
                <el-divider/>
                <el-link target="_blank" type="primary" href="https://www.cnblogs.com/haoxianrui/p/13676619.html">
                  2. vue-element-admin实战 | 第二篇： 最小改动接入后台实现根据权限动态加载菜单
                </el-link>
              </el-tab-pane>

              <el-tab-pane label="微信小程序文档" name="3">
                <el-badge value="荐" style="margin-top: 10px">
                  <el-link target="_blank" type="primary"
                           href="https://www.cnblogs.com/haoxianrui/p/13882310.html">
                    1. vue+uni-app商城实战 | 第一篇：从0到1快速开发一个商城微信小程序，无缝接入Spring Cloud
                    OAuth2认证授权登录
                  </el-link>
                </el-badge>
              </el-tab-pane>
              <el-tab-pane label="应用部署文档" name="4" align="center">

                <svg-icon style="width: 200px;height: 200px;" icon-class="await"/>

              </el-tab-pane>
              <el-tab-pane name="5">
                <span slot="label" class="start-doc">
                  <el-badge value="必读" style="margin-top:8px;">
                    <div style="margin-top: -10px">项目启动说明</div>
                  </el-badge>
                </span>
                <el-link target="_blank" type="primary"
                         href="https://gitee.com/youlaitech/youlai-mall#1-%E5%90%8E%E5%8F%B0%E5%BE%AE%E6%9C%8D%E5%8A%A1%E5%90%AF%E5%8A%A8">1. 后端微服务启动
                </el-link>
                <el-divider/>
                <el-link target="_blank" type="primary"
                         href="https://gitee.com/youlaitech/youlai-mall#2-%E5%90%8E%E5%8F%B0%E5%89%8D%E7%AB%AF%E5%90%AF%E5%8A%A8">2. 管理前端启动
                </el-link>
                <el-divider/>
                <el-link target="_blank" type="primary"
                         href="https://gitee.com/youlaitech/youlai-mall#3-%E5%BE%AE%E4%BF%A1%E5%B0%8F%E7%A8%8B%E5%BA%8F%E5%90%AF%E5%8A%A8">3. 微信小程序启动
                </el-link>
              </el-tab-pane>
            </el-tabs>
          </div>
        </el-card>
      </el-col>
    </el-row>

  </div>
</template>

<script setup lang="ts">
import GithubCorner from '@/components/GithubCorner/index.vue'
import TodoList from './components/TodoList/index.vue'
import {computed, reactive, toRefs} from "vue";
import SvgIcon from '@/components/SvgIcon/index.vue'

import {useUserStoreHook} from "@/store/modules/user"

const roles = computed(() => useUserStoreHook().roles);
const avatar = computed(() => useUserStoreHook().avatar);
const nickname = computed(() => useUserStoreHook().nickname);


const state =reactive({
  updateLogActiveName: '1',
  contactActiveName: '1',
  documentActiveName: '1'
})

const {updateLogActiveName,contactActiveName,documentActiveName}  = toRefs(state)

</script>


<style lang="scss" scoped>

.dashboard-container {
  padding: 24px;
  background-color: rgb(240, 242, 245);
  position: relative;

  .project-brief-introduction {
    .el-divider--horizontal {
      margin: 16px 0;
    }

    .content {
      line-height: 20px;
    }

    margin-bottom: 24px;
  }

  .technology-stack {
    margin-bottom: 24px;
  }

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
      .svg-icon{
        width: 3em!important;
        height: 3em!important;
      }
    }

    .icon-message {
      color: #36a3f7;
      .svg-icon{
        width: 3em!important;
        height: 3em!important;
      }
    }

    .icon-money {
      color: #f4516c;
      .svg-icon{
        width: 3.2em!important;
        height: 3.2em!important;
      }
    }

    .icon-shopping {
      color: #34bfa3;
      .svg-icon{
        width: 3em!important;
        height: 3em!important;
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
      margin: 26px;
      margin-left: 0px;

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

}

</style>
