/*
 * @Description:
 * @Autor: scy😊
 * @Date: 2021-02-04 09:08:51
 * @LastEditors: ZY
 * @LastEditTime: 2021-02-23 14:44:09
 */
// const baseURL = process.env.VUE_APP_BASE_API
//
// export function download(fileName: any) {
//   window.location.href = baseURL + '/common/download?fileName=' + encodeURI(fileName) + '&delete=' + true
// }

// 添加日期范围

type Params = {[key: string]: any}

export const addDateRange = (params: Params, dateRange: any, propName?: any) => {
  const search = params
  search.params = {}
  if (dateRange !== null && dateRange !== '') {
    if (typeof (propName) === 'undefined') {
      search.params.beginTime = dateRange[0]
      search.params.endTime = dateRange[1]
    } else {
      search.params['begin' + propName] = dateRange[0]
      search.params['end' + propName] = dateRange[1]
    }
  }
  console.log(search)
  return search
}

/**
 * 构造树型结构数据
 * @param {*} data 数据源
 * @param {*} id id字段 默认 'id'
 * @param {*} parentId 父节点字段 默认 'parentId'
 * @param {*} children 孩子节点字段 默认 'children'
 * @param {*} rootId 根Id 默认 0
 */
export const handleTree = (data?: any, id?: any, parentId?: any, children?: any, rootId?: any) => {
  id = id || 'id'
  parentId = parentId || 'parentId'
  children = children || 'children'
  const parentIds = data.map((item: any) => { return item[parentId] })
  rootId = rootId || Math.min(...parentIds) || 0
  // 对源数据深度克隆
  const cloneData = JSON.parse(JSON.stringify(data))
  // 循环所有项
  const treeData = cloneData.filter((father: any) => {
    const branchArr = cloneData.filter((child: any) => {
      // 返回每一项的子级数组
      return father[id] === child[parentId]
    })
    if (branchArr.length > 0) {
      father.children = branchArr
    }
    // 返回第一层
    return father[parentId] === rootId
  })
  return treeData !== '' ? treeData : data
}

// 回显数据字典
export const selectDictLabel = (datas: Array<any>, value: string) => {
  const actions: string[] = []
  Object.keys(datas).some((key) => {
    if (datas[key].dictValue === value) {
      actions.push(datas[key].dictLabel)
      return true
    }
  })
  return actions.join('')
}

// 转换字符串，undefined,null等转化为""
export function praseStrEmpty(str: null | undefined) {
  if (!str || str === undefined || str === null) {
    return ''
  }
  return str
}

// 日期格式化
export function parseTime(time: any, pattern: any) {
  if (arguments.length === 0 || !time) {
    return null
  }
  const format = pattern || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if ((typeof time === 'string') && (/^[0-9]+$/.test(time))) {
      time = parseInt(time)
    } else if (typeof time === 'string') {
      time = time.replace(new RegExp(/-/gm), '/')
    }
    if ((typeof time === 'number') && (time.toString().length === 10)) {
      time = time * 1000
    }
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  const timestr = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result: any, key: any) => {
    let value = formatObj[key]
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') { return ['日', '一', '二', '三', '四', '五', '六'][value] }
    if (result.length > 0 && value < 10) {
      value = '0' + value
    }
    return value || 0
  })
  return timestr
}
