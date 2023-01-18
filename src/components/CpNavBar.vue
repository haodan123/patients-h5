<template>
  <!-- navbar头部导航栏封装 -->
  <van-nav-bar
    :title="title"
    left-arrow
    fixed
    @click-left="onClickLeft"
    @click-right="onClickRight"
    :right-text="rightText"
  ></van-nav-bar>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
type Props = {
  title: string
  rightText?: string
  back?: () => void //如果穿了这个参数 就是自己用回调函数  不再进行跳转
}
const props = defineProps<Props>()
const emit = defineEmits(['click-right'])
// 点击左侧箭头
const onClickLeft = () => {
  if (props.back) {
    return props.back() //如果穿了back这个参数 就不再进行路由跳转
  }
  // 判断历史记录中是否有回退
  if (history.state?.back) {
    router.back()
  } else {
    router.push('/')
  }
}
// 点击右侧文字 给父组件传一个事件
const onClickRight = () => {
  emit('click-right')
}
</script>

<style scoped lang="scss">
:v-deep() {
  .van-nav-bar {
    &__arrow {
      font-size: 18px;
      color: var(--cp-text1);
    }
    &__text {
      font-size: 15px;
    }
  }
}
</style>
