<template>
   <d2-container :filename="filename">
      <template slot="header" class="flex between">
         <div class="title">问卷调查</div>
      </template>
      <template>
         <el-form :inline="true" v-for="(v, k) in vestigateList" :key="k" style="padding:20px 0 0;border-bottom:1px solid #c0ccda">
            <el-form-item label="问题">
               <el-input v-model="v.title" placeholder="请输入问题"></el-input>
            </el-form-item>
            <el-form-item label="答案">
               <el-input v-model="v.answer" placeholder="请输入答案,多个答案用,分隔"></el-input>
            </el-form-item>
            <el-form-item label="类型">
               <el-select v-model="v.type" placeholder="活动区域">
                  <el-option v-for="(item, index) in type" :key="index" :label="item.label" :value="item.value"></el-option>
               </el-select>
            </el-form-item>
            <el-form-item label="最大数量" v-if="v.type == 'checkbox'">
               <el-input type="number" v-model="v.max" placeholder="多选答案数量"></el-input>
            </el-form-item>
            <el-form-item>
               <el-button type="danger" @click="removeList(k)">删除</el-button>
            </el-form-item>
         </el-form>
         <el-button type="primary" @click="addList">新增</el-button>
         <el-button type="primary" @click="submit" style="margin-top:20px;">提交</el-button>
      </template>
   </d2-container>
</template>

<script>
import { httpGet, httpAdd } from '@api/http'

export default {
   name: 'demo-orders',
   data () {
      return {
         filename: __filename,
         type: [{ label: '单选', value: 'radio' }, { label: '多选', value: 'checkbox' }],
         vestigateList: []
      }
   },
   created () {
      this.$loading({ fullscreen: true })
      httpGet('investigate').then(res => {
         res.data.forEach(item => {
            let Json = {}
            Json.title = item.title
            Json.answer = item.answer.map(val => {
               let str = ''
               str += `${val.text}`
               return str
            }).join(',')
            Json.type = item.type
            Json.max = item.max
            this.vestigateList.push(Json)
         })
         this.$loading().close()
      })
   },
   methods: {
      addList () {
         this.vestigateList.push({ title: '', answer: '', type: 'radio', max: 1 })
      },
      removeList (k) {
         this.vestigateList.splice(k, 1)
      },
      submit () {
         let data = []
         this.vestigateList.forEach(item => {
            let Json = {}
            Json.title = item.title
            Json.answer = item.answer.split(',').map(val => { return { text: val } })
            Json.type = item.type
            Json.max = item.max
            data.push(Json)
         })
         this.$loading({ fullscreen: true })
         httpAdd('investigate', { data: JSON.stringify(data) }).then(res => {
            this.$message.success(`${res.msg}`)
            this.$loading().close()
         })
      }
   }
}
</script>
