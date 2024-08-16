<template>
  <div class="app-container">
    <el-tabs tab-position="left">
      <!-- 基本设置 Tab Pane -->
      <el-tab-pane label="基本设置">
        <div class="w-full">
          <el-card class="flex-1">
            <div class="">
              <!-- 头像和昵称部分 -->
              <div class="relative w-100px h-100px flex-center">
                <el-avatar :src="userProfile.avatar" :size="100" />
                <el-button
                  type="info"
                  class="absolute bottom-0 right-0 cursor-pointer"
                  circle
                  :icon="Camera"
                  size="small"
                  @click="triggerFileUpload"
                />
                <input
                  type="file"
                  ref="fileInput"
                  style="display: none"
                  @change="handleFileChange"
                />
              </div>
              <div class="mt-5">
                {{ userProfile.nickname }}
                <el-icon class="align-middle cursor-pointer">
                  <Edit />
                </el-icon>
              </div>
            </div>
            <!-- 用户信息描述 -->
            <el-descriptions :column="1" class="mt-10">
              <!-- 用户名 -->
              <el-descriptions-item>
                <template #label>
                  <el-icon class="align-middle"><User /></el-icon>
                  用户名
                </template>
                {{ userProfile.username }}
                <el-icon
                  v-if="userProfile.gender === 1"
                  class="align-middle color-blue"
                >
                  <Male />
                </el-icon>
                <el-icon v-else class="align-middle color-pink">
                  <Female />
                </el-icon>
              </el-descriptions-item>
              <el-descriptions-item>
                <template #label>
                  <el-icon class="align-middle"><Phone /></el-icon>
                  手机号码
                </template>
                {{ userProfile.mobile }}
              </el-descriptions-item>
              <el-descriptions-item>
                <template #label>
                  <el-icon class="align-middle"><Message /></el-icon>
                  邮箱
                </template>
                {{ userProfile.email }}
              </el-descriptions-item>
              <el-descriptions-item>
                <template #label>
                  <el-icon class="align-middle"><User /></el-icon>
                  部门
                </template>
                {{ userProfile.deptName }}
              </el-descriptions-item>
              <el-descriptions-item>
                <template #label>
                  <el-icon class="align-middle"><User /></el-icon>
                  角色
                </template>
                {{ userProfile.roleNames }}
              </el-descriptions-item>

              <el-descriptions-item>
                <template #label>
                  <el-icon class="align-middle"><User /></el-icon>
                  创建日期
                </template>
                {{ userProfile.createTime }}
              </el-descriptions-item>
            </el-descriptions>
          </el-card>
        </div>
      </el-tab-pane>

      <!-- 安全设置  -->
      <el-tab-pane label="安全设置">
        <el-card>
          <!-- 账户密码 -->
          <el-row>
            <el-col :span="16">
              <div class="font-bold">账户密码</div>
              <div class="text-14px mt-2">
                定期修改密码有助于保护账户安全
                <el-button
                  type="primary"
                  plain
                  size="small"
                  @click="() => handleOpenDialog(DialogType.PASSWORD)"
                  class="ml-5"
                >
                  修改
                </el-button>
              </div>
            </el-col>
          </el-row>
          <!-- 绑定手机 -->
          <div class="mt-5">
            <div class="font-bold">绑定手机</div>
            <div class="text-14px mt-2">
              <span v-if="userProfile.mobile">
                已绑定手机号：{{ userProfile.mobile }}
              </span>
              <span v-else>未绑定手机</span>
              <el-button
                type="primary"
                plain
                size="small"
                @click="() => handleOpenDialog(DialogType.MOBILE)"
                class="ml-5"
                v-if="userProfile.mobile"
              >
                更换
              </el-button>
              <el-button
                type="primary"
                plain
                size="small"
                @click="() => handleOpenDialog(DialogType.MOBILE)"
                class="ml-5"
                v-else
              >
                绑定
              </el-button>
            </div>
          </div>
          <!-- 绑定邮箱 -->
          <div class="mt-5">
            <div class="font-bold">绑定邮箱</div>
            <div class="text-14px mt-2">
              <span v-if="userProfile.email">
                已绑定邮箱：{{ userProfile.email }}
              </span>
              <span v-else>未绑定邮箱</span>
              <el-button
                type="primary"
                plain
                size="small"
                @click="() => handleOpenDialog(DialogType.EMAIL)"
                class="ml-5"
                v-if="userProfile.email"
              >
                更换
              </el-button>
              <el-button
                type="primary"
                plain
                size="small"
                @click="() => handleOpenDialog(DialogType.EMAIL)"
                class="ml-5"
                v-else
              >
                绑定
              </el-button>
            </div>
          </div>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <!-- 弹窗 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" :width="400">
      <el-form
        v-if="dialog.type === DialogType.PASSWORD"
        :model="passwordChangeForm"
        :rules="passwordChangeRules"
        ref="passwordChangeFormRef"
      >
        <el-form-item label="原密码" prop="oldPassword">
          <el-input
            type="password"
            v-model="passwordChangeForm.oldPassword"
            show-password
          />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            type="password"
            v-model="passwordChangeForm.newPassword"
            show-password
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input type="password" v-model="confirmPassword" show-password />
        </el-form-item>
      </el-form>
      <el-form
        v-else-if="dialog.type === DialogType.MOBILE"
        :model="mobileBindingForm"
        :rules="mobileBindingRules"
        ref="mobileBindingFormRef"
      >
        <el-form-item label="手机号码" prop="mobile">
          <el-input v-model="mobileBindingForm.mobile" />
        </el-form-item>
        <el-form-item>
          <el-button
            :disabled="mobileCountdown > 0"
            @click="handleSendMobileCode"
          >
            {{
              mobileCountdown > 0
                ? `${mobileCountdown}s后重新发送`
                : "发送验证码"
            }}
          </el-button>
        </el-form-item>
        <el-form-item label="验证码" prop="code">
          <el-input v-model="mobileBindingForm.code" />
        </el-form-item>
      </el-form>
      <el-form
        v-else-if="dialog.type === DialogType.EMAIL"
        :model="emailBindingForm"
        :rules="emailBindingRules"
        ref="emailBindingFormRef"
      >
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="emailBindingForm.email" />
        </el-form-item>
        <el-form-item>
          <el-button
            :disabled="emailCountdown > 0"
            @click="handleSendEmailCode"
          >
            {{
              emailCountdown > 0 ? `${emailCountdown}s后重新发送` : "发送验证码"
            }}
          </el-button>
        </el-form-item>
        <el-form-item label="验证码" prop="code">
          <el-input v-model="emailBindingForm.code" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialog.visible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import UserAPI, {
  UserProfileVO,
  UserProfileForm,
  PasswordChangeForm,
  MobileBindingForm,
  EmailBindingForm,
} from "@/api/user";
import { useUserStore } from "@/store/modules/user";
import { Camera } from "@element-plus/icons-vue";
const userStore = useUserStore();

