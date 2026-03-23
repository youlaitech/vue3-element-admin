<template>
  <div class="p-4">
    <el-row :gutter="20">
      <!-- 左侧个人信息卡片 -->
      <el-col :xs="24" :sm="24" :md="8" :lg="6">
        <div class="left-column">
          <!-- 用户信息卡片 -->
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

              <el-descriptions :column="1" size="small" border class="profile-desc">
                <el-descriptions-item>
                  <template #label>
                    <div class="cell-item">
                      <el-icon><User /></el-icon>
                      用户名
                    </div>
                  </template>
                  <span>{{ userProfile.username }}</span>
                  <el-icon v-if="userProfile.gender === 1" class="gender-icon male">
                    <Male />
                  </el-icon>
                  <el-icon v-else class="gender-icon female"><Female /></el-icon>
                </el-descriptions-item>
                <el-descriptions-item>
                  <template #label>
                    <div class="cell-item">
                      <el-icon><Iphone /></el-icon>
                      手机号码
                    </div>
                  </template>
                  <span :class="{ 'text-muted': !userProfile.mobile }">
                    {{ userProfile.mobile || "未绑定" }}
                  </span>
                </el-descriptions-item>
                <el-descriptions-item>
                  <template #label>
                    <div class="cell-item">
                      <el-icon><Message /></el-icon>
                      邮箱
                    </div>
                  </template>
                  <span :class="{ 'text-muted': !userProfile.email }">
                    {{ userProfile.email || "未绑定" }}
                  </span>
                </el-descriptions-item>
                <el-descriptions-item>
                  <template #label>
                    <div class="cell-item">
                      <el-icon><OfficeBuilding /></el-icon>
                      部门
                    </div>
                  </template>
                  {{ userProfile.deptName || "-" }}
                </el-descriptions-item>
                <el-descriptions-item>
                  <template #label>
                    <div class="cell-item">
                      <el-icon><Timer /></el-icon>
                      创建时间
                    </div>
                  </template>
                  {{ userProfile.createTime }}
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </el-card>
        </div>
      </el-col>

      <!-- 右侧信息卡片 -->
      <el-col :xs="24" :sm="24" :md="16" :lg="18">
        <div class="right-column">
          <!-- 安全设置卡片 -->
          <el-card class="security-card">
            <template #header>
              <div class="card-header">
                <span class="card-header-title">
                  <el-icon><Key /></el-icon>
                  安全设置
                </span>
              </div>
            </template>
            <div class="security-list">
              <div class="security-item">
                <div class="security-left">
                  <div class="security-icon password">
                    <el-icon><Lock /></el-icon>
                  </div>
                  <div class="security-content">
                    <div class="security-title">账户密码</div>
                    <div class="security-desc">定期修改密码有助于保护账户安全</div>
                  </div>
                </div>
                <el-button type="primary" link @click="handleOpenDialog(DialogType.PASSWORD)">
                  修改
                </el-button>
              </div>

              <div class="security-item">
                <div class="security-left">
                  <div class="security-icon mobile">
                    <el-icon><Iphone /></el-icon>
                  </div>
                  <div class="security-content">
                    <div class="security-title">手机号</div>
                    <div class="security-desc">{{ mobileSecurityDesc }}</div>
                  </div>
                </div>
                <div class="security-actions">
                  <el-button
                    v-if="userProfile.mobile"
                    type="primary"
                    link
                    @click="handleOpenDialog(DialogType.MOBILE)"
                  >
                    更换
                  </el-button>
                  <el-button
                    v-if="userProfile.mobile"
                    type="danger"
                    link
                    @click="handleUnbindMobile"
                  >
                    解绑
                  </el-button>
                  <el-button
                    v-else
                    type="primary"
                    link
                    @click="handleOpenDialog(DialogType.MOBILE)"
                  >
                    绑定
                  </el-button>
                </div>
              </div>

              <div class="security-item">
                <div class="security-left">
                  <div class="security-icon email">
                    <el-icon><Message /></el-icon>
                  </div>
                  <div class="security-content">
                    <div class="security-title">邮箱</div>
                    <div class="security-desc">{{ emailSecurityDesc }}</div>
                  </div>
                </div>
                <div class="security-actions">
                  <el-button
                    v-if="userProfile.email"
                    type="primary"
                    link
                    @click="handleOpenDialog(DialogType.EMAIL)"
                  >
                    更换
                  </el-button>
                  <el-button v-if="userProfile.email" type="danger" link @click="handleUnbindEmail">
                    解绑
                  </el-button>
                  <el-button v-else type="primary" link @click="handleOpenDialog(DialogType.EMAIL)">
                    绑定
                  </el-button>
                </div>
              </div>
            </div>
          </el-card>
        </div>
      </el-col>
    </el-row>

    <!-- 弹窗 -->
    <el-dialog v-model="dialogState.visible" :title="dialogState.title" :width="500">
      <!-- 账号资料 -->
      <el-form
        v-if="dialogState.type === DialogType.ACCOUNT"
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
        v-if="dialogState.type === DialogType.PASSWORD"
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
        v-else-if="dialogState.type === DialogType.MOBILE"
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
        v-else-if="dialogState.type === DialogType.EMAIL"
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

