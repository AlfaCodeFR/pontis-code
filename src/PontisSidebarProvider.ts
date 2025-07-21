import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';

export class PontisSidebarProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'pontisView';
  public view?: vscode.WebviewView;

  private pendingInputText: string | null = null;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public setPendingInputText(text: string) {

    if (this.view) {
      this.view.webview.postMessage({
        type: 'setInputText',
        value: text
      });
    } else {
      this.pendingInputText = text;
    }
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView
  ): void {
    this.view = webviewView;
    
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(this._extensionUri, 'media'),
        vscode.Uri.joinPath(this._extensionUri, 'view')
      ]
    };

    webviewView.webview.html = this.getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (message) => {
      switch (message.type) {
        case 'translate':
          const { inputCode, langFrom, langTo, model } = message.value;

          vscode.window.withProgress({
            location: vscode.ProgressLocation.Window,
            title: "Translating with Pontis...",
            cancellable: false
          }, async (progress) => {
            progress.report({ message: `Using model ${model}...` });

          try {
            const response = await axios.post('https://causal-simply-foal.ngrok-free.app/translate', {
              code: inputCode,
              model: model,
              source_lang: langFrom,
              target_lang: langTo
            });

            const translated = response.data.translated_code || '// Translation failed.';
            webviewView.webview.postMessage({ type: 'output', value: translated });
          } catch (err: any) {
            const errorMsg = err.message || '// Unknown error';
            webviewView.webview.postMessage({
              type: 'output',
              value: `// Error: ${errorMsg}`
            });
            vscode.window.showErrorMessage(`Translation failed: ${errorMsg}`);
          }}
          );

          break;

        // case 'setInputText':
        //   console.log('[Pontis Webview] Received setInputText:', message.value);
        //   webviewView.webview.postMessage({ type: 'setInputText', value: message.value });
        //   break;

        case 'createNewFile': {
          const { value, lang } = message;
          const languageId = this.getLanguageId(lang);
          const newDoc = await vscode.workspace.openTextDocument({ content: value, language: languageId });
          vscode.window.showTextDocument(newDoc, vscode.ViewColumn.Beside);
          break;
        }
      }
    });
  }

  private getLanguageId(lang: string): string {
    const lower = lang.toLowerCase();
    const mapping: { [key: string]: string } = {
      java: 'java',
      csharp: 'csharp',
      python: 'python',
      javascript: 'javascript',
      typescript: 'typescript',
      'c++': 'cpp',
      cpp: 'cpp',
      c: 'c',
      dart: 'dart',
      go: 'go',
      kotlin: 'kotlin',
      php: 'php',
      ruby: 'ruby',
      rust: 'rust',
      scala: 'scala',
      swift: 'swift'
    };
    return mapping[lower] || 'plaintext';
  }

  private getHtmlForWebview(webview: vscode.Webview): string {
    const htmlPath = vscode.Uri.joinPath(this._extensionUri, 'view', 'panel.html');
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'media', 'js', 'script.js')
    );
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'media', 'css', 'style.css')
    );
    const nonce = getNonce();
    const cspSource = webview.cspSource;

    let html = fs.readFileSync(htmlPath.fsPath, 'utf8');
    html = html
    .replace(/%%SCRIPT_URI%%/g, scriptUri.toString())
    .replace(/%%NONCE%%/g, nonce)
    .replace(/<link href="\$\{styleUri\}"/, `<link href="${styleUri}"`);

    html = html.replace(
      /<head>/i,
      `<head>
          <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${cspSource}; style-src ${cspSource}; script-src 'nonce-${nonce}';">`
    );

    return html;
  }
}

function getNonce(): string {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}