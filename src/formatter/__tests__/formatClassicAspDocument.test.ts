import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { formatClassicAspDocument } from '../formatClassicAspDocument';
import { analyzeAspFormattingRisk } from '../indentationEngine';
import { FormatterOptions } from '../types';

const options: FormatterOptions = {
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
  return readFileSync(join(__dirname, '..', '..', '..', 'fixtures', name), 'utf8').replace(
    /\r\n/g,
    '\n',
  );
}

describe('formatClassicAspDocument fixture coverage', () => {
  it.each([
    ['basic-if'],
    ['select-case'],
    ['html-with-inline-asp'],
    ['inline-asp-attributes'],
    ['script-style'],
  ])('formats %s', (fixtureName) => {
    const input = readFixture(`${fixtureName}.input.asp`);
    const expected = readFixture(`${fixtureName}.expected.asp`);

    expect(formatClassicAspDocument(input, options)).toBe(expected);
  });

  it('reports an unmatched ASP delimiter with a useful line number', () => {
    const risk = analyzeAspFormattingRisk('<div>\n<% If broken Then\n</div>');

    expect(risk).toEqual({
      line: 2,
      message: 'unmatched ASP opening delimiter',
    });
  });

  it('reports risky ASP delimiters inside strings', () => {
    const risk = analyzeAspFormattingRisk('<%\nResponse.Write "%>"\n%>');

    expect(risk).toEqual({
      line: 2,
      message: 'ASP closing delimiter inside Response.Write string',
    });
  });
});
