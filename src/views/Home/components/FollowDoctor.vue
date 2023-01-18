<template>
  <div class="follow-doctor">
    <div className="head">
      <p>推荐关注</p>
      <a href="javascript:;"> 查看更多<i class="van-icon van-icon-arrow" /></a>
    </div>
    <div class="body">
      <!-- swipe 组件 -->
      <van-swipe :width="(150 / 375) * width" :show-indicators="false" :loop="false">
        <van-swipe-item v-for="item in list" :key="item.id">
          <DoctorCarde :item="item" />
        </van-swipe-item>
      </van-swipe>
    </div>
  </div>
</template>

<script setup lang="ts">
import DoctorCarde from './DoctorCard.vue'
import { useWindowSize } from '@vueuse/core'
import { getDoctorPage } from '@/services/consult'
import { onMounted, ref } from 'vue'
import type { DoctorList, PageParams } from '@/types/consult'
// 在其他设备需要等比例设置滚动的宽度
const { width } = useWindowSize()

const params = ref<PageParams>({
  current: 1,
  pageSize: 5
})
const list = ref<DoctorList>([])

const loadData = async () => {
  const res = await getDoctorPage(params.value)
  console.log(res)
  list.value = res.data.rows
}
onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.follow-doctor {
  background-color: var(--cp-bg);
  height: 250px;
  .head {
    display: flex;
    justify-content: space-between;
    height: 45px;
    align-items: center;
    padding: 0 15px;
    font-size: 13px;
    > a {
      color: var(--cp-tip);
    }
  }
  .body {
    width: 100%;
    overflow: hidden;
  }
}
</style>
