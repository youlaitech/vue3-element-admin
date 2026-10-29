<!-- 应用中心 -->
<template>
  <div class="page-container">
    <el-card class="page-content" shadow="never">
      <section v-for="group in appGroups" :key="group.category.key" class="app-section">
        <header class="app-section__header">
          <span class="app-section__name">{{ group.category.name }}</span>
          <span class="app-section__count">{{ group.apps.length }}</span>
          <span class="app-section__desc">{{ group.category.description }}</span>
        </header>

        <div class="app-grid">
          <div
            v-for="app in group.apps"
            :key="app.name"
            class="app-card"
            :class="[`app-card--${app.theme}`, { 'is-disabled': !app.ssoReady && !app.url }]"
            @click="handleAppClick(app)"
          >
            <div class="app-card__icon">
              <el-icon :size="22">
                <component :is="app.icon" />
              </el-icon>
            </div>
            <div class="app-card__body">
              <div class="app-card__name">{{ app.name }}</div>
              <div class="app-card__desc">{{ app.description }}</div>
            </div>
            <el-icon v-if="app.ssoReady || app.url" class="app-card__arrow">
              <ArrowRight />
            </el-icon>
          </div>
        </div>
      </section>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ArrowRight } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";
import { OIDC_AUTHORIZATION_URL } from "@/api/auth";
import { appConfig } from "@/settings";

defineOptions({ name: "AppCenter" });

/**
 * 应用分类标识
 */
type CategoryKey = "business" | "smart" | "account";

/**
 * 应用分类
 */
interface AppCategory {
  key: CategoryKey;
  name: string;
  description: string;
}

/**
 * 应用卡片
 */
interface AppCard {
  /** 应用名称 */
  name: string;
  /** 一句话说明 */
  description: string;
  /** 入口地址：站内路径走路由跳转，http(s) 地址新标签打开 */
  url: string;
  /** Element Plus 图标组件名 */
  icon: string;
  /** 卡片主题色，对应 Element Plus 的状态色 */
  theme: "primary" | "success" | "warning" | "info";
  /** 是否已接入统一认证；未接入且没有入口的卡片置灰不可跳转 */
  ssoReady: boolean;
  /** 所属分类 */
  category: CategoryKey;
}

/** 分类清单，数组顺序即页面分组顺序 */
const categories: AppCategory[] = [
  {
    key: "business",
    name: "业务系统",
    description: "已上线的系统，账号与权限由认证中心下发",
  },
  {
    key: "smart",
    name: "智能与多端",
    description: "智能助手与移动端、桌面端客户端",
  },
  {
    key: "account",
    name: "我的账号",
    description: "账号与统一认证身份的关联",
  },
];

/** 应用清单：接入统一认证的应用补上 url 并置 ssoReady 为 true */
const apps: AppCard[] = [
  {
    name: "youlai-admin",
    description: "Vue3 + Element Plus + 多语言中后台管理系统",
    url: OIDC_AUTHORIZATION_URL,
    icon: "Monitor",
    theme: "primary",
    ssoReady: true,
    category: "business",
  },
  {
    name: "youlai-mall",
    description: "Spring Cloud 微服务商城，覆盖商品、订单与支付",
    url: "",
    icon: "ShoppingCart",
    theme: "success",
    ssoReady: false,
    category: "business",
  },
  {
    name: "youlai-cms",
    description: "内容管理系统，模型与字段可自定义，管理栏目、标签和媒体素材",
    url: "",
    icon: "Document",
    theme: "warning",
    ssoReady: false,
    category: "business",
  },
  {
    name: "youlai-ai",
    description: "基于 Spring AI Alibaba，覆盖 RAG、工作流与多智能体",
    url: "",
    icon: "MagicStick",
    theme: "info",
    ssoReady: false,
    category: "smart",
  },
  {
    name: "youlai-app",
    description: "uni-app 跨平台移动端，出差在外也能处理待办",
    url: "",
    icon: "Cellphone",
    theme: "success",
    ssoReady: false,
    category: "smart",
  },
  {
    name: "youlai-electron",
    description: "Electron 桌面客户端，离线也能打开常用功能",
    url: "",
    icon: "Platform",
    theme: "info",
    ssoReady: false,
    category: "smart",
  },
  {
    name: "认证身份",
    description: "绑定统一认证身份，单点登录自动匹配",
    url: "/profile?tab=identity",
    icon: "Link",
    theme: "primary",
    ssoReady: false,
    category: "account",
  },
];

