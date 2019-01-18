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
               :loading="loading"
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
         loading: true,
         Data: [],
         rowHandle: {
            columnHeader: '编辑表格',
            width: '240px',
            align: "center",
            edit: { icon: 'el-icon-edit', text: '编辑', size: 'small'},
            remove: { confirmText: '地区与学校关联, 确定删除吗?', size: 'small', fixed: 'right', icon: 'el-icon-delete' }
         },
         addButton: {icon: 'el-icon-plus', size: 'small' },
         formTemplate: {
            cname: { title: '地址', value: '' },
            sortid: { title: '排序', value: '100' }
         },
         formOptions: { labelWidth: '80px', labelPosition: 'left', saveLoading: false }
      }
   },
   created() {
      httpGet('district').then(res => {
         this.Data = res.lists
         this.loading = false
      })
   },
   methods: {
      handleRowAdd(row, done) {
         this.formOptions.saveLoading = true
         for(let v of Object.values(row)){
            if(v == ''){
               this.$message.warning('值不能为空')
               this.formOptions.saveLoading = false
               return
            }
         }
         this.loading = true
         httpAdd('districtopt', row).then(res => {
            this.$message.success(res.msg)
            done({ id: res.id })
            this.formOptions.saveLoading = false
            this.loading = false
         })
      },
      handleRowEdit ({index, row}, done) {
         this.formOptions.saveLoading = true
         for(let v of Object.values(row)){
            if(v == ''){
               this.$message.warning('值不能为空')
               return
            }
         }
         this.loading = true
         httpEdit('districtopt', row).then(res => {
            this.$message.success(res.msg)
            done()
            this.formOptions.saveLoading = false
            this.loading = false
         })
      },
      handleRowRemove ({index, row}, done) {
         let Id = row.id
         this.loading = true
         httpTrash('districtopt', {id: Id}).then(res => {
            this.$message.success(res.msg)
            this.loading = false
            done()
         })
      },
      handleDialogCancel(done) {
         this.$message.warning('取消保存')
         done()
      }
   }
}
</script>
