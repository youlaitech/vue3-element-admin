/**
 * getRePosFromStr 正则匹配字段返回位置信息
 * */
export function getRePosFromStr(text: any = '', re: any = /\$.+?\$/g) {
    const lines = text.split('\n')
    const positions: any = []
    let m
    for (let i = 0; i < lines.length; i++) {
        const l = lines[i]
        while ((m = re.exec(l)) !== null) {
            var tag = m[0].substring(1, m[0].length - 1)
            positions.push({
                line: i,
                start: m.index,
                stop: m.index + m[0].length,
                tag,
            })
        }
    }
    return positions
}
/**
 * 输入框模式
 */
export enum MODE {
    // 文本
    TEXT = 1,
    // 公式
    FORMULA,
    // 只允许选择tag
    ONLYTAG,
    // 日期
    DATE
}