const router = useRouter();

const appGroups = categories
  .map((category) => ({ category, apps: apps.filter((app) => app.category === category.key) }))
  // 未启用统一认证时不展示账号分组
  .filter(
    (group) => group.apps.length > 0 && (appConfig.oidcEnabled || group.category.key !== "account")
  );

// 站内路径走路由跳转，外部地址新标签打开
function handleAppClick(app: AppCard): void {
  // 未接入统一认证且没有入口的应用只作展示
  if (!app.ssoReady && !app.url) {
    ElMessage.info(`${app.name} 尚未接入统一认证`);
    return;
  }
  if (/^https?:\/\//.test(app.url)) {
    window.open(app.url, "_blank", "noopener");
    return;
  }
  // 统一认证授权地址需要整页跳转，由后端重定向到认证中心
  if (app.url.startsWith("/oauth2/")) {
    window.location.href = app.url;
    return;
  }
  router.push(app.url);
}
</script>

<style scoped lang="scss">
/* 分组按内容高度排列，不占用页面剩余高度 */
.page-content :deep(.el-card__body) {
  grid-template-rows: none;
  grid-auto-rows: min-content;
  align-content: start;
}

.app-section + .app-section {
  padding-top: 24px;
  margin-top: 24px;
  border-top: 1px solid var(--el-border-color-extra-light);
}

.app-section__header {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: baseline;
  margin-bottom: 16px;
}

.app-section__name {
  position: relative;
  padding-left: 10px;
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);

  &::before {
    position: absolute;
    top: 50%;
    left: 0;
    width: 3px;
    height: 14px;
    content: "";
    background: var(--el-color-primary);
    border-radius: 2px;
    transform: translateY(-50%);
  }
}

.app-section__count {
  padding: 0 6px;
  font-size: 12px;
  line-height: 16px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-light);
  border-radius: 8px;
}

.app-section__desc {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.app-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 14px;
}

.app-card {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  padding: 16px;
  cursor: pointer;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  transition:
    border-color 0.2s,
    box-shadow 0.2s,
    transform 0.2s;

  &:hover {
    border-color: var(--app-border);
    box-shadow: 0 6px 16px rgb(0 0 0 / 6%);
    transform: translateY(-2px);

    .app-card__arrow {
      color: var(--app-color);
      transform: translateX(2px);
    }
  }

  &.is-disabled {
    cursor: not-allowed;

    .app-card__icon {
      opacity: 0.75;
      filter: saturate(0.7);
    }

    .app-card__name {
      color: var(--el-text-color-regular);
    }

    &:hover {
      border-color: var(--el-border-color-lighter);
      box-shadow: none;
      transform: none;
    }
  }

  &__icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    color: var(--app-color);
    background: var(--app-bg);
    border-radius: 10px;
  }

  &__body {
    flex: 1;
    min-width: 0;
  }

  &__name {
    font-size: 15px;
    font-weight: 600;
    line-height: 22px;
    color: var(--el-text-color-primary);
  }

  &__desc {
    display: -webkit-box;
    margin-top: 6px;
    overflow: hidden;
    -webkit-line-clamp: 2;
    font-size: 12px;
    line-height: 1.7;
    color: var(--el-text-color-secondary);
    -webkit-box-orient: vertical;
  }

  &__arrow {
    flex-shrink: 0;
    align-self: center;
    font-size: 14px;
    color: var(--el-text-color-placeholder);
    transition:
      color 0.2s,
      transform 0.2s;
  }
}

.app-card--primary {
  --app-color: var(--el-color-primary);
  --app-bg: var(--el-color-primary-light-9);
  --app-border: var(--el-color-primary-light-5);
}

.app-card--success {
  --app-color: var(--el-color-success);
  --app-bg: var(--el-color-success-light-9);
  --app-border: var(--el-color-success-light-5);
}

.app-card--warning {
  --app-color: var(--el-color-warning);
  --app-bg: var(--el-color-warning-light-9);
  --app-border: var(--el-color-warning-light-5);
}

.app-card--info {
  --app-color: var(--el-color-info);
  --app-bg: var(--el-color-info-light-9);
  --app-border: var(--el-color-info-light-5);
}
</style>
