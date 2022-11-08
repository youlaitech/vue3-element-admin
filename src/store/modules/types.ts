import { RouteLocationNormalized, RouteRecordRaw } from 'vue-router';

export interface AppState {
  device: string;
  sidebar: {
    opened: boolean;
    withoutAnimation: boolean;
  };
  language: string;
  size: string;
}

export interface PermissionState {
  routes: RouteRecordRaw[];
  addRoutes: RouteRecordRaw[];
}

export interface SettingState {
  theme: string;
  tagsView: boolean;
  fixedHeader: boolean;
  showSettings: boolean;
  sidebarLogo: boolean;
}

export interface UserState {
  token: string;
  nickname: string;
  avatar: string;
  roles: string[];
  perms: string[];
}

export interface TagView extends Partial<RouteLocationNormalized> {
  title?: string;
}

export interface TagsViewState {
  visitedViews: TagView[];
  cachedViews: string[];
}
