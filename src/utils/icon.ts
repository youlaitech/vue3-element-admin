import * as ElementPlusIconsVue from "@element-plus/icons-vue";

/**
 * 本地 SVG 图标名
 *
 * @description
 * 取自 src/assets/icons 下的文件名，存入菜单时无前缀
 */
export const svgIconNames: string[] = Object.keys(import.meta.glob("../assets/icons/*.svg")).map(
  (path) => path.replace(/.*\/(.*)\.svg$/, "$1")
);

/**
 * Element Plus 图标名
 *
 * @description
 * 存入菜单时需加 el-icon- 前缀
 */
export const elementIconNames: string[] = Object.keys(ElementPlusIconsVue);

/**
 * 按候选词匹配图标名
 *
 * @param iconNames 图标名清单
 * @param keywords 候选关键词，已按目标命名风格整理
 * @param loose 是否用包含匹配
 * @returns 命中的图标名，未命中返回空串
 */
function pickIcon(iconNames: string[], keywords: string[], loose: boolean): string {
  for (const keyword of keywords) {
    const hit = iconNames.find((name) => {
      const target = name.toLowerCase();
      return loose ? target.includes(keyword) : target === keyword;
    });
    if (hit) return hit;
  }
  return "";
}

/**
 * 按关键词匹配图标
 *
 * 先 SVG 后 Element，先精确后包含；返回值为可直接存入菜单的图标名（Element 图标带 el-icon- 前缀），
 * 全部落空返回空串
 *
 * @param keywords 图标关键词，按贴切程度排列
 * @returns 命中的图标名，未命中返回空串
 */
export function matchIcon(keywords: string[]): string {
  const candidates = keywords
    .filter(Boolean)
    .map((keyword) =>
      keyword
        .trim()
        .toLowerCase()
        .replace(/^el-icon-/, "")
    )
    .filter(Boolean);

  if (candidates.length === 0) return "";

  const svg = pickIcon(svgIconNames, candidates, false);
  if (svg) return svg;

  /**
   * Element 图标名为大驼峰，比较前去掉关键词里的连字符
   */
  const elementKeys = candidates.map((keyword) => keyword.replace(/-/g, ""));

  const element = pickIcon(elementIconNames, elementKeys, false);
  if (element) return `el-icon-${element}`;

  const svgLoose = pickIcon(svgIconNames, candidates, true);
  if (svgLoose) return svgLoose;

  const elementLoose = pickIcon(elementIconNames, elementKeys, true);
  return elementLoose ? `el-icon-${elementLoose}` : "";
}
