<template>
  <div class="component-container">
    <el-card class="box-card" shadow="always">
      <el-row>
        <el-col :span="12">
          <el-tag type="success" v-if="category && category.name"
            >{{ category.name }} {{ attributeTypeName }}
          </el-tag>
          <el-tag v-else type="info"
            ><i class="el-icon-info"></i> 请选择商品分类</el-tag
          >
        </el-col>
        <el-col :span="12" style="text-align: right">
          <el-button type="primary" :icon="Check" @click="submitForm"
            >提交</el-button
          >
        </el-col>
      </el-row>

      <el-row style="margin-top: 10px">
        <el-form
          ref="form"
          :model="formData"
          :disabled="category?.childrenLen > 0"
          label-width="100"
        >
          <el-form-item
            v-for="(item, index) in formData.attributes"
            :key="index"
            :label="attributeTypeName + (index + 1)"
            :prop="'attributes.' + index + '.name'"
            :rules="rules.attribute.name"
          >
            <el-input v-model="item.name" style="width: 300px" />

            <el-button
              v-if="index === 0"
              type="success"
              :icon="Plus"
              circle
              plain
              @click.prevent="handleAdd()"
              style="margin-left: 15px"
            />

            <el-button
              type="danger"
              :icon="Delete"
              plain
              circle
              @click.prevent="handleDelete(index)"
              style="margin-left: 15px"
            />
          </el-form-item>
        </el-form>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, toRefs, watch } from 'vue';
import { listAttributes, saveAttributeBatch } from '@/api/pms/attribute';
import { Plus, Check, Delete } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const props = defineProps({
  attributeType: {
    type: Number,
    default: 1,
  },
  category: {
    type: Object,
    default: () => {
      return {
        id: undefined,
        name: '',
        childrenLen: 0,
      };
    },
  },
});

const attributeTypeName = computed(() =>
  props.attributeType === 1 ? '规格' : '属性'
);

const attributeNameValidator = (rule: any, value: any, callback: any) => {
  if (!value) {
    return callback(new Error('请输入' + attributeTypeName.value + '名称'));
  } else {
    callback();
  }
};

const state = reactive({
  formData: {
    categoryId: undefined,
    type: 1,
    attributes: [
      {
        id: undefined,
        name: '',
      },
    ],
  },
  rules: {
    attribute: {
      name: [
        { required: true, validator: attributeNameValidator, trigger: 'blur' },
      ],
    },
  },
});

const { formData, rules } = toRefs(state);

watch(
  () => props.category.id as any,
  () => {
    const categoryId = props.category.id;
    if (categoryId) {
      listAttributes({
        categoryId: categoryId,
        type: props.attributeType,
      }).then((response) => {
        const { data } = response;
        if (data && data.length > 0) {
          state.formData.attributes = response.data;
        } else {
          state.formData.attributes = [
            {
              id: undefined,
              name: '',
            },
          ];
        }
      });
    } else {
      state.formData.attributes = [
        {
          id: undefined,
          name: '',
        },
      ];
    }
  }
);

function handleAdd() {
  state.formData.attributes.push({
    id: undefined,
    name: '',
  });
}

function handleDelete(index: number) {
  if (state.formData.attributes.length == 1) {
    state.formData.attributes = [
      {
        id: undefined,
        name: '',
      },
    ];
    return;
  }
  state.formData.attributes.splice(index, 1);
}

function submitForm() {
  state.formData.categoryId = props.category.id;
  state.formData.type = props.attributeType;
  saveAttributeBatch(state.formData).then(() => {
    ElMessage.success('提交成功');
  });
}
</script>

<style scoped>
.component-container {
  margin-bottom: 20px;
}
</style>
