<!--
<template>
  <div class="app-container">
    &lt;!&ndash; 搜索表单 &ndash;&gt;
    <el-form size="mini"
             :model="queryParams"
             ref="queryForm"
             :inline="true"
    >
      <el-form-item>
        <el-button type="success" icon="el-icon-plus" @click="handleAdd">新增</el-button>
        <el-button type="danger" icon="el-icon-delete" :disabled="single" @click="handleDelete">删除
        </el-button>
      </el-form-item>

      <el-form-item prop="name">
        <el-input
            v-model="queryParams.name"
            placeholder="字典名称"
            clearable
            @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    &lt;!&ndash; 数据表格 &ndash;&gt;
    <el-table
        ref="table"
        :data="pageList"
        v-loading="loading"
        @row-click="handleRowClick"
        @selection-change="handleSelectionChange"
        border
        size="mini"
    >
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="字典名称" prop="name" width="120"/>
      <el-table-column label="字典编码" prop="code" />
      <el-table-column label="状态" align="center" width="80">
        <template slot-scope="scope">
          <el-switch
              size="mini"
              v-model="scope.row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(scope.row)"
          />
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" width="150">
        <template slot-scope="scope">
          <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              circle
              plain
              @click.stop="handleUpdate(scope.row)"
          />
          <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              circle
              plain
              @click.stop="handleDelete(scope.row)"
          />
        </template>
      </el-table-column>
    </el-table>
    <pagination
        v-show="pagination.total>0"
        :total="pagination.total"
        :page.sync="pagination.page"
        :limit.sync="pagination.limit"
        @pagination="handleQuery"
    />

    &lt;!&ndash; 弹窗表单 &ndash;&gt;
    <el-dialog
        :title="dialog.title"
        :visible.sync="dialog.visible"
        width="500px"
        @close="closeDialog" >
      <el-form
          ref="form"
          :model="form"
          :rules="rules"
          label-width="80px">
        <el-form-item label="字典名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入字典名称"/>
        </el-form-item>
        <el-form-item label="字典编码" prop="code">
          <el-input v-model="form.code" placeholder="请输入字典编码"/>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">正常</el-radio>
            <el-radio :label="0">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleSubmit">确 定</el-button>
        <el-button @click="closeDialog">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import {listDictItemsWithPage,getDictDetail,addDict,updateDict,deleteDict} from "@/api/system/dict";
import {Search, Plus, Edit, Refresh, Delete} from '@element-plus/icons'
import {onMounted, reactive, getCurrentInstance, ref, unref} from 'vue'
import {ElForm, ElMessage, ElMessageBox} from "element-plus";






export default {
  name: "Dict",
  data() {
    return {
      loading: true,
      ids: [],
      single: true,
      multiple: true,
      queryParams: {
        name: undefined
      },
      pagination: {
        page: 1,
        limit: 10,
        total: 0
      },
      pageList: [],
      dialog: {
        title: undefined,
        visible: false
      },
      form: {
        status: 1
      },
      rules: {
        name: [
          {required: true, message: '请输入字典名称', trigger: 'blur'}
        ],
        code: [
          {required: true, message: '请输入字典编码', trigger: 'blur'}
        ]
      }
    }
  },

  created() {
    this.handleQuery()
  },
  methods: {
    handleQuery() {
      this.queryParams.page = this.pagination.page
      this.queryParams.limit = this.pagination.limit
      getDictPageList(this.queryParams).then(response => {
        this.pageList = response.data
        this.pagination.total = response.total
        this.loading = false
      })
    },
    handleReset() {
      this.pagination = {
        page: 1,
        limit: 10,
        total: 0
      }
      this.queryParams = {
        name: undefined,
        queryMode: 'page'
      }
      this.handleQuery()
    },
    handleRowClick(row) {
      this.$emit('dictClick', row)
    },
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length != 1
      this.multiple = !selection.length
    },
    handleStatusChange(row) {
      const text = row.status === 1 ? '启用' : '停用'
      this.$confirm('确认要"' + text + row.name + '"数据项吗?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function () {
        return patch(row.id, 1, {status: row.status})
      }).then(() => {
        this.$message.success(text + '成功')
      }).catch(function () {
        row.status = row.status === 1 ? 0 : 1
      })
    },

    handleAdd() {
      this.resetForm()
      this.dialog = {
        title: '新增字典',
        visible: true
      }
    },

    handleUpdate(row) {
      this.resetForm()
      this.dialog = {
        title: '修改字典',
        visible: true
      }
      const id = row.id || this.ids
      detail(id).then(response => {
        this.form = response.data
      })
    },

    handleSubmit: function () {
      this.$refs['form'].validate(valid => {
        if (valid) {
          const id = this.form.id
          if (id != undefined) {
            update(id, this.form).then(() => {
              this.$message.success('修改成功')
              this.closeDialog()
              this.handleQuery()
            })
          } else {
            add(this.form).then(() => {
              this.$message.success('新增成功')
              this.closeDialog()
              this.handleQuery()
            })
          }
        }
      })
    },

    handleDelete(row) {
      const ids = [row.id || this.ids].join(',')
      this.$confirm('确认删除已选中的数据项？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        del(ids).then(() => {
          this.$message.success('删除成功')
          this.handleQuery()
          this.$emit('resetItem')
        })
      }).catch(() =>
          this.$message.info('已取消删除')
      )
    },
    closeDialog() {
      this.resetForm()
      this.dialog = {
        title: undefined,
        visible: false
      }
    },
    resetForm() {
      this.form = {
        status: 1
      }
      if (this.$refs['form']) {
        this.$refs['form'].resetFields()
      }
    }
  }
}
</script>

<style scoped>

</style>
-->
