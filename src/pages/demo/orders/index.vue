<template>
   <d2-container :filename="filename">
      <template slot="header" class="flex between">
         <div class="title">订单列表</div>
      </template>
      <template>
         <el-table :data="Data" v-loading="loading" border style="width: 100%">
            <el-table-column prop="id" label="id" min-width="100" align="center"></el-table-column>
            <el-table-column prop="cname" label="姓名" min-width="120" align="center"></el-table-column>
            <el-table-column prop="school" label="学校" min-width="200" align="center"></el-table-column>
            <el-table-column prop="body" label="购买内容" min-width="200" align="center"></el-table-column>
            <el-table-column prop="unit" label="餐标" min-width="60" align="center"></el-table-column>
            <el-table-column prop="fee" label="总餐次" min-width="80" align="center"></el-table-column>
            <el-table-column prop="paytime" label="下单时间" min-width="120" align="center"></el-table-column>
            <el-table-column prop="state" label="订单状态" min-width="100" align="center">
               <template slot-scope="scope">
                  <el-tag :type="scope.row.state != 0 ? (scope.row.state == 1 ? 'success' : 'warning') : 'danger'">{{scope.row.state != 0 ? (scope.row.state == 1 ? '支付成功' : '退款成功') : '未支付'}}</el-tag>
               </template>
            </el-table-column>
            <el-table-column prop="addtime" label="添加时间" min-width="120" align="center"></el-table-column>
            <!--<el-table-column label="操作" width="200" align="center">
               <template slot-scope="scope">
                  <el-button type="primary" icon="el-icon-edit" size="small" @click="$router.push({name: 'demo-admin-addUsers', query: {id: scope.row.id}})">编辑</el-button>
                  <el-button type="danger" icon="el-icon-delete" size="small" @click="handleRemove(scope.row.id)">删除</el-button>
               </template>
            </el-table-column>-->
         </el-table>
      </template>
      <template slot="footer">
         <el-pagination @current-change="handleCurrent" background layout="prev, pager, next" :total="total"></el-pagination>
      </template>
   </d2-container>
</template>

<script>
import { httpGet, httpAdd, httpEdit, httpTrash } from '@api/http'

export default {
   name: 'demo-orders',
   data() {
      return {
         filename: __filename,
         Data: [],
         school: [],
         total: 0,
         loading: true
      }
   },
   created() {
      httpGet('order').then(res => {
         for(let [v, k] of Object.entries(res.schools)){
            this.school.push({id: v, cname: k})
         }
         this.total = res.total
         this.mapData(res.lists)
      })
   },
   methods: {
      mapData (list) {
         this.Data = list.map(item => {
            let json = item
            json.school = this.school.find(val => {return val.id == item.sid}).cname
            json.paytime = item.paytime ? this.formatDate(item.paytime, 'y-M-d') : ''
            json.addtime = this.formatDate(item.addtime, 'y-M-d')
            return json
         })
         this.loading = false
      },
      handleCurrent (num) {
         httpGet(`order?page=${num}`).then(res => {
            this.mapData(res.lists)
         })
      }
   }
}
</script>