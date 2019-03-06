<template>
   <d2-container :filename="filename">
      <template slot="header" class="flex between"><div class="title">编辑首页</div></template>
      <template>
         <div class="flexv banners el-table" style="padding:20px;">
            <div class="flex items" v-for="(v, k) in banners" :key="k">
               <div :class="['picker', v.image ? 'close' : 'el-icon-plus']">
                  <img :src="v.image" v-if="v.image" class="image" alt="banner图片"/>
                  <input type="file" @change="uploadimage(k, $event)" v-else/>
                  <i class="el-icon-close" @click="closeImage(k)"></i>
               </div>
               <div class="inputs">
                  <select v-model="v.opentype">
                     <option value="" disabled selected>跳转方式</option>
                     <option value="switchTab">底部菜单</option>
                     <option value="redirect">本页跳转</option>
                     <option value="navigate">新开窗口</option>
                  </select>
                  <input type="text" placeholder="请填写跳转链接" v-model="v.url">
               </div>
               <div class="flex submit">
                  <button class="flex center btn el-button el-button--primary" @click="itemsave(k)">保存数据</button>
                  <button class="flex center btn el-button el-button--primary" @click="itemremove(k)">删除</button>
               </div>
            </div>
            <div class="flex item add">
               <button class="flex center el-button el-button--primary" @click="addnew">添加一个</button>
            </div>
         </div>
      </template>
      <template>
         <div class="el-table" style="margin-top:20px;padding:20px;">
            <el-form :inline="true" label-width="80px" label-position="left">
               <el-form-item label="公告标题:">
                  <el-input v-model="title" placeholder="请输入公告标题"></el-input>
               </el-form-item>
            </el-form>
            <!--编辑器-->
            <el-row :gutter="20">
               <el-col :span="20"><d2-ueditor v-model="content"/></el-col>
            </el-row>
            <el-button type="primary" @click="Submit">提交</el-button>
         </div>
      </template>
   </d2-container>
</template>

<script>
import { httpGet, httpAdd, httpEdit, httpPost, httpTrash } from '@api/http'

export default {
   name: 'demo-message',
   data() {
      return {
         filename: __filename,
         banners: [{image: '', opentype: '', url: ''}],
         title: '',
         content: ''
      }
   },
   created() {
      this.$loading({fullscreen: true})
      httpGet('homepage').then(res => {
         this.banners = res.data.banner
         let {title, content} = res.data.notice
         this.title = title
         this.content = content
         this.$loading().close()
      })
   },
   methods: {
      addnew () {
         this.banners.push({image: '', opentype: '', url: ''})
      },
      itemsave (k) {
         let items = Object.assign({}, this.banners[k])
         if (items.image == '' && !items.file) {
            this.$message.warning(`请选择上传文件!`)
         } else if(items.opentype == ''){
            this.$message.warning(`请选择跳转方式!`)
         } else if(items.url == ''){
            this.$message.warning(`请填写跳转链接!`)
         } else {
            this.$loading({fullscreen: true})
            let posts = new FormData()
            items.file ? posts.append('file', items.file) : posts.append('image', items.image)
            posts.append('opentype', items.opentype)
            posts.append('url', items.url)
            posts.append('keys', k)
            httpPost('homepage', posts).then(res => {
               this.$message.success(`${res.msg}`)
               this.$loading().close()
            })
         }
      },
      itemremove (k) {
         this.banners.splice(k, 1)
      },
      uploadimage (k, res) {
         this.banners[k].file = res.target.files[0]
         this.banners[k].image = window.URL.createObjectURL(res.target.files[0])
      },
      closeImage (k) {
         this.banners[k].file = null
         this.banners[k].image = ''
      },
      Submit () {
         let posts = {title: this.title, content: this.content}
         if(!posts.title) {
            this.$message.warning(`请输入公告标题!`)
            return
         }
         if(!posts.content) {
            this.$message.warning(`请输入内容!`)
            return
         }
         this.$loading({fullscreen: true})
         httpPost('homepage', posts).then(res => {
            this.$message.success(`${res.msg}`)
            this.$loading().close()
         })
      }
   }
}
</script>

<style>
.banners input[type=text]{border-radius:6px;outline:0;border:1px solid #c0ccda;border-radius:10px;-webkit-tap-highlight-color:transparent;-webkit-appearance:none;line-height:normal;}
.banners .items{padding:10px 0;border-bottom:1px solid #c0ccda;}
.banners .picker{position:relative;border-radius:6px;border:1px dashed #c0ccda;width:200px;height:100px;overflow:hidden;background:#fbfdff;}
.banners .picker.el-icon-plus:before{position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);font-size:24px;}
.banners .picker.close:hover:after{content:'';position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.5);}
.banners .picker .el-icon-close{position:absolute;top:4px;right:4px;display:none;}
.banners .picker.close:hover .el-icon-close{position:absolute;top:4px;right:4px;display:block;color:#fff;font-size:24px;z-index:100;}
.banners .picker .image{width:100%;height:100%;object-fit:cover;}
.banners .picker input[type=file]{position:absolute;top:0;left:0;right:0;bottom:0;width:100%;height:100%;opacity:0;cursor:pointer;}
.banners .inputs select{margin:0 20px;border-radius:6px;height:40px;outline:0;}
.banners .inputs input[type=text]{padding:0 10px;height:40px;}
.banners .submit button.btn{padding:0 10px;height:40px;margin-left:10px;}
.banners .add{margin-top:20px;}
</style>
