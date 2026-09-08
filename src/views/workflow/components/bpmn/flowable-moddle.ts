/**
 * Flowable 命名空间 moddle 描述符
 *
 * 为 bpmn-js 扩展 flowable:formKey / flowable:assignee 等自定义属性，
 * 设计器属性面板可读写、XML 序列化保留 flowable: 前缀，供引擎解析
 */
const flowableModdleDescriptor = {
  name: "Flowable",
  uri: "http://flowable.org/bpmn",
  prefix: "flowable",
  xml: {
    tagAlias: "lowerCase",
  },
  types: [
    {
      name: "FlowableAttributes",
      isAbstract: true,
      extends: ["bpmn:FlowNode"],
      properties: [
        { name: "formKey", isAttr: true, type: "String" },
        { name: "assignee", isAttr: true, type: "String" },
        { name: "candidateUsers", isAttr: true, type: "String" },
        { name: "candidateGroups", isAttr: true, type: "String" },
      ],
    },
  ],
};

export default flowableModdleDescriptor;
