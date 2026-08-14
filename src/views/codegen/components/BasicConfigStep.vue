<template>
  <div class="basic-config-step">
    <!-- 表信息卡片 -->
    <div class="config-card">
      <div class="card-header">
        <div class="header-icon icon-table">
          <el-icon><Grid /></el-icon>
        </div>
        <div class="header-title">
          <div class="title">表信息</div>
          <div class="subtitle">数据库表名与业务映射</div>
        </div>
      </div>
      <el-form :model="formData" :rules="rules" :label-width="80" class="card-form">
        <el-row :gutter="16">
          <el-col :span="6">
            <el-form-item label="表名" prop="tableName">
              <el-input v-model="formData.tableName" readonly>
                <template #prefix>
                  <el-icon><Document /></el-icon>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="业务名" prop="businessName">
              <el-input v-model="formData.businessName" placeholder="如：用户管理">
                <template #prefix>
                  <el-icon><OfficeBuilding /></el-icon>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="默认名称">
              <el-select
                v-model="formData.defaultNameColumn"
                clearable
                placeholder="请选择名称字段"
                style="width: 100%"
              >
                <el-option
                  v-for="item in fieldOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="默认排序">
              <el-select
                v-model="formData.defaultSortColumn"
                clearable
                placeholder="请选择排序字段"
                style="width: 100%"
              >
                <el-option
                  v-for="item in fieldOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="6">
            <el-form-item label="方式">
              <el-select
                v-model="formData.defaultSortOrder"
                clearable
                placeholder="请选择排序方式"
                style="width: 100%"
              >
                <el-option label="正排" value="asc" />
                <el-option label="倒排" value="desc" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <!-- 生成配置卡片 -->
    <div class="config-card">
      <div class="card-header">
        <div class="header-icon icon-gen">
          <el-icon><MagicStick /></el-icon>
        </div>
        <div class="header-title">
          <div class="title">生成配置</div>
          <div class="subtitle">代码生成规则与输出选项</div>
        </div>
      </div>
      <el-form ref="formRef" :model="formData" :rules="rules" :label-width="80" class="card-form">
        <el-row :gutter="16">
          <el-col :span="6">
            <el-form-item label="实体名" prop="entityName">
              <el-input v-model="formData.entityName" placeholder="User">
                <template #prefix>
                  <el-icon><Coin /></el-icon>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="作者">
              <el-input v-model="formData.author" placeholder="youlai">
                <template #prefix>
                  <el-icon><User /></el-icon>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="移除表前缀">
              <el-input v-model="formData.removeTablePrefix" placeholder="如: sys_">
                <template #prefix>
                  <el-icon><Delete /></el-icon>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="页面类型">
              <el-radio-group v-model="formData.pageType" size="large">
                <el-radio-button value="classic">普通</el-radio-button>
                <el-radio-button value="curd">封装(CURD)</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="6">
            <el-form-item>
              <template #label>
                <div class="flex items-center gap-2">
                  <span>上级菜单</span>
                  <el-tooltip effect="dark" placement="top">
                    <template #content>
                      <div style="max-width: 280px; line-height: 1.8">
                        选择上级菜单，生成代码后会自动创建对应菜单。
                        <br />
                        注意：生成菜单后需分配权限给角色，否则菜单将无法显示。
                      </div>
                    </template>
                    <el-icon class="cursor-pointer text-gray-400 hover:text-primary">
                      <QuestionFilled />
                    </el-icon>
                  </el-tooltip>
                </div>
              </template>
              <el-tree-select
                v-model="formData.parentMenuId"
                placeholder="选择上级菜单"
                :data="menuOptions"
                check-strictly
                :render-after-expand="false"
                filterable
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <!-- 视图配置卡片 -->
    <div class="config-card">
      <div class="card-header">
        <div class="header-icon icon-view">
          <el-icon><Monitor /></el-icon>
        </div>
        <div class="header-title">
          <div class="title">视图配置</div>
          <div class="subtitle">页面视图添加与配置</div>
        </div>
      </div>
      <el-form :model="formData" :rules="rules" :label-width="80" class="card-form">
        <el-row :gutter="16">
          <el-col :span="6">
            <el-form-item>
              <el-button type="primary" plain @click="handleAddView('列表视图')">
                <el-icon><List /></el-icon>
                添加列表视图
              </el-button>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item>
              <el-button type="primary" plain @click="handleAddView('表单视图')">
                <el-icon><EditPen /></el-icon>
                添加表单视图
              </el-button>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item>
              <el-button type="primary" plain @click="handleAddView('搜索视图')">
                <el-icon><Search /></el-icon>
                添加搜索视图
              </el-button>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item>
              <el-button type="primary" plain @click="handleAddView('导出视图')">
                <el-icon><Download /></el-icon>
                添加导出视图
              </el-button>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="6">
            <el-form-item>
              <el-button type="primary" plain @click="handleAddView('打印视图')">
                <el-icon><Printer /></el-icon>
                添加打印视图
              </el-button>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item>
              <el-button type="primary" plain @click="handleAddView('报表视图')">
                <el-icon><DataAnalysis /></el-icon>
                添加报表视图
              </el-button>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item>
              <el-button type="primary" plain @click="handleAddView('图表视图')">
                <el-icon><PieChart /></el-icon>
                添加图表视图
              </el-button>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item>
              <el-button type="primary" plain @click="handleAddView('看板视图')">
                <el-icon><Odometer /></el-icon>
                添加看板视图
              </el-button>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="6">
            <el-form-item label="视图">
              <el-select v-model="viewType" style="width: 100%">
                <el-option
                  v-for="item in viewTypeOptions"
                  :key="item"
                  :label="item"
                  :value="item"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <!-- 关系配置卡片 -->
    <div class="config-card">
      <div class="card-header">
        <div class="header-icon icon-relation">
          <el-icon><Connection /></el-icon>
        </div>
        <div class="header-title">
          <div class="title">关系配置</div>
          <div class="subtitle">表关系与字段关联配置</div>
        </div>
      </div>
      <el-form :model="formData" :rules="rules" :label-width="80" class="card-form">
        <el-row :gutter="16">
          <el-col :span="6">
            <el-form-item label="关联表">
              <el-select
                v-model="selectedRelationTable"
                clearable
                filterable
                placeholder="请选择关联表"
                style="width: 100%"
              >
                <el-option
                  v-for="item in tableOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item>
              <el-button
                type="primary"
                :disabled="!selectedRelationTable"
                @click="handleAddRelation"
              >
                <el-icon><Plus /></el-icon>
                添加
              </el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <!-- 确认添加多对多关系对话框 -->
      <el-dialog v-model="confirmVisible" title="添加多对多关系" width="420px" align-center>
        <div>
          是否添加表
          <strong>{{ selectedRelationTable }}</strong>
          建立多对多关系？
        </div>
        <template #footer>
          <el-button @click="confirmVisible = false">否</el-button>
          <el-button type="primary" @click="handleConfirmRelation">是</el-button>
        </template>
      </el-dialog>

      <!-- 多对多关系配置对话框（待完善） -->
      <el-dialog v-model="relationConfigVisible" title="多对多关系配置" width="600px" align-center>
        <div class="text-sm text-gray-500">多对多关系配置功能待完善。</div>
        <template #footer>
          <el-button @click="relationConfigVisible = false">关闭</el-button>
        </template>
      </el-dialog>
    </div>

    <!-- 包信息卡片 -->
    <div class="config-card">
      <div class="card-header">
        <div class="header-icon icon-package">
          <el-icon><Box /></el-icon>
        </div>
        <div class="header-title">
          <div class="title">包信息</div>
          <div class="subtitle">Java 包结构与模块划分</div>
        </div>
      </div>
      <el-form :model="formData" :rules="rules" :label-width="80" class="card-form">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="主包名" prop="packageName">
              <el-input v-model="formData.packageName" placeholder="com.youlai.vadmin">
                <template #prefix>
                  <el-icon><Folder /></el-icon>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="模块名" prop="moduleName">
              <el-input v-model="formData.moduleName" placeholder="system">
                <template #prefix>
                  <el-icon><Collection /></el-icon>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import GeneratorAPI from "@/api/codegen";
