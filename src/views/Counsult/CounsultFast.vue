<template>
  <div class="counsult-fast-page">
    <cp-nav-bar
      title="极速问诊"
      right-text="问诊记录"
      @click-right="router.push('/user/consult')"
    ></cp-nav-bar>
    <div class="fast-logo">
      <img src="@/assets/consult-fast.png" alt="" class="img" />
      <p class="text"><span>20s</span> 快速匹配专业医生</p>
    </div>
    <div class="fast-type">
      <router-link to="/consult/dep" class="item" @click="store.setIllnessType(1)">
        <cp-icon name="consult-doctor" class="pic"></cp-icon>
        <div class="info">
          <p>三甲图文问诊</p>
          <p>三甲图主治及以上级别医生</p>
        </div>
        <VanIcon name="arrow"></VanIcon>
      </router-link>
      <router-link to="/consult/dep" class="item" @click="store.setIllnessType(0)">
        <cp-icon name="consult-message" class="pic"></cp-icon>
        <div class="info">
          <p>普通图文问诊</p>
          <p>二甲图主治及以上级别医生</p>
        </div>
        <VanIcon name="arrow"></VanIcon>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useConsultStore } from '@/stores'
import { useRouter } from 'vue-router'
const router = useRouter()
const store = useConsultStore()
</script>

<style scoped lang="scss">
.counsult-fast-page {
  padding-top: 46px;
  .fast-logo {
    padding: 30px 0;
    text-align: center;
    .img {
      width: 240px;
    }
    .text {
      font-size: 16px;
      margin-top: 10px;
      span {
        color: var(--cp-primary);
      }
    }
  }
  .fast-type {
    padding: 15px;
    .item {
      display: flex;
      padding: 16px;
      border-radius: 4px;
      align-items: center;
      margin-bottom: 16px;
      border: 0.5px solid var(--cp-line);
    }
    .pic {
      width: 40px;
      height: 40px;
    }
    .info {
      margin-left: 12px;
      flex: 1;
      p:first-child {
        font-size: 16px;
        color: var(--cp-text1);
        margin-bottom: 4px;
      }
      p:last-child {
        font-size: 13px;
        color: var(--cp-tag);
      }
    }
    .van-icon {
      color: var(--cp-tip);
    }
  }
}
</style>
