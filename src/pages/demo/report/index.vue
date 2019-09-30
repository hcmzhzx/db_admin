<template>
   <d2-container :filename="filename">
      <template slot="header" class="flex">
         <el-form :inline="true" :model="form" class="br">
            <el-form-item>
               <el-select v-model="form.did" placeholder="地区" @change="selectChange(form.did, '', '')" filterable>
                  <el-option v-for="item in form.district" :key="item.id" :label="item.cname" :value="item.id"></el-option>
               </el-select>
            </el-form-item>
            <el-form-item>
               <el-select v-model="form.sid" placeholder="学校" @change="selectChange(form.did, form.sid, form.pid)" filterable>
                  <el-option v-for="item in form.school" :key="item.id" :label="item.cname" :value="item.id"></el-option>
               </el-select>
            </el-form-item>
            <el-form-item>
               <el-select v-model="form.pid" placeholder="学期" @change="productChange(form.pid)">
                  <el-option v-for="item in form.product" :key="item.id" :label="item.title" :value="item.id"></el-option>
               </el-select>
            </el-form-item>
            <el-form-item>
               <el-date-picker v-model="form.Time" type="daterange" value-format="timestamp" start-placeholder="开始日期" range-separator="至" end-placeholder="结束日期"></el-date-picker>
            </el-form-item>
            <el-form-item>
               <div class="flex">
                  <el-button type="primary" @click="create">生成</el-button>
                  <el-button type="primary" @click="exportExcel"><d2-icon name="download"/> 导出 Excel</el-button>
               </div>
            </el-form-item>
         </el-form>
      </template>
      <template>
         <el-table v-bind="table" show-summary :span-method="SpanMethod" max-height="500" style="width:100%">
            <el-table-column fixed v-for="(item, index) in table.columns" :key="index" :prop="item.prop" :label="item.label" v-if="index == 0" align="center" min-width="120px"></el-table-column>
            <el-table-column v-for="(item, index) in table.columns" :key="item.prop" :prop="item.prop" :label="item.label" v-if="index > 0" align="center" min-width="120px"></el-table-column>
         </el-table>
         <div class="flex between" style="margin-top:20px;width:100%;align-items:start;">
            <div>
               <el-table :data="leaves" empty-text="暂无请假数据" :show-header="false" border style="width:100%">
                  <el-table-column prop="grade" align="center" min-width="110px"></el-table-column>
                  <el-table-column prop="classes" align="center" min-width="110px"></el-table-column>
                  <el-table-column prop="cname" align="center" min-width="400px"></el-table-column>
               </el-table>
            </div>
            <div>
               <el-table :data="quit" empty-text="暂无退餐数据" :show-header="false" border style="width:100%">
                  <el-table-column prop="grade" align="center" min-width="110px"></el-table-column>
                  <el-table-column prop="classes" align="center" min-width="110px"></el-table-column>
                  <el-table-column prop="cname" align="center" min-width="400px"></el-table-column>
               </el-table>
            </div>
         </div>
      </template>
   </d2-container>
</template>

<script>
import { httpGet, httpPost } from '@api/http'
import dayjs from 'dayjs'

