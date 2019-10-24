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
                  <el-collapse>
                     <el-collapse-item v-for="(item, index) in collapse" :title="item.title" :name="item.title" :key="index">
                        <el-checkbox-group v-model="form.admin">
                           <el-checkbox v-for="(v, k) in item.children" :key="k" :label="v.title"></el-checkbox>
                        </el-checkbox-group>
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
import dayjs from 'dayjs'

export default {
   name: 'users',
   data() {
      return {
         dayjs,
         filename: __filename,
         Data: [],
         Id : 0,
         dialogForm: false,
         active: [],
         collapse: [],
         form: {
            name: '',
            admin: []
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
         this.$loading({ fullscreen: true })
         httpGet('adminGroup').then(res => {
            if (res) {
               this.collapse = this.parseAccess(res.access, 0)
               this.Data = res.lists.map(item => {
                  let json = item
                  json.addtime = dayjs(item.addtime * 1000).format('YYYY-MM-DD')
                  return json
               })
            }
            this.$loading().close()
         })
      },
      parseAccess (lists, pid) { // 菜单重组
         let access = []
         lists.forEach(item => {
            if (item.pid == pid ) {
               let children = this.parseAccess(lists, item.id)
               if (children.length) item.children = children
               access.push(item)
            }
         })
         return access
      },
      dialogSubmit(form) {
         this.$refs[form].validate((valid) => {
            if(valid) {
               var access = Object.assign([], this.form.admin), menus = Object.assign([], this.collapse), mids = []
               menus.forEach(item => {
                  item.children.forEach(v => {
                     if (access.indexOf(v.title) > -1) {
                        if (mids.indexOf(item.id) < 0) mids.push(item.id)
                        mids.push(v.id)
                     }
                  })
               })
               if (mids.length == 0) {
                  this.$message.warning('至少有一个权限')
               } else {
                  this.$loading({fullscreen: true})
                  if (this.Id) {
                     let posts = {id: this.Id, cname: this.form.name, menus: mids.join(',')}
                     httpEdit('adminGroupopt', posts).then(res => {
                        this.dialogForm = false
                        this.$message({message: '修改成功', type: 'success'})
                        this.$loading().close()
                     })
                  } else {
                     let posts = {cname: this.form.name, menus: mids.join(',')}
                     httpAdd('adminGroupopt', posts).then(res => {
                        this.dialogForm = false
                        this.$message({message: '添加成功', type: 'success'})
                        this.$loading().close()
                     })
                  }
               }
            }
         })
      },
      handleAdd() {
         this.Id = 0
         this.form.name = ''
         this.active = [], this.form.admin = []
         this.dialogForm = true
      },
      handleEdit(id, cname, menus) {
         this.Id = Number(id)
         let mids = menus.split(',')
         let access = []
         let menuItems = Object.assign([], this.collapse)
         this.form.name = cname
         this.active = [], this.form.admin = []
         menuItems.forEach(item => {
            if (mids.indexOf(String(item.id)) > -1) access.push(item.title)
            item.children.forEach(v => {
               if (mids.indexOf(String(v.id)) > -1) access.push(v.title)
            })
         })
         this.form.admin = access
         this.dialogForm = true
      },
      handleRemove(id) {
         this.$confirm('确定删除此项?', '提示', {confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'}).then(() => {
            httpTrash('adminGroupopt', {id}).then(res => {
               if (res.code == 0) {
                  this.Data = this.Data.filter(item => item.id != id)
                  this.$message.success(res.msg)
               } else {
                  this.$message.warning(res.msg)
               }
            })
         }).catch(() => {
            this.$message({type: 'info', message: '已取消删除'})
         })
      }
   }
}
</script>
