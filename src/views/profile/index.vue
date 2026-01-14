<template>
  <div class="profile-container">
    <el-row :gutter="20">
      <!-- 左侧个人信息卡片 -->
      <el-col :span="8">
        <el-card class="user-card">
          <div class="user-info">
            <div class="avatar-wrapper">
              <el-avatar :src="userStore.userInfo.avatar" :size="100" />
              <el-button
                type="info"
                class="avatar-edit-btn"
                circle
                :icon="Camera"
                size="small"
                @click="triggerFileUpload"
              />
              <input
                ref="fileInput"
                type="file"
                style="display: none"
                accept="image/*"
                @change="handleFileChange"
              />
            </div>
            <div class="user-name">
              <span class="nickname">{{ userProfile.nickname }}</span>
              <el-icon class="edit-icon" @click="handleOpenDialog(DialogType.ACCOUNT)">
                <Edit />
              </el-icon>
            </div>
            <div class="user-role">{{ userProfile.roleNames }}</div>
          </div>
          <el-divider />
          <div class="user-stats">
            <div class="stat-item">
              <div class="stat-value">0</div>
              <div class="stat-label">待办</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">0</div>
              <div class="stat-label">消息</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">0</div>
              <div class="stat-label">通知</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧信息卡片 -->
      <el-col :span="16">
        <el-card class="info-card">
          <template #header>
            <div class="card-header">
              <span>账号信息</span>
            </div>
          </template>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="用户名">
              {{ userProfile.username }}
              <el-icon v-if="userProfile.gender === 1" class="gender-icon male">
                <Male />
              </el-icon>
              <el-icon v-else class="gender-icon female">
                <Female />
              </el-icon>
            </el-descriptions-item>
            <el-descriptions-item label="手机号码">
              {{ userProfile.mobile || "未绑定" }}
            </el-descriptions-item>
            <el-descriptions-item label="邮箱">
              {{ userProfile.email || "未绑定" }}
            </el-descriptions-item>
            <el-descriptions-item label="部门">
              {{ userProfile.deptName }}
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">
              {{ userProfile.createTime }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <el-card class="security-card">
          <template #header>
            <div class="card-header">
              <span>安全设置</span>
            </div>
          </template>
          <div class="security-item">
            <div class="security-info">
              <div class="security-title">账户密码</div>
              <div class="security-desc">定期修改密码有助于保护账户安全</div>
            </div>
            <el-button type="primary" link @click="() => handleOpenDialog(DialogType.PASSWORD)">
              修改
            </el-button>
          </div>

          <div class="security-item">
            <div class="security-info">
              <div class="security-title">手机号</div>
              <div class="security-desc">
                {{ mobileSecurityDesc }}
              </div>
            </div>
            <div class="flex items-center gap-2">
              <el-button
                v-if="userProfile.mobile"
                type="primary"
                link
                @click="() => handleOpenDialog(DialogType.MOBILE)"
              >
                更换
              </el-button>
              <el-button v-if="userProfile.mobile" type="danger" link @click="handleUnbindMobile">
                解绑
              </el-button>
              <el-button
                v-else
                type="primary"
                link
                @click="() => handleOpenDialog(DialogType.MOBILE)"
              >
                绑定
              </el-button>
            </div>
          </div>

          <div class="security-item">
            <div class="security-info">
              <div class="security-title">邮箱</div>
              <div class="security-desc">
                {{ emailSecurityDesc }}
              </div>
            </div>
            <div class="flex items-center gap-2">
              <el-button
                v-if="userProfile.email"
                type="primary"
                link
                @click="() => handleOpenDialog(DialogType.EMAIL)"
              >
                更换
              </el-button>
              <el-button v-if="userProfile.email" type="danger" link @click="handleUnbindEmail">
                解绑
              </el-button>
              <el-button
                v-else
                type="primary"
                link
                @click="() => handleOpenDialog(DialogType.EMAIL)"
              >
                绑定
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 弹窗 -->
    <el-dialog v-model="dialog.visible" :title="dialog.title" :width="500">
      <!-- 账号资料 -->
      <el-form
        v-if="dialog.type === DialogType.ACCOUNT"
        ref="userProfileFormRef"
        :model="userProfileForm"
        :label-width="100"
      >
        <el-form-item label="昵称">
          <el-input v-model="userProfileForm.nickname" />
        </el-form-item>
        <el-form-item label="性别">
          <DictSelect v-model="userProfileForm.gender" code="gender" />
        </el-form-item>
      </el-form>

      <!-- 修改密码 -->
      <el-form
        v-if="dialog.type === DialogType.PASSWORD"
        ref="passwordChangeFormRef"
        :model="passwordChangeForm"
        :rules="passwordChangeRules"
        :label-width="100"
      >
        <el-form-item label="原密码" prop="oldPassword">
          <el-input v-model="passwordChangeForm.oldPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordChangeForm.newPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="passwordChangeForm.confirmPassword" type="password" show-password />
        </el-form-item>
      </el-form>

      <!-- 绑定手机 -->
      <el-form
        v-else-if="dialog.type === DialogType.MOBILE"
        ref="mobileBindingFormRef"
        :model="mobileUpdateForm"
        :rules="mobileBindingRules"
        :label-width="100"
      >
        <el-form-item label="手机号码" prop="mobile">
          <el-input v-model="mobileUpdateForm.mobile" style="width: 250px" />
        </el-form-item>
        <el-form-item label="验证码" prop="code">
          <el-input v-model="mobileUpdateForm.code" style="width: 250px">
            <template #append>
              <el-button :disabled="mobileCountdown > 0" @click="handleSendMobileCode">
                {{ mobileCountdown > 0 ? `${mobileCountdown}s后重新发送` : "发送验证码" }}
              </el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="当前密码" prop="password">
          <el-input
            v-model="mobileUpdateForm.password"
            type="password"
            show-password
            style="width: 250px"
          />
        </el-form-item>
      </el-form>

      <!-- 绑定邮箱 -->
      <el-form
        v-else-if="dialog.type === DialogType.EMAIL"
        ref="emailBindingFormRef"
        :model="emailUpdateForm"
        :rules="emailBindingRules"
        :label-width="100"
      >
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="emailUpdateForm.email" style="width: 250px" />
        </el-form-item>
        <el-form-item label="验证码" prop="code">
          <el-input v-model="emailUpdateForm.code" style="width: 250px">
            <template #append>
              <el-button :disabled="emailCountdown > 0" @click="handleSendEmailCode">
                {{ emailCountdown > 0 ? `${emailCountdown}s后重新发送` : "发送验证码" }}
              </el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="当前密码" prop="password">
          <el-input
            v-model="emailUpdateForm.password"
            type="password"
            show-password
            style="width: 250px"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleCancel">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import UserAPI from "@/api/system/user";
import type {
  UserProfileDetail,
  PasswordChangeForm,
  MobileUpdateForm,
  EmailUpdateForm,
  UserProfileForm,
} from "@/types/api";

import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import FileAPI from "@/api/file";
import { useUserStoreHook } from "@/store";
import { redirectToLogin } from "@/utils/auth";

import { Camera } from "@element-plus/icons-vue";

const userStore = useUserStoreHook();

const userProfile = ref<UserProfileDetail>({});

const enum DialogType {
  ACCOUNT = "account",
  PASSWORD = "password",
  MOBILE = "mobile",
  EMAIL = "email",
}

const dialog = reactive({
  visible: false,
  title: "",
  type: "" as DialogType, // 修改账号资料,修改密码、绑定手机、绑定邮箱"
});
const userProfileFormRef = ref();
const passwordChangeFormRef = ref();
const mobileBindingFormRef = ref();
const emailBindingFormRef = ref();

const userProfileForm = reactive<UserProfileForm>({});
const passwordChangeForm = reactive<PasswordChangeForm>({});
const mobileUpdateForm = reactive<MobileUpdateForm>({});
const emailUpdateForm = reactive<EmailUpdateForm>({});

const mobileCountdown = ref(0);
const mobileTimer = ref();

const emailCountdown = ref(0);
const emailTimer = ref();

// 修改密码校验规则
const passwordChangeRules = {
  oldPassword: [{ required: true, message: "请输入原密码", trigger: "blur" }],
  newPassword: [{ required: true, message: "请输入新密码", trigger: "blur" }],
  confirmPassword: [
    { required: true, message: "请再次输入新密码", trigger: "blur" },
    {
      validator: (_rule: any, value: string, callback: (error?: Error) => void) => {
        if (value !== passwordChangeForm.newPassword) {
          callback(new Error("两次输入的密码不一致"));
          return;
        }
        callback();
      },
      trigger: "blur",
    },
  ],
};

// 手机号校验规则
const mobileBindingRules = {
  mobile: [
    { required: true, message: "请输入手机号", trigger: "blur" },
    {
      pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
      message: "请输入正确的手机号码",
      trigger: "blur",
    },
  ],
  code: [{ required: true, message: "请输入验证码", trigger: "blur" }],
  password: [{ required: true, message: "请输入当前密码", trigger: "blur" }],
};

// 邮箱校验规则
const emailBindingRules = {
  email: [
    { required: true, message: "请输入邮箱", trigger: "blur" },
    {
      pattern: /\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}/,
      message: "请输入正确的邮箱地址",
      trigger: "blur",
    },
  ],
  code: [{ required: true, message: "请输入验证码", trigger: "blur" }],
  password: [{ required: true, message: "请输入当前密码", trigger: "blur" }],
};

