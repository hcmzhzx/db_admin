<template>
   <d2-container :filename="filename">
      <template slot="header">
         <div class="flex between">
            <div class="title">用户组管理</div>
            <el-button type="primary" icon="el-icon-circle-plus-outline" @click="handleAdd">添加</el-button>
         </div>
      </template>
      <template>
         <el-table :data="Data" border style="width: 100%">
            <el-table-column prop="id" label="id" width="160" align="center"></el-table-column>
            <el-table-column prop="cname" label="角色名称" align="center"></el-table-column>
            <el-table-column prop="addtime" label="添加时间" width="200" align="center"></el-table-column>
            <el-table-column label="操作" width="200" align="center">
               <template slot-scope="scope">
                  <el-button type="primary" icon="el-icon-edit" size="small" @click="handleEdit(scope.row.id, scope.row.cname, scope.row.menus)">编辑</el-button>
                  <el-button type="danger" icon="el-icon-delete" size="small" @click="handleRemove(scope.row.id)">删除</el-button>
               </template>
            </el-table-column>
         </el-table>
      </template>

      <template>
         <el-dialog title="设置权限" :visible.sync="dialogForm">
            <el-form ref="form" :model="form" :rules="rules">
               <el-form-item label="角色名称" label-width="120" prop="name">
                  <el-input v-model="form.name" autocomplete="off"></el-input>
               </el-form-item>
               <template>
                  <el-collapse v-model="active">
                     <el-collapse-item title="系统管理员" v-if="admin.length" name="admin">
                        <el-form-item>
                           <el-checkbox-group v-model="form.admin">
                              <el-checkbox v-for="(v, k) in admin" :key="k" :label="v.title"></el-checkbox>
                           </el-checkbox-group>
                        </el-form-item>
                     </el-collapse-item>
                     <el-collapse-item title="学校管理系统" v-if="school.length" name="school">
                        <el-form-item>
                           <el-checkbox-group v-model="form.school">
                              <el-checkbox v-for="(v, k) in school" :key="k" :label="v.title"></el-checkbox>
                           </el-checkbox-group>
                        </el-form-item>
                     </el-collapse-item>
                     <el-collapse-item title="用户管理" v-if="users.length" name="users">
                        <el-form-item>
                           <el-checkbox-group v-model="form.users">
                              <el-checkbox v-for="(v, k) in users" :key="k" :label="v.title"></el-checkbox>
                           </el-checkbox-group>
                        </el-form-item>
                     </el-collapse-item>
                  </el-collapse>
               </template>
            </el-form>
            <div slot="footer" class="dialog-footer">
               <el-button @click="dialogForm = false">取 消</el-button>
               <el-button type="primary" @click="dialogSubmit('form')">确 定</el-button>
            </div>
         </el-dialog>
      </template>
   </d2-container>
</template>

<script>
import { httpGet, httpAdd, httpEdit, httpTrash } from '@api/http'

export default {
   name: 'users',
   data() {
      return {
         filename: __filename,
         Data: [],
         Id : 0,
         dialogForm: false,
         parseAccess: [],
         active: [],
         admin: [],
         school: [],
         users: [],
         form: {
            name: '',
            admin: [],
            school: [],
            users: []
         },
         rules: {
            name: [{required: true, message: '角色名不能为空', trigger: 'blur'}]
         }
      }
   },
   async created() {
      await this.loadata()
   },
   methods: {
      loadata() {
         httpGet('adminGroup').then(res => {
            this.mapCheckbox(res.access, '')
            this.Data = res.lists.map(item => {
               let json = item
               json.addtime = this.formatDate(item.addtime, 'y-M-d')
               return json
            })
         })
      },
      mapData (lists, belong) {
         return lists.map(item => {
            let json = {}
            if(item.pid){
               lists.forEach(val => {
                  item.belong = belong
                  json = item
               })
            } else {
               item.belong = belong = item.title
               json = item
            }
            return json
         })
      },
      mapCheckbox(list) {
         let mapdata = this.parseAccess = this.mapData(list, ''), name = ''
         this.admin = [], this.school = [], this.users = []
         mapdata.forEach(item => {
            if(item.pid){
               if(name == item.belong){
                  if(name == '系统管理员'){
                     this.admin.push(item)
                  } else if(name == '学校管理系统'){
                     this.school.push(item)
                  } else if(name == '用户管理'){
                     this.users.push(item)
                  }
               }
            } else {
               name = item.belong
            }
         })
      },
      dialogSubmit(form) {
         this.$refs[form].validate((valid) => {
            if(valid) {
               let admin = []
               if (this.form.admin.length) {
                  admin.push(this.admin[0].pid)
                  this.form.admin.forEach(item => {
                     let id = this.admin.find(val => {return item == val.title}).id
                     admin.push(id)
                  })
               }
               if (this.form.school.length) {
                  admin.push(this.school[0].pid)
                  this.form.school.forEach(item => {
                     let id = this.school.find(val => {return item == val.title}).id
                     admin.push(id)
                  })
               }
               if (this.form.users.length) {
                  admin.push(this.users[0].pid)
                  this.form.users.forEach(item => {
                     let id = this.users.find(val => {return item == val.title}).id
                     admin.push(id)
                  })
               }
               if (this.Id) {
                  let posts = {id: this.Id, cname: this.form.name, menus: admin.join(',')}
                  httpEdit('adminGroupopt', posts).then(res => {
                     this.dialogForm = false
                     this.$message({message: '修改成功', type: 'success'})
                     this.loadata()
                  })
               } else {
                  let posts = {cname: this.form.name, menus: admin.join(',')}
                  httpAdd('adminGroupopt', posts).then(res => {
                     this.dialogForm = false
                     this.$message({message: '添加成功', type: 'success'})
                     this.loadata()
                  })
               }
            }
         })
      },
      handleAdd() {
         this.Id = 0
         this.form.name = ''
         this.active = [], this.form.admin = [], this.form.school = [], this.form.users = []
         this.dialogForm = true
      },
      handleEdit(id, cname, menus) {
         this.Id = Number(id)
         let list = menus.split(',')
         this.form.name = cname
         this.active = [], this.form.admin = [], this.form.school = [], this.form.users = []
         list.map(val => {
            this.parseAccess.forEach(item => {
               if(item.id == val && item.belong == '系统管理员' && item.pid != 0){
                  this.form.admin.push(item.title)
                  this.active.push('admin')
               }
               if(item.id == val && item.belong == '学校管理系统' && item.pid != 0){
                  this.form.school.push(item.title)
                  this.active.push('school')
               }
               if(item.id == val && item.belong == '用户管理' && item.pid != 0){
                  this.form.users.push(item.title)
                  this.active.push('users')
               }
            })
         })
         this.dialogForm = true
      },
      handleRemove(id) {
         this.$confirm('确定删除此项?', '提示', {confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'}).then(() => {
            httpTrash('adminGroupopt', {id}).then(res => {
               this.$message({message: '删除成功', type: 'success'})
               this.Data = this.Data.filter(item => {return item.id != id})
            })
         }).catch(() => {
            this.$message({type: 'info', message: '已取消删除'})
         })
      }
   }
}
</script>
