<template>
  <div class="page-container page-container--split dict-page">
    <aside class="page-aside" :class="{ 'is-collapsed': sidebarCollapsed }">
      <div class="page-aside__inner">
        <div class="dict-type">
          <div class="flex items-center gap-2 mb-2">
            <el-input
              v-model="params.keywords"
              class="flex-1"
              placeholder="字典名称/编码"
              clearable
              @keyup.enter="handleSearch"
              @clear="handleSearch"
            />
            <el-button
              v-hasPerm="['sys:dict:create']"
              type="primary"
              :icon="Plus"
              @click="handleCreateClick()"
            />
          </div>

          <el-scrollbar v-loading="loading" class="dict-type__list">
            <div
              v-for="row in list"
              :key="row.id"
              class="dict-type__item"
              :class="{ 'is-active': row.dictCode === currentType?.dictCode }"
              @click="handleTypeClick(row)"
            >
              <div class="dict-type__info">
                <span class="dict-type__name" :title="row.name">{{ row.name }}</span>
                <span class="dict-type__code" :title="row.dictCode">{{ row.dictCode }}</span>
              </div>
              <div class="dict-type__actions">
                <el-button
                  v-hasPerm="['sys:dict:update']"
                  link
                  type="primary"
                  @click.stop="handleEditClick(row.id)"
                >
                  <el-icon><Edit /></el-icon>
                </el-button>
                <el-button
                  v-hasPerm="['sys:dict:delete']"
                  link
                  type="danger"
                  @click.stop="handleDelete(row.id)"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>

            <el-empty
              v-if="!loading && list.length === 0"
              :image-size="60"
              description="暂无字典"
            />
          </el-scrollbar>

          <div class="flex items-center justify-between gap-2 pt-2">
            <span class="text-12px text-[var(--el-text-color-secondary)]">共 {{ total }} 个</span>
            <el-pagination
              v-model:current-page="params.pageNum"
              :page-size="params.pageSize"
              :total="total"
              layout="prev, pager, next"
              size="small"
              background
              @current-change="handlePageChange"
            />
          </div>
        </div>
      </div>

      <button
        class="page-aside__toggle"
        :title="sidebarCollapsed ? '展开字典类型' : '收起字典类型'"
        type="button"
        @click="sidebarCollapsed = !sidebarCollapsed"
      >
        <el-icon :size="14">
          <ArrowLeft v-if="!sidebarCollapsed" />
          <ArrowRight v-else />
        </el-icon>
      </button>
    </aside>

    <div class="page-main">
      <DictItemPanel
        v-if="currentType"
        :key="currentType.dictCode"
        :dict-code="currentType.dictCode"
        :dict-name="currentType.name"
      />
      <el-card v-else class="page-content dict-page__empty" shadow="never">
        <el-empty description="请先在左侧选择字典类型" />
      </el-card>
    </div>

    <el-dialog
      v-model="dialogState.visible"
      :title="dialogState.title"
      width="500px"
      @close="closeDialog"
    >
      <el-form ref="dictFormRef" :model="formData" :rules="rules" label-width="80px">
        <el-form-item label="字典名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入字典名称" />
        </el-form-item>

        <el-form-item label="字典编码" prop="dictCode">
          <el-input v-model="formData.dictCode" placeholder="请输入字典编码" />
        </el-form-item>

        <el-form-item label="状态">
          <el-radio-group v-model="formData.status">
            <el-radio :value="CommonStatus.ENABLED">启用</el-radio>
            <el-radio :value="CommonStatus.DISABLED">禁用</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="备注">
          <el-input v-model="formData.remark" type="textarea" placeholder="请输入备注" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubmit">确 定</el-button>
          <el-button @click="closeDialog">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from "element-plus";
import { ArrowLeft, ArrowRight, Delete, Edit, Plus } from "@element-plus/icons-vue";

import DictAPI from "@/api/system/dict";
import type { DictTypeForm, DictTypeItem, DictTypeQueryParams } from "@/api/system/dict";
import { usePageTable } from "@/composables";
import { CommonStatus } from "@/enums";
import DictItemPanel from "./components/DictItemPanel.vue";

defineOptions({
  name: "Dict",
  inheritAttrs: false,
});

// 左侧字典类型折叠状态：折叠后右侧顶部仍会显示当前字典，用以免丢失上下文
const sidebarCollapsed = ref(false);

const dictFormRef = ref<FormInstance>();

// 当前选中的字典类型，右侧字典项据此联动
const currentType = ref<DictTypeItem>();

// 字典类型列表分页数据管理
const { loading, list, total, params, fetchData } = usePageTable<DictTypeItem, DictTypeQueryParams>(
  {
    initialParams: {
      pageNum: 1,
      pageSize: 20,
      keywords: "",
    },
    request: DictAPI.getPage,
  }
);