function maskMobile(mobile?: string) {
  if (!mobile) return "";
  return mobile.replace(/^(\d{3})\d{4}(\d{4})$/, "$1****$2");
}

function maskEmail(email?: string) {
  if (!email) return "";
  const [name, domain] = email.split("@");
  if (!domain) return email;
  if (name.length <= 2) return `${name[0] || ""}***@${domain}`;
  return `${name.slice(0, 2)}***@${domain}`;
}

const mobileSecurityDesc = computed(() => {
  return userProfile.value.mobile
    ? `已绑定：${maskMobile(userProfile.value.mobile)}`
    : "未绑定手机号";
});

const emailSecurityDesc = computed(() => {
  return userProfile.value.email ? `已绑定：${maskEmail(userProfile.value.email)}` : "未绑定邮箱";
});

/**
 * 打开弹窗
 * @param type 弹窗类型 ACCOUNT: 账号资料 PASSWORD: 修改密码 MOBILE: 绑定手机 EMAIL: 绑定邮箱
 */
const handleOpenDialog = (type: DialogType) => {
  dialog.type = type;
  dialog.visible = true;
  switch (type) {
    case DialogType.ACCOUNT:
      dialog.title = "账号资料";
      // 初始化表单数据
      userProfileForm.nickname = userProfile.value.nickname;
      userProfileForm.avatar = userProfile.value.avatar;
      userProfileForm.gender = userProfile.value.gender;
      break;
    case DialogType.PASSWORD:
      dialog.title = "修改密码";
      break;
    case DialogType.MOBILE:
      dialog.title = userProfile.value.mobile ? "更换手机号" : "绑定手机号";
      mobileUpdateForm.mobile = "";
      mobileUpdateForm.code = "";
      mobileUpdateForm.password = "";
      break;
    case DialogType.EMAIL:
      dialog.title = userProfile.value.email ? "更换邮箱" : "绑定邮箱";
      emailUpdateForm.email = "";
      emailUpdateForm.code = "";
      emailUpdateForm.password = "";
      break;
  }
};

