<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'app'
}
</script>

<style lang="scss">
@import '~@/assets/style/public-class.scss';
.flex{display:flex;}
.flexv{display:flex;flex-direction:column;}  /*垂直排列*/
.flexitem{display:flex;flex-grow:1;}
.flexitemv{display:flex;flex-direction:column;flex-grow:1;}
.center{justify-content:center;align-items:center;}
.centerv{align-items:center;}  /*垂直居中*/
.centerh{justify-content:center;}  /*水平居中*/
.endh{justify-content:flex-end;}  /*水平向右*/
.endv{align-items:flex-end;} /*垂直向下*/
.end{justify-content:flex-end;align-items:flex-end;}
.between{justify-content:space-between;align-items:center;} /*水平两端对齐*/
.aroundh{justify-content:space-around;align-items:center;}  /*水平等间距*/
.aroundv{flex-direction:column;justify-content:space-around;} /*垂直等间距*/
.cross{flex-direction:column;justify-content:space-between;}  /*垂直对齐两端*/
.crossc{flex-direction:column;justify-content:space-between;align-items:center;}  /*垂直对齐两端居中*/
.cross-end{flex-direction:column;justify-content:space-between;align-items:flex-end;}  /*垂直对齐两端靠右*/
.br{flex-wrap:wrap;}  /*换行*/
.unbr{flex-wrap:nowrap} /*不换行*/
.wrap{height:100%;}
.fitimg{width:100%;height:100%;object-fit:cover;}
.radimg{width:100%;height:100%;border-radius:50%;object-fit:cover;}
/*.demo-form-inline .el-form-item{margin-bottom:0}*/
</style>
