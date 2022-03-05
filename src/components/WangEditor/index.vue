<!--
  author: haoxr
  link: https://www.wangeditor.com/v5/guide/for-frame.html#vue3
-->
<template>
  <div style="border: 1px solid #ccc">
    <!-- 工具栏 -->
    <Toolbar
        :editorId="editorId"
        :defaultConfig="toolbarConfig"
        style="border-bottom: 1px solid #ccc"
    />
    <!-- 编辑器 -->
    <Editor
        :editorId="editorId"
        :defaultConfig="editorConfig"
        :defaultHtml="defaultHtml"
        @onChange="handleChange"
        style="height: 500px; overflow-y: hidden;"
    />
  </div>
</template>

<script setup>
import {computed, onBeforeUnmount, reactive, toRefs} from 'vue'
import {Editor, Toolbar, getEditor, removeEditor} from '@wangeditor/editor-for-vue'

// API 引用
import {uploadFile} from "@/api/system/file";

const props = defineProps({
  modelValue: {
    type: [String],
    default: ''
  },
})

const emit = defineEmits(['update:modelValue']);

const modelValue = computed({
  get: () => {
    return props.modelValue
  },
  set: (val) => {
    emit('update:modelValue', val)
  }
});

const state = reactive({
  editorId: `w-e-${Math.random().toString().slice(-5)}`, //【注意】编辑器 id ，要全局唯一
  toolbarConfig: {},
  editorConfig: {
    placeholder: '请输入内容...',
    MENU_CONF: {
      uploadImage: {
        // 自定义图片上传
        // @link https://www.wangeditor.com/v5/guide/menu-config.html#%E8%87%AA%E5%AE%9A%E4%B9%89%E5%8A%9F%E8%83%BD
        async customUpload(file, insertFn) {
          uploadFile(file).then(response => {
            const url = response.data
            insertFn(url)
          })
        }
      }
    }
  },
  defaultHtml: props.modelValue
})

const {editorId, toolbarConfig, editorConfig,defaultHtml} = toRefs(state)

function handleChange(editor) {
  modelValue.value = editor.getHtml()
}

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
  const editor = getEditor(state.editorId)
  if (editor == null) return
  editor.destroy()
  removeEditor(state.editorId)
})

</script>

<style src="@wangeditor/editor/dist/css/style.css"></style>