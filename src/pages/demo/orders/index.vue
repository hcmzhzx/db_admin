<template>
   <d2-container :filename="filename">
      <template slot="header">
         <div class="flex br">
            <el-form :inline="true" :model="Search">
               <el-form-item>
                  <el-select v-model="Search.sid" @change="schoolChange(Search.sid)" placeholder="学校" filterable>
                     <el-option v-for="s in school" :label="s.cname" :value="s.id" :key="s.id"></el-option>
                  </el-select>
               </el-form-item>
               <el-form-item>
                  <el-select v-model="Search.pid" @change="termChange(Search.pid)" placeholder="学期">
                     <el-option v-for="t in term" :label="t.title" :value="t.id" :key="t.id"></el-option>
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
                     <el-option label="用户昵称" value="username"></el-option>
                  </el-select>
               </el-form-item>
               <el-form-item>
                  <el-input v-model="Search.word" placeholder="请输入内容" clearable></el-input>
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
            <el-table-column prop="username" label="用户昵称" min-width="90" align="center"></el-table-column>
            <el-table-column prop="school" label="学校" min-width="100" align="center"></el-table-column>
            <el-table-column prop="title" label="学期" min-width="100" align="center"></el-table-column>
            <el-table-column prop="grade" label="年级" min-width="70" align="center"></el-table-column>
            <el-table-column prop="classes" label="班级" min-width="60" align="center"></el-table-column>
            <el-table-column prop="cname" label="学生姓名" width="78" align="center"></el-table-column>
            <el-table-column prop="phone" label="手机号" min-width="108" align="center"></el-table-column>
            <el-table-column prop="trade" label="订单号" min-width="115" align="center"></el-table-column>
            <el-table-column prop="addtime" label="下单时间" width="96" align="center"></el-table-column>
            <el-table-column prop="startat" label="用餐起始时间" min-width="106" align="center"></el-table-column>
            <el-table-column prop="quittime" label="退餐时间" width="96" align="center"></el-table-column>
            <el-table-column prop="unit" label="餐标" width="60" align="center"></el-table-column>
            <el-table-column prop="total" label="订餐餐次" width="80" align="center"></el-table-column>
            <el-table-column prop="fee" label="总金额" width="80" align="center"></el-table-column>
            <el-table-column prop="state" label="订单状态" width="100" align="center">
               <template slot-scope="scope"><el-tag :type="scope.row.state.type">{{scope.row.state.text}}</el-tag></template>
            </el-table-column>
            <el-table-column prop="used" label="已消费餐次" width="94" align="center"></el-table-column>
            <el-table-column prop="leave" label="请假餐次" width="80" align="center"></el-table-column>
            <!--<el-table-column prop="paytime" label="支付时间" min-width="120" align="center"></el-table-column>-->
            <el-table-column label="操作" width="120" align="center">
               <template slot-scope="scope">
                  <el-button type="primary" v-if="scope.row.payState === 0" icon="el-icon-edit" size="small" @click="handOrderopt(scope.row.id)">确认支付</el-button>
                  <el-button type="info" disabled icon="el-icon-edit" size="small" v-else>支付成功</el-button>
               </template>
            </el-table-column>
         </el-table>
      </template>
      <template slot="footer">
         <div class="flex between">
            <el-pagination @size-change="handleSize" @current-change="handleCurrent" :current-page.sync="pageNo" :page-size="pagesize" :page-sizes="[10, 50, 100, 500, 1000, 1500, 2000, 2500]" :total="total" layout="sizes, prev, pager, next, total" background></el-pagination>
            <el-button type="primary" @click="exportExcel"><d2-icon name="download"/> 导出 Excel</el-button>
         </div>
      </template>
   </d2-container>
</template>

<script>
import { httpGet, httpPost } from '@api/http'
import dayjs from 'dayjs'