import type { GenConfigForm } from "@/api/codegen";
import type { OptionItem } from "@/api/common";

const formData = defineModel<GenConfigForm>({ required: true });

/** 表中所有字段选项（用于默认排序下拉） */
const fieldOptions = computed<OptionItem[]>(() =>
  (formData.value?.fieldConfigs || []).map((field) => ({
    value: field.columnName || "",
    label: field.columnName || "",
  }))
);

// 默认值逻辑：默认名称字段默认选中 name、默认排序字段默认选中 id（仅未配置时生效）
watch(
  () => formData.value?.fieldConfigs,
  (list) => {
    if (!list || !list.length) return;
    const columns = list.map((field) => field.columnName);
    const form = formData.value;
    if (!form) return;
    if (!form.defaultNameColumn && columns.includes("name")) {
      form.defaultNameColumn = "name";
    }
    if (!form.defaultSortColumn && columns.includes("id")) {
      form.defaultSortColumn = "id";
    }
  },
  { deep: true, immediate: true }
);

defineProps<{
  menuOptions: OptionItem[];
}>();

const formRef = ref();

/** 关系配置：选中的关联表 */
const selectedRelationTable = ref("");
/** 确认添加多对多关系对话框可见性 */
const confirmVisible = ref(false);
/** 多对多关系配置对话框可见性 */
const relationConfigVisible = ref(false);

