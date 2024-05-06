<template>
  <div class="editor-wrapper">
    <!-- 工具栏 -->
    <Toolbar
      id="toolbar-container"
      :editor="editorRef"
      :default-config="toolbarConfig"
      :mode="mode"
    />
    <!-- 编辑器 -->
    <Editor
      id="editor-container"
      v-model="modelValue"
      :default-config="editorConfig"
      :mode="mode"
      @on-change="handleChange"
      @on-created="handleCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { Editor, Toolbar } from "@wangeditor/editor-for-vue";

// API 引用
import FileAPI from "@/api/file";

const props = defineProps({
  modelValue: {
    type: [String],
    default: "",
  },
});

const emit = defineEmits(["update:modelValue"]);

const modelValue = useVModel(props, "modelValue", emit);

const editorRef = shallowRef(); // 编辑器实例，必须用 shallowRef
const mode = ref("default"); // 编辑器模式
const toolbarConfig = ref({}); // 工具条配置
// 编辑器配置
const editorConfig = ref({
  placeholder: "请输入内容...",
  MENU_CONF: {
    uploadImage: {
      // 自定义图片上传
      async customUpload(file: any, insertFn: any) {
        FileAPI.upload(file).then((data) => {
          insertFn(data.url);
        });
      },
    },
  },
});

const handleCreated = (editor: any) => {
  editorRef.value = editor; // 记录 editor 实例，重要！
};

function handleChange(editor: any) {
  modelValue.value = editor.getHtml();
}

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value;
  if (editor == null) return;
  editor.destroy();
});
</script>

<style src="@wangeditor/editor/dist/css/style.css"></style>
