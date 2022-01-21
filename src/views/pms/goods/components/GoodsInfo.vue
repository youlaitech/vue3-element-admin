<template>
  <div class="components-container">
    <div class="components-container__main">
      <el-form
          ref="dataForm"
          :rules="rules"
          :model="modelValue"
          label-width="120px"
      >
        <el-form-item label="商品名称" prop="name">
          <el-input style="width: 400px" v-model="modelValue.name"/>
        </el-form-item>

        <el-form-item label="原价" prop="originPrice">
          <el-input style="width: 400px" v-model="modelValue.originPrice"/>
        </el-form-item>

        <el-form-item label="现价" prop="price">
          <el-input style="width: 400px" v-model="modelValue.price"/>
        </el-form-item>

        <el-form-item label="商品品牌" prop="brandId">
          <el-select
              v-model="modelValue.brandId"
              style="width:400px"
              clearable
          >
            <el-option
                v-for="item in brandOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="商品简介">
          <el-input
              type="textarea"
              v-model="modelValue.description"
              style="width: 400px"
          />
        </el-form-item>

        <el-form-item label="商品相册">

          <el-card   v-for="(item,index) in pictures" style="width: 170px;display: inline-block;margin-left: 10px" :body-style="{ padding: '10px' }">

            <single-upload v-model="item.url"/>

            <div class="bottom" v-if="item.url">
              <el-button type="text" class="button" v-if="item.main==true" style="color:#ff4d51">商品主图</el-button>
              <el-button type="text" class="button" v-else @click="changeMainPicture(index)">设为主图</el-button>
              <el-button type="text" class="button" @click="removePicture(index)">删除图片</el-button>
            </div>

            <div class="bottom" v-else>
              <!-- 占位 -->
              <el-button type="text"/>
            </div>
          </el-card>
        </el-form-item>

        <el-form-item label="商品详情" prop="detail">
          <editor v-model="modelValue.detail" ></editor>
        </el-form-item>

      </el-form>
    </div>
    <div class="components-container__footer">
      <el-button @click="handlePrev">上一步，选择商品分类</el-button>
      <el-button type="primary" @click="handleNext">下一步，设置商品属性</el-button>
    </div>
  </div>
</template>
<script setup lang="ts">
import {listBrands} from "@/api/pms/brand"
import SingleUpload from '@/components/Upload/SingleUpload.vue'
import {onMounted, reactive, ref, toRefs, unref} from "vue"
import {ElForm} from "element-plus"
import Editor from '@/components/WangEditor/index.vue'

const emit = defineEmits(['prev', 'next'])
const dataForm = ref(ElForm)

const props = defineProps({
  modelValue: {
    type: Object,
    default: {}
  }
})

const state = reactive({
  brandOptions: [] as Array<any>,
  // 商品图册
  pictures: [] as Array<any>,
  rules: {
    name: [{required: true, message: '请填写商品名称', trigger: 'blur'}],
    originPrice: [{required: true, message: '请填写原价', trigger: 'blur'}],
    price: [{required: true, message: '请填写现价', trigger: 'blur'}],
    brandId: [{required: true, message: '请选择商品品牌', trigger: 'blur'}],
  }
})

const {brandOptions, pictures, rules} = toRefs(state)

function loadData() {
  listBrands({}).then(response => {
    state.brandOptions = response.data
  })
  const goodsId = props.modelValue.id
  if (goodsId) {
    const mainPicUrl = props.modelValue.picUrl
    if (mainPicUrl) {
      state.pictures.filter(item => item.main)[0].url = mainPicUrl
    }
    const subPicUrls = props.modelValue.subPicUrls
    if (subPicUrls && subPicUrls.length > 0) {
      for (let i = 1; i <= subPicUrls.length; i++) {
        state.pictures[i].url = subPicUrls[i - 1]
      }
    }
  }
}

function resetForm() {
  state.pictures = [
    {url: undefined, main: true},
    {url: undefined, main: false},
    {url: undefined, main: false},
    {url: undefined, main: false},
    {url: undefined, main: false},
  ]
}

/**
 * 切换主图
 */
function changeMainPicture(changeIndex: number) {
  const currMainPicture = JSON.parse(JSON.stringify(state.pictures[0]))
  const nextMainPicture = JSON.parse(JSON.stringify(state.pictures[changeIndex]))

  state.pictures[0].url = nextMainPicture.url
  state.pictures[changeIndex].url = currMainPicture.url
}

function removePicture(index: number) {
  state.pictures[index].url = undefined
}

function handlePrev() {
  emit('prev')
}

function handleNext() {
  const form = unref(dataForm)
  form.validate((valid: any) => {
    if (valid) {
      // 商品图片
      const mainPicUrl = state.pictures.filter(item => item.main == true && item.url).map(item => item.url)
      if (mainPicUrl && mainPicUrl.length > 0) {
        props.modelValue.picUrl = mainPicUrl[0]
      }
      const subPicUrl = state.pictures.filter(item => item.main == false && item.url).map(item => item.url)
      if (subPicUrl && subPicUrl.length > 0) {
        props.modelValue.subPicUrls = subPicUrl
      }
      emit('next')
    }
  })
}

onMounted(() => {
  loadData()
  resetForm()
})
</script>

<style lang="scss" scoped>

.components-container {
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
