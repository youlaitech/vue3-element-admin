declare global {
  /**
   * 分页查询参数
   */
  interface PageQuery {
    pageNum: number;
    pageSize: number;
  }

  /**
   * 分页响应对象
   */
  interface PageResult<T> {
    /**
     * 数据列表
     */
    list: T;
    /**
     * 数据总数
     */
    total: number;
  }

  /**
   * 弹窗属性
   */
  interface DialogOption {
    /**
     * 弹窗标题
     */
    title?: string;
    /**
     * 是否显示
     */
    visible: boolean;
  }
  /**
   * 组件数据源
   */
  interface OptionType {
    /**
     * 值
     */
    value: number;
    /**
     * 文本
     */
    label: string;
    /**
     * 子列表
     */
    children?: OptionType[];
  }
}
export {};
