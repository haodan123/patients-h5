<template>
  <template v-for="{ id, msg, msgType, from, createTime, fromAvatar } in list" :key="id">
    <!-- 病情描述 -->
    <div class="msg msg-illness" v-if="msgType === MsgType.CardPat">
      <div class="patient van-hairline--bottom" v-if="msg.consultRecord">
        <p>
          {{ msg.consultRecord?.patientInfo.name }}
          {{ msg.consultRecord?.patientInfo.genderValue }} {{ msg.consultRecord?.patientInfo.age }}
        </p>
        <p>
          {{ getIllnessTimeText(msg.consultRecord?.illnessTime) }} |
          {{ getConsultFlagText(msg.consultRecord?.consultFlag) }}
        </p>
      </div>
      <van-row>
        <van-col span="6">病情描述</van-col>
        <van-col span="18">{{ msg.consultRecord?.illnessDesc }}</van-col>
        <van-col span="6">图片</van-col>
        <van-col span="18" @click="previewImg(msg.consultRecord?.pictures)">点击查看</van-col>
      </van-row>
    </div>

    <!-- 温馨提示-通知 -->
    <div class="msg msg-tip" v-if="msgType === MsgType.NotifyTip">
      <div class="content">
        <span class="green">温馨提示：</span>
        <span>{{ msg.content }}</span>
      </div>
    </div>

    <!-- 通知 -->
    <div class="msg msg-tip" v-if="msgType === MsgType.Notify">
      <div class="content">
        <span>{{ msg.content }}</span>
      </div>
    </div>

    <!-- 发送文字 -->
    <div class="msg msg-to" v-if="msgType === MsgType.MsgText && store.user?.id === from">
      <div class="content">
        <div class="time">{{ formatTime(createTime) }}</div>
        <div class="pao">{{ msg.content }}</div>
      </div>
      <van-image :src="store.user?.avatar" />
    </div>

    <!-- 发送图片 -->
    <div class="msg msg-to" v-if="msgType === MsgType.MsgImage && from === store.user?.id">
      <div class="content" v-if="msg.picture">
        <div class="time">{{ formatTime(createTime) }}</div>
        <van-image fit="contain" :src="msg.picture?.url" @click="previewImg()" />
      </div>
      <van-image :src="store.user?.avatar" />
    </div>

    <!-- 接受图片 -->
    <div class="msg msg-from" v-if="msgType === MsgType.MsgImage && from !== store.user?.id">
      <van-image :src="fromAvatar" />
      <div class="content" v-if="msg.picture">
        <div class="time">{{ formatTime(createTime) }}</div>
        <van-image fit="contain" :src="msg.picture?.url" @click="previewImg()" />
      </div>
    </div>

    <!-- 接受文字 -->
    <div class="msg msg-from" v-if="msgType === MsgType.MsgText && from !== store.user?.id">
      <van-image :src="fromAvatar" />
      <div class="content">
        <div class="time">{{ formatTime(createTime) }}</div>
        <div class="pao">{{ msg.content }}</div>
      </div>
    </div>

    <!-- 处方消息 -->
    <div class="msg msg-recipe" v-if="msgType === MsgType.CardPre">
      <div class="content" v-if="msg.prescription">
        <div class="head van-hairline--bottom">
          <div class="head-tit">
            <h3>电子处方</h3>
            <p @click="showPrescription(msg.prescription?.id)">
              原始处方 <van-icon name="arrow"></van-icon>
            </p>
          </div>
          <p>
            {{ msg.prescription.name }}
            {{ msg.prescription.genderValue }}
            {{ msg.prescription.age }}岁
            {{ msg.prescription.diagnosis }}
          </p>
          <p>开方时间：{{ msg.prescription.createTime }}</p>
        </div>
        <div class="body">
          <div class="body-item" v-for="med in msg.prescription.medicines" :key="med.id">
            <div class="durg">
              <p>{{ med.name }} {{ med.specs }}</p>
              <p>{{ med.usageDosag }}</p>
            </div>
            <div class="num">x{{ med.quantity }}</div>
          </div>
        </div>
        <div class="foot"><span @click="buy(msg.prescription)">购买药品</span></div>
      </div>
    </div>
    <div
      class="msg msg-comment"
      v-if="msgType === MsgType.CardEva || msgType === MsgType.CardEvaForm"
    >
      <evaluate-card :evaluateDoc="msg.evaluateDoc" />
    </div>

    <!-- 订单取消 -->
    <div class="msg msg-tip msg-tip-cancel" v-if="msgType === MsgType.NotifyCancel">
      <div class="content">
        <span>{{ msg.content }}</span>
      </div>
    </div>
  </template>
</template>

<script setup lang="ts">
import { MsgType, PrescriptionStatus } from '@/enums'
import type { Message, Prescription } from '@/types/room'
import type { IllnessTime } from '@/enums'
import { flagOptions, timeOptions } from '@/services/constants'
import { showImagePreview, showToast } from 'vant'
import type { Image } from '@/types/consult'
import { useUserStore } from '@/stores'
import dayjs from 'dayjs'
// import { getPrescriptionPic } from '@/services/consult'
import { useRouter } from 'vue-router'
import EvaluateCard from './EvaluateCard.vue'
import { useShowPrescription } from '@/composable/index'
const store = useUserStore()
defineProps<{ list: Message[] }>()
const router = useRouter()
// 查看处方
const { showPrescription } = useShowPrescription()

// 购买药品
const buy = async (pre?: Prescription) => {
  if (!pre) return
  // 订单无效
  if (pre.status === PrescriptionStatus.Invalid) return showToast('处方已失效')
  // 未支付 或者 没有这个订单
  if (pre.status === PrescriptionStatus.NotPayment && !pre.orderId) {
    return router.push(`/order/pay?id=${pre.id}`)
  }
  // 未支付 有订单 或者已支付 去药品订单详情
  router.push(`/order/${pre.orderId}`)
}

// 格式化时间,只显示 分钟和秒
const formatTime = (time: string) => dayjs(time).format('HH:mm')

// 图片预览方法
const previewImg = (pictures?: Image[]) => {
  // showImagePreview(pictures)
  if (pictures && pictures.length) {
    showImagePreview(pictures.map((item) => item.url))
  }
}
// 获取患病时间文字
const getIllnessTimeText = (time?: IllnessTime) => {
  return timeOptions.find((item) => item.value === time)?.label
}
// 获取是否就诊文字
const getConsultFlagText = (flag?: 0 | 1) => {
  return flagOptions.find((item) => item.value === flag)?.label
}
</script>

<style lang="scss" scoped>
@import '@/styles/room.scss';
</style>
