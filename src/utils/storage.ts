/**
 * 存储工具类
 * 提供localStorage和sessionStorage操作方法
 */
export class Storage {
  /**
   * localStorage 存储
   */
  static set(key: string, value: any): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  static get<T>(key: string, defaultValue?: T): T {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : defaultValue;
  }

  static remove(key: string): void {
    localStorage.removeItem(key);
  }

  /**
   * sessionStorage 存储
   */
  static sessionSet(key: string, value: any): void {
    sessionStorage.setItem(key, JSON.stringify(value));
  }

  static sessionGet<T>(key: string, defaultValue?: T): T {
    const value = sessionStorage.getItem(key);
    return value ? JSON.parse(value) : defaultValue;
  }

  static sessionRemove(key: string): void {
    sessionStorage.removeItem(key);
  }
}