/** 关联表选项（值=表名，标签=描述(表名)） */
const tableOptions = ref<OptionItem[]>([]);

/** 加载表列表，供关系配置选择关联表 */
async function loadTableOptions() {
  try {
    const { list } = await GeneratorAPI.getTablePage({ pageNum: 1, pageSize: 1000 });
    tableOptions.value = list.map((item) => ({
      value: item.tableName,
      label: item.tableComment ? `${item.tableComment}(${item.tableName})` : item.tableName,
    }));
  } catch {
    tableOptions.value = [];
  }
}

onMounted(loadTableOptions);

/** 点击"添加"：弹出确认对话框 */
function handleAddRelation() {
  if (!selectedRelationTable.value) return;
  confirmVisible.value = true;
}

/** 确认框点"是"：关闭确认框，弹出关系配置对话框（待完善） */
function handleConfirmRelation() {
  confirmVisible.value = false;
  relationConfigVisible.value = true;
}

/** 添加视图（暂无接口，仅提示） */
function handleAddView(viewName: string) {
  ElMessage.info(`添加${viewName}功能正在完成中`);
}

/** 视图类型选项 */
const viewTypeOptions = [
  "列表视图",
  "表单视图",
  "搜索视图",
  "导出视图",
  "打印视图",
  "报表视图",
  "图表视图",
  "看板视图",
];
/** 当前选中的视图类型（默认列表视图） */
const viewType = ref("列表视图");

const rules = {
  tableName: [{ required: true, message: "请输入表名", trigger: "blur" }],
  businessName: [{ required: true, message: "请输入业务名", trigger: "blur" }],
  packageName: [{ required: true, message: "请输入主包名", trigger: "blur" }],
  moduleName: [{ required: true, message: "请输入模块名", trigger: "blur" }],
  entityName: [{ required: true, message: "请输入实体名", trigger: "blur" }],
};

async function validate(): Promise<boolean> {
  try {
    await formRef.value?.validate();
    return true;
  } catch {
    return false;
  }
}

defineExpose({ validate });
</script>

<style scoped lang="scss">
.basic-config-step {
  padding: 4px;

  .config-card {
    padding: 16px;
    margin-bottom: 12px;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 10px;
    transition: all 0.3s ease;

    &:hover {
      border-color: var(--el-border-color);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
    }

    .card-header {
      display: flex;
      gap: 10px;
      align-items: center;
      padding-bottom: 10px;
      margin-bottom: 12px;
      border-bottom: 1px solid var(--el-border-color-lighter);

      .header-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        font-size: 16px;
        border-radius: 8px;
        transition: transform 0.3s ease;

        &.icon-table {
          color: var(--el-color-primary);
          background: linear-gradient(
            135deg,
            var(--el-color-primary-light-8),
            var(--el-color-primary-light-9)
          );
        }
        &.icon-package {
          color: var(--el-color-success);
          background: linear-gradient(
            135deg,
            var(--el-color-success-light-8),
            var(--el-color-success-light-9)
          );
        }
        &.icon-gen {
          color: var(--el-color-warning);
          background: linear-gradient(
            135deg,
            var(--el-color-warning-light-8),
            var(--el-color-warning-light-9)
          );
        }
        &.icon-relation {
          color: var(--el-color-danger);
          background: linear-gradient(
            135deg,
            var(--el-color-danger-light-8),
            var(--el-color-danger-light-9)
          );
        }
        &.icon-view {
          color: var(--el-color-info);
          background: linear-gradient(
            135deg,
            var(--el-color-info-light-8),
            var(--el-color-info-light-9)
          );
        }
      }

      &:hover .header-icon {
        transform: scale(1.08) rotate(-3deg);
      }

      .header-title {
        display: flex;
        gap: 8px;
        align-items: baseline;

        .title {
          font-size: 15px;
          font-weight: 600;
          color: var(--el-text-color-primary);
        }
        .subtitle {
          font-size: 12px;
          color: var(--el-text-color-secondary);
        }
      }
    }

    .card-form {
      :deep(.el-form-item) {
        margin-bottom: 14px;
      }

      :deep(.el-input__prefix-inner) {
        color: var(--el-text-color-secondary);
      }

      :deep(.el-radio-button__inner) {
        display: inline-flex;
        gap: 4px;
        align-items: center;
        padding: 7px 14px;
      }
    }
  }
}
</style>
