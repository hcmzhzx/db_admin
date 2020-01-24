<template>
   <d2-container :filename="filename">
      <template slot="header" class="flex between">
         <el-form :inline="true" :model="Search" class="demo-form-inline">
            <el-form-item>
               <el-select v-model="Search.sid" @change="schoolChange(Search.sid, '')" placeholder="学校" filterable>
                  <el-option v-for="s in school" :label="s.cname" :value="s.id" :key="s.id"></el-option>
               </el-select>
            </el-form-item>
            <el-form-item>
               <el-select v-model="Search.grade" @change="gradeChange(Search.grade)" placeholder="年级">
                  <el-option v-for="g in grade" :label="g.name" :value="g.name" :key="g.name"></el-option>
               </el-select>
            </el-form-item>
            <el-form-item>
               <el-select v-model="Search.classes" placeholder="班级">
                  <el-option v-for="c in classes" :label="c" :value="c" :key="c"></el-option>
               </el-select>
            </el-form-item>
            <el-form-item>
               <el-select v-model="Search.type" placeholder="类型">
                  <el-option label="学生姓名" value="cname"></el-option>
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
      </template>
      <template>
         <el-table :data="Data" v-loading="loading" border style="width: 100%">
            <el-table-column prop="id" label="id" width="100" align="center"></el-table-column>
            <el-table-column prop="cname" label="姓名" min-width="120" align="center"></el-table-column>
            <el-table-column prop="school" label="学校" min-width="160" align="center"></el-table-column>
            <el-table-column prop="gradeClasses" label="学生班级" min-width="100" align="center"></el-table-column>
            <el-table-column prop="holiday" label="请假日期" min-width="180" align="center"></el-table-column>
            <el-table-column prop="total" label="请假天数" width="120" align="center"></el-table-column>
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
         <el-pagination @current-change="handleCurrent" :current-page.sync="pageNo" :total="total" layout="prev, pager, next, total" background></el-pagination>
      </template>
   </d2-container>
</template>

<script>
import { httpGet } from '@api/http'
import dayjs from 'dayjs'

export default {
   name: 'demo-users-leave',
   data () {
      return {
         dayjs,
         filename: __filename,
         Data: [],
         school: [],
         grade: [],
         classes: [],
         Search: {},
         isSearch: false,
         total: 0,
         pageNo: 1,
         loading: true
      }
   },
   created () {
      this.loadData()
   },
   methods: {
      loadData () {
         this.loading = true
         httpGet('leave').then(res => {
            this.school = res.schools
            this.total = res.total
            this.mapData(res.lists)
         })
         this.Search = { sid: '', grade: '', classes: '', type: '', word: '' }
         this.isSearch = false
         this.pageNo = 1
      },
      mapData (list) {
         // let reg = /(?<year>\d{4})(?<month>\d{2})(?<day>\d{2})/
         this.Data = list.map(item => {
            let json = item, holiday = JSON.parse(item.holiday)
            let scname = this.school.find(val => {
               return val.id == item.sid
            })
            json.school = scname ? scname.cname : '未知'
            json.gradeClasses = `${item.grade}${item.classes}`
            json.holiday = holiday.length ? holiday.map(val => {
               val = val.toString()
               // return val.toString().replace(reg, '$<year>-$<month>-$<day>, ')
               return `${val.substr(0, 4)}-${val.substr(4, 2)}-${val.substr(6, 2)}, `
            }) : ''
            json.addtime = dayjs(item.addtime * 1000).format('YYYY-MM-DD')
            return json
         })
         this.loading = false
      },
      schoolChange (sid) {
         let scname = this.school.find(val => val.id == sid)
         this.grade = JSON.parse(scname ? scname.grade : '[]')
         this.Search.grade = ''
         this.Search.classes = ''
         this.classes = []
      },
      gradeChange (grade) {
         this.Search.classes = ''
         let classname = this.grade.find(val => val.name == grade)
         this.classes = classname ? classname.classes : []
      },
      onSearch () {
         this.loading = true
         let { sid, grade, classes, type, word } = this.Search
         httpGet('leave', { sid, grade, classes, type, word }).then(res => {
            this.school = res.schools
            this.mapData(res.lists)
            this.total = res.total
            this.isSearch = true
            this.pageNo = 1
         })
      },
      // 分页
      handleCurrent (num) {
         this.loading = true
         let { sid, grade, classes, type, word } = this.Search
         let url = this.isSearch ? `leave?sid=${sid}&grade=${grade}&classes=${classes}&type=${type}&word=${word}&page=${num}` : `leave?page=${num}`
         httpGet(url).then(res => {
            this.mapData(res.lists)
         })
      }
   }
}
</script>
