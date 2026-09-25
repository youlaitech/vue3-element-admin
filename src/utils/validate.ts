// 数据验证相关工具函数

/**
 * 判断是否是外部链接
 * @param path 路径字符串
 * @returns 是否是外部链接
 *
 * @example
 * ```ts
 * isExternal('https://example.com'); // true
 * isExternal('/dashboard'); // false
 * isExternal('mailto:admin@example.com'); // true
 * ```
 */
export function isExternal(path: string): boolean {
  return /^(https?:|http?:|mailto:|tel:)/.test(path);
}

/**
 * 判断是否是有效的 URL
 * @param url URL 字符串
 * @returns 是否是有效 URL
 *
 * @example
 * ```ts
 * isValidURL('https://example.com'); // true
 * isValidURL('not a url'); // false
 * ```
 */
export function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
