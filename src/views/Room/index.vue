<template>
  <div class="room-page">
    <cp-nav-bar title="问诊室" />
    <!-- 顶部通知栏 -->
    <room-status :status="consult?.status" :countdown="consult?.countdown"></room-status>
    <!-- 消息 -->
    <van-pull-refresh v-model="loading" @refresh="onRefresh">
      <room-message :list="list"></room-message>
    </van-pull-refresh>
    <!-- 底部的输入框 -->
    <!-- 如果还不是咨询状态 就不能发送消息 -->
    <room-action
      @send-image="sendImage"
      @send-text="sendText"
      :disabled="consult?.status !== OrderType.ConsultChat"
    ></room-action>
  </div>
</template>

<script setup lang="ts">
import RoomStatus from './components/RoomStatus.vue'
import RoomAction from './components/RoomAction.vue'
import RoomMessage from './components/RoomMessage.vue'
import { nextTick, onMounted, onUnmounted, provide, ref } from 'vue'
import { io } from 'socket.io-client'
import type { Socket } from 'socket.io-client'
import { baseURL } from '@/utils/request'
import { useUserStore } from '@/stores'
import { useRoute } from 'vue-router'
import type { TimeMessages, Message } from '@/types/room'
import { MsgType, OrderType } from '@/enums'
import type { ConsultOrderItem, Image } from '@/types/consult'

import { getConsultOrderDetail } from '@/services/consult'
import dayjs from 'dayjs'
import { showToast } from 'vant'
const route = useRoute()

const store = useUserStore()

// 消息数组
const list = ref<Message[]>([])

let socket: Socket
// 订单id
let orderId = route.query.orderId as string
// 订单详情
const consult = ref<ConsultOrderItem>()
// 回到屏幕底部
const moveFn = async () => {
  // 接受到消息后 回到最底部  渲染dom是异步的 所以要加nexttick
  await nextTick()
  window.scrollTo(0, document.body.scrollHeight)
}
//判断是否需要滚动到最底部  只有第一次需要
const initialMsg = ref(true)

onUnmounted(() => {
  // 卸载socket
  socket.close()
})
onMounted(() => {
  //绑定socket
  socket = io(baseURL, {
    // 身份认证
    auth: {
      token: `Bearer ${store.user?.token}`
    },
    // 订单ID
    query: {
      // 从路由中取出订单id  在建立连接的时候发送给 socket 服务器
      orderId: route.query.orderId
    }
  })

  socket.on('connect', () => {
    // 建立连接成功
    console.log('connect')
    //每次连接成功都要清空聊天记录 防止断开重连时把已有的聊天记录重复添加
    list.value = []
  })

  socket.on('error', (event) => {
    // 错误异常消息
    console.log('error', event)
  })

  socket.on('disconnect', () => {
    // 已经断开连接
    console.log('disconnect')
  })

  // 聊天记录( 支付完之后的默认消息)
  // 1.绑定消息记录时间,后台链接成功主动发送消息
  // 2. 拿到消息分组之后,处理成可以的消息列表 Message[]
  // 3. 响应式数据,接受数据,依据数据渲染即可
  // chatMsgList 为后台规定的字段 后台规定什么 就填入什么
  socket.on('chatMsgList', (res) => {
    const data: TimeMessages[] = res.data

    const arr: Message[] = []
    console.log(data)
    data.forEach((item, i) => {
      // 记录消息分组 第一组的时间,作为下次获取聊天记录的时间
      if (i === 0) time.value = item.createTime
      // 消息时间
      arr.push({
        id: item.createTime,
        msgType: MsgType.Notify,
        createTime: item.createTime,
        msg: {
          content: item.createTime
        }
      })
      // 默认消息
      arr.push(...item.items)
    })
    // 将处理好的数据放到list中
    list.value.unshift(...arr)

    // 没有聊天记录做个提示
    if (!data.length) {
      showToast('没有聊天记录了')
    }

    // 第一次获取数据要滚动到最底部  第一次滚动完之后 把initialMsg设置为fasle之后获取数据就不会滚动到最底部了
    nextTick(() => {
      if (initialMsg.value) {
        // 把之前的消息修改成已读   把arr的最后一条数据的id传给后台  把之前的所有信息都设置成已读
        socket.emit('updateMsgStatus', arr[arr.length - 1].id)
        window.scrollTo(0, document.body.scrollHeight)
        initialMsg.value = false
      }
    })
  })
  // 等链接连接成功之后,注册时间 , 订单状态发生变更就调用一次订单详情的接口
  socket.on('statusChange', async () => {
    const res = await getConsultOrderDetail(orderId)
    console.log(res)
    consult.value = res.data
  })
  // 接收到医生发送的消息
  socket.on('receiveChatMsg', async (msg: Message) => {
    console.log(msg)
    list.value.push(msg)
    // 把之前的消息修改成已读 把医生的最后一条数据的id传给后台  把之前的所有信息都设置成已读
    socket.emit('updateMsgStatus', msg.id)
    // 滚动到最下方
    moveFn()
  })
})

