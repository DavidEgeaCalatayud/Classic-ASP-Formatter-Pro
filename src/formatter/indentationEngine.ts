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
