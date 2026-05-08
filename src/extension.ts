import * as vscode from 'vscode';
import { formatClassicAspDocument } from './formatter/formatClassicAspDocument';
import { FormatterOptions } from './formatter/types';

function readFormatterOptions(): FormatterOptions {
  const config = vscode.workspace.getConfiguration('classicAspFormatterPro');

  return {
    indentSize: config.get<number>('indentSize', 4),
    useTabs: config.get<boolean>('useTabs', false),
    formatHtml: config.get<boolean>('formatHtml', true),
    formatAsp: config.get<boolean>('formatAsp', true),
    formatCss: config.get<boolean>('formatCss', true),
    formatJavaScript: config.get<boolean>('formatJavaScript', true),
    safeMode: config.get<boolean>('safeMode', true),
    normalizeVbScriptKeywords: config.get<boolean>('normalizeVbScriptKeywords', false),
    preserveBlankLines: config.get<boolean>('preserveBlankLines', true),
  };
}

export function activate(context: vscode.ExtensionContext): void {
  const provider = vscode.languages.registerDocumentFormattingEditProvider('asp', {
    provideDocumentFormattingEdits(document: vscode.TextDocument): vscode.TextEdit[] {
      const options = readFormatterOptions();

      try {
        const source = document.getText();
        const formatted = formatClassicAspDocument(source, options);

        if (formatted === source) {
          return [];
        }

        const fullRange = new vscode.Range(
          document.positionAt(0),
          document.positionAt(source.length),
        );

        return [vscode.TextEdit.replace(fullRange, formatted)];
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        vscode.window.showWarningMessage(`Classic ASP Formatter Pro skipped formatting: ${message}`);
        return [];
      }
    },
  });

  context.subscriptions.push(provider);
}

export function deactivate(): void {
  // VS Code disposes subscriptions registered during activation.
}