const userProfile = ref<UserProfileVO>({});

enum DialogType {
  PASSWORD = "password",
  MOBILE = "mobile",
  EMAIL = "email",
}

const dialog = reactive({
  visible: false,
  title: "",
  type: "" as DialogType, // 修改密码、绑定手机、绑定邮箱
});

const confirmPassword = ref("");

const passwordChangeForm = reactive<PasswordChangeForm>({});
const mobileBindingForm = reactive<MobileBindingForm>({});
const emailBindingForm = reactive<EmailBindingForm>({});

const mobileCountdown = ref(0);
const mobileTimer = ref<NodeJS.Timeout | null>(null);

const emailCountdown = ref(0);
const emailTimer = ref<NodeJS.Timeout | null>(null);

const passwordChangeRules = {
  oldPassword: [{ required: true, message: "请输入原密码", trigger: "blur" }],
  newPassword: [{ required: true, message: "请输入新密码", trigger: "blur" }],
  confirmPassword: [
    { required: true, message: "请再次输入新密码", trigger: "blur" },
  ],
};

const mobileBindingRules = {
  mobile: [{ required: true, message: "请输入手机号", trigger: "blur" }],
  mobileCode: [{ required: true, message: "请输入验证码", trigger: "blur" }],
};

const emailBindingRules = {
  email: [{ required: true, message: "请输入邮箱", trigger: "blur" }],
  emailCode: [{ required: true, message: "请输入验证码", trigger: "blur" }],
};

const handleOpenDialog = (type: DialogType) => {
  dialog.type = type;
  dialog.visible = true;
};

const handleSendMobileCode = async () => {
  if (!mobileBindingForm.value.mobile) {
    return;
  }
  // await UserAPI.sendMobileCode(mobileBindingForm.value.mobile);

  mobileCountdown.value = 60;
  mobileTimer.value = setInterval(() => {
    if (mobileCountdown.value > 0) {
      mobileCountdown.value -= 1;
    } else {
      clearInterval(mobileTimer.value!);
    }
  }, 1000);
};

const handleSendEmailCode = async () => {
  if (!emailBindingForm.email) {
    return;
  }
  // await UserAPI.sendEmailCode(emailBindingForm.value.email);

  emailCountdown.value = 60;
  emailTimer.value = setInterval(() => {
    if (emailCountdown.value > 0) {
      emailCountdown.value -= 1;
    } else {
      clearInterval(emailTimer.value!);
    }
  }, 1000);
};

const handleSubmit = async () => {
  if (dialog.type === DialogType.PASSWORD) {
    if (passwordChangeForm.newPassword !== confirmPassword.value) {
      ElMessage.error("两次输入的密码不一致");
      return;
    }
    await UserAPI.changePassword(passwordChangeForm);
  } else if (dialog.type === "mobile") {
    //await UserAPI.bindMobile(mobileBindingForm.value);
  } else if (dialog.type === "email") {
    //await UserAPI.bindEmail(emailBindingForm.value);
  }
  dialog.visible = false;
};

const fileInput = ref<HTMLInputElement | null>(null);

const triggerFileUpload = () => {
  fileInput.value?.click();
};

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files ? target.files[0] : null;
  if (file) {
    // Handle the file upload here
    console.log("Selected file:", file);
  }
};

onMounted(async () => {
  if (mobileTimer.value) {
    clearInterval(mobileTimer.value);
  }
  if (emailTimer.value) {
    clearInterval(emailTimer.value);
  }

  const data = await UserAPI.getProfile(userStore.user.userId);
  userProfile.value = data;
});
</script>

<style lang="scss" scoped>
/** 关闭tag标签  */
.app-container {
  /* 50px = navbar = 50px */
  height: calc(100vh - 50px);
  background: var(--el-fill-color-blank);
}

/** 开启tag标签  */
.hasTagsView {
  .app-container {
    /* 84px = navbar + tags-view = 50px + 34px */
    height: calc(100vh - 84px);
  }
}
</style>
