const DEFAULT_CACHE_EXPIRY_TIME = 5 * 60 * 1000; // 默认缓存有效期为5分钟

/**
 * 通用缓存工具类
 */
class Cache {
  private cachePrefix: string;

  constructor(prefix: string = "cache_") {
    this.cachePrefix = prefix;
  }

  /**
   * 设置缓存
   *
   * @param key 缓存的键
   * @param data 缓存的数据
   * @param expiryTime 缓存有效期（毫秒），默认5分钟
   */
  setCache(
    key: string,
    data: any,
    expiryTime: number = DEFAULT_CACHE_EXPIRY_TIME
  ) {
    const expiryTimestamp = new Date().getTime() + expiryTime;
    const cacheKey = this.cachePrefix + key;
    const cacheData = { data, expiryTimestamp };

    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
  }

  /**
   * 获取缓存
   *
   * @param key 缓存的键
   * @returns 如果缓存有效则返回缓存的数据，否则返回 null
   */
  getCache(key: string) {
    const cacheKey = this.cachePrefix + key;
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      const { data, expiryTimestamp } = JSON.parse(cached);
      const now = new Date().getTime();

      // 如果缓存未过期，返回数据
      if (now < expiryTimestamp) {
        return data;
      } else {
        // 如果缓存过期，移除缓存
        localStorage.removeItem(cacheKey);
      }
    }
    return null;
  }

  /**
   * 移除缓存
   *
   * @param key 缓存的键
   */
  removeCache(key: string) {
    const cacheKey = this.cachePrefix + key;
    localStorage.removeItem(cacheKey);
  }

  /**
   * 清空当前前缀下的所有缓存
   */
  clearCache() {
    for (const key in localStorage) {
      if (key.startsWith(this.cachePrefix)) {
        localStorage.removeItem(key);
      }
    }
  }
}

export default Cache;
