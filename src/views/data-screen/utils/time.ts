/**
 * 时间格式化：按 pattern 里的占位符替换为对应时间片段
 *
 * 支持占位符：YYYY/YY/MM/M/DD/D/HH/H/hh/h/mm/m/ss/s/SSS（A 为上午下午，dd 为星期，d 为星期序号）
 *
 * @param time 时间对象、时间戳或时间字符串
 * @param pattern 输出格式，默认 "YYYY-MM-DD HH:mm:ss"
 */
export function parseTime(time: Date | string | number, pattern = "YYYY-MM-DD HH:mm:ss"): string {
  let date: Date;

  if (time instanceof Date) {
    date = time;
  } else if (typeof time === "number") {
    // 秒级时间戳补成毫秒
    date = time.toString().length < 13 ? new Date(time * 1000) : new Date(time);
  } else {
    date = new Date(time);
  }

  const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const milliseconds = date.getMilliseconds();
  const hours12 = hours % 12 || 12;

  const formatMap: Record<string, string> = {
    YYYY: String(year),
    YY: String(year).slice(-2),
    MM: String(month).padStart(2, "0"),
    M: String(month),
    DD: String(day).padStart(2, "0"),
    D: String(day),
    HH: String(hours).padStart(2, "0"),
    H: String(hours),
    hh: String(hours12).padStart(2, "0"),
    h: String(hours12),
    mm: String(minutes).padStart(2, "0"),
    m: String(minutes),
    ss: String(seconds).padStart(2, "0"),
    s: String(seconds),
    SSS: String(milliseconds).padStart(3, "0"),
    A: hours < 12 ? "上午" : "下午",
    dd: weekdays[date.getDay()],
    d: String(date.getDay()),
  };

  return pattern.replace(
    /YYYY|YY|MM|M|DD|D|HH|H|hh|h|mm|m|ss|s|SSS|A|dd|d/g,
    (match) => formatMap[match] || match
  );
}
