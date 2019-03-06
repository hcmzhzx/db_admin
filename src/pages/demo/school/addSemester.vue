<template>
   <d2-container :filename="filename">
      <template>
         <div class="el-table semester">
            <el-form ref="form" :model="form" :rules="rules" label-width="80px">
               <el-form-item label="学校名称" label-width="120px" prop="sid">
                  <el-select v-model="form.sid" placeholder="请选择学校">
                     <el-option v-for="item in school" :key="item.value" :label="item.cname" :value="item.id"></el-option>
                  </el-select>
               </el-form-item>
               <el-form-item label="标题" label-width="120px" prop="title">
                  <el-input v-model="form.title" autocomplete="off" placeholder="请填写标题"></el-input>
               </el-form-item>
               <el-form-item label="开始时间" label-width="120px" prop="startat">
                  <el-date-picker v-model="form.startat" @change="startat" type="date" placeholder="选择日期" format="yyyy 年 MM 月 dd 日" value-format="timestamp"></el-date-picker>
               </el-form-item>
               <el-form-item label="结束时间" label-width="120px" prop="endat">
                  <el-date-picker v-model="form.endat" @change="endat" type="date" placeholder="选择日期" format="yyyy 年 MM 月 dd 日" value-format="timestamp"></el-date-picker>
               </el-form-item>

               <div class="flex br menology">
                  <div class="month" v-for="(v, k) in blocklist" :key="k">
                     <div class="flex center title">{{monthes[k]}}</div>
                     <div class="flex week">
                        <div v-for="(v, k) in weeks" :key="k" class="flexitem center item">{{v}}</div>
                     </div>
                     <div class="flex rows" v-for="(i, s) in v" :key="s">
                        <div v-for="(t, z) in i" :key="z" :class="['flexitemv','item', (t.keys == 0 || t.keys < today || t.holiday > -1) ? 'disable' : '']" @click="holiday(k, s, z)">
                           <div class="flex center today">{{t.keys == today ? '今天' : ''}}</div>
                           <div class="flex center days">{{t.day}}</div>
                           <div class="flex center holiday">{{t.holiday > -1 ? '假日' : ''}}</div>
                        </div>
                     </div>
                  </div>
               </div>
               <el-form-item label="餐标" label-width="120px" prop="unit">
                  <el-input type="number" v-model="form.unit" autocomplete="off" placeholder="请填写餐标"></el-input>
               </el-form-item>
               <el-form-item label="总共餐次" label-width="120px">
                  <el-input type="number" v-model="form.total - holidays.length" :disabled="true" placeholder="请填写总共餐次"></el-input>
               </el-form-item>
               <el-form-item>
                  <el-button type="primary" @click="handleAdd('form')">{{Id ? '立即修改' : '立即添加'}}</el-button>
               </el-form-item>
            </el-form>
         </div>
      </template>
   </d2-container>
</template>

<script>
import { httpGet, httpAdd, httpEdit, httpTrash } from '@api/http'

