import { APP_PREFIX, STORAGE_KEYS } from "@/constants";

type ValueGuard<T> = (value: unknown) => value is T;

/**
 * JSON 存储；缺失、解析失败或校验失败时使用默认值。
 */
export class Storage {
  /**
   * 存储数据到 localStorage
   */
  static set(key: string, value: unknown): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  /**
   * 从 localStorage 获取数据
   */
  static get<T = unknown>(key: string): T | undefined;
  static get<T>(key: string, defaultValue: T, validate?: ValueGuard<T>): T;
  static get<T>(key: string, defaultValue?: T, validate?: ValueGuard<T>): T | undefined {
    return this.read(localStorage, key, defaultValue, validate);
  }

  /**
   * 从 localStorage 删除数据
   */
  static remove(key: string): void {
    localStorage.removeItem(key);
  }

  /**
   * 存储数据到 sessionStorage
   */
  static sessionSet(key: string, value: unknown): void {
    sessionStorage.setItem(key, JSON.stringify(value));
  }

  /**
   * 从 sessionStorage 获取数据
   */
  static sessionGet<T = unknown>(key: string): T | undefined;
  static sessionGet<T>(key: string, defaultValue: T, validate?: ValueGuard<T>): T;
  static sessionGet<T>(key: string, defaultValue?: T, validate?: ValueGuard<T>): T | undefined {
    return this.read(sessionStorage, key, defaultValue, validate);
  }

  /**
   * 读取 JSON 数据，解析或校验失败时返回默认值。
   */
  private static read<T>(
    storage: Pick<globalThis.Storage, "getItem">,
    key: string,
    defaultValue: T | undefined,
    validate?: ValueGuard<T>
  ): T | undefined {
    const raw = storage.getItem(key);
    if (raw === null) return defaultValue;
    try {
      const value: unknown = JSON.parse(raw);
      return !validate || validate(value) ? (value as T) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  /**
   * 从 sessionStorage 删除数据
   */
  static sessionRemove(key: string): void {
    sessionStorage.removeItem(key);
  }

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
   * 从本地与会话存储中移除指定前缀的键。
   */
  static clearByPrefix(prefix: string): void {
    const localKeys = Object.keys(localStorage).filter((key) => key.startsWith(prefix));
    localKeys.forEach((key) => localStorage.removeItem(key));

    const sessionKeys = Object.keys(sessionStorage).filter((key) => key.startsWith(prefix));
    sessionKeys.forEach((key) => sessionStorage.removeItem(key));
  }

  /**
   * 清理项目名前缀下的本地与会话存储。
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
