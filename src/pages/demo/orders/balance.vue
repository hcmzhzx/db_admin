<template>
   <d2-container :filename="filename">
      <template slot="header">
         <div class="flex between">
            <div class="title">余额管理</div>
            <el-form :inline="true" :model="Search" class="demo-form-inline">
               <el-form-item>
                  <el-select v-model="Search.state" placeholder="状态">
                     <el-option label="已到账" value="1"></el-option>
                     <el-option label="处理中" value="0"></el-option>
                  </el-select>
               </el-form-item>
               <el-form-item>
                  <el-select v-model="Search.types" placeholder="类型">
                     <el-option v-for="(v, k) in types" :label="v.text" :value="k"></el-option>
                  </el-select>
               </el-form-item>
               <el-form-item>
                  <el-button type="primary" @click="onSearch">查询</el-button>
                  <el-button type="primary" @click="loadData">重置</el-button>
               </el-form-item>
            </el-form>
         </div>
      </template>
      <template>
         <el-table :data="Data" v-loading="loading" max-height="700" border style="width: 100%">
            <el-table-column prop="id" label="id" min-width="80" align="center"></el-table-column>
            <el-table-column prop="cname" label="姓名" min-width="110" align="center"></el-table-column>
            <el-table-column prop="fee" label="退款金额" min-width="120" align="center"></el-table-column>
            <el-table-column label="状态" min-width="120" align="center">
               <template slot-scope="scope">
                  <el-tag :type="scope.row.state != 0 ? 'success' : 'warning' ">{{scope.row.state != 0 ? '已到账' : '处理中'}}</el-tag>
               </template>
            </el-table-column>
            <el-table-column label="类型" min-width="120" align="center">
               <template slot-scope="scope">
                  <el-tag :type="types[scope.row.types].type">{{types[scope.row.types].text}}</el-tag>
               </template>
            </el-table-column>
            <el-table-column prop="addtime" label="申请时间" min-width="120" align="center"></el-table-column>
            <el-table-column prop="updatetime" label="到账时间" min-width="120" align="center"></el-table-column>
            <el-table-column label="操作" width="200" align="center">
               <template slot-scope="scope">
                  <el-button type="primary" icon="el-icon-edit" size="small" v-if="scope.row.state == 0" @click="remittance(scope.row.cname, scope.row.id)">打款</el-button>
                  <el-button type="danger" icon="el-icon-delete" size="small" @click="handleRemove(scope.row.id)">删除</el-button>
               </template>
            </el-table-column>
         </el-table>
      </template>
      <template slot="footer">
         <el-pagination @current-change="handleCurrent" :current-page.sync="pageNo" layout="prev, pager, next" :total="total" background></el-pagination>
      </template>
   </d2-container>
</template>

<script>
import { httpGet, httpAdd, httpEdit, httpTrash, httpEditUm } from '@api/http'
import dayjs from 'dayjs'

export default {
   name: 'demo-orders-balance',
   data() {
      return {
         filename: __filename,
         dayjs,
         Data: [],
         total: 0,
         types: {
            leave: { text: '请假', type: 'warning' },
            withdraw: { text: '提现', type: 'success' },
            quit: { text: '退餐', type: 'danger' }
         },
         Search: {},
         isSearch: false,
         pageNo: 1,
         loading: true
      }
   },
   async created () {
      await this.loadData()
   },
   methods: {
      loadData () {
         httpGet('balance').then(res => {
            this.mapData(res.lists)
            this.total = res.total
            this.isSearch = false
            this.pageNo = 1
         })
      },
      mapData (list) {
         this.Data = list.map(item => {
            let json = item
            item.updatetime = item.updatetime ? dayjs(item.updatetime * 1000).format('YYYY-M-D') : '处理中'
            item.addtime = dayjs(item.addtime * 1000).format("YYYY-M-D")
            return json
         })
         this.loading = false
      },
      remittance (name, Id) {
         this.$confirm(`确定打款给${name}?`, '提示', {confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'}).then(() => {
            this.loading = true
            httpEditUm('balanceopt', {method: "refund", id: Id}).then(res => {
               this.$message.message(res.msg)
               this.loading = false
            })
         }).catch(() => {
            this.$message.info('取消打款')
         })
      },
      handleRemove (Id) {
         this.$confirm('确定删除此项?', '提示', {confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'}).then(() => {
            this.loading = true
            httpTrash('balanceopt', {id: Id}).then(res => {
               this.Data = this.Data.filter(item => { return item.id != Id })
               this.$message.success('删除成功!')
               this.loading = false
            })
         }).catch(() => {
            this.$message.info('已取消删除')
         })
      },
      handleCurrent (num) {
         this.loading = true
         let url = this.isSearch ? `balance?state=${this.Search.state}?types=${this.Search.types}&page=${num}` : `balance?page=${num}`
         httpGet(url).then(res => {
            this.mapData(res.lists)
         })
      },
      onSearch () {
         this.loading = true
         httpGet(`balance`, this.Search).then(res => {
            this.mapData(res.lists)
            this.total = res.total
            this.isSearch = true
            this.pageNo = 1
         })
      }
   }
}
</script>

<style>
.el-form-item{margin:0;}
</style>