export default {
   name: 'addSemester',
   data() {
      return {
         filename: __filename,
         Id: 0,
         school: [],
         form: { sid: '', title: '', startat: '', endat: '', unit: '', total: '' },
         rules: {
            sid: [{ required: true, message: '请选择学校名称', trigger: 'change' }],
            title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
            startat: [{ required: true, message: '请选择开始时间', trigger: 'blur' }],
            endat: [{ required: true, message: '请选择结束时间', trigger: 'blur' }],
            unit: [{ required: true, message: '请输入餐标', trigger: 'blur' }]
         },
         holidays: [],
         weeks: [],
         monthes: [],
         blocklist: [],
         today: ''
      }
   },
   async created() {
      this.$loading({fullscreen: true})
      let posts = '', Id = Number(this.$route.query.id)
      if(Id){
         this.Id = Id
         this.$route.meta.title = '修改学期'
         posts = { id: Id }
      } else {
         this.$route.meta.title = '添加学期'
      }
      await httpGet('termopt', posts).then(res => {
         for(let [k, v] of Object.entries(res.school)){
            this.school.push({ id: k, cname: v})
         }
         if(res.data){
            let { sid, title, startat, endat, unit, total, holiday } = res.data
            this.form.sid = String(sid)
            this.form.title = title
            this.form.startat = startat * 1000
            this.form.endat = endat * 1000
            this.form.unit = unit
            this.form.total = total
            this.holidays = JSON.parse(holiday)
            this.parseDays(startat, endat, holiday)
         }
         this.$loading().close()
      })
   },
   methods: {
      // 开始时间
      startat() {
         if(this.form.startat && this.form.endat){
            this.form.startat = this.form.startat, this.form.endat = this.form.endat
            if(this.form.startat < this.form.endat){
               this.holidays = []
               this.parseDays(this.form.startat / 1000, this.form.endat / 1000, this.holidays)
            } else {
               this.$message.warning('时间格式不对')
            }
         }
      },
      // 结束时间
      endat() {
         if(this.form.startat && this.form.endat){
            this.form.startat = this.form.startat, this.form.endat = this.form.endat
            if(this.form.startat < this.form.endat){
               this.holidays = []
               this.parseDays(this.form.startat / 1000, this.form.endat / 1000, this.holidays)
            } else {
               this.$message.warning('时间格式不对')
            }
         }
      },
      // 生成日历
      parseDays(begin, end, holidays) {
         let daytime = 86400, first = 0, str = [], block = [], blocklist = [], monthes = [], dates = new Date(), total = 0
         let today = parseInt(dates.getFullYear() + String(dates.getMonth() + 1).padStart(2, '0') + String(dates.getDate()).padStart(2, '0'))
         for (let i = begin; i <= end; i += daytime) {
            let date = new Date(i * 1000)
            let week = date.getDay(),
               year = date.getFullYear(),
               day = date.getDate(),
               month = date.getMonth() + 1,
               yearmonth = parseInt(year + String(month).padStart(2, '0'))
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
            str.push({keys: keys, day: day, holiday: holidays.indexOf(keys)})
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
         let days = Object.assign({}, this.blocklist[bkey][rkey][dkey])
         if (days.keys < this.today) return
         if (days.holiday > -1) {
            this.blocklist[bkey][rkey][dkey].holiday = -1
            this.holidays = this.holidays.filter(item => {
               return item != days.keys
            })
         } else {
            this.blocklist[bkey][rkey][dkey].holiday = 1
            this.holidays.push(days.keys)
         }
      },
      // 添加学期
      handleAdd(form) {
         this.$refs[form].validate((valid) => {
            if(valid){
               this.$loading({fullscreen: true})
               if(this.Id){
                  let posts = {id: this.Id, sid: this.form.sid, title: this.form.title, startat: this.form.startat / 1000, endat: this.form.endat / 1000, unit: Number(this.form.unit), total: this.form.total - this.holidays.length, holiday: JSON.stringify(this.holidays) }
                  httpEdit('termopt', posts).then(res => {
                     this.$message.success('修改成功')
                     this.$loading().close()
                     this.$router.go(-1)
                  })
               } else {
                  let posts = {sid: this.form.sid, title: this.form.title, startat: this.form.startat / 1000, endat: this.form.endat / 1000, unit: Number(this.form.unit), total: this.form.total - this.holidays.length, holiday: JSON.stringify(this.holidays) }
                  httpAdd('termopt', posts).then(res => {
                     this.$message.success('添加成功')
                     this.$loading().close()
                     this.$router.go(-1)
                  })
               }
            }
         })
      }
   }
}
</script>

<style>
.semester{padding-top:22px;}
.semester .el-form{width:98%;}
.semester .menology .month{margin:0 0 40px 40px;width:494px;}
.semester .menology .month .title{height:40px;border:1px solid #ccc;font-size:20px;}
.semester .menology .month .week{height:40px;}
.semester .menology .week .item{height:40px;}
.semester .menology .item{border:1px solid #ccc;font-size:18px;}
.semester .menology .rows .item{width:14.28%;}
.semester .menology .rows .item .today,.semester .menology .rows .item .holiday{height:25px;font-size:14px;}
.semester .menology .rows .item .days{height:30px}
.semester .menology .rows .item.disable{background:#ebeef5;}
</style>
