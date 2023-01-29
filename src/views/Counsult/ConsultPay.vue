<template>
  <div class="consult-pay-page" v-if="payInfo && patient">
    <cp-nav-bar title="支付"></cp-nav-bar>
    <div class="pay-info">
      <p class="tit">图文问诊 {{ payInfo?.payment }} 元</p>
      <img class="img" src="@/assets/avatar-doctor.svg" />
      <p class="desc">
        <span>极速问诊</span>
        <span>自动分配医生</span>
      </p>
    </div>
    <van-cell-group>
      <van-cell title="优惠券" :value="`-¥${payInfo.couponDeduction}`" />
      <van-cell title="积分抵扣" :value="`-¥${payInfo.pointDeduction}`" />
      <van-cell title="实付款" :value="`¥${payInfo.actualPayment}`" class="pay-price" />
    </van-cell-group>
    <div class="pay-space"></div>
    <van-cell-group>
      <van-cell
        title="患者信息"
        :value="`${patient?.name} | ${patient?.genderValue} | ${patient?.age}岁`"
      ></van-cell>
      <van-cell title="病情描述" :label="store.consult.illnessDesc"></van-cell>
    </van-cell-group>
    <div class="pay-schema">
      <van-checkbox v-model="agree">我已同意 <span class="text">支付协议</span></van-checkbox>
    </div>
    <van-submit-bar
      button-type="primary"
      :price="payInfo.actualPayment * 100"
      button-text="立即支付"
      text-align="left"
      @click="openSheet"
      :loading="loading"
    />
    <van-action-sheet
      v-model:show="show"
      title="选择支付方式"
      :closeable="false"
      :before-close="onClose"
      :close-on-popstate="false"
    >
      <div class="pay-type">
        <p class="amount">￥{{ payInfo.actualPayment.toFixed(2) }}</p>
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
  </div>
  <div class="consult-pay-page" v-else>
    <van-skeleton title :row="3" />

    <van-skeleton title :row="3" />
    <van-skeleton title :row="3" />
  </div>
</template>

<script setup lang="ts">
import {
  getConsultOrderPre,
  getPatientDetail,
  createConsultOrder,
  getConsultOrderPayUrl
} from '@/services/consult'
import { useConsultStore } from '@/stores'
import type { ConsultOrderPreData } from '@/types/consult'
import type { Patient } from '@/types/user'
import { showConfirmDialog, showDialog, showLoadingToast, showToast } from 'vant'
import { onMounted, ref } from 'vue'
import { onBeforeRouteLeave, useRouter } from 'vue-router'

// 获取订单相关信息
const store = useConsultStore()
const payInfo = ref<ConsultOrderPreData>()
// 获取预支付订单信息
const loadPayInfo = async () => {
  const res = await getConsultOrderPre({
    type: store.consult.type,
    illnessType: store.consult.illnessType
  })
  payInfo.value = res.data
  // console.log(payInfo.value)
}
// 获取患者信息
const patient = ref<Patient>()
const loadPatinent = async () => {
  // 如果没有患者id 就终止
  if (!store.consult.patientId) return
  const res = await getPatientDetail(store.consult.patientId)
  patient.value = res.data
}
// 同意协议
const agree = ref(false)
onMounted(() => {
  if (
    !store.consult.type ||
    !store.consult.illnessType ||
    !store.consult.depId ||
    !store.consult.patientId
  ) {
    return showDialog({
      title: '温馨提示',
      message: '问诊信息不完整请重新填写，如有未支付的问诊订单可在问诊记录中继续支付',
      closeOnPopstate: false
    }).then(() => {
      router.push('/')
    })
  }
  loadPayInfo()
  loadPatinent()
})

// 生成订单
const loading = ref(false)
// 是否显示支付弹窗
const show = ref(false)
// 0为微信支付 1为支付宝支付
const paymentMethod = ref<0 | 1>()
// 订单id
const orderId = ref('')
// 打开支付弹窗 生成订单
const openSheet = async () => {
  if (!agree.value) return showToast('请勾选我已同意用户协议')
  loading.value = true
  // 生成订单
  const res = await createConsultOrder(store.consult)
  orderId.value = res.data.id
  loading.value = false
  // 存储到pinia的数据已经存储到后台了 可以清空了
  store.clear()
  // 打开弹窗
  show.value = true
}
const router = useRouter()
// 开始支付
// 1.隐藏抽屉的关闭按钮
// 2.再关闭抽屉的时候,确认框提示,仍要关闭 进入到问诊记录 句许支付:关闭确认框
// 3.如果已经生成了订单 回退的时候拦截
// 离开路由前做什么事情  return false代表不能跳转路由
onBeforeRouteLeave(() => {
  // 如果orderId没被清空了 代表已经生成了订单  就不能跳转路由
  if (orderId.value) return false
})
// 4.生成支付地址然后跳转 掉后台的接口
// 5.刷新页面的时候,判断是否问诊记录存在,不存在就alert提示,确认后回到首页
const onClose = () => {
  console.log(111)
  return showConfirmDialog({
    title: '关闭支付',
    message: '取消支付将无法获得医生回复，医生接诊名额有限，是否确认关闭？',
    cancelButtonText: '仍要关闭',
    confirmButtonText: '继续支付',
    confirmButtonColor: 'var(--cp-primary)'
  })
    .then(() => {
      // 不关闭抽屉
      return false
    })
    .catch(() => {
      orderId.value = ''
      router.push('/user/consult')
      // 关闭抽屉
      return true
    })
}

// 支付
const pay = async () => {
  if (paymentMethod.value === undefined) return showToast('请选择支付防止')
  showLoadingToast('跳转支付')
  // 生成支付链接
  const res = await getConsultOrderPayUrl({
    orderId: orderId.value,
    paymentMethod: paymentMethod.value,
    // 支付完成后跳转的路由地址
    payCallback: 'http://localhost:5173/room'
  })
  // 跳转到链接里支付
  window.location.href = res.data.payUrl
}
</script>

<style scoped lang="scss">
.consult-pay-page {
  padding: 46px 0 50px 0;
}
.pay-info {
  display: flex;
  padding: 15px;
  flex-wrap: wrap;
  align-items: center;
  .tit {
    width: 100%;
    font-size: 16px;
    margin-bottom: 10px;
  }
  .img {
    margin-right: 10px;
    width: 38px;
    height: 38px;
    border-radius: 4px;
    overflow: hidden;
  }
  .desc {
    flex: 1;
    > span {
      display: block;
      color: var(--cp-tag);
      &:first-child {
        font-size: 16px;
        color: var(--cp-text2);
      }
    }
  }
}
.pay-price {
  ::v-deep() {
    .vam-cell__title {
      font-size: 16px;
    }
    .van-cell__value {
      font-size: 16px;
      color: var(--cp-price);
    }
  }
}
.pay-space {
  height: 12px;
  background-color: var(--cp-bg);
}
.pay-schema {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  .text {
    color: var(--cp-primary);
  }
}
::v-deep() {
  .van-submit-bar__button {
    font-weight: normal;
    width: 160px;
  }
}
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
