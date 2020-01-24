<template>
   <div style="cursor: pointer">
      <el-tag :type="this.value == 1 ? 'success' : 'danger'">{{ this.value == 1 ? '已展示' : '未展示' }}</el-tag>
   </div>
</template>

<script>
export default {
   props: {
      value: { require: true },
      scope: { default: null },
      myProps: { default: null }
   }
}
</script>
