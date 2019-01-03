<template>
   <d2-container :filename="filename">
      <template>
         <div class="el-table" style="padding:40px 40px 0 0;">
            <el-form ref="form" :model="form" :rules="rules" label-width="80px">
               <el-form-item label="账号" label-width="120px" prop="account">
                  <el-input v-model="form.account" autocomplete="off" placeholder="请填写账号"></el-input>
               </el-form-item>
               <el-form-item label="密码" label-width="120px" prop="pwd">
                  <el-input type="password" v-model="form.pwd" autocomplete="off" placeholder="请填写密码"></el-input>
               </el-form-item>
               <el-form-item label="头像" label-width="120px">
                  <el-upload
                     action=""
                     list-type="picture-card"
                     :limit="1"
                     :http-request="handleUpload"
                     :file-list="fileList"
                     :on-exceed="handleExceed"
                     :on-preview="handlePreview"
                     :before-remove="beforeRemove"
                     :on-remove="handleRemove">
                     <i class="el-icon-plus"></i>
                  </el-upload>
                  <el-dialog :visible.sync="dialog">
                     <img width="100%" :src="imageUrl" alt="预览图片">
                  </el-dialog>
               </el-form-item>
               <el-form-item label="状态" label-width="120px">
                  <el-switch v-model="form.state"></el-switch>
               </el-form-item>
               <el-form-item label="用户组" label-width="120px" prop="groups">
                  <el-checkbox-group v-model="form.groups">
                     <el-checkbox v-for="item in usersGroups" :label="item.label" name="checkList" border></el-checkbox>
                  </el-checkbox-group>
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
import { httpGet, httpAdd, httpEdit, httpAddUm, httpEditUm } from '@api/http'

export default {
   name: 'addSchool',
   data() {
      return {
         filename: __filename,
         Id: 0,
         usersGroups: [],
         form: {account: '', pwd: '', state: false, groups: []},
         initialPwd: '',
         UploadFile: null,
         fileList: [],
         IsUpload: false,
         rules: {
            account: [{ required: true, message: '账号不能为空', trigger: 'blur' }],
            pwd: [{ required: true, message: '密码不能为空', trigger: 'blur' }],
            groups: [{ type: 'array', required: true, message: '请至少选择一个用户组', trigger: 'change' }]
         },
         imageUrl: '',
         dialog: false
      }
   },
   async created() {
      await httpGet('admin').then(res => {
         for(let [v, k] of Object.entries(res.groups)){
            this.usersGroups.push({id: v, label: k})
         }
      })

      if(this.$route.query.id){
         this.Id = Number(this.$route.query.id)
         this.$route.meta.title = '修改用户'
         httpGet('adminopt', {id: this.Id}).then(res => {
            this.form.account = res.data.account
            this.form.pwd = this.initialPwd = res.data.pwd
            this.form.state = res.data.state ? true : false
            res.data.groups.split(',').forEach(item => {
               this.form.groups.push(this.usersGroups.find(val => {return item == val.id}).label)
            })
            this.fileList = [{name: '', url: res.data.head}]
            this.IsUpload = true
         })
      } else {
         this.$route.meta.title = '添加用户'
      }
   },
   methods: {
      // 超出限制
      handleExceed(files, fileList) {
         this.$message.warning(`当前限制选择 1 个文件`)
      },
      // 删除图片前
      beforeRemove(file, fileList) {
         return this.$confirm(`确定移除此图片？`)
      },
      // 删除上传图片
      handleRemove(file, fileList) {
         this.IsUpload = false
         // console.log(file, fileList)
      },
      // 预览图片
      handlePreview(file) {
         this.imageUrl = file.url, this.dialog = true
      },
      // 自定义上传
      handleUpload(file) {
         this.UploadFile = file.file, this.IsUpload = true
      },
      handleAdd(form) {
         if(!this.IsUpload){
            this.$message.warning(`上传图片不能为空!`)
            return
         }
         this.$refs[form].validate((valid) => {
            if(valid){
               let form = new FormData(), groups = []
               this.form.groups.find(v => {
                  groups.push(this.usersGroups.find(i => {return i.label == v}).id)
               })
               if(this.Id){
                  form.append('method', 'edit')
                  form.append('id', this.Id)
                  form.append('account', this.form.account)
                  if(this.initialPwd != this.form.pwd) {form.append('pwd', this.form.pwd)}
                  if(this.UploadFile) {form.append('file', this.UploadFile)}
                  form.append('state', this.form.state ? 1 : 0)
                  form.append('groups', groups.join(','))
                  httpEditUm('adminopt', form).then(res => {
                     this.$message.success('修改成功')
                     this.$router.go(-1);
                  })
               } else {
                  form.append('method', 'add')
                  form.append('account', this.form.account)
                  form.append('pwd', this.form.pwd)
                  form.append('state', this.form.state ? 1 : 0)
                  form.append('file', this.UploadFile)
                  form.append('groups', groups.join(','))
                  httpAddUm('adminopt', form).then(res => {
                     this.$message.success('添加成功')
                     this.$router.go(-1);
                  })
               }
            }
         })
      }
   }
}
</script>