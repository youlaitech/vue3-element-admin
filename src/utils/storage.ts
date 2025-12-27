import { STORAGE_KEYS, APP_PREFIX } from "@/constants";

/**
 * 存储工具类
 *
 * @description
 * 提供 localStorage 和 sessionStorage 的统一操作接口
 * 支持自动 JSON 序列化/反序列化
 *
 * @author 有来技术团队
 */
export class Storage {
  // ==================== localStorage 操作 ====================

  /**
   * 存储数据到 localStorage
   */
  static set(key: string, value: any): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  /**
   * 从 localStorage 获取数据
   */
  static get<T>(key: string, defaultValue?: T): T {
    const value = localStorage.getItem(key);
    if (!value) return defaultValue as T;

    try {
      return JSON.parse(value);
    } catch {
      // 如果解析失败，返回原始字符串
      return value as unknown as T;
    }
  }

  /**
   * 从 localStorage 删除数据
   */
  static remove(key: string): void {
    localStorage.removeItem(key);
  }

  // ==================== sessionStorage 操作 ====================

  /**
   * 存储数据到 sessionStorage
   */
  static sessionSet(key: string, value: any): void {
    sessionStorage.setItem(key, JSON.stringify(value));
  }

  /**
   * 从 sessionStorage 获取数据
   */
  static sessionGet<T>(key: string, defaultValue?: T): T {
    const value = sessionStorage.getItem(key);
    if (!value) return defaultValue as T;

    try {
      return JSON.parse(value);
    } catch {
      // 如果解析失败，返回原始字符串
      return value as unknown as T;
    }
  }

  /**
   * 从 sessionStorage 删除数据
   */
  static sessionRemove(key: string): void {
    sessionStorage.removeItem(key);
  }

  // ==================== 批量清理操作 ====================

  /**
   * 清理指定键的存储（localStorage + sessionStorage）
   */
  static clear(key: string): void {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  }

  /**
   * 批量清理存储
   */
  static clearMultiple(keys: string[]): void {
    keys.forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
  }

  /**
   * 清理指定前缀的存储
   *
   * @example
   * ```ts
   * // 清理所有认证相关的存储
   * Storage.clearByPrefix('vea:auth:');
   * ```
   */
  static clearByPrefix(prefix: string): void {
    // localStorage 清理
    const localKeys = Object.keys(localStorage).filter((key) => key.startsWith(prefix));
    localKeys.forEach((key) => localStorage.removeItem(key));

    // sessionStorage 清理
    const sessionKeys = Object.keys(sessionStorage).filter((key) => key.startsWith(prefix));
    sessionKeys.forEach((key) => sessionStorage.removeItem(key));
  }

  /**
   * 清理所有项目相关的存储
   *
   * @description
   * 清理所有以 APP_PREFIX 开头的存储项
   */
  static clearAllProject(): void {
    this.clearByPrefix(`${APP_PREFIX}:`);
  }

  /**
   * 获取所有项目相关的存储键
   */
  static getAllProjectKeys(): string[] {
    return Object.values(STORAGE_KEYS);
  }
}
