<template>
   <d2-container :filename="filename">
      <template slot="header" class="flex">
         <el-form :inline="true" :model="form" class="br">
            <el-form-item>
               <el-select v-model="form.did" placeholder="地区" @change="selectChange(form.did)" filterable>
                  <el-option v-for="item in form.district" :key="item.id" :label="item.cname" :value="item.id"></el-option>
               </el-select>
            </el-form-item>
            <el-form-item>
               <el-select v-model="form.sid" placeholder="学校" @change="selectChange(form.did, form.sid, form.pid)" filterable>
                  <el-option v-for="item in form.school" :key="item.id" :label="item.cname" :value="item.id"></el-option>
               </el-select>
            </el-form-item>
            <el-form-item>
               <el-select v-model="form.pid" placeholder="学期" @change="changeProduct(form.pid)">
                  <el-option v-for="item in form.product" :key="item.id" :label="item.title" :value="item.id"></el-option>
               </el-select>
            </el-form-item>
            <el-form-item>
               <el-date-picker v-model="form.time" @change="resetDate" align="right" type="date" placeholder="选择日期" :picker-options="pickerOptions"></el-date-picker>
            </el-form-item>
            <el-form-item>
               <el-select v-model="form.grade" placeholder="年级" @change="selectChange(form.did, form.sid, form.pid, form.grade)">
                  <el-option v-for="item in form.grades" :key="item.name" :label="item.name" :value="item.name"></el-option>
               </el-select>
            </el-form-item>
            <el-form-item>
               <el-select v-model="form.classes" placeholder="班级">
                  <el-option v-for="item in form.classess" :key="item" :label="item" :value="item"></el-option>
               </el-select>
            </el-form-item>
            <el-form-item>
               <div class="flex">
                  <el-button type="primary" @click="create">查询</el-button>
               </div>
            </el-form-item>
         </el-form>
      </template>
      <template>
         <div class="flex br menology">
            <div class="month" v-for="(v, k) in blocklist" :key="k">
               <div class="flex center title">{{monthes[k]}}</div>
               <div class="flex week">
                  <div v-for="(v, k) in weeks" :key="k" class="flexitem center item">{{v}}</div>
               </div>
               <div class="flex rows" v-for="(i, s) in v" :key="s">
                  <div v-for="(t, z) in i" :key="z" :class="['flexitemv', 'center' ,'item', (t.keys == 0 || t.holiday > -1) ? 'disable' : '']" @click="holiday(k, s, z)">
                     <div :class="['flex','center','days', {current: t.keys == curtday }]">{{t.day}}</div>
                  </div>
               </div>
            </div>
         </div>
         <el-table ref="multiple" :data="tableData" border tooltip-effect="dark" style="width:100%" @selection-change="selectionChange">
            <el-table-column type="selection" width="55" :selectable="selectable"></el-table-column>
            <el-table-column prop="grade" label="年级" align="center" min-width="120"></el-table-column>
            <el-table-column prop="classes" label="班级" align="center" min-width="120"></el-table-column>
            <el-table-column prop="cname" label="学生姓名" align="center" min-width="120"></el-table-column>
            <el-table-column prop="parents" label="家长姓名" align="center" min-width="120"></el-table-column>
            <el-table-column prop="remark" label="备注" align="center" min-width="120">
               <template slot-scope="scope">{{scope.row.statetxt}}</template>
            </el-table-column>
         </el-table>
      </template>
      <template slot="footer">
         <el-button type="primary" @click="confirm">确定选择</el-button>
         <el-button type="primary" @click="cancel">取消选择</el-button>
      </template>
   </d2-container>
</template>

<script>
import { httpGet, httpPost } from '@api/http'
import dayjs from 'dayjs'

