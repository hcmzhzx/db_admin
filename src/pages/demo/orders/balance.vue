<template>
   <d2-container :filename="filename">
      <template slot="header">
         <div class="flex between">
            <el-form :inline="true" :model="Search" class="br">
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
                  <el-date-picker v-model="Search.Time" type="daterange" start-placeholder="开始日期" range-separator="至" end-placeholder="结束日期" value-format="timestamp"></el-date-picker>
               </el-form-item>
               <el-form-item>
                  <el-select v-model="Search.state" placeholder="状态">
                     <el-option label="已到账" value="1"></el-option>
                     <el-option label="处理中" value="0"></el-option>
                  </el-select>
               </el-form-item>
               <el-form-item>
                  <el-select v-model="Search.types" placeholder="类型">
                     <el-option v-for="(v, k) in types" :label="v.text" :value="k" :key="k"></el-option>
                  </el-select>
               </el-form-item>
               <el-form-item>
                  <el-select v-model="Search.type" placeholder="条件">
                     <el-option label="uid" value="uid"></el-option>
                     <el-option label="手机号" value="phone"></el-option>
                     <el-option label="收款人" value="cname"></el-option>
                     <el-option label="学生姓名" value="student"></el-option>
                  </el-select>
               </el-form-item>
               <el-form-item>
                  <el-input v-model="Search.word" placeholder="请输入关键字" clearable></el-input>
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
         <el-table :data="Data" v-loading="loading" :summary-method="getSum" show-summary border style="width: 100%">
            <el-table-column prop="uid" label="uid" min-width="80" align="center"></el-table-column>
            <el-table-column prop="cname" label="收款人" min-width="100" align="center"></el-table-column>
            <el-table-column prop="phone" label="手机号" min-width="120" align="center"></el-table-column>
            <el-table-column prop="school" label="学校" min-width="110" align="center"></el-table-column>
            <el-table-column prop="body" label="学期" min-width="110" align="center"></el-table-column>
            <el-table-column label="年级" min-width="70" align="center">
               <template slot-scope="scope">{{scope.row.grade ? scope.row.grade : '--'}}</template>
            </el-table-column>
            <el-table-column label="班级" min-width="60" align="center">
               <template slot-scope="scope">{{scope.row.classes ? scope.row.classes : '--'}}</template>
            </el-table-column>
            <el-table-column label="学生姓名" min-width="100" align="center">
               <template slot-scope="scope">{{scope.row.student ? scope.row.student : '--'}}</template>
            </el-table-column>
            <el-table-column label="类型" min-width="80" align="center">
               <template slot-scope="scope">
                  <el-tag :type="types[scope.row.types].type">{{types[scope.row.types].text}}</el-tag>
               </template>
            </el-table-column>
            <el-table-column prop="fee" label="金额" min-width="70" align="center"></el-table-column>
            <el-table-column prop="amount" label="实际到账" min-width="80" align="center"></el-table-column>
            <el-table-column prop="addtime" label="添加时间" min-width="140" align="center"></el-table-column>
            <el-table-column prop="updatetime" label="到账时间" min-width="140" align="center"></el-table-column>
            <el-table-column label="状态" min-width="80" align="center">
               <template slot-scope="scope">
                  <el-tag :type="scope.row.state ? 'success' : 'warning'">{{scope.row.state ? '已到账' : '处理中'}}</el-tag>
               </template>
            </el-table-column>
            <el-table-column prop="remark" label="备注" min-width="100" align="center"></el-table-column>
            <el-table-column label="操作" width="100" align="center">
               <template slot-scope="scope">
                  <el-button v-if="!scope.row.state" type="primary" icon="el-icon-edit" size="small" @click="remittance(scope.row.cname, scope.row.id, Math.abs(scope.row.fee))">打款</el-button>
                  <el-button type="info" disabled size="small" v-else>已打款</el-button>
                  <!--<el-button type="danger" icon="el-icon-delete" size="small" @click="handleRemove(scope.row.id)">删除</el-button>-->
                  <!--<el-button type="warning" :disabled="scope.row.types != 'withdraw'" size="small" @click="check(scope.row.id)">打款详情</el-button>-->
               </template>
            </el-table-column>
         </el-table>
      </template>
      <template>
         <el-dialog title="打款详情" :visible.sync="dialogTableShow" width="70%">
            <el-table :data="gridData" border>
               <el-table-column property="trade" label="订单号" min-width="240" align="center"></el-table-column>
               <el-table-column property="addtime" label="添加时间" min-width="140" align="center"></el-table-column>
               <el-table-column property="updatetime" label="退款时间" min-width="140" align="center"></el-table-column>
               <el-table-column property="fee" label="退款金额" min-width="100" align="center"></el-table-column>
               <el-table-column property="details" label="备注" min-width="140" align="center"></el-table-column>
               <el-table-column label="操作" width="140" align="center">
                  <template slot-scope="scope">
                     <el-button type="warning" v-if="!scope.row.updatetime" size="small" @click="carryOn(scope.row.id)">继续打款</el-button>
                     <el-button type="info" disabled size="small" v-else>已到账</el-button>
                  </template>
               </el-table-column>
            </el-table>
         </el-dialog>
      </template>
      <template slot="footer">
         <div class="flex between">
            <el-pagination @size-change="handleSize" @current-change="handleCurrent" :current-page.sync="pageNo" :page-size="pagesize" :page-sizes="[10, 50, 100, 500, 1000, 1500, 2000, 2500]" :total="total" layout="sizes, prev, pager, next, total" background></el-pagination>
            <el-button type="primary" @click="exportExcel"><d2-icon name="download"/> 导出 Excel</el-button>
         </div>
      </template>
      <el-dialog :title="remitTitle" :visible.sync="dialogVisible" width="350px">
         <el-form :model="remitForm">
            <el-form-item>
               <el-input type="number" v-model="remitForm.fee" placeholder="打款金额" @keyup.enter.native="headerRemit"></el-input>
            </el-form-item>
            <el-form-item>
               <el-input type="text" v-model="remitForm.details" placeholder="备注(选填)" @keyup.enter.native="headerRemit"></el-input>
            </el-form-item>
         </el-form>
         <div slot="footer" class="dialog-footer">
            <el-button @click="dialogVisible = false; $message.info('取消打款')">取 消</el-button>
            <el-button type="primary" @click="headerRemit">确 定</el-button>
         </div>
      </el-dialog>
   </d2-container>
</template>

<script>
import { httpGet, httpTrash, httpEditUm } from '@api/http'
import dayjs from 'dayjs'

export default {
   name: 'demo-orders-balance',
   data () {
      return {
         filename: __filename,
         dayjs,
         Data: [],
         school: [],
         grade: [],
         classes: [],
         types: {
            leave: { text: '请假', type: 'warning' },
            withdraw: { text: '提现', type: 'success' },
            quit: { text: '退餐', type: 'danger' }
         },
         Search: {},
         isSearch: false,
         pageNo: 1,
         pagesize: 10,
         page: 0,
         total: 0,
         loading: true,
         dialogTableShow: false,
         gridData: [],
         dialogVisible: false,
         remitTitle: '',
         remitId: '',
         remitFee: '',
         remitForm: { fee: '', details: '' }
      }
   },
   async created () {
      await this.loadData()
   },
   methods: {
      loadData () {
         this.loading = true
         httpGet('balance').then(res => {
            this.mapData(res.lists, res.schools)
            this.school = res.schools
            this.total = res.total
            this.isSearch = false
            this.pageNo = 1
            this.pagesize = 10
            this.Search = { sid: '', grade: '', classes: '', state: '', types: '', Time: [], type: '', word: '' }
         })
      },
      mapData (list, school) {
         this.Data = list.map(item => {
            let json = item
            let sname = school.find(val => { return val.id === item.sid })
            item.school = sname ? sname.cname : '--'
            item.updatetime = item.updatetime ? dayjs(item.updatetime * 1000).format('YYYY-MM-DD HH:mm') : '处理中'
            item.addtime = dayjs(item.addtime * 1000).format('YYYY-MM-DD HH:mm')
            return json
         })
         this.loading = false
      },
      // 合计
      getSum (param) {
         const { columns, data } = param, sums = []
         columns.forEach((column, index) => {
            if (index === 0) {
               sums[index] = '合计'
               return
            }
            const values = data.map(item => item[column.property])
            if (values.every(value => Number.isFinite(value))) {
               sums[index] = values.reduce((prev, curr) => prev + curr, 0)
            }
         })
         return sums
      },
      remittance (name, Id, fee) {
         this.remitTitle = `确定打款给 ${name}?`
         this.dialogVisible = true
         this.remitId = Id
         this.remitFee = fee
      },
      headerRemit () {
         let fee = this.remitFee, val = this.remitForm.fee, Id = this.remitId
         if (/^[1-9]\d{0,9}?$/.test(val)) {
            if (fee >= val) {
               this.$loading({ fullscreen: true, text: '提交中...' })
               let list = this.Data.find(v => { return v.id === Id })
               httpEditUm('balanceopt', { method: 'refund', id: Id, fee: val, details: this.remitForm.details }).then(res => {
                  if (res.code === 0) {
                     list.updatetime = res.time ? dayjs(res.time * 1000).format('YYYY-MM-DD HH:mm') : dayjs().format('YYYY-MM-DD HH:mm')
                     list.state = res.state || 1
                     list.remark = res.remark
                     this.$message.success(res.msg)
                     this.remitForm = { fee: '', details: '' } // 打款成功后重置为空
                  } else {
                     this.$message.error(res.msg)
                     list.remark = res.msg
                  }
                  this.$loading().close()
                  this.dialogVisible = false
               })
            } else {
               this.$message.warning('不能超过提现金额')
            }
         } else {
            this.$message.warning('请输入正确格式')
         }
      },
      // 打款检测
      check (id) {
         this.loading = true
         httpEditUm('balanceopt', { method: 'check', id }).then(res => {
            if (res.code === 0) {
               this.dialogTableShow = true
               this.gridData = res.lists.map(item => {
                  let json = item
                  json.addtime = dayjs(item.addtime * 1000).format('YYYY-MM-DD HH:mm')
                  json.updatetime = item.updatetime ? dayjs(item.updatetime * 1000).format('YYYY-MM-DD HH:mm') : ''
                  return json
               })
            } else {
              this.$message.info(res.msg)
            }
            this.loading = false
         })
      },
      // 继续打款
      carryOn (id) {
         this.loading = true
         httpEditUm('balanceopt', { method: 'repay', id }).then(res => {
            if (res.code === 0) {
               let list = this.gridData.find(val => { return val.id === id })
               list.remark = res.remark
               list.updatetime = dayjs(res.updatetime * 1000).format('YYYY-MM-DD HH:mm')
               this.$message.success(res.msg)
            } else {
               this.$message.info(res.msg)
            }
            this.loading = false
         })
      },
      handleRemove (id) {
         this.$confirm('确定删除此项?', '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }).then(() => {
            this.loading = true
            httpTrash('balanceopt', { id }).then(res => {
               if (res.code === 0) {
                  this.Data = this.Data.filter(item => item.id != id)
                  this.$message.success(res.msg)
               } else {
                  this.$message.warning(res.msg)
               }
               this.loading = false
            })
         }).catch(() => {
            this.$message.info('已取消删除')
         })
      },
      handleCurrent (num) {
         this.loading = true
         let { sid, grade, classes, state, types, type, word } = this.Search
         let posts = {}
         if (this.isSearch) {
            posts = { sid, grade, classes, state, types, type, word }
            posts.beginat = this.Search.Time[0] / 1000 || ''
            posts.overat = this.Search.Time[1] / 1000 || ''
         }
         posts.pagesize = this.pagesize
         posts.page = num
         httpGet('balance', posts).then(res => {
            this.mapData(res.lists, this.school)
         })
      },
      handleSize (pagesize) {
         this.loading = true
         let { sid, grade, classes, state, types, type, word } = this.Search
         let posts = {}
         if (this.isSearch) {
            posts = { sid, grade, classes, state, types, type, word }
            posts.beginat = this.Search.Time[0] / 1000 || ''
            posts.overat = this.Search.Time[1] / 1000 || ''
         }
         posts.pagesize = pagesize
         httpGet('balance', posts).then(res => {
            this.pagesize = pagesize
            this.pageNo = 1
            this.today = res.today
            this.mapData(res.lists, res.schools)
         })
      },
      schoolChange (sid) {
         let sgrade = this.school.find(val => { return val.id == sid })
         this.grade = JSON.parse(sgrade ? sgrade.grade : '[]')
         this.Search.grade = ''
         this.Search.classes = ''
         this.classes = []
      },
      gradeChange (grade) {
         this.Search.classes = ''
         let classesname = this.grade.find(val => { return val.name == grade })
         this.classes = classesname ? classesname.classes : []
      },
      onSearch () {
         if (this.Search.Time[0] / 1000 > this.Search.Time[1] / 1000) {
            this.$message.warning('开始时间不能大于结束时间')
            return
         }
         let { sid, grade, classes, state, types, type, word } = this.Search
         let posts = { sid, grade, classes, state, types, type, word }
         posts.beginat = this.Search.Time[0] / 1000 || ''
         posts.overat = this.Search.Time[1] / 1000 || ''
         this.loading = true
         httpGet(`balance`, posts).then(res => {
            this.mapData(res.lists, res.schools)
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
            json.grade = item.grade || '--'
            json.classes = item.classes || '--'
            json.student = item.student || '--'
            json.types = this.types[item.types].text
            json.state = item.state ? '已到账' : '处理中'
            return json
         })
         if (data.length) {
            let columns = [
               { label: '收款人', prop: 'cname' },
               { label: '手机号', prop: 'phone' },
               { label: '学校', prop: 'school' },
               { label: '年级', prop: 'grade' },
               { label: '班级', prop: 'classes' },
               { label: '学生姓名', prop: 'student' },
               { label: '类型', prop: 'types' },
               { label: '金额', prop: 'fee' },
               { label: '添加时间', prop: 'addtime' },
               { label: '到账时间', prop: 'updatetime' },
               { label: '状态', prop: 'state' },
               { label: '备注', prop: 'remark' }
            ]
            this.$export.excel({ columns, data }).then(() => {
               this.$message.success('导出表格成功')
            })
         } else {
            this.$message.warning(`暂无数据导出!`)
         }
      }
   }
}
</script>
