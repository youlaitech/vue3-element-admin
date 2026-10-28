/**
 * 声明 Flowable 扩展属性，使 bpmn-js 读写时保留这些属性。
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
