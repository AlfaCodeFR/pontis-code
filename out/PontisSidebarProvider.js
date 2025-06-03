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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PontisSidebarProvider = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const axios_1 = __importDefault(require("axios"));
class PontisSidebarProvider {
    constructor(_extensionUri) {
        this._extensionUri = _extensionUri;
    }
    resolveWebviewView(webviewView) {
        this.view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.joinPath(this._extensionUri, 'media'),
                vscode.Uri.joinPath(this._extensionUri, 'view')
            ]
        };
        webviewView.webview.html = this.getHtmlForWebview(webviewView.webview);
        webviewView.webview.onDidReceiveMessage((message) => __awaiter(this, void 0, void 0, function* () {
            switch (message.type) {
                case 'translate':
                    const { inputCode, langFrom, langTo, model } = message.value;
                    vscode.window.withProgress({
                        location: vscode.ProgressLocation.Window,
                        title: "Translating with Pontis...",
                        cancellable: false
                    }, (progress) => __awaiter(this, void 0, void 0, function* () {
                        progress.report({ message: `Using model ${model}...` });
                        try {
                            const response = yield axios_1.default.post('https://causal-simply-foal.ngrok-free.app/translate', {
                                code: inputCode,
                                model: model,
                                source_lang: langFrom,
                                target_lang: langTo
                            });
                            const translated = response.data.translated_code || '// Translation failed.';
                            webviewView.webview.postMessage({ type: 'output', value: translated });
                        }
                        catch (err) {
                            const errorMsg = err.message || 'Unknown error';
                            webviewView.webview.postMessage({
                                type: 'output',
                                value: `// JS Error: ${errorMsg}`
                            });
                            vscode.window.showErrorMessage(`Translation failed: ${errorMsg}`);
                        }
                    }));
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
                    const newDoc = yield vscode.workspace.openTextDocument({
                        content: value,
                        language: languageId
                    });
                    vscode.window.showTextDocument(newDoc, vscode.ViewColumn.Beside);
                    break;
                }
            }
        }));
    }
    getHtmlForWebview(webview) {
        const htmlPath = vscode.Uri.joinPath(this._extensionUri, 'view', 'panel.html');
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'js', 'script.js'));
        const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'css', 'style.css'));
        const nonce = getNonce();
        const cspSource = webview.cspSource;
        let html = fs.readFileSync(htmlPath.fsPath, 'utf8');
        html = html
            .replace(/%%SCRIPT_URI%%/g, scriptUri.toString())
            .replace(/%%NONCE%%/g, nonce)
            .replace(/<link href="\$\{styleUri\}"/, `<link href="${styleUri}"`);
        html = html.replace(/<head>/i, `<head>
          <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${cspSource}; style-src ${cspSource}; script-src 'nonce-${nonce}';">`);
        return html;
    }
}
exports.PontisSidebarProvider = PontisSidebarProvider;
PontisSidebarProvider.viewType = 'pontisView';
function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
//# sourceMappingURL=PontisSidebarProvider.js.map