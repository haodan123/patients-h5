<template>
  <div class="consult-dep-page">
    <cp-nav-bar title="选择科室"></cp-nav-bar>
    <div class="wrapper">
      <!-- 一级科室 -->
      <van-sidebar v-model="active">
        <van-sidebar-item :title="top.name" v-for="top in allDep" :key="top.id" />
      </van-sidebar>
      <!-- 二级科室 -->
      <div class="sub-dep">
        <router-link
          to="/consult/illness"
          :key="sub.id"
          v-for="sub in subDep"
          @click="store.setDep(sub.id)"
          >{{ sub.name }}</router-link
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getAllDep } from '@/services/consult'
import { useConsultStore } from '@/stores'
import type { TopDep } from '@/types/consult'
import { ref, onMounted, computed } from 'vue'
const store = useConsultStore()

const active = ref(0)
// 一级科室
const allDep = ref<TopDep[]>([])
// 二级科室

const subDep = computed(() => allDep.value[active.value]?.child)
onMounted(async () => {
  const res = await getAllDep()
  console.log(res)
  allDep.value = res.data
})
</script>

<style scoped lang="scss">
.consult-dep-page {
  padding-top: 46px;
}
.van-sidebar {
  width: 114px;
  &-item {
    padding: 14px;
    color: var(--cp-tag);
    &--select {
      color: var(--cp-main);
      font-weight: normal;
      &::before {
        display: none;
      }
    }
  }
}
.wrapper {
  height: calc(100vh - 46px);
  overflow: hidden;
  display: flex;
  .sub-dep {
    flex: 1;
    height: 100%;
    overflow-y: auto;
    > a {
      display: block;
      padding: 14px 30px;
      color: var(--cp-dark);
    }
  }
}
</style>
