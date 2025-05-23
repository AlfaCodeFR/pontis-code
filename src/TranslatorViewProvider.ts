import * as vscode from 'vscode';
import * as fs from 'fs';

export class TranslatorViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'pontis.translatorView';
  private _view?: vscode.WebviewView;

  constructor(private readonly context: vscode.ExtensionContext) {}

  resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;

    webviewView.webview.options = {
        enableScripts: true,
        localResourceRoots: [this.context.extensionUri]
    };

    // Path ke HTML
    const htmlPath = vscode.Uri.joinPath(
      this.context.extensionUri,
      "media",
      "translatorPanel.html"
    );

    // Baca konten HTML
    const htmlContent = fs.readFileSync(htmlPath.fsPath, "utf-8");

    // Tambahkan CSP dan proses resource
    const processedHtml = htmlContent
    .replace(
      /(<link.+?href="|<script.+?src="|<img.+?src=")(.+?)"/g,
      (_, prefix, src) => {
        const resourceUri = vscode.Uri.joinPath(this.context.extensionUri, src);
        const webviewUri = webviewView.webview.asWebviewUri(resourceUri);
        return `${prefix}${webviewUri}"`;
      }
    )
    .replace(
      "</head>",
      `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src ${webviewView.webview.cspSource} 'unsafe-inline'; style-src ${webviewView.webview.cspSource} 'unsafe-inline';"></head>`
    );

    webviewView.webview.html = processedHtml;

    console.log('Resolving webview view');
    console.log('Extension URI:', this.context.extensionUri.fsPath);
    console.log('HTML path:', htmlPath.fsPath);
    console.log("Webview URI:", htmlContent.toString());
    console.log("Webview URI:", htmlPath.toString());
    console.log("HTML Content:", htmlContent.substring(0, 100)); // Cek 100 karakter pertama

    webviewView.webview.onDidReceiveMessage(async message => {
      if (message.command === 'translate') {
        const apiUrl = message.source === 'java'
          ? 'https://causal-simply-foal.ngrok-free.app/translate_java_to_cs'
          : 'https://causal-simply-foal.ngrok-free.app/translate_cs_to_java';

        const translated = await callTranslationAPI(apiUrl, message.code);
        webviewView.webview.postMessage({ command: 'result', code: translated });
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