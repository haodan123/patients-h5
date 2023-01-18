<template>
  <div class="cp-radio-btn">
    <a
      class="item"
      :class="{ active: item.value === modelValue }"
      href="javascript:;"
      v-for="item in options"
      :key="item.value"
      @click="toggleItem(item.value)"
      >{{ item.label }}</a
    >
    <!-- <a class="item" href="javascript:;">女</a> -->
  </div>
</template>

<script setup lang="ts">
type Props = {
  options: {
    label: string
    value: string | number
  }[]
  modelValue?: string | number
}
type Emit = {
  (e: 'update:modelValue', value: string | number): void
}
defineProps<Props>()
const emit = defineEmits<Emit>()
// 点击切换  用v-model 省略的在父页面赋值的那一步
const toggleItem = (value: string | number) => {
  emit('update:modelValue', value)
}
</script>

<style scoped lang="scss">
.cp-radio-btn {
  display: flex;
  flex-wrap: wrap;

  .item {
    height: 32px;
    min-width: 60px;
    line-height: 30px;
    padding: 0 14px;
    text-align: center;
    border: 1px solid var(--cp-bg);
    background-color: var(--cp-bg);
    margin-right: 10px;
    box-sizing: border-box;
    color: var(--cp-text2);
    margin-bottom: 10px;
    border-radius: 4px;
    transition: all 0.3s;

    &.active {
      border-color: var(--cp-primary);
      background-color: var(--cp-plain);
    }
  }
}
</style>
