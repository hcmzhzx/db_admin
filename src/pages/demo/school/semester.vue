<template>
   <d2-container :filename="filename">
      <template slot="header">
         <div class="flex between">
            <div class="title">学期管理</div>
            <el-button type="primary" icon="el-icon-circle-plus-outline" @click="$router.push({name: 'demo-school-addSemester'})">添加</el-button>
         </div>
      </template>
      <template>
         <el-table :data="Data" v-loading="loading" border style="width: 100%">
            <el-table-column prop="id" label="id" width="120" align="center"></el-table-column>
            <el-table-column prop="sid" label="学校名称" align="center"></el-table-column>
            <el-table-column prop="title" label="标题" align="center"></el-table-column>
            <el-table-column prop="startat" label="开始时间" width="160" align="center"></el-table-column>
            <el-table-column prop="endat" label="结束时间" width="160" align="center"></el-table-column>
            <el-table-column prop="unit" label="餐标" width="80" align="center"></el-table-column>
            <el-table-column prop="total" label="总共餐次" width="100" align="center"></el-table-column>
            <el-table-column prop="addtime" label="添加时间" width="140" align="center"></el-table-column>
            <el-table-column label="操作" width="180" align="center">
               <template slot-scope="scope">
                  <el-button type="primary" icon="el-icon-edit" size="small" @click="$router.push({name: 'demo-school-addSemester', query: {id: scope.row.id}})">编辑</el-button>
                  <el-button type="danger" icon="el-icon-delete" size="small" @click="handleRemove(scope.row.id)">删除</el-button>
               </template>
            </el-table-column>
         </el-table>
      </template>
   </d2-container>
</template>

<script>
import { httpGet, httpAdd, httpEdit, httpTrash } from '@api/http'

export default {
   name: 'semester',
   data() {
      return {
         filename: __filename,
         school: [],
         Data: [],
         loading: true
      }
   },
   async created() {
      await httpGet('term').then(res => {
         for(let [k, v] of Object.entries(res.school)){
            this.school.push({id: Number(v), cname: k})
         }
         this.Data = res.lists.map(item => {
            let json = {}
            json.addtime = this.formatDate(item.addtime, 'y-M-d')
            json.startat = this.formatDate(item.startat, 'y-M-d')
            json.endat = this.formatDate(item.endat, 'y-M-d')
            json.sid = this.school.find(v => {return v.id == item.sid}).cname
            json.id = item.id
            json.title = item.title
            json.total = item.total
            json.unit = item.unit
            return json
         })
         this.loading = false
      })
   },
   methods: {
      handleRemove (Id) {
         this.$confirm('确定删除此项?', '提示', {confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'}).then(() => {
            httpTrash('termopt', {id: Id}).then(res => {
               this.Data = this.Data.filter(item => {
                  return item.id != Id
               })
               this.$message({type: 'success', message: '删除成功!'})
            })
         }).catch(() => {
            this.$message({type: 'info', message: '已取消删除'})
         })
      }
   }
}
</script>