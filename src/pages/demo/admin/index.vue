<template>
   <d2-container :filename="filename">
      <template slot="header">
         <div class="flex between">
            <div class="title">管理员管理</div>
            <el-button type="primary" icon="el-icon-circle-plus-outline" @click="$router.push({name: 'demo-admin-addUsers'})">添加</el-button>
         </div>
      </template>
      <template>
         <el-table :data="Data" v-loading="loading" border style="width: 100%">
            <el-table-column prop="id" label="id" min-width="100" align="center"></el-table-column>
            <el-table-column prop="account" label="账号" min-width="200" align="center"></el-table-column>
            <el-table-column label="头像" align="center" min-width="140">
               <template slot-scope="scope">
                  <img :src="scope.row.head" width="120" style="object-fit:cover">
               </template>
            </el-table-column>
            <el-table-column prop="groups" label="所属用户组" min-width="200" align="center"></el-table-column>
            <el-table-column label="状态" width="100" align="center">
               <template slot-scope="scope">
                  <el-tag :type="scope.row.state ? 'success' : 'danger'">{{scope.row.state ? '正常' : '禁用'}}</el-tag>
               </template>
            </el-table-column>
            <el-table-column prop="addtime" label="添加时间" min-width="140" align="center"></el-table-column>
            <el-table-column prop="logintime" label="最后登录时间" min-width="140" align="center"></el-table-column>
            <el-table-column label="操作" width="200" align="center">
               <template slot-scope="scope">
                  <el-button type="primary" icon="el-icon-edit" size="small" @click="$router.push({name: 'demo-admin-addUsers', query: {id: scope.row.id}})">编辑</el-button>
                  <el-button type="danger" icon="el-icon-delete" size="small" @click="handleRemove(scope.row.id)">删除</el-button>
               </template>
            </el-table-column>
         </el-table>
      </template>
   </d2-container>
</template>

<script>
import { httpGet, httpTrash } from '@api/http'
import dayjs from 'dayjs'

export default {
   name: 'users',
   data () {
      return {
         dayjs,
         filename: __filename,
         Data: [],
         groups: [],
         loading: true
      }
   },
   created () {
      httpGet('admin').then(res => {
         for (let [v, k] of Object.entries(res.groups)) {
            this.groups.push({ id: v, label: k })
         }
         this.Data = res.lists.map(item => {
            let json = item, arr = []
            json.addtime = dayjs(item.addtime * 1000).format('YYYY-MM-DD')
            json.logintime = item.logintime ? dayjs(item.logintime * 1000).format('YYYY-MM-DD') : ''
            item.groups.split(',').forEach(item => {
               var result = this.groups.find(val => item == val.id)
               arr.push(result ? result.label : '')
            })
            json.groups = arr.join(',')
            return json
         })
         this.loading = false
      })
   },
   methods: {
      handleRemove (id) {
         this.$confirm('确定删除此项?', '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }).then(() => {
            httpTrash('adminopt', { id }).then(res => {
               if (res.code == 0) {
                  this.Data = this.Data.filter(item => item.id != id)
                  this.$message.success(res.msg)
               } else {
                  this.$message.warning(res.msg)
               }
            })
         }).catch(() => {
            this.$message.info('已取消删除')
         })
      }
   }
}
</script>
