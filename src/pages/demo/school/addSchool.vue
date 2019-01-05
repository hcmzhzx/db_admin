<template>
   <d2-container :filename="filename">
      <template>
         <el-form ref="form" :model="form" :rules="rules" label-width="80px">
            <el-form-item label="学校名称" label-width="120px" prop="cname">
               <el-input v-model="form.cname" autocomplete="off" placeholder="请填写学校名"></el-input>
            </el-form-item>
            <el-form-item label="地区" label-width="120px" prop="did">
               <el-select v-model="form.did" placeholder="请选择地区">
                  <el-option v-for="item in district" :key="item.value" :label="item.cname" :value="item.id"></el-option>
               </el-select>
            </el-form-item>
            <el-form-item label="合同" label-width="120px">
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
            <el-form-item label="联系方式" label-width="120px" prop="contact">
               <el-input v-model="form.contact" maxlength="11" autocomplete="off" placeholder="请填写联系方式"></el-input>
            </el-form-item>
            <el-form-item label="一年级" label-width="120px">
               <el-input v-model="form.grade1" autocomplete="off" placeholder="请填写班级"></el-input>
            </el-form-item>
            <el-form-item label="二年级" label-width="120px">
               <el-input v-model="form.grade2" autocomplete="off" placeholder="请填写班级"></el-input>
            </el-form-item>
            <el-form-item label="三年级" label-width="120px">
               <el-input v-model="form.grade3" autocomplete="off" placeholder="请填写班级"></el-input>
            </el-form-item>
            <el-form-item label="四年级" label-width="120px">
               <el-input v-model="form.grade4" autocomplete="off" placeholder="请填写班级"></el-input>
            </el-form-item>
            <el-form-item label="五年级" label-width="120px">
               <el-input v-model="form.grade5" autocomplete="off" placeholder="请填写班级"></el-input>
            </el-form-item>
            <el-form-item label="六年级" label-width="120px">
               <el-input v-model="form.grade6" autocomplete="off" placeholder="请填写班级"></el-input>
            </el-form-item>
            <el-form-item label="七年级" label-width="120px">
               <el-input v-model="form.grade7" autocomplete="off" placeholder="请填写班级"></el-input>
            </el-form-item>
            <el-form-item label="八年级" label-width="120px">
               <el-input v-model="form.grade8" autocomplete="off" placeholder="请填写班级"></el-input>
            </el-form-item>
            <el-form-item label="九年级" label-width="120px">
               <el-input v-model="form.grade9" autocomplete="off" placeholder="请填写班级"></el-input>
            </el-form-item>
            <el-form-item>
               <el-button type="primary" @click="handleAdd('form')">{{Id ? '立即修改' : '立即添加'}}</el-button>
            </el-form-item>
         </el-form>
      </template>
   </d2-container>
</template>

<script>
import { httpGet, httpAddUm, httpEditUm } from '@api/http'

