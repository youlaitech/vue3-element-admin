<template>
  <div class="component-container">
    <div class="component-container__main">
      <el-form
        ref="dataFormRef"
        :rules="rules"
        :model="goodsInfo"
        label-width="120px"
      >
        <el-form-item label="商品品牌" prop="brandId">
          <el-select v-model="goodsInfo.brandId" style="width: 400px" clearable>
            <el-option
              v-for="item in brandOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="商品名称" prop="name">
          <el-input style="width: 400px" v-model="goodsInfo.name" />
        </el-form-item>

        <el-form-item label="原价" prop="originPrice">
          <el-input style="width: 400px" v-model="goodsInfo.originPrice" />
        </el-form-item>

        <el-form-item label="现价" prop="price">
          <el-input style="width: 400px" v-model="goodsInfo.price" />
        </el-form-item>

        <el-form-item label="商品简介">
          <el-input
            type="textarea"
            :autosize="{ minRows: 3, maxRows: 6 }"
            v-model="goodsInfo.description"
          />
        </el-form-item>

        <el-form-item label="商品相册">
          <el-card
            v-for="(item, index) in pictures"
            :key="index"
            style="
              width: 170px;
              display: inline-block;
              margin-left: 10px;
              text-align: center;
            "
            :body-style="{ padding: '10px' }"
          >
            <single-upload v-model="item.url" :show-close="true" />

            <div v-if="item.url">
              <el-link type="danger" class="button" v-if="item.main == true"
                >商品主图</el-link
              >
              <el-link
                type="info"
                class="button"
                v-else
                @click="changeMainPicture(index)"
                >设为主图</el-link
              >
            </div>

            <div v-else>
              <!-- 占位 -->
              <el-link type="info" />
            </div>
          </el-card>
        </el-form-item>

        <el-form-item label="商品详情" prop="detail">
          <editor v-model="goodsInfo.detail" style="height: 600px" />
        </el-form-item>
      </el-form>
    </div>
    <div class="component-container__footer">
      <el-button @click="handlePrev">上一步，选择商品分类</el-button>
      <el-button type="primary" @click="handleNext"
        >下一步，设置商品属性</el-button
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, toRefs } from 'vue';
import { ElForm } from 'element-plus';

// API 依赖
import { listBrands } from '@/api/pms/brand';

// 自定义组件依赖
import Editor from '@/components/WangEditor/index.vue';
import SingleUpload from '@/components/Upload/SingleUpload.vue';

const emit = defineEmits(['prev', 'next', 'update:modelValue']);
const dataFormRef = ref(ElForm);

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => {},
  },
});

const goodsInfo: any = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:modelValue', value);
  },
});

const state = reactive({
  brandOptions: [] as Array<any>,
  // 商品图册
  pictures: [
    { url: undefined, main: true }, // main为true代表主图，可切换
    { url: undefined, main: false },
    { url: undefined, main: false },
    { url: undefined, main: false },
    { url: undefined, main: false },
  ] as Array<any>,
  rules: {
    name: [{ required: true, message: '请填写商品名称', trigger: 'blur' }],
    originPrice: [{ required: true, message: '请填写原价', trigger: 'blur' }],
    price: [{ required: true, message: '请填写现价', trigger: 'blur' }],
    brandId: [{ required: true, message: '请选择商品品牌', trigger: 'blur' }],
  },
});

const { brandOptions, pictures, rules } = toRefs(state);

function loadData() {
  listBrands().then(({ data }) => {
    state.brandOptions = data;
  });
  const goodsId = goodsInfo.value.id;
  if (goodsId) {
    // 主图
    const mainPicUrl = goodsInfo.value.picUrl;
    if (mainPicUrl) {
      state.pictures.filter((item) => item.main)[0].url = mainPicUrl;
    }
    // 商品副图
    const subPicUrls = goodsInfo.value.subPicUrls;
    if (subPicUrls && subPicUrls.length > 0) {
      for (let i = 1; i <= subPicUrls.length; i++) {
        state.pictures[i].url = subPicUrls[i - 1];
      }
    }
  }
}

/**
 * 切换主图
 */
function changeMainPicture(changeIndex: number) {
  const currMainPicture = JSON.parse(JSON.stringify(state.pictures[0]));
  const nextMainPicture = JSON.parse(
    JSON.stringify(state.pictures[changeIndex])
  );

  state.pictures[0].url = nextMainPicture.url;
  state.pictures[changeIndex].url = currMainPicture.url;
}

function handlePrev() {
  emit('prev');
}

function handleNext() {
  dataFormRef.value.validate((valid: any) => {
    if (valid) {
      // 商品主图
      const mainPicUrl = state.pictures
        .filter((item) => item.main == true && item.url)
        .map((item) => item.url);
      if (mainPicUrl && mainPicUrl.length > 0) {
        goodsInfo.value.picUrl = mainPicUrl[0];
      }
      // 商品副图
      const subPicUrls = state.pictures
        .filter((item) => item.main == false && item.url)
        .map((item) => item.url);
      if (subPicUrls && subPicUrls.length > 0) {
        goodsInfo.value.subPicUrls = subPicUrls;
      } else {
        goodsInfo.value.subPicUrls = [];
      }
      emit('next');
    }
  });
}

onMounted(() => {
  loadData();
});
</script>

<style lang="scss" scoped>
.component-container {
  &__main {
    margin: 20px auto;

    .button {
      margin-left: 10px;
    }
  }

  &__footer {
    position: fixed;
    bottom: 20px;
    right: 20px;
  }
}
</style>
