<template>
   <d2-container :filename="filename">
      <template slot="header" class="flex between">
         <div class="title">用户列表</div>
      </template>
      <template>
         <el-table :data="Data" v-loading="loading" border style="width: 100%">
            <el-table-column prop="id" label="id" min-width="100" align="center"></el-table-column>
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
         <el-pagination @current-change="handleCurrent" background layout="prev, pager, next" :total="total"></el-pagination>
      </template>
   </d2-container>
</template>

<script>
import { httpGet, httpAdd, httpEdit, httpTrash } from '@api/http'

export default {
   name: 'demo-users',
   data () {
      return {
         filename: __filename,
         Data: [],
         total: 0,
         loading: true
      }
   },
   created () {
      httpGet('user').then(res => {
         this.mapData(res.lists)
         this.total = res.total
      })
   },
   methods: {
      mapData (list) {
         this.Data = list.map(item => {
            let json = item
            item.addtime = this.formatDate(item.addtime, 'y-M-d')
            return json
         })
         this.loading = false
      },
      handleCurrent (num) {
         this.loading = true
         httpGet(`user?page=${num}`).then(res => {
            this.mapData(res.lists)
         })
      }
   }
}
</script>
