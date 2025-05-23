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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TranslatorViewProvider = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
class TranslatorViewProvider {
    constructor(context) {
        this.context = context;
    }
    resolveWebviewView(webviewView) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this.context.extensionUri]
        };
        // Path ke HTML
        const htmlPath = vscode.Uri.joinPath(this.context.extensionUri, "media", "translatorPanel.html");
        // Baca konten HTML
        const htmlContent = fs.readFileSync(htmlPath.fsPath, "utf-8");
        // Tambahkan CSP dan proses resource
        const processedHtml = htmlContent
            .replace(/(<link.+?href="|<script.+?src="|<img.+?src=")(.+?)"/g, (_, prefix, src) => {
            const resourceUri = vscode.Uri.joinPath(this.context.extensionUri, src);
            const webviewUri = webviewView.webview.asWebviewUri(resourceUri);
            return `${prefix}${webviewUri}"`;
        })
            .replace("</head>", `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src ${webviewView.webview.cspSource} 'unsafe-inline'; style-src ${webviewView.webview.cspSource} 'unsafe-inline';"></head>`);
        webviewView.webview.html = processedHtml;
        console.log('Resolving webview view');
        console.log('Extension URI:', this.context.extensionUri.fsPath);
        console.log('HTML path:', htmlPath.fsPath);
        console.log("Webview URI:", htmlContent.toString());
        console.log("Webview URI:", htmlPath.toString());
        console.log("HTML Content:", htmlContent.substring(0, 100)); // Cek 100 karakter pertama
        webviewView.webview.onDidReceiveMessage((message) => __awaiter(this, void 0, void 0, function* () {
            if (message.command === 'translate') {
                const apiUrl = message.source === 'java'
                    ? 'https://causal-simply-foal.ngrok-free.app/translate_java_to_cs'
                    : 'https://causal-simply-foal.ngrok-free.app/translate_cs_to_java';
                const translated = yield callTranslationAPI(apiUrl, message.code);
                webviewView.webview.postMessage({ command: 'result', code: translated });
            }
            if (message.command === 'copy') {
                yield vscode.env.clipboard.writeText(message.code);
                vscode.window.showInformationMessage('Code copied to clipboard.');
            }
            if (message.command === 'open') {
                const lang = message.lang === 'java' ? 'java' : 'csharp';
                const doc = yield vscode.workspace.openTextDocument({ language: lang, content: message.code });
                vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
            }
        }));
    }
}
exports.TranslatorViewProvider = TranslatorViewProvider;
TranslatorViewProvider.viewType = 'pontis.translatorView';
function callTranslationAPI(apiUrl, code) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code })
            });
            const data = yield response.json();
            return data.translated_code || '// Error: no result';
        }
        catch (e) {
            return '// Error accessing API';
        }
    });
}
//# sourceMappingURL=TranslatorViewProvider.js.map