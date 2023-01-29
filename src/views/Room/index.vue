<template>
  <div class="room-page">
    <cp-nav-bar title="问诊室" />
    <!-- 顶部通知栏 -->
    <room-status></room-status>
    <!-- 消息 -->
    <room-message></room-message>
    <!-- 底部的输入框 -->
    <room-action></room-action>
  </div>
</template>

<script setup lang="ts">
import RoomStatus from './components/RoomStatus.vue'
import RoomAction from './components/RoomAction.vue'
import RoomMessage from './components/RoomMessage.vue'
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