export default {
   name: "demo-users-batchLeave",
   data() {
      return {
         filename: __filename,
         dayjs,
         form: { district: [], did: '', school: [], sid: '', product: [], pid: '', grades: [], grade: '', classess: [], classes: '', time: '' },
         tableData: [],
         holidays: [],
         weeks: [],
         monthes: [],
         blocklist: [],
         today: '',

         curtday: null,
         leaveuid: [],
         leaves: [],
         students: [],
         loading: true,
         pickerOptions: {}
      }
   },
   async created () {
      await httpGet('leavebat').then(res => {
         // 地区
         this.form.district = res.district
         this.form.did = this.form.district.length ? this.form.district[0].cname : ''
         this.headSelect(this.form.sid, res.school, this.form.pid, res.product, this.form.gid)
         let { startat, endat, holiday} = res.product.find(item => { return item.id == this.form.pid })
         this.disabledate(startat, endat, holiday)
      })
   },
   methods: {
      // 日期改变重置数据
      resetDate () {
         this.tableData = [] // 清除数据
      },
      // 日期限制
      disabledate (startat, endat, holiday) {
         startat = parseInt(dayjs(startat * 1000).format('YYYYMMDD'))
         endat = parseInt(dayjs(endat * 1000).format('YYYYMMDD'))
         this.pickerOptions = {
            disabledDate(time) {
               time = dayjs(time).format('YYYYMMDD')
               if (time < startat || time > endat) return true
               return holiday.includes(time)
            }
         }
      },
      // 选择学校
      selectChange(did, sid, pid, grade, classes) {
         this.$loading({ fullscreen: true })
         did = did ? did : 0
         sid = sid ? sid : 0
         pid = pid ? pid : 0
         grade = grade ? grade : 0
         classes = classes ? classes : 0
         httpGet('leavebat', { did, sid, pid, classes, classes }).then(res => {
            this.headSelect(sid, res.school, pid, res.product, grade, classes)
            this.$loading().close()
         })
      },
      // 根据学校联动
      headSelect(sid, school, pid, product, gid, cid) {
         // 学校
         this.form.sid = school.length ? (sid ? sid : school[0].id ) : ''
         if(school.length>0){
            this.form.school = school
            let grades = school.find(item => { return item.id == this.form.sid })
            this.form.grades = grades ? JSON.parse(grades.grade) : []
            // 年级
            this.form.grade = this.form.grades.length ? (gid ? gid : this.form.grades[0].name) : ''
            // 班级
            let classes = this.form.grades.find(val => { return val.name == this.form.grade })
            this.form.classess = classes ? classes.classes : []
            // this.form.classes = this.form.classess.length ? (cid ? cid : this.form.classess[0]) : ''

         } else {
            this.form.school = []
         }

         // 学期
         this.form.pid = product.length ? (pid ? pid : product[0].id) : ''
         if (product.length > 0) {
            this.form.product = product
            this.form.pid = product[0].id
            let productList = product.find(item => { return item.id == this.form.pid })
            if (productList) {
               let { startat, endat, holiday } = productList
               this.startat = startat
               this.endat = endat
               this.form.Time = [startat * 1000, startat * 1000]
               this.holidays = holiday
               this.disabledate(startat, endat, holiday)
            }
         } else {
            this.form.product = []
            this.form.Time = []
            this.startat = ''
            this.endat = ''
         }
         this.tableData = [] // 清除数据
      },
      // 改变学期
      changeProduct (pid) {
         let { startat, endat, holiday } = this.form.product.find(item => { return item.id === pid })
         this.form.time = ''
         this.disabledate (startat, endat, holiday)
      },
      // 查询
      create () {
         let { did, sid, pid, grade, classes, time } = this.form
         if (did != '' && sid != '' && pid != '' && grade != '', time != '' ) {
            time = dayjs(time).format('YYYYMMDD')
            this.$loading({ fullscreen: true })
            httpPost('leavebat', { did, sid, pid, grade, classes, time }).then(res => {
               let { leaves, students } = res
               this.leaves = leaves
               this.students = students

               // this.parseDays(this.startat, this.endat, this.holidays)  // 生成日历
               this.pageDate(leaves, students, classes, time)
               this.$loading().close()
            })
         } else {
            this.$message.warning(`数据不全!`)
         }
      },
      // 生成日历 (暂废)
      parseDays(begin, end, holidays) {
         let daytime = 86400, first = 0, str = [], block = [], blocklist = [], monthes = [], dates = new Date(), total = 0
         let today = parseInt(dates.getFullYear() + String(dates.getMonth() + 1).padStart(2, '0') + String(dates.getDate()).padStart(2, '0'))
         for (let i = begin; i <= end; i += daytime) {
            let date = new Date(i * 1000)
            let week = date.getDay(), year = date.getFullYear(), day = date.getDate(), month = date.getMonth() + 1, yearmonth = parseInt(year + String(month).padStart(2, '0'))
            if (day == 1 || first < yearmonth) {
               first = yearmonth
               monthes.push(year + '-' + String(month).padStart(2, '0'))
               if (str.length) {
                  if (str.length < 7) {
                     for (let j = str.length; j < 7; j++) {
                        str.push({keys: 0, day: '', holiday: -1})
                     }
                  }
                  block.push(str)
               }
               if (block.length) blocklist.push(block)
               block = []
               str = []
            }
            let keys = parseInt(year + String(month).padStart(2, '0') + String(day).padStart(2, '0'))
            //if(keys >= today) total++
            total++
            if (str.length == 0 && week != 0) {
               for (let j = 0; j < week; j++) {
                  str.push({keys: 0, day: '', holiday: -1})
               }
            }
            str.push({ keys: keys, day: day, holiday: holidays.indexOf(keys), unix: dayjs(date).unix() })
            if (week == 6) {
               if (str.length) block.push(str)
               str = []
            }
         }
         if (str.length) {
            if (str.length < 7) {
               for (let j = str.length; j < 7; j++) {
                  str.push({keys: 0, day: '', holiday: -1})
               }
            }
            block.push(str), blocklist.push(block)
            block = []
         }
         if (block.length) blocklist.push(block)
         let weeks = ['日', '一', '二', '三', '四', '五', '六']
         this.weeks = weeks,
         this.monthes = monthes,
         this.blocklist = blocklist,
         this.today = today
         this.form.total = total
      },
      // 选择假日 (暂废)
      holiday(bkey, rkey, dkey) {
         let day = Object.assign({}, this.blocklist[bkey][rkey][dkey])
         if (day.keys != 0 && day.holiday == -1) {
            this.curtday = day.keys
            let { leaves, students } = this, uid = []
            leaves.forEach(item => {
               let days = JSON.parse(item.holiday)
               if (days.includes(day.keys)) uid.push(item.uid)
            })
            // this.tableData = students.map(val => {
            let data = students.map(val => {
               if (day.unix >= val.startat && day.unix <= val.endat) {
                  if (val.grade == this.form.gid) return val
               }
               return {}
            }).filter(item => { return item.id }).sort(($1, $2) => { return $1.classes.slice(0,1) - $2.classes.slice(0,1) })
            console.log(data)
         } else {
            this.$message.warning(`日期不对!`)
         }
      },
      // 数据整理
      pageDate (leaves, students, classes, time) {
         time = parseInt(dayjs(time).format('YYYYMMDD'))
         let data = []
         data = students.map(item => {
            let json = item
            item['holiday'] = []
            leaves.forEach(val => {
               if (item.uid == val.uid) item.holiday = item.holiday.concat(JSON.parse(val.holiday))
            })
            // 有请假显示请假 请假2 显示退餐, 1 正常
            if (item.holiday.includes(time)) {
               item.statetxt = '请假'
            } else if (item.state === 2) {
               item.statetxt = '退餐'
            } else {
               item.statetxt = '正常'
            }
            return json
         })
         // 没有班级就排序
         if (!classes) data = data.sort(($1, $2) => { return $1.classes.slice(0,1) - $2.classes.slice(0,1) })
         this.tableData = data
      },
      // 多选框改变
      selectionChange (val) {
         this.leaveuid = val.map(item => { return item.uid })
      },
      // 禁用选项
      selectable (row, index) {
         if (row.statetxt.includes('请假')) return false
         return true
      },
      // 确定选项
      confirm () {
         let { sid, pid, time } = this.form, today = this.curtday
         time = dayjs(time).unix()
         if (this.leaveuid.length) {
            this.$loading({ fullscreen: true })
            httpPost('leavebat', { sid, pid, today, time, uid: this.leaveuid }).then(res => {
               this.tableData = this.blocklist = []
               this.curtday = null
               if (res.fail == 0) {
                  this.$message.success(res.msg)
               } else {
                  this.$message(`${res.msg}，请假失败${res.fail}条`)
               }
               this.$loading().close()
            })
         } else {
            this.$message.warning(`未选择数据!`)
         }
      },
      // 取消选项
      cancel () {
         this.$refs.multiple.clearSelection()
      }
   }
}
</script>
