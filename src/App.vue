<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>
<style>
/*表格未对齐*/
.el-table__header col[name="gutter"] {
  display: table-cell !important;
}
</style>

