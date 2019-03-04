<template>
   <d2-container :filename="filename">
      <template slot="header">
         <div class="flex between" style="min-width:930px">
            <div class="title">学生管理</div>
            <el-form :inline="true" :model="Search" class="demo-form-inline">
               <el-form-item>
                  <el-select v-model="Search.sid" placeholder="学校">
                     <el-option v-for="(v, k) in school" :key="k" :label="v.cname" :value="v.id"></el-option>
                  </el-select>
               </el-form-item>
               <el-form-item>
                  <el-select v-model="Search.type" placeholder="类型">
                     <el-option label="姓名" value="cname"></el-option>
                     <el-option label="手机号" value="phone"></el-option>
                  </el-select>
               </el-form-item>
               <el-form-item>
                  <el-input v-model="Search.word" placeholder="请输入内容"></el-input>
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
            <el-table-column prop="id" label="id" width="100" align="center"></el-table-column>
            <el-table-column prop="cname" label="学生姓名" min-width="120" align="center"></el-table-column>
            <el-table-column prop="school" label="学校" min-width="200" align="center"></el-table-column>
            <el-table-column prop="gradeClasses" label="学生班级" min-width="120" align="center"></el-table-column>
            <el-table-column label="学生性别" width="100" align="center">
               <template slot-scope="scope">
                  <el-tag :type="gender[scope.row.gender].type">{{gender[scope.row.gender].text}}</el-tag>
               </template>
            </el-table-column>
            <el-table-column prop="parents" label="家长姓名" min-width="120" align="center"></el-table-column>
            <el-table-column prop="phone" label="手机号" width="140" align="center"></el-table-column>
            <el-table-column prop="addtime" label="添加时间" width="120" align="center"></el-table-column>
            <!--<el-table-column label="操作" width="200" align="center">
               <template slot-scope="scope">
                  <el-button type="primary" icon="el-icon-edit" size="small" @click="$router.push({name: 'demo-admin-addUsers', query: {id: scope.row.id}})">编辑</el-button>
                  <el-button type="danger" icon="el-icon-delete" size="small" @click="handleRemove(scope.row.id)">删除</el-button>
               </template>
            </el-table-column>-->
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
   name: 'demo-users-pupil',
   data() {
      return {
         dayjs,
         filename: __filename,
         Data: [],
         school: [],
         total: 0,
         gender: [
            { text: '未知', type: 'info' },
            { text: '男', type: '' },
            { text: '女', type: 'success' }
         ],
         Search: {},
         isSearch: false,
         pageNo: 1,
         loading: true
      }
   },
   async created() {
      await this.loadData()
   },
   methods: {
      loadData () {
         this.loading = true
         httpGet('student').then(res => {
            for(let [v, k] of Object.entries(res.schools)){
               this.school.push({id: v, cname: k})
            }
            this.mapData(res.lists)
            this.total = res.total
         })
         this.isSearch = false
         this.pageNo = 1
      },
      mapData (list) {
         this.Data = list.map(item => {
            let json = item
            let scname = this.school.find(val => {return val.id == item.sid})
            json.school = scname ? scname.cname : '未知'
            json.gradeClasses = `${item.grade}${item.classes}`
            json.addtime = dayjs(item.addtime * 1000).format('YYYY-MM-DD')
            return json
         })
         this.loading = false
      },
      handleCurrent (num) {
         this.loading = true
         let url = this.isSearch ? `student?sid${this.Search.sid}&type${this.Search.type}&word=${this.Search.word}&page=${num}` : `student?page=${num}`
         httpGet(url).then(res => {
            this.mapData(res.lists)
         })
      },
      onSearch () {
         this.loading = true
         httpGet(`student`, this.Search).then(res => {
            this.mapData(res.lists)
            this.total = res.total
            this.isSearch = true
            this.pageNo = 1
         })
      }
   }
}
</script>
