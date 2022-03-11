
export interface Page {
    pageNum: number,
    pageSize: number
}

export interface PageResult<T> {
    data: T,
    total: number
}

