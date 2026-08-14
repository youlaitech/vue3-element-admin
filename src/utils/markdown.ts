/**
 * Markdown 轻量渲染工具
 *
 * @description
 * 项目未引入 markdown 渲染库，这里提供最小化渲染能力，
 * 支持标题/列表/表格/引用/分隔线/加粗/行内代码，供教程、说明等场景复用。
 */

/** HTML 转义，防止注入 */
function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** 行内格式化：加粗、行内代码 */
function inline(s: string): string {
  return escapeHtml(s)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

/**
 * 轻量 markdown 渲染（支持标题/列表/表格/引用/分隔线/加粗/行内代码）。
 *
 * @param md markdown 源文本
 * @returns 渲染后的 HTML 字符串
 */
export function renderMarkdown(md: string): string {
  const lines = md.split("\n");
  const html: string[] = [];
  let inTable = false;

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();

    // 表格
    if (trimmed.startsWith("|")) {
      if (!inTable) {
        html.push("<table>");
        inTable = true;
      }
      const cells = trimmed
        .split("|")
        .slice(1, -1)
        .map((c) => inline(c.trim()));
      const isHeader = /^[-:]+$/.test(cells.join("").replace(/<[^>]+>/g, ""));
      if (!isHeader) {
        html.push(`<tr>${cells.map((c) => `<td>${c}</td>`).join("")}</tr>`);
      }
      continue;
    }
    if (inTable) {
      html.push("</table>");
      inTable = false;
    }

    // 标题
    const heading = /^(#{1,4})\s+(.*)$/.exec(trimmed);
    if (heading) {
      const level = heading[1].length;
      html.push(`<h${level}>${inline(heading[2])}</h${level}>`);
      continue;
    }
    // 分隔线
    if (/^(-{3,}|\*{3,})$/.test(trimmed)) {
      html.push("<hr />");
      continue;
    }
    // 引用
    if (trimmed.startsWith(">")) {
      html.push(`<blockquote>${inline(trimmed.replace(/^>\s?/, ""))}</blockquote>`);
      continue;
    }
    // 无序列表
    if (/^[-*]\s+/.test(trimmed)) {
      html.push(`<li>${inline(trimmed.replace(/^[-*]\s+/, ""))}</li>`);
      continue;
    }
    // 空行
    if (!trimmed) {
      html.push("");
      continue;
    }
    // 普通段落
    html.push(`<p>${inline(trimmed)}</p>`);
  }
  if (inTable) html.push("</table>");
  return html.join("\n");
}
