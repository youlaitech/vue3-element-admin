<!-- 团队介绍 -->
<template>
  <div class="component-container">
    <el-card class="team-card">
      <template #header>
        <span class="fw-b">有来开源组织 & 技术团队 </span>
      </template>
      <el-tabs v-model="teamActiveName">
        <el-tab-pane label="开发者「无回」" name="developer">
          <div class="developers">
            <ul class="developers__content">
              <li class="developer" v-for="(item,index) in developers">
                <div class="developer__content">
                  <el-image
                      class="developer-img"
                      :src="item.imgUrl"
                      :preview-src-list="[item.imgUrl]"
                  >
                  </el-image>
                  <div class="developer-info">
                    <span class="developer-info-nickname">{{ item.nickname }}</span>
                    <div class="developer-info-position">
                      <el-tag v-for="(position,i) in item.positions"
                              :type="colors[i%colors.length]"
                              :class="i!==0?'f-ml':''"
                              size="mini">
                        {{ position }}
                      </el-tag>
                    </div>
                    <div class="developer-info-homepage">
                      <a :href="item.homepage" target="_blank">
                        个人主页
                      </a>
                    </div>
                  </div>
                </div>
              </li>

              <li class="pointer">
                <el-image class="pointer-img" src="https://gitee.com/haoxr/image/raw/master/default/left.png"/>
                <div class="pointer-tip">
                  欢迎添加开发者微信🤗🤗
                </div>
              </li>
            </ul>
          </div>
        </el-tab-pane>

        <el-tab-pane label="交流群「有来」" name="2">
          <div class="group">
            <el-image
                class="group-img"
                      src="https://gitee.com/haoxr/image/raw/master/default/20220129090754.png"
                :preview-src-list="['https://gitee.com/haoxr/image/raw/master/default/20220129090754.png']"
            />
            <div class="group-tip">
              群二维码过期可添加开发者微信由其拉入群，备注「有来」即可。
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="加入我们" name="3">
          <div class="join">
            <p>1. 人品良好、善于思考、执行力强；</p>
            <p>2. 熟悉项目，且至少给项目提交(过)一个PR； </p>
            <p>3. Git代码库活跃，个人主页或博客完善者优先；</p>
            <p>4. 过分优秀者我们会主动联系您...</p>
            <div class="join-tip">
              申请加入方式: 添加开发者微信申请即可。
            </div>
          </div>
        </el-tab-pane>

      </el-tabs>
    </el-card>

  </div>
</template>

<script setup lang="ts">
import {nextTick, onMounted, reactive, toRefs, watchEffect} from "vue";
import BScroll from "better-scroll";

const state = reactive({
  teamActiveName: 'developer',
  developers: [
    {
      imgUrl: 'https://gitee.com/haoxr/image/raw/master/hxr.jpg',
      nickname: '郝先瑞',
      positions: ['后端', '前端', '打杂'],
      homepage: 'https://www.cnblogs.com/haoxianrui/'
    },
    {
      imgUrl: 'https://gitee.com/haoxr/image/raw/master/default/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20220128222910_gaitubao_841x841.jpg',
      nickname: '张加林',
      positions: ['DevOps'],
      homepage: 'https://gitee.com/ximy'
    },
    {
      imgUrl: 'https://gitee.com/haoxr/image/raw/master/default/ba695a5e70410a066b7052c5dc9db5c.jpg',
      nickname: '张川',
      positions: ['后端', '前端'],
      homepage: 'https://blog.csdn.net/qq_41595149'
    },
  ],
  colors: ['', 'success', 'warning', 'danger']
})

const {teamActiveName, developers, colors} = toRefs(state)

/*let bScroll = reactive({})

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
})*/
</script>

<style lang="scss" scoped>
.component-container {
  .team-card {
    font-size: 14px;
    
    .el-tabs__content{
      .el-tab-pane{
        height: 252px;
      }
    }

    .developers {
      width: 100%;

      &__content {
        display: flex;
        justify-content: flex-start;

        .pointer {
          list-style: none;
          width: 160px;
          min-width: 160px;
          align-items: center;
          margin-left: 20px;
          &-img{
            background: #FFFFFF;
            position: absolute;
            right: 0;
            width: 160px;
            height: 220px;
          }
          &-tip {
            font-weight: bold;
            position: absolute;
            min-width: 160px;
            top: 18px;
            right: 0;
            color: #5959d0;
          }
        }

        .developer {
          &:not(:first-child) {
            margin-left: 20px;
          }

          align-items: center;
          list-style: none;
          width: 180px;
          min-width: 180px;

          &__content {
            border: 1px solid #cccccc;
            border-radius: 5px;
            box-shadow: 6px 6px 6px #AAA;
            padding: 8px;
            text-align: center;

            .developer-img {
              height: 100px;
              width: 100px;
            }

            .developer-info {
              padding: 6px;
              font-size: 14px;

              &-position {
                margin-top: 10px;
              }

              &-homepage {
                margin-top: 16px;

                a {
                  display: inline-block;
                  padding: 4px 10px;
                  color: #409EFF;
                  border: 1px solid #409EFF;
                  border-radius: 5px;
                  background: #ecf5ff;

                  &:hover {
                    background: #409EFF;
                    color: #FFFFFF;
                  }
                }
              }
            }
          }
        }
      }
    }

    .join{
      height: 240px;
      p{
        font-weight: bold;
      }
      &-tip{
        margin-top: 20px;
        color: #409EFF;
        font-weight: bold;
      }
    }

    .group{
      height: 254px;
      &-img{
        height: 200px;
        width: 200px;
      }
    }
  }

  .fw-b {
    font-weight: bold;
  }

  .f-ml {
    margin-left: 5px;
  }


}

</style>