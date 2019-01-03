<template>
   <d2-container :filename="filename">
      <template slot="header">
         <div class="flex between">
            <div class="title">套餐管理</div>
            <el-button type="primary" icon="el-icon-circle-plus-outline" @click="$router.push({name: 'demo-School-addCombo'})">添加</el-button>
         </div>
      </template>
      <template>
         <el-table :data="Data" border style="width: 100%">
            <el-table-column prop="id" label="id" width="120" align="center"></el-table-column>
            <el-table-column prop="title" label="标题" width="140" align="center"></el-table-column>
            <el-table-column label="套餐" align="center" width="300">
               <template slot-scope="scope">
                  <img :src="scope.row.image" width="180" height="180" style="object-fit:cover">
               </template>
            </el-table-column>
            <el-table-column prop="school" label="学校名称" align="center"></el-table-column>
            <el-table-column prop="addtime" label="时间" width="140" align="center"></el-table-column>
            <el-table-column label="每日实拍" width="140" align="center">
               <template slot-scope="scope">
                  <el-button type="primary" icon="el-icon-upload2" size="small" @click="$router.push({name: 'demo-School-everyday', query: {id: scope.row.id}})">上传</el-button>
               </template>
            </el-table-column>
            <el-table-column label="操作" width="180" align="center">
               <template slot-scope="scope">
                  <el-button type="primary" icon="el-icon-edit" size="small" @click="$router.push({name: 'demo-School-addCombo', query: {id: scope.row.id}})">编辑</el-button>
                  <el-button type="danger" icon="el-icon-delete" size="small" @click="handleRemove(scope.row.id)">删除</el-button>
               </template>
            </el-table-column>
         </el-table>
      </template>
   </d2-container>
</template>

<script>
import { httpGet, httpTrash } from '@api/http'

export default {
   name: 'combo',
   data() {
      return {
         filename: __filename,
         Data: []
      }
   },
   async created() {
      await httpGet('taocan').then(res => {
         let schools = []
         for(let [v, k] of Object.entries(res.school)){
            schools.push({id: k, cname: v})
         }
         this.Data = res.lists.map(item => {
            let json = {school:''}
            json.addtime = this.formatDate(item.addtime, 'y-M-d')
            JSON.parse(item.schools).find(i => {
               json.school += `${schools.find(v => {return v.id == i}).cname}, `
            })
            json.id = item.id
            json.title = item.title
            json.image = item.image
            return json
         })
      })
   },
   methods: {
      handleRemove (Id) {
         this.$confirm('确定删除此项?', '提示', {confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'}).then(() => {
            httpTrash('taocanopt', {id: Id}).then(res => {
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
