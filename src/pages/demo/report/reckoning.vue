<template>
   <d2-container>
      <template slot="header" class="flex">
         <el-form :inline="true" :model="search" class="br">
            <el-form-item>
               <el-date-picker v-model="search.date" type="date" placeholder="选择日期" value-format="yyyy/MM/dd"></el-date-picker>
            </el-form-item>
            <el-form-item>
               <el-time-select v-model="search.start" :picker-options="{start: '00:00',step: '01:00',end: '23:00', format: 'H'}" value-format="H" placeholder="开始时间" style="width: 140px"></el-time-select>
            </el-form-item>
            <el-form-item>
               <el-time-select v-model="search.end" :picker-options="{start: '00:00',step: '01:00',end: '23:00', format: 'H'}" value-format="H" placeholder="结束时间" style="width: 140px"></el-time-select>
            </el-form-item>
            <!--<el-form-item>-->
               <!--<el-time-picker is-range v-model="search.time" format="HH 时" value-format="HH" start-placeholder="开始时间" range-separator="至" end-placeholder="结束时间"></el-time-picker>-->
            <!--</el-form-item>-->
            <el-form-item>
               <div class="flex">
                  <el-button type="primary" @click="handSearch">查询</el-button>
               </div>
            </el-form-item>
         </el-form>
      </template>
      <template>
         <el-table v-loading="loading" :data="listData" :max-height="maxHeight" :summary-method="getSummaries" show-summary border>
            <el-table-column prop="orderID" label="订单号" min-width="140" align="center"></el-table-column>
            <el-table-column prop="paytime" label="时间" min-width="90" align="center"></el-table-column>
            <el-table-column prop="fee" label="金额" min-width="50" align="center"></el-table-column>
         </el-table>
      </template>
   </d2-container>
</template>

<script>
import { httpGet } from '@api/http'
import dayjs from 'dayjs'

export default {
   name: "demo-report-reckoning",
   data() {
      return {
         dayjs,
         observer: null,
         search: { date: dayjs().format('YYYY/M/D'), start: '00:00', end: '23:00' },
         listData: [],
         ments: '',
         sumAmount: '',
         maxHeight: 'auto',
         loading: true
      }
   },
   async created () {
      let { date } = this.search
      await httpGet('reckoning', { date, start: 0, end: 23 }).then(res => {
         this.parseData(res.data)
      }).catch(err => {
         this.loading = false
      })
   },
   methods: {
      // 查询
      handSearch () {
         let { date, start, end } = this.search
         start = start ? Number(start.substring(0, 2)) : 0
         end = end ? Number(end.substring(0, 2)) : 23
         if (date && start <= end ) {
            this.loading = true
            httpGet('reckoning', { date, start, end }).then(res => {
               this.parseData(res.data)
            }).catch(err => {
               this.loading = false
            })
         } else {
            this.$message('日期时间不对!')
         }
      },
      // 数据解析
      parseData (data) {
         if (data && data.DetailRecords) {
            this.listData = data.DetailRecords.split('^^').map(v => {
               let json = {}, item = v.split('|')
               json.orderID = item[1]
               json.paytime = item[2].replace(/\//g, '-')
               json.fee = Number(item[3])
               return json
            })
            this.ments = data.NumOfPayments
            this.sumAmount = data.SumOfPayAmount
            this.sizeEle()
         } else {
            this.listData = []
            this.$message.warning('暂无数据!')
         }
         this.loading = false
      },
      // 合计
      getSummaries (param) {
         const { columns } = param, sums = []
         columns.forEach(() => {
            sums[0] = '合计'
            sums[1] = `${this.ments} / 条`
            sums[2] = `${this.sumAmount} 元`
         })
         return sums
      },
      // 计算高度
      sizeEle () {
         this.maxHeight = document.querySelector('.d2-container-full__body').clientHeight - 40
      }
   },
   // 进入路由注册 resize 事件
   beforeRouteEnter  (to, from, next) {
      next(vm => {
         window.onresize = vm._debounce(() => { vm.sizeEle() }, 500)
      })
   },
   // 离开路由注销 resize 事件
   beforeRouteLeave (to, from, next) {
      window.onresize = null
      next()
   }
}
</script>