/**
 * 拉取字典类型并保持右侧选中项有效
 *
 * @param preferDictCode 优先选中的字典编码，缺省沿用当前选中项
 */
async function fetchTypes(preferDictCode?: string): Promise<void> {
  await fetchData();

  const target = preferDictCode ?? currentType.value?.dictCode;
  currentType.value = list.value.find((row) => row.dictCode === target) ?? list.value[0];
}

/**
 * 按关键字查询字典类型
 */
function handleSearch(): void {
  params.pageNum = 1;
  fetchTypes();
}

/**
 * 左侧列表翻页
 */
function handlePageChange(): void {
  fetchTypes();
}

/**
 * 选中字典类型，右侧字典项面板随之切换
 *
 * @param row 字典类型行
 */
function handleTypeClick(row: DictTypeItem): void {
  if (row.dictCode === currentType.value?.dictCode) return;
  currentType.value = row;
}

const dialogState = reactive({
  title: "",
  visible: false,
});

const initialFormData: DictTypeForm = {
  status: CommonStatus.ENABLED,
};

const formData = reactive<DictTypeForm>({ ...initialFormData });

const rules: FormRules<DictTypeForm> = {
  name: [{ required: true, message: "请输入字典名称", trigger: "blur" }],
  dictCode: [{ required: true, message: "请输入字典编码", trigger: "blur" }],
};

/**
 * 重置表单数据和验证状态
 */
function resetForm(): void {
  dictFormRef.value?.resetFields();
  dictFormRef.value?.clearValidate();
  Object.keys(formData).forEach((key) => {
    delete (formData as Record<string, unknown>)[key];
  });
  Object.assign(formData, initialFormData);
}

/**
 * 打开字典表单弹窗
 */
function openDialog(): void {
  dialogState.visible = true;
}

/**
 * 关闭字典表单弹窗并清理临时状态
 */
function closeDialog(): void {
  dialogState.visible = false;
  resetForm();
}

/**
 * 打开新增字典弹窗
 */
function handleCreateClick(): void {
  resetForm();
  dialogState.title = "新增字典";
  openDialog();
}

/**
 * 打开编辑字典弹窗并回填数据
 *
 * @param id 字典 ID
 */
async function handleEditClick(id?: string): Promise<void> {
  if (!id) return;
  resetForm();
  dialogState.title = "修改字典";
  const data = await DictAPI.getFormData(id);
  Object.assign(formData, data);
  openDialog();
}

/**
 * 校验并提交字典表单
 */
async function handleSubmit(): Promise<void> {
  const valid = await dictFormRef.value?.validate().then(
    () => true,
    () => false
  );
  if (!valid) return;

  loading.value = true;
  try {
    const id = formData.id;
    if (id) {
      await DictAPI.update(id, formData);
      ElMessage.success("修改成功");
    } else {
      await DictAPI.create(formData);
      ElMessage.success("新增成功");
    }
    closeDialog();
    fetchTypes(formData.dictCode);
  } finally {
    loading.value = false;
  }
}

/**
 * 删除单个字典，删除后右侧联动到剩余的字典类型
 *
 * @param id 字典 ID
 */
async function handleDelete(id?: string): Promise<void> {
  if (!id) return;

  try {
    await ElMessageBox.confirm("确认删除该字典及其字典数据吗?", "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });
  } catch {
    ElMessage.info("已取消删除");
    return;
  }

  loading.value = true;
  try {
    await DictAPI.deleteByIds(id);
    ElMessage.success("删除成功");
    fetchTypes();
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchTypes();
});
</script>

<style lang="scss" scoped>
.dict-page {
  --page-aside-width: 320px;
}

.dict-page__empty {
  align-items: center;
  justify-content: center;
}

.dict-type {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  padding: 12px;

  &__list {
    flex: 1 1 auto;
    min-height: 0;
  }

  &__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 7px 8px;
    cursor: pointer;
    border-radius: 6px;
    transition: background-color 0.15s;

    &:hover {
      background-color: var(--el-fill-color-light);
    }

    &.is-active {
      background-color: var(--el-color-primary-light-9);
    }
  }

  &__info {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    min-width: 0;
    line-height: 1.35;
  }

  &__name {
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    white-space: nowrap;
  }

  &__code {
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    white-space: nowrap;
  }

  &__item.is-active &__name {
    font-weight: 600;
    color: var(--el-color-primary);
  }

  &__actions {
    flex-shrink: 0;
    margin-left: 4px;

    .el-button + .el-button {
      margin-left: 4px;
    }

    .el-button {
      padding: 0;
      opacity: 0;
      transition: opacity 0.15s;
    }
  }

  &__item:hover &__actions .el-button,
  &__item.is-active &__actions .el-button {
    opacity: 1;
  }
}
</style>
