<template>
  <div class="login-page">
    <!-- 导航栏 -->
    <CpNavBar title="登录"></CpNavBar>
    <!-- 头部 -->
    <div class="login-head">
      <h3>{{ isPwd ? '密码登录' : '短信验证码登录' }}</h3>
      <a href="javascript:;" @click="isPwd = !isPwd">
        <span>{{ !isPwd ? '密码登录' : '短信验证码登录' }}</span>
        <VanIcon name="arrow"></VanIcon>
      </a>
    </div>
    <!-- 表单 -->
    <van-form @submit="login" autocapitalize="off">
      <van-field name="mobile" v-model="mobile" placeholder="请输入手机号" :rules="mobileRules" />
      <!-- 密码登录 -->
      <van-field
        v-if="isPwd"
        v-model="password"
        :type="show ? 'text' : 'password'"
        placeholder="密码"
        :rules="passwordRules"
      >
        <template #button>
          <cp-icon
            @click="show = !show"
            :name="`login-eye-${show ? 'on' : 'off'}`"
          ></cp-icon> </template
      ></van-field>
      <!-- 短信登录 -->
      <van-field v-else placeholder="短信验证码" v-model="code" :rules="codeRules">
        <template #button>
          <span class="btn-send" @click="send">{{
            time > 0 ? `${time}s后重新发送` : '发送验证码'
          }}</span>
        </template>
      </van-field>
      <div class="cp-cell">
        <VanCheckbox v-model="agree">
          <span>我已同意</span>
          <a href="javascript:;">用户协议</a>
          及
          <a href="javascript:;">隐私条款</a>
        </VanCheckbox>
      </div>
      <div class="cp-cell">
        <VanButton round block type="primary" native-type="submit">登 录</VanButton>
      </div>
      <div class="cp-cell">
        <a href="javascript:;">忘记密码?</a>
      </div>
    </van-form>
    <!-- 底部 -->

    <div class="login-other">
      <VanDivider>第三方登录</VanDivider>
      <!-- <div id="qq" class="icon"></div> -->
      <!-- 点击qq登录的时候把之前的路由路径保存起来  方便登录完之后直接跳转到次页面 -->
      <a class="icon" @click="store.setReturnUrl($route.query.returnUrl as string)" :href="qqUrl">
        <img src="@/assets/qq.svg" alt="" />
      </a>
      <!-- <a
        class="icon"
        @click="store.setReturnUrl($route.query.returnUrl as string)"
        href="https://graph.qq.com/oauth2.0/authorize?client_id=102015968&response_type=token&scope=all&redirect_uri=http%3A%2F%2Fconsult-patients.itheima.net%2Flogin%2Fcallback"
      >
        <img src="@/assets/qq.svg" alt="" />
      </a> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import CpNavBar from '@/components/CpNavBar.vue'
import { onMounted, ref } from 'vue'
import { mobileRules, passwordRules, codeRules } from '@/utils/rules'
import { showSuccessToast, showToast } from 'vant'
import { loginByPassword, loginByMobile } from '@/services/user'
import { useUserStore } from '@/stores'
import { useRoute, useRouter } from 'vue-router'
import { useMobileCode } from '@/composable'
const route = useRoute()
const router = useRouter()

// qq跳转的url
const qqUrl = `https://graph.qq.com/oauth2.0/authorize?client_id=102015968&response_type=token&scope=all&redirect_uri=${encodeURIComponent(
  import.meta.env.VITE_APP_CALLBACK + '/login/callback'
)}`
// pinia
const store = useUserStore()
// 是否用密码登录
const isPwd = ref(true)
// 是否显示密码
const show = ref(false)
// 手机号
const mobile = ref('13230000001')
// 密码
const password = ref('abc12345')
// 验证码
const code = ref('')
// 同意条款
const agree = ref(false)
// 发送验证码的 hook  在logincallback 中也复用了
const { send, time } = useMobileCode(mobile.value, 'login')

// 登录
const login = async () => {
  if (!agree.value) return showToast('请勾选用户协议')
  let res
  if (isPwd.value) {
    res = await loginByPassword(mobile.value, password.value)
  } else {
    res = await loginByMobile(mobile.value, code.value)
  }
  console.log(res)
  store.setUser(res.data)
  // 如果有回跳地址就进行回跳，没有跳转到个人中心
  router.replace((route.query.returnUrl as string) || '/user')
  showSuccessToast('登录成功')
}
// qq登录
onMounted(() => {
  // window.QC.Login({
  //   btnId: 'qq'
  // })
})
</script>
<style scoped lang="scss">
@import '@/styles/login.scss';
</style>
