<template>
  <div>
    <div v-if="isEditorShow" style="border: 1px solid #ccc">
      <Toolbar
          :editorId="editorId"
          :defaultConfig="toolbarConfig"
          :mode="mode"
          style="border-bottom: 1px solid #ccc"
      />
      <Editor
          :editorId="editorId"
          :defaultConfig="editorConfig"
          :mode="mode"
          style="height: 500px"
          @onCreated="handleCreated"
          @onChange="handleChange"
          @onDestroyed="handleDestroyed"
          @onFocus="handleFocus"
          @onBlur="handleBlur"
          @customAlert="customAlert"
          @customPaste="customPaste"
      />
    </div>
    <p v-else>loading</p>
  </div>
</template>

<script>
import {computed, onBeforeUnmount, ref} from 'vue'
import {Editor, Toolbar, getEditor, removeEditor} from '@wangeditor/editor-for-vue'
import {uploadFile} from "@/api/system/file";

export default {
  components: {Editor, Toolbar},
  setup() {
    const editorId = `w-e-${Math.random().toString().slice(-5)}` //【注意】编辑器 id ，要全局唯一
    const toolbarConfig = {}
    const isEditorShow = ref(true)
    const editorConfig = {
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
    // 组件销毁时，也及时销毁编辑器
    onBeforeUnmount(() => {
      const editor = getEditor(editorId)
      if (editor == null) return
      editor.destroy()
      removeEditor(editorId)
    })
    // 编辑器回调函数
    const handleCreated = (editor) => {
      console.log('created', editor);
    }
    const handleChange = (editor) => {
      console.log('change:', editor.children);
    }
    const handleDestroyed = (editor) => {
      console.log('destroyed', editor)
    }
    const handleFocus = (editor) => {
      console.log('focus', editor)
    }
    const handleBlur = (editor) => {
      console.log('blur', editor)
    }
    const customAlert = (info, type) => {
      alert(`【自定义提示】${type} - ${info}`)
    }
    const customPaste = (editor, event, callback) => {
      console.log('ClipboardEvent 粘贴事件对象', event)
      // 自定义插入内容
      editor.insertText('xxx')
      // 返回值（注意，vue 事件的返回值，不能用 return）
      callback(false) // 返回 false ，阻止默认粘贴行为
      // callback(true) // 返回 true ，继续默认的粘贴行为
    }
    const insertText = () => {
      const editor = getEditor(editorId)
      if (editor == null) return
      editor.insertText('hello world')
    }
    return {
      editorId,
      mode: 'default',
      toolbarConfig,
      editorConfig,
      isEditorShow,
      handleCreated,
      handleChange,
      handleDestroyed,
      handleFocus,
      handleBlur,
      customAlert,
      customPaste,
      insertText
    };
  }
}
</script>

<style src="@wangeditor/editor/dist/css/style.css"></style>