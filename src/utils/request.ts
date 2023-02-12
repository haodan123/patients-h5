import router from '@/router'
import { useUserStore } from '@/stores'
import axios, { type Method } from 'axios'
import { showToast } from 'vant'

const baseURL = 'https://consult-api.itheima.net/'
// const baseURL = import.meta.env.BASE_URL

const http = axios.create({
  baseURL,
  timeout: 10000
})
// 请求拦截器
http.interceptors.request.use(
  (config) => {
    const store = useUserStore()

    // 请求头添加token
    if (store.user?.token && config.headers && config.headers) {
      typeof config.headers.set === 'function' &&
        config.headers.set('Authorization', `Bearer ${store.user?.token}`)
    }
    return config
  },
  (err) => {
    Promise.reject(err)
  }
)

// 响应拦截器
http.interceptors.response.use(
  (res) => {
    // 后台约定，响应成功，但是code不是10000，是业务逻辑失败
    if (res.data?.code !== 10000) {
      showToast(res.data?.message || '业务失败')
      return Promise.reject(res.data)
    }
    // 业务逻辑成功，返回响应数据，作为axios成功的结果
    return res.data
  },
  (err) => {
    if (err.response.status === 401) {
      // 删除用户信息
      const store = useUserStore()
      store.delUser()
      // 跳转登录，带上接口失效所在页面的地址，登录完成后回跳使用
      router.push({
        path: '/login',
        query: { returnUrl: router.currentRoute.value.fullPath }
      })
    }
    return Promise.reject(err)
  }
)

// 4. 请求工具函数
type Data<T> = {
  code: number
  message: string
  data: T
}
// 4. 请求工具函数
const request = <T>(url: string, method: Method = 'get', submitData?: object) => {
  return http.request<T, Data<T>>({
    url,
    method,
    [method.toLowerCase() === 'get' ? 'params' : 'data']: submitData
  })
}

export { http, request, baseURL }