async function handleUnbindMobile() {
  if (!userProfile.value.mobile) return;
  try {
    const { value } = await ElMessageBox.prompt("请输入当前密码以解绑手机号", "解绑手机号", {
      type: "warning",
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      inputType: "password",
      inputPlaceholder: "当前密码",
      inputValidator: (val) => !!val || "请输入当前密码",
    });
    await UserAPI.unbindMobile({ password: value });
    ElMessage.success("手机号解绑成功");
    await loadUserProfile();
  } catch {
    // ignore
  }
}

async function handleUnbindEmail() {
  if (!userProfile.value.email) return;
  try {
    const { value } = await ElMessageBox.prompt("请输入当前密码以解绑邮箱", "解绑邮箱", {
      type: "warning",
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      inputType: "password",
      inputPlaceholder: "当前密码",
      inputValidator: (val) => !!val || "请输入当前密码",
    });
    await UserAPI.unbindEmail({ password: value });
    ElMessage.success("邮箱解绑成功");
    await loadUserProfile();
  } catch {
    // ignore
  }
}

/**
 * 发送手机验证码
 */
function handleSendMobileCode() {
  if (!mobileUpdateForm.mobile) {
    ElMessage.error("请输入手机号");
    return;
  }
  // 验证手机号格式
  const reg = /^1[3-9]\d{9}$/;
  if (!reg.test(mobileUpdateForm.mobile)) {
    ElMessage.error("手机号格式不正确");
    return;
  }
  // 发送短信验证码
  UserAPI.sendMobileCode(mobileUpdateForm.mobile).then(() => {
    ElMessage.success("验证码发送成功");

    // 倒计时 60s 重新发送
    mobileCountdown.value = 60;
    mobileTimer.value = setInterval(() => {
      if (mobileCountdown.value > 0) {
        mobileCountdown.value -= 1;
      } else {
        clearInterval(mobileTimer.value!);
      }
    }, 1000);
  });
}

