import { AspControlType } from './types';

export const defaultFormatterOptions = {
  indentSize: 4,
  useTabs: false,
  formatHtml: true,
  formatAsp: true,
  formatCss: true,
  formatJavaScript: true,
  safeMode: true,
  normalizeVbScriptKeywords: false,
  preserveBlankLines: true,
};

export const voidHtmlTags = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]);

export const rawTextHtmlTags = new Set(['script', 'style', 'textarea', 'pre']);

const aspOpenPatterns = [
  /^\s*if\b.+\bthen\b\s*$/i,
  /^\s*for\b.+/i,
  /^\s*for\s+each\b.+\bin\b.+/i,
  /^\s*do\s+(while|until)\b.+/i,
  /^\s*select\s+case\b.+/i,
  /^\s*function\b.+/i,
  /^\s*sub\b.+/i,
  /^\s*class\b.+/i,
  /^\s*with\b.+/i,
];

const aspClosePatterns = [
  /^\s*end\s+if\b/i,
  /^\s*next\b/i,
  /^\s*loop\b/i,
  /^\s*wend\b/i,
  /^\s*end\s+select\b/i,
  /^\s*end\s+function\b/i,
  /^\s*end\s+sub\b/i,
  /^\s*end\s+class\b/i,
  /^\s*end\s+with\b/i,
];

const aspMiddlePatterns = [
  /^\s*else\b/i,
  /^\s*elseif\b.+\bthen\b/i,
  /^\s*case\b/i,
  /^\s*case\s+else\b/i,
];

export function stripAspDelimiters(content: string): string {
  return content
    .replace(/^\s*<%[@=]?/, '')
    .replace(/%>\s*$/, '')
    .trim();
}

export function stripVbStringLiterals(code: string): string {
  let result = '';
  let inString = false;

  for (let index = 0; index < code.length; index += 1) {
    const char = code[index];
    const next = code[index + 1];

    if (char === '"') {
      if (inString && next === '"') {
        result += '  ';
        index += 1;
        continue;
      }

      inString = !inString;
      result += ' ';
      continue;
    }

    result += inString ? ' ' : char;
  }

  return result;
}

export function stripInlineVbComment(code: string): string {
  const withoutStrings = stripVbStringLiterals(code);
  const commentIndex = withoutStrings.indexOf("'");
  return commentIndex >= 0 ? code.slice(0, commentIndex) : code;
}

export function getAspControlType(code: string): AspControlType {
  const cleanCode = stripInlineVbComment(stripAspDelimiters(code)).trim();

  if (!cleanCode || cleanCode.startsWith("'") || /^rem\b/i.test(cleanCode)) {
    return 'statement';
  }

  if (aspMiddlePatterns.some((pattern) => pattern.test(cleanCode))) {
    return 'middle';
  }

  if (aspClosePatterns.some((pattern) => pattern.test(cleanCode))) {
    return 'close';
  }

  if (aspOpenPatterns.some((pattern) => pattern.test(cleanCode))) {
    return 'open';
  }

  return 'statement';
}

export function normalizeVbKeywords(code: string): string {
  const replacements: Array<[RegExp, string]> = [
    [/\bif\b/gi, 'If'],
    [/\bthen\b/gi, 'Then'],
    [/\belse\b/gi, 'Else'],
    [/\belseif\b/gi, 'ElseIf'],
    [/\bend if\b/gi, 'End If'],
    [/\bfor each\b/gi, 'For Each'],
    [/\bfor\b/gi, 'For'],
    [/\bto\b/gi, 'To'],
    [/\bnext\b/gi, 'Next'],
    [/\bdo while\b/gi, 'Do While'],
    [/\bdo until\b/gi, 'Do Until'],
    [/\bloop\b/gi, 'Loop'],
    [/\bwhile\b/gi, 'While'],
    [/\bwend\b/gi, 'Wend'],
    [/\bselect case\b/gi, 'Select Case'],
    [/\bcase else\b/gi, 'Case Else'],
    [/\bcase\b/gi, 'Case'],
    [/\bend select\b/gi, 'End Select'],
    [/\bfunction\b/gi, 'Function'],
    [/\bend function\b/gi, 'End Function'],
    [/\bsub\b/gi, 'Sub'],
    [/\bend sub\b/gi, 'End Sub'],
    [/\bclass\b/gi, 'Class'],
    [/\bend class\b/gi, 'End Class'],
    [/\bwith\b/gi, 'With'],
    [/\bend with\b/gi, 'End With'],
  ];

  let normalized = code;
  for (const [pattern, replacement] of replacements) {
    normalized = normalized.replace(pattern, replacement);
  }

  return normalized;
}
