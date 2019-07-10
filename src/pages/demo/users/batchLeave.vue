<template>
   <d2-container :filename="filename">
      <template slot="header" class="flex">
         <el-form :inline="true" :model="form" class="br">
            <el-form-item>
               <el-select v-model="form.did" placeholder="地区" @change="selectChange(form.did, '', '')">
                  <el-option v-for="item in form.district" :key="item.value" :label="item.label" :value="item.value"></el-option>
               </el-select>
            </el-form-item>
            <el-form-item>
               <el-select v-model="form.sid" placeholder="学校" @change="selectChange(form.did, form.sid, form.pid)">
                  <el-option v-for="item in form.school" :key="item.value" :label="item.label" :value="item.value"></el-option>
               </el-select>
            </el-form-item>
            <el-form-item>
               <el-select v-model="form.pid" placeholder="学期">
                  <el-option v-for="item in form.product" :key="item.value" :label="item.label" :value="item.value"></el-option>
               </el-select>
            </el-form-item>
            <el-form-item>
               <el-select v-model="form.gid" placeholder="年级">
                  <el-option v-for="item in form.grade" :key="item.name" :label="item.name" :value="item.name"></el-option>
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
            <el-table-column type="selection" width="55"></el-table-column>
            <el-table-column prop="grade" label="年级" align="center" min-width="120"></el-table-column>
            <el-table-column prop="classes" label="班级" align="center" min-width="120"></el-table-column>
            <el-table-column prop="cname" label="学生姓名" align="center" min-width="120"></el-table-column>
            <el-table-column prop="parents" label="家长姓名" align="center" min-width="120"></el-table-column>
            <el-table-column prop="remark" label="备注" align="center" min-width="120"></el-table-column>
         </el-table>
      </template>
      <template slot="footer">
         <div style="margin-top:20px">
            <el-button type="primary" @click="confirm">确定选择</el-button>
            <el-button type="primary" @click="cancel">取消选择</el-button>
         </div>
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
         form: { district: [], did: '', school: [], sid: '', product: [], pid: '', grade: [], gid: '', Time: [] },
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
         loading: true
      }
   },
   async created () {
      await httpGet('leavebat').then(res => {
         // 地区
         this.form.district = res.district.map(item => {
            let json = {}
            json.value = item.id
            json.label = item.cname
            return json
         })
         this.form.did = this.form.district.length ? this.form.district[0].value : ''
         this.headSelect(this.form.sid, res.school, this.form.pid, res.product, this.form.gid)
      })
   },
   methods: {
      // 选择学校
      selectChange(did, sid, pid) {
         this.$loading({ fullscreen: true })
         did = did ? did : 0; sid = sid ? sid : 0; pid = pid ? pid : 0
         httpGet('meals', {did, sid, pid}).then(res => {
            this.headSelect(sid, res.school, pid, res.product, this.form.gid)
            this.$loading().close()
         })
      },
      // 根据学校联动
      headSelect(sid, school, pid, product, gid) {
         // 学校
         this.form.sid = school.length ? (sid ? sid : school[0].id ) : ''
         if(school.length>0){
            this.form.school = school.map(item => {
               let json = {}
               json.value = item.id
               json.label = item.cname
               return json
            })
            let grades = school.find(item => { return item.id == this.form.sid })
            this.form.grade = grades ? JSON.parse(grades.grade) : []
            // 年级
            this.form.gid = this.form.grade.length ? (gid ? gid : this.form.grade[0].name) : ''
         } else {
            this.form.school = []
         }

         // 学期
         this.form.pid = product.length ? (pid ? pid : product[0].id) : ''
         if (product.length > 0) {
            this.form.product = product.map(item => {
               let json = {}
               json.value = item.id
               json.label = item.title
               return json
            })
            this.form.pid = product[0].id
            let productList = product.find(item => { return item.id == this.form.pid })
            if (productList) {
               this.startat = productList.startat
               this.endat = productList.endat
               this.form.Time = [productList.startat * 1000, productList.startat * 1000]
               this.holidays = productList.holiday
            }
         } else {
            this.form.product = []
            this.form.Time = []
            this.startat = ''
            this.endat = ''
         }
      },
      // 查询
      create () {
         let { did, sid, pid } = this.form
         if (did != '' && sid != '' && pid != '') {
            this.$loading({ fullscreen: true })
            httpPost('leavebat', { did, sid, pid }).then(res => {
               let { leaves, students } = res
               this.leaves = leaves
               this.students = students

               this.parseDays(this.startat, this.endat, this.holidays)  // 生成日历
               this.$loading().close()
            })
         } else {
            this.$message.warning(`当前没有学期数据!`)
         }
      },
      // 生成日历
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
      // 选择假日
      holiday(bkey, rkey, dkey) {
         let day = Object.assign({}, this.blocklist[bkey][rkey][dkey])
         if (day.keys != 0 && day.holiday == -1) {
            this.curtday = day.keys
            let { leaves, students } = this, uid = []
            leaves.forEach(item => {
               let days = JSON.parse(item.holiday)
               if (days.includes(day.keys)) uid.push(item.uid)
            })
            this.tableData = students.map(val => {
               if (day.unix >= val.startat && day.unix <= val.endat) {
                  if (val.grade == this.form.gid) return val
               }
               return {}
            }).filter(item => { return item.id }).sort(($1, $2) => { return $1.classes.slice(0,1) - $2.classes.slice(0,1) })
         } else {
            this.$message.warning(`日期不对!`)
         }
      },
      // 多选框改变
      selectionChange (val) {
         this.leaveuid = val.map(item => { return item.uid })
      },
      // 确定选项
      confirm () {
         let { sid, pid } = this.form, today = this.curtday
         if (this.leaveuid.length) {
            this.$loading({ fullscreen: true })
            httpPost('leavebat', { sid, pid, today, uid: this.leaveuid }).then(res => {
               this.tableData = this.blocklist = []
               this.curtday = null
               if (res.fail == 0){
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

<style>
.menology .month{margin:0 10px 10px 0;}
.menology .month .title{height:26px;border:1px solid #ccc;font-size:14px;margin-left:-1px;}
.menology .month .week,.menology .week .item{height:24px;}
.menology .item{border:1px solid #ccc;font-size:12px; margin-top:-1px;margin-left:-1px;}
.menology .rows .item{width:30px;height:30px;cursor:pointer;}
.menology .rows .item.disable{background:#ebeef5;cursor:not-allowed;}
.menology .rows .item .days.current{width:20px;height:20px;border:2px solid #f00;border-radius:50%;}
</style>
