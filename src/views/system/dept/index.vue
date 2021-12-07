<template>
  <div class="app-container">
    <el-form
        :model="queryParams"
        ref="queryForm"
        :inline="true"
        v-show="showSearch"
    >
      <el-form-item
          label="部门名称"
          prop="name"
      >
        <el-input
            v-model="queryParams.name"
            placeholder="请输入部门名称"
            size="small"
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item
          label="状态"
          prop="status"
      >
        <el-select
            v-model="queryParams.status"
            placeholder="部门状态"
            clearable
            size="small"
        >
          <el-option
              v-for="dict in statusOptions"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
            class="filter-item"
            type="primary"
            size="mini"
            :icon="Search"
            @click="handleQuery"
        >
          搜索
        </el-button>
        <el-button
            :icon="Refresh"
            size="mini"
            @click="resetQuery"
        >
          重置
        </el-button>
      </el-form-item>
    </el-form>

    <el-row
        :gutter="10"
        class="mb8"
    >
      <el-col :span="1.5">
        <el-button
            type="primary"
            plain
            :icon="Plus"
            size="mini"
            @click="handleAdd"
        >
          新增
        </el-button>
      </el-col>
      <!-- <right-toolbar
        v-model:showSearch="showSearch"
        @queryTable="getList"
      /> -->
    </el-row>

    <el-table
        v-loading="loading"
        :data="deptList"
        row-key="deptId"
        default-expand-all
        :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
    >
      <el-table-column prop="name" label="部门名称"/>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag v-if="scope.row.status==1" type="success">正常</el-tag>
          <el-tag v-else type="info">禁用</el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="sort" label="显示排序" width="200"/>


      <el-table-column
          label="操作"
          align="center" width="150"
      >
        <template #default="scope">
          <el-button
              type="primary"
              :icon="Edit"
              size="mini"
              circle
              plain
              @click.stop="handleUpdate(scope.row)"
          >
          </el-button>
          <el-button
              type="success"
              size="mini"
              :icon="Plus"
              circle
              plain
              @click.stop="handleAdd(scope.row)"
          >
          </el-button>

          <el-button
              type="danger"
              :icon="Delete"
              size="mini"
              circle
              plain
              @click.stop="handleDelete(scope.row)">
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改部门对话框 -->
    <el-dialog
        :title="title"
        v-model="open"
        width="600px"
        @opened="dialogshow"
    >
      <el-form
          ref="formDialog"
          :model="formVal"
          :rules="rules"
          label-width="80px"
      >
            <el-form-item
                label="上级部门"
                prop="parentId"
            >
              <TreeSelect
                  :treeProps="props"
                  :options="deptOptions"
                  placeholder="选择上级部门"
                  :originOptions="originOptions"
                  :defalut="formVal.parentId"
                  :user="true"
                  @callBack="getDeptId"
                  :disabled="disabled"
              />
            </el-form-item>

<!--            <el-form-item label="上级部门" prop="parentId">-->
<!--              <tree-select-->
<!--                  v-model="formVal.parentId"-->
<!--                  :options="deptOptions"-->
<!--                  placeholder="选择上级部门"-->
<!--              />-->
<!--            </el-form-item>-->
            <el-form-item label="部门名称" prop="name">
              <el-input v-model="formVal.name" placeholder="请输入部门名称"/>
            </el-form-item>
        <el-form-item label="显示排序" prop="sort">
          <el-input-number v-model="formVal.sort" controls-position="right" style="width: 100px" :min="0"/>
        </el-form-item>
        <el-form-item label="部门状态">
          <el-radio-group v-model="formVal.status">
            <el-radio :label="1">正常</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <div
            class="dialog-footer"
        >
          <el-button
              type="primary"
              @click="submitForm"
          >
            确 定
          </el-button>
          <el-button @click="cancel">
            取 消
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, toRefs, unref, ref } from 'vue'
import {Search, Plus, Edit, Refresh, Delete} from '@element-plus/icons'
import { listDept, getDept, delDept, updateDept, addDept,getDeptSelectList } from '@/api/system/dept'
import TreeSelect  from '@/components/TreeSelect/Index.vue'
import { ElForm, ElMessage } from 'element-plus'