export default {
   name: 'demo-orders',
   data () {
      return {
         filename: __filename,
         dayjs,
         today: '',
         Data: [],
         school: [],
         term: [],
         grade: [],
         classes: [],
         state: [{ type: 'danger', text: '未支付' }, { type: 'success', text: '支付成功' }, { type: 'warning', text: '退餐' }],
         Search: {},
         isSearch: false,
         pageNo: 1,
         pagesize: 10,
         page: 0,
         total: 0,
         loading: true
      }
   },
   created () {
      this.loadData()
   },
   methods: {
      // 初始化
      loadData () {
         this.loading = true
         httpGet('order').then(res => {
            this.mapData(res.schools, res.lists, res.leaves, res.today)
            this.school = res.schools
            this.total = res.total
            this.today = res.today
         })
         this.isSearch = false
         this.pageNo = 1
         this.pagesize = 10
         this.Search = { sid: '', pid: '', grade: '', classes: '', state: '', beginat: '', overat: '', startat: '', endat: '', type: '', word: '' }
      },
      // 数据整理
      mapData (school, list, leave, today) {
         var dates = parseInt(dayjs(today * 1000).format('YYYYMMDD'))
         this.Data = list.map(item => {
            let leaves = [], holidays = JSON.parse(item.holiday)
            leave.forEach(v => {
               if (v.pid == item.id) leaves = leaves.concat(JSON.parse(v.holiday))
            })
            let json = item
            json.payState = item.state
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
            json.used = 0
            if (item.state.type !== 'danger') {
               json.leave = leaves.length
               for (var i = item.startat; i <= today; i += 86400) {
                  var day = parseInt(dayjs(i * 1000).format('YYYYMMDD'))
                  if (leaves.indexOf(day) < 0 && holidays.indexOf(day) < 0 && (item.quittime === 0 || item.quittime > day)) {
                     json.used++
                  }
               }
            }
            let sname = school.find(val => val.id == item.sid)
            json.school = sname ? sname.cname : '未知'
            json.paytime = item.paytime ? dayjs(item.paytime * 1000).format('YYYY-MM-DD') : ''
            json.addtime = dayjs(item.addtime * 1000).format('YYYY-MM-DD HH:mm')
            json.startat = dayjs(item.startat * 1000).format('YYYY-MM-DD')
            let str = item.quittime.toString()
            json.quittime = item.quittime ? `${str.substr(0, 4)}-${str.substr(4, 2)}-${str.substr(6, 2)}` : '--'
            return json
         })
         this.loading = false
         this.$loading().close()
      },
      // 当前页数
      handleCurrent (num) {
         this.loading = true
         let { sid, pid, grade, classes, state, beginat, overat, startat, endat, type, word } = this.Search
         let posts = {}
         if (this.isSearch) {
            posts = { sid, pid, grade, classes, state, type, word }
            posts.beginat = beginat / 1000
            posts.overat = overat / 1000
            posts.startat = startat / 1000
            posts.endat = endat / 1000
         }
         posts.pagesize = this.pagesize
         posts.page = num
         httpGet('order', posts).then(res => {
            this.mapData(this.school, res.lists, res.leaves, this.today)
         })
      },
      // 每页显示条数
      handleSize (pagesize) {
         this.loading = true
         let { sid, pid, grade, classes, state, beginat, overat, startat, endat, type, word } = this.Search
         let posts = {}
         if (this.isSearch) {
            posts = { sid, pid, grade, classes, state, type, word }
            posts.beginat = beginat / 1000
            posts.overat = overat / 1000
            posts.startat = startat / 1000
            posts.endat = endat / 1000
         }
         posts.pagesize = pagesize
         httpGet('order', posts).then(res => {
            this.pagesize = pagesize
            this.pageNo = 1
            this.today = res.today
            this.school = res.schools
            this.mapData(res.schools, res.lists, res.leaves, this.today)
         })
      },
      // 切换学校
      schoolChange (sid) {
         this.$loading({ fullscreen: true, text: '搜索中...' })
         let sname = this.school.find(val => val.id == sid)
         this.grade = JSON.parse(sname ? sname.grade : '[]')
         this.Search.grade = ''
         this.Search.classes = ''
         this.classes = []
         httpPost('order', { sid }).then(res => {
            this.term = res.lists
            this.$loading().close()
         })
      },
      // 切换学期
      termChange (pid) {

      },
      // 切换年级
      gradeChange (grade) {
         this.Search.classes = ''
         let classname = this.grade.find(val => val.name == grade)
         this.classes = classname ? classname.classes : []
      },
      // 确认支付
      handOrderopt (id) {
         let item = this.Data.find(v => v.id === id)
         this.$confirm(`确定修改 ${item.cname} 此项?`, '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }).then(() => {
            this.loading = true
            httpPost('orderopt', { method: 'confirm', id }).then(res => {
               this.loading = false
               if (res.code === 0) {
                  item.state = 1
                  this.$message.success(res.msg)
               } else {
                  this.$message.warning(res.msg)
               }
            })
         }).catch(() => {
            this.$message.info('已取消')
         })
      },
      // 查询
      onSearch () {
         let { beginat, overat, startat, endat } = this.Search
         if (beginat > overat) {
            this.$message.warning('下单开始时间不能大于结束时间')
            return
         }
         if (startat > endat) {
            this.$message.warning('用餐开始时间不能大于结束时间')
            return
         }
         this.$loading({ fullscreen: true, text: '查询中...' })
         let posts = Object.assign({}, this.Search)
         posts.beginat = beginat / 1000
         posts.overat = overat / 1000
         posts.startat = startat / 1000
         posts.endat = endat / 1000
         httpGet(`order`, posts).then(res => {
            this.mapData(res.schools, res.lists, res.leaves, res.today)
            this.total = res.total
            this.isSearch = true
            this.pagesize = 10
            this.pageNo = 1
         })
      },
      // 导出 Excel
      exportExcel () {
         const data = this.Data.map(item => {
            let json = Object.assign({}, item)
            json.state = item.state.text
            return json
         })
         if (data.length) {
            let columns = [
               { label: '学校', prop: 'school' },
               { label: '年级', prop: 'grade' },
               { label: '班级', prop: 'classes' },
               { label: '学生姓名', prop: 'cname' },
               { label: '手机号', prop: 'phone' },
               { label: '订单号', prop: 'trade' },
               { label: '下单时间', prop: 'paytime' },
               { label: '用餐起始时间', prop: 'startat' },
               { label: '餐标', prop: 'unit' },
               { label: '订餐餐次', prop: 'total' },
               { label: '总金额', prop: 'fee' },
               { label: '订单状态', prop: 'state' },
               { label: '已消费餐次', prop: 'used' },
               { label: '请假餐次', prop: 'leave' }
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
