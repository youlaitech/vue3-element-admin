import router from "@/router";
import { ElMessage } from "element-plus";
import useStore from "@/store";
import NProgress from 'nprogress';
import 'nprogress/nprogress.css'
NProgress.configure({ showSpinner: false }) // 进度环显示/隐藏


// 白名单
const whiteList = ['/login', '/auth-redirect']

router.beforeEach(async (to, form, next) => {
    NProgress.start()
    const { user, permission } = useStore()
    const hasToken = user.token
    if (hasToken) {
        // 如果登录成功，跳转到首页
        if (to.path === '/login') {
            next({ path: '/' })
            NProgress.done()
        } else {
            const hasGetUserInfo = user.roles.length > 0
            if (hasGetUserInfo) {
                next()
            } else {
                try {
                    await user.getUserInfo()
                    const roles = user.roles
                    const accessRoutes: any = await permission.generateRoutes(roles)
                    accessRoutes.forEach((route: any) => {
                        router.addRoute(route)
                    })
                    next({ ...to, replace: true })
                } catch (error) {
                    // remove token and go to login page to re-login
                    await user.resetToken()
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
