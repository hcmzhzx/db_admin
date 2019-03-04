<template>
   <d2-container :filename="filename">
      <template>
         <el-form ref="form" :model="form" :rules="rules" label-width="80px">
            <el-form-item label="日期" label-width="100px" prop="date">
               <el-date-picker v-model="form.date" type="date" placeholder="选择日期" value-format="timestamp"></el-date-picker>
            </el-form-item>
            <el-form-item label="套餐名" label-width="100px" prop="cname">
               <el-select v-model="form.cname" placeholder="请选择地区">
                  <el-option v-for="item in combo" :key="item.value" :label="item.cname" :value="item.id"></el-option>
               </el-select>
            </el-form-item>
            <el-form-item label="实拍图" label-width="100px">
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
   name: 'addEveryday',
   data() {
      return {
         filename: __filename,
         Id: 0,
         combo: [],
         form: {
            date: '',
            cname: ''
         },
         dialog: false,
         fileList: [],
         imageUrl: '',
         rules: {
            date: [{ required: true, message: '请选择日期', trigger: 'change' }],
            cname: [{ required: true, message: '请选择套餐名', trigger: 'change' }]
         },
      }
   },
  async created () {
     this.$loading({fullscreen: true})
     if (this.$route.query.id) {
        this.Id = Number(this.$route.query.id)
        this.$route.meta.title = '修改每日实拍'
        httpGet('dayshoot', {id: this.Id}).then(res => {
           for (let [k, v] of Object.entries(res.taocan)) {
              this.combo.push({id: v, cname: k})
           }
           if (res.lists) {
              let data = res.lists.find(item => { return this.Id = item.id })
              this.form.date = data.addtime * 1000
              this.form.cname = this.combo.find(item => { return data.tid == item.id }).cname
              this.fileList = [{name: '', url: data.image}]
           }
           this.$loading().close()
        })
     } else {
        this.$route.meta.title = '添加每日实拍'
        httpGet('dayshoot').then(res => {
           for (let [k, v] of Object.entries(res.taocan)) {
              this.combo.push({id: v, cname: k})
           }
           this.$loading().close()
        })
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
         this.UploadFile = null
      },
      // 预览图片
      handlePreview(file) {
         this.imageUrl = file.url, this.dialog = true
      },
      // 自定义上传
      handleUpload(file) {
         this.UploadFile = file.file
      },
      handleAdd(form) {
         if (!this.UploadFile) {
            this.$message.warning(`上传图片不能为空!`)
            return
         }
         this.$refs[form].validate((valid) => {
            if (valid) {
               this.$loading({fullscreen: true})
               let Form = new FormData()
               if(this.Id){
                  Form.append('method', 'edit')
                  Form.append('id', this.Id)
                  Form.append('tid', this.form.cname)
                  Form.append('date', this.form.date / 1000)
                  Form.append('file', this.UploadFile)
                  httpAddUm('dayshootopt', Form).then(res => {
                     this.$message.success(res.msg)
                     this.$loading().close()
                     this.$router.go(-1)
                  })
               } else {
                  Form.append('method', 'add')
                  Form.append('tid', this.form.cname)
                  Form.append('date', this.form.date / 1000)
                  Form.append('file', this.UploadFile)
                  httpAddUm('dayshootopt', Form).then(res => {
                     this.$message.success(res.msg)
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
