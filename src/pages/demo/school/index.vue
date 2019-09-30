<template>
   <d2-container :filename="filename">
      <template slot="header">
         <div class="flex between">
            <el-button type="primary" icon="el-icon-circle-plus-outline" @click="$router.push({name: 'demo-school-addSchool'})">添加</el-button>
            <el-form :inline="true" :model="Search" class="demo-form-inline">
               <el-form-item>
                  <el-select v-model="Search.did" placeholder="地区" filterable>
                     <el-option v-for="(d, i) in district" :label="d" :value="i" :key="i"></el-option>
                  </el-select>
               </el-form-item>
               <el-form-item>
                  <el-select v-model="Search.type" placeholder="类型">
                     <el-option label="学校名" value="cname"></el-option>
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
         <el-table :data="Data" v-loading="loading" height="600" border style="width: 100%">
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
      <template slot="footer">
         <div class="flex between">
            <el-pagination @current-change="handleCurrent" :current-page.sync="pageNo" :total="total" layout="prev, pager, next, total" background></el-pagination>
         </div>
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
         loading: true,
         Data: [],
         district: {},
         Search: {},
         isSearch: false,
         pageNo: 1,
         total: 0
      }
   },
   async created() {
      await this.loadData()
   },
   methods: {
      loadData () {
         this.loading = true
         httpGet('school').then(res => {
            this.district = res.district
            this.mapData(res.lists, res.district)
            this.total = res.total
         })
         this.Search = { did: '', type: '', word: '' }
         this.isSearch = false
         this.pageNo = 1
      },
      mapData (list, district) {
         this.Data = list.map(item => {
            let json = item
            item.addtime = dayjs(item.addtime * 1000).format('YYYY-MM-DD')
            json.did = district[item.did] || '未知'
            return json
         })
         this.loading = false
      },
      onSearch () {
         this.loading = true
         let { did, type, word } = this.Search
         httpGet('school',{did, type, word}).then(res => {
            this.mapData(res.lists, this.district)
            this.total = res.total
            this.pageNo = 1
            this.isSearch = true
         })
      },
      handleCurrent (num) {
         this.loading = true
         let { did, type, word } = this.Search
         let url = this.isSearch ? `school?did${did}&type=${type}&word=${word}&page=${num}` : `school?page=${num}`
         httpGet(url).then(res => {
            this.mapData(res.lists, this.district)
         })
      },
      handleRemove (Id) {
         this.$confirm('确定删除此项?', '提示', {confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'}).then(() => {
            this.loading = true
            httpTrash('schoolopt', {id: Id}).then(res => {
               this.Data = this.Data.filter(item => { return item.id != Id })
               this.$message.success('删除成功!')
               this.loading = false
            })
         }).catch(() => {
            this.$message.info('已取消删除')
         })
      }
   }
}
</script>
