import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';

export class PontisSidebarProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'pontisView';
  public view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) {}

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

        case 'setInputText':
          webviewView.webview.postMessage({ type: 'setInputText', value: message.value });
          break;

        case 'createNewFile': {
          const { value, lang } = message;

          let languageId = 'plaintext'; // default jika tidak cocok

          switch (lang.toLowerCase()) {
            case 'java':
              languageId = 'java';
              break;
            case 'c#':
            case 'csharp':
              languageId = 'csharp';
              break;
            case 'python':
              languageId = 'python';
              break;
            case 'javascript':
              languageId = 'javascript';
              break;
          }

          const newDoc = await vscode.workspace.openTextDocument({
            content: value,
            language: languageId
          });

          vscode.window.showTextDocument(newDoc, vscode.ViewColumn.Beside);
          break;
        }
      }
    });
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