<template>
   <d2-container :filename="filename">
      <template slot="header">
         <div class="flex between">
            <div class="title">每日实拍</div>
            <el-button type="primary" icon="el-icon-circle-plus-outline" @click="$router.push({name: 'demo-school-addEveryday'})">添加</el-button>
         </div>
      </template>
      <template>
         <el-table :data="Data" border style="width: 100%">
            <el-table-column prop="id" label="id" width="120" align="center"></el-table-column>
            <el-table-column prop="cname" label="套餐名" min-width="140" align="center"></el-table-column>
            <el-table-column label="实拍图" align="center" min-width="300">
               <template slot-scope="scope">
                  <img :src="scope.row.image" width="80" height="80" style="object-fit:cover">
               </template>
            </el-table-column>
            <el-table-column prop="dates" label="上传时间" min-width="140" align="center"></el-table-column>
            <el-table-column prop="addtime" label="时间" min-width="140" align="center"></el-table-column>
            <el-table-column label="操作" width="180" align="center">
               <template slot-scope="scope">
                  <el-button type="primary" icon="el-icon-edit" size="small" @click="$router.push({name: 'demo-school-assEverydey', query: {id: scope.row.id}})">编辑</el-button>
                  <el-button type="danger" icon="el-icon-delete" size="small" @click="handleRemove(scope.row.id)">删除</el-button>
               </template>
            </el-table-column>
         </el-table>
      </template>
   </d2-container>
</template>

<script>
import { httpGet, httpAdd, httpEdit, httpTrash, httpAddUm, httpEditUm } from '@api/http'
import dayjs from 'dayjs'

export default {
   name: 'everyday',
   data() {
      return {
         filename: __filename,
         dayjs,
         Id: 0,
         combos: [],
         Data: []
      }
   },
   async created() {
      this.Id = Number(this.$route.query.id)
      await httpGet('dayshoot', {id: this.Id}).then(res => {
         for(let [k, v] of Object.entries(res.taocan)){
            this.combos.push({id: v, cname: k})
         }
         this.Data = res.lists.map( item => {
            let json = item
            json.dates = `${item.dates.toString().substr(0, 4)}-${item.dates.toString().substr(4, 2)}-${item.dates.toString().substr(6, 2)}, `
            json.addtime = dayjs(item.addtime * 1000).format("YYYY-M-D")
            json.cname = this.combos.find(val => {return val.id == item.tid}).cname
            return json
         })
      })
      //await this.parseDays(begin, end, holidays, shoot)
   },
   methods: {
      handleRemove (Id) {
         this.$confirm('确定删除此项?', '提示', {confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'}).then(() => {
            httpTrash('schoolopt', {id: Id}).then(res => {
               this.Data = this.Data.filter(item => {
                  return item.id != Id
               })
               this.$message.success('删除成功!')
            })
         }).catch(() => {
            this.$message.info('已取消删除')
         })
      },











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