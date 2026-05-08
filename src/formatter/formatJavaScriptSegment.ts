import { createIndent, normalizeLineEndings } from './indentationEngine';
import { protectAspBlocks, restoreAspBlocks } from './placeholders';
import { FormatterOptions } from './types';

function splitJavaScriptStatements(source: string): string[] {
  return source
    .replace(/\s*\{/g, ' {\n')
    .replace(/\}/g, '\n}\n')
    .replace(/;/g, ';\n')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

export function formatJavaScriptSegment(
  content: string,
  baseIndentLevel: number,
  options: FormatterOptions,
): string {
  const normalized = normalizeLineEndings(content).trim();
  const openMatch = normalized.match(/^<script\b[^>]*>/i);
  const closeMatch = normalized.match(/<\/script\s*>$/i);
  const openTag = openMatch?.[0];
  const closeTag = closeMatch?.[0];
  const body =
    openTag && closeTag
      ? normalized.slice(openTag.length, normalized.length - closeTag.length)
      : normalized;
  const protectedBody = protectAspBlocks(body);
  const lines = splitJavaScriptStatements(protectedBody.source);
  const output: string[] = [];
  let indentLevel = baseIndentLevel;

  if (openTag) {
    output.push(`${createIndent(baseIndentLevel, options)}${openTag}`);
    indentLevel += 1;
  }

  for (const line of lines) {
    if (line.startsWith('}')) {
      indentLevel = Math.max(baseIndentLevel + (openTag ? 1 : 0), indentLevel - 1);
    }

    output.push(`${createIndent(indentLevel, options)}${line}`);

    if (line.endsWith('{')) {
      indentLevel += 1;
    }
  }

  if (closeTag) {
    output.push(`${createIndent(baseIndentLevel, options)}${closeTag}`);
  }

  return restoreAspBlocks(output.join('\n'), protectedBody.placeholders);
}
