
import { defineStore } from "pinia";
import { store } from "@/store";
// import {Module} from "vuex";
import {TagsViewState,RootStateTypes} from "@store/interface";

const tagsViewStore=defineStore({
    id:"youlai-tagsView",
    state:():TagsViewState=>( {
        visitedViews: [],
        cachedViews: []
    }),
    actions: {
        async ADD_VISITED_VIEW ( view:any) {
            if (this.visitedViews.some(v => v.path === view.path)) return
            this.visitedViews.push(
                Object.assign({}, view, {
                    title: view.meta?.title || 'no-name'
                })
            )
        },
        async  ADD_CACHED_VIEW(view:any) {
            if (this.cachedViews.includes(view.name)) return
            if (!view.meta.noCache) {
                this.cachedViews.push(view.name)
            }
        },

        async  DEL_VISITED_VIEW( view:any) {
            for (const [i, v] of this.visitedViews.entries()) {
                if (v.path === view.path) {
                    this.visitedViews.splice(i, 1)
                    break
                }
            }
        },
        async  DEL_CACHED_VIEW ( view:any)  {
            const index = this.cachedViews.indexOf(view.name)
            index > -1 && this.cachedViews.splice(index, 1)
        },

        async DEL_OTHERS_VISITED_VIEWS (view:any) {
            this.visitedViews = this.visitedViews.filter(v => {
                return v.meta?.affix || v.path === view.path
            })
        },
        async DEL_OTHERS_CACHED_VIEWS( view:any) {
            const index = this.cachedViews.indexOf(view.name)
            if (index > -1) {
                this.cachedViews = this.cachedViews.slice(index, index + 1)
            } else {
                // if index = -1, there is no cached tags
                this.cachedViews = []
            }
        },

        DEL_ALL_VISITED_VIEWS() {
            // keep affix tags
            const affixTags = this.visitedViews.filter(tag => tag.meta?.affix)
            this.visitedViews = affixTags
        },
        DEL_ALL_CACHED_VIEWS()  {
            this.cachedViews = []
        },

        UPDATE_VISITED_VIEW (view:any) {
            for (let v of this.visitedViews) {
                if (v.path === view.path) {
                    v = Object.assign(v, view)
                    break
                }
            }
        },
        addView( view:any) {
           this.addVisitedView( view)
            this.addCachedView(view)
        },
        addVisitedView( view:any) {
          this.ADD_VISITED_VIEW( view)
        },
        addCachedView( view:any) {
           this.ADD_CACHED_VIEW(view)
        },
        delView( view:any) {
            return new Promise(resolve => {
               this.delVisitedView(view)
                this.delCachedView( view)
                resolve({
                    visitedViews: [...this.visitedViews],
                    cachedViews: [...this.cachedViews]
                })
            })
        },
        delVisitedView( view:any) {
            return new Promise(resolve => {
               this.DEL_VISITED_VIEW( view)
                resolve([...this.visitedViews])
            })
        },
        delCachedView( view:any) {
            return new Promise(resolve => {
               this.DEL_CACHED_VIEW(view)
                resolve([...this.cachedViews])
            })
        },
        delOthersViews( view:any) {
            return new Promise(resolve => {
               this.delOthersVisitedViews(view)
               this.delOthersCachedViews(view)
                resolve({
                    visitedViews: [...this.visitedViews],
                    cachedViews: [...this.cachedViews]
                })
            })
        },
        delOthersVisitedViews( view:any) {
            return new Promise(resolve => {
               this.DEL_OTHERS_VISITED_VIEWS(view)
                resolve([...this.visitedViews])
            })
        },
        delOthersCachedViews( view:any) {
            return new Promise(resolve => {
               this.DEL_OTHERS_CACHED_VIEWS(view)
                resolve([...this.cachedViews])
            })
        },

        delAllViews( view:any) {
            return new Promise(resolve => {
               this.delAllVisitedViews()
                this.delAllCachedViews()
                resolve({
                    visitedViews: [...this.visitedViews],
                    cachedViews: [...this.cachedViews]
                })
            })
        },
        delAllVisitedViews() {
            return new Promise(resolve => {
               this.DEL_ALL_VISITED_VIEWS
                resolve([...this.visitedViews])
            })
        },
        delAllCachedViews() {
            return new Promise(resolve => {
               this.DEL_ALL_CACHED_VIEWS
                resolve([...this.cachedViews])
            })
        },
        updateVisitedView( view:any) {
           this.UPDATE_VISITED_VIEW(view)
        }
    }
})


export function tagsViewStoreHook() {
    return tagsViewStore(store);
}

