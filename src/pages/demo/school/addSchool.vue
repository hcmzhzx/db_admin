<template>
   <d2-container>
      <template>
         <el-form ref="form" :model="form" v-loading="loading" :element-loading-text="loadtxt" :rules="rules" label-width="80px" class="addschool">
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
            <el-form-item v-for="(v, k) in form.grade" :key="k" label="年级班级" label-width="120px" prop="grades">
               <el-input v-model="v.name" autocomplete="off" placeholder="请填写年级" class="name"></el-input>：
               <el-input v-model="v.classes" autocomplete="off" placeholder="请填写班级"></el-input>
            </el-form-item>
         </el-form>
      </template>
      <template slot="footer">
         <div class="flex between">
            <div class="buttons">
               <el-button @click="minus" type="primary" icon="el-icon-minus"></el-button>
               <el-button @click="plus" type="primary" icon="el-icon-plus"></el-button>
            </div>
            <el-button type="primary" @click="handleAdd('form')">{{Id ? '立即修改' : '立即添加'}}</el-button>
         </div>
      </template>
   </d2-container>
</template>

<script>
import { httpGet, httpAddUm, httpEditUm } from '@api/http'

export default {
   name: 'addSchool',
   data() {
      return {
         loading: true,
         loadtxt: '拼命加载中',
         Id: 0,
         district: [],
         form: { cname: '', did: '', contact: '', grade: [{ name: '一年级', classes: '' }] },
         rules: {
            cname: [{ required: true, message: '请输入学校名称', trigger: 'blur' }],
            did: [{ required: true, message: '请选择地区', trigger: 'change' }],
            contact: [{ required: true, message: '请输入联系方式', trigger: 'blur' },
               { min: 11, max: 11, message: '请输入11位联系方式', trigger: 'blur' }
            ],
            grades: [{ required: true, message: '请输入年级班级', trigger: 'blur' }]
         },
         IsUpload: false,
         UploadFile: null,
         fileList: [],
         imageUrl: '',
         dialog: false
      }
   },
   async created() {
      let posts = '', Id = Number(this.$route.query.id)
      if(Id){
         this.Id = Id
         this.$route.meta.title = '修改学校'
         posts = { id: Id }
         this.IsUpload = true
      } else {
         this.$route.meta.title = '添加学校'
      }
      await httpGet('schoolopt', posts).then(res => {
         for(let [k, v] of Object.entries(res.district)){
            this.district.push({id: Number(k), cname: v})
         }
         let data = res.data
         if(data){
            this.form.cname = data.cname
            this.form.did = this.district.find(item => { return item.id == data.did }) ? data.did : ''
            this.form.contact = data.contact
            this.fileList = [{name: '', url: data.contract}]
            this.form.grade = []
            JSON.parse(data.grade).forEach(v => {
               let { name, classes } = v
               this.form.grade.push({ name, classes: classes.join(',') })
            })
         }
         this.loading = false
      })
   },
   methods: {
      // 添加年级班级
      plus () {
         this.form.grades.push({ name: '', classes: '' })
      },
      // 减少年级班级
      minus () {
         if (this.form.grades.length === 1) {
            this.$message.warning(`至少保留一个`)
         } else {
            this.form.grades.pop()
         }
      },
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
               let Form = new FormData(), cnum = 0
               let grades = this.form.grade.filter(v => (v.classes && v.name)).map(v => {
                  let json = {}, { name, classes } = v
                  json.name = name
                  json.classes = classes.split(/,|，|\./g)
                  return json
               })
               if (!grades.length) {
                  this.$message.warning('年级班级信息不全')
                  return
               }
               grades.forEach((item) => { cnum += item.classes.length })
               this.loading = true
               this.loadtxt = '提交中...'
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
                     this.loading = false
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
                     this.loading = false
                     this.$router.go(-1)
                  })
               }
            }
         })
      }
   }
}
</script>

<style>
.addschool .el-form-item__content{display: -webkit-box; display: flex;}
.addschool .el-form-item__content .name{width: 160px;}
</style>
