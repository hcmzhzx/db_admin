<template>
   <d2-container :filename="filename">
      <template slot="header">
         <div class="flex between" style="min-width:680px">
            <div class="title">用户列表</div>
            <el-form :inline="true" :model="Search" class="demo-form-inline">
               <el-form-item>
                  <el-select v-model="Search.type" placeholder="类型">
                     <el-option label="姓名" value="cname"></el-option>
                     <el-option label="手机号" value="phone"></el-option>
                  </el-select>
               </el-form-item>
               <el-form-item>
                  <el-input v-model="Search.word" placeholder="请输入内容" clearable></el-input>
               </el-form-item>
               <el-form-item>
                  <el-button type="primary" @click="onSearch">查询</el-button>
                  <el-button type="primary" @click="loadData">重置</el-button>
               </el-form-item>
            </el-form>
         </div>
      </template>
      <template>
         <el-table :data="Data" v-loading="loading" border style="width: 100%">
            <el-table-column prop="id" label="id" width="120" align="center"></el-table-column>
            <el-table-column prop="cname" label="姓名" min-width="110" align="center"></el-table-column>
            <el-table-column label="性别" min-width="90" align="center">
               <template slot-scope="scope">
                  <el-tag :type="scope.row.gender != 0 ? (scope.row.gender == 1 ? '' : 'success') : 'info'">{{scope.row.gender != 0 ? (scope.row.gender == 1 ? '男' : '女') : '未知'}}</el-tag>
               </template>
            </el-table-column>
            <el-table-column prop="phone" label="手机号" min-width="120" align="center"></el-table-column>
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
         <el-pagination @current-change="handleCurrent" :current-page.sync="pageNo" :total="total" layout="prev, pager, next, total" background></el-pagination>
      </template>
   </d2-container>
</template>

<script>
import { httpGet } from '@api/http'
import dayjs from 'dayjs'

export default {
   name: 'demo-users',
   data () {
      return {
         filename: __filename,
         dayjs,
         Data: [],
         Search: {},
         isSearch: false,
         total: 0,
         pageNo: 1,
         loading: true
      }
   },
   created () {
      this.loadData()
   },
   methods: {
      loadData () {
         this.loading = true
         httpGet('user').then(res => {
            this.mapData(res.lists)
            this.total = res.total
         })
         this.Search = {}
         this.isSearch = false
         this.pageNo = 1
      },
      mapData (list) {
         this.Data = list.map(item => {
            let json = item
            item.addtime = dayjs(item.addtime * 1000).format('YYYY-MM-DD')
            return json
         })
         this.loading = false
      },
      handleCurrent (num) {
         this.loading = true
         let url = this.isSearch ? `user?type${this.Search.type}&word=${this.Search.word}&page=${num}` : `user?page=${num}`
         httpGet(url).then(res => {
            this.mapData(res.lists)
         })
      },
      onSearch () {
         this.loading = true
         httpGet(`user`, this.Search).then(res => {
            this.mapData(res.lists)
            this.total = res.total
            this.pageNo = 1
            this.isSearch = true
         })
      }
   }
}
</script>
