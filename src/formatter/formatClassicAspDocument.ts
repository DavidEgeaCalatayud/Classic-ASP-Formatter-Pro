import { formatAspSegment } from './formatAspSegment';
import { formatCssSegment } from './formatCssSegment';
import { getHtmlLineIndentChange } from './formatHtmlSegment';
import { formatJavaScriptSegment } from './formatJavaScriptSegment';
import {
  collapseExcessBlankLines,
  createIndent,
  hasAmbiguousAspBlock,
  normalizeLineEndings,
  trimTrailingWhitespace,
} from './indentationEngine';
import { defaultFormatterOptions, getAspControlType } from './rules';
import { FormatterOptions } from './types';

function mergeOptions(options?: Partial<FormatterOptions>): FormatterOptions {
  return {
    ...defaultFormatterOptions,
    ...options,
  };
}

function isWholeLineAsp(trimmed: string): boolean {
  return /^<%[\s\S]*%>$/.test(trimmed);
}

function isMultilineAspStart(trimmed: string): boolean {
  return /^<%/.test(trimmed) && !/%>$/.test(trimmed);
}

function isOpeningHtmlLine(line: string): boolean {
  const trimmed = line.trim();
  return /^<([a-zA-Z][\w:-]*)(?:\s[^<>]*)?>$/.test(trimmed) && !/^<\//.test(trimmed);
}

function shouldInsertBlankBeforeAspOpen(output: string[]): boolean {
  if (output.length === 0) {
    return false;
  }

  const previous = output[output.length - 1];
  if (!previous.trim() || isOpeningHtmlLine(previous)) {
    return false;
  }

  return true;
}

function isAspCaseLine(line: string): boolean {
  return /^\s*<%\s*case\b/i.test(line) || /^\s*case\b/i.test(line);
}

function isAspEndSelectLine(line: string): boolean {
  return /^\s*<%\s*end\s+select\b/i.test(line) || /^\s*end\s+select\b/i.test(line);
}

function collectBlock(lines: string[], startIndex: number, closingPattern: RegExp): [string, number] {
  const collected: string[] = [];
  let index = startIndex;

  while (index < lines.length) {
    collected.push(lines[index]);
    if (closingPattern.test(lines[index])) {
      break;
    }
    index += 1;
  }

  return [collected.join('\n'), index];
}

function collectAspBlock(lines: string[], startIndex: number): [string, number] {
  const collected: string[] = [];
  let index = startIndex;

  while (index < lines.length) {
    collected.push(lines[index]);
    if (/%>/.test(lines[index])) {
      break;
    }
    index += 1;
  }

  return [collected.join('\n'), index];
}

export function formatClassicAspDocument(
  source: string,
  options?: Partial<FormatterOptions>,
): string {
  const formatterOptions = mergeOptions(options);
  const normalized = normalizeLineEndings(source);

  if (formatterOptions.safeMode && hasAmbiguousAspBlock(normalized)) {
    return source;
  }

  const lines = normalized.split('\n');
  const output: string[] = [];
  let indentLevel = 0;

  for (let index = 0; index < lines.length; index += 1) {
    const rawLine = lines[index];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      if (formatterOptions.preserveBlankLines) {
        output.push('');
      }
      continue;
    }

    if (/^<script\b/i.test(trimmed) && formatterOptions.formatJavaScript) {
      const [block, endIndex] = collectBlock(lines, index, /<\/script\s*>/i);
      output.push(formatJavaScriptSegment(block, indentLevel, formatterOptions));
      index = endIndex;
      continue;
    }

    if (/^<style\b/i.test(trimmed) && formatterOptions.formatCss) {
      const [block, endIndex] = collectBlock(lines, index, /<\/style\s*>/i);
      output.push(formatCssSegment(block, indentLevel, formatterOptions));
      index = endIndex;
      continue;
    }

    if (isMultilineAspStart(trimmed) && formatterOptions.formatAsp) {
      const [block, endIndex] = collectAspBlock(lines, index);
      const formattedBlock = formatAspSegment(block, formatterOptions)
        .split('\n')
        .map((line) => (line.trim() ? `${createIndent(indentLevel, formatterOptions)}${line}` : line))
        .join('\n');
      output.push(formattedBlock);
      index = endIndex;
      continue;
    }

    if (isWholeLineAsp(trimmed)) {
      const controlType = getAspControlType(trimmed);

      if (controlType === 'close' && isAspEndSelectLine(trimmed)) {
        indentLevel = Math.max(0, indentLevel - 2);
      } else if (controlType === 'close') {
        indentLevel = Math.max(0, indentLevel - 1);
      } else if (controlType === 'middle' && isAspCaseLine(trimmed)) {
        indentLevel = Math.max(1, indentLevel - 1);
      } else if (controlType === 'middle') {
        indentLevel = Math.max(0, indentLevel - 1);
      }

      if (controlType === 'open' && shouldInsertBlankBeforeAspOpen(output)) {
        output.push('');
      }

      output.push(`${createIndent(indentLevel, formatterOptions)}${trimmed}`);

      if (controlType === 'open' || controlType === 'middle') {
        indentLevel += 1;
      }

      continue;
    }

    if (/^<!--#include\b/i.test(trimmed) || /^<!--/.test(trimmed)) {
      output.push(`${createIndent(indentLevel, formatterOptions)}${trimmed}`);
      continue;
    }

    if (formatterOptions.formatHtml) {
      const indentChange = getHtmlLineIndentChange(trimmed, indentLevel);
      output.push(`${createIndent(indentChange.beforeLevel, formatterOptions)}${trimmed}`);
      indentLevel = indentChange.afterLevel;
      continue;
    }

    output.push(`${createIndent(indentLevel, formatterOptions)}${trimmed}`);
  }

  const formatted = trimTrailingWhitespace(output.join('\n'));
  return formatterOptions.preserveBlankLines ? formatted : collapseExcessBlankLines(formatted);
}
