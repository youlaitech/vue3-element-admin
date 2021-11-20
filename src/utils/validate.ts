/**
 * Created by PanJiaChen on 16/11/18.
 */

/**
 * @param {string} path
 * @returns {Boolean}
 */
export function isExternal(path : string) {
  return /^(https?:|mailto:|tel:)/.test(path)
}

