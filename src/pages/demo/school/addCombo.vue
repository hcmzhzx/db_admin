<template>
   <d2-container :filename="filename">
      <template>
         <div class="el-table" style="padding-top:40px;">
            <el-form ref="form" :model="form" :rules="rules" label-width="80px">
               <el-form-item label="标题" label-width="120px" prop="title">
                  <el-input v-model="form.title" autocomplete="off" placeholder="请填写标题"></el-input>
               </el-form-item>
               <el-form-item label="套餐" label-width="120px">
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
               <el-form-item label="学校名称" label-width="120px" prop="checkList">
                  <el-checkbox-group v-model="form.checkList">
                     <el-checkbox v-for="item in school" :label="item.cname" name="checkList" border></el-checkbox>
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
         school: [],
         form: {title: '', checkList: []},
         rules: {
            title: [{ required: true, message: '请输入名称', trigger: 'blur' }],
            checkList: [{ type: 'array', required: true, message: '请至少选择一个学校', trigger: 'change' }]
         },
         IsUpload: false,
         UploadFile: null,
         fileList: [],
         imageUrl: '',
         dialog: false
      }
   },
   async created() {
      this.$loading({fullscreen: true})
      await httpGet('school').then(res => {
         this.school = res.lists
      })

      if(this.$route.query.id){
         this.Id = Number(this.$route.query.id)
         this.$route.meta.title = '修改套餐'
         httpGet('taocanopt', {id: this.Id}).then(res => {
            JSON.parse(res.data.schools).find(i => {
               this.form.checkList.push(this.school.find(v => {return v.id == i}).cname)
            })
            this.form.title = res.data.title
            this.fileList = [{name: '', url: res.data.image}]
            this.IsUpload = true
            this.$loading().close()
         })
      } else {
         this.$loading().close()
         this.$route.meta.title = '添加套餐'
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
               let form = new FormData(), school = []
               this.form.checkList.find(v => {
                  let Id = this.school.find(i => {return i.cname == v}).id
                  school.push(Id)
               })
               if(this.Id){
                  form.append('method', 'edit')
                  form.append('id', this.Id)
                  form.append('title', this.form.title)
                  form.append('file', this.UploadFile)
                  form.append('school', JSON.stringify(school))
                  httpEditUm('taocanopt', form).then(res => {
                     this.$message.success('修改成功')
                     this.$router.go(-1);
                  })
               } else {
                  form.append('method', 'add')
                  form.append('title', this.form.title)
                  form.append('file', this.UploadFile)
                  form.append('school', JSON.stringify(school))
                  httpAddUm('taocanopt', form).then(res => {
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