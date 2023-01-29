<template>
  <div class="patient-page">
    <CpNavBar :title="isChange ? '选择患者' : '家庭档案'"></CpNavBar>
    <!-- 头部提示  只有选择患者时可见-->
    <div class="patient-change" v-if="isChange">
      <h3>请选择患者信息</h3>
      <p>以便医生给出更准确的治疗，信息仅医生可见</p>
    </div>
    <!-- 列表 -->
    <div class="patient-list">
      <div
        class="patient-item"
        v-for="item in list"
        :key="item.id"
        @click="selectedPatient(item)"
        :class="{ selected: patientId === item.id }"
      >
        <div class="info">
          <span class="name">{{ item.name }}</span>
          <span class="id">{{ item.idCard.replace(/^(.{6}).+(.{4})$/, '\$1******\$2') }}</span>
          <span>{{ item.genderValue }}</span>
          <span>{{ item.age }}岁</span>
        </div>
        <!-- 修改 -->
        <div class="icon" @click="showPopup(item)">
          <cp-icon name="user-edit"></cp-icon>
        </div>
        <div class="tag" v-if="item.defaultFlag === 1">默认</div>
      </div>
      <!-- 添加按钮 -->
      <!-- 超过6个不显示添加按钮 -->
      <div class="patient-add" @click="showPopup()" v-if="list?.length < 6">
        <cp-icon name="user-add"></cp-icon>
        <p>添加患者</p>
      </div>
      <div class="patient-tip">最多可添加6人</div>
    </div>
    <!-- 底部按钮  只有选择患者时可见-->
    <div class="patient-next" v-if="isChange">
      <van-button type="primary" @click="next" round block>下一步</van-button>
    </div>

    <!-- 弹出层 -->
    <VanPopup v-model:show="show" position="right" :style="{ width: '100%', height: '100%' }">
      <cp-nav-bar
        :back="() => (show = false)"
        :title="patient.id ? '编辑患者' : '添加患者'"
        right-text="保存"
        @click-right="onSubmit"
      ></cp-nav-bar>
      <van-form autocomplete="off" ref="form" @submit="onSubmit">
        <van-field
          v-model="patient.name"
          label="真实姓名"
          placeholder="请输入真实姓名"
          :rules="nameRules"
        />
        <van-field
          v-model="patient.idCard"
          label="身份证号"
          placeholder="请输入身份证号"
          :rules="idCardRules"
        />
        <van-field label="性别" class="pb4">
          <!-- 单选按钮组件 -->
          <template #input>
            <cp-radio-btn :options="Options" v-model="patient.gender"></cp-radio-btn>
          </template>
        </van-field>
        <van-field label="默认就诊人">
          <template #input>
            <van-checkbox v-model="defaultFlag" :icon-size="18" round />
          </template>
        </van-field>
      </van-form>
      <!-- 删除患者 -->
      <van-action-bar v-if="patient.id">
        <van-action-bar-button @click="remove">删除</van-action-bar-button>
      </van-action-bar>
    </VanPopup>
  </div>
</template>

<script setup lang="ts">
import { addPatient, delPatient, editPatient, getPatientList } from '@/services/user'
import { useConsultStore } from '@/stores'
import type { PatientList, Patient } from '@/types/user'
import { nameRules, idCardRules } from '@/utils/rules'
import { showConfirmDialog, showSuccessToast, showToast } from 'vant'
import type { FormInstance } from 'vant/lib/form/types'
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
let Options = [
  { label: '男', value: 1 },
  { label: '女', value: 0 }
]
const router = useRouter()
const store = useConsultStore()
// 渲染列表
const list = ref<PatientList>([])
// 获取数据
const getList = async () => {
  const res = await getPatientList()
  console.log(res)
  list.value = res.data
  //如果是选择患者时调用下面这个函数
  changeDeafultPatient()
}
onMounted(() => {
  getList()
})
const initPatient: Patient = {
  name: '',
  idCard: '',
  gender: 1,
  defaultFlag: 0
}

// 控制侧边栏弹出的状态
const show = ref(false)
// 打开弹出框
const showPopup = (item?: Patient) => {
  // 如果传了item代表是修改患者  没传代表添加患者
  if (item) {
    const { idCard, name, gender, defaultFlag, id } = item
    patient.value = {
      idCard,
      id,
      name,
      gender,
      defaultFlag
    }
  } else {
    // 重置表单
    patient.value = {
      ...initPatient
    }
  }

  show.value = true
}
// 表单
const patient = ref<Patient>({
  ...initPatient
})
const form = ref<FormInstance>()

// 默认就诊人
const defaultFlag = computed({
  get() {
    return patient.value.defaultFlag === 1 ? true : false
  },
  set(value) {
    patient.value.defaultFlag = value ? 1 : 0
  }
})

