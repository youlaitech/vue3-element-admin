<!--
<template>
  <div class="components-container">
    <div class="components-container__main">
      <el-card class="box-card">
        <div slot="header">
          <span>商品规格</span>
          <el-button style="float: right;" type="primary" size="mini" @click="handleSpecAdd">
            添加规格项
          </el-button>
        </div>
        <el-form
          size="mini"
          ref="specForm"
          :model="specForm"
          :inline="true">
          <el-table
            ref="specTable"
            :data="specForm.specList"
            row-key="id"
            size="mini"
          >
            <el-table-column align="center" width="50">
              <template>
                <svg-icon class="drag-handler" icon-class="drag"/>
              </template>
            </el-table-column>
            <el-table-column label="规格名" width="200">
              <template slot-scope="scope">
                <el-form-item
                  :prop="'specList[' + scope.$index + '].name'"
                  :rules="rules.specification.name"
                >
                  <el-input
                    type="text"
                    v-model="scope.row.name"
                    size="mini"
                    @input="changeSpec()"
                  />
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column>
              <template slot="header">
                规格值
                <el-link type="danger" style="font-size:12px" :underline="false">（默认第一条规格包含图片）</el-link>
              </template>
              <template slot-scope="{row}">
                <div style="margin-right:15px;display: inline-block" v-for="item in row.values">
                  <el-tag
                    closable
                    :type="colors[row.index%colors.length]"
                    @close="handleSpecValueRemove(row.index,item.id)">
                    {{ item.value }}
                  </el-tag>
                  <mini-card-upload v-if="row.index==0" style="margin-top: 5px" v-model="item.picUrl"/>
                </div>
                <el-input
                  style="width: 80px;vertical-align: top"
                  size="mini"
                  v-if="tagInputs[row.index].visible"
                  v-model="tagInputs[row.index].value"
                  @keyup.enter.native="handleSpecValueInput(row.index)"
                  @blur="handleSpecValueInput(row.index)"/>
                <el-button v-else size="mini" icon="el-icon-plus" style="vertical-align: top"
                           @click="handleSpecValueAdd(row.index)">添加规格值
                </el-button>
              </template>
            </el-table-column>

            <el-table-column width="60" label="操作">
              <template slot-scope="scope">
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  circle
                  plain
                  @click.stop="handleSpecRemove(scope.$index)"/>
              </template>
            </el-table-column>
          </el-table>
        </el-form>
      </el-card>
      <el-card class="box-card">
        <div slot="header">
          <span>商品库存</span>
        </div>
        <el-form
          :model="skuForm"
          size="mini"
          ref="skuForm"
          :inline="true"
        >
          <el-table
            :data="skuForm.skuList"
            :span-method="handleCellMerge"
            size="mini"
            fit highlight-current-row border
          >
            <el-table-column
              v-for="(title,index) in specTitleList"
              align="center"
              :prop="'specValue'+(index+1)"
              :label="title">
            </el-table-column>
            <el-table-column
              label="商品编码"
              align="center"
            >
              <template slot-scope="scope">
                <el-form-item :prop="'skuList['+scope.$index+'].sn'" :rules="rules.sku.sn">
                  <el-input v-model="scope.row.sn"/>
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column label="价格" align="center">
              <template slot-scope="scope">
                <el-form-item :prop="'skuList['+scope.$index+'].price'" :rules="rules.sku.price">
                  <el-input v-model="scope.row.price"/>
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column label="库存" align="center">
              <template slot-scope="scope">
                <el-form-item :prop="'skuList['+scope.$index+'].stock'" :rules="rules.sku.stock">
                  <el-input v-model="scope.row.stock"/>
                </el-form-item>
              </template>
            </el-table-column>
          </el-table>
        </el-form>
      </el-card>
    </div>
    <div class="components-container__footer">
      <el-button @click="handlePrev">上一步，设置商品属性</el-button>
      <el-button type="primary" @click="handleSubmit">提交</el-button>
    </div>
  </div>
</template>