export default {
   name: 'admin',
   data() {
      return {
         filename: __filename,
         dayjs,
         form: { district: [], did: '', school: [], sid: '', product: [], pid: '', Time: [] },
         grade: [],
         startat: 0,
         endat: 0,
         orders: '',
         table: {
            columns: [
               {label: '学校', prop: 'school'},
               {label: '年级', prop: 'grade'},
               {label: '班级', prop: 'classes'},
               {label: '用餐人数', prop: 'total'},
               {label: '请假人数', prop: 'leave'},
               {label: '退餐人数', prop: 'quit'}
            ],
            data: [],
            stripe: true,
            border: true
         },
         leaves: [],
         quit: []

      }
   },
   created() {
      httpGet('meals').then(res => {
         // 地区
         this.form.district = res.district
         this.form.did = this.form.district.length ? this.form.district[0].id : ''

         this.headSelect(this.form.sid, res.school, this.form.pid, res.product)
      })
   },
   methods: {
      selectChange(did, sid, pid) {
         this.$loading({fullscreen: true})
         did = did ? did : 0; sid = sid ? sid : 0; pid = pid ? pid : 0
         httpGet('meals', {did, sid, pid}).then(res => {
            this.headSelect(sid, res.school, pid, res.product)
            this.$loading().close()
         })
      },

      headSelect(sid, school, pid, product) {
         // 学校
         this.form.sid = school.length ? (sid ? sid : school[0].id ) : ''
         if(school.length>0){
            this.form.school = school
            let grades = school.find(item => { return item.id == this.form.sid })
            this.grade = grades ? grades.grade : []
         } else {
            this.form.school = []
         }

         // 学期
         this.form.pid = product.length ? (pid ? pid : product[0].id ) : ''
         if(product.length>0){
            this.form.product = product
            this.form.pid = product[0].id
            let productList = product.find(item => {return item.id == this.form.pid})
            if(productList){
               this.startat = productList.startat
               this.endat = productList.endat
               this.form.Time = [ productList.startat * 1000, productList.startat * 1000 ]
               this.holiday = productList.holiday
            }
         } else {
            this.form.product = []
            this.form.Time = []
            this.startat = ''
            this.endat = ''
         }
      },
      // 切换学期
      productChange (pid) {
         let productList = this.form.product.find(item => { return item.id == pid })
         if(productList){
            this.startat = productList.startat
            this.endat = productList.endat
            this.form.Time = [ productList.startat * 1000, productList.startat * 1000 ]
            this.holiday = productList.holiday
         }
      },
      // 生成
      create() {
         let { did, sid, pid } = this.form
         if (did != '' && sid != '' && pid != '') {
            if (this.form.Time.length == 2) {
               if (this.form.Time[0] / 1000 >= this.startat && this.form.Time[1] / 1000 <= this.endat) {
                  this.$loading({ fullscreen: true })
                  let slabel = this.form.school.find(val => { return val.id == sid })
                  let school = slabel ? slabel.cname : '未知'
                  httpPost('meals',{did, sid, pid}).then(res => {
                     this.parseData(this.form.Time[0] / 1000, this.form.Time[1] / 1000, school, this.grade, this.holiday, res.leave, res.order)
                     this.$loading().close()
                  })
               } else {
                  this.$message.warning(`超出该学期时间段了!`)
               }
            } else {
               this.$message.warning(`当前没有时间段!`)
            }
         } else {
            this.$message.warning(`当前没有学期数据!`)
         }
      },

      parseData (startat, endat, school, grade, holiday, leaves, orders) {
         let holidays = JSON.parse(holiday), grades = []
         orders.forEach(item => {
            item.leave = []
            leaves.forEach(val => { if(item.uid == val.uid) item.leave = item.leave.concat(JSON.parse(val.holiday)) })
         })
         JSON.parse(grade).forEach((item, keys) => {
            item.classes.forEach((v, k) => {
               let items = { school: school, grade: item.name, classes: v, total: { num: 0, users: [] }, leave: { num: 0, users: [] }, quit: { num: 0, users: [] } }
               for (let i = startat; i <= endat; i += 86400) {
                  orders.forEach(val => {
                     if (val.startat <= i || val.endat <= i) {
                        if (val.grade == items.grade && val.classes == items.classes) {
                           let day = parseInt(dayjs(i * 1000).format('YYYYMMDD'))
                           if (holidays.indexOf(day) == -1) {
                              if (val.quittime == 0 || val.quittime > day) {
                                 if (val.leave.indexOf(day) > -1) {
                                    items.leave.num++
                                    items.leave.users.push(val.cname)
                                 } else {
                                    items.total.num++
                                    items.total.users.push(val.cname)
                                 }
                              } else {
                                 if (val.quittime == day) {
                                    items.quit.num++
                                    items.quit.users.push(val.cname)
                                 }
                              }
                           }
                        }
                     }
                  })
               }
               grades.push(items)
            })
         })
         // 内容
         this.table.data = grades.map(item => {
            let json = Object.assign({}, item)
            json.total = item.total.num
            json.leave = item.leave.num
            json.quit = item.quit.num
            return json
         })
         // 请假
         this.leaves = []
         let leaveSum = new Set()
         // 退餐
         this.quit = []
         let quitSum = new Set()
         grades.forEach(item => {
            if(item.leave.users.length){
               let json = Object.assign({}, item)
               json.grade = item.grade
               json.classes = `${item.classes}`
               json.cname = [...new Set(item.leave.users)].join(',')
               item.leave.users.forEach(v => { leaveSum.add(v) })
               if (json) this.leaves.push(json)
            }
            if(item.quit.users.length){
               let json = Object.assign({}, item)
               json.grade = item.grade
               json.classes = `${item.classes}`
               json.cname = [...new Set(item.quit.users)].join(',')
               item.quit.users.forEach(v => { quitSum.add(v) })
               if (json) this.quit.push(json)
            }
         })
         this.leaves.unshift({grade: `请假: ${[...leaveSum].length}人`, classes: '', cname: ''})
         this.quit.unshift({ grade: `退餐: ${[...quitSum].length}人`, classes: '', cname: '' })
      },
      SpanMethod ({ row, column, rowIndex, columnIndex }) {
         if (columnIndex === 0) {
            if (rowIndex  === 0) {
               return { rowspan: this.table.data.length, colspan: 1 }
            } else {
               return { rowspan: 0, colspan: 0 }
            }
         }
      },

      // 开始时间 结束时间 班级 假日
      /*parseData (startat, endat, grade, holiday, leaves, orders) {
         let holidays = JSON.parse(holiday), grades = [], dates = []
         JSON.parse(grade).forEach((item, keys) => {
            item.classes.forEach((v, k) => {
               let items = { name: item.name + v }
               for (let i = startat; i <= endat; i += 86400) {
                  let date = new Date(i * 1000)
                  let mark = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0')
                  let day = parseInt(mark.split('-').join(''))
                  if (keys == 0 && k == 0) dates.push(mark)
                  if (holidays.indexOf(day) > -1) {
                     //items[mark] = { num: 0, holiday: 1, cname: [] }
                     items[mark] = '假日'
                  } else {
                     items[mark] = this.getNumber(items.name, orders, i, day, leaves)
                  }
               }
               grades.push(items)
            })
         })
         // return { grades: grades, dates: dates }
         // 表头
         this.table.columns = [ {label: '班级', prop: 'name'} ]
         let columns = dates.map(item => {
            let json = {}
            json.label = item
            json.prop = item
            return json
         })
         this.table.columns.push(...columns)
         // 内容
         this.table.data = []
         grades.forEach(item => {
            let json = {}
            for(let [k, v] of Object.entries(item)){
               json[k] = v
            }
            this.table.data.push(json)
         })
      },
      getNumber (classes, order, timestamp, day, leave) {
         //let nums = { num: 0, holiday: 0, cname: [] }
         let nums = 0
         order.forEach(item => {
            if (item.startat <= timestamp && (item.grade + item.classes == classes)) {
               let leaves = []
               leave.forEach(v => { if (v.uid == item.uid) leaves = leaves.concat(JSON.parse(v.holiday)) })
               //if (leaves.indexOf(day) == -1) nums.num ++, nums.cname.push(item.cname)
               if (leaves.indexOf(day) == -1) nums ++
            }
         })
         return nums
      },*/

      // 导出 Excel
      exportExcel() {
         if(this.table.data.length){
            let length = this.table.columns.length
            let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
            var first = Math.floor(length / chars.length), second = length % chars.length
            var merges = chars[0] + '1,' + (first > 0 ? chars[first - 1] : '') + chars[second - 1] + 1
            this.$export.excel({
               columns: this.table.columns,
               data: this.table.data,
               header: '用餐详情',
               merges: [merges.split(','), `A2, A${this.table.data.length+2}`.split(',')]
            }).then(() => { this.$message.success('导出表格成功') })
         } else {
            this.$message.warning(`请先生成数据再导出!`)
         }
      }
   }
}
</script>
