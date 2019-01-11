<template>
   <d2-container :filename="filename">
      <template slot="header">
         <div class="flex br">
            <el-form :inline="true" :model="Search">
               <el-form-item>
                  <el-select v-model="Search.sid" @change="schoolChange(Search.sid, '')" placeholder="学校">
                     <el-option v-for="s in school" :label="s.cname" :value="s.id"></el-option>
                  </el-select>
               </el-form-item>
               <el-form-item>
                  <el-select v-model="Search.grade" @change="gradeChange(Search.grade)" placeholder="年级">
                     <el-option v-for="g in grade" :label="g.name" :value="g.name"></el-option>
                  </el-select>
               </el-form-item>
               <el-form-item>
                  <el-select v-model="Search.classes" placeholder="班级">
                     <el-option v-for="c in classes" :label="c" :value="c"></el-option>
                  </el-select>
               </el-form-item>
               <el-form-item>
                  <el-select v-model="Search.state" placeholder="字段">
                     <el-option label="未支付" value="0"></el-option>
                     <el-option label="支付成功" value="1"></el-option>
                     <el-option label="退餐" value="2"></el-option>
                  </el-select>
               </el-form-item>
               <el-form-item>
                  <el-date-picker v-model="Search.beginat" type="date" placeholder="下单开始" value-format="timestamp"></el-date-picker>
               </el-form-item>
               <el-form-item>
                  <el-date-picker v-model="Search.overat" type="date" placeholder="下单结束" value-format="timestamp"></el-date-picker>
               </el-form-item>
               <el-form-item>
                  <el-date-picker v-model="Search.startat" type="date" placeholder="用餐开始" value-format="timestamp"></el-date-picker>
               </el-form-item>
               <el-form-item>
                  <el-date-picker v-model="Search.endat" type="date" placeholder="用餐结束" value-format="timestamp"></el-date-picker>
               </el-form-item>
               <el-form-item>
                  <el-select v-model="Search.type" placeholder="类型">
                     <el-option label="学生姓名" value="cname"></el-option>
                     <el-option label="手机号" value="phone"></el-option>
                  </el-select>
               </el-form-item>
               <el-form-item>
                  <el-input v-model="Search.word" placeholder="请输入内容"></el-input>
               </el-form-item>
               <el-form-item>
                  <div class="flex">
                     <el-button type="primary" @click="onSearch">查询</el-button>
                     <el-button type="primary" @click="loadData">重置</el-button>
                  </div>
               </el-form-item>
            </el-form>
         </div>
      </template>
      <template>
         <el-table :data="Data" v-loading="loading" border style="width:100%">
            <!--<el-table-column prop="id" label="id" min-width="100" align="center"></el-table-column>-->
            <el-table-column prop="school" label="学校" min-width="120" align="center"></el-table-column>
            <el-table-column prop="grade" label="年级" min-width="100" align="center"></el-table-column>
            <el-table-column prop="classes" label="班级" min-width="100" align="center"></el-table-column>
            <el-table-column prop="cname" label="学生姓名" min-width="120" align="center"></el-table-column>
            <el-table-column prop="phone" label="手机号" min-width="110" align="center"></el-table-column>
            <el-table-column prop="paytime" label="下单时间" min-width="120" align="center"></el-table-column>
            <el-table-column prop="startat" label="用餐起始时间" min-width="120" align="center"></el-table-column>
            <el-table-column prop="unit" label="餐标" min-width="80" align="center"></el-table-column>
            <el-table-column prop="total" label="订餐餐次" min-width="80" align="center"></el-table-column>
            <el-table-column prop="fee" label="总金额" min-width="80" align="center"></el-table-column>
            <el-table-column prop="state" label="订单状态" min-width="100" align="center">
               <template slot-scope="scope">
                  <el-tag :type="scope.row.state.type">{{scope.row.state.text}}</el-tag>
               </template>
            </el-table-column>
            <el-table-column prop="used" label="已消费餐次" min-width="100" align="center"></el-table-column>
            <el-table-column prop="leave" label="请假餐次" min-width="80" align="center"></el-table-column>
            <!--<el-table-column prop="addtime" label="添加时间" min-width="120" align="center"></el-table-column>
            <el-table-column label="操作" width="200" align="center">
               <template slot-scope="scope">
                  <el-button type="primary" icon="el-icon-edit" size="small" @click="$router.push({name: 'demo-admin-addUsers', query: {id: scope.row.id}})">编辑</el-button>
                  <el-button type="danger" icon="el-icon-delete" size="small" @click="handleRemove(scope.row.id)">删除</el-button>
               </template>
            </el-table-column>-->
         </el-table>
      </template>
      <template slot="footer">
         <div class="flex between">
            <el-pagination @size-change="handleSize" @current-change="handleCurrent" :current-page.sync="pageNo" :page-size="pagesize" :page-sizes="[10, 50, 100, 500, 1000, 1500, 2000, 2500]" :total="total" layout="sizes, prev, pager, next" background></el-pagination>
            <el-button type="primary" @click="exportExcel"><d2-icon name="download"/> 导出 Excel</el-button>
         </div>
      </template>
   </d2-container>
</template>

<script>
import { httpGet, httpAdd, httpEdit, httpTrash } from '@api/http'
import dayjs from 'dayjs'

