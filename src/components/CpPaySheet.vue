<template>
  <!-- 把v-model:show拆分开来  做第二次封装 -->
  <van-action-sheet
    :show="show"
    @update:show="emit('update:show', $event)"
    title="选择支付方式"
    :closeable="false"
    :before-close="onClose"
    :close-on-popstate="false"
  >
    <div class="pay-type">
      <p class="amount">￥{{ actualPayment.toFixed(2) }}</p>
      <van-cell-group>
        <van-cell title="微信支付" @click="paymentMethod = 0">
          <template #icon><cp-icon name="consult-wechat" /></template>
          <template #extra><van-checkbox :checked="paymentMethod === 0" /></template>
        </van-cell>
        <van-cell title="支付宝支付" @click="paymentMethod = 1">
          <template #icon><cp-icon name="consult-alipay" /></template>
          <template #extra><van-checkbox :checked="paymentMethod === 1" /></template>
        </van-cell>
      </van-cell-group>
      <div class="btn">
        <van-button type="primary" round block @click="pay">立即支付</van-button>
      </div>
    </div>
  </van-action-sheet>
</template>

<script setup lang="ts">
import { getConsultOrderPayUrl } from '@/services/consult'
import { showLoadingToast, showToast } from 'vant'
import { ref } from 'vue'

const props = defineProps<{
  show: boolean //是否显示该组件
  actualPayment: number //支付金额
  onClose?: () => void //关闭后执行的函数
  orderId: string //订单id
  payCallback: string //支付成功后去的页面
}>()

// v-model:show ===  :modelShow   & @update:show =""
const emit = defineEmits<{
  (e: 'update:show', show: boolean): void
}>()

// 支持选择支付方式
const paymentMethod = ref<0 | 1>()

// 支付
const pay = async () => {
  if (paymentMethod.value === undefined) return showToast('请选择支付方式')
  showLoadingToast('跳转支付')
  // 生成支付链接
  const res = await getConsultOrderPayUrl({
    orderId: props.orderId,
    paymentMethod: paymentMethod.value,
    // 支付完成后跳转的路由地址
    payCallback: import.meta.env.VITE_APP_CALLBACK + props.payCallback
    // payCallback: props.payCallback
  })
  // 跳转到链接里支付
  window.location.href = res.data.payUrl
}
</script>

<style scoped lang="scss">
.pay-type {
  .amount {
    padding: 20px;
    text-align: center;
    font-size: 16px;
    font-weight: bold;
  }
  .btn {
    padding: 15px;
  }
  .van-cell {
    align-items: center;
    .cp-icon {
      margin-right: 10px;
      font-size: 18px;
    }
    .van-checkbox :deep(.van-checkbox__icon) {
      font-size: 16px;
    }
  }
}
</style>