// 删除患者
const remove = async () => {
  // 点击编辑才能删除患者
  if (patient.value.id) {
    await showConfirmDialog({
      title: '温馨提示',
      message: `您确认要删除 ${patient.value.name} 患者信息吗 ？`
    })
    await delPatient(patient.value.id)
    // 重新加载数据
    getList()
    // 关闭弹出框
    show.value = false
    showSuccessToast('删除成功')
  }
}

// 保存
const onSubmit = async () => {
  // 验证表单
  await form.value?.validate()
  // 身份证倒数第二位，单数是男，双数是女
  const gender = +patient.value.idCard.slice(-2, -1) % 2
  if (gender !== patient.value.gender) {
    await showConfirmDialog({
      title: '温馨提示',
      message: '填写的性别和身份证号中的不一致\n您确认提交吗？'
    })
    // return showDialog({ message: '填写的性别和身份证号中的不一致' })
  }
  // 如果patient中有id代表是编辑  没有代表新增
  if (patient.value.id) {
    await editPatient(patient.value)
  } else {
    await addPatient(patient.value)
  }
  // 刷新数据
  getList()
  showSuccessToast(patient.value.id ? '编辑成功' : '新增成功')
  // 关闭弹出框
  show.value = false
}

//选择患者
// 1.界面兼容
const route = useRoute()
// 如果上个页面传参数过来了才可以选择患者
const isChange = computed(() => route.query.isChange === '1')
// 2.点击效果,选择患者
// 选中的id
const patientId = ref<string>()
// 选中患者  只有当时选中患者时 才能点击
const selectedPatient = (item: Patient) => {
  if (isChange.value) {
    patientId.value = item.id
  }
}
// 3.默认选中,有默认就诊人就选他,没有就选第一个
const changeDeafultPatient = () => {
  // 如果是选择患者并且 list里面有数据
  if (isChange.value && list.value.length) {
    // 默认患者  defaultFlag为1代表是默认患者
    const defPatient = list.value.find((item) => item.defaultFlag === 1)
    // 如果默认就诊人就选他,没有就选第一个
    if (defPatient) {
      patientId.value = defPatient.id
    } else {
      patientId.value = list.value[0].id
    }
  }
}
// 4.点击下一步:一定要选中患者,存储就诊患者store,跳转到支付页面
const next = () => {
  if (!patientId.value) return showToast('请选择患者')
  store.setPatient(patientId.value)
  // 跳转到支付页面
  router.push('/consult/pay')
}
</script>

<style scoped lang="scss">
.patient-page {
  padding: 46px 0 80px;

  :deep() {
    // 弹出层的样式
    .van-popup {
      padding-top: 46px;
      box-sizing: border-box;
    }
    // 底部操作栏
    .van-action-bar {
      padding: 0 10px;
      margin-bottom: 10px;
      .van-button {
        color: var(--cp-price);
        background-color: var(--cp-bg);
      }
    }
  }
}

.patient-list {
  padding: 15px;
}

.patient-item {
  display: flex;
  align-items: center;
  padding: 15px;
  background-color: var(--cp-bg);
  border-radius: 8px;
  margin-bottom: 15px;
  position: relative;
  border: 1px solid var(--cp-bg);
  transition: all 0.3s;
  overflow: hidden;

  .info {
    display: flex;
    flex-wrap: wrap;
    flex: 1;

    span {
      color: var(--cp-tip);
      margin-right: 20px;
      line-height: 30px;

      &.name {
        font-size: 16px;
        color: var(--cp-text1);
        width: 80px;
        margin-right: 0;
      }

      &.id {
        color: var(--cp-text2);
        width: 180px;
      }
    }
  }

  .icon {
    color: var(--cp-tag);
    width: 20px;
    text-align: center;
  }

  .tag {
    position: absolute;
    right: 60px;
    top: 21px;
    width: 30px;
    height: 16px;
    font-size: 10px;
    color: #fff;
    background-color: var(--cp-primary);
    border-radius: 2px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  &.selected {
    border-color: var(--cp-primary);
    background-color: var(--cp-plain);

    .icon {
      color: var(--cp-primary);
    }
  }
}

.patient-add {
  background-color: var(--cp-bg);
  color: var(--cp-primary);
  text-align: center;
  padding: 15px 0;
  border-radius: 8px;

  .cp-icon {
    font-size: 24px;
  }
}

.patient-tip {
  color: var(--cp-tag);
  padding: 12px 0;
}

.pb4 {
  padding-bottom: 4px;
}
.patient-change {
  padding: 15px;
  > h3 {
    font-weight: normal;
    margin-bottom: 5px;
  }
  > p {
    color: var(--cp-text3);
  }
}
.patient-next {
  padding: 15px;
  background-color: #fff;
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 80px;
  box-sizing: border-box;
}
</style>
