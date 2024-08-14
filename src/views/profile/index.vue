<template>
  <div class="profile-page">
    <el-card>
      <el-avatar :src="userProfile.avatar" size="large" />
      <div class="profile-info">
        <h2>{{ userProfile.username }}</h2>
        <h2>{{ userProfile.nickname }}</h2>
        <p>{{ userProfile.email }}</p>
        <el-button type="primary" @click="goToEdit">编辑个人信息</el-button>
        <el-button @click="goToChangePassword">修改密码</el-button>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from "vue-router";
import UserAPI, { UserProfileVO, UserProfileForm } from "@/api/user";
import { useUserStore } from "@/store/modules/user";

const router = useRouter();
const userStore = useUserStore();

const userProfile = ref<UserProfileVO>({});

const goToEdit = () => {
  router.push({ name: "ProfileEdit" });
};

const goToChangePassword = () => {
  router.push({ name: "ChangePassword" });
};

onMounted(async () => {
  const data = await UserAPI.getProfile(userStore.user.userId);
  userProfile.value = data;
});
</script>

<style scoped>
.profile-page {
  display: flex;
  justify-content: center;
  padding: 20px;
}

.profile-info {
  margin-left: 20px;
}

.el-card {
  display: flex;
  padding: 20px;
}
</style>