export default defineComponent({
  components: {
    TreeSelect
  },
  setup() {
    const queryForm = ref(ElForm)
    const formDialog = ref(ElForm)
    const dataMap = reactive({
      disabled: false,
      formUpdata: {} as any,
      isAdd: false,
      originOptions: [],
      props: { // 配置项（必选）
        value: 'id',
        label: 'label',
        children: 'children'
        // disabled:true
      },
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 表格树数据
      deptList: [],
      // 部门树选项
      deptOptions: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 状态数据字典
      statusOptions: [
        {
          "dictValue":0,
          "dictLabel":"禁用"
        },
        {
          "dictValue":1,
          "dictLabel":"正常"
        }
      ],
      // 查询参数
      queryParams: {
        name: undefined,
        status: undefined
      },
      formVal: {
        deptId: '',
        parentId: '',
        name: '',
        sort: 0,
        status: ''
      },

      deptidfix: 0,
      // 表单参数
      // 表单校验
      rules: {
        parentId: [
          { required: true, message: '上级部门不能为空', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '部门名称不能为空', trigger: 'blur' }
        ],
        sort: [
          { required: true, message: '显示排序不能为空', trigger: 'blur' }
        ]
      },
      test: '8347213498'
    })

    /** 查询部门列表 */
    const getList = () => {
      dataMap.loading = true
      listDept(dataMap.queryParams).then((response: any) => {
        dataMap.deptList = response.data
        dataMap.loading = false
      })
    }
    /** 转换部门数据结构 */
    const normalizer = (node: any) => {
      if (node.children && !node.children.length) {
        delete node.children
      }
      return {
        id: node.deptId,
        label: node.name,
        children: node.children
      }
    }
    // 取消按钮
    const cancel = () => {
      dataMap.open = false
      dataMap.isAdd = false
    }

    /** 搜索按钮操作 */
    const handleQuery = () => {
      getList()
    }
    /** 重置按钮操作 */
    const resetQuery = () => {
      const form = unref(queryForm)
      form.resetFields()
      handleQuery()
    }

    const flatten = (origin: any) => {
      let result: any = []
      for (let i = 0; i < origin.length; i++) {
        const item = origin[i]
        if (Array.isArray(item.children)) {
          result = result.concat(flatten(item.children))
          result.push(item)
        } else {
          result.push(item)
        }
      }
      return result
    }
    /** 查询部门下拉树结构 */
    const getTreeselect = () => {
      getDeptSelectList().then(response => {
          dataMap.deptOptions = response.data
          dataMap.originOptions = flatten(response?.data) as any

      })
    }
    const handleAdd = (row: any) => {
      dataMap.isAdd = true
      dataMap.formVal.parentId = {} as any
      if (row.deptId) {
        dataMap.formVal = {} as any
        dataMap.formVal.parentId = row.deptId
      }
      dataMap.open = true
      dataMap.title = '添加部门'
    }
    /** 修改按钮操作 */
    const handleUpdate = async(row: any) => {
      dataMap.disabled = true
      dataMap.isAdd = false
      dataMap.deptidfix = row.id
      // 部门下拉数据
      await getTreeselect()
      const result = await getDept(row.id) as any
      if (result?.code === "00000") {
        dataMap.formUpdata = result.data
        dataMap.formVal.name = result.data.name
        dataMap.formVal.parentId = result.data.parentId
        dataMap.formVal.sort = result.data.sort
        dataMap.formVal.status = result.data.status
        dataMap.title = '修改部门'
        dataMap.open = true
      }
    }
    /** 提交按钮 */
    const submitForm = () => {
      const formNode = unref(formDialog)
      formNode.validate((valid: any) => {
        if (valid) {
          if (!dataMap.isAdd) {
            dataMap.formUpdata.parentId = dataMap.formVal.parentId
            dataMap.formUpdata.id = dataMap.deptidfix
            dataMap.formUpdata.name = dataMap.formVal.name
            dataMap.formUpdata.sort = dataMap.formVal.sort
            dataMap.formUpdata.status = dataMap.formVal.status
            updateDept(dataMap.formUpdata.id,dataMap.formUpdata).then((res: any) => {
              if (res?.code === "00000") {
                ElMessage.success('修改成功')
                dataMap.open = false
                getList()
              } else {
                dataMap.open = false
                ElMessage.error(res?.msg)
              }
            })
          } else {
            addDept(dataMap.formVal).then((res: any) => {
              if (res?.code === 200) {
                ElMessage.success('新增成功')
                dataMap.open = false
                getList()
              } else {
                dataMap.open = false
                ElMessage.error(res?.msg)
              }
            })
          }
        }
      })
    }
    /** 删除按钮操作 */
    const handleDelete = async(row: any) => {
      const result = await delDept(row.deptId) as any
      if (result?.code === 200) {
        getList()
      } else {
        ElMessage.error(result?.msg)
      }
    }

    const statusFormat = (row: any) => {
      return row.status === '0' ? '正常' : '  停用'
    }

    const getDeptId = (e: any) => {
      dataMap.formVal.deptId = e
    }
    const dialogshow = () => {
      getTreeselect()
    }
    onMounted(() => {
      getList()
      getTreeselect()
    })

    return { ...toRefs(dataMap),Search,Plus,Edit,Delete,Refresh,dialogshow, getDeptId, flatten, getTreeselect, formDialog, statusFormat, queryForm, getList, normalizer, handleDelete, cancel, handleQuery, resetQuery, handleAdd, handleUpdate, submitForm }
  }
})

</script>