export default {
   name: 'demo-orders',
   data() {
      return {
         filename: __filename,
         dayjs,
         Data: [],
         school: [],
         today: '',
         grade: [],
         classes: [],
         state: [
            { type: 'danger', text: '未支付' },
            { type: 'success', text: '支付成功' },
            { type: 'warning', text: '退餐' }
         ],
         Search: {},
         isSearch: false,
         pageNo: 1,
         pagesize: 10,
         page: 0,
         total: 0,
         loading: true
      }
   },
   async created() {
      await this.loadData()
   },
   methods: {
      loadData () {
         httpGet('order').then(res => {
            this.mapData(res.schools, res.lists, res.leaves, res.today)
            this.school = res.schools
            this.total = res.total
            this.today = res.today
            this.isSearch = false
            this.pageNo = 1
            this.Search = { sid: "", grade: "", classes: "", state: "", beginat: "", overat: "", startat: "", endat: "", type: "", word: "" }
         })
      },
      mapData (school, list, leave, today) {
         var dates = parseInt(dayjs(today * 1000).format('YYYYMMDD'))
         this.Data = list.map(item => {
            let leaves = []
            let holidays = JSON.parse(item.holiday)
            leave.forEach(v => { if (v.pid == item.id) leaves = leaves.concat(JSON.parse(v.holiday)) })
            let json = item
            json.state = this.state[item.state]
            if (item.state == 1) {
               if (leaves.indexOf(dates) > -1) {
                  json.state = { type: '', text: '请假中' }
               } else if (holidays.indexOf(dates) > -1) {
                  json.state = { type: '', text: '节假日' }
               } else if (today >= item.startat) {
                  json.state = { type: '', text: '用餐中' }
               }
            }
            json.leave = leaves.length
            json.used = 0
            for (var i = item.startat; i <= today; i += 86400) {
               var day = parseInt(dayjs(i * 1000).format("YYYYMMDD"))
               if (leaves.indexOf(day) < 0 && holidays.indexOf(day) < 0) {
                  json.used ++
               }
            }
            json.school = school.find(val => {return val.id == item.sid}).cname
            json.paytime = item.paytime ? dayjs(item.paytime * 1000).format('YYYY-MM-DD') : ''
            json.addtime = dayjs(item.addtime * 1000).format('YYYY-MM-DD')
            json.startat = dayjs(item.startat * 1000).format('YYYY-MM-DD')
            return json
         })
         this.loading = false
      },
      handleCurrent (num) {
         this.loading = true
         let url = this.isSearch ? `order?sid=${this.Search.sid}&grade=${this.Search.grade}&classes=${this.Search.classes}&state=${this.Search.state}&beginat=${this.Search.beginat / 1000}&overat=${this.Search.overat / 1000}&startat=${this.Search.startat / 1000}&endat=${this.Search.endat / 1000}&type=${this.Search.type}&word=${this.Search.word}&pagesize=${this.pagesize}&page=${num}` : `order?pagesize=${this.pagesize}&page=${num}`
         httpGet(url).then(res => {
            this.mapData(this.school, res.lists, res.leaves, this.today)
         })
      },
      handleSize (pagesize) {
         this.loading = true
         httpGet(`order`, {pagesize: pagesize}).then(res => {
            this.pagesize = pagesize
            this.today = this.today
            this.school = res.schools
            this.mapData(res.schools, res.lists, res.leaves, this.today)
         })
      },
      schoolChange (sid) {
         this.grade = JSON.parse(this.school.find(val => { return val.id == sid }).grade)
         this.Search.grade = ''
         this.Search.classes = ''
         this.classes = []
      },
      gradeChange (grade) {
         this.Search.classes = ''
         this.classes = this.grade.find(val => { return val.name == grade}).classes
      },
      onSearch () {
         if(this.Search.beginat > this.Search.overat){
            this.$message.warning('开始时间不能大于结束时间')
            return
         }
         if(this.Search.startat > this.Search.endat){
            this.$message.warning('开始时间不能大于结束时间')
            return
         }
         this.loading = true
         let posts = Object.assign({}, this.Search)
         posts.beginat = this.Search.beginat / 1000
         posts.overat = this.Search.overat / 1000
         posts.startat = this.Search.startat / 1000
         posts.endat = this.Search.endat / 1000
         httpGet(`order`, posts).then(res => {
            this.mapData(res.schools, res.lists, res.leaves, res.today)
            this.total = res.total
            this.isSearch = true
            this.pageNo = 1
         })
      },
      // 导出 Excel
      exportExcel() {
         const data = this.Data.map(item => {
            let json = Object.assign({}, item)
            json.state = item.state.text
            return json
         })
         if(data.length){
            let columns = [
               {label: '学校', prop: 'school'},
               {label: '年级', prop: 'grade'},
               {label: '班级', prop: 'classes'},
               {label: '学生姓名', prop: 'cname'},
               {label: '手机号', prop: 'phone'},
               {label: '下单时间', prop: 'paytime'},
               {label: '用餐起始时间', prop: 'startat'},
               {label: '餐标', prop: 'unit'},
               {label: '订餐餐次', prop: 'total'},
               {label: '总金额', prop: 'fee'},
               {label: '订单状态', prop: 'state'},
               {label: '已消费餐次', prop: 'used'},
               {label: '请假餐次', prop: 'leave'}
            ]
            this.$export.excel({ columns: columns, data: data }).then(() => {
               this.$message.success('导出表格成功')
            })
         } else {
            this.$message.warning(`暂无数据导出!`)
         }
      }
   }
}
</script>