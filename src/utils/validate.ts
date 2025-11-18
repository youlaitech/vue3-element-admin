/**
 * 数据验证相关工具函数
 */

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

/**
 * 判断是否是邮箱地址
 * @param email 邮箱字符串
 * @returns 是否是有效邮箱
 */
export function isEmail(email: string): boolean {
  const pattern = /\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}/;
  return pattern.test(email);
}

/**
 * 判断是否是手机号码（中国大陆）
 * @param mobile 手机号字符串
 * @returns 是否是有效手机号
 */
export function isMobile(mobile: string): boolean {
  const pattern = /^1[3|4|5|6|7|8|9][0-9]\d{8}$/;
  return pattern.test(mobile);
}
