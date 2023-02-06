<template>
  <div class="consult-page">
    <cp-nav-bar title="问诊记录"></cp-nav-bar>
    <van-tabs sticky v-model:active="active">
      <van-tab title="极速问诊"><consult-list :type="ConsultType.Fast" /></van-tab>
      <van-tab title="找医生"><consult-list :type="ConsultType.Doctor" /></van-tab>
      <van-tab title="开药问诊"><consult-list :type="ConsultType.Medication" /></van-tab>
    </van-tabs>
  </div>
</template>

<script setup lang="ts">
import ConsultList from './components/ConsultList.vue'
import { ref } from 'vue'
import { ConsultType } from '@/enums'

const active = ref()
</script>

<style lang="scss" scoped>
.consult-page {
  padding-top: 46px;
  background-color: var(--cp-bg);
  min-height: calc(100vh - 46px);
}
</style>
