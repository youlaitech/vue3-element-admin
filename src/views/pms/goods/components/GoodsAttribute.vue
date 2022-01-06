<!--
<template>
  <div class="components-container">
    <div class="components-container__main">
      <el-card class="box-card">
        <div slot="header">
          <span>商品属性</span>
          <el-button style="float: right;" type="primary" size="mini" @click="handleAttributeAdd">
            添加属性
          </el-button>
        </div>
        <el-form
          ref="attributeForm"
          :model="value"
          :rules="rules"
          size="mini"
          :inline="true"
        >
          <el-table
            :data="value.attrList"
            size="mini"
            highlight-current-row
            border
          >
            <el-table-column property="name" label="属性名称">
              <template slot-scope="scope">
                <el-form-item
                  :prop="'attrList[' + scope.$index + '].name'"
                  :rules="rules.attribute.name"
                >
                  <el-input v-model="scope.row.name"/>
                </el-form-item>
              </template>
            </el-table-column>

            <el-table-column property="value" label="属性值">
              <template slot-scope="scope">
                <el-form-item
                  :prop="'attrList[' + scope.$index + '].value'"
                  :rules="rules.attribute.value"
                >
                  <el-input v-model="scope.row.value"/>
                </el-form-item>
              </template>
            </el-table-column>

            <el-table-column label="操作" width="150">
              <template slot-scope="scope">
                <el-form-item>
                  <el-button type="danger" icon="el-icon-minus" circle @click="handleAttributeRemove(scope.$index)"/>
                </el-form-item>
              </template>
            </el-table-column>
          </el-table>
        </el-form>
      </el-card>

    </div>
    <div class="components-container__footer">
      <el-button @click="handlePrev">上一步，填写商品信息</el-button>
      <el-button type="primary" @click="handleNext">下一步，设置商品库存</el-button>
    </div>
  </div>
</template>

<script>
import {listAttribute} from "@/api/pms/attribute";

export default {
  name: "GoodsAttribute",
  props: {
    value: Object
  },
  watch:{
    // 监听选择的商品分类关联商品属性
    'value.categoryId':{
        handler(newVal,oldVal){
          listAttribute({categoryId: newVal, type: 2}).then(res => {
            this.value.attrList = res.data
          })
        }
    }
  },
  data() {
    return {
      rules: {
        attribute: {
          name: [{required: true, message: '请填写属性名称', trigger: 'blur'}],
          value: [{required: true, message: '请填写属性值', trigger: 'blur'}]
        }
      },
    }
  },
  methods: {
    handleAttributeAdd: function () {
      this.value.attrList.push({})
    },
    handleAttributeRemove: function (index) {
      this.value.attrList.splice(index, 1)
    },
    handlePrev: function () {
      this.$emit('prev')
    },
    handleNext: function () {
      this.$refs["attributeForm"].validate((valid) => {
        if (valid) {
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
    margin: 20px auto
  }

  &__footer {
    position: fixed;
    bottom: 20px;
    right: 20px;
  }
}
.el-form-item&#45;&#45;mini.el-form-item{
  margin-top: 18px;
}
</style>
-->
