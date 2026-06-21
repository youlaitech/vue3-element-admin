<template>
  <div class="profile-page">
    <section class="profile-hero">
      <div class="profile-hero__body">
        <div class="profile-avatar">
          <el-avatar :src="displayAvatar" :size="72">
            <el-icon><UserFilled /></el-icon>
          </el-avatar>
          <el-button
            type="info"
            class="profile-avatar__action"
            circle
            :icon="Camera"
            size="small"
            title="更换头像"
            @click="triggerFileUpload"
          />
          <input
            ref="fileInput"
            class="profile-avatar__input"
            type="file"
            accept="image/*"
            @change="handleFileChange"
          />
        </div>

        <div class="profile-hero__info">
          <div class="profile-hero__title">
            <h2 class="profile-hero__name">{{ displayName }}</h2>
            <el-tag type="primary" effect="light" round>{{ primaryRole }}</el-tag>
          </div>
          <p class="profile-hero__desc">
            {{ userProfile.username || "-" }} / {{ userProfile.deptName || "未分配部门" }}
          </p>
          <div class="profile-hero__meta">
            <span class="profile-hero__meta-item">
              <el-icon><Calendar /></el-icon>
              加入 {{ formatValue(userProfile.createTime) }}
            </span>
            <span class="profile-hero__meta-item">
              <el-icon><Location /></el-icon>
              最近登录 {{ recentLoginRecords[0]?.time }}
            </span>
          </div>
        </div>
      </div>

      <div class="profile-hero__actions">
        <el-button :icon="Edit" @click="handleOpenDialog(DialogType.ACCOUNT)">编辑资料</el-button>
        <el-button type="primary" :icon="Lock" @click="handleOpenDialog(DialogType.PASSWORD)">
          修改密码
        </el-button>
      </div>
    </section>

    <div class="profile-page__layout">
      <aside class="profile-page__side">
        <section class="profile-card">
          <header class="profile-card__header">
            <h3 class="profile-card__title">个人资料</h3>
            <el-tag size="small" effect="plain">{{ genderText }}</el-tag>
          </header>

          <dl class="profile-info">
            <div v-for="item in profileInfoItems" :key="item.label" class="profile-info__item">
              <dt class="profile-info__label">
                <el-icon><component :is="item.icon" /></el-icon>
                {{ item.label }}
              </dt>
              <dd class="profile-info__value" :class="{ 'is-muted': item.muted }">
                {{ item.value }}
              </dd>
            </div>
          </dl>
        </section>

        <section class="profile-card">
          <header class="profile-card__header">
            <h3 class="profile-card__title">账号概览</h3>
          </header>

          <div class="profile-stats">
            <div v-for="item in profileStats" :key="item.label" class="profile-stats__item">
              <span :class="['profile-icon', 'profile-icon--' + item.tone]">
                <el-icon><component :is="item.icon" /></el-icon>
              </span>
              <div class="profile-stats__body">
                <span class="profile-stats__label">{{ item.label }}</span>
                <strong class="profile-stats__value">
                  {{ item.value }}
                  <em>{{ item.suffix }}</em>
                </strong>
              </div>
            </div>
          </div>
        </section>

        <section class="profile-card">
          <header class="profile-card__header">
            <h3 class="profile-card__title">角色权限</h3>
            <span class="profile-card__extra">{{ permissionCount }} 个权限</span>
          </header>

          <div class="profile-tags">
            <el-tag v-for="role in roleList" :key="role" class="m-0" size="small" effect="light">
              {{ role }}
            </el-tag>
            <span v-if="!roleList.length" class="profile-empty">暂无角色</span>
          </div>
        </section>
      </aside>

      <main class="profile-page__main">
        <section class="profile-card">
          <header class="profile-card__header">
            <div>
              <h3 class="profile-card__title">安全设置</h3>
              <p class="profile-card__desc">维护账号登录凭证与身份验证方式</p>
            </div>
            <el-tag :type="securityLevel.type" effect="light">
              安全等级 {{ securityLevel.label }}
            </el-tag>
          </header>

          <div class="profile-security">
            <div v-for="item in securityItems" :key="item.key" class="profile-security__item">
              <span :class="['profile-icon', 'profile-icon--large', 'profile-icon--' + item.tone]">
                <el-icon><component :is="item.icon" /></el-icon>
              </span>
              <div class="profile-security__body">
                <div class="profile-security__title">
                  <span>{{ item.title }}</span>
                  <el-tag size="small" :type="item.statusType" effect="plain">
                    {{ item.status }}
                  </el-tag>
                </div>
                <p class="profile-security__desc">{{ item.description }}</p>
              </div>
              <div class="profile-security__actions">
                <el-button
                  v-for="action in item.actions"
                  :key="action.label"
                  :type="action.type"
                  link
                  @click="action.onClick"
                >
                  {{ action.label }}
                </el-button>
              </div>
            </div>
          </div>
        </section>

        <div class="profile-page__grid">
          <section class="profile-card">
            <header class="profile-card__header">
              <h3 class="profile-card__title">近期登录</h3>
              <span class="profile-card__extra">最近 3 条</span>
            </header>

            <div class="profile-login">
              <div
                v-for="record in recentLoginRecords"
                :key="record.time"
                class="profile-login__item"
              >
                <span class="profile-icon">
                  <el-icon><Monitor /></el-icon>
                </span>
                <div class="profile-login__body">
                  <strong class="profile-login__device">{{ record.device }}</strong>
                  <span class="profile-login__meta">{{ record.location }} / {{ record.ip }}</span>
                </div>
                <time class="profile-login__time">{{ record.time }}</time>
              </div>
            </div>
          </section>

          <section class="profile-card">
            <header class="profile-card__header">
              <h3 class="profile-card__title">账号状态</h3>
              <span class="profile-card__extra">完善度 {{ profileCompletion }}%</span>
            </header>

            <div class="profile-status">
              <div
                v-for="item in accountStatusItems"
                :key="item.label"
                class="profile-status__item"
                :class="{ 'is-warning': !item.done }"
              >
                <el-icon class="profile-status__icon">
                  <CircleCheck v-if="item.done" />
                  <Warning v-else />
                </el-icon>
                <div class="profile-status__body">
                  <strong class="profile-status__title">{{ item.label }}</strong>
                  <span class="profile-status__desc">{{ item.value }}</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>

    <el-dialog v-model="dialogState.visible" :title="dialogState.title" width="520px">
      <el-form
        v-if="dialogState.type === DialogType.ACCOUNT"
        ref="userProfileFormRef"
        :model="userProfileForm"
        :rules="userProfileRules"
        label-width="88px"
        class="pr-10px"
      >
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="userProfileForm.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="性别">
          <DictSelect v-model="userProfileForm.gender" code="gender" />
        </el-form-item>
      </el-form>

      <el-form
        v-else-if="dialogState.type === DialogType.PASSWORD"
        ref="passwordChangeFormRef"
        :model="passwordChangeForm"
        :rules="passwordChangeRules"
        label-width="88px"
        class="pr-10px"
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

      <el-form
        v-else-if="dialogState.type === DialogType.MOBILE"
        ref="mobileBindingFormRef"
        :model="mobileUpdateForm"
        :rules="mobileBindingRules"
        label-width="88px"
        class="pr-10px"
      >
        <el-form-item label="手机号码" prop="mobile">
          <el-input v-model="mobileUpdateForm.mobile" />
        </el-form-item>
        <el-form-item label="验证码" prop="code">
          <el-input v-model="mobileUpdateForm.code">
            <template #append>
              <el-button :disabled="mobileCountdown > 0" @click="handleSendMobileCode">
                {{ mobileCountdown > 0 ? mobileCountdown + "s后重新发送" : "发送验证码" }}
              </el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="当前密码" prop="password">
          <el-input v-model="mobileUpdateForm.password" type="password" show-password />
        </el-form-item>
      </el-form>

      <el-form
        v-else-if="dialogState.type === DialogType.EMAIL"
        ref="emailBindingFormRef"
        :model="emailUpdateForm"
        :rules="emailBindingRules"
        label-width="88px"
        class="pr-10px"
      >
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="emailUpdateForm.email" />
        </el-form-item>
        <el-form-item label="验证码" prop="code">
          <el-input v-model="emailUpdateForm.code">
            <template #append>
              <el-button :disabled="emailCountdown > 0" @click="handleSendEmailCode">
                {{ emailCountdown > 0 ? emailCountdown + "s后重新发送" : "发送验证码" }}
              </el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="当前密码" prop="password">
          <el-input v-model="emailUpdateForm.password" type="password" show-password />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="inline-flex gap-2">
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
} from "@/api/system/user";

