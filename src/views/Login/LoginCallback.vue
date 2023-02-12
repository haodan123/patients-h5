<template>
  <div class="login-page" v-if="!isBind">
    <cp-nav-bar title=" "></cp-nav-bar>
    <div class="login-head">
      <h3>手机绑定</h3>
    </div>
    <van-form autocomplete="off" ref="form" @submit="bind">
      <van-field
        name="mobile"
        v-model="mobile"
        :rules="mobileRules"
        placeholder="请输入手机号"
      ></van-field>
      <van-field placeholder="短信验证码" v-model="code" :rules="codeRules">
        <template #button>
          <span class="btn-send" @click="send">{{
            time > 0 ? `${time}s后重新发送` : '发送验证码'
          }}</span>
        </template>
      </van-field>
      <div class="cp-cell">
        <van-button block round type="primary" native-type="submit"> 立即绑定 </van-button>
      </div>
    </van-form>
  </div>
</template>
<script setup lang="ts">
import { useMobileCode } from '@/composable'
import { bindMobile, loginByQQ } from '@/services/user'
import { useUserStore } from '@/stores'
import type { User } from '@/types/user'
import { codeRules, mobileRules } from '@/utils/rules'
import { showToast } from 'vant'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
const openId = ref('')
const isBind = ref(true)

onMounted(() => {
  // qq是否登录过
  if (window.QC.Login.check()) {
    // 代表qq已经登录过
    window.QC.Login.getMe((id) => {
      // qq返回的openid传给接口
      console.log(id)
      openId.value = id
      // 掉接口进行登录
      loginByQQ(openId.value)
        .then((res) => {
          // 登录成功
          loginSuccess(res)
        })
        .catch(() => {
          // 登录失败 就不显示 绑定手机号页面
          isBind.value = false
        })
    })
  }
})

const mobile = ref('') //手机号
const code = ref('') //验证码

// 验证码的hook  在登陆页面也使用了
const { send, time } = useMobileCode(mobile.value, 'bindMobile')

// bind 提交表单
const store = useUserStore()
const router = useRouter()
const bind = async () => {
  // 绑定手机号
  const res = await bindMobile({
    mobile: mobile.value,
    code: code.value,
    openId: openId.value
  })

  loginSuccess(res)
}

// 登录成功的函数
const loginSuccess = (res: { data: User }) => {
  store.setUser(res.data)
  // 如果之前有路径保存下来了 直接跳转到之前的路径  没有的话 就去用户界面
  router.replace(store.returnUrl || '/user')
  showToast('登录成功')
  // 完成之后 清空保存的路径
  store.setReturnUrl('')
}
</script>
<style lang="scss" scoped>
@import '@/styles/login.scss';
.login-page {
  padding-top: 50px;
}
</style>
