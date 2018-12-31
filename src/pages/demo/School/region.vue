<template>
   <d2-container :filename="filename">
      <template>
         <div>
            <d2-crud
               :columns="columns"
               :data="Data"
               :options="options"
               title="地区管理"
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
      </template>
   </d2-container>
</template>

<script>
import { httpGet, httpAdd, httpEdit, httpTrash } from '@api/http'

export default {
   name: 'region',
   data() {
      return {
         filename: __filename,
         columns: [
            {title: 'id', key: 'id', align: 'center', width: '120px'},
            {title: '地址', key: 'cname', align: 'center'},
            {title: '排序', key: 'sortid', align: 'center', width: '120px'}
         ],
         options: {border: true},
         Data: [],
         rowHandle: {
            columnHeader: '编辑表格',
            width: '240px',
            align: "center",
            edit: {icon: 'el-icon-edit', text: '编辑', size: 'small'},
            remove: {icon: 'el-icon-delete', size: 'small', fixed: 'right', confirm: true}
         },
         addButton: {icon: 'el-icon-plus', size: 'small'},
         formTemplate: {
            cname: {title: '地址', value: ''},
            sortid: {title: '排序', value: '100'}
         },
         formOptions: {labelWidth: '80px', labelPosition: 'left', saveLoading: false}
      }
   },
   created() {
      httpGet('district').then(res => {
         this.Data = res.lists
      })
   },
   methods: {
      handleRowAdd(row, done) {
         this.formOptions.saveLoading = true
         for(let v of Object.values(row)){
            if(v == ''){
               this.$message({message: '值不能为空', type: 'warning'})
               this.formOptions.saveLoading = false
               return
            }
         }
         httpAdd('districtopt', row).then(res => {
            this.$message({message: '保存成功', type: 'success'})
            done({ id: res.id })
            this.formOptions.saveLoading = false
         })
      },
      handleRowEdit ({index, row}, done) {
         this.formOptions.saveLoading = true
         for(let v of Object.values(row)){
            if(v == ''){
               this.$message({message: '值不能为空', type: 'warning'})
               return
            }
         }
         httpEdit('districtopt', row).then(res => {
            this.$message({message: '编辑成功', type: 'success'})
            done()
            this.formOptions.saveLoading = false
         })
      },
      handleRowRemove ({index, row}, done) {
         let Id = row.id
         httpTrash('districtopt', {id: Id}).then(res => {
            this.$message({message: '删除成功', type: 'success'})
            done()
         })
      },
      handleDialogCancel(done) {
         this.$message({message: '取消保存', type: 'warning'})
         done()
      }
   }
}
</script>
