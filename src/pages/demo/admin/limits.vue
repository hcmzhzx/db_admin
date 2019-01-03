<template>
   <d2-container :filename="filename">
      <div>
         <d2-crud
            :columns="columns"
            :data="Data"
            :options="options"
            title="权限管理"
            add-mode
            :rowHandle="rowHandle"
            :add-button="addButton"
            :form-template="formTemplate"
            :form-options="formOptions"
            @row-add="handleRowAdd"
            @row-edit="handleRowEdit"
            @row-remove="handleRowRemove"
            @dialog-cancel="handleDialogCancel"/>
      </div>
   </d2-container>
</template>

<script>
import { httpGet, httpAdd, httpEdit, httpTrash } from '@api/http'
import myTag from './myTag'
import mySwitch from './mySwitch'

export default {
   name: 'limits',
   components:{ myTag },
   data() {
      return {
         filename: __filename,
         columns: [
            // {title: 'id', key: 'id', align: 'center', width: '120px'},
            // {title: 'pid', key: 'pid', align: 'center', width: '120px'},
            {title: '权限所属', key: 'name', align: 'center'},
            {title: '权限名称', key: 'title', align: 'center'},
            {title: '图标', key: 'icon', align: 'center'},
            {title: '前端路由', key: 'path', align: 'center'},
            {title: '服务器请求地址', key: 'url', align: 'center'},
            {title: '权限说明', key: 'ifshow', align: 'center', component:{name: myTag}},
            {title: '排序', key: 'sortid', align: 'center', width: '120px'}
         ],
         options: {border: true},
         Data: [],
         rowHandle: {
            columnHeader: '编辑权限',
            width: '200px',
            align: "center",
            edit: {icon: 'el-icon-edit', text: '编辑', size: 'small'},
            remove: {icon: 'el-icon-delete', size: 'small', fixed: 'right', confirm: true}
         },
         addButton: {icon: 'el-icon-plus', size: 'small'},
         formTemplate: {
            pid: {title: 'pid', value: '', component: {
               name: 'el-select',
               options: [
                  {label: '一级菜单', value: 0}
               ]
            }},
            title: {title: '权限名称', value: ''},
            icon: {title: '图标', value: '', component: {placeholder: '选 填 '}},
            path: {title: '前端路由', value: ''},
            url: {title: '服务器请求地址', value: ''},
            ifshow: {title: '权限说明', value: 0, component: {name: mySwitch}},
            sortid: {title: '排序', value: '100'}
         },
         formOptions: {labelWidth: '120px', labelPosition: 'left', saveLoading: false}
      }
   },
   async created() {
      await httpGet('adminaccess').then(res => {
         this.Data = this.accessParse(res.lists, 0)
         this.pidOptions(res.lists)
         // console.log(this.parseAccess(res.lists, 0));
      })
   },
   methods: {
      pidOptions (arr) {
         let option = arr.map(item => {
            let json = {}
            json.label = item.title
            json.value = item.id
            return json
         })
         this.formTemplate.pid.component.options.push(...option)
      },
      handleRowAdd (row, done) {
         this.formOptions.saveLoading = true
         for(let [k, v] of Object.entries(row)){
            if(k != 'icon' && k != 'ifshow' && v === '' && v !== 0){
               this.$message({message: '值不能为空', type: 'warning'})
               this.formOptions.saveLoading = false
               return
            }
         }
         httpAdd('adminaccessopt', row).then(res => {
            this.formTemplate.pid.component.options.push({label: row.title, value: res.id})
            this.$message({message: '保存成功', type: 'success'})
            let name = row.pid ? this.formTemplate.pid.component.options.find(val => {return val.value == row.pid}).label : row.title
            done({ name })
            this.formOptions.saveLoading = false
         })
      },
      handleRowEdit ({index, row}, done) {
         this.formOptions.saveLoading = true
         for(let [k, v] of Object.entries(row)){
            if(k != 'icon' && k != 'ifshow' && v === '' && v !== 0){
               this.$message({message: '值不能为空', type: 'warning'})
               this.formOptions.saveLoading = false
               return
            }
         }
         httpEdit('adminaccessopt', row).then(res => {
            let option = this.formTemplate.pid.component.options.filter(item => {return item.value != row.id})
            option.push({label: row.title, value: row.id})
            this.formTemplate.pid.component.options = option
            this.$message({message: '修改成功', type: 'success'})
            done()
            this.formOptions.saveLoading = false
         })
      },
      handleRowRemove ({index, row}, done) {
         let Id = row.id
         httpTrash('adminaccessopt', {id: Id}).then(res => {
            this.formTemplate.pid.component.options = this.formTemplate.pid.component.options.filter(item => {return item.value != Id})
            this.$message({message: '删除成功', type: 'success'})
            done()
         })
      },
      handleDialogCancel (done) {
         this.$message({message: '取消保存', type: 'warning'})
         done()
      },
      accessParse (lists, pid, name) {
         let access = []
         lists.forEach(item => {
            if (item.pid == pid) {
               item.name = name ? name : item.title
               access.push(item)
               let items = this.accessParse(lists, item.id, item.title)
               access.push(...items)
            }
         })
         return access
      },
      parseAccess (lists, pid) { // 菜单重组
         let access = []
         lists.forEach(item => {
            if (item.pid == pid && item.ifshow) {
               let children = this.parseAccess(lists, item.id)
               if (children.length) item.children = children
               if (item.ifshow) access.push(item)
            }
         })
         return access
      }
   }
}
</script>
