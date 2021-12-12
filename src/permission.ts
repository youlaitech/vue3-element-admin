import router from "@router";
import NProgress from 'nprogress';
import {ElMessage} from "element-plus";
import {store} from "@store";

NProgress.configure({showSpinner: false})

// 白名单
const whiteList = ['/login', '/auth-redirect']

router.beforeEach(async (to, form, next) => {
    NProgress.start()

    const hasToken = store.state.user.token
    if (hasToken) {
        // 如果登录成功，跳转到首页
        if (to.path === '/login') {
            next({path: '/'})
            NProgress.done()
        } else {
            const hasGetUserInfo = store.state.user.roles.length > 0
            if (hasGetUserInfo) {
                next()
            } else {
                try {
                    await store.dispatch('user/getUserInfo')
                    const roles = store.state.user.roles
                    const accessRoutes = await store.dispatch('permission/generateRoutes', roles)
                    accessRoutes.forEach((route: any) => {
                        router.addRoute(route)
                    })
                    next({...to, replace: true})
                } catch (error) {
                    // remove token and go to login page to re-login
                    await store.dispatch('user/resetToken')
                    ElMessage.error(error as any || 'Has Error')
                    next(`/login?redirect=${to.path}`)
                    NProgress.done()
                }
            }
        }
    } else {
        /* has no token*/
        if (whiteList.indexOf(to.path) !== -1) {
            next()
        } else {
            next(`/login?redirect=${to.path}`)
            NProgress.done()
        }
    }
})

router.afterEach(() => {
    NProgress.done()
})