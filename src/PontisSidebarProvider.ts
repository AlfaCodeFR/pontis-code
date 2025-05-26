import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export class PontisSidebarProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'pontisView';

  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  /**
   * Implementasi wajib dari WebviewViewProvider
   */
  resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    token: vscode.CancellationToken
  ): void {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(this._extensionUri, 'view'),
        vscode.Uri.joinPath(this._extensionUri, 'media')
      ]
    };

    webviewView.webview.html = this.getHtmlForWebview(webviewView.webview);
  }

  /**
   * Membaca file HTML dan menginject CSP yang aman
   */
  private getHtmlForWebview(webview: vscode.Webview): string {
    const htmlPath = vscode.Uri.joinPath(this._extensionUri, 'view', 'panel.html');
    let html = fs.readFileSync(htmlPath.fsPath, 'utf8');

    const cspSource = webview.cspSource;

    // inject CSP agar aman
    html = html.replace(
      /<head>/i,
      `<head>
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${cspSource}; style-src ${cspSource}; script-src 'unsafe-inline' ${cspSource};">`
    );

    return html;
  }
}