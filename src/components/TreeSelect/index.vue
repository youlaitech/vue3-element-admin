<template>
  <el-select
    v-model="valueTitle"
    :clearable="clearable"
    @clear="clearHandle"
    :placeholder="placeholder"
  >
    <el-option
      :value="valueTitle"
      :label="valueTitle"
      class="options"
    >
      <el-tree
        id="tree-option"
        ref="selectTree"
        :accordion="accordion"
        :data="options"
        :props="treeProps"
        :node-key="treeProps.value"
        :default-expanded-keys="defaultExpandedKey"
        @node-click="handleNodeClick"
        :disabled="disabled"
      />
    </el-option>
  </el-select>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs, nextTick, onMounted, getCurrentInstance, PropType, watch } from 'vue'

interface TreeProps {
  value: number
  label: string
  children: string
}

export default defineComponent({
  name: 'ElTreeSelect',
  props: {
    placeholder: {
      type: String,
      default: ''
    },
    user: {
      type: Boolean,
      default: false
    },
    // 选项列表数据(一维数组)
    originOptions: { type: Array, required: true },
    // 选项列表数据(树形结构的对象数组)
    options: { type: Array, required: true },
    // 初始值
    defalut: { type: Number, default: null },
    // 可清空选项
    clearable: { type: Boolean, default: true },
    // 自动收起
    accordion: { type: Boolean, default: false },
    treeProps: {
      type: Object as PropType<TreeProps>,
      default: () => {
        return {
          value: 'menuId',
          label: 'menuName',
          children: 'children'
        }
      }
    },
    disabled: {
      type: Boolean, default: false
    }
  },
  emits: ['callBack'],
  setup(props, ctx) {
    console.log(props.options)
    console.log(props.treeProps)

    const instance = getCurrentInstance() as any
    const state = reactive({
      valueId: 0,
      valueTitle: '',
      defaultExpandedKey: Array<number>()
    })

    // 初始化滚动条
    const initScroll = () => {
      nextTick(() => {
        const scrollWrap = document.querySelectorAll('.el-scrollbar .el-select-dropdown__wrap')[0] as any
        const scrollBar = document.querySelectorAll('.el-scrollbar .el-scrollbar__bar') as any
        scrollWrap.style.cssText = 'margin: 0px; max-height: none; overflow: hidden;'
        scrollBar.forEach((ele: any) => {
          ele.style.width = 0
        })
      })
    }

    // 清空选中样式
    const clearSelected = () => {
      const allNode = document.querySelectorAll('#tree-option .el-tree-node')
      allNode.forEach((element) => element.classList.remove('is-current'))
    }

    const initHandle = () => {
      initScroll()
    }

    // 处理默认值并显示
    const defaultValue = () => {
      console.log('xxxxxx')

      if (props.defalut !== null) {
        const deafaultModels = props.originOptions.filter((item: any) => {
          return item[props.treeProps.value] === props.defalut
        })

        if (deafaultModels.length > 0) {
          state.valueId = props.defalut
          state.valueTitle = (deafaultModels[0] as any)[props.treeProps.label]
        } else {
          if (!props.user) {
            state.valueId = 0
            state.valueTitle = '主类目'
          } else {
            state.valueId = 0
            state.valueTitle = ''
          }
        }
        instance.ctx.$refs.selectTree.setCurrentKey(props.defalut)
        state.defaultExpandedKey = [props.defalut] as number[]
      }
    }

    onMounted(() => {
      initHandle()
    })

    watch(() => props.options, () => {
      if (props.options) {
        defaultValue()
      }
    })

    // 更新数据
    const updateData = (value: any, label: any) => {
      state.valueTitle = label
      state.valueId = value
      state.defaultExpandedKey = []
      ctx.emit('callBack', value)
    }

    // 点击节点调用
    const handleNodeClick = (node: any) => {
      updateData(node[props.treeProps.value], node[props.treeProps.label])
    }

    // 清除选中
    const clearHandle = () => {
      updateData(null, null)
      clearSelected()
    }

    return {
      ...toRefs(state),
      handleNodeClick,
      clearHandle
    }
  }
})
</script>

<style scoped>
.el-select.el-select--medium{
 width: 100%;
}

.el-scrollbar .el-scrollbar__view .el-select-dropdown__item {
  height: auto;
  max-height: 274px;
  padding: 0;
  overflow: hidden;
  overflow-y: auto;
}
.el-select-dropdown__item.selected {
  font-weight: normal;
}
ul li :deep(.el-tree .el-tree-node__content) {
  height: auto;
  padding: 0 20px;
}
.el-tree-node__label {
  font-weight: normal;
}
.el-tree :deep(.is-current .el-tree-node__label) {
  color: #409eff;
  font-weight: 700;
}
.el-tree :deep(.is-current .el-tree-node__children .el-tree-node__label) {
  color: #606266;
  font-weight: normal;
}
</style>