import {
  Camera,
  Edit,
  Lock,
  Iphone,
  Message,
  User,
  Male,
  Female,
  OfficeBuilding,
  Timer,
  Key,
} from "@element-plus/icons-vue";

const userStore = useUserStoreHook();

const userProfile = ref<UserProfileDetail>({});

const enum DialogType {
  ACCOUNT = "account",
  PASSWORD = "password",
  MOBILE = "mobile",
  EMAIL = "email",
}

const dialogState = reactive({
  visible: false,
  title: "",
  type: "" as DialogType,
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
    : "未绑定手机号，建议立即绑定";
});

const emailSecurityDesc = computed(() => {
  return userProfile.value.email
    ? `已绑定：${maskEmail(userProfile.value.email)}`
    : "未绑定邮箱，建议立即绑定";
});

const handleOpenDialog = (type: DialogType) => {
  dialogState.type = type;
  dialogState.visible = true;
  switch (type) {
    case DialogType.ACCOUNT:
      dialogState.title = "编辑资料";
      userProfileForm.nickname = userProfile.value.nickname;
      userProfileForm.avatar = userProfile.value.avatar;
      userProfileForm.gender = userProfile.value.gender;
      break;
    case DialogType.PASSWORD:
      dialogState.title = "修改密码";
      break;
    case DialogType.MOBILE:
      dialogState.title = userProfile.value.mobile ? "更换手机号" : "绑定手机号";
      mobileUpdateForm.mobile = "";
      mobileUpdateForm.code = "";
      mobileUpdateForm.password = "";
      break;
    case DialogType.EMAIL:
      dialogState.title = userProfile.value.email ? "更换邮箱" : "绑定邮箱";
      emailUpdateForm.email = "";
      emailUpdateForm.code = "";
      emailUpdateForm.password = "";
      break;
  }
};

async function handleUnbindMobile() {
  if (!userProfile.value.mobile) return;
  try {
    const result = await ElMessageBox.prompt("请输入当前密码以解绑手机号", "解绑手机号", {
      type: "warning",
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      inputType: "password",
      inputPlaceholder: "当前密码",
      inputValidator: (val) => !!val || "请输入当前密码",
    });
    const value = (result as any).value;
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
    const result = await ElMessageBox.prompt("请输入当前密码以解绑邮箱", "解绑邮箱", {
      type: "warning",
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      inputType: "password",
      inputPlaceholder: "当前密码",
      inputValidator: (val) => !!val || "请输入当前密码",
    });
    const value = (result as any).value;
    await UserAPI.unbindEmail({ password: value });
    ElMessage.success("邮箱解绑成功");
    await loadUserProfile();
  } catch {
    // ignore
  }
}

