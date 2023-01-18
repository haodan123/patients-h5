<template>
  <div class="knowledge-list">
    <van-list
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="onLoad"
    >
      <KnowledgeCard v-for="item in list" :key="item.id" :item="item"></KnowledgeCard>
    </van-list>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { getKnowledgePage } from '@/services/consult'
import type { KnowledgeType, KnowledgeParams, KnowledgeList } from '@/types/consult'
import KnowledgeCard from './KnowledgeCard.vue'
const props = defineProps<{ type: KnowledgeType }>()
// 加载中
const loading = ref(false)
// 加载完成  为true就不再加载数据
const finished = ref(false)
// 数据列表
const list = ref<KnowledgeList>([])
// 穿给后台的参数
const params = ref<KnowledgeParams>({
  type: props.type,
  current: 1,
  pageSize: 10
})
// 下拉加载 进入页面的时候自动加载一次

const onLoad = async () => {
  loading.value = true
  // finished.value = true
  const res = await getKnowledgePage(params.value)
  // console.log(res)
  list.value.push(...res.data.rows)
  // 如果传入的页数大于总页数 就加载完成不再继续加载
  if (res.data.pageTotal <= params.value.current) {
    finished.value = true
  } else {
    // 如果没有就页码+1
    params.value.current++
  }
  loading.value = false
  // console.log(list.value)
}
</script>

<style scoped lang="scss">
.knowledge-list {
  padding: 0 15px;
}
</style>
