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
            time > 0 ? `${time}s后重新发送}` : '发送验证码'
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
      <div class="icon">
        <img src="@/assets/qq.svg" alt="" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import CpNavBar from '@/components/CpNavBar.vue'
import { ref } from 'vue'
import { mobileRules, passwordRules, codeRules } from '@/utils/rules'
import { showSuccessToast, showToast, type FormInstance } from 'vant'
import { loginByPassword, sendMobileCode, loginByMobile } from '@/services/user'
import { useUserStore } from '@/stores'
import { useRoute, useRouter } from 'vue-router'
const route = useRoute()
const router = useRouter()
const form = ref<FormInstance>()
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
// 倒计时
const time = ref(0)
// 发送验证码
const send = async () => {
  // 已经倒计时time的值大于0，此时不能发送验证码
  if (time.value > 0) return
  // 校验是否输入了手机号
  await form.value?.validate('mobile')
  await sendMobileCode(mobile.value, 'login')

  showSuccessToast('发送成功')
}
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
</script>
<style scoped lang="scss">
.login {
  &-page {
    padding-top: 46px;
  }
  &-head {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    line-height: 1;
    padding: 30px 30px 50px;
    h3 {
      font-weight: normal;
      font-size: 24px;
    }
    a {
      font-size: 15px;
    }
  }
  &-other {
    margin-top: 60px;
    padding: 0 30px;
    .icon {
      display: flex;
      justify-content: center;
      img {
        width: 36px;
        height: 36px;
        padding: 4px;
      }
    }
  }
}

.van-form {
  padding: 0 14px;
  .cp-cell {
    height: 52px;
    line-height: 24px;
    padding: 14px 16px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    .van-checkbox {
      a {
        color: var(--cp-primary);
        padding: 0 5px;
      }
    }
    .btn-send {
      color: var(--cp-primary);
      &.active {
        color: rgba(22, 194, 163, 0.5);
      }
    }
  }
}
</style>
