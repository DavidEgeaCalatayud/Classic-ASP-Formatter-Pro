import { FormatterOptions } from './types';

export function createIndent(level: number, options: FormatterOptions): string {
  const safeLevel = Math.max(0, level);
  return options.useTabs ? '\t'.repeat(safeLevel) : ' '.repeat(safeLevel * options.indentSize);
}

export function normalizeLineEndings(source: string): string {
  return source.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

export function trimTrailingWhitespace(source: string): string {
  return source
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n');
}

export function collapseExcessBlankLines(source: string): string {
  return source.replace(/\n{3,}/g, '\n\n');
}

export function hasAmbiguousAspBlock(source: string): boolean {
  const opens = source.match(/<%/g)?.length ?? 0;
  const closes = source.match(/%>/g)?.length ?? 0;
  return opens !== closes;
}

export interface AspFormattingRisk {
  line: number;
  message: string;
}

function getLineNumber(source: string, index: number): number {
  return source.slice(0, index).split('\n').length;
}

export function analyzeAspFormattingRisk(source: string): AspFormattingRisk | undefined {
  const normalized = normalizeLineEndings(source);
  const riskyPatterns = [
    {
      pattern: /Response\.Write\s+["'][^"']*%>[^"']*["']/i,
      message: 'ASP closing delimiter inside Response.Write string',
    },
    {
      pattern: /<!--(?!#include)[\s\S]*?<%[\s\S]*?-->/i,
      message: 'ASP delimiter inside an HTML comment',
    },
  ];

  const lines = normalized.split('\n');
  for (let index = 0; index < lines.length; index += 1) {
    for (const riskyPattern of riskyPatterns) {
      if (riskyPattern.pattern.test(lines[index])) {
        return {
          line: index + 1,
          message: riskyPattern.message,
        };
      }
    }
  }

  const tokenPattern = /<%|%>/g;
  let balance = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenPattern.exec(normalized)) !== null) {
    if (match[0] === '<%') {
      balance += 1;
      continue;
    }

    if (balance === 0) {
      return {
        line: getLineNumber(normalized, match.index),
        message: 'unmatched ASP closing delimiter',
      };
    }

    balance -= 1;
  }

  if (balance > 0) {
    const lastOpen = normalized.lastIndexOf('<%');
    return {
      line: getLineNumber(normalized, Math.max(0, lastOpen)),
      message: 'unmatched ASP opening delimiter',
    };
  }

  return undefined;
}
