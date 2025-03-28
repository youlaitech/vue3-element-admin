<template>
  <div class="app-container">
    <el-row :gutter="24">
      <el-col :span="12">
        <el-card shadow="never">
          <template #header><span class="card-header">基础示例</span></template>
          <VueDraggable ref="el" v-model="userList" class="drag-container">
            <div v-for="item in userList" :key="item.name" class="drag-item">
              {{ item.name }}
            </div>
          </VueDraggable>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card shadow="never">
          <template #header><span class="card-header">过渡动画</span></template>
          <VueDraggable
            v-model="userList"
            target=".sort-target"
            :scroll="true"
            class="drag-container"
          >
            <TransitionGroup type="transition" tag="ul" name="fade" class="sort-target">
              <li v-for="item in userList" :key="item.name" class="drag-item">
                {{ item.name }}
              </li>
            </TransitionGroup>
          </VueDraggable>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never">
      <template #header><span class="card-header">表格拖拽排序</span></template>
      <VueDraggable v-model="userList" target="tbody" :animation="150">
        <el-table :data="userList" row-key="name">
          <el-table-column label="姓名" prop="name" />
          <el-table-column label="角色" prop="roles" />
        </el-table>
      </VueDraggable>
    </el-card>

    <el-card shadow="never">
      <template #header><span class="card-header">指定元素拖拽排序</span></template>
      <VueDraggable v-model="userList" target="tbody" handle=".handle" :animation="150">
        <el-table :data="userList" row-key="name">
          <el-table-column label="姓名" prop="name" />
          <el-table-column label="角色" prop="roles" />
          <el-table-column label="操作" width="100">
            <template #default>
              <el-button size="default" class="handle">移动</el-button>
            </template>
          </el-table-column>
        </el-table>
      </VueDraggable>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { VueDraggable } from "vue-draggable-plus";

const userList = ref([
  { name: "路飞", roles: "船长·格斗家·D之一族" },
  { name: "索隆", roles: "剑豪·战斗员·三刀流大师" },
  { name: "娜美", roles: "航海士·气象学家·财务官" },
  { name: "山治", roles: "厨师·格斗家·黑足" },
  { name: "罗宾", roles: "考古学家·历史正文解读者" },
]);
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;

  .el-card {
    margin-bottom: 20px;
    border-radius: 8px;
  }

  .card-header {
    font-size: 16px;
    font-weight: bold;
  }

  .drag-container {
    min-height: 200px;
  }

  .drag-item {
    padding: 12px;
    margin-bottom: 8px;
    font-weight: 500;
    text-align: center;
    cursor: grab;
    border-radius: 6px;
    transition: transform 0.2s ease-in-out;
  }

  .drag-item:active {
    cursor: grabbing;
    transform: scale(1.05);
  }
}

/* 过渡动画 */
.fade-move,
.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scaleY(0.01) translate(20px, 0);
}

.fade-leave-active {
  position: absolute;
}
</style>
