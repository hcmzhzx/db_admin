<template>
   <d2-container :filename="filename">
      <template slot="header">
         <div class="flex between">
            <div class="title">操作指南</div>
            <el-button type="primary" icon="el-icon-circle-plus-outline" @click="$router.push({name: 'demo-message-helpEdit'})">添加</el-button>
         </div>
      </template>
      <template>
         <el-table :data="Data" border style="width: 100%">
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
         Data: []
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
         })
      },
      handleAdd () {
         if(!this.form.title){
            this.$message.warning(`请输入标题!`)
            return
         }
         if(!this.form.description){
            this.$message.warning(`请输入副标题!`)
            return
         }
         if(!this.form.content){
            this.$message.warning(`请输入内容!`)
            return
         }
         let posts = {title: this.form.title, description: this.form.description, content: this.form.content}
         httpAdd('helpopt', posts).then(res => {
            this.$message.success(`${res.msg}`)
            this.dialog = false
            this.loadData()
         })
      },
      handleRemove (id) {
         this.$confirm('确定删除此项?', '提示', {confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'}).then(() => {
            httpTrash('helpopt', {id}).then(res => {
               this.$message.success('删除成功')
               this.Data = this.Data.filter(item => {return item.id != id})
            })
         }).catch(() => {
            this.$message.info('已取消删除')
         })
      }
   }
}
</script>
