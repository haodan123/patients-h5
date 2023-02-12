import type { User } from '@/types/user'
import { defineStore } from 'pinia'
import { ref } from 'vue'
// 用户状态仓库
export const useUserStore = defineStore(
  'userStore',
  () => {
    // state
    // 用户信息
    const user = ref<User>()
    // action
    // 修改用户信息
    const setUser = (u: User) => {
      user.value = u
    }

    // 删除用户信息
    const delUser = () => {
      user.value = undefined
    }

    // 记录回跳地址
    const returnUrl = ref('')
    const setReturnUrl = (url: string) => (returnUrl.value = url)

    // getter
    return { user, setUser, delUser, setReturnUrl, returnUrl }
  },
  {
    // 开启持久化数据 储存到localstore中
    persist: true
  }
)
