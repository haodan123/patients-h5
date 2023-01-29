import type { ConsultType } from '@/enums'
import type { PartialConsult } from '@/types/consult'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useConsultStore = defineStore(
  'useConsultStore',
  () => {
    // 问诊记录状态
    const consult = ref<PartialConsult>({})
    // 修改问诊类型函数
    const setType = (type: ConsultType) => (consult.value.type = type)
    // 修改极速问诊类型函数
    const setIllnessType = (type: 0 | 1) => (consult.value.illnessType = type)
    // 修改科室函数
    const setDep = (id: string) => (consult.value.depId = id)
    // 修改病情描述函数
    // Pink代表选中PartialConsult类型中的这四个类型代表iliness的类型
    const setIliness = (
      iliness: Pick<PartialConsult, 'illnessDesc' | 'illnessTime' | 'consultFlag' | 'pictures'>
    ) => {
      consult.value.illnessDesc = iliness.illnessDesc
      consult.value.illnessTime = iliness.illnessTime
      consult.value.consultFlag = iliness.consultFlag
      consult.value.pictures = iliness.pictures
    }
    // 修改患者函数
    const setPatient = (id: string) => (consult.value.patientId = id)
    // 修改优惠券函数
    const setCoupon = (id?: string) => (consult.value.couponId = id)
    // 清空信息
    const clear = () => {
      consult.value = {}
    }
    return { consult, setType, setIllnessType, setDep, setIliness, setPatient, setCoupon, clear }
  },
  // 开启本地存储 把数据存到本地
  { persist: true }
)
