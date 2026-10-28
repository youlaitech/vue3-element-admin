/**
 * 格式化增长率的绝对值，最多保留两位小数；零值显示“-”。
 *
 * @param growthRate 小数形式的增长率，如 0.15 表示 15%
 */
export function formatGrowthRate(growthRate: number): string {
  if (growthRate === 0) {
    return "-";
  }

  const formattedRate = Math.abs(growthRate * 100)
    .toFixed(2)
    .replace(/\.?0+$/, "");

  return formattedRate + "%";
}
