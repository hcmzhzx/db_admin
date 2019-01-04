<template>
   <d2-container :filename="filename">
      <template>
         <el-table :data="Data" border style="width: 100%">
            <el-table-column prop="id" label="id" width="120" align="center"></el-table-column>
            <el-table-column prop="cname" label="名字" min-width="140" align="center"></el-table-column>
            <el-table-column prop="addtime" label="时间" width="140" align="center"></el-table-column>
            <el-table-column label="操作" width="200" align="center">
               <template slot-scope="scope">
                  <el-button type="primary" icon="el-icon-edit" size="small" @click="handleCheck(scope.row.id)">查看</el-button>
                  <el-button type="danger" icon="el-icon-delete" size="small" @click="handleRemove(scope.row.id)">删除</el-button>
               </template>
            </el-table-column>
         </el-table>
      </template>

      <template>
         <el-dialog title="调查结果" :visible.sync="dialog" width="60%">
            <template>
               <el-table :data="result" border style="width: 100%">
                  <el-table-column prop="title" label="问题" width="300" align="center"></el-table-column>
                  <el-table-column label="答案" min-width="400" align="center">
                     <template slot-scope="scope">
                        <el-tag v-if="typeof(scope.row.answer) != 'string'" v-for="(v, k) in scope.row.answer" :key="k" :type="v.value ? '': 'info'" style="margin-left:10px">{{v.text}}</el-tag>
                        <el-tag v-if="typeof(scope.row.answer) == 'string'" type="info">{{scope.row.answer}}</el-tag>
                     </template>
                  </el-table-column>
               </el-table>
            </template>
            <span slot="footer" class="dialog-footer">
               <el-button @click="dialog = false">取 消</el-button>
               <el-button type="primary" @click="dialog = false">确 定</el-button>
            </span>
         </el-dialog>
      </template>
   </d2-container>
</template>

<script>
import { httpGet, httpAdd, httpEdit, httpTrash } from '@api/http'
import dayjs from 'dayjs'

export default {
   name: 'everyday',
   data() {
      return {
         filename: __filename,
         dayjs,
         Data: [],
         dialog: false,
         result: []
      }
   },
   created() {
      this.$loading({fullscreen: true})
      httpGet('investigatelist').then(res => {
         this.Data = res.lists.map(item => {
            let json = item
            json.addtime = dayjs(item.addtime * 1000).format("YYYY-M-D")
            return json
         })
         this.$loading().close()
      })
   },
   methods: {
      handleCheck(Id) {
         this.$loading({fullscreen: true})
         httpGet('investigateopt', {id: Id}).then(res => {
            this.result = JSON.parse(res.data.result)
            this.dialog = true
            this.$loading().close()
         })
      },
      handleRemove(Id) {
         this.$confirm('确定删除此项?', '提示', {confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'}).then(() => {
            httpTrash('investigateopt', {id: Id}).then(res => {
               this.Data = this.Data.filter(item => {
                  return item.id != Id
               })
               this.$message.success('删除成功!')
            })
         }).catch(() => {
            this.$message,info('已取消删除')
         })
      }
   }
}
</script>
