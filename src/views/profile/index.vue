<template>
  <div class="app-container">
    <el-row>
      <el-col :span="24">
        <el-card>
          <el-avatar :src="userProfile.avatar" size="large" />

          <el-form />

          <div class="profile-info">
            <h2>{{ userProfile.username }}</h2>
            <h2>{{ userProfile.nickname }}</h2>
            <p>{{ userProfile.email }}</p>
            <el-button type="primary" @click="handleOpenDialog">
              编辑个人信息
            </el-button>
            <el-button @click="handleOpenDialog">修改密码</el-button>
          </div>
        </el-card>
      </el-col>

      <el-col :span="24" />
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

onMounted(async () => {
  const data = await UserAPI.getProfile(userStore.user.userId);
  userProfile.value = data;
});
</script>

<style scoped>
.profile-info {
  margin-left: 20px;
}

.el-card {
  display: flex;
  padding: 20px;
}
</style>
