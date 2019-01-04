<template>
   <d2-container :filename="filename">
      <template slot="header" class="flex between"><div class="title">编辑操作指南</div></template>
      <template>
         <el-form :model="form" label-position="left">
            <el-form-item label="标题" label-width="60px">
               <el-input v-model="form.title" autocomplete="off" placeholder="请输入标题"></el-input>
            </el-form-item>
            <el-form-item label="副标题" label-width="60px">
               <el-input v-model="form.description" autocomplete="off" placeholder="请输入副标题"></el-input>
            </el-form-item>
         </el-form>
         <div class="flex">
            <span style="padding-right:12px;min-width:55px;line-height:40px;font-size:14px;color:#606266;">内容</span>
            <el-row :gutter="20">
               <el-col :span="20"><d2-ueditor v-model="form.content"/></el-col>
            </el-row>
         </div>
         <el-button type="primary" @click="Submit" style="margin:20px 0 0 66px;">提交</el-button>
      </template>
   </d2-container>
</template>

<script>
import { httpGet, httpAdd, httpEdit, httpTrash } from '@api/http'

export default {
   name: 'demo-message-helpEdit',
   data() {
      return {
         filename: __filename,
         Id: 0,
         form: {
            title: '',
            description: '',
            content: ''
         }
      }
   },
   created () {
      this.Id = Number(this.$route.query.id)
      this.$loading({fullscreen: true})
      if(this.Id){
         this.$route.meta.title = '编辑操作指南'
         httpGet('helpopt', {id: this.Id}).then(res => {
            this.dialog = true
            let {title, description, content} = res.data
            this.form = {title, description, content}
            this.$loading().close()
         })
      } else {
         this.$loading().close()
         this.$route.meta.title = '添加操作指南'
      }
   },
   methods: {
      Submit () {
         if(!this.form.title){
            this.$message.warning(`请输入标题!`)
            return
         }
         if(!this.form.description){
            this.$message.warning(`请输入副标题!`)
            return
         }
         if(!this.form.content){
            this.$message.warning(`请输入内容!`)
            return
         }
         this.$loading({fullscreen: true})
         if(this.Id){
            let posts = {id: this.Id, title: this.form.title, description: this.form.description, content: this.form.content}
            httpEdit('helpopt', posts).then(res => {
               this.$message.success(`${res.msg}`)
               this.$loading().close()
               this.$router.go(-1);
            })
         } else {
            let posts = {title: this.form.title, description: this.form.description, content: this.form.content}
            httpAdd('helpopt', posts).then(res => {
               this.$message.success(`${res.msg}`)
               this.$loading().close()
               this.$router.go(-1);
            })
         }
      }
   }
}
</script>
