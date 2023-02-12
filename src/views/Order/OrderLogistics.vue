<template>
  <div class="order-logistics-page" v-if="logistics">
    <div id="map">
      <div class="title">
        <van-icon name="arrow-left" @click="$router.back()" />
        <span>{{ logistics.statusValue }}</span>
        <van-icon name="service" />
      </div>
      <div class="current">
        <p class="status">{{ logistics.statusValue }} 预计 {{ logistics.estimatedTime }} 送达</p>
        <p class="predict">
          <span>{{ logistics.name }}</span>
          <span>{{ logistics.awbNo }}</span>
        </p>
      </div>
    </div>
    <div class="logistics">
      <p class="title">物流详情</p>
      <van-steps direction="vertical" :active="0">
        <van-step v-for="item in logistics.list" :key="item.id">
          <p class="status" v-if="item.statusValue">{{ item.statusValue }}</p>
          <p class="content">{{ item.content }}</p>
          <p class="time">{{ item.createTime }}</p>
        </van-step>
      </van-steps>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getMedicalOrderLogistics } from '@/services/order'
import type { Logistics } from '@/types/order'
import { nextTick, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import AMapLoader from '@amap/amap-jsapi-loader'
import endImg from '@/assets/end.png'
import startImg from '@/assets/start.png'
import carImg from '@/assets/car.png'

// 地图的key
window._AMapSecurityConfig = {
  securityJsCode: 'f8d9ead8df72a3566f1af4f2990be594'
}

const route = useRoute()
// 物流信息
const logistics = ref<Logistics>()
onMounted(async () => {
  const res = await getMedicalOrderLogistics(route.params.id as string)
  logistics.value = res.data
  // 获取数据后操作dom需要用nextTick
  await nextTick()
  // 获取地图
  AMapLoader.load({
    key: '91f854911eaf55f5296563d89b200a89',
    version: '2.0'
  }).then((AMap) => {
    // 使用 Amap 初始化地图
    //设置地图容器id
    const map = new AMap.Map('map', {
      viewMode: '3D', //是否为3D地图模式
      mapStyle: 'amap://styles/whitesmoke', //地图的样式
      zoom: 12 //初始化地图级别
      // center: [105.602725, 37.076636] //初始化地图中心点位置
    })
    AMap.plugin('AMap.Driving', function () {
      // 初始化路线规划对象
      // 绘制路径 map 绘制到哪个地图上，showTraffic 是否先道路情况 hideMarkers隐藏覆盖物
      var driving = new AMap.Driving({ map: map, showTraffic: false, hideMarkers: true })
      // 开始地点的经纬度
      var start = logistics.value?.logisticsInfo.shift() //取数组中的第一个对象
      // 给起点的位置加一个标点
      const startMarker = new AMap.Marker({
        position: [start?.longitude, start?.latitude], //标点的经纬度
        icon: startImg, //标点的图片
        anchor: 'center' // 设置锚点方位
      })
      map.add(startMarker)
      // 结束地点的经纬度
      var end = logistics.value?.logisticsInfo.pop() //取数组总最后一个对象
      // 给终点的位置加一个标点
      const endMarker = new AMap.Marker({
        position: [end?.longitude, end?.latitude], //标点的经纬度
        icon: endImg, //标点的图片
        anchor: 'center' // 设置锚点方位
      })
      map.add(endMarker)
      // 第一个参数是起始坐标 第二个参数是终点坐标  第三个是路途中的经纬度坐标 第四个是规划好了的回调函数
      driving.search(
        [start?.longitude, start?.latitude],
        [end?.longitude, end?.latitude],
        { waypoints: res.data.logisticsInfo.map((item) => [item.longitude, item.latitude]) },
        function (status: string, result: object) {
          // 未出错时，result即是对应的路线规划方案

          // 给当前货车位置加上标点 start
          const marker = new AMap.Marker({
            icon: carImg,
            position: [
              res.data.currentLocationInfo.longitude,
              res.data.currentLocationInfo.latitude
            ],
            anchor: 'center'
          })
          map.add(marker)
          // 三秒后定位到货车的位置 并且放大地图
          setTimeout(() => {
            map.setFitView([marker])
            map.setZoom(10)
          }, 3000)
        }
        // 给当前货车位置加上标点 end
      )
    })
  })
})
</script>

<style lang="scss" scoped>
.order-logistics-page {
  --van-step-icon-size: 18px;
  --van-step-circle-size: 10px;
}
#map {
  height: 450px;
  background-color: var(--cp-bg);
  overflow: hidden;
  position: relative;
  .title {
    background-color: #fff;
    height: 46px;
    width: 355px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    padding: 0 15px;
    font-size: 16px;
    position: absolute;
    left: 10px;
    top: 10px;
    box-sizing: border-box;
    box-shadow: 0px 0px 22px 0px rgba(229, 229, 229, 0.5);
    z-index: 999;
    > span {
      flex: 1;
      text-align: center;
    }
    .van-icon {
      font-size: 18px;
      color: #666;
      &:last-child {
        color: var(--cp-primary);
      }
    }
  }
  .current {
    height: 80px;
    border-radius: 4px;
    background-color: #fff;
    height: 80px;
    width: 355px;
    box-sizing: border-box;
    padding: 15px;
    position: absolute;
    left: 10px;
    bottom: 10px;
    box-shadow: 0px 0px 22px 0px rgba(229, 229, 229, 0.5);
    z-index: 999;
    .status {
      font-size: 15px;
      line-height: 26px;
    }
    .predict {
      color: var(--cp-tip);
      font-size: 13px;
      margin-top: 5px;
      > span {
        padding-right: 10px;
      }
    }
  }
}
.logistics {
  padding: 0 10px 20px;
  .title {
    font-size: 16px;
    padding: 15px 5px 5px;
  }
  .van-steps {
    :deep(.van-step) {
      &::after {
        display: none;
      }
    }
    .status {
      font-size: 15px;
      color: var(--cp-text3);
      margin-bottom: 4px;
    }
    .content {
      font-size: 13px;
      color: var(--cp-tip);
      margin-bottom: 4px;
    }
    .time {
      font-size: 13px;
      color: var(--cp-tag);
    }
  }
}
</style>
