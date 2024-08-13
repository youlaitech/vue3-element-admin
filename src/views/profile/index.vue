<template>
  <div class="profile-page">
    <el-card>
      <el-avatar :src="user.avatar" size="large" />
      <div class="profile-info">
        <h2>{{ user.name }}</h2>
        <p>{{ user.email }}</p>
        <el-button type="primary" @click="goToEdit">编辑个人信息</el-button>
        <el-button @click="goToChangePassword">修改密码</el-button>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { reactive } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const user = reactive({
  name: "张三",
  email: "zhangsan@example.com",
  avatar: "https://example.com/avatar.jpg",
});

const goToEdit = () => {
  router.push({ name: "ProfileEdit" });
};

const goToChangePassword = () => {
  router.push({ name: "ChangePassword" });
};
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

h2 {
  margin: 0 0 10px;
}

p {
  margin-bottom: 20px;
  color: #888;
}

.el-card {
  display: flex;
  padding: 20px;
}
</style>