function handleSendMobileCode() {
  if (!mobileUpdateForm.mobile) {
    ElMessage.error("请输入手机号");
    return;
  }
  const reg = /^1[3-9]\d{9}$/;
  if (!reg.test(mobileUpdateForm.mobile)) {
    ElMessage.error("手机号格式不正确");
    return;
  }
  UserAPI.sendMobileCode(mobileUpdateForm.mobile).then(() => {
    ElMessage.success("验证码发送成功");
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

function handleSendEmailCode() {
  if (!emailUpdateForm.email) {
    ElMessage.error("请输入邮箱");
    return;
  }
  const reg = /\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}/;
  if (!reg.test(emailUpdateForm.email)) {
    ElMessage.error("邮箱格式不正确");
    return;
  }

  UserAPI.sendEmailCode(emailUpdateForm.email).then(() => {
    ElMessage.success("验证码发送成功");
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

const handleSubmit = async () => {
  try {
    if (dialogState.type === DialogType.ACCOUNT) {
      const valid = await userProfileFormRef.value?.validate();
      if (!valid) return;

      await UserAPI.updateProfile(userProfileForm);
      ElMessage.success("账号资料修改成功");
      dialogState.visible = false;
      await loadUserProfile();
    } else if (dialogState.type === DialogType.PASSWORD) {
      const valid = await passwordChangeFormRef.value?.validate();
      if (!valid) return;

      await UserAPI.changePassword(passwordChangeForm);
      dialogState.visible = false;
      await redirectToLogin("密码已修改，请重新登录");
    } else if (dialogState.type === DialogType.MOBILE) {
      const valid = await mobileBindingFormRef.value?.validate();
      if (!valid) return;

      await UserAPI.bindOrChangeMobile(mobileUpdateForm);
      ElMessage.success(userProfile.value.mobile ? "手机号更换成功" : "手机号绑定成功");
      dialogState.visible = false;
      await loadUserProfile();
    } else if (dialogState.type === DialogType.EMAIL) {
      const valid = await emailBindingFormRef.value?.validate();
      if (!valid) return;

      await UserAPI.bindOrChangeEmail(emailUpdateForm);
      ElMessage.success(userProfile.value.email ? "邮箱更换成功" : "邮箱绑定成功");
      dialogState.visible = false;
      await loadUserProfile();
    }
  } catch {
    // ignore
  }
};

const handleCancel = () => {
  dialogState.visible = false;
  if (dialogState.type === DialogType.ACCOUNT) {
    userProfileFormRef.value?.resetFields();
  } else if (dialogState.type === DialogType.PASSWORD) {
    passwordChangeFormRef.value?.resetFields();
  } else if (dialogState.type === DialogType.MOBILE) {
    mobileBindingFormRef.value?.resetFields();
  } else if (dialogState.type === DialogType.EMAIL) {
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
    const data = await FileAPI.uploadFile(file);
    await UserAPI.updateProfile({
      avatar: data.url,
    });
    userStore.userInfo.avatar = data.url;
  }
};

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
.left-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.right-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

// 用户信息卡片
.user-card {
  .user-info {
    text-align: center;

    .avatar-wrapper {
      position: relative;
      display: inline-block;
      margin-bottom: 12px;

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
      margin-bottom: 4px;

      .nickname {
        font-size: 18px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }

      .edit-icon {
        margin-left: 6px;
        color: var(--el-text-color-secondary);
        cursor: pointer;
        transition: color 0.2s;

        &:hover {
          color: var(--el-color-primary);
        }
      }
    }

    .user-role {
      margin-bottom: 16px;
      font-size: 13px;
      color: var(--el-text-color-secondary);
    }

    .profile-desc {
      text-align: left;

      .cell-item {
        display: flex;
        gap: 6px;
        align-items: center;
      }

      .text-muted {
        color: var(--el-text-color-placeholder);
      }

      .gender-icon {
        font-size: 16px;

        &.male {
          color: var(--el-color-primary);
        }

        &.female {
          color: #f56c6c;
        }
      }
    }
  }
}

// 右侧卡片通用样式
.security-card {
  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .card-header-title {
      display: flex;
      gap: 8px;
      align-items: center;
      font-size: 16px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
  }
}

// 安全设置
.security-list {
  display: flex;
  flex-direction: column;
}

.security-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  transition: background 0.2s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: var(--el-fill-color-light);
    border-radius: 8px;
  }

  .security-left {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .security-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    font-size: 20px;
    border-radius: 8px;

    &.password {
      color: var(--el-color-primary);
      background: var(--el-color-primary-light-9);
    }

    &.mobile {
      color: var(--el-color-success);
      background: var(--el-color-success-light-9);
    }

    &.email {
      color: var(--el-color-warning);
      background: var(--el-color-warning-light-9);
    }
  }

  .security-content {
    .security-title {
      margin-bottom: 4px;
      font-size: 15px;
      font-weight: 500;
      color: var(--el-text-color-primary);
    }

    .security-desc {
      font-size: 13px;
      color: var(--el-text-color-secondary);
    }
  }

  .security-actions {
    display: flex;
    gap: 8px;
  }
}
</style>
