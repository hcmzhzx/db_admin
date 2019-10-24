<template>
   <d2-container :filename="filename">
      <template slot="header">
         <div class="flex between">
            <div class="title">操作指南</div>
            <el-button type="primary" icon="el-icon-circle-plus-outline" @click="$router.push({name: 'demo-message-helpEdit'})">添加</el-button>
         </div>
      </template>
      <template>
         <el-table :data="Data" v-loading="loading" border style="width: 100%">
            <el-table-column prop="id" label="id" min-width="100" align="center"></el-table-column>
            <el-table-column prop="title" label="标题" min-width="110" align="center"></el-table-column>
            <el-table-column prop="description" label="描述" min-width="110" align="center"></el-table-column>
            <el-table-column prop="addtime" label="添加时间" min-width="120" align="center"></el-table-column>
            <el-table-column label="操作" width="200" align="center">
               <template slot-scope="scope">
                  <el-button type="primary" icon="el-icon-edit" size="small" @click="$router.push({name: 'demo-message-helpEdit', query: {id: scope.row.id}})">编辑</el-button>
                  <el-button type="danger" icon="el-icon-delete" size="small" @click="handleRemove(scope.row.id)">删除</el-button>
               </template>
            </el-table-column>
         </el-table>
      </template>
   </d2-container>
</template>

<script>
import { httpGet, httpAdd, httpEdit, httpTrash } from '@api/http'
import dayjs from 'dayjs'

export default {
   name: 'demo-message-help',
   data() {
      return {
         filename: __filename,
         dayjs,
         Data: [],
         loading: true
      }
   },
   async created () {
      await this.loadData()
   },
   methods: {
      loadData () {
         httpGet('help').then(res => {
            this.Data = res.lists.map(item => {
               let json = item
               json.addtime = dayjs(item.addtime * 1000).format('YYYY-M-D')
               return json
            })
            this.loading = false
         })
      },
      handleRemove (id) {
         this.$confirm('确定删除此项?', '提示', {confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'}).then(() => {
            httpTrash('helpopt', {id}).then(res => {
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