<script>
import {listAttribute} from "@/api/pms/attribute";
import MiniCardUpload from '@/components/Upload/MiniCardUpload'
import Sortable from "sortablejs";
import {addGoods, updateGoods} from "@/api/pms/goods";


export default {
  name: "GoodsStock",
  components: {MiniCardUpload},
  props: {
    value: Object
  },
  watch: {
    // 监听选择的商品分类关联商品属性项
    'value.categoryId': {
      handler(newVal, oldVal) {
        listAttribute({categoryId: newVal, type: 1}).then(res => {
          res.data.forEach(item => {
            console.log('规格项目', item)
            this.specForm.specList.push({
              name: item.name,
              values: []
            })
            this.loadData()

          })
        })
      }
    }
  },
  data() {
    return {
      // 包装一层用于表单验证
      specForm: {
        specList: [],
      },
      skuForm: {
        skuList: []
      },
      specTitleList: [], // 规格项表格标题
      rules: {
        specification: {
          name: [{required: true, message: '请输入规格名称', trigger: 'blur'}],
          value: [{required: true, message: '请输入规格值', trigger: 'blur'}]
        },
        sku: {
          sn: [{required: true, message: '请输入商品编号', trigger: 'blur'}],
          price: [{required: true, message: '请输入商品价格', trigger: 'blur'}],
          stock: [{required: true, message: '请输入商品库存', trigger: 'blur'}],
        }
      },
      colors: ['', 'success', 'warning', 'danger'],
      tagInputs: [{value: undefined, visible: false}], // 规格值标签临时值和显隐控制
      loading: undefined
    }
  },
  created() {
    if (this.value.id) {
      this.loadData()
    }

  },
  methods: {
    async loadData() {
      this.value.specList.forEach(spec => {
        const index = this.specForm.specList.findIndex(item => item.name == spec.name)
        if (index > -1) {
          this.specForm.specList[index].values.push({id: spec.id, value: spec.value, picUrl: spec.picUrl})
        } else {
          this.specForm.specList.push({
            name: spec.name,
            values: [{id: spec.id, value: spec.value, picUrl: spec.picUrl}]
          })
        }
      })


      // 每个规格项追加一个添加规格值按钮
      for (let i = 0; i < this.specForm.specList.length; i++) {
        this.tagInputs.push({'value': undefined, 'visible': false})
      }
      // SKU规格ID拼接字符串处理
      this.value.skuList.forEach(sku => {
        sku.specIdArr = sku.specIds.split('_')
      })

      this.generateSku()
      this.changeSpec()
      this.sortSpec()
      this.$nextTick(() => {
        this.setSort()
      })
    },
    handleSpecAdd: function () {
      if (this.specForm.specList.length >= 3) {
        this.$message.warning('最多支持3组规格')
        return
      }
      this.specForm.specList.push({})
      this.tagInputs.push({'value': undefined, 'visible': false})
      this.sortSpec()
    },
    handleSpecRemove: function (index) {
      this.specForm.specList.splice(index, 1)
      this.tagInputs.splice(index, 1)
      this.generateSku()
      this.sortSpec()
      this.changeSpec()
    },
    sortSpec: function () {
      this.specForm.specList.forEach((item, index) => {
        item.index = index
      })
    },
    handleSpecValueRemove: function (rowIndex, specValueId) {
      const specList = JSON.parse(JSON.stringify(this.specForm.specList))
      const removeIndex = specList[rowIndex].values.map(item => item.id).indexOf(specValueId)
      console.log('removeIndex', removeIndex)

      specList[rowIndex].values.splice(removeIndex, 1)
      this.specForm.specList = specList
      this.changeSpec()
      this.generateSku()
    },
    handleSpecValueInput: function (rowIndex) {
      const currSpecValue = this.tagInputs[rowIndex].value
      const specValues = this.specForm.specList[rowIndex].values
      if (specValues && specValues.length > 0 && specValues.map(item => item.value).includes(currSpecValue)) {
        this.$message.warning("规格值重复，请重新输入")
        return false
      }
      if (currSpecValue) {
        if (specValues && specValues.length > 0) {
          // 临时规格值ID tid_1_1
          let maxSpecValueIndex = specValues.filter(item => item.id.includes('tid_')).map(item => item.id.split('_')[2]).reduce((acc, curr) => {
            return acc > curr ? acc : curr
          }, 0)
          console.log('maxSpecValueIndex', maxSpecValueIndex)
          this.specForm.specList[rowIndex].values[specValues.length] = {
            'value': currSpecValue,
            'id': 'tid_' + (rowIndex + 1) + '_' + ++maxSpecValueIndex
          }
        } else {
          this.specForm.specList[rowIndex].values = [{'value': currSpecValue, 'id': 'tid_' + (rowIndex + 1) + '_1'}]
        }
      }
      this.tagInputs[rowIndex].value = undefined
      this.tagInputs[rowIndex].visible = false

      // 生成SKU列表
      this.generateSku()
    },
    handleSpecValueAdd: function (rowIndex) {
      this.tagInputs[rowIndex].visible = true
    },
    setSort() {
      const el = this.$refs.specTable.$el.querySelectorAll('.el-table__body-wrapper > table > tbody')[0]
      Sortable.create(el, {
        ghostClass: 'sortable-ghost', // Class name for the drop placeholder,
        setData: function (dataTransfer) {
          dataTransfer.setData('Text', '')
        },
        onEnd: evt => {
          // oldIndex 拖拽行当前所在索引
          // newIndex 拖拽行目标索引
          const targetRow = this.specForm.specList.splice(evt.oldIndex, 1)[0] //  返回被删除的行
          this.specForm.specList.splice(evt.newIndex, 0, targetRow) // 拼接
          this.generateSku() // 重新生成sku
          this.sortSpec()
          this.changeSpec()
        }
      })
    },
    generateSku: function () {
      // [
      //    { 'id':1,'name':'颜色','values':[{id:1,value:'白色'},{id:2,value:'黑色'},{id:3,value:'蓝色'}] },
      //    { 'id':2,'name':'版本','values':[{id:1,value:'6+128G'},{id:2,value:'8+128G'},{id:3,value:'8G+256G'}] }
      // ]
      const specList = JSON.parse(JSON.stringify(this.specForm.specList.filter(item => item.values.length > 0))) // 深拷贝，取有属性的规格项，否则笛卡尔积运算得到的SKU列表值为空

      const skuList = specList.reduce((acc, curr) => {
        let result = []
        acc.forEach(item => {
          // curr => { 'id':1,'name':'颜色','values':[{id:1,value:'白色'},{id:2,value:'黑色'},{id:3,value:'蓝色'}] }
          curr.values.forEach(v => {  // v=>{id:1,value:'白色'}
            let temp = Object.assign({}, item)
            temp.specValues += v.value + '_' // 规格值拼接
            temp.specIds += v.id + '|' // 规格ID拼接
            result.push(temp)
          })
        })
        return result
      }, [{specValues: '', specIds: ''}])

      skuList.forEach(item => {
        item.specIds = item.specIds.substring(0, item.specIds.length - 1)
        item.name = item.specValues.substring(0, item.specIds.length - 1).replaceAll('_', ' ')
        const specIdArr = item.specIds.split('|')
        const skus = this.value.skuList.filter(sku => sku.specIdArr.equals(specIdArr)) // 数据库的SKU列表
        if (skus && skus.length > 0) {
          const sku = skus[0]
          item.id = sku.id
          item.sn = sku.sn
          item.price = sku.price / 100
          item.stock = sku.stock
        }
        const specValueArr = item.specValues.substring(0, item.specValues.length - 1).split('_')  // ['黑','6+128G','官方标配']
        specValueArr.forEach((v, i) => {
          const key = 'specValue' + (i + 1)
          item[key] = v
          if (i == 0 && this.specForm.specList.length > 0) {
            const valueIndex = this.specForm.specList[0].values.findIndex(specValue => specValue.value == v)
            if (valueIndex > -1) {
              item.picUrl = this.specForm.specList[0].values[valueIndex].picUrl
            }
          }
        })
      })
      this.skuForm.skuList = JSON.parse(JSON.stringify(skuList))
    },
    changeSpec: function () {
      const specList = JSON.parse(JSON.stringify(this.specForm.specList))
      this.specTitleList = specList.map(item => item.name)
    },
    /**
     * 合并规格值单元格
     */
    handleCellMerge({row, column, rowIndex, columnIndex}) {
      let mergeRows = [1, 1, 1] // 分别对应规格1、规格2、规格3列合并的行数
      const specLen = this.specForm.specList.filter(item => item.values && item.values.length > 0).length
      if (specLen == 2) {
        const values_len_2 = this.specForm.specList[1].values ? this.specForm.specList[1].values.length : 1 // 第2个规格项的规格值的数量
        mergeRows = [values_len_2, 1, 1]
      } else if (specLen == 3) {
        const values_len_2 = this.specForm.specList[1].values ? this.specForm.specList[1].values.length : 1 // 第2个规格项的规格值的数量
        const values_len_3 = this.specForm.specList[2].values ? this.specForm.specList[2].values.length : 1 // 第3个规格项的规格值的数量
        mergeRows = [values_len_2 * values_len_3, values_len_3, 1]
      }
      if (columnIndex == 0) {
        if (rowIndex % mergeRows[0] === 0) {
          return [mergeRows[0], 1]// 合并单元格
        } else {
          return [0, 0] // 隐藏单元格
        }
      }
      if (columnIndex == 1) {
        if (rowIndex % mergeRows[1] === 0) {
          return [mergeRows[1], 1]// 合并单元格
        } else {
          return [0, 0]  // 隐藏单元格
        }
      }
    },
    handlePrev: function () {
      this.$emit('prev')
    },
    handleSubmit: function () {
      this.$refs.specForm.validate((specValid) => {
        if (specValid) {
          this.$refs.skuForm.validate((skuValid) => {
            if (skuValid) {
              this.openFullScreen()
              let submitGoodsData = Object.assign({}, this.value)
              delete submitGoodsData.specList
              delete submitGoodsData.skuList

              let specList = []
              this.specForm.specList.forEach(item => {
                item.values.forEach(value => {
                  value.name = item.name
                })
                specList = specList.concat(item.values)
              })
              submitGoodsData.specList = specList  // 规格列表

              submitGoodsData.price *= 100  // 金额转成分保存至数据库
              submitGoodsData.originPrice *= 100

              let skuList = JSON.parse(JSON.stringify(this.skuForm.skuList))
              skuList.map(item => {
                item.price *= 100
                return item
              })
              submitGoodsData.skuList = skuList
              console.log('提交数据', submitGoodsData)
              const goodsId = this.value.id
              if (goodsId) { // 编辑商品提交
                updateGoods(goodsId, submitGoodsData).then((res) => {
                    this.$router.push({path: '/pms/goods'})
                    this.$notify.success('修改商品成功')
                    this.closeFullScreen()
                  }, (err) => {
                    this.closeFullScreen()
                  }
                )
              } else { // 新增商品提交
                addGoods(submitGoodsData).then(response => {
                  this.$router.push({path: '/pms/goods'})
                  this.$notify.success('新增商品成功')
                  this.closeFullScreen()
                }, (err) => {
                  this.closeFullScreen()
                })
              }
            }
          })
        }
      })
    },
    openFullScreen: function () {
      this.loading = this.$loading({
        lock: true,
        text: '商品信息提交中，请等待...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
    },
    closeFullScreen: function () {
      if (this.loading) {
        this.loading.close()
      }
    }
  }
}


/**
 * 重写数组equals方法，数组元素完全相同不论顺序
 * @param target
 * @returns {boolean}
 */
Array.prototype.equals = function (target) {
  return this.length === target.length &&
    this.every(a => target.some(b => a === b)) &&
    target.every(x => this.some(y => x === y));
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

  .box-card {
    margin-bottom: 20px;
  }
}

.el-form-item&#45;&#45;mini.el-form-item{
  margin-top: 18px;
}
</style>
-->
