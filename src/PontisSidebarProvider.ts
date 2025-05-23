import * as vscode from 'vscode';

export class PontisSidebarProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'pontisView';

  constructor(private readonly _extensionUri: vscode.Uri) {}

  resolveWebviewView(
    webviewView: vscode.WebviewView
  ) {
    console.log('>> Webview resolveWebviewView terpanggil');

    webviewView.webview.options = {
      enableScripts: true
    };

    webviewView.webview.html = `
      <html>
        <body>
          <h1 style="color:green">Sidebar berhasil dimuat</h1>
        </body>
      </html>`;
  }
}