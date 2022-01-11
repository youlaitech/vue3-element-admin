<template>
  <div class="components-container">
    <div class="components-container__main">
      <el-card class="box-card">
        <template #header>
          <span>商品规格</span>
          <el-button
              :icon="Plus"
              type="success"
              @click="handleSpecAdd"
              size="mini"
              style="float: right;"
          >
            添加规格项
          </el-button>
        </template>

        <el-form
            ref="specFormRef"
            :model="specForm"
            :inline="true"
            size="mini"
        >
          <el-table
              ref="specTableRef"
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
              <template #default="scope">
                <el-form-item
                    :prop="'specList[' + scope.$index + '].name'"
                    :rules="rules.spec.name"
                >
                  <el-input
                      type="text"
                      v-model="scope.row.name"
                      size="mini"
                      @input="handleSpecChange()"
                  />
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column>
              <template #header>
                规格值
                <el-link type="danger" style="font-size:12px" :underline="false">（默认第一条规格包含图片）</el-link>
              </template>

              <template #default="scope">
                <div v-for="item in scope.row.values"
                     style="margin-right:15px;display: inline-block"
                >
                  <el-tag
                      size="small"
                      closable
                      :type="colors[scope.$index%colors.length]"
                      @close="handleSpecValueRemove(scope.$index,item.id)"
                  >
                    {{ item.value }}
                  </el-tag>
                  <single-upload
                      v-model="item.picUrl"
                      v-if="scope.$index==0"
                      style="margin-top: 5px"
                  />
                </div>

                <el-input
                    v-if="tagInputs[scope.$index].visible"
                    v-model="tagInputs[scope.$index].value"
                    @keyup.enter.native="handleSpecValueInput(scope.$index)"
                    @blur="handleSpecValueInput(scope.$index)"
                    style="width: 80px;vertical-align: top"
                    size="mini"
                />
                <el-button
                    v-else
                    @click="handleSpecValueAdd(scope.$index)"
                    :icon="Plus"
                    style="vertical-align: top"
                    size="mini"
                >
                  添加规格值
                </el-button>
              </template>
            </el-table-column>

            <el-table-column width="60" label="操作">
              <template #default="scope">
                <el-button
                    type="danger"
                    :icon="Minus"
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
        <template #header>
          <span>商品库存</span>
        </template>
        <el-form
            ref="skuFormRef"
            :model="skuForm"
            size="mini"
            :inline="true"
        >
          <el-table
              :data="skuForm.skuList"
              :span-method="handleCellMerge"
              highlight-current-row
              size="mini"
              fit
              border
          >

            <el-table-column
                v-for="(title,index) in specTitles"
                align="center"
                :prop="'specValue'+(index+1)"
                :label="title">
            </el-table-column>

            <el-table-column
                label="商品编码"
                align="center"
            >
              <template #default="scope">
                <el-form-item :prop="'skuList['+scope.$index+'].sn'" :rules="rules.sku.sn">
                  <el-input v-model="scope.row.sn"/>
                </el-form-item>
              </template>
            </el-table-column>

            <el-table-column label="价格" align="center">
              <template #default="scope">
                <el-form-item :prop="'skuList['+scope.$index+'].price'" :rules="rules.sku.price">
                  <el-input v-model="scope.row.price"/>
                </el-form-item>
              </template>
            </el-table-column>

            <el-table-column label="库存" align="center">
              <template #default="scope">
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
      <el-button type="primary" @click="submitForm">提交</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {listAttributes} from "@/api/pms/attribute";
import SingleUpload from '@/components/Upload/SingleUpload.vue'
import Sortable from 'sortablejs'
import {addGoods, updateGoods} from "@/api/pms/goods";
import {computed, getCurrentInstance, nextTick, onMounted, reactive, ref, toRefs, unref, watch} from "vue";
import {ElMessage, ElTable, ElForm} from "element-plus"
import {Plus, Minus} from '@element-plus/icons'
import SvgIcon from '@/components/SvgIcon/index.vue'
import {useRouter} from "vue-router";