import type { Component } from "vue";
import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import FileAPI from "@/api/file";
import { useUserStoreHook } from "@/stores";
import { redirectToLogin } from "@/utils/auth";

import {
  Calendar,
  Camera,
  CircleCheck,
  DataLine,
  Edit,
  Female,
  Iphone,
  Key,
  Location,
  Lock,
  Male,
  Message,
  Monitor,
  OfficeBuilding,
  Timer,
  User,
  UserFilled,
  Warning,
} from "@element-plus/icons-vue";

interface ProfileInfoItem {
  label: string;
  value: string;
  icon: Component;
  muted?: boolean;
}

interface SecurityAction {
  label: string;
  type: "primary" | "danger";
  onClick: () => void;
}

interface SecurityItem {
  key: string;
  title: string;
  description: string;
  status: string;
  statusType: "success" | "warning" | "info";
  icon: Component;
  tone: "primary" | "success" | "warning";
  actions: SecurityAction[];
}

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

const recentLoginRecords = [
  {
    device: "Chrome / Windows",
    location: "上海",
    ip: "192.168.1.26",
    time: "2026-06-20 09:32",
  },
  {
    device: "Edge / Windows",
    location: "杭州",
    ip: "192.168.1.18",
    time: "2026-06-19 18:46",
  },
  {
    device: "Safari / iOS",
    location: "深圳",
    ip: "192.168.1.12",
    time: "2026-06-18 14:08",
  },
];

