import { createPinia } from 'pinia'
import persist from 'pinia-plugin-persistedstate'
// 导出其他仓库
export * from './user'

const pinia = createPinia()
pinia.use(persist)

export default pinia
