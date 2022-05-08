// 全局组件类型声明
import Pagination from '@/components/Pagination/index.vue';

declare module '@vue/runtime-core' {
  export interface GlobalComponents {
    Pagination: typeof Pagination;
  }
}
export {};
