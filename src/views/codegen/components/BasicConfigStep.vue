<template>
  <div class="basic-config-step">
    <!-- 表信息 -->
    <section class="config-section">
      <div class="section-header">
        <el-icon class="section-icon icon-table"><Document /></el-icon>
        <span class="section-title">表信息</span>
        <span class="section-subtitle">数据库表名与业务映射</span>
      </div>
      <el-form :model="formData" :rules="rules" :label-width="100" class="config-form">
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="表名" prop="tableName">
              <el-input v-model="formData.tableName" readonly>
                <template #prefix>
                  <el-icon><Document /></el-icon>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="业务名" prop="businessName">
              <el-input v-model="formData.businessName" placeholder="如：用户管理">
                <template #prefix>
                  <el-icon><OfficeBuilding /></el-icon>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </section>

    <!-- 包信息 -->
    <section class="config-section">
      <div class="section-header">
        <el-icon class="section-icon icon-package"><Box /></el-icon>
        <span class="section-title">包信息</span>
        <span class="section-subtitle">Java 包结构与模块划分</span>
      </div>
      <el-form :model="formData" :rules="rules" :label-width="100" class="config-form">
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="主包名" prop="packageName">
              <el-input v-model="formData.packageName" placeholder="com.youlai.boot">
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
    </section>

    <!-- 生成配置 -->
    <section class="config-section">
      <div class="section-header">
        <el-icon class="section-icon icon-gen"><MagicStick /></el-icon>
        <span class="section-title">生成配置</span>
        <span class="section-subtitle">代码生成规则与输出选项</span>
      </div>
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        :label-width="100"
        class="config-form"
      >
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="实体名" prop="entityName">
              <el-input v-model="formData.entityName" placeholder="User">
                <template #prefix>
                  <el-icon><Coin /></el-icon>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="作者">
              <el-input v-model="formData.author" placeholder="youlai">
                <template #prefix>
                  <el-icon><User /></el-icon>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="移除表前缀">
              <el-input v-model="formData.removeTablePrefix" placeholder="如: sys_">
                <template #prefix>
                  <el-icon><Delete /></el-icon>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="页面类型">
              <el-radio-group v-model="formData.pageType">
                <el-radio-button value="classic">
                  <el-icon><DocumentChecked /></el-icon>
                  普通
                </el-radio-button>
                <el-radio-button value="crud">
                  <el-icon><SetUp /></el-icon>
                  封装(CRUD)
                </el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :span="12">
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
    </section>
  </div>
</template>

<script setup lang="ts">
import type { GenConfigForm } from "@/api/codegen";
import type { OptionItem } from "@/api/common";

const formData = defineModel<GenConfigForm>({ required: true });

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

/**
 * 校验基础配置表单
 */
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
  padding: 8px;

  .config-section + .config-section {
    padding-top: 24px;
    margin-top: 24px;
    border-top: 1px solid var(--el-border-color-lighter);
  }

  .section-header {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 16px;
  }

  .section-icon {
    font-size: 16px;

    &.icon-table {
      color: var(--el-color-primary);
    }
    &.icon-package {
      color: var(--el-color-success);
    }
    &.icon-gen {
      color: var(--el-color-warning);
    }
  }

  .section-title {
    font-size: 15px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .section-subtitle {
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  .config-form {
    :deep(.el-input__prefix-inner) {
      color: var(--el-text-color-secondary);
    }

    // 与默认输入框高度对齐，之前 10px 内边距把按钮撑得比输入框高
    :deep(.el-radio-button__inner) {
      display: inline-flex;
      gap: 4px;
      align-items: center;
      padding: 6px 14px;
    }
  }
}
</style>