export default {
   name: 'addSchool',
   data() {
      return {
         filename: __filename,
         Id: 0,
         district: [],
         form: {cname: '', did: '', contact: '', grade1: '', grade2: '', grade3: '', grade4: '', grade5: '', grade6: '', grade7: '', grade8: '', grade9: ''},
         rules: {
            cname: [{ required: true, message: '请输入学校名称', trigger: 'blur' }],
            did: [{ required: true, message: '请选择地区', trigger: 'change' }],
            contact: [{ required: true, message: '请输入联系方式', trigger: 'blur' },
               { min: 11, max: 11, message: '请输入11位联系方式', trigger: 'blur' }
            ]
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
         for(let [k, v] of Object.entries(res.district)){
            this.district.push({id: Number(k), cname: v})
         }
      })

      if(this.$route.query.id){
         this.Id = Number(this.$route.query.id)
         this.$route.meta.title = '修改学校'
         httpGet('schoolopt', {id: this.Id}).then(res => {
            this.form.cname = res.data.cname
            this.form.did = res.data.did
            this.fileList = [{name: '', url: res.data.contract}]
            let arr = JSON.parse(res.data.grade)
            for(let v of arr) {
               if(v.name == '一年级'){
                  this.form.grade1 = v.classes.join(',')
               } else if(v.name == '二年级'){
                  this.form.grade2 = v.classes.join(',')
               } else if(v.name == '三年级'){
                  this.form.grade3 = v.classes.join(',')
               } else if(v.name == '四年级'){
                  this.form.grade4 = v.classes.join(',')
               } else if(v.name == '五年级'){
                  this.form.grade5 = v.classes.join(',')
               } else if(v.name == '六年级'){
                  this.form.grade6 = v.classes.join(',')
               } else if(v.name == '七年级'){
                  this.form.grade7 = v.classes.join(',')
               } else if(v.name == '八年级'){
                  this.form.grade8 = v.classes.join(',')
               } else if(v.name == '九年级'){
                  this.form.grade9 = v.classes.join(',')
               }
            }
            this.IsUpload = true
            this.$loading().close()
         })
      } else {
         this.$route.meta.title = '添加学校'
         this.$loading().close()
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
               this.$loading({fullscreen: true})
               let Form = new FormData(), grades = [], cnum = 0
               for(let [k, v] of Object.entries(this.form)){
                  let json = {}
                  if(k == 'grade1' && v != ''){
                     json.name = '一年级'
                     json.classes = v.split(',')
                     grades.push(json)
                  } else if(k == 'grade2' && v != ''){
                     json.name = '二年级'
                     json.classes = v.split(',')
                     grades.push(json)
                  } else if(k == 'grade3' && v != ''){
                     json.name = '三年级'
                     json.classes = v.split(',')
                     grades.push(json)
                  } else if(k == 'grade4' && v != ''){
                     json.name = '四年级'
                     json.classes = v.split(',')
                     grades.push(json)
                  } else if(k == 'grade5' && v != ''){
                     json.name = '五年级'
                     json.classes = v.split(',')
                     grades.push(json)
                  } else if(k == 'grade6' && v != ''){
                     json.name = '六年级'
                     json.classes = v.split(',')
                     grades.push(json)
                  } else if(k == 'grade7' && v != ''){
                     json.name = '七年级'
                     json.classes = v.split(',')
                     grades.push(json)
                  } else if(k == 'grade8' && v != ''){
                     json.name = '八年级'
                     json.classes = v.split(',')
                     grades.push(json)
                  } else if(k == 'grade9' && v != ''){
                     json.name = '九年级'
                     json.classes = v.split(',')
                     grades.push(json)
                  }
               }
               grades.forEach((item) => { cnum += item.classes.length })
               if(this.Id){
                  Form.append('method', 'edit')
                  Form.append('id', this.Id)
                  Form.append('did', this.form.did)
                  Form.append('cname', this.form.cname)
                  Form.append('contact', this.form.contact)
                  if(this.UploadFile) Form.append('file', this.UploadFile)
                  Form.append('grade', JSON.stringify(grades))
                  Form.append('gnum', grades.length)
                  Form.append('cnum', cnum)
                  httpEditUm('schoolopt', Form).then(res => {
                     this.$message.success('修改成功')
                     this.$loading().close()
                     this.$router.go(-1)
                  })
               } else {
                  Form.append('method', 'add')
                  Form.append('did', this.form.did)
                  Form.append('cname', this.form.cname)
                  Form.append('contact', this.form.contact)
                  Form.append('file', this.UploadFile)
                  Form.append('grade', JSON.stringify(grades))
                  Form.append('gnum', grades.length)
                  Form.append('cnum', cnum)
                  httpAddUm('schoolopt', Form).then(res => {
                     this.$message.success('添加成功')
                     this.$loading().close()
                     this.$router.go(-1)
                  })
               }
            }
         })
      }
   }
}
</script>