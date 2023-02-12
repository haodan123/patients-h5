<template>
  <div class="consult-detail-page" v-if="item">
    <cp-nav-bar title="问诊详情"></cp-nav-bar>
    <div class="detail-head">
      <div class="text">
        <h3>图文问诊 {{ item.payment }} 元</h3>
        <span
          class="sta"
          :class="{
            orange: item.status === OrderType.ConsultPay,
            green: item.status === OrderType.ConsultChat
          }"
          >{{ item.statusValue }}</span
        >
        <p class="tip">服务医生信息</p>
      </div>
      <div class="card">
        <img src="@/assets/avatar-doctor.svg" class="avatar" />
        <p class="doc">
          <span>极速问诊</span>
          <span>{{ item.docInfo?.name }}</span>
        </p>
        <VanIcon name="arrow" />
      </div>

      <div class="detail-patient">
        <van-cell-group :border="false">
          <van-cell
            title="患者信息"
            :value="`${item.patientInfo.name} | ${item.patientInfo.genderValue} | ${item.patientInfo.age}岁`"
          />
          <van-cell title="患病时长" :value="getIllnessTimeText(item.illnessTime)" />
          <van-cell title="就诊情况" :value="getConsultFlagText(item.consultFlag)" />
          <van-cell title="病情描述" :label="item.illnessDesc" />
        </van-cell-group>
      </div>
      <div class="tetail-order">
        <h3>订单信息</h3>
        <van-cell-group :border="false">
          <van-cell title="订单编号">
            <template #value>
              <span class="copy" @click="onCopy">复制</span>
              {{ item.orderNo }}
            </template>
          </van-cell>
          <van-cell title="创建时间" :value="item.createTime" />
          <van-cell title="应付款" :value="`￥${item.payment}`" />
          <van-cell title="优惠券" :value="`-￥${item.couponDeduction}`" />
          <van-cell title="积分抵扣" :value="`-￥${item.pointDeduction}`" />
          <van-cell title="实付款" :value="`￥${item.actualPayment}`" class="price" />
        </van-cell-group>
      </div>
      <!-- 倒计时 -->
      <div class="detail-time" v-if="item.status === OrderType.ConsultPay">
        请在
        <van-count-down :time="item.countdown * 1000" /> 内完成支付，超时订单将取消
      </div>
      <!--支付 -->
      <div class="detail-action van-hairline--top" v-if="item.status === OrderType.ConsultPay">
        <div class="price">
          <span>需付款</span>
          <span>￥{{ item.actualPayment }}</span>
        </div>
        <!-- item!是非空断言  应为在 最上面已经做了v-if="item" 所以这里一定有值 -->
        <van-button plain size="small" :loading="loading" round @click="cancelConsultOrder(item!)"
          >取消问诊</van-button
        >
        <van-button type="primary" round @click="show = true">继续支付</van-button>
      </div>
      <div class="detail-action van-hairline--top" v-if="item.status === OrderType.ConsultWait">
        <van-button plain size="small" :loading="loading" round @click="cancelConsultOrder(item!)"
          >取消问诊</van-button
        >
        <van-button type="primary" round :to="`/room?orderId=${item.id}`">继续沟通</van-button>
      </div>
      <div class="detail-action van-hairline--top" v-if="item.status === OrderType.ConsultChat">
        <van-button type="default" round v-if="item.prescriptionId">查看处方</van-button>
        <van-button type="primary" round :to="`/room?orderId=${item.id}`">继续沟通</van-button>
      </div>
      <div class="detail-action van-hairline--top" v-if="item.status === OrderType.ConsultComplete">
        <cp-consult-more
          :disabled="!item.prescriptionId"
          @on-delete="deleteConsultOrder(item!)"
          @on-preview="showPrescription(item?.prescriptionId)"
        ></cp-consult-more>
        <van-button type="default" round :to="`/room?orderId=${item.id}`">问诊记录</van-button>
        <van-button type="primary" round v-if="item.evaluateId">写评价</van-button>
        <van-button type="default" round v-else>查看评价</van-button>
      </div>
      <div class="detail-action van-hairline--top" v-if="item.status === OrderType.ConsultCancel">
        <van-button type="default" round :loading="deleteLoading" @click="deleteConsultOrder(item!)"
          >删除订单</van-button
        >
        <van-button type="primary" round to="/">咨询其他医生</van-button>
      </div>
    </div>
    <!-- 支付的弹窗抽屉 -->
    <cp-pay-sheet
      pay-callback="/room"
      :actual-payment="item.actualPayment"
      :order-id="item.id"
      v-model:show="show"
    ></cp-pay-sheet>
  </div>
  <div class="consult-detail-page" v-else>
    <cp-nav-bar title="问诊详情" />
    <van-skeleton title :row="4" style="margin-top: 30px" />
    <van-skeleton title :row="4" style="margin-top: 30px" />
  </div>
</template>

<script setup lang="ts">
import { OrderType } from '@/enums'
import { getConsultOrderDetail } from '@/services/consult'
import type { ConsultOrderItem } from '@/types/consult'
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getConsultFlagText, getIllnessTimeText } from '@/utils/filter'
import { useConsultOrder, useDeleteOrder, useShowPrescription } from '@/composable'
import router from '@/router'
import { useClipboard } from '@vueuse/core'
import { showConfirmDialog, showSuccessToast, showToast } from 'vant'

const route = useRoute()
const item = ref<ConsultOrderItem>()
// 是否显示支付弹窗
const show = ref(false)

// 复制功能
//useClipboard   vueuse中的拷贝hook
// copy 拷贝方法  copied是否拷贝成功 isSupported系统是否支持拷贝
const { copy, copied, isSupported } = useClipboard()
const onCopy = () => {
  if (!isSupported.value) return showToast('未授权，不支持')
  // 拷贝
  copy(item.value?.orderNo || '')
}
// 监听copied是否拷贝成功 成功就弹框提示
watch(copied, () => {
  if (copied) showSuccessToast('已复制')
})

onMounted(async () => {
  const id = route.params.id as string
  const res = await getConsultOrderDetail(id)
  item.value = res.data
})

// 查看处方的hook
const { showPrescription } = useShowPrescription()

// 取消问诊的hook
const { loading, cancelConsultOrder } = useConsultOrder()

// 删除订单的hook
const { deleteConsultOrder, deleteLoading } = useDeleteOrder(() => router.push('/user/consult'))
</script>

<style scoped lang="scss">
.consult-detail-page {
  padding: 46px 0 110px 0;
}

.detail-head {
  height: 140px;
  position: relative;
  padding: 15px;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 135px;
    background: linear-gradient(180deg, rgba(44, 181, 165, 0), rgba(44, 181, 165, 0.2));
    border-bottom-left-radius: 150px 20px;
    border-bottom-right-radius: 150px 20px;
  }

  .text {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    padding: 10px 3px;

    .sta {
      color: var(--cp-tag);
      font-weight: 500;
      font-size: 16px;

      &.green {
        color: var(--cp-primary);
      }

      &.pramge {
        color: #f2994a;
      }
      &.orange {
        color: #f2994a;
      }
    }

    .tip {
      width: 100%;
      color: var(--cp-text3);
      margin: 5px;
    }
  }

  .card {
    height: 74px;
    background-color: #fff;
    border-radius: 8px;
    position: relative;
    display: flex;
    align-items: center;
    padding: 0 15px;
    box-shadow: 0px 0px 22px 0px rgba(229, 229, 229, 0.5);

    .avatar {
      width: 38px;
      height: 38px;
    }

    .doc {
      flex: 1;
      padding-left: 15px;

      > span {
        display: block;
        font-size: 16px;

        &:last-child {
          font-size: 13px;
          color: var(--cp-text3);
        }
      }
    }

    .van-icon {
      color: var(--cp-tip);
    }
  }
}

.detail-patient {
  &::after {
    content: '';
    display: block;
    height: 12px;
    background: var(--cp-bg);
  }
}

.tetail-order {
  padding-bottom: 80px;

  > h3 {
    padding: 10px 18px;
    font-weight: normal;
  }

  .copy {
    padding: 2px 10px;
    border: 1px solid var(--cp-primary);
    background-color: var(--cp-plain);
    color: var(--cp-primary);
    font-size: 12px;
    border-radius: 12px;
    margin-right: 10px;
  }

  :deep(.van-cell__title) {
    width: 70px;
    flex: none;
  }

  .price :deep(.van-cell__value) {
    font-size: 16px;
    color: var(--cp-price);
  }
}

.detail-action {
  height: 65px;
  width: 100%;
  position: fixed;
  left: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  background-color: #fff;
  justify-content: flex-end;
  padding: 0 15px;
  box-sizing: border-box;

  .price {
    flex: 1;

    > span:last-child {
      font-size: 18px;
      color: var(--cp-price);
      padding-left: 5px;
    }
  }

  .van-button {
    margin-left: 10px;
    padding-left: 17px;
    margin-right: 17px;
  }

  :deep(.van-button--default) {
    background-color: var(--cp-bg);
    color: var(--cp-text3);
  }
}

.van-cell {
  padding-left: 18px;
  padding-right: 18px;
}

// 倒计时样式
.detail-time {
  position: fixed;
  left: 0;
  bottom: 65px;
  width: 100%;
  height: 44px;
  background-color: #fff7eb;
  text-align: center;
  line-height: 44px;
  font-size: 13px;
  color: #f2994a;

  .van-count-down {
    display: inline;
    color: #f2994a;
  }
}
</style>
