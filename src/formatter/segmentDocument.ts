import { Segment, SegmentType } from './types';

const tokenPattern = /<!--#include\s+(?:file|virtual)="[^"]+"\s*-->|<!--[\s\S]*?-->|<%[\s\S]*?%>|<script\b[^>]*>[\s\S]*?<\/script\s*>|<style\b[^>]*>[\s\S]*?<\/style\s*>/gi;

function classifyToken(token: string): SegmentType {
  if (/^<%@/i.test(token)) {
    return 'aspDirective';
  }

  if (/^<%=/i.test(token)) {
    return 'aspExpression';
  }

  if (/^<%/i.test(token)) {
    return 'asp';
  }

  if (/^<!--#include/i.test(token)) {
    return 'include';
  }

  if (/^<!--/i.test(token)) {
    return 'comment';
  }

  if (/^<script\b/i.test(token)) {
    return 'javascript';
  }

  if (/^<style\b/i.test(token)) {
    return 'css';
  }

  return 'html';
}

export function segmentDocument(source: string): Segment[] {
  const segments: Segment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  tokenPattern.lastIndex = 0;

  while ((match = tokenPattern.exec(source)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: 'html',
        content: source.slice(lastIndex, match.index),
        start: lastIndex,
        end: match.index,
      });
    }

    const content = match[0];
    segments.push({
      type: classifyToken(content),
      content,
      start: match.index,
      end: match.index + content.length,
    });

    lastIndex = match.index + content.length;
  }

  if (lastIndex < source.length) {
    segments.push({
      type: 'html',
      content: source.slice(lastIndex),
      start: lastIndex,
      end: source.length,
    });
  }

  return segments.filter((segment) => segment.content.length > 0);
}
