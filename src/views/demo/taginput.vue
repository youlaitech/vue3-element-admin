<script lang="ts" setup>
import TagTextInput from "@/components/TagInput/index.vue";

//假数据
let arrName = new Array(20).fill("tag");

/**
 * renderTag 渲染 tag
 * @param {any} id $$匹配到的之间的值
 * @param {object} options 一些参数
 * @return {element} 返回一个dom节点
 * */
const renderTag = (id: any, options: any) => {
  //拼接tag名称
  let tagName = `${arrName[Number(id)]}-${id}`;
  //创建tag元素
  const ele = document.createElement("div");
  ele.classList.add("tag-demo-con");
  ele.innerHTML = `<div class="tag-wrap"><div class="tag">${tagName}</div></div>`;
  return ele;
};

// 触发增加 tag
const refTagTextarea = ref();
const addTag = (id: any) => {
  refTagTextarea.value.insertColumnTag(id);
};

/**
 * 编辑器 change 监听
 * @param {any} error 默认为 null
 * @param {string} value 返回编辑器内容
 * @param {object} obj 返回一个编辑事件描述对象
 * */
const onChange = (error: any, value: string, obj: any): void => {
  console.log("onChange", error, value, obj);
};

const onFocus = (): void => {
  console.log("onFocus");
};

const onBlur = (): void => {
  console.log("onBlur");
};
</script>
<template>
  <div class="demo-tagInput">
    <TagTextInput
      ref="refTagTextarea"
      class-name="demo"
      :default-value="`April$18$`"
      :readonly="false"
      :no-cursor="false"
      :min-height="200"
      :render-tag="renderTag"
      @on-change="onChange"
      @on-focus="onFocus"
      @on-blur="onBlur"
    />

    <div class="tag-wrap">
      <el-button v-for="item in 5" :key="item" @click="addTag(item)">
        {{ item }}</el-button
      >
    </div>
  </div>
</template>
<style lang="scss" scoped>
.demo-tagInput {
  width: 500px;
  height: auto;
  margin: 10px;
  :deep {
    .tag-demo-con {
      .tag-wrap {
        height: 25px;
        line-height: 25px;
        .tag {
          display: inline-block;
          padding: 2px 8px;
          box-sizing: border-box;
          border-radius: 16px;
          background: #d8eeff;
          color: #174c76;
          border: 1px solid #bbd6ea;
          margin: 0 4px;
        }
        // padding: 4px;
        // margin: 4px;
        // border: 1px solid #ccc;
        // border-radius: 5px;
        // line-height: 1em;
        // min-width: 25px;
      }
    }
  }
  .tag-wrap {
    margin-top: 10px;
  }
}
</style>
