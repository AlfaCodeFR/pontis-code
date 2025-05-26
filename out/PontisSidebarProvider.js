"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PontisSidebarProvider = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
class PontisSidebarProvider {
    constructor(_extensionUri) {
        this._extensionUri = _extensionUri;
    }
    /**
     * Implementasi wajib dari WebviewViewProvider
     */
    resolveWebviewView(webviewView, context, token) {
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
    getHtmlForWebview(webview) {
        const htmlPath = vscode.Uri.joinPath(this._extensionUri, 'view', 'panel.html');
        let html = fs.readFileSync(htmlPath.fsPath, 'utf8');
        const cspSource = webview.cspSource;
        // inject CSP agar aman
        html = html.replace(/<head>/i, `<head>
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${cspSource}; style-src ${cspSource}; script-src 'unsafe-inline' ${cspSource};">`);
        return html;
    }
}
exports.PontisSidebarProvider = PontisSidebarProvider;
PontisSidebarProvider.viewType = 'pontisView';
//# sourceMappingURL=PontisSidebarProvider.js.map