<template>
   <d2-container :filename="filename">
      <template slot="header" class="flex between">
         <el-form :inline="true" :model="Search" class="demo-form-inline">
            <el-form-item>
               <el-select v-model="Search.type" placeholder="类型">
                  <el-option label="学生ID" value="st.id"></el-option>
                  <el-option label="手机号" value="u.phone"></el-option>
                  <el-option label="学生姓名" value="st.cname"></el-option>
               </el-select>
            </el-form-item>
            <el-form-item>
               <el-input v-model="Search.word" placeholder="请输入内容"></el-input>
            </el-form-item>
            <el-form-item>
               <el-button type="primary" @click="onSearch">查询</el-button>
            </el-form-item>
         </el-form>
      </template>
      <template>
         <el-table :data="student" v-loading="loading" border style="width: 100%">
            <el-table-column prop="id" label="id" width="100" align="center"></el-table-column>
            <el-table-column prop="username" label="用户名" min-width="120" align="center"></el-table-column>
            <el-table-column prop="cname" label="姓名" min-width="120" align="center"></el-table-column>
            <el-table-column prop="school" label="学校" min-width="180" align="center"></el-table-column>
            <el-table-column prop="gradeClasses" label="学生班级" min-width="120" align="center"></el-table-column>
            <el-table-column prop="phone" label="用户手机" min-width="120" align="center"></el-table-column>
         </el-table>
         <el-table :data="leaves" v-loading="loading" border style="margin-top:20px;width:100%">
            <el-table-column prop="day" label="请假日期" min-width="150" align="center"></el-table-column>
            <el-table-column prop="state" label="状态" min-width="150" align="center">
               <template slot-scope="scope">
                  <el-tag :type="scope.row.state ? 'success' : 'warning'">{{scope.row.state ? '已到账' : '处理中'}}</el-tag>
               </template>
            </el-table-column>
            <el-table-column label="操作" width="200" align="center">
               <template slot-scope="scope">
                  <el-button type="primary" icon="el-icon-edit" :disabled="scope.row.state" size="small" @click="refund(scope.row.id, scope.row.uid, scope.row.day)">退款</el-button>
               </template>
            </el-table-column>
         </el-table>
      </template>
   </d2-container>
</template>

<script>
  import {httpGet, httpPost} from '@api/http'
  import dayjs from 'dayjs'

  export default {
    name: "demo-users-leavecheck",
    data() {
      return {
        filename: __filename,
        dayjs,
        Search: { type: '', word: '' },
        balance: [],
        leaves:[],
        student: [],
        loading: false
      }
    },
    methods: {
      onSearch() {
        this.loading = true
        let { type, word } = this.Search
        httpGet('leavecheck', { type, word }).then(res => {
          var leaves = []
          res.leaves.forEach(item => {
            JSON.parse(item.holiday).forEach(val => {
              leaves.push({ id: item.id, day: val, uid: item.uid, state: res.balance.includes(val.toString()) })
            })
          })
          this.leaves = leaves
          if(!res.student) return
          this.student = [res.student].map(item => {
            let json = item
            json.gradeClasses = `${item.grade}${item.classes}`
            return json
          })
        })
        this.loading = false
      },
      refund(id, uid, day) {
        this.loading = true
        httpPost('leavecheck', {id, uid, day }).then(res => {
          if(res.code == 0){
            let list = this.leaves.find(item => { return item.day == day })
            list.state = true
            this.$message.success(res.msg)
          } else {
            this.$message.error(res.msg)
          }
          this.loading = false
        })
      }
    }
  }
</script>
