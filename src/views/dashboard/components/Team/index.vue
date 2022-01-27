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
              <li class="developer">
                <div class="developer__content">
                  <el-image
                      class="developer-img"
                      src="https://gitee.com/haoxr/image/raw/master/hxr.jpg"
                      :preview-src-list="['https://gitee.com/haoxr/image/raw/master/hxr.jpg']">
                  </el-image>
                  <div class="developer-info">
                    <span class="developer-info-nickname">郝先瑞</span>
                    <div class="developer-info-position">
                      <el-tag type="primary" size="mini">后端</el-tag>
                      <el-tag type="success" class="f-ml" size="mini">前端</el-tag>
                      <el-tag type="danger" class="f-ml" size="mini">运维</el-tag>
                    </div>
                  </div>
                </div>
              </li>

              <li class="developer">
                <div class="developer__content">
                  <el-image
                      class="developer-img"
                      src="https://gitee.com/haoxr/image/raw/master/hxr.jpg"
                      :preview-src-list="['https://gitee.com/haoxr/image/raw/master/hxr.jpg']">
                  </el-image>
                  <div class="developer-info">
                    <span class="developer-info-nickname">XLSS</span>
                    <div class="developer-info-position">
                      <el-tag type="primary" class="f-ml" size="mini">DevOps</el-tag>
                    </div>
                  </div>
                </div>
              </li>

              <li class="developer">
                <div class="developer__content">
                  <el-image
                      class="developer-img"
                      src="https://gitee.com/haoxr/image/raw/master/hxr.jpg"
                      :preview-src-list="['https://gitee.com/haoxr/image/raw/master/hxr.jpg']">
                  </el-image>
                  <div class="developer-info">
                    <span class="developer-info-nickname">总有刁民要害朕</span>
                    <div class="developer-info-position">
                      <el-tag size="mini">后端</el-tag>
                      <el-tag type="success" class="f-ml" size="mini">前端</el-tag>
                    </div>
                  </div>
                </div>
              </li>

            </ul>
          </div>
        </el-tab-pane>

        <el-tab-pane label="交流群「有来」" name="2">
        </el-tab-pane>

        <el-tab-pane label="加入我们" name="3">
        </el-tab-pane>

      </el-tabs>
    </el-card>

  </div>
</template>

<script setup lang="ts">
import {nextTick, onMounted, reactive, toRefs, watchEffect} from "vue";
import BScroll from "better-scroll";

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
.component-container {
  .team-card {
    font-size: 14px;

    .developers {
      width: 100%;
      overflow: hidden;

      &__content {
        display: flex;
        justify-content: flex-start;

        .developer {
          margin-left: 20px;
          align-items: center;
          list-style: none;
          width: 200px;
          height: 206px;

          &__content {
            border: 1px solid #cccccc;
            border-radius: 5px;
            box-shadow: 10px 10px 5px #CCC;
            padding: 23px;
            text-align: center;

            .developer-img {
              height: 100px;
              width: 100px;
            }

            .developer-info {
              padding: 6px;

              &-nickname {
                font-size: 14px;
              }

              &-position {
                margin-top: 5px;
              }
            }
          }
        }
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