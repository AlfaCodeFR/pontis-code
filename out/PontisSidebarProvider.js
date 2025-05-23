"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PontisSidebarProvider = void 0;
class PontisSidebarProvider {
    constructor(_extensionUri) {
        this._extensionUri = _extensionUri;
    }
    resolveWebviewView(webviewView) {
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
exports.PontisSidebarProvider = PontisSidebarProvider;
PontisSidebarProvider.viewType = 'pontisView';
//# sourceMappingURL=PontisSidebarProvider.js.map