import { sendMobileCode } from '@/services/user'
import type { CodeType } from '@/types/user'
import { showSuccessToast, type FormInstance } from 'vant'
import { onUnmounted, ref } from 'vue'

// 封装验证码hook
export const useMobileCode = (mobile: string, type: CodeType) => {
  const form = ref<FormInstance>()

  // 倒计时
  const time = ref(0)
  // 发送验证码
  let timeId: number
  const send = async () => {
    // 已经倒计时time的值大于0，此时不能发送验证码
    if (time.value > 0) return
    // 校验是否输入了手机号
    await form.value?.validate('mobile')
    // 第一个参数为手机号   第二个参数为 什么类型的短信
    await sendMobileCode(mobile, type)

    showSuccessToast('发送成功')
    time.value = 60
    // 倒计时
    clearInterval(timeId)
    timeId = window.setInterval(() => {
      time.value--
      if (time.value <= 0) window.clearInterval(timeId)
    }, 1000)
  }
  onUnmounted(() => {
    clearInterval(timeId)
  })
  return { send, time, form }
}
