<template>
   <d2-container :filename="filename">
      <template slot="header" class="flex between">
         <div class="title">学生管理</div>
      </template>
      <template>
         <el-table :data="Data" v-loading="loading" border style="width: 100%">
            <el-table-column prop="id" label="id" min-width="100" align="center"></el-table-column>
            <el-table-column prop="cname" label="学生姓名" min-width="110" align="center"></el-table-column>
            <el-table-column prop="school" label="学校" min-width="200" align="center"></el-table-column>
            <el-table-column prop="gradeClasses" label="学生班级" min-width="120" align="center"></el-table-column>
            <el-table-column label="学生性别" min-width="90" align="center">
               <template slot-scope="scope">
                  <el-tag :type="scope.row.gender != 0 ? (scope.row.gender == 1 ? '' : 'success') : 'info'">{{scope.row.gender != 0 ? (scope.row.gender == 1 ? '男' : '女') : '未知'}}</el-tag>
               </template>
            </el-table-column>
            <el-table-column prop="parents" label="家长姓名" min-width="110" align="center"></el-table-column>
            <el-table-column prop="phone" label="手机号" min-width="140" align="center"></el-table-column>
            <el-table-column prop="addtime" label="添加时间" min-width="140" align="center"></el-table-column>
            <!--<el-table-column label="操作" width="200" align="center">
               <template slot-scope="scope">
                  <el-button type="primary" icon="el-icon-edit" size="small" @click="$router.push({name: 'demo-admin-addUsers', query: {id: scope.row.id}})">编辑</el-button>
                  <el-button type="danger" icon="el-icon-delete" size="small" @click="handleRemove(scope.row.id)">删除</el-button>
               </template>
            </el-table-column>-->
         </el-table>
      </template>
      <template slot="footer">
         <el-pagination @current-change="handleCurrent" background layout="prev, pager, next" :total="total"></el-pagination>
      </template>
   </d2-container>
</template>

<script>
import { httpGet, httpAdd, httpEdit, httpTrash } from '@api/http'

export default {
   name: 'demo-users-pupil',
   data() {
      return {
         filename: __filename,
         Data: [],
         school: [],
         total: 0,
         loading: true
      }
   },
   created() {
      httpGet('student').then(res => {
         for(let [v, k] of Object.entries(res.schools)){
            this.school.push({id: v, cname: k})
         }
         this.total = res.total
         this.mapData(res.lists)
      })
   },
   methods: {
      mapData (list) {
         this.Data = list.map(item => {
            let json = {}
            json.id = item.id
            json.school = this.school.find(val => {return val.id == item.sid}).cname
            json.cname = item.cname
            json.gradeClasses = `${item.grade}${item.classes}`
            json.gender = item.gender
            json.parents = item.parents
            json.phone = item.phone
            json.addtime = this.formatDate(item.addtime, 'y-M-d')
            return json
         })
         this.loading = false
      },
      handleCurrent (num) {
         this.loading = true
         httpGet(`student?page${num}`).then(res => {
            this.mapData(res.lists)
         })
      }
   }
}
</script>