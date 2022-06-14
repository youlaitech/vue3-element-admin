import { defineStore } from 'pinia';
import { TagsViewState } from '@/types/store/tagsview';

const useTagsViewStore = defineStore({
  id: 'tagsView',
  state: (): TagsViewState => ({
    visitedViews: [],
    cachedViews: [], //  keepAlive 缓存页面
  }),
  actions: {
    addVisitedView(view: any) {
      if (this.visitedViews.some((v) => v.path === view.path)) return;
      if (view.meta && view.meta.affix) {
        this.visitedViews.unshift(
          Object.assign({}, view, {
            title: view.meta?.title || 'no-name',
          })
        );
      } else {
        this.visitedViews.push(
          Object.assign({}, view, {
            title: view.meta?.title || 'no-name',
          })
        );
      }
    },
    addCachedView(view: any) {
      if (this.cachedViews.includes(view.name)) return;
      if (view.meta.keepAlive) {
        this.cachedViews.push(view.name);
      }
    },
    delVisitedView(view: any) {
      return new Promise((resolve) => {
        for (const [i, v] of this.visitedViews.entries()) {
          if (v.path === view.path) {
            this.visitedViews.splice(i, 1);
            break;
          }
        }
        resolve([...this.visitedViews]);
      });
    },
    delCachedView(view: any) {
      return new Promise((resolve) => {
        const index = this.cachedViews.indexOf(view.name);
        index > -1 && this.cachedViews.splice(index, 1);
        resolve([...this.cachedViews]);
      });
    },
    delOtherVisitedViews(view: any) {
      return new Promise((resolve) => {
        this.visitedViews = this.visitedViews.filter((v) => {
          return v.meta?.affix || v.path === view.path;
        });
        resolve([...this.visitedViews]);
      });
    },
    delOtherCachedViews(view: any) {
      return new Promise((resolve) => {
        const index = this.cachedViews.indexOf(view.name);
        if (index > -1) {
          this.cachedViews = this.cachedViews.slice(index, index + 1);
        } else {
          // if index = -1, there is no cached tags
          this.cachedViews = [];
        }
        resolve([...this.cachedViews]);
      });
    },

    updateVisitedView(view: any) {
      for (let v of this.visitedViews) {
        if (v.path === view.path) {
          v = Object.assign(v, view);
          break;
        }
      }
    },
    addView(view: any) {
      this.addVisitedView(view);
      this.addCachedView(view);
    },
    delView(view: any) {
      return new Promise((resolve) => {
        this.delVisitedView(view);
        this.delCachedView(view);
        resolve({
          visitedViews: [...this.visitedViews],
          cachedViews: [...this.cachedViews],
        });
      });
    },
    delOtherViews(view: any) {
      return new Promise((resolve) => {
        this.delOtherVisitedViews(view);
        this.delOtherCachedViews(view);
        resolve({
          visitedViews: [...this.visitedViews],
          cachedViews: [...this.cachedViews],
        });
      });
    },
    delLeftViews(view: any) {
      return new Promise((resolve) => {
        const currIndex = this.visitedViews.findIndex(
          (v) => v.path === view.path
        );
        if (currIndex === -1) {
          return;
        }
        this.visitedViews = this.visitedViews.filter((item, index) => {
          // affix:true 固定tag，例如“首页”
          if (index >= currIndex || (item.meta && item.meta.affix)) {
            return true;
          }

          const cacheIndex = this.cachedViews.indexOf(item.name as string);
          if (cacheIndex > -1) {
            this.cachedViews.splice(cacheIndex, 1);
          }
          return false;
        });
        resolve({
          visitedViews: [...this.visitedViews],
        });
      });
    },
    delRightViews(view: any) {
      return new Promise((resolve) => {
        const currIndex = this.visitedViews.findIndex(
          (v) => v.path === view.path
        );
        if (currIndex === -1) {
          return;
        }
        this.visitedViews = this.visitedViews.filter((item, index) => {
          // affix:true 固定tag，例如“首页”
          if (index <= currIndex || (item.meta && item.meta.affix)) {
            return true;
          }

          const cacheIndex = this.cachedViews.indexOf(item.name as string);
          if (cacheIndex > -1) {
            this.cachedViews.splice(cacheIndex, 1);
          }
          return false;
        });
        resolve({
          visitedViews: [...this.visitedViews],
        });
      });
    },
    delAllViews() {
      return new Promise((resolve) => {
        const affixTags = this.visitedViews.filter((tag) => tag.meta?.affix);
        this.visitedViews = affixTags;
        this.cachedViews = [];
        resolve({
          visitedViews: [...this.visitedViews],
          cachedViews: [...this.cachedViews],
        });
      });
    },
    delAllVisitedViews() {
      return new Promise((resolve) => {
        const affixTags = this.visitedViews.filter((tag) => tag.meta?.affix);
        this.visitedViews = affixTags;
        resolve([...this.visitedViews]);
      });
    },
    delAllCachedViews() {
      return new Promise((resolve) => {
        this.cachedViews = [];
        resolve([...this.cachedViews]);
      });
    },
  },
});

export default useTagsViewStore;
