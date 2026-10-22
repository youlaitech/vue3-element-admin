<!-- 应用中心 -->
<template>
  <div class="page-container">
    <el-card class="page-content" shadow="never">
      <section v-for="group in appGroups" :key="group.category.key" class="app-section">
        <header class="app-section__header">
          <div class="app-section__title">
            <span class="app-section__name">{{ group.category.name }}</span>
            <span class="app-section__count">{{ group.apps.length }}</span>
          </div>
          <p class="app-section__desc">{{ group.category.description }}</p>
        </header>

        <div class="app-grid">
          <div
            v-for="app in group.apps"
            :key="app.name"
            class="app-card"
            :class="[`app-card--${app.theme}`, { 'is-disabled': !app.ssoReady }]"
            @click="handleAppClick(app)"
          >
            <div class="app-card__top">
              <div class="app-card__icon">
                <el-icon :size="26">
                  <component :is="app.icon" />
                </el-icon>
              </div>
              <el-tag v-if="!app.ssoReady" type="info" size="small" effect="plain">即将接入</el-tag>
            </div>
            <div class="app-card__name">{{ app.name }}</div>
            <div class="app-card__desc">{{ app.description }}</div>
          </div>
        </div>
      </section>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";

defineOptions({ name: "AppCenter" });

/** 应用分类标识 */
type CategoryKey = "business" | "operation" | "smart";

/** 应用分类 */
interface AppCategory {
  key: CategoryKey;
  name: string;
  description: string;
}

/** 应用卡片 */
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
  /** 是否已接入统一认证：未接入的卡片置灰不可跳转 */
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
    key: "operation",
    name: "经营管理",
    description: "设备、资产、进销存等经营场景的系统",
  },
  {
    key: "smart",
    name: "智能与多端",
    description: "智能助手与移动端、桌面端客户端",
  },
];

/** 应用清单：接入统一认证后把 ssoReady 改为 true 并补上 url */
const apps: AppCard[] = [
  {
    name: "youlai-admin",
    description: "Vue3 + Element Plus + 多语言中后台管理系统",
    url: "/",
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
    name: "设备管理",
    description: "设备台账、点检保养与维修记录，备件出入库联动",
    url: "",
    icon: "Setting",
    theme: "primary",
    ssoReady: false,
    category: "operation",
  },
  {
    name: "资产管理",
    description: "资产入库、领用调拨、折旧计提与定期盘点",
    url: "",
    icon: "Box",
    theme: "success",
    ssoReady: false,
    category: "operation",
  },
  {
    name: "进销存",
    description: "采购、销售与库存管理，支持调拨和库存预警",
    url: "",
    icon: "Goods",
    theme: "warning",
    ssoReady: false,
    category: "operation",
  },
  {
    name: "客户关系",
    description: "客户档案、商机跟进与合同回款",
    url: "",
    icon: "User",
    theme: "info",
    ssoReady: false,
    category: "operation",
  },
  {
    name: "工单中心",
    description: "报修派单、处理时效与满意度回访",
    url: "",
    icon: "Tickets",
    theme: "primary",
    ssoReady: false,
    category: "operation",
  },
  {
    name: "项目管理",
    description: "立项、任务分解、进度跟踪与工时统计",
    url: "",
    icon: "Files",
    theme: "success",
    ssoReady: false,
    category: "operation",
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
];

const router = useRouter();

const appGroups = categories
  .map((category) => ({ category, apps: apps.filter((app) => app.category === category.key) }))
  .filter((group) => group.apps.length > 0);

// 站内路径走路由跳转，外部地址新标签打开
function handleAppClick(app: AppCard): void {
  if (!app.ssoReady) {
    ElMessage.info(`${app.name} 尚未接入统一认证`);
    return;
  }
  if (/^https?:\/\//.test(app.url)) {
    window.open(app.url, "_blank", "noopener");
    return;
  }
  router.push(app.url);
}
</script>

<style scoped lang="scss">
.app-section + .app-section {
  padding-top: 26px;
  margin-top: 26px;
  border-top: 1px dashed var(--el-border-color-lighter);
}

.app-section__header {
  margin-bottom: 16px;
}

.app-section__title {
  display: flex;
  gap: 8px;
  align-items: center;
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
  padding: 0 7px;
  font-size: 12px;
  line-height: 18px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-light);
  border-radius: 9px;
}

.app-section__desc {
  margin: 6px 0 0 10px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.app-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}

.app-card {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 20px;
  overflow: hidden;
  cursor: pointer;
  background: linear-gradient(180deg, var(--app-bg) 0%, var(--el-bg-color) 72%);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  transition:
    border-color 0.2s,
    box-shadow 0.2s,
    transform 0.2s;

  &::before {
    position: absolute;
    inset: 0 0 auto;
    height: 3px;
    content: "";
    background: linear-gradient(90deg, var(--app-color), transparent);
  }

  &:hover {
    border-color: var(--app-color);
    box-shadow: 0 10px 24px rgb(0 0 0 / 8%);
    transform: translateY(-3px);
  }

  &.is-disabled {
    cursor: not-allowed;

    .app-card__icon {
      opacity: 0.85;
      filter: grayscale(0.35);
    }

    &:hover {
      border-color: var(--el-border-color-lighter);
      box-shadow: none;
      transform: none;
    }
  }

  &__top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
  }

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 52px;
    height: 52px;
    color: #fff;
    background: linear-gradient(135deg, var(--app-color), var(--app-color-light));
    border-radius: 14px;
    box-shadow: 0 6px 16px var(--app-shadow);
  }

  &__name {
    margin-top: 16px;
    font-size: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  &__desc {
    display: -webkit-box;
    margin-top: 8px;
    overflow: hidden;
    -webkit-line-clamp: 2;
    font-size: 13px;
    line-height: 1.6;
    color: var(--el-text-color-secondary);
    -webkit-box-orient: vertical;
  }
}

.app-card--primary {
  --app-color: var(--el-color-primary);
  --app-color-light: var(--el-color-primary-light-3);
  --app-bg: var(--el-color-primary-light-9);
  --app-shadow: rgb(64 158 255 / 30%);
}

.app-card--success {
  --app-color: var(--el-color-success);
  --app-color-light: var(--el-color-success-light-3);
  --app-bg: var(--el-color-success-light-9);
  --app-shadow: rgb(103 194 58 / 30%);
}

.app-card--warning {
  --app-color: var(--el-color-warning);
  --app-color-light: var(--el-color-warning-light-3);
  --app-bg: var(--el-color-warning-light-9);
  --app-shadow: rgb(230 162 60 / 30%);
}

.app-card--info {
  --app-color: var(--el-color-info);
  --app-color-light: var(--el-color-info-light-3);
  --app-bg: var(--el-color-info-light-9);
  --app-shadow: rgb(144 147 153 / 30%);
}
</style>
