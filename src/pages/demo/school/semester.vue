<template>
   <d2-container :filename="filename">
      <template slot="header">
         <div class="flex between">
            <el-button type="primary" icon="el-icon-circle-plus-outline" @click="$router.push({name: 'demo-school-addSemester'})">添加</el-button>
            <el-form :inline="true" :model="Search" class="demo-form-inline">
               <el-form-item>
                  <el-select v-model="Search.sid" placeholder="学校">
                     <el-option v-for="(v, k) in school" :key="k" :label="v.cname" :value="v.id"></el-option>
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
         <el-table :data="Data" v-loading="loading" border style="width: 100%">
            <el-table-column prop="id" label="id" width="120" align="center"></el-table-column>
            <el-table-column prop="sid" label="学校名称" min-width="160" align="center"></el-table-column>
            <el-table-column prop="title" label="标题" min-width="160" align="center"></el-table-column>
            <el-table-column prop="startat" label="开始时间" width="120" align="center"></el-table-column>
            <el-table-column prop="endat" label="结束时间" width="120" align="center"></el-table-column>
            <el-table-column prop="unit" label="餐标" width="80" align="center"></el-table-column>
            <el-table-column prop="total" label="总共餐次" width="100" align="center"></el-table-column>
            <el-table-column prop="addtime" label="添加时间" width="120" align="center"></el-table-column>
            <el-table-column label="操作" width="180" align="center">
               <template slot-scope="scope">
                  <el-button type="primary" icon="el-icon-edit" size="small" @click="$router.push({name: 'demo-school-addSemester', query: {id: scope.row.id}})">编辑</el-button>
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
import { httpGet, httpAdd, httpEdit, httpTrash } from '@api/http'
import dayjs from 'dayjs'

export default {
   name: 'demo-school-semester',
   data() {
      return {
         filename: __filename,
         dayjs,
         school: [],
         Data: [],
         Search: {},
         isSearch: false,
         total: 0,
         pageNo: 1,
         loading: true
      }
   },
   async created() {
      await this.loadData()
   },
   methods: {
      loadData () {
         httpGet('term').then(res => {
            this.school = res.schools
            this.mapData(res.lists)
            this.total = res.total
            this.isSearch = false
            this.pageNo = 1
         })
      },
      mapData (list) {
         this.Data = list.map(item => {
            let json = {}
            json.addtime = dayjs(item.addtime * 1000).format("YYYY-MM-DD")
            json.startat = dayjs(item.startat * 1000).format("YYYY-MM-DD")
            json.endat = dayjs(item.endat * 1000).format("YYYY-MM-DD")
            json.sid = this.school.find(v => {return v.id == item.sid}) ? this.school.find(v => {return v.id == item.sid}).cname : '未知'
            json.id = item.id
            json.title = item.title
            json.total = item.total
            json.unit = item.unit
            return json
         })
         this.loading = false
      },
      onSearch () {
         this.loading = true
         httpGet(`term`, this.Search).then(res => {
            this.mapData(res.lists)
            this.total = res.total
            this.isSearch = true
            this.pageNo = 1
         })
      },
      handleCurrent (num) {
         this.loading = true
         let url = this.isSearch ? `term?sid${this.Search.sid}&page=${num}` : `term?page=${num}`
         httpGet(url).then(res => {
            this.mapData(res.lists)
         })
      },
      handleRemove (Id) {
         this.$confirm('确定删除此项?', '提示', {confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'}).then(() => {
            httpTrash('termopt', {id: Id}).then(res => {
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