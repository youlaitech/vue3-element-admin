<template>
  <div class="app-container">
    <el-row>
      <el-col :span="6">
        <el-tabs tab-position="left">
          <el-tab-pane label="账号信息">
            <div class="w-full">
              <el-card class="flex-1">
                <div class="">
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
                <el-descriptions :column="1" class="mt-10">
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
                    {{ userProfile.email }}
                  </el-descriptions-item>
                  <el-descriptions-item>
                    <template #label>
                      <el-icon class="align-middle"><User /></el-icon>
                      角色
                    </template>
                    {{ userProfile.email }}
                  </el-descriptions-item>
                </el-descriptions>
              </el-card>
            </div>
          </el-tab-pane>
          <el-tab-pane label="安全设置">
            <el-card>
              <el-descriptions :column="1">
                <el-descriptions-item>
                  <template #label>
                    <el-icon class="align-middle"><Lock /></el-icon>
                    密码
                  </template>
                  <el-button type="primary" @click="handleOpenDialog">
                    修改密码
                  </el-button>
                </el-descriptions-item>

                <el-descriptions-item>
                  <template #label>
                    <el-icon class="align-middle"><Lock /></el-icon>
                    手机绑定
                  </template>
                  <el-button type="primary">设置安全问题</el-button>
                </el-descriptions-item>

                <el-descriptions-item>
                  <template #label>
                    <el-icon class="align-middle"><Lock /></el-icon>
                    邮箱绑定
                  </template>
                  <el-button type="primary">设置安全问题</el-button>
                </el-descriptions-item>
              </el-descriptions>
            </el-card>
          </el-tab-pane>
          <el-tab-pane label="偏好设置">Role</el-tab-pane>
          <el-tab-pane label="接收设置">Task</el-tab-pane>
        </el-tabs>
      </el-col>
    </el-row>

    <el-dialog title="修改密码" v-model:visible="dialogVisible">
      <el-form
        :model="passwordChangeForm"
        :rules="passwordChangeRules"
        ref="passwordChangeForm"
      >
        <el-form-item label="原密码" prop="oldPassword">
          <el-input v-model="passwordChangeForm.oldPassword" show-password />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordChangeForm.newPassword" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="confirmPassword" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="handleChangePassword">
            确 定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from "vue-router";
import UserAPI, {
  UserProfileVO,
  UserProfileForm,
  PasswordChangeForm,
} from "@/api/user";
import { useUserStore } from "@/store/modules/user";
import { Camera } from "@element-plus/icons-vue";
const router = useRouter();
const userStore = useUserStore();

const userProfile = ref<UserProfileVO>({});

const passwordChangeForm = ref<PasswordChangeForm>({});

const dialogVisible = ref(false);
const confirmPassword = ref("");

const passwordChangeRules = {
  oldPassword: [{ required: true, message: "请输入原密码", trigger: "blur" }],
  newPassword: [{ required: true, message: "请输入新密码", trigger: "blur" }],
  confirmPassword: [
    { required: true, message: "请再次输入新密码", trigger: "blur" },
  ],
};

const handleOpenDialog = () => {
  dialogVisible.value = true;
};

const handleChangePassword = async () => {
  const form = passwordChangeForm.value;
  if (form.newPassword !== confirmPassword.value) {
    return;
  }

  await UserAPI.changePassword(form);
  dialogVisible.value = false;
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
