import { createPinia } from 'pinia'
import persist from 'pinia-plugin-persistedstate'
// 导出其他仓库
export * from './user'
export * from './consult'

const pinia = createPinia()
// 数据持久化插件
pinia.use(persist)

export default pinia
