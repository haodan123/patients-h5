import { deleteOrder } from '@/services/consult'
import type { ConsultOrderItem } from '@/types/consult'
import { showFailToast, showSuccessToast } from 'vant'
import { ref } from 'vue'

// 删除订单,删除成功做的事不确定,可以通过传入函数实现
export const useDeleteOrder = (cb: () => void) => {
  const deleteLoading = ref(false)
  const deleteConsultOrder = async (item: ConsultOrderItem) => {
    deleteLoading.value = true
    try {
      await deleteOrder(item.id)
      showSuccessToast('删除成功')
      // 通知父组件删除这条订单
      // emit('on-delete', item.id)
      //如果传入了这个函数就调用
      cb && cb()
    } catch (error) {
      showFailToast('删除失败')
    } finally {
      deleteLoading.value = false
    }
  }

  return { deleteLoading, deleteConsultOrder }
}
