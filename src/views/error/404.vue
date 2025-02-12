<template>
  <div class="page-container">
    <div class="pic-404">
      <img class="pic-404__parent" src="@/assets/images/404.svg" alt="404" />
    </div>
    <div class="bullshit">
      <div class="bullshit__oops">OOPS！</div>
      <div class="bullshit__info">
        该页面无法访问。
        <a style="color: #20a0ff" href="https://www.youlai.tech.com" target="_blank">
          有来开源官网
        </a>
      </div>
      <div class="bullshit__headline">抱歉，您访问的页面不存在。</div>
      <div class="bullshit__info">请确认您输入的网址是否正确，或者点击下方按钮返回首页。</div>
      <a href="#" class="bullshit__return-home" @click.prevent="back">返回首页</a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";

defineOptions({
  name: "Page404",
});

const router = useRouter();

function back() {
  router.back();
}
</script>

<style lang="scss" scoped>
.page-container {
  display: flex;
  padding: 100px;

  .pic-404 {
    width: 600px;
    overflow: hidden;

    &__parent {
      width: 100%;
    }
  }

  .bullshit {
    width: 300px;
    padding: 50px 0;
    overflow: hidden;

    &__oops {
      margin-bottom: 20px;
      font-size: 32px;
      font-weight: bold;
      line-height: 40px;
      color: #1482f0;
      opacity: 0;
      animation-name: slideUp;
      animation-duration: 0.5s;
      animation-fill-mode: forwards;
    }

    &__headline {
      margin-bottom: 10px;
      font-size: 20px;
      font-weight: bold;
      line-height: 24px;
      color: #222;
      opacity: 0;
      animation-name: slideUp;
      animation-duration: 0.5s;
      animation-delay: 0.1s;
      animation-fill-mode: forwards;
    }

    &__info {
      margin-bottom: 30px;
      font-size: 13px;
      line-height: 21px;
      color: grey;
      opacity: 0;
      animation-name: slideUp;
      animation-duration: 0.5s;
      animation-delay: 0.2s;
      animation-fill-mode: forwards;
    }

    &__return-home {
      float: left;
      display: block;
      width: 110px;
      height: 36px;
      font-size: 14px;
      line-height: 36px;
      color: #fff;
      text-align: center;
      cursor: pointer;
      background: #1482f0;
      border-radius: 100px;
      opacity: 0;
      animation-name: slideUp;
      animation-duration: 0.5s;
      animation-delay: 0.3s;
      animation-fill-mode: forwards;
    }

    @keyframes slideUp {
      0% {
        opacity: 0;
        transform: translateY(60px);
      }

      100% {
        opacity: 1;
        transform: translateY(0);
      }
    }
  }
}
</style>
