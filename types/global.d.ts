declare global {
  interface PageQuery {
    pageNum: number;
    pageSize: number;
  }

  interface PageResult<T> {
    list: T;
    total: number;
  }
}

export {};
