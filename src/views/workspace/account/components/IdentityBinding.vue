<!-- 个人中心的认证身份绑定：当前用户自助绑定/解绑，不做权限控制 -->
<template>
  <div v-loading="isLoading" class="identity-binding">
    <el-alert v-if="loadFailed" type="error" :closable="false" title="身份信息加载失败，请重试">
      <el-button link type="primary" @click="loadIdentity">重新加载</el-button>
    </el-alert>

    <template v-else>
      <el-descriptions :column="1" size="small">
        <el-descriptions-item label="认证中心">
          <span class="identity-binding__value">{{ issuer || "—" }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="绑定状态">
          <el-tag :type="subject ? 'success' : 'info'" size="small" effect="plain">
            {{ subject ? "已绑定" : "未绑定" }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        @submit.prevent="saveIdentity"
      >
        <el-form-item label="身份标识（sub）" prop="subject">
          <el-input
            v-model="form.subject"
            :maxlength="255"
            placeholder="填写认证中心的用户标识"
            aria-describedby="identity-binding-help"
          />
          <div id="identity-binding-help" class="identity-binding__tip">
            请先通过统一认证登录，再复制未绑定提示页中的身份标识。不要填写用户名或客户端 ID。
          </div>
        </el-form-item>
      </el-form>

      <div class="identity-binding__actions">
        <el-button
          v-if="subject"
          type="danger"
          link
          :disabled="isSubmitting"
          @click="removeIdentity"
        >
          解除绑定
        </el-button>
        <el-button type="primary" :loading="isSubmitting" @click="saveIdentity">保存</el-button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from "element-plus";
import IdentityAPI from "@/api/auth/identity";
import { useUserStore } from "@/stores/user";

defineOptions({ name: "IdentityBinding" });

const userStore = useUserStore();
const formRef = ref<FormInstance>();
const form = reactive({ subject: "" });
const issuer = ref("");
const subject = ref("");
const isLoading = ref(false);
const isSubmitting = ref(false);
const loadFailed = ref(false);

const rules: FormRules<typeof form> = {
  subject: [
    { required: true, whitespace: true, message: "请填写身份标识", trigger: "blur" },
    { max: 255, message: "身份标识不能超过 255 个字符", trigger: "blur" },
  ],
};

/**
 * 读取当前用户在认证中心的身份。
 */
async function loadIdentity(): Promise<void> {
  const userId = userStore.userInfo.userId;
  if (!userId) return;
  isLoading.value = true;
  loadFailed.value = false;
  try {
    const identity = await IdentityAPI.get(userId);
    issuer.value = identity.issuer;
    subject.value = identity.subject ?? "";
    form.subject = subject.value;
  } catch {
    loadFailed.value = true;
  } finally {
    isLoading.value = false;
  }
}

/**
 * 保存当前用户的身份绑定。
 */
async function saveIdentity(): Promise<void> {
  const userId = userStore.userInfo.userId;
  if (!userId || isSubmitting.value || loadFailed.value || !issuer.value) return;
  // 身份标识按原值提交，保留大小写与空格，不自动 trim。
  const value = form.subject;
  isSubmitting.value = true;
  try {
    const valid = await formRef.value?.validate().then(
      () => true,
      () => false
    );
    if (!valid) return;

    await IdentityAPI.set(userId, { subject: value });
    subject.value = value;
    ElMessage.success("身份绑定已保存，重新登录后生效");
  } catch {
    // 请求层已提示错误，保留输入供用户修正。
  } finally {
    isSubmitting.value = false;
  }
}

/**
 * 确认后解除当前用户的身份绑定。
 */
async function removeIdentity(): Promise<void> {
  const userId = userStore.userInfo.userId;
  if (!userId || !subject.value || isSubmitting.value) return;
  isSubmitting.value = true;
  try {
    const confirmed = await ElMessageBox.confirm(
      "确认解除统一认证身份吗？现有会话也会失效。",
      "解除绑定",
      { type: "warning" }
    ).then(
      () => true,
      () => false
    );
    if (!confirmed) return;

    await IdentityAPI.remove(userId);
    subject.value = "";
    form.subject = "";
    ElMessage.success("身份绑定已解除，重新登录后生效");
  } catch {
    // 失败时保留已加载的绑定。
  } finally {
    isSubmitting.value = false;
  }
}

onMounted(loadIdentity);
</script>

<style scoped lang="scss">
.identity-binding {
  &__value {
    overflow-wrap: anywhere;
  }

  &__tip {
    margin-top: 8px;
    font-size: 12px;
    line-height: 1.5;
    color: var(--el-text-color-secondary);
  }

  &__actions {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: flex-end;
  }
}
</style>
