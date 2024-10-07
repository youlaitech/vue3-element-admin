// 创建一个共享的 requestCache
const requestCache = new Map<string, Promise<any>>();

export default requestCache;
