<template>
   <d2-container :filename="filename">
      <template slot="header" class="flex between">
         <div class="title">余额管理</div>
      </template>
      <template>
         <el-table :data="Data" max-height="700" border style="width: 100%">
            <el-table-column prop="id" label="id" min-width="80" align="center"></el-table-column>
            <el-table-column prop="cname" label="姓名" min-width="110" align="center"></el-table-column>
            <el-table-column prop="fee" label="退款金额" min-width="120" align="center"></el-table-column>
            <el-table-column label="状态" min-width="120" align="center">
               <template slot-scope="scope">
                  <el-tag :type="scope.row.state != 0 ? 'success' : 'warning' ">{{scope.row.state != 0 ? '已到账' : '处理中'}}</el-tag>
               </template>
            </el-table-column>
            <el-table-column prop="types" label="类型" min-width="120" align="center">
               <template slot-scope="scope">
                  <el-tag :type="scope.row.types != 'leave' ? (scope.row.types == 'withdraw' ? 'success' : 'danger') : 'warning'">{{scope.row.types != 'leave' ? (scope.row.types == 'withdraw' ? '提现' : '退餐') : '请假'}}</el-tag>
               </template>
            </el-table-column>
            <el-table-column prop="addtime" label="申请时间" min-width="120" align="center"></el-table-column>
            <el-table-column prop="updatetime" label="到账时间" min-width="120" align="center"></el-table-column>
         </el-table>
      </template>
      <template slot="footer">
         <el-pagination @current-change="handleCurrent" background layout="prev, pager, next" :total="total"></el-pagination>
      </template>
   </d2-container>
</template>

<script>
import { httpGet, httpAdd, httpEdit, httpTrash } from '@api/http'
import dayjs from 'dayjs'

export default {
   name: 'demo-orders-balance',
   data() {
      return {
         filename: __filename,
         dayjs,
         Data: [],
         total: 0
      }
   },
   created () {
      this.mapData()
   },
   methods: {
      mapData () {
         httpGet('balance').then(res => {
            this.total = res.total
            this.Data = res.lists.map(item => {
               let json = item
               item.updatetime = item.updatetime ? dayjs(item.updatetime * 1000 ).format('YYYY-M-D') : '处理中'
               item.addtime = dayjs(item.addtime * 1000).format("YYYY-M-D")
               return json
            })
         })
      },
      handleCurrent (num) {
         httpGet(`balance?page=${num}`).then(res => {
            this.mapData(res.lists)
         })
      }
   }
}
</script>
