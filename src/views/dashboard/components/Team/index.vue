
<script setup lang="ts">
import { nextTick, onMounted, reactive, ref, toRefs, watchEffect } from 'vue';
import BScroll from 'better-scroll';

const state = reactive({
  teamActiveName: '1',
  developers: [
    {
      imgUrl: 'https://s2.loli.net/2022/04/06/yRx8uzj4emA5QVr.jpg',
      nickname: '郝先瑞',
      positions: ['后端', '前端', '文档'],
      homepage: 'https://www.cnblogs.com/haoxianrui/'
    },
    {
      imgUrl: 'https://s2.loli.net/2022/04/06/cQihGv9uPsTjXk1.jpg',
      nickname: '张川',
      positions: ['后端', '前端'],
      homepage: 'https://blog.csdn.net/qq_41595149'
    },
    {
      imgUrl: 'https://s2.loli.net/2022/04/07/2IiOYBHnRGKgCSd.jpg',
      nickname: '张加林',
      positions: ['DevOps'],
      homepage: 'https://gitee.com/ximy'
    }
  ],
  colors: ['', 'success', 'warning', 'danger'],
  indicatorImgUrl: new URL(
    `../../../../assets/index/indicator.png`,
    import.meta.url
  ).href
});

const { teamActiveName, developers, colors, indicatorImgUrl } = toRefs(state);

let bScroll = reactive({});

const developer_container = ref<HTMLElement | any>(null);

onMounted(() => {
  bScroll = new BScroll(developer_container.value, {
    mouseWheel: true, //开启鼠标滚轮
    disableMouse: false, //启用鼠标拖动
    scrollX: true //X轴滚动启用
  });
});

watchEffect(() => {
  nextTick(() => {
    bScroll && (bScroll as any).refresh();
  });
});
</script>


<template>
    <el-card class="team-card">
      <template #header>
        <span class="fw-b">有来开源组织 & 技术团队</span>
      </template>
      <el-tabs v-model="teamActiveName">
        <el-tab-pane label="开发者" name="1">
          <div class="developer-container" ref="developer_container">
            <ul class="developer-list">
              <li
                class="developer-item"
                v-for="(item, index) in developers"
                :key="index"
              >
                <div class="developer-item-wrapper">
                  <el-image
                    class="developer-img"
                    :src="item.imgUrl"
                    :preview-src-list="[item.imgUrl]"
                  ></el-image>
                  <div class="developer-info">
                    <span class="developer-info-nickname">{{ item.nickname }}</span>
                    <div class="developer-info-position">
                      <el-tag
                        v-for="(position, i) in item.positions"
                        :type="(colors[i % colors.length] as any)"
                        :class="i !== 0 ? 'f-ml' : ''"
                        size="small"
                        :key="i"
                        >{{ position }}</el-tag
                      >
                    </div>
                    <div class="developer-info-homepage">
                      <a :href="item.homepage" target="_blank">个人主页</a>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
            <el-image class="developer-indicator" :src="indicatorImgUrl" />
          </div>
        </el-tab-pane>

        <el-tab-pane label="交流群" name="2">
          <div class="group">
            <el-image
              class="group-img"
              src="https://www.youlai.tech/files/blog/youlaiqun.png"
              :preview-src-list="[
                'https://www.youlai.tech/files/blog/youlaiqun.png'
              ]"
            />
            <div class="group-tip">
              群二维码过期可添加开发者微信由其拉入群，备注「有来」即可。
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="加入我们" name="3">
          <div class="join">
            <p>1. 人品良好、善于思考、执行力强；</p>
            <p>2. 熟悉项目，且至少给项目提交(过)一个PR；</p>
            <p>3. Git代码库活跃，个人主页或博客完善者优先；</p>
            <p>4. 过分优秀者我们会主动联系您...</p>
            <div class="join-way">申请加入方式: 添加开发者微信申请即可。</div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
</template>


<style lang="scss" scoped>
  .team-card {
    font-size: 14px;

    .el-tabs__content {
      .el-tab-pane {
        height: 265px;
      }
    }

    .developer-container {
      width: 100%;
      overflow: hidden;

      .developer-list {
        display: inline-flex;
        overflow: hidden;
        justify-content: flex-start;
        padding: 10px;

        .developer-item {
          &:not(:first-child) {
            margin-left: 20px;
          }

          align-items: center;
          list-style: none;
          width: 180px;
          min-width: 180px;

          .developer-item-wrapper {
            border: 1px solid var(--el-border-color-light);
            border-radius: 5px;
            box-shadow: var(--el-box-shadow-lighter);
            padding: 8px;
            text-align: center;

            .developer-img {
              height: 100px;
              width: 100px;
            }

            .developer-info {
              padding: 6px;
              font-size: 14px;

              .developer-info-position {
                margin-top: 10px;
              }

              .developer-info-homepage {
                margin-top: 16px;

                a {
                  display: inline-block;
                  padding: 4px 10px;
                  color: var(--el-color-primary);
                  border: 1px solid var(--el-color-primary);
                  border-radius: 5px;
                  background: var(--el-color-primary-light-9);
                  &:hover {
                    background: var(--el-color-primary);
                    color: var(--el-color-white);
                  }
                }
              }
            }
          }
        }
      }

      .developer-indicator {
        position: absolute;
        right: 0;
        bottom: 0;
        width: 120px;
        height: 100px;
      }
    }

    .join {
      overflow: hidden;
      p {
        font-weight: bold;
      }

      &-way {
        margin-top: 20px;
        color: #409eff;
        font-weight: bold;
      }
    }

    .group {
      &-img {
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
</style>
