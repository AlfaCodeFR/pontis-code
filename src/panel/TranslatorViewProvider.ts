import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export class TranslatorViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'pontis.translatorView';
  private _view?: vscode.WebviewView;

  constructor(private readonly context: vscode.ExtensionContext) {}

  resolveWebviewView(view: vscode.WebviewView) {
    this._view = view;

    view.webview.options = {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.file(path.join(this.context.extensionPath, 'media'))]
    };

    const htmlPath = path.join(this.context.extensionPath, 'media', 'translatorPanel.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
    view.webview.html = htmlContent;

    view.webview.onDidReceiveMessage(async message => {
      if (message.command === 'translate') {
        const apiUrl = message.source === 'java'
          ? 'https://causal-simply-foal.ngrok-free.app/translate_java_to_cs'
          : 'https://causal-simply-foal.ngrok-free.app/translate_cs_to_java';

        const translated = await callTranslationAPI(apiUrl, message.code);
        view.webview.postMessage({ command: 'result', code: translated });
      }

      if (message.command === 'copy') {
        await vscode.env.clipboard.writeText(message.code);
        vscode.window.showInformationMessage('Code copied to clipboard.');
      }

      if (message.command === 'open') {
        const lang = message.lang === 'java' ? 'java' : 'csharp';
        const doc = await vscode.workspace.openTextDocument({ language: lang, content: message.code });
        vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
      }
    });
  }
}

async function callTranslationAPI(apiUrl: string, code: string): Promise<string> {
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });

    const data = await response.json() as TranslationResponse;

    return data.translated_code || '// Error: no result';
  } catch (e) {
    return '// Error accessing API';
  }
}

interface TranslationResponse {
  translated_code: string;
}
