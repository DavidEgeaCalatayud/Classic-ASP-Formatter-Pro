import { createIndent, normalizeLineEndings } from './indentationEngine';
import { protectAspBlocks, restoreAspBlocks } from './placeholders';
import { rawTextHtmlTags, voidHtmlTags } from './rules';
import { FormatterOptions, HtmlLineIndentResult } from './types';

const tagPattern = /<\/?([a-zA-Z][\w:-]*)(?:\s[^<>]*)?>/g;

function isSelfClosingTag(tagText: string, tagName: string): boolean {
  return tagText.endsWith('/>') || voidHtmlTags.has(tagName.toLowerCase());
}

export function getHtmlLineIndentChange(line: string, currentLevel: number): HtmlLineIndentResult {
  const protectedLine = protectAspBlocks(line).source;
  const trimmed = protectedLine.trim();
  let beforeLevel = currentLevel;
  let afterLevel = currentLevel;
  let firstStructuralTag: 'open' | 'close' | undefined;
  let match: RegExpExecArray | null;

  tagPattern.lastIndex = 0;

  while ((match = tagPattern.exec(trimmed)) !== null) {
    const fullTag = match[0];
    const tagName = match[1].toLowerCase();

    if (fullTag.startsWith('<!--') || isSelfClosingTag(fullTag, tagName)) {
      continue;
    }

    if (rawTextHtmlTags.has(tagName)) {
      continue;
    }

    if (fullTag.startsWith('</')) {
      if (!firstStructuralTag) {
        firstStructuralTag = 'close';
      }
      afterLevel = Math.max(0, afterLevel - 1);
      if (match.index === 0) {
        beforeLevel = Math.max(0, beforeLevel - 1);
      }
    } else {
      if (!firstStructuralTag) {
        firstStructuralTag = 'open';
      }
      afterLevel += 1;
    }
  }

  return {
    beforeLevel,
    afterLevel,
    isStructuralClose: firstStructuralTag === 'close',
  };
}

export function formatHtmlSegment(
  content: string,
  baseIndentLevel: number,
  options: FormatterOptions,
): string {
  const protectedSource = protectAspBlocks(normalizeLineEndings(content));
  const lines = protectedSource.source.split('\n');
  const output: string[] = [];
  let indentLevel = baseIndentLevel;

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();

    if (!trimmed) {
      if (options.preserveBlankLines) {
        output.push('');
      }
      continue;
    }

    const indentChange = getHtmlLineIndentChange(trimmed, indentLevel);
    output.push(`${createIndent(indentChange.beforeLevel, options)}${trimmed}`);
    indentLevel = indentChange.afterLevel;
  }

  return restoreAspBlocks(output.join('\n'), protectedSource.placeholders);
}
