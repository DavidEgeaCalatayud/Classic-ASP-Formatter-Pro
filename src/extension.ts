import * as vscode from 'vscode';
import { formatClassicAspDocument } from './formatter/formatClassicAspDocument';
import { analyzeAspFormattingRisk } from './formatter/indentationEngine';
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
  function formatActiveDocumentSafely(): void {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
      vscode.window.showWarningMessage('Classic ASP Formatter Pro skipped formatting: no active editor.');
      return;
    }

    const document = editor.document;
    const source = document.getText();
    const risk = analyzeAspFormattingRisk(source);

    if (risk) {
      vscode.window.showWarningMessage(
        `Classic ASP Formatter Pro skipped formatting: ${risk.message} near line ${risk.line}.`,
      );
      return;
    }

    const formatted = formatClassicAspDocument(source, {
      ...readFormatterOptions(),
      safeMode: true,
    });
    const fullRange = new vscode.Range(document.positionAt(0), document.positionAt(source.length));

    editor.edit((editBuilder) => {
      editBuilder.replace(fullRange, formatted);
    });
  }

  function analyzeActiveDocument(): void {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
      vscode.window.showWarningMessage('Classic ASP Formatter Pro could not analyze: no active editor.');
      return;
    }

    const risk = analyzeAspFormattingRisk(editor.document.getText());

    if (risk) {
      vscode.window.showWarningMessage(
        `Classic ASP Formatter Pro found a formatting risk: ${risk.message} near line ${risk.line}.`,
      );
      return;
    }

    vscode.window.showInformationMessage('Classic ASP Formatter Pro found no obvious delimiter risks.');
  }

  const provider = vscode.languages.registerDocumentFormattingEditProvider('asp', {
    provideDocumentFormattingEdits(document: vscode.TextDocument): vscode.TextEdit[] {
      const options = readFormatterOptions();

      try {
        const source = document.getText();
        const risk = options.safeMode ? analyzeAspFormattingRisk(source) : undefined;

        if (risk) {
          vscode.window.showWarningMessage(
            `Classic ASP Formatter Pro skipped formatting: ${risk.message} near line ${risk.line}.`,
          );
          return [];
        }

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

  const formatSafeCommand = vscode.commands.registerCommand(
    'classicAspFormatterPro.formatDocumentSafe',
    formatActiveDocumentSafely,
  );
  const analyzeCommand = vscode.commands.registerCommand(
    'classicAspFormatterPro.analyzeDocument',
    analyzeActiveDocument,
  );

  context.subscriptions.push(provider, formatSafeCommand, analyzeCommand);
}

export function deactivate(): void {
  // VS Code disposes subscriptions registered during activation.
}