/**
 * 发送邮箱验证码
 */
function handleSendEmailCode() {
  if (!emailUpdateForm.email) {
    ElMessage.error("请输入邮箱");
    return;
  }
  // 验证邮箱格式
  const reg = /\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}/;
  if (!reg.test(emailUpdateForm.email)) {
    ElMessage.error("邮箱格式不正确");
    return;
  }

  // 发送邮箱验证码
  UserAPI.sendEmailCode(emailUpdateForm.email).then(() => {
    ElMessage.success("验证码发送成功");
    // 倒计时 60s 重新发送
    emailCountdown.value = 60;
    emailTimer.value = setInterval(() => {
      if (emailCountdown.value > 0) {
        emailCountdown.value -= 1;
      } else {
        clearInterval(emailTimer.value!);
      }
    }, 1000);
  });
}

/**
 * 提交表单
 */
const handleSubmit = async () => {
  try {
    if (dialog.type === DialogType.ACCOUNT) {
      const valid = await userProfileFormRef.value?.validate();
      if (!valid) return;

      await UserAPI.updateProfile(userProfileForm);
      ElMessage.success("账号资料修改成功");
      dialog.visible = false;
      await loadUserProfile();
    } else if (dialog.type === DialogType.PASSWORD) {
      const valid = await passwordChangeFormRef.value?.validate();
      if (!valid) return;

      await UserAPI.changePassword(passwordChangeForm);
      dialog.visible = false;
      await redirectToLogin("密码已修改，请重新登录");
    } else if (dialog.type === DialogType.MOBILE) {
      const valid = await mobileBindingFormRef.value?.validate();
      if (!valid) return;

      await UserAPI.bindOrChangeMobile(mobileUpdateForm);
      ElMessage.success(userProfile.value.mobile ? "手机号更换成功" : "手机号绑定成功");
      dialog.visible = false;
      await loadUserProfile();
    } else if (dialog.type === DialogType.EMAIL) {
      const valid = await emailBindingFormRef.value?.validate();
      if (!valid) return;

      await UserAPI.bindOrChangeEmail(emailUpdateForm);
      ElMessage.success(userProfile.value.email ? "邮箱更换成功" : "邮箱绑定成功");
      dialog.visible = false;
      await loadUserProfile();
    }
  } catch {
    // ignore
  }
};

/**
 * 取消
 */
