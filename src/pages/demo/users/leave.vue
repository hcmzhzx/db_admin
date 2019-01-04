<template>
   <d2-container :filename="filename">
      <template slot="header" class="flex between">
         <div class="title">请假列表</div>
      </template>
      <template>
         <el-table :data="Data" v-loading="loading" border style="width: 100%">
            <el-table-column prop="id" label="id" min-width="100" align="center"></el-table-column>
            <el-table-column prop="cname" label="姓名" min-width="120" align="center"></el-table-column>
            <el-table-column prop="school" label="学校" min-width="160" align="center"></el-table-column>
            <el-table-column prop="gradeClasses" label="学生班级" min-width="120" align="center"></el-table-column>
            <el-table-column prop="holiday" label="请假日期" min-width="100" align="center"></el-table-column>
            <el-table-column prop="total" label="请假天数" min-width="90" align="center"></el-table-column>
            <el-table-column prop="addtime" label="添加时间" min-width="120" align="center"></el-table-column>
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
import {httpGet, httpAdd, httpEdit, httpTrash} from '@api/http'

export default {
   name: 'demo-users-leave',
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
      httpGet('leave').then(res => {
         for (let [v, k] of Object.entries(res.schools)) {
            this.school.push({id: v, cname: k})
         }
         this.total = res.total
         this.mapData(res.lists)
      })
   },
   methods: {
      mapData(list) {
         //let reg = /(?<year>\d{4})(?<month>\d{2})(?<day>\d{2})/
         this.Data = list.map(item => {
            let json = item, holiday = JSON.parse(item.holiday)
            json.school = this.school.find(val => {
               return val.id == item.sid
            }).cname
            json.gradeClasses = `${item.grade}${item.classes}`
            json.holiday = holiday.length ? holiday.map(val => {
               val = val.toString()
               //return val.toString().replace(reg, '$<year>-$<month>-$<day>, ')
               return `${val.substr(0, 4)}-${val.substr(4, 2)}-${val.substr(6, 2)}, `
            }) : ''
            json.addtime = this.formatDate(item.addtime, 'y-M-d')
            return json
         })
         this.loading = false
      },
      handleCurrent(num) {
         this.loading = true
         httpGet(`leave?page=${num}`).then(res => {
            this.mapData(res.lists)
         })
      }
   }
}
</script>
