import { createIndent, normalizeLineEndings } from './indentationEngine';
import { getAspControlType, normalizeVbKeywords, stripAspDelimiters } from './rules';
import { FormatterOptions } from './types';

function formatAspCodeLine(line: string, options: FormatterOptions): string {
  const trimmed = line.trim();
  return options.normalizeVbScriptKeywords ? normalizeVbKeywords(trimmed) : trimmed;
}

function shouldInsertBlankBeforeOpen(output: string[], controlType: string): boolean {
  if (controlType !== 'open' || output.length === 0) {
    return false;
  }

  const previous = output[output.length - 1];
  return previous.trim().length > 0 && !/<%\s*$/i.test(previous.trim());
}

function isCaseLine(line: string): boolean {
  return /^\s*case\b/i.test(line);
}

function isEndSelectLine(line: string): boolean {
  return /^\s*end\s+select\b/i.test(line);
}

export function formatAspSegment(content: string, options: FormatterOptions): string {
  const normalized = normalizeLineEndings(content);
  const startsWithDelimiter = /^\s*<%/.test(normalized);
  const endsWithDelimiter = /%>\s*$/.test(normalized);
  const code = startsWithDelimiter ? stripAspDelimiters(normalized) : normalized;
  const lines = normalizeLineEndings(code).split('\n');
  const output: string[] = [];
  let indentLevel = 0;

  if (startsWithDelimiter) {
    output.push(normalized.trimStart().startsWith('<%@') ? '<%@' : '<%');
  }

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();

    if (!trimmed) {
      if (options.preserveBlankLines) {
        output.push('');
      }
      continue;
    }

    const controlType = getAspControlType(trimmed);

    if (controlType === 'close' && isEndSelectLine(trimmed)) {
      indentLevel = Math.max(0, indentLevel - 2);
    } else if (controlType === 'close') {
      indentLevel = Math.max(0, indentLevel - 1);
    } else if (controlType === 'middle' && isCaseLine(trimmed)) {
      indentLevel = Math.max(1, indentLevel - 1);
    } else if (controlType === 'middle') {
      indentLevel = Math.max(0, indentLevel - 1);
    }

    if (shouldInsertBlankBeforeOpen(output, controlType)) {
      output.push('');
    }

    output.push(`${createIndent(indentLevel, options)}${formatAspCodeLine(trimmed, options)}`);

    if (controlType === 'open' || controlType === 'middle') {
      indentLevel += 1;
    }
  }

  if (endsWithDelimiter) {
    output.push('%>');
  }

  return output.join('\n');
}
