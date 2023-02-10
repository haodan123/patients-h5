import { OrderType } from '@/enums'
import { cancelOrder } from '@/services/consult'
import type { ConsultOrderItem } from '@/types/consult'
import { showFailToast, showSuccessToast } from 'vant'
import { ref } from 'vue'

// 取消订单hook封装
export const useConsultOrder = () => {
  const loading = ref(false)
  const cancelConsultOrder = async (item: ConsultOrderItem) => {
    loading.value = true
    try {
      await cancelOrder(item.id)
      item.status = OrderType.ConsultCancel
      item.statusValue = '已取消'
      showSuccessToast('取消成功')
    } catch (error) {
      showFailToast('取消失败')
    } finally {
      loading.value = false
    }
  }
  return { cancelConsultOrder, loading }
}
