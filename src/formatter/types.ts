export type SegmentType =
  | 'html'
  | 'asp'
  | 'aspExpression'
  | 'aspDirective'
  | 'include'
  | 'javascript'
  | 'css'
  | 'comment';

export interface Segment {
  type: SegmentType;
  content: string;
  start: number;
  end: number;
}

export type AspControlType = 'open' | 'close' | 'middle' | 'statement';

export interface FormatterOptions {
  indentSize: number;
  useTabs: boolean;
  formatHtml: boolean;
  formatAsp: boolean;
  formatCss: boolean;
  formatJavaScript: boolean;
  safeMode: boolean;
  normalizeVbScriptKeywords: boolean;
  preserveBlankLines: boolean;
}

export interface Placeholder {
  token: string;
  value: string;
}

export interface ProtectedSource {
  source: string;
  placeholders: Placeholder[];
}

export interface HtmlLineIndentResult {
  beforeLevel: number;
  afterLevel: number;
  isStructuralClose: boolean;
}
