<template>
   <d2-container :filename="filename">
      <template slot="header" class="flex">
         <el-form :inline="true" :model="Search" class="br">
            <el-form-item>
               <el-select v-model="Search.sid" placeholder="学校">
                  <el-option v-for="item in school" :key="item.id" :label="item.cname" :value="item.id"></el-option>
               </el-select>
            </el-form-item>
            <el-form-item>
               <el-date-picker v-model="Search.Time" type="daterange" value-format="timestamp" start-placeholder="开始日期" range-separator="至" end-placeholder="结束日期"></el-date-picker>
            </el-form-item>
            <el-form-item>
               <div class="flex">
                  <el-button type="primary" @click="create">生成</el-button>
                  <el-button type="primary" @click="exportExcel"><d2-icon name="download"/> 导出 Excel</el-button>
               </div>
            </el-form-item>
         </el-form>
      </template>
      <template>
         <el-table :data="Data" v-loading="loading" border style="width:100%">
            <el-table-column prop="school" label="学校" min-width="160" align="center"></el-table-column>
            <el-table-column prop="ordernum" label="订单数量" min-width="100" align="center"></el-table-column>
            <el-table-column prop="unit" label="餐标" min-width="100" align="center"></el-table-column>
            <el-table-column prop="quitnum" label="退餐数量" min-width="100" align="center"></el-table-column>
            <el-table-column prop="quitfee" label="退餐金额" min-width="100" align="center"></el-table-column>
            <el-table-column prop="leavenum" label="请假数量" min-width="100" align="center"></el-table-column>
            <el-table-column prop="leavefee" label="请假金额" min-width="100" align="center"></el-table-column>
            <el-table-column prop="usenum" label="实际供餐餐次" min-width="120" align="center"></el-table-column>
            <el-table-column prop="usefee" label="配餐收入" min-width="100" align="center"></el-table-column>
            <el-table-column label="操作" width="120" align="center">
               <template slot-scope="scope">
                  <el-button type="danger" icon="el-icon-delete" size="small" @click="handleRemove(scope.row.sid)">删除</el-button>
               </template>
            </el-table-column>
         </el-table>
      </template>
   </d2-container>
</template>

<script>
import { httpGet, httpPost } from '@api/http'
import dayjs from 'dayjs'

export default {
   name: 'admin',
   data() {
      return {
         filename: __filename,
         dayjs,
         school: [],
         Search: {},
         Data: [],
         loading: true
      }
   },
   async created () {
      let time = dayjs().unix()
      await this.loadData(time, time)
   },
   methods: {
      loadData (startat, endat) {
         httpGet('data', { startat: startat, endat: endat + 86399 }).then(res => {
            this.school = res.school
            this.Search = { sid: '', Time: [startat * 1000, endat * 1000] }
            this.mapData(startat, endat, res.school, res.lists, res.leaves, res.product)
         })
      },
      mapData (startat, endat, school, lists, leaves, product) {
         let schools = []
         lists.forEach(item => {
            item['holiday'] = JSON.parse(product[item.pid])
            item['leave'] = []
            leaves.forEach(val => {
               if (val.oid == item.id) item.leave = item.leave.concat(JSON.parse(val.holiday))
            })
            var items = { ordernum: 0, quitnum: 0, quitfee: 0, leavenum: 0, leavefee: 0, usenum: 0, usefee: 0 }
            if (item.addtime >= startat && item.addtime <= endat) items.ordernum = 1
            for (var i = startat; i <= endat; i += 86400) {
               let day = parseInt(dayjs(i * 1000).format('YYYYMMDD'))
               if (item.holiday.indexOf(day) == -1 && (i >= item.startat && i <= item.endat)) {
                  if (item.quittime == 0 || item.quittime > i) {
                     if(item.leave.includes(day)){
                        items.leavenum ++
                        items.leavefee += item.unit
                     } else {
                        items.usenum ++
                        items.usefee += item.unit
                     }
                  } else {
                     if (item.quittime == i) {
                        items.quitnum ++
                        items.quitfee += item.refund
                     }
                  }
               }
            }
            if (schools[item.sid]) {
               schools[item.sid].sid = item.sid
               schools[item.sid].ordernum += items.ordernum
               schools[item.sid].quitnum += items.quitnum
               schools[item.sid].quitfee += items.quitfee
               schools[item.sid].leavenum += items.leavenum
               schools[item.sid].leavefee += items.leavefee
               schools[item.sid].usenum += items.usenum
               schools[item.sid].usefee += items.usefee
            } else {
               let School = school.find(val => { return val.id == item.sid })
               schools[item.sid] = Object.assign({ school: School ? School.cname : '', unit: item.unit }, items)
            }
         })
         schools.forEach(v => {
            !this.Data.some(i => { return i.sid == v.sid }) && this.Data.push(v)
         })
         this.loading = false
      },
      create () {
         let posts = { sid: this.Search.sid, startat: this.Search.Time[0] /1000 , endat: this.Search.Time[1] / 1000}
         this.loading = true
         httpGet('data', posts).then(res => {
            this.mapData(posts.startat, posts.endat, this.school, res.lists, res.leaves, res.product)
         })
      },
      handleRemove (sid) {
         this.Data = this.Data.filter(v => { return v.sid != sid })
      },
      exportExcel () {
         if(this.Data.length){
            let columns = [
               {label: '学校', prop: 'school'},
               {label: '订单数量', prop: 'ordernum'},
               {label: '餐标', prop: 'unit'},
               {label: '退餐数量', prop: 'quitnum'},
               {label: '退餐金额', prop: 'quitfee'},
               {label: '请假数量', prop: 'leavenum'},
               {label: '请假金额', prop: 'leavefee'},
               {label: '实际供餐餐次', prop: 'usenum'},
               {label: '配餐收入', prop: 'usefee'}
            ]
            this.$export.excel({ columns: columns, data: this.Data }).then(() => {
               this.$message.success('导出表格成功')
            })
         } else {
            this.$message.warning(`暂无数据导出!`)
         }
      }
   }
}
</script>
