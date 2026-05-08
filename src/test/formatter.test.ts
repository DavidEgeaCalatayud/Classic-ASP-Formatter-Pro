import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { formatAspSegment } from '../formatter/formatAspSegment';
import { formatClassicAspDocument } from '../formatter/formatClassicAspDocument';
import { formatCssSegment } from '../formatter/formatCssSegment';
import { formatHtmlSegment } from '../formatter/formatHtmlSegment';
import { formatJavaScriptSegment } from '../formatter/formatJavaScriptSegment';
import { getAspControlType } from '../formatter/rules';
import { segmentDocument } from '../formatter/segmentDocument';
import { FormatterOptions } from '../formatter/types';

const defaultOptions: FormatterOptions = {
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

function readFixture(name: string): string {
  return readFileSync(join(__dirname, 'fixtures', name), 'utf8').replace(/\r\n/g, '\n');
}

describe('segmentDocument', () => {
  it('segments simple HTML', () => {
    const segments = segmentDocument('<div>Hello</div>');
    expect(segments).toEqual([{ type: 'html', content: '<div>Hello</div>', start: 0, end: 16 }]);
  });

  it('segments ASP blocks, expressions, directives, includes, script, and style', () => {
    const source = [
      '<%@ Language="VBScript" %>',
      '<% Response.Write "ok" %>',
      '<%= name %>',
      '<!--#include file="conexion.asp"-->',
      '<script>var a = 1;</script>',
      '<style>.a{color:red;}</style>',
    ].join('\n');
    const types = segmentDocument(source).map((segment) => segment.type);
    expect(types).toEqual([
      'aspDirective',
      'html',
      'asp',
      'html',
      'aspExpression',
      'html',
      'include',
      'html',
      'javascript',
      'html',
      'css',
    ]);
  });

  it('segments regular HTML comments', () => {
    expect(segmentDocument('<!-- note -->')[0].type).toBe('comment');
  });
});

describe('ASP rules', () => {
  it('classifies VBScript control lines', () => {
    expect(getAspControlType('If ok Then')).toBe('open');
    expect(getAspControlType('Else')).toBe('middle');
    expect(getAspControlType('End If')).toBe('close');
    expect(getAspControlType('Response.Write ok')).toBe('statement');
  });
});

describe('formatAspSegment', () => {
  it('formats If and End If', () => {
    const input = ['<%', 'If clienteActivo Then', 'Response.Write "Activo"', 'End If', '%>'].join('\n');
    const expected = ['<%', 'If clienteActivo Then', '    Response.Write "Activo"', 'End If', '%>'].join(
      '\n',
    );
    expect(formatAspSegment(input, defaultOptions)).toBe(expected);
  });

  it('formats If, Else, and End If', () => {
    const input = [
      '<%',
      'If clienteActivo Then',
      'Response.Write "Activo"',
      'Else',
      'Response.Write "Inactivo"',
      'End If',
      '%>',
    ].join('\n');
    const expected = [
      '<%',
      'If clienteActivo Then',
      '    Response.Write "Activo"',
      'Else',
      '    Response.Write "Inactivo"',
      'End If',
      '%>',
    ].join('\n');
    expect(formatAspSegment(input, defaultOptions)).toBe(expected);
  });

  it('formats For and Next', () => {
    const input = ['<%', 'For i = 0 To 10', 'Response.Write i', 'Next', '%>'].join('\n');
    const expected = ['<%', 'For i = 0 To 10', '    Response.Write i', 'Next', '%>'].join('\n');
    expect(formatAspSegment(input, defaultOptions)).toBe(expected);
  });

  it('formats Select Case', () => {
    const input = readFixture('select-case.input.asp');
    const expected = readFixture('select-case.expected.asp');
    expect(formatClassicAspDocument(input, defaultOptions)).toBe(expected);
  });
});

describe('formatters', () => {
  it('formats basic HTML', () => {
    expect(formatHtmlSegment('<table>\n<tr>\n<td>Name</td>\n</tr>\n</table>', 0, defaultOptions)).toBe(
      '<table>\n    <tr>\n        <td>Name</td>\n    </tr>\n</table>',
    );
  });

  it('preserves ASP inline inside HTML attributes', () => {
    const input = readFixture('asp-inline-expression.input.asp');
    const expected = readFixture('asp-inline-expression.expected.asp');
    expect(formatClassicAspDocument(input, defaultOptions)).toBe(expected);
  });

  it('formats JavaScript conservatively', () => {
    const input = readFixture('script-style.input.asp');
    const expected = readFixture('script-style.expected.asp');
    expect(formatClassicAspDocument(input, defaultOptions)).toBe(expected);
  });

  it('formats standalone JavaScript', () => {
    expect(
      formatJavaScriptSegment(
        '<script>\nif (cliente.activo) {\nconsole.log("Activo");\n}\n</script>',
        0,
        defaultOptions,
      ),
    ).toBe('<script>\n    if (cliente.activo) {\n        console.log("Activo");\n    }\n</script>');
  });

  it('formats standalone CSS', () => {
    expect(formatCssSegment('<style>\n.card {\ncolor: red;\n}\n</style>', 0, defaultOptions)).toBe(
      '<style>\n    .card {\n        color: red;\n    }\n</style>',
    );
  });
});

describe('formatClassicAspDocument', () => {
  it('formats a basic ASP fixture', () => {
    const input = readFixture('basic-asp.input.asp');
    const expected = readFixture('basic-asp.expected.asp');
    expect(formatClassicAspDocument(input, defaultOptions)).toBe(expected);
  });

  it('formats mixed ASP and HTML with structural ASP indenting HTML', () => {
    const input = readFixture('asp-html-mixed.input.asp');
    const expected = readFixture('asp-html-mixed.expected.asp');
    expect(formatClassicAspDocument(input, defaultOptions)).toBe(expected);
  });

  it('formats nested ASP and HTML', () => {
    const input = readFixture('nested-asp-html.input.asp');
    const expected = readFixture('nested-asp-html.expected.asp');
    expect(formatClassicAspDocument(input, defaultOptions)).toBe(expected);
  });

  it('keeps ambiguous ASP untouched in safe mode', () => {
    const input = '<div>\n<% If broken Then\n</div>';
    expect(formatClassicAspDocument(input, defaultOptions)).toBe(input);
  });
});
