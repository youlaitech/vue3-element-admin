<template>
  <div class="page-container">
    <!-- 顶部工具栏：数据源管理 -->
    <div class="ds-toolbar">
      <el-button type="primary" @click="dsManageVisible = true">
        <el-icon><Coin /></el-icon>
        数据源管理
      </el-button>
      <el-button @click="addTableVisible = true">
        <el-icon><Plus /></el-icon>
        添加表
      </el-button>
    </div>

    <TableList ref="tableListRef" @generate="handleOpenDrawer" @reset-config="handleResetConfig" />

    <!-- 数据源管理大对话框 -->
    <el-dialog v-model="dsManageVisible" title="数据源管理" width="900px" align-center>
      <div class="ds-manage__toolbar">
        <el-button type="primary" @click="openAddDataSource">
          <el-icon><Plus /></el-icon>
          添加数据源
        </el-button>
      </div>
      <el-table :data="dataSourceList" border stripe max-height="55vh">
        <el-table-column type="index" label="#" width="55" align="center" />
        <el-table-column label="名称" prop="name" min-width="140" />
        <el-table-column label="代号" prop="code" width="140" />
        <el-table-column label="类型" prop="type" width="140" align="center">
          <template #default="{ row }">
            <el-tag size="small">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="服务器/IP" prop="host" min-width="160" />
        <el-table-column label="端口" prop="port" width="90" align="center" />
        <el-table-column label="用户名" prop="username" width="120" />
        <el-table-column label="操作" width="120" align="center">
          <template #default>
            <el-button type="danger" size="small" link>删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- 添加数据源对话框 -->
    <el-dialog v-model="addDsVisible" title="添加数据源" width="520px" align-center>
      <el-form :model="addDsForm" :label-width="90">
        <el-form-item label="名称">
          <el-input v-model="addDsForm.name" placeholder="请输入数据源名称" />
        </el-form-item>
        <el-form-item label="代号">
          <el-input v-model="addDsForm.code" placeholder="请输入数据源代号" />
        </el-form-item>
        <el-form-item label="数据源类型">
          <el-select v-model="addDsForm.type" placeholder="请选择数据源类型" style="width: 100%">
            <el-option
              v-for="item in dataSourceTypeOptions"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="addDsForm.type === 'SQLite' ? '文件名' : '服务器/IP'">
          <el-input
            v-model="addDsForm.host"
            :placeholder="
              addDsForm.type === 'SQLite' ? '请输入数据库文件名' : '请输入服务器地址或 IP'
            "
          />
        </el-form-item>
        <el-form-item label="端口">
          <el-input-number v-model="addDsForm.port" :min="1" :max="65535" style="width: 100%" />
        </el-form-item>
        <el-form-item label="用户名">
          <el-input v-model="addDsForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input
            v-model="addDsForm.password"
            type="password"
            show-password
            placeholder="请输入密码"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDsVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmAddDataSource">确认</el-button>
      </template>
    </el-dialog>

    <!-- 添加表对话框 -->
    <el-dialog v-model="addTableVisible" title="添加表" width="520px" align-center>
      <el-form :model="addTableForm" :label-width="90">
        <el-form-item label="表名称">
          <el-input v-model="addTableForm.tableName" placeholder="请输入表名称" />
        </el-form-item>
        <el-form-item label="数据源">
          <el-select
            v-model="addTableForm.dataSourceId"
            placeholder="请选择数据源"
            style="width: 100%"
          >
            <el-option
              v-for="item in dataSourceList"
              :key="item.id"
              :label="`${item.name}(${item.type})`"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addTableVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmAddTable">确定</el-button>
      </template>
    </el-dialog>

    <GeneratorDrawer ref="drawerRef" v-model:visible="drawerVisible" :title="drawerTitle" />
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "Codegen" });

import TableList from "./components/TableList.vue";
import GeneratorDrawer from "./components/GeneratorDrawer.vue";

// 输出 VITE_API_TYPE 环境变量

const drawerVisible = ref(false);
const drawerTitle = ref("");
const drawerRef = ref();
const tableListRef = ref();

// ── 数据源管理 ──────────────────────────────────────────
/** 数据源管理对话框可见性 */
const dsManageVisible = ref(false);
/** 数据源类型选项 */
const dataSourceTypeOptions = ["MySQL", "PostgreSQL", "Oracle", "SQL Server", "SQLite"];
/** 数据源列表（暂无接口，先用占位示例） */
const dataSourceList = ref([
  {
    id: 1,
    name: "本地开发库",
    code: "local",
    type: "MySQL",
    host: "127.0.0.1",
    port: 3306,
    username: "root",
  },
  {
    id: 2,
    name: "生产库",
    code: "prod",
    type: "PostgreSQL",
    host: "192.168.1.10",
    port: 5432,
    username: "postgres",
  },
  {
    id: 3,
    name: "本地文件库",
    code: "file",
    type: "SQLite",
    host: "data/app.db",
    port: 0,
    username: "",
  },
]);

/** 添加数据源对话框可见性 */
const addDsVisible = ref(false);
/** 添加数据源表单 */
const addDsForm = ref({
  name: "",
  code: "",
  type: "MySQL",
  host: "",
  port: 3306,
  username: "",
  password: "",
});

/** 打开添加数据源对话框 */
function openAddDataSource() {
  addDsForm.value = {
    name: "",
    code: "",
    type: "MySQL",
    host: "",
    port: 3306,
    username: "",
    password: "",
  };
  addDsVisible.value = true;
}

/** 确认添加数据源（暂无接口，仅提示） */
function handleConfirmAddDataSource() {
  addDsVisible.value = false;
  ElMessage.info("添加数据源功能正在完成中");
}

// ── 添加表 ──────────────────────────────────────────────
/** 添加表对话框可见性 */
const addTableVisible = ref(false);
/** 添加表表单 */
const addTableForm = ref({
  tableName: "",
  dataSourceId: undefined as number | undefined,
});

/** 确认添加表（暂无接口，仅提示） */
function handleConfirmAddTable() {
  addTableVisible.value = false;
  ElMessage.info("添加表功能正在完成中");
}

function handleOpenDrawer(tableName: string) {
  drawerTitle.value = `${tableName} 代码生成`;
  drawerVisible.value = true;
  nextTick(() => {
    drawerRef.value?.open(tableName);
  });
}

function handleResetConfig(tableName: string) {
  tableListRef.value?.handleResetConfig(tableName);
}
</script>
