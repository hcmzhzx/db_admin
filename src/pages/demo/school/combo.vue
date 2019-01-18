<template>
   <d2-container :filename="filename">
      <template slot="header">
         <div class="flex between">
            <div class="title">套餐管理</div>
            <el-button type="primary" icon="el-icon-circle-plus-outline" @click="$router.push({name: 'demo-school-addCombo'})">添加</el-button>
         </div>
      </template>
      <template>
         <el-table :data="Data" v-loading="loading" border style="width: 100%">
            <el-table-column prop="id" label="id" width="120" align="center"></el-table-column>
            <el-table-column prop="title" label="标题" width="140" align="center"></el-table-column>
            <el-table-column label="套餐" align="center" min-width="200">
               <template slot-scope="scope">
                  <img :src="scope.row.image" width="180" height="180" style="object-fit:cover">
               </template>
            </el-table-column>
            <el-table-column prop="school" label="学校名称" min-width="200" align="center"></el-table-column>
            <el-table-column prop="addtime" label="时间" width="140" align="center"></el-table-column>
            <el-table-column label="每日实拍" width="140" align="center">
               <template slot-scope="scope">
                  <el-button type="primary" icon="el-icon-upload2" size="small" @click="$router.push({name: 'demo-school-everyday', query: {id: scope.row.id}})">上传</el-button>
               </template>
            </el-table-column>
            <el-table-column label="操作" width="180" align="center">
               <template slot-scope="scope">
                  <el-button type="primary" icon="el-icon-edit" size="small" @click="$router.push({name: 'demo-school-addCombo', query: {id: scope.row.id}})">编辑</el-button>
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
   name: 'combo',
   data() {
      return {
         filename: __filename,
         dayjs,
         Data: [],
         school: [],
         loading: true
      }
   },
   async created() {
      await httpGet('taocan').then(res => {
         this.school = res.school
         this.Data = res.lists.map(item => {
            let json = {school:''}
            json.addtime = dayjs(item.addtime * 1000).format("YYYY-MM-DD")
            JSON.parse(item.schools).find(i => {
               json.school += `${schools.find(v => {return v.id == i}) ? schools.find(v => {return v.id == i}).cname : '未知'}, `
            })
            json.id = item.id
            json.title = item.title
            json.image = item.image
            return json
         })
         this.loading = false
      })
   },
   methods: {
      handleRemove (Id) {
         this.$confirm('确定删除此项?', '提示', {confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'}).then(() => {
            httpTrash('taocanopt', {id: Id}).then(res => {
               this.Data = this.Data.filter(item => {
                  return item.id != Id
               })
               this.$message.success('删除成功!')
            })
         }).catch(() => {
            this.$message.info('已取消删除')
         })
      }
   }
}
</script>
