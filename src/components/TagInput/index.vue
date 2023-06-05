<template>
  <div :class="['tagInputarea', className]">
    <div
      ref="cmEle"
      :class="[
        'tagInputareaIuput',
        'ThemeBorderColor3',
        !!readonly ? 'readonlyBg' : '',
      ]"
    ></div>
  </div>
</template>
<script lang="ts" setup>
import CodeMirror from "codemirror";
import "codemirror/lib/codemirror.css";
import { getRePosFromStr, MODE } from "./util";

const props = defineProps({
  mode: {
    type: Number,
    default: MODE.TEXT,
  },
  className: {
    type: String,
    default: "",
  },
  defaultValue: {
    type: String,
    default: "",
    required: true,
  },
  renderTag: {
    type: Function,
    required: true,
  },
  minHeight: {
    type: Number,
    default: 20,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  noCursor: {
    type: Boolean,
    default: false,
  },
  operatorsSetMargin: {
    type: Boolean,
    default: false,
  },
  autoComma: {
    type: Boolean,
    default: false,
  },
  // 是否禁用复制
  disabledCopy: {
    type: Boolean,
    required: false,
    default: false,
  },
});
const emit = defineEmits(["onChange", "onBlur", "onFocus"]);
//编辑器挂载dom节点
const cmEle = ref();

//编辑器实例
let cmInstance: any = null;

onMounted(() => {
  if (cmEle.value) {
    //编辑器初始化
    cmInstance = CodeMirror(cmEle.value, {
      value: props.defaultValue,
      mode: "",
      lineWrapping: true,
      cursorHeight: props.noCursor || props.readonly ? 0 : 1,
    });
    //最小高度初始化
    if (props.minHeight) {
      let height =
        typeof props.minHeight === "number"
          ? `${props.minHeight}px`
          : props.minHeight;
      //编辑器高度
      cmInstance.setSize("100%", height);
      //编辑内容高度
      let codeEle = cmEle.value.getElementsByClassName("CodeMirror-code")[0];
      codeEle && codeEle.setAttribute("style", `min-height:${height}`);
    }
    //默认值初始化
    if (props.defaultValue) {
      updateTextareaView();
      cmInstance.execCommand("goDocEnd");
    }
    //监听 value change
    cmInstance.on("change", cmChange);
    //监听 value beforeChange
    cmInstance.on("beforeChange", cmBeforeChange);
    //监听表单聚焦
    cmInstance.on("focus", () => {
      cmEle.value.classList.add("active");
      cmFocus();
    });

    //监听表单失焦
    cmInstance.on("blur", () => {
      if (cmEle.value) {
        cmEle.value.classList.remove("active");
      }
      cmBlur();
    });
    if (props.disabledCopy) {
      // 禁止复制，防止tag复制的是id
      cmInstance.on("copy", (cm: any, e: Event) => {
        e.preventDefault();
      });
    }
  }
});

//编辑器change
const cmChange = (cm: any, obj: any): void => {
  let value = cm.getValue();
  if (obj.origin !== "setValue") {
    emit("onChange", null, value, obj);
  }

  updateTextareaView();
};

//编辑器beforeChange
const cmBeforeChange = (cm: any, obj: any): any => {
  let { text } = obj;
  // 如果是自定义公式，只能允许数字+、-、*、/、( \ ) , .,大写字符
  if (
    props.mode === MODE.FORMULA &&
    (obj.origin === "paste" ||
      obj.origin === "+input" ||
      obj.origin === "*compose")
  ) {
    text = text.map((t: string) =>
      t.replace(/[^+\-*\/0-9/a-z/A-Z\(\)\,\.]/gm, "").toUpperCase()
    );
    // 最大输入10000字符
    if (text.map((t: string) => t).join("").length > 10000) {
      text = text
        .map((t: string) => t)
        .join("")
        .slice(0, 10000)
        .split(",");
      obj.update(obj.from, obj.to, text);
      obj.cancel();
    }
  }

  if (obj.origin === "undo" || obj.origin === "redo") {
    return;
  }
  // 事件内，mode只能从每次props取，不然取不到最新
  if (
    props.readonly ||
    (props.mode === MODE.ONLYTAG &&
      obj.origin !== "+delete" &&
      obj.origin !== "inserttag" &&
      obj.origin !== "setValue")
  ) {
    obj.cancel();
  }

  // 事件内，mode只能从每次props取，不然取不到最新
  if (
    props.mode === MODE.FORMULA &&
    obj.origin !== "+delete" &&
    obj.origin !== "inserttag" &&
    obj.origin !== "setValue"
  ) {
    text = text.map((t: any) =>
      t
        .toUpperCase()
        .split("")
        .filter((t: any) =>
          (obj.origin === "paste"
            ? /[0-9A-Z\+\-\*\/\(\)\,\.\$]/
            : /[0-9A-Z\+\-\*\/\(\)\,\.]/
          ).test(t)
        )
        .join("")
    );
  }
  if (
    props.mode === MODE.DATE &&
    obj.origin !== "+delete" &&
    obj.origin !== "inserttag" &&
    obj.origin !== "setValue"
  ) {
    text = text.map((t: any) =>
      t
        .split("")
        .filter((t: any) =>
          (obj.origin === "paste" ? /[0-9YMdhm\+\-\$]/ : /[0-9YMdhm\+\-]/).test(
            t
          )
        )
        .join("")
    );
  }
  obj.update(obj.from, obj.to, text);
};

//编辑器 foucus
const cmFocus = (): void => {
  emit("onFocus");
};

//编辑器 blur
const cmBlur = (): void => {
  emit("onBlur");
};

//设置 value
const setValue = (value: string): void => {
  // const position = cmInstance.getCursor()
  cmInstance.setValue(value || "");
  // const newPosition = {
  //     line: position.line,
  //     ch: position.ch + value.length - 2,
  // }

  // cmInstance.focus()
  // cmInstance.setCursor(newPosition)
  // cmInstance.execCommand('goDocEnd')
};
const getValue = () => {
  return cmInstance.getValue();
};
//回显，更新渲染
let markers: any = null;
const updateTextareaView = () => {
  const { mode, operatorsSetMargin } = props;
  const value = cmInstance.getValue();
  if (markers) {
    markers.forEach((marker: any) => marker.clear());
  }
  markers = [];
  markColumns(markers, value);
  if (mode === MODE.FORMULA || operatorsSetMargin) {
    markOperators(markers, value);
  }
};

//光标行
const markColumns = (markers: any, value: any) => {
  const poss = getRePosFromStr(value);
  poss.forEach((pos: any, i: number) => {
    renderColumnTag(pos.tag, { isLast: i === poss.length - 1 }, (node: any) => {
      markers.push(
        cmInstance.markText(
          { line: pos.line, ch: pos.start },
          { line: pos.line, ch: pos.stop },
          { replacedWith: node, handleMouseEvents: true }
        )
      );
    });
  });
};

//光标操作
const markOperators = (markers: any, value: any) => {
  const poss = getRePosFromStr(value, /\+|\-|\*|\/|\(|\)|,/g);
  poss.forEach((pos: any, i: number) => {
    const operatorEle = document.createElement("span");
    operatorEle.classList.add("operator");
    operatorEle.innerHTML = pos.tag;
    markers.push(
      cmInstance.markText(
        { line: pos.line, ch: pos.start },
        { line: pos.line, ch: pos.stop },
        { replacedWith: operatorEle, handleMouseEvents: true }
      )
    );
  });
};

//渲染 tag
const renderColumnTag = (id: any, options: any, cb: any) => {
  const node = document.createElement("div");
  node.classList.add("columnTagCon");
  //自定义渲染tag
  if (props.renderTag) {
    const tag = props.renderTag(id, options);
    if (tag instanceof HTMLElement) {
      node.appendChild(tag);
      cb(node);
      return;
    }
  }
  node.append(id);
  cb(node);
  return;
};

//插入 tag
const insertColumnTag = (id: string) => {
  const { mode, autoComma } = props;
  const position = cmInstance.getCursor();
  const editorValue = cmInstance.getValue();

  cmInstance.replaceRange(
    `${
      mode === MODE.FORMULA && autoComma && editorValue[position.ch - 1] === "$"
        ? ","
        : ""
    }$${id}$`,
    position,
    undefined,
    "inserttag"
  );
  cmInstance.focus();
  cmInstance.execCommand("goDocEnd");
  if (cmEle.value) {
    cmEle.value.scrollTop = cmEle.value.scrollHeight - cmEle.value.clientHeight;
  }
};
// 获取光标位置
const getCursor = () => {
  return cmInstance.getCursor();
};
// 设置光标位置
const setCustomCursor = (position: { line: number; ch: number }) => {
  cmInstance.setCursor(position);
};
// 插入公式
const insertFormula = (value: string) => {
  const { mode, autoComma } = props;
  const position = cmInstance.getCursor();

  cmInstance.replaceRange(value, position, undefined, "insertFormula");
  setTimeout(() => {
    const newPosition = {
      line: position.line,
      ch: position.ch + value.length - 2,
    };

    cmInstance.focus();
    cmInstance.setCursor(newPosition);
    // cmInstance.execCommand('goDocEnd')
  }, 0);
  if (cmEle.value) {
    cmEle.value.scrollTop = cmEle.value.scrollHeight - cmEle.value.clientHeight;
  }
};
defineExpose({
  insertColumnTag,
});
</script>

<style lang="scss" scoped>
.tagInputarea {
  min-width: 0;
  :deep {
    .tagInputareaIuput {
      border-radius: 3px;
      border: 1px solid #409eff;
      overflow: auto;

      &:not(.active) {
        border-color: #ccc !important;
      }
      // &.hasRightIcon {
      //   border-radius: 3px 0 0 3px;
      // }
      &.readonlyBg {
        .CodeMirror {
          background-color: #eee !important;
        }
      }
    }
    // .rightIcon {
    //   background-color: #f5f5f5;
    //   font-size: 20px;
    //   color: #757575;
    //   height: 34px;
    //   line-height: 33px;
    //   padding: 0 7px;
    //   border: 1px solid #ccc;
    //   border-left: none;
    //   border-radius: 0 3px 3px 0;
    // }
    .CodeMirror {
      font-family: inherit !important;
      box-sizing: border-box;
      height: auto !important;

      .CodeMirror-vscrollbar {
        display: none !important;
      }

      // .CodeMirror-scroll {
      //     height: auto;
      //     overflow-y: hidden;
      //     overflow-x: auto;
      // }

      .CodeMirror-lines {
        padding: 6px 0;
        min-height: 35px;
      }
      .CodeMirror-line {
        padding: 0 10px;
      }
      .columnTagCon {
        position: relative;
        display: inline-flex;
        // box-sizing: border-box;
        // padding: 2px 4px;
        // max-width: 100%;
        // background: #d8eeff;
        // color: #174c76;
        // border: 1px solid #bbd6ea;
        // border-radius: 5px;
      }
      .columnTag {
        position: relative;
        display: inline-flex;
        box-sizing: border-box;
        cursor: pointer;
        height: 24px;
        font-size: 12px;
        border: 1px solid #90caf9;
        border-radius: 24px;
        .columnName,
        .columnValue {
          display: inline-block;
          height: 22px;
          line-height: 22px;
          padding: 0 10px;
          overflow: hidden;
        }
        .columnName {
          color: #2196f3;
          background-color: rgba(33, 150, 243, 0.06);
        }
        .columnValue {
          color: #fff;
          border-radius: 0 22px 22px 0;
          background-color: #249eff;
          .ellipsis {
            max-width: 9em;
          }
        }
        &.onlytag {
          margin-right: 6px;
          &:after {
            content: ",";
            position: absolute;
            right: -6px;
            top: 6px;
          }
        }
        &.deleted {
          border-color: #f44336;
          .columnName {
            color: #f44336;
            background-color: rgba(244, 67, 54, 0.06);
          }
          &:hover {
            border-color: #f44336;
            .columnName {
              color: #f44336;
              background-color: rgba(244, 67, 54, 0.12);
            }
          }
        }
        &:hover {
          border-color: #ddd;
          .columnName {
            color: #9e9e9e;
            background-color: rgba(158, 158, 158, 0.06);
          }
          .columnValue {
            background-color: #bdbdbd;
          }
        }
      }
      .operator {
        margin: 0 4px;
      }
    }
  }
}
</style>
