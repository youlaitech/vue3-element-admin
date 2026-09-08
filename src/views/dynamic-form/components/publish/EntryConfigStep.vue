<template>
  <div class="entry-config">
    <!-- 系统内嵌分区 -->
    <EntrySection v-if="showMenu" kind="menu" title="系统内嵌" sub="登录后侧边栏菜单进入">
      <el-form
        ref="menuFormRef"
        :model="menuForm"
        :rules="rules"
        label-width="80px"
        class="entry-section__form"
      >
        <el-form-item label="菜单名称" prop="menuName">
          <el-input
            v-model="menuForm.menuName"
            placeholder="侧边栏展示名称"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>

        <el-form-item prop="parentId">
          <template #label>
            <div class="flex-y-center">
              上级菜单
              <el-tooltip placement="bottom">
                <template #content>
                  留空时后端自动创建"表单中心"目录（挂在"动态表单"下）；仅目录类型可选
                </template>
                <el-icon class="ml-1 cursor-pointer">
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </div>
          </template>
          <el-tree-select
            v-model="menuForm.parentId"
            placeholder="留空默认：表单中心"
            :data="catalogTree"
            filterable
            clearable
            check-strictly
            :render-after-expand="false"
            class="!w-full"
          />
        </el-form-item>

        <el-form-item prop="roleIds">
          <template #label>
            <div class="flex-y-center">
              可见角色
              <el-tooltip content="授权后无需再去角色管理分配菜单" placement="bottom">
                <el-icon class="ml-1 cursor-pointer">
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </div>
          </template>
          <el-select
            v-model="menuForm.roleIds"
            multiple
            collapse-tags
            collapse-tags-tooltip
            clearable
            filterable
            placeholder="不选时仅超级管理员可见"
            class="!w-full"
          >
            <el-option
              v-for="role in roleOptions"
              :key="role.value"
              :label="role.label"
              :value="role.value"
            />
            <template #header>
              <div class="role-select__header">
                <el-button link size="small" @click="handleSelectAllRoles">全选</el-button>
                <span class="role-select__count">
                  {{ menuForm.roleIds?.length ?? 0 }}/{{ roleOptions.length }}
                </span>
              </div>
            </template>
          </el-select>
        </el-form-item>
      </el-form>
    </EntrySection>

    <!-- 对外分享分区 -->
    <EntrySection v-if="showShare" kind="share" title="对外分享" sub="匿名链接/二维码进入">
      <el-form label-width="80px" class="entry-section__form">
        <el-form-item>
          <template #label>
            <div class="flex-y-center">
              公开访问
              <el-tooltip
                content="开启后可通过链接匿名填写；关闭后已发出去的链接立即失效"
                placement="bottom"
              >
                <el-icon class="ml-1 cursor-pointer">
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </div>
          </template>
          <el-switch v-model="shareEnabled" />
        </el-form-item>

        <el-form-item v-if="shareEnabled">
          <template #label>
            <div class="flex-y-center">
              分享链接
              <el-tooltip
                content="公开链接无需登录即可提交，请勿在表单中收集敏感信息（如密码）"
                placement="bottom"
              >
                <el-icon class="ml-1 cursor-pointer">
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </div>
          </template>
          <el-input :model-value="shareUrl" readonly size="default">
            <template #append>
              <el-button @click="emit('copy')">复制</el-button>
            </template>
          </el-input>
        </el-form-item>
      </el-form>
    </EntrySection>
  </div>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from "element-plus";
import { QuestionFilled } from "@element-plus/icons-vue";

import type { FormMenuFormData } from "@/api/form";
import type { OptionItem } from "@/api/common";
import EntrySection from "./EntrySection.vue";
import type { CatalogNode } from "./types";

defineOptions({
  name: "FormPublishEntryConfigStep",
});

/**
 * 入口配置（向导第②步）
 *
 * @description 菜单入口（名称/目录/角色）与公开分享开关的表单分区；
 * 表单数据与开关由容器持有（defineModel 双向绑定），校验能力通过 expose 提供给容器保存前调用
 */
const props = defineProps<{
  /** 是否展示菜单入口配置块 */
  showMenu: boolean;
  /** 是否展示分享配置块 */
  showShare: boolean;
  /** 目录树（el-tree-select 数据源） */
  catalogTree: CatalogNode[];
  /** 角色选项 */
  roleOptions: OptionItem[];
  /** 分享链接 */
  shareUrl: string;
}>();

const emit = defineEmits<{
  /** 复制分享链接（统一由容器执行剪贴板写入与提示） */
  copy: [];
}>();

const menuForm = defineModel<FormMenuFormData>("menuForm", { required: true });
const shareEnabled = defineModel<boolean>("shareEnabled", { required: true });

const menuFormRef = ref<FormInstance>();

/** 菜单表单校验规则：菜单名称必填；上级菜单留空 = 默认目录"表单中心"（后端自动创建） */
const rules = computed<FormRules<FormMenuFormData>>(() =>
  props.showMenu
    ? {
        menuName: [{ required: true, message: "请输入菜单名称", trigger: "blur" }],
      }
    : {}
);

/** 角色全选（多选下拉 header 快捷操作） */
function handleSelectAllRoles(): void {
  menuForm.value.roleIds = props.roleOptions.map((role) => String(role.value));
}

/**
 * 校验菜单表单（容器保存前调用）
 *
 * @return 校验是否通过；未配置菜单入口时恒通过
 */
function validate(): Promise<boolean> {
  if (!props.showMenu || !menuFormRef.value) {
    return Promise.resolve(true);
  }
  return menuFormRef.value.validate().then(
    () => true,
    () => false
  );
}

defineExpose({ validate });
</script>

<style lang="scss" scoped>
.entry-config {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px 16px 0;
}

.entry-section__form {
  padding: 16px 14px 0;
}

/* 角色多选下拉 header：全选 + 计数 */
.role-select__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 8px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.role-select__count {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