// 接诊状态的控制 (订单详情)
// 1.组件挂载后,需要知道当前的接诊状态
// 2. 订单状态变更后,需要知道已经变化,更新当前接诊状态
// 3. 依赖状态
// 3.1 状态拦 需要条件渲染, 有倒计时
// 3.2 操作栏 需要禁言和启用

onMounted(async () => {
  const res = await getConsultOrderDetail(orderId)
  // console.log(res)
  consult.value = res.data
})

// 发送消息
// 1. 底部操作拦组件 ,输入信息后传递给socket
// 2. 接受消息, on receiveChatMsg 接受服务器回的消息证明发送成功,追加到消息列表
// 3. 在渲染的时候,区分是自己发送的还是医生发送的
const sendText = async (e: string) => {
  console.log(e)
  socket.emit('sendChatMsg', {
    from: store.user?.id, //发送人的id
    to: consult.value?.docInfo?.id, //医生的id
    msgType: MsgType.MsgText, //消息类型 为文字
    msg: {
      content: e //发送的文字内容
    }
  })
  // 回到最底部
  moveFn()
}
// 发送图片
const sendImage = async (img: Image) => {
  socket.emit('sendChatMsg', {
    from: store.user?.id,
    to: consult.value?.docInfo?.id,
    msgType: MsgType.MsgImage,
    msg: { picture: img }
  })
  // 因为上传图片需要时间 不给定时 不能回到最底部
  setTimeout(() => {
    moveFn()
  }, 500)
}

// 加载更多聊天记录
//1.默认的聊天记录滚动到最底部   第二次,第三次, ..... 不需要滚动到底部
//2.实现下拉刷新效果
//3.下拉刷新后,发送一个获取聊天记录的消息给后台
//4.触发聊天记录时间,记录当前时间段最早的时间,作为发送聊天记录消息的参数给后台
//4.1判断如果有数据,追加到数组,如果没有数据,轻提示没有数据
const loading = ref(false)
// 初始化值是当前时间
const time = ref(dayjs().format('YYY-MM-DD HH:mm:ss'))
// 下拉 获取上面的聊天记录
const onRefresh = () => {
  socket.emit('getChatMsgList', 20, time.value, route.query.orderId)
  loading.value = false
}

// 评价
// 1.把 未评价 和已评价的卡片封装在一个组件
// 2.渲染组件的时候,把消息中的评价信息,传入组件
// 3.根据是否有  评价内容,展示对应的卡片
// 3.1 有数据 展示
// 3.2 无数据 绑定表单数据,收集表单数据 提交评价
// 3.3 评价成功,修改评价信息状态和数据,切换卡片展示
provide('consult', consult) //把数据传给孙组件EvaluateCard中 做评价
// 评价完成后 修改列表数据  传给孙组件EvaluateCard中 切换评价状态
const completeEva = (score: number) => {
  const item = list.value.find((item) => item.msgType === MsgType.CardEvaForm)
  if (item) {
    item.msg.evaluateDoc = { score }
    item.msgType = MsgType.CardEva
  }
}
provide('completeEva', completeEva)
</script>

<style lang="scss" scoped>
.room-page {
  padding-top: 90px;
  padding-bottom: 60px;
  min-height: 100vh;
  box-sizing: border-box;
  background-color: var(--cp-bg);

  .van-pull-refresh {
    width: 100%;
    min-height: calc(100vh - 150px);
  }
}
</style>