const emit = defineEmits(['prev', 'next'])

const proxy = getCurrentInstance() as any
const router = useRouter()

const specTableRef = ref(ElTable)
const specFormRef = ref(ElForm)
const skuFormRef = ref(ElForm)

const props = defineProps({
  modelValue: {
    type: Object,
    default: {}
  }
})

const categoryId = computed(() => props.modelValue.categoryId);

const state = reactive({
  specForm: {
    specList: [{}] as Array<any>,
  },
  skuForm: {
    skuList: []
  },
  // 规格项表格标题
  specTitles: [],
  rules: {
    spec: {
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
})

const {specForm, skuForm, specTitles, rules, colors, tagInputs, loading} = toRefs(state)

watch(categoryId, (newVal, oldVal) => {
      if (newVal) {
        // type=1 商品规格(销售属性)
        listAttributes({categoryId: newVal, type: 1}).then(response => {
          const specList = response.data
          if (specList && specList.length > 0) {
            specList.forEach((item: any) => {
              state.specForm.specList.push({
                name: item.name,
                values: []
              })
            })
          }
        })
      }
    },
    {
      immediate: true,
      deep: true
    }
)


function loadData() {
  const goodsId = props.modelValue.id
  // 编辑数据加载
  if (goodsId) {
    props.modelValue.specList.forEach((specItem: any) => {
      const specIndex = state.specForm.specList.findIndex(item => item.name == specItem.name)
      if (specIndex > -1) {
        state.specForm.specList[specIndex].values.push({
          id: specItem.id,
          value: specItem.value,
          picUrl: specItem.picUrl
        })
      } else {
        state.specForm.specList.push({
          name: specItem.name,
          values: [{id: specItem.id, value: specItem.value, picUrl: specItem.picUrl}]
        })
      }
    })

    // 每个规格项追加一个添加规格值按钮
    for (let i = 0; i < state.specForm.specList.length; i++) {
      state.tagInputs.push({'value': undefined, 'visible': false})
    }

    // SKU规格ID拼接字符串处理
    props.modelValue.skuList.forEach((sku: any) => {
      sku.specIdArr = sku.specIds.split('_')
    })

    generateSkuList()

    handleSpecChange()

    handleSpecReorder()

    nextTick(() => {
      registerSpecDragSortEvent()
    })
  }
}

/**
 * 生成SKU列表的title
 */
function handleSpecChange() {
  const specList = JSON.parse(JSON.stringify(state.specForm.specList))
  state.specTitles = specList.map((item: any) => item.name)
}

/**
 * 规格列表重排序
 */
function handleSpecReorder() {
  state.specForm.specList.forEach((item, index) => {
    item.index = index
  })
}

/**
 * 注册拖拽排序事件
 */
function registerSpecDragSortEvent() {
  const el = specTableRef.value.$el.querySelectorAll('.el-table__body-wrapper > table > tbody')[0]
  Sortable.create(el, {
    ghostClass: 'sortable-ghost', // Class name for the drop placeholder,
    setData: function (dataTransfer: any) {
      dataTransfer.setData('Text', '')
    },
    onEnd: (evt: any) => {
      // oldIndex 拖拽行当前所在索引
      // newIndex 拖拽行目标索引
      const targetRow = state.specForm.specList.splice(evt.oldIndex, 1)[0] //  返回被删除的行
      state.specForm.specList.splice(evt.newIndex, 0, targetRow) // 拼接
      generateSkuList() // 重新生成sku
      handleSpecChange()
      handleSpecReorder()
    }
  })
}

/**
 *  根据商品规格笛卡尔积生成SKU列表
 *
 * 规格列表：
 * [
 *    { 'id':1,'name':'颜色','values':[{id:1,value:'白色'},{id:2,value:'黑色'},{id:3,value:'蓝色'}] },
 *    { 'id':2,'name':'版本','values':[{id:1,value:'6+128G'},{id:2,value:'8+128G'},{id:3,value:'8G+256G'}] }
 * ]
 */
function generateSkuList() {
  const specList = JSON.parse(JSON.stringify(state.specForm.specList.filter(item => item.values.length > 0))) // 深拷贝，取有属性的规格项，否则笛卡尔积运算得到的SKU列表值为空
  const skuList = specList.reduce((acc: any, curr: any) => {
    let result = [] as any
    acc.forEach((item: any) => {
      // curr => { 'id':1,'name':'颜色','values':[{id:1,value:'白色'},{id:2,value:'黑色'},{id:3,value:'蓝色'}] }
      curr.values.forEach((v: any) => {  // v=>{id:1,value:'白色'}
        let temp = Object.assign({}, item)
        temp.specValues += v.value + '_' // 规格值拼接
        temp.specIds += v.id + '|' // 规格ID拼接
        result.push(temp)
      })
    })
    return result
  }, [{specValues: '', specIds: ''}])

  skuList.forEach((item: any) => {
    item.specIds = item.specIds.substring(0, item.specIds.length - 1)
    item.name = item.specValues.substring(0, item.specIds.length - 1).replaceAll('_', ' ')
    const specIdArr = item.specIds.split('|')
    const skus = props.modelValue.skuList.filter((sku: any) =>
        sku.specIdArr.length === specIdArr.length &&
        sku.specIdArr.every((a: number) => specIdArr.some((b: number) => a === b)) &&
        specIdArr.every((x: number) => sku.specIdArr.some((y: number) => x === y))
    ) // 数据库的SKU列表

    if (skus && skus.length > 0) {
      const sku = skus[0]
      item.id = sku.id
      item.sn = sku.sn
      item.price = sku.price / 100
      item.stock = sku.stock
    }
    const specValueArr = item.specValues.substring(0, item.specValues.length - 1).split('_')  // ['黑','6+128G','官方标配']
    specValueArr.forEach((v: any, i: any) => {
      const key = 'specValue' + (i + 1)
      item[key] = v
      if (i == 0 && state.specForm.specList.length > 0) {
        const valueIndex = state.specForm.specList[0].values.findIndex((specValue: any) => specValue.value == v)
        if (valueIndex > -1) {
          item.picUrl = state.specForm.specList[0].values[valueIndex].picUrl
        }
      }
    })
  })
  state.skuForm.skuList = JSON.parse(JSON.stringify(skuList))
}

/**
 * 添加规格
 */
function handleSpecAdd() {
  if (state.specForm.specList.length >= 3) {
    ElMessage.warning('最多支持3组规格')
    return
  }
  state.specForm.specList.push({})
  state.tagInputs.push({'value': undefined, 'visible': false})
  handleSpecReorder()
}

/**
 * 删除规格
 * @param index
 */
function handleSpecRemove(index: number) {
  state.specForm.specList.splice(index, 1)
  state.tagInputs.splice(index, 1)
  generateSkuList()
  handleSpecReorder()
  handleSpecChange()
}

/**
 * 添加规格值
 *
 * @param specIndex
 */
function handleSpecValueAdd(specIndex: number) {
  state.tagInputs[specIndex].visible = true
}

/**
 *  删除规格值
 *
 * @param rowIndex
 * @param specValueId
 */
function handleSpecValueRemove(rowIndex: number, specValueId: number) {
  const specList = JSON.parse(JSON.stringify(state.specForm.specList))
  const removeIndex = specList[rowIndex].values.map((item: any) => item.id).indexOf(specValueId)
  specList[rowIndex].values.splice(removeIndex, 1)
  state.specForm.specList = specList
  handleSpecChange()
  handleSpecReorder()
}

/**
 * 规格值输入
 */
function handleSpecValueInput(rowIndex: number) {
  const currSpecValue = state.tagInputs[rowIndex].value
  const specValues = state.specForm.specList[rowIndex].values
  if (specValues && specValues.length > 0 && specValues.map((item: any) => item.value).includes(currSpecValue)) {
    ElMessage.warning("规格值重复，请重新输入")
    return false
  }
  if (currSpecValue) {
    if (specValues && specValues.length > 0) {
      // 临时规格值ID tid_1_1
      let maxSpecValueIndex = specValues.filter((item: any) => item.id.includes('tid_')).map((item: any) => item.id.split('_')[2]).reduce((acc: any, curr: any) => {
        return acc > curr ? acc : curr
      }, 0)
      console.log('maxSpecValueIndex', maxSpecValueIndex)
      state.specForm.specList[rowIndex].values[specValues.length] = {
        'value': currSpecValue,
        'id': 'tid_' + (rowIndex + 1) + '_' + ++maxSpecValueIndex
      }
    } else {
      state.specForm.specList[rowIndex].values = [{'value': currSpecValue, 'id': 'tid_' + (rowIndex + 1) + '_1'}]
    }
  }
  state.tagInputs[rowIndex].value = undefined
  state.tagInputs[rowIndex].visible = false
  generateSkuList()
}

/**
 * 合并规格单元格
 *
 * @param cellObj 单元格对象
 */
function handleCellMerge(cellObj: any) {
  const {rowIndex, columnIndex} = cellObj
  let mergeRows = [1, 1, 1] // 分别对应规格1、规格2、规格3列合并的行数
  const specLen = state.specForm.specList.filter(item => item.values && item.values.length > 0).length
  if (specLen == 2) {
    const values_len_2 = state.specForm.specList[1].values ? state.specForm.specList[1].values.length : 1 // 第2个规格项的规格值的数量
    mergeRows = [values_len_2, 1, 1]
  } else if (specLen == 3) {
    const values_len_2 = state.specForm.specList[1].values ? state.specForm.specList[1].values.length : 1 // 第2个规格项的规格值的数量
    const values_len_3 = state.specForm.specList[2].values ? state.specForm.specList[2].values.length : 1 // 第3个规格项的规格值的数量
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
}

/**
 * 商品表单提交
 */
function submitForm() {
  const specForm = unref(specFormRef)
  specForm.validate((specValid: boolean) => {
    if (specValid) {
      const skuForm = unref(skuFormRef)
      skuForm.validate((skuValid: boolean) => {
        if (skuValid) {
          openFullScreen()
          let submitsData = Object.assign({}, props.modelValue)
          delete submitsData.specList
          delete submitsData.skuList

          let specList = [] as Array<any>
          state.specForm.specList.forEach(item => {
            item.values.forEach((value: any) => {
              value.name = item.name
            })
            specList = specList.concat(item.values)
          })
          submitsData.specList = specList  // 规格列表

          submitsData.price *= 100  // 金额转成分保存至数据库
          submitsData.originPrice *= 100

          let skuList = JSON.parse(JSON.stringify(state.skuForm.skuList))
          skuList.map((item: any) => {
            item.price *= 100
            return item
          })
          submitsData.skuList = skuList
          console.log('提交数据', submitsData)
          const goodsId = props.modelValue.id
          if (goodsId) { // 编辑商品提交
            updateGoods(goodsId, submitsData).then((res) => {
                  router.push({path: '/pms/good'})
                  proxy.$notify.success('修改商品成功')
                  closeFullScreen()
                }, (err) => {
                  closeFullScreen()
                }
            )
          } else { // 新增商品提交
            addGoods(submitsData).then(response => {
              router.push({path: '/pms/good'})
              proxy.$notify.success('新增商品成功')
              closeFullScreen()
            }, (err) => {
              closeFullScreen()
            })
          }
        }
      })
    }
  })
}

function openFullScreen() {
  state.loading = proxy.$loading({
    lock: true,
    text: '商品信息提交中，请等待...',
    spinner: 'el-icon-loading',
    background: 'rgba(0, 0, 0, 0.7)'
  });
}

function closeFullScreen() {
  if (state.loading) {
    (state.loading as any).close()
  }
}

function handlePrev() {
  emit('prev')
}

function handNext() {
  emit('next')
}

onMounted(() => {
  loadData()
})

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

.el-form-item--mini.el-form-item {
  margin-top: 18px;
}
</style>
