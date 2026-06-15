/**
 * Lightweight markdown-to-HTML renderer.
 *
 * Supports a subset of markdown useful for study notes:
 * - **bold** → <strong>
 * - *italic* → <em>
 * - # Heading → <h4>
 * - ## Heading → <h5>
 * - - item / * item → <ul><li>
 * - Line breaks preserved
 * - Inline code `code` → <code>
 */

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderInline(text: string): string {
  let result = escapeHtml(text);

  // Inline code: `code`
  result = result.replace(/`([^`]+)`/g, '<code class="mx-0.5 rounded bg-stone-100 px-1.5 py-0.5 text-sm font-mono text-red-700">$1</code>');

  // Bold: **text**
  result = result.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

  // Italic: *text*
  result = result.replace(/\*(.+?)\*/g, "<em>$1</em>");

  return result;
}

export function renderMarkdown(markdown: string): string {
  const lines = markdown.split("\n");
  const htmlParts: string[] = [];
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Empty line
    if (!trimmed) {
      if (inList) {
        htmlParts.push("</ul>");
        inList = false;
      }
      htmlParts.push("<br/>");
      continue;
    }

    // Heading ##
    if (trimmed.startsWith("## ")) {
      if (inList) {
        htmlParts.push("</ul>");
        inList = false;
      }
      htmlParts.push(
        `<h5 class="mt-3 mb-1 text-sm font-bold text-stone-700">${renderInline(trimmed.slice(3))}</h5>`,
      );
      continue;
    }

    // Heading #
    if (trimmed.startsWith("# ")) {
      if (inList) {
        htmlParts.push("</ul>");
        inList = false;
      }
      htmlParts.push(
        `<h4 class="mt-3 mb-1 font-bold text-stone-800">${renderInline(trimmed.slice(2))}</h4>`,
      );
      continue;
    }

    // List item: - or *
    if (/^[-*]\s/.test(trimmed)) {
      if (!inList) {
        htmlParts.push('<ul class="ml-4 list-disc space-y-0.5">');
        inList = true;
      }
      htmlParts.push(`<li>${renderInline(trimmed.slice(2))}</li>`);
      continue;
    }

    // Normal paragraph
    if (inList) {
      htmlParts.push("</ul>");
      inList = false;
    }
    htmlParts.push(`<p>${renderInline(trimmed)}</p>`);
  }

  if (inList) {
    htmlParts.push("</ul>");
  }

  return htmlParts.join("");
}