const handleCancel = () => {
  dialog.visible = false;
  if (dialog.type === DialogType.ACCOUNT) {
    userProfileFormRef.value?.resetFields();
  } else if (dialog.type === DialogType.PASSWORD) {
    passwordChangeFormRef.value?.resetFields();
  } else if (dialog.type === DialogType.MOBILE) {
    mobileBindingFormRef.value?.resetFields();
  } else if (dialog.type === DialogType.EMAIL) {
    emailBindingFormRef.value?.resetFields();
  }
};

const fileInput = ref<HTMLInputElement | null>(null);

const triggerFileUpload = () => {
  fileInput.value?.click();
};

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files ? target.files[0] : null;
  if (file) {
    // 调用文件上传API
    try {
      const data = await FileAPI.uploadFile(file);
      // 更新用户信息
      await UserAPI.updateProfile({
        avatar: data.url,
      });
      // 更新用户头像
      userStore.userInfo.avatar = data.url;
    } catch (error) {
      console.error("头像上传失败：" + error);
      ElMessage.error("头像上传失败");
    }
  }
};

/** 加载用户信息 */
const loadUserProfile = async () => {
  const data = await UserAPI.getProfile();
  userProfile.value = data;
};

onMounted(async () => {
  if (mobileTimer.value) {
    clearInterval(mobileTimer.value);
  }
  if (emailTimer.value) {
    clearInterval(emailTimer.value);
  }
  await loadUserProfile();
});

onBeforeUnmount(() => {
  if (mobileTimer.value) {
    clearInterval(mobileTimer.value);
  }
  if (emailTimer.value) {
    clearInterval(emailTimer.value);
  }
});
</script>

<style lang="scss" scoped>
.profile-container {
  min-height: calc(100vh - 84px);
  padding: 20px;
  background: var(--el-fill-color-blank);
}

.user-card {
  .user-info {
    padding: 20px 0;
    text-align: center;

    .avatar-wrapper {
      position: relative;
      display: inline-block;
      margin-bottom: 16px;

      .avatar-edit-btn {
        position: absolute;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        border: none;
        transition: all 0.3s ease;

        &:hover {
          background: rgba(0, 0, 0, 0.7);
        }
      }
    }

    .user-name {
      margin-bottom: 8px;

      .nickname {
        font-size: 18px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }

      .edit-icon {
        margin-left: 8px;
        color: var(--el-text-color-secondary);
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover {
          color: var(--el-color-primary);
        }
      }
    }

    .user-role {
      font-size: 14px;
      color: var(--el-text-color-secondary);
    }
  }

  .user-stats {
    display: flex;
    justify-content: space-around;
    padding: 16px 0;

    .stat-item {
      text-align: center;

      .stat-value {
        font-size: 20px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }

      .stat-label {
        margin-top: 4px;
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }
    }
  }
}

.info-card,
.security-card {
  margin-bottom: 20px;

  .card-header {
    font-size: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
}

.security-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;

  .security-info {
    .security-title {
      margin-bottom: 4px;
      font-size: 16px;
      font-weight: 500;
      color: var(--el-text-color-primary);
    }

    .security-desc {
      font-size: 14px;
      color: var(--el-text-color-secondary);
    }
  }
}

.el-descriptions {
  .el-descriptions__label {
    font-weight: 500;
    color: var(--el-text-color-regular);
  }

  .el-descriptions__content {
    color: var(--el-text-color-primary);
  }

  .gender-icon {
    margin-left: 8px;
    font-size: 16px;

    &.male {
      color: #409eff;
    }

    &.female {
      color: #f56c6c;
    }
  }
}

.el-dialog {
  .el-dialog__header {
    padding: 20px;
    margin: 0;
    border-bottom: 1px solid var(--el-border-color-light);
  }

  .el-dialog__body {
    padding: 30px 20px;
  }

  .el-dialog__footer {
    padding: 20px;
    border-top: 1px solid var(--el-border-color-light);
  }
}

// 响应式适配
@media (max-width: 768px) {
  .profile-container {
    padding: 10px;
  }

  .el-col {
    width: 100%;
  }
}
</style>
