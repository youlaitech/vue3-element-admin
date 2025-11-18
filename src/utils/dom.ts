/**
 * DOM 操作相关工具函数
 */

/**
 * 检查元素是否包含指定 class
 * @param ele HTML 元素
 * @param cls class 名称
 * @returns 是否包含
 *
 * @example
 * ```ts
 * const hasActiveClass = hasClass(element, 'active');
 * ```
 */
export function hasClass(ele: HTMLElement, cls: string): boolean {
  return !!ele.className.match(new RegExp("(\\s|^)" + cls + "(\\s|$)"));
}

/**
 * 为元素添加 class
 * @param ele HTML 元素
 * @param cls class 名称
 *
 * @example
 * ```ts
 * addClass(element, 'active');
 * ```
 */
export function addClass(ele: HTMLElement, cls: string): void {
  if (!hasClass(ele, cls)) {
    ele.className += " " + cls;
  }
}

/**
 * 从元素移除 class
 * @param ele HTML 元素
 * @param cls class 名称
 *
 * @example
 * ```ts
 * removeClass(element, 'active');
 * ```
 */
export function removeClass(ele: HTMLElement, cls: string): void {
  if (hasClass(ele, cls)) {
    const reg = new RegExp("(\\s|^)" + cls + "(\\s|$)");
    ele.className = ele.className.replace(reg, " ");
  }
}
