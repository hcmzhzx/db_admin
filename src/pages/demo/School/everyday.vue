<template>
   <d2-container :filename="filename">
      <template slot="header">
         <div class="flex between">
            <div class="title">每日实拍</div>
            <el-button type="primary" icon="el-icon-circle-plus-outline" @click="$router.push({name: 'demo-School-addCombo'})">添加</el-button>
         </div>
      </template>
      <template>
         <el-table :data="Data" border style="width: 100%">
            <el-table-column prop="id" label="id" width="120" align="center"></el-table-column>
            <el-table-column prop="sid" label="学校名称" align="center"></el-table-column>
            <el-table-column prop="title" label="标题" align="center"></el-table-column>
            <el-table-column prop="startat" label="开始时间" width="160" align="center"></el-table-column>
            <el-table-column prop="endat" label="结束时间" width="160" align="center"></el-table-column>
            <el-table-column prop="holidays" label="假期天数" width="140" align="center"></el-table-column>
         </el-table>
      </template>
      <template>
         <div class="flex br everyday">
            <div class="month" v-for="(v, k) in blocklist" :key="k">
               <div class="flex center title">{{monthes[k]}}</div>
               <div class="flex week">
                  <div v-for="(v, k) in weeks" :key="k" class="flexitem center item">{{v}}</div>
               </div>
               <div class="flex rows" v-for="(i, s) in v" :key="s">
                  <div v-for="(t, z) in i" :key="z" :class="['flexitemv','item', (t.keys == 0 || t.keys < today || t.holiday > -1) ? 'disable' : '']" :style="{background: t.keys > today && t.holiday == -1 ? `url(${t.url}) 0 0 / cover` : '#ebeef5'}">
                     <div class="flex head">
                        <div class="flex holiday">{{t.holiday > -1 ? '假日' : ''}}</div>
                        <div class="flex endh today">{{t.keys == today ? '今天' : ''}}</div>
                     </div>
                     <div class="flex center days">{{t.day}}</div>
                     <div class="flex center upload" v-if="t.keys > today && t.holiday == -1"><span>点击上传每日实拍</span><input type="file" accept="image/*" @change="everyUpload(k, s, z, $event)"></div>
                  </div>
               </div>
            </div>
         </div>
      </template>
   </d2-container>
</template>

<script>
import { httpGet, httpAdd, httpEdit, httpAddUm, httpEditUm } from '@api/http'

export default {
   name: 'everyday',
   data() {
      return {
         filename: __filename, Id: 0, sid: 0, Data: [], today: '', weeks: [], monthes: [], blocklist: []
      }
   },
   async created() {
      this.Id = Number(this.$route.query.id)
      let begin = 0, end = 0, holidays = [], shoot = []
      await httpGet('shootOpt', {id: this.Id}).then(res => {
         this.sid = res.data.sid, begin = res.data.startat, end = res.data.endat, holidays = JSON.parse(res.data.holiday), shoot = res.shoot
         let json = {}
         json.id = res.data.id
         json.startat = this.formatDate(begin, 'y-M-d')
         json.endat = this.formatDate(end, 'y-M-d')
         json.sid = res.school.cname
         json.title = res.data.title
         json.holidays = holidays.length
         this.Data.push(json)
      })
      await this.parseDays(begin, end, holidays, shoot)
   },
   methods: {
      // 生成日历
      parseDays(begin, end, holidays, shoot) {
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
                        str.push({keys: 0, day: '', holiday: -1, url: '' })
                     }
                  }
                  block.push(str)
               }
               if (block.length) blocklist.push(block)
               block = []
               str = []
            }
            let keys = parseInt(year + String(month).padStart(2, '0') + String(day).padStart(2, '0'))
            if(keys >= today) total++
            if (str.length == 0 && week != 0) {
               for (let j = 0; j < week; j++) {
                  str.push({keys: 0, day: '', holiday: -1, url: '' })
               }
            }
            // shoot = {'20181227':'https'}
            str.push({keys: keys, day: day, holiday: holidays.indexOf(keys), url: shoot[keys] || '' })
            if (week == 6) {
               if (str.length) block.push(str)
               str = []
            }
         }
         if (str.length) {
            if (str.length < 7) {
               for (let j = str.length; j < 7; j++) {
                  str.push({keys: 0, day: '', holiday: -1, url: '' })
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
      },

      // 每日实拍
      everyUpload(bkey, rkey, dkey, $el) {
         if($el.target.files[0]){
            const Form = new FormData()
            Form.append('pid', this.Id)
            Form.append('sid', this.sid)
            Form.append('dates', this.blocklist[bkey][rkey][dkey].keys)
            Form.append('file', $el.target.files[0])
            httpAddUm('shootOpt', Form).then(res => {
               this.blocklist[bkey][rkey][dkey].url = res.image
            })
         }
      }
   }
}
</script>

<style>
.everyday{padding-top:22px;}
.everyday .month{margin-bottom:40px;width:100%;background:#f8f8f8}
.everyday .month .title{height:60px;border:1px solid #ccc;font-size:20px;}
.everyday .month .week{height:60px;}
.everyday .week .item{height:60px;}
.everyday .item{border:1px solid #ccc;font-size:18px;}
.everyday .rows .item{position:relative;width:14.28%;}
.everyday .rows .item .head{height:100px;justify-content:space-between;}
.everyday .rows .item .head .holiday,.everyday .rows .item .head .today{font-size:18px;}
.everyday .rows .item .days{height:100px;font-size:24px;text-shadow:0 2px 10px rgba(0,0,0,.5);color:#fff;}
.everyday .rows .item.disable{background:#ebeef5;}
.everyday .rows .item .upload{position:absolute;top:50%;left:50%;padding:10px 0;width:80%;transform:translate(-50%, -50%);background:rgba(0,0,0,.5);font-size:16px;color:#fff;}
.everyday .rows .item .upload input{position:absolute;top:0;right:0;bottom:0;left:0;width:100%;height:100%;opacity:0;}
</style>