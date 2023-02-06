<template>
  <div class="consult-list">
    <van-list
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="onLoad"
    >
      <ConsultItem
        @on-delete="onDelete"
        v-for="item in list"
        :key="item.id"
        :item="item"
      ></ConsultItem>
    </van-list>
  </div>
</template>

<script setup lang="ts">
import ConsultItem from './ConsultItem.vue'
import type { ConsultType } from '@/enums'
import { ref } from 'vue'
import type { ConsultOrderItem, ConsultOrderListParams } from '@/types/consult'
import { getConsultOrderList } from '@/services/consult'

const props = defineProps<{ type: ConsultType }>()
// 1.准备好查询参数
// 2.实现加载更多效果
// 3.触发加载更多操作的时候,发送请求 获取数据
// 4.拿到数据后:结束加载状态
// 4.1 有数据,追加列表
// 4.2无数据,设置为完成
// 5.渲染
// 渲染列表数据
const list = ref<ConsultOrderItem[]>([])
// 查询参数
const params = ref<ConsultOrderListParams>({
  type: props.type,
  current: 1,
  pageSize: 5
})
// 是否在加载中
const loading = ref(false)
// 如果没有数据了设置为true
const finished = ref(false)
// 上啦加载函数
const onLoad = async () => {
  const res = await getConsultOrderList(params.value)
  list.value.push(...res.data.rows)
  // 如果还有数据 可以继续请求  没有数据吧finished设置为true让他不再加载
  if (params.value.current < res.data.pageTotal) {
    params.value.current++
  } else {
    finished.value = true
  }
  loading.value = false
}

// 删除订单
const onDelete = (id: string) => {
  list.value = list.value.filter((item) => item.id !== id)
}
</script>

<style lang="scss" scoped>
.consult-list {
  padding: 10px 15px;
}
</style>