const userProfileRules = {
  nickname: [{ required: true, message: "请输入昵称", trigger: "blur" }],
};

const passwordChangeRules = {
  oldPassword: [{ required: true, message: "请输入原密码", trigger: "blur" }],
  newPassword: [{ required: true, message: "请输入新密码", trigger: "blur" }],
  confirmPassword: [
    { required: true, message: "请再次输入新密码", trigger: "blur" },
    {
      validator: (_rule: unknown, value: string, callback: (error?: Error) => void) => {
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

const displayAvatar = computed(() => userProfile.value.avatar || userStore.userInfo.avatar || "");

const displayName = computed(() => {
  return (
    userProfile.value.nickname ||
    userStore.userInfo.nickname ||
    userProfile.value.username ||
    userStore.userInfo.username ||
    "未命名用户"
  );
});

const roleList = computed(() => {
  return (userProfile.value.roleNames || "")
    .split(/[,，]/)
    .map((role) => role.trim())
    .filter(Boolean);
});

const primaryRole = computed(() => roleList.value[0] || "普通用户");

const permissionCount = computed(() => userStore.userInfo.perms?.length || 0);

const genderText = computed(() => {
  if (userProfile.value.gender === 1) return "男";
  if (userProfile.value.gender === 2) return "女";
  return "未设置";
});

const boundCount = computed(() => {
  return [userProfile.value.mobile, userProfile.value.email].filter(Boolean).length;
});

const profileCompletion = computed(() => {
  const fields = [
    userProfile.value.username,
    userProfile.value.nickname,
    displayAvatar.value,
    userProfile.value.mobile,
    userProfile.value.email,
    userProfile.value.deptName,
    userProfile.value.roleNames,
    userProfile.value.createTime,
  ];
  return Math.round((fields.filter(Boolean).length / fields.length) * 100);
});

const securityLevel = computed(() => {
  const score = 60 + boundCount.value * 20;
  if (score >= 100) {
    return { score, label: "高", type: "success" as const };
  }
  if (score >= 80) {
    return { score, label: "中", type: "warning" as const };
  }
  return { score, label: "低", type: "info" as const };
});

const profileInfoItems = computed<ProfileInfoItem[]>(() => [
  {
    label: "用户名",
    value: userProfile.value.username || "-",
    icon: userProfile.value.gender === 2 ? Female : userProfile.value.gender === 1 ? Male : User,
  },
  {
    label: "手机号码",
    value: userProfile.value.mobile || "未绑定",
    icon: Iphone,
    muted: !userProfile.value.mobile,
  },
  {
    label: "邮箱",
    value: userProfile.value.email || "未绑定",
    icon: Message,
    muted: !userProfile.value.email,
  },
  {
    label: "部门",
    value: userProfile.value.deptName || "-",
    icon: OfficeBuilding,
    muted: !userProfile.value.deptName,
  },
  {
    label: "创建时间",
    value: formatValue(userProfile.value.createTime),
    icon: Timer,
    muted: !userProfile.value.createTime,
  },
]);

const profileStats = computed(() => [
  {
    label: "安全评分",
    value: securityLevel.value.score,
    suffix: "分",
    icon: Key,
    tone: "primary",
  },
  {
    label: "绑定项目",
    value: boundCount.value,
    suffix: "/2",
    icon: CircleCheck,
    tone: "success",
  },
  {
    label: "角色数量",
    value: roleList.value.length,
    suffix: "个",
    icon: UserFilled,
    tone: "warning",
  },
  {
    label: "权限标识",
    value: permissionCount.value,
    suffix: "个",
    icon: DataLine,
    tone: "info",
  },
]);

const accountStatusItems = computed(() => [
  {
    label: "登录账号",
    value: userProfile.value.username || "未获取",
    done: !!userProfile.value.username,
  },
  {
    label: "手机号验证",
    value: userProfile.value.mobile ? "已绑定" : "未绑定",
    done: !!userProfile.value.mobile,
  },
  {
    label: "邮箱验证",
    value: userProfile.value.email ? "已绑定" : "未绑定",
    done: !!userProfile.value.email,
  },
  {
    label: "资料完善",
    value: `${profileCompletion.value}%`,
    done: profileCompletion.value >= 80,
  },
]);

const securityItems = computed<SecurityItem[]>(() => [
  {
    key: "password",
    title: "账户密码",
    description: "定期修改密码有助于保护账户安全",
    status: "已设置",
    statusType: "success",
    icon: Lock,
    tone: "primary",
    actions: [
      {
        label: "修改",
        type: "primary",
        onClick: () => handleOpenDialog(DialogType.PASSWORD),
      },
    ],
  },
  {
    key: "mobile",
    title: "手机号",
    description: mobileSecurityDesc.value,
    status: userProfile.value.mobile ? "已绑定" : "未绑定",
    statusType: userProfile.value.mobile ? "success" : "warning",
    icon: Iphone,
    tone: "success",
    actions: userProfile.value.mobile
      ? [
          {
            label: "更换",
            type: "primary",
            onClick: () => handleOpenDialog(DialogType.MOBILE),
          },
          {
            label: "解绑",
            type: "danger",
            onClick: handleUnbindMobile,
          },
        ]
      : [
          {
            label: "绑定",
            type: "primary",
            onClick: () => handleOpenDialog(DialogType.MOBILE),
          },
        ],
  },
  {
    key: "email",
    title: "邮箱",
    description: emailSecurityDesc.value,
    status: userProfile.value.email ? "已绑定" : "未绑定",
    statusType: userProfile.value.email ? "success" : "warning",
    icon: Message,
    tone: "warning",
    actions: userProfile.value.email
      ? [
          {
            label: "更换",
            type: "primary",
            onClick: () => handleOpenDialog(DialogType.EMAIL),
          },
          {
            label: "解绑",
            type: "danger",
            onClick: handleUnbindEmail,
          },
        ]
      : [
          {
            label: "绑定",
            type: "primary",
            onClick: () => handleOpenDialog(DialogType.EMAIL),
          },
        ],
  },
]);

function formatValue(value?: Date | string) {
  return value ? String(value) : "-";
}

function getPromptValue(result: unknown) {
  if (result && typeof result === "object" && "value" in result) {
    return String(result.value || "");
  }
  return "";
}

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
    const value = getPromptValue(result);
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
    const value = getPromptValue(result);
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
      if (userProfileForm.nickname) {
        userStore.userInfo.nickname = userProfileForm.nickname;
      }
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
    userProfile.value.avatar = data.url;
    userStore.userInfo.avatar = data.url;
    ElMessage.success("头像更新成功");
  }
  target.value = "";
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
.profile-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 100%;
  padding: 16px;
}

.profile-hero,
.profile-card {
  background: var(--content-bg);
  border: 1px solid var(--card-border);
  border-radius: var(--card-radius);
  box-shadow: var(--card-shadow);
}

.profile-hero {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
}

.profile-hero__body,
.profile-hero__title,
.profile-hero__meta,
.profile-hero__actions,
.profile-hero__meta-item {
  display: flex;
  align-items: center;
}

.profile-hero__body {
  gap: 16px;
  min-width: 0;
}

.profile-hero__info {
  min-width: 0;
}

.profile-hero__title {
  flex-wrap: wrap;
  gap: 10px;
}

.profile-hero__name {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  line-height: 30px;
  color: var(--el-text-color-primary);
}

.profile-hero__desc {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.profile-hero__meta {
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 8px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.profile-hero__meta-item {
  gap: 4px;
}

.profile-hero__actions {
  flex-shrink: 0;
  gap: 8px;
}

.profile-avatar {
  position: relative;
  flex-shrink: 0;
}

.profile-avatar__action {
  position: absolute;
  right: -2px;
  bottom: -2px;
  border: 2px solid var(--content-bg);
}

.profile-avatar__input {
  display: none;
}

.profile-page__layout {
  display: grid;
  grid-template-columns: minmax(280px, 340px) minmax(0, 1fr);
  gap: 16px;
  align-items: start;
}

.profile-page__side,
.profile-page__main {
  display: grid;
  gap: 16px;
  min-width: 0;
}

.profile-page__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(260px, 340px);
  gap: 16px;
}

.profile-card {
  padding: 18px 20px;
}

.profile-card__header {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 14px;
}

.profile-card__title {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  line-height: 22px;
  color: var(--el-text-color-primary);
}

.profile-card__desc {
  margin: 3px 0 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.profile-card__extra,
.profile-empty {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

.profile-info {
  display: grid;
  gap: 10px;
  margin: 0;
}

.profile-info__item {
  display: grid;
  grid-template-columns: 92px minmax(0, 1fr);
  gap: 10px;
  align-items: center;
  min-height: 34px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--el-border-color-extra-light);
}

.profile-info__item:last-child {
  padding-bottom: 0;
  border-bottom: 0;
}

.profile-info__label {
  display: flex;
  gap: 6px;
  align-items: center;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.profile-info__value {
  min-width: 0;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 13px;
  color: var(--el-text-color-primary);
  white-space: nowrap;
}

.profile-stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.profile-stats__item {
  display: flex;
  gap: 10px;
  align-items: center;
  min-width: 0;
  padding: 12px;
  background: var(--el-fill-color-lighter);
  border: 1px solid var(--el-border-color-extra-light);
  border-radius: 8px;
}

.profile-stats__body {
  min-width: 0;
}

.profile-stats__label,
.profile-stats__value {
  display: block;
}

.profile-stats__label {
  margin-bottom: 2px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.profile-stats__value {
  font-size: 20px;
  line-height: 24px;
  color: var(--el-text-color-primary);
}

.profile-stats__value em {
  display: inline;
  margin-left: 2px;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  color: var(--el-text-color-secondary);
}

.profile-icon {
  display: flex;
  flex: 0 0 36px;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  font-size: 18px;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  border-radius: 8px;
}

.profile-icon--large {
  flex-basis: 40px;
  width: 40px;
  height: 40px;
  font-size: 20px;
}

.profile-icon--success {
  color: var(--el-color-success);
  background: var(--el-color-success-light-9);
}

.profile-icon--warning {
  color: var(--el-color-warning);
  background: var(--el-color-warning-light-9);
}

.profile-icon--info {
  color: var(--el-color-info);
  background: var(--el-fill-color-light);
}

.profile-security,
.profile-login,
.profile-status {
  display: grid;
  gap: 12px;
}

.profile-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.profile-security__item {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  padding: 12px 14px;
  border: 1px solid var(--el-border-color-extra-light);
  border-radius: 8px;
}

.profile-security__body,
.profile-login__body,
.profile-status__body {
  min-width: 0;
}

.profile-security__title {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.profile-security__desc {
  margin: 4px 0 0;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}

.profile-security__actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.profile-security__actions .el-button + .el-button {
  margin-left: 0;
}

.profile-login__item {
  display: grid;
  grid-template-columns: 36px minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
  min-height: 44px;
}

.profile-login__device,
.profile-login__meta,
.profile-login__time,
.profile-status__title,
.profile-status__desc {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.profile-login__device,
.profile-status__title {
  font-size: 13px;
  color: var(--el-text-color-primary);
}

.profile-login__meta,
.profile-login__time,
.profile-status__desc {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.profile-status__item {
  display: grid;
  grid-template-columns: 18px minmax(0, 1fr);
  gap: 10px;
  align-items: center;
  min-height: 38px;
  color: var(--el-color-success);
}

.profile-status__item.is-warning {
  color: var(--el-color-warning);
}

.profile-status__title {
  margin-bottom: 2px;
}

.is-muted {
  color: var(--el-text-color-placeholder);
}

@media (width <= 1200px) {
  .profile-page__layout,
  .profile-page__grid {
    grid-template-columns: 1fr;
  }
}

@media (width <= 768px) {
  .profile-page {
    padding: 12px;
  }

  .profile-hero {
    align-items: flex-start;
  }

  .profile-hero,
  .profile-hero__body,
  .profile-hero__actions {
    flex-direction: column;
  }

  .profile-hero__actions {
    align-items: stretch;
    width: 100%;
  }

  .profile-hero__actions .el-button {
    width: 100%;
    margin-left: 0;
  }

  .profile-security__item,
  .profile-login__item {
    grid-template-columns: 40px minmax(0, 1fr);
  }

  .profile-security__actions,
  .profile-login__time {
    grid-column: 2;
    justify-self: start;
  }
}

@media (width <= 520px) {
  .profile-stats,
  .profile-info__item {
    grid-template-columns: 1fr;
  }

  .profile-info__item {
    gap: 4px;
  }
}
</style>
