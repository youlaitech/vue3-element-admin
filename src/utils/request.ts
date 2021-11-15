import axios from "axios";
import {ElMessage, ElMessageBox} from "element-plus";
import {Session} from "@utils/storage";


// 创建 axios 实例
const service = axios.create({
    baseURL: import.meta.env.VITE_BASE_API as any,
    timeout: 50000,
    headers: {'Content-Type': 'application/json;charset=utf-8'}
})

// 请求拦截器
service.interceptors.request.use(
    (config) => {
        if (!config?.headers) {
            throw new Error(`Expected 'config' and 'config.headers' not to be undefined`);
        }
        if (Session.get('token')) {
            config.headers.Authorization = `${Session.get('token')}`;
        }

    }, (error) => {
        return Promise.reject(error);
    }
)

// 响应拦截器
service.interceptors.response.use(
    ({data}) => {
        // 对响应数据做点什么
        const {code, msg} = data;
        if (code === '00000') {
            return data;
        } else {
            ElMessage({
                message: msg || '系统出错',
                type: 'error'
            })
            return Promise.reject(new Error(msg || 'Error'))
        }
    },
    (error) => {
        const {code, msg} = error.response.data
        if (code === 'A0230') {  // token 过期
            Session.clear(); // 清除浏览器全部临时缓存
            window.location.href = '/'; // 跳转登录页
            ElMessageBox.alert('当前页面已失效，请重新登录', '提示', {})
                .then(() => {
                })
                .catch(() => {
                });
        }
        return Promise.reject(new Error(msg || 'Error'))
    }
);

// 导出 axios 实例
export default service