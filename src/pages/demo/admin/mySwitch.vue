<template>
   <div style="cursor: pointer">
      <el-tag :type="type" @click.native="handleClick">{{ text }}</el-tag>
   </div>
</template>

<script>
export default {
   props: {
      value: { require: true }
   },
   computed: {
      type () {
         return  this.value == 1 ? 'success' : 'danger'
      },
      text () {
         return  this.value == 1 ? '已展示' : '未展示'
      }
   },
   mounted() {
      //console.log(this.value);
   },
   methods: {
      handleClick() {
         if(this.value == 1){
            this.$emit('input', 0)
         } else {
            this.$emit('input', 1)
         }
      }
   }
}
</script>