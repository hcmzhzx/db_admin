<template>
   <d2-container :filename="filename">
      <template slot="header" class="flex">
         <el-form :inline="true" :model="form" class="flex">
            <el-select v-model="form.did" placeholder="地区" @change="selectChange(form.did, '', '')" style="margin-right:10px">
               <el-option v-for="item in form.district" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
            <el-select v-model="form.sid" placeholder="学校" @change="selectChange(form.did, form.sid, form.pid)" style="margin-right:10px">
               <el-option v-for="item in form.school" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
            <el-select v-model="form.pid" placeholder="学期" style="margin-right:10px">
               <el-option v-for="item in form.product" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
            <el-date-picker v-model="form.Time" type="daterange" value-format="timestamp" start-placeholder="开始日期" range-separator="至" end-placeholder="结束日期" style="margin-right:10px"></el-date-picker>

            <el-form-item style="min-width:206px">
               <el-button type="primary" @click="create">生成</el-button>
               <el-button type="primary" @click="exportExcel"><d2-icon name="download"/> 导出 Excel</el-button>
            </el-form-item>
         </el-form>
      </template>
      <template>
         <el-table v-bind="table" max-height="700" style="width: 100%">
            <el-table-column fixed v-for="(item, index) in table.columns" :key="index" :prop="item.prop" :label="item.label" v-if="index == 0" align="center" min-width="110px"></el-table-column>
            <el-table-column v-for="(item, index) in table.columns" :key="item.prop" :prop="item.prop" :label="item.label" v-if="index > 0" align="center" min-width="110px"></el-table-column>
         </el-table>
      </template>
   </d2-container>
</template>

<script>
import { httpGet, httpPost } from '@api/http'

export default {
   name: 'admin',
   data() {
      return {
         filename: __filename,
         form: { district: [], did: '', school: [], sid: '', product: [], pid: '', Time: [] },
         grade: [],
         startat: 0,
         endat: 0,
         leaves: '',
         orders: '',
         table: { columns: [], data: [], stripe: true, border: true }
      }
   },
   created() {
      httpGet('meals').then(res => {
         // 地区
         this.form.district = res.district.map(item => {
            let json = {}
            json.value = item.id
            json.label = item.cname
            return json
         })
         this.form.did = this.form.district[0].value

         this.headSelect(this.form.sid, res.school, this.form.pid, res.product)
      })
   },
   methods: {
      selectChange(did, sid, pid) {
         did = did ? did : 0; sid = sid ? sid : 0; pid = pid ? pid : 0
         httpGet('meals', {did, sid, pid}).then(res => {
            this.headSelect(sid, res.school, pid, res.product)
         })
      },

      headSelect(sid, school, pid, product) {
         // 学校
         this.form.sid = school.length ? (sid ? sid : school[0].id ) : ''
         if(school.length>0){
            this.form.school = school.map(item => {
               let json = {}
               json.value = item.id
               json.label = item.cname
               return json
            })
            this.grade = school.find(item => { return item.id == this.form.sid }).grade
         }

         // 学期
         if(product.length>0){
            this.form.product = product.map(item => {
               let json = {}
               json.value = item.id
               json.label = item.title
               return json
            })
            this.form.pid = product[0].id
            let productList = product.find(item => {return item.id == this.form.pid})
            if(productList){
               this.startat = productList.startat
               this.endat = productList.endat
               this.form.Time = [productList.startat*1000, (productList.startat+(86400*7))*1000]
               this.holiday = productList.holiday
            }
         } else {
            this.form.pid = ''
            this.startat = ''
            this.endat = ''
         }
      },

      // 生成
      create() {
         let {did, sid, pid} = this.form
         if(did != '' && sid != '' && pid != ''){
            if(this.form.Time.length == 2){
               if(this.form.Time[0]/1000 >= this.startat && this.form.Time[1]/1000 <= this.endat){
                  httpPost('meals',{did, sid, pid}).then(res => {
                     this.parseData(this.form.Time[0] / 1000, this.form.Time[1] / 1000, this.grade, this.holiday, res.leave, res.order)
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

      // 开始时间 结束时间 班级 假日
      parseData (startat, endat, grade, holiday, leaves, orders) {
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
      },

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
               merges: merges.split(',')
            }).then(() => {
               this.$message('导出表格成功')
            })
         }
         this.$message.warning(`请先生成数据再导出!`)
      }
   }
}
</script>
