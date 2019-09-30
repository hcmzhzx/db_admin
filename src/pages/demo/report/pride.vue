<template>
   <d2-container>
      <template slot="header" class="flex">
         <el-form :inline="true" :model="search" class="br">
            <el-form-item>
               <el-date-picker v-model="search.time" type="date" placeholder="支付时间" value-format="timestamp"></el-date-picker>
            </el-form-item>
            <el-form-item>
               <div class="flex">
                  <el-button type="primary" @click="handSearch">查询</el-button>
                  <el-button type="primary" @click="exportExcel"><d2-icon name="download"/> 导出 Excel</el-button>
               </div>
            </el-form-item>
         </el-form>
      </template>
      <template>
         <el-table v-loading="loading" :data="listData" border>
            <el-table-column prop="cname" label="用户名" min-width="120" align="center"></el-table-column>
            <el-table-column prop="phone" label="手机号" min-width="120" align="center"></el-table-column>
            <el-table-column prop="paytime" label="支付时间" min-width="160" align="center"></el-table-column>
            <!--<el-table-column prop="fee" label="支付金额" min-width="100" align="center"></el-table-column>-->
         </el-table>
      </template>
   </d2-container>
</template>

<script>
import { httpGet } from '@api/http'
import dayjs from 'dayjs'

export default {
   name: "demo-report-pride",
   data () {
      return {
         dayjs,
         search: { time: '' },
         listData: [],
         loading: true
      }
   },
   async created () {
      await this.loadData()
   },
   methods:{
      loadData () {
         httpGet('pride').then(res => {
            this.parseData(res.lists)
         })
      },
      // 解析数据
      parseData (list) {
         this.listData = list.map(v => {
            let json = v
            json.paytime = dayjs(json.paytime * 1000).format('YYYY-MM-DD HH:mm:ss')
            return json
         })
         this.loading = false
      },
      // 查询
      handSearch () {
         this.loading = true
         let posts = { time: this.search.time / 1000 || dayjs().unix() }
         httpGet('pride', posts).then(res => {
            this.parseData(res.lists)
         })
      },
      // 导出Excel
      exportExcel () {
         if (this.listData.length) {
            let columns = [
               { label: '用户名', prop: 'cname' },
               { label: '手机号', prop: 'phone' },
               { label: '支付时间', prop: 'paytime' }
            ]
            this.$export.excel({ columns, data: this.listData }).then(() => {
               this.$message.success('导出表格成功')
            })
         } else {
            this.$message.warning('暂无数据导出!')
         }
      }
   }
}
</script>
