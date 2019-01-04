<template>
   <d2-container :filename="filename">
      <template slot="header">
         <div class="flex between">
            <div class="title">学校管理</div>
            <el-button type="primary" icon="el-icon-circle-plus-outline" @click="$router.push({name: 'demo-school-addSchool'})">添加</el-button>
         </div>
      </template>
      <template>
         <el-table :data="Data" v-loading="loading" border style="width: 100%">
            <el-table-column prop="id" label="id" width="120" align="center"></el-table-column>
            <el-table-column prop="cname" label="学校名称" align="center"></el-table-column>
            <el-table-column prop="did" label="地区" align="center"></el-table-column>
            <el-table-column label="合同" align="center">
               <template slot-scope="scope">
                  <img :src="scope.row.contract" width="100" height="120" style="object-fit:cover">
               </template>
            </el-table-column>
            <el-table-column prop="contact" label="联系方式" width="160" align="center"></el-table-column>
            <el-table-column prop="addtime" label="时间" width="160" align="center"></el-table-column>
            <el-table-column label="操作" width="180" align="center">
               <template slot-scope="scope">
                  <el-button type="primary" icon="el-icon-edit" size="small" @click="$router.push({name: 'demo-school-addSchool', query: {id: scope.row.id}})">编辑</el-button>
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
   name: 'demo-school-school',
   data() {
      return {
         filename: __filename,
         dayjs,
         Data: [],
         district: [], // 地区
         loading: true
      }
   },
   async created() {
      await httpGet('school').then( res => {
         for(let [k, v] of Object.entries(res.district)){
            this.district.push({id: Number(k), cname: v})
         }
         this.Data = res.lists.map( item => {
            let json = item
            item.addtime = dayjs(item.addtime * 1000).format("YYYY-M-D")
            json.did = item.did ? this.district.find(val => {return val.id == item.did}).cname : ''
            return json
         })
         this.loading = false
      })
   },
   methods: {
      handleRemove (Id) {
         this.$confirm('确定删除此项?', '提示', {confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'}).then(() => {
            httpTrash('schoolopt', {id: Id}).then(res => {
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
