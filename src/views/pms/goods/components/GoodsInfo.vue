<!--
<template>
  <div class="components-container">
    <div class="components-container__main">
      <el-form
        ref="goodsForm"
        :rules="rules"
        :model="value"
        label-width="150px">
        <el-form-item label="商品名称" prop="name">
          <el-input style="width: 400px" v-model="value.name"/>
        </el-form-item>

        <el-form-item label="原价" prop="originPrice">
          <el-input style="width: 400px" v-model="value.originPrice"/>
        </el-form-item>

        <el-form-item label="现价" prop="price">
          <el-input style="width: 400px" v-model="value.price"/>
        </el-form-item>

        <el-form-item label="商品品牌" prop="brandId">
          <el-select
            v-model="value.brandId"
            clearable
            style="width:400px">
            <el-option v-for="item in brandOptions" :key="item.id" :label="item.name" :value="item.id"/>
          </el-select>
        </el-form-item>

        <el-form-item label="商品简介">
          <el-input type="textarea" style="width: 400px" v-model="value.description"/>
        </el-form-item>

        <el-form-item label="商品相册">
          <el-row :gutter="10">
            <el-col style="width: 180px" v-for="(item,index) in pictures">
              <el-card :body-style="{ padding: '10px' }">
                <single-upload v-model="item.url"></single-upload>
                <div class="bottom" v-if="item.url">
                  <el-button type="text" class="button" v-if="item.main==true" style="color:#ff4d51">商品主图</el-button>
                  <el-button type="text" class="button" v-else @click="setMainPicture(index)">设为主图</el-button>
                  <el-button type="text" class="button" @click="handlePictureRemove(index)">删除图片</el-button>
                </div>
                <div class="bottom" v-else>
                  <el-button type="text" class="button"></el-button>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </el-form-item>

        <el-form-item label="商品详情" prop="detail">
          <tinymce v-model="value.detail" :height="400"/>
        </el-form-item>

      </el-form>
    </div>
    <div class="components-container__footer">
      <el-button @click="handlePrev">上一步，选择商品分类</el-button>
      <el-button type="primary" @click="handleNext">下一步，设置商品属性</el-button>
    </div>
  </div>
</template>
<script>

import {list as listBrand} from "@/api/pms/brand"
import SingleUpload from '@/components/Upload/SingleUpload'
import Tinymce from '@/components/Tinymce'

export default {
  name: "GoodsInfo",
  components: {SingleUpload, Tinymce},
  props: {
    value: Object
  },
  data() {
    return {
      brandOptions: [],
      pictures: [],
      rules: {
        name: [{required: true, message: '请填写商品名称', trigger: 'blur'}],
        originPrice: [{required: true, message: '请填写原价', trigger: 'blur'}],
        price: [{required: true, message: '请填写现价', trigger: 'blur'}],
        brandId: [{required: true, message: '请选择商品品牌', trigger: 'blur'}],
      }
    }
  },
  created() {
    this.loadData()
  },
  methods: {
    async loadData() {
      this.handleFormReset()

      await listBrand().then(response => {
        this.brandOptions = response.data
      })

      const goodsId = this.value.id
      if (goodsId) {

        const mainPicUrl = this.value.picUrl
        if (mainPicUrl) {
          this.pictures.filter(item => item.main == true)[0].url = mainPicUrl
        }

        const subPicUrls = this.value.subPicUrls
        if (subPicUrls && subPicUrls.length > 0) {
          for (let i = 1; i <= subPicUrls.length; i++) {
            this.pictures[i].url = subPicUrls[i - 1]
          }
        }
      }
    },
    // 设置主图
    setMainPicture(changeIndex) {
      const mainPicture = JSON.parse(JSON.stringify( this.pictures[0]))
      const changePicture =  JSON.parse(JSON.stringify( this.pictures[changeIndex]))

      console.log(changeIndex,changePicture.url,mainPicture.url)

      this.pictures[0].url = changePicture.url
      this.pictures[changeIndex].url = mainPicture.url

    },
    handlePictureRemove(index) {
      this.pictures[index].url = undefined
    },
    handleFormReset: function () {
      this.pictures = [
        {url: undefined, main: true},
        {url: undefined, main: false},
        {url: undefined, main: false},
        {url: undefined, main: false},
        {url: undefined, main: false},
      ]
    },
    handlePrev: function () {
      this.$emit('prev')
    },
    handleNext: function () {
      this.$refs["goodsForm"].validate((valid) => {
        if (valid) {
          // 商品图片处理
          const tempMainPicUrl = this.pictures.filter(item => item.main == true && item.url).map(item => item.url)
          if (tempMainPicUrl && tempMainPicUrl.length > 0) {
            this.value.picUrl = tempMainPicUrl[0]
          }
          const tempSubPicUrl = this.pictures.filter(item => item.main == false && item.url).map(item => item.url)
          if (tempSubPicUrl && tempSubPicUrl.length > 0) {
            this.value.subPicUrls = tempSubPicUrl
          }
          this.$emit('next')
        }
      })
    }
  }
}
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
-->
