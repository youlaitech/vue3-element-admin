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
