import { followDoctor } from '@/services/consult'
import type { FollowType } from '@/types/consult'
import { ref } from 'vue'

// 封装关注的hook
export const useFollow = (type: FollowType = 'doc') => {
  const loading = ref(false)
  const follow = async (obj: { id: string; likeFlag: 0 | 1 }) => {
    loading.value = true
    try {
      await followDoctor(obj.id, type)
      obj.likeFlag = obj.likeFlag === 1 ? 0 : 1
    } finally {
      loading.value = false
    }
  }

  return { loading, follow }
}
