<template>
  <div style="padding: 30px">
    <el-alert :closable="false" title="菜单二级" type="success">
      <router-view />
    </el-alert>
  </div>
</template>
