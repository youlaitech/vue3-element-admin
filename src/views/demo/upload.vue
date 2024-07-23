<!-- 文件上传组件(单图+多图)示例 -->
<script setup lang="ts">
import ImageUpload from "@/components/Upload/ImageUpload.vue";
const size = ref("");
// 这里放外链图片，防止被删
const picUrls = ref([
  "https://s2.loli.net/2023/05/24/yNsxFC8rLHMZQcK.jpg",
  "https://s2.loli.net/2023/05/24/RuHFMwW4rG5lIqs.jpg",
  "https://s2.loli.net/2023/05/24/ZPiGbcpR91WqInB.jpg",
  "https://s2.loli.net/2023/05/24/e1bcnEq3MFdmlNL.jpg",
  "https://s2.loli.net/2023/05/24/wZTSPj1yDQNcuhU.jpg",
]);
const tableData = [
  {
    argsName: "v-model",
    type: "Arrays",
    default: "[]",
    desc: "已经上传的图片数组",
  },
  {
    argsName: "limit",
    type: "Number",
    default: 10,
    desc: "上传最大的图片数量",
  },
  {
    argsName: "showDelBtn",
    type: "Boolean",
    default: true,
    desc: "是否显示删除按钮",
  },
  {
    argsName: "showUploadBtn",
    type: "Boolean",
    default: true,
    desc: "是否显示上传按钮",
  },
  {
    argsName: "accept",
    type: "String",
    default: "image/*",
    desc: "上传文件类型",
  },
  {
    argsName: "uploadMaxSize",
    type: "Number",
    default: "2 * 1024 * 1024",
    desc: "单个图片上传大小限制(单位byte)",
  },
];
</script>
<template>
  <div class="app-container">
    <el-link
      href="https://gitee.com/youlaiorg/vue3-element-admin/blob/master/src/views/demo/upload.vue"
      type="primary"
      target="_blank"
      class="mb-10"
    >
      示例源码 请点击>>>>
    </el-link>

    <el-form>
      <el-form-item label="图片上传">
        <image-upload v-model="picUrls" />
      </el-form-item>
    </el-form>
    <el-form>
      <el-form-item label="参数说明">
        <el-table :data="tableData" border>
          <el-table-column prop="argsName" label="参数名称" width="300" />
          <el-table-column prop="type" label="参数类型" width="200" />
          <el-table-column prop="default" label="默认值" width="200" />
          <el-table-column prop="desc" label="描述" width="300" />
        </el-table>
      </el-form-item>
    </el-form>
  </div>
</template>
