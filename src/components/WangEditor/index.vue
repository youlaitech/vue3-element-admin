<template>
  <div>
    <div v-if="isEditorShow" style="border: 1px solid #ccc">
      <Toolbar
          :editorId="editorId"
          :defaultConfig="toolbarConfig"
          style="border-bottom: 1px solid #ccc"
      />
      <Editor
          :editorId="editorId"
          :defaultConfig="editorConfig"
          style="height: 500px"
      />
    </div>
    <p v-else>loading</p>
  </div>
</template>

<script setup>
import {onBeforeUnmount, reactive, ref, toRefs} from 'vue'
import {Editor, Toolbar, getEditor, removeEditor} from '@wangeditor/editor-for-vue'
import {uploadFile} from "@/api/system/file";

const state =reactive({
  editorId : `w-e-${Math.random().toString().slice(-5)}`, //【注意】编辑器 id ，要全局唯一
  toolbarConfig : {},
  isEditorShow : true,
  editorConfig : {
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
  }
})

const {isEditorShow,editorId,toolbarConfig,editorConfig}  =toRefs(state)

onBeforeUnmount(() => {
  const editor = getEditor(state.editorId)
  if (editor == null) return
  editor.destroy()
  removeEditor(state.editorId)
})

</script>

<style src="@wangeditor/editor/dist/css/style.css"></style>