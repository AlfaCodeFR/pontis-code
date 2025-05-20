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
exports.activate = activate;
const vscode = __importStar(require("vscode"));
const axios_1 = __importDefault(require("axios"));
const TranslatorViewProvider_1 = require("./panel/TranslatorViewProvider");
const API_URL_JAVA_TO_CS = 'https://causal-simply-foal.ngrok-free.app/translate_java_to_cs';
const API_URL_CS_TO_JAVA = 'https://causal-simply-foal.ngrok-free.app/translate_cs_to_java';
function activate(context) {
    console.log('Extension "codeTranslator" is now active!');
    // Registrasi view provider SAAT AKTIVASI
    context.subscriptions.push(vscode.window.registerWebviewViewProvider(TranslatorViewProvider_1.TranslatorViewProvider.viewType, new TranslatorViewProvider_1.TranslatorViewProvider(context)));
    context.subscriptions.push(vscode.commands.registerCommand('extension.translateJavaToCSharp', () => __awaiter(this, void 0, void 0, function* () {
        yield executeTranslationCommand('Java ke C#', API_URL_JAVA_TO_CS);
    })));
    context.subscriptions.push(vscode.commands.registerCommand('extension.translateCSharpToJava', () => __awaiter(this, void 0, void 0, function* () {
        yield executeTranslationCommand('C# ke Java', API_URL_CS_TO_JAVA);
    })));
    context.subscriptions.push(vscode.commands.registerCommand('extension.showTranslatorPanel', () => {
        // Fokus ke panel secara manual
        vscode.commands.executeCommand('workbench.view.extension.pontisPanel');
    }));
}
function executeTranslationCommand(title, apiUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showErrorMessage('Tidak ada editor yang aktif.');
                return;
            }
            const selectedText = editor.document.getText(editor.selection);
            if (!selectedText) {
                vscode.window.showWarningMessage('Tidak ada teks yang dipilih.');
                return;
            }
            const translatedCode = yield vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: `Translating ${title}...`,
                cancellable: false
            }, () => __awaiter(this, void 0, void 0, function* () {
                try {
                    const result = yield callTranslationAPI(apiUrl, selectedText);
                    return result;
                }
                catch (error) {
                    console.error(`Error saat translasi ${title}:`, error);
                    vscode.window.showErrorMessage(`Terjadi kesalahan saat translasi ${title}.`);
                    return `// Error: translasi ${title} gagal.`;
                }
            }));
            if (!translatedCode || translatedCode.startsWith('// Error:')) {
                const retry = yield vscode.window.showErrorMessage(`Translasi ${title} gagal. Coba ulang?`, 'Coba Ulang', 'Batal');
                if (retry === 'Coba Ulang') {
                    yield executeTranslationCommand(title, apiUrl);
                }
                return;
            }
            const lang = apiUrl.includes('java_to_cs') ? 'csharp' : 'java';
            const outputDoc = yield vscode.workspace.openTextDocument({
                content: translatedCode,
                language: lang
            });
            vscode.window.showTextDocument(outputDoc, vscode.ViewColumn.Beside);
        }
        catch (error) {
            console.error(`Error pada command ${title}:`, error);
            vscode.window.showErrorMessage(`Command gagal dijalankan untuk ${title}.`);
        }
    });
}
function callTranslationAPI(apiUrl, code) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        console.log("Input ke API:", code);
        console.log("Menggunakan URL API:", apiUrl);
        try {
            const payload = { code };
            const response = yield axios_1.default.post(apiUrl, payload, {
                headers: { 'Content-Type': 'application/json' }
            });
            console.log('Response dari API:', response.data);
            if (response.status !== 200 || !((_a = response.data) === null || _a === void 0 ? void 0 : _a.translated_code)) {
                vscode.window.showErrorMessage(`API Error: ${response.status} - ${response.statusText}`);
                return `// Error: API tidak mengembalikan hasil translasi yang valid.`;
            }
            return formatCode(response.data.translated_code);
        }
        catch (error) {
            console.error('Error saat mengakses API:', error);
            vscode.window.showErrorMessage('Gagal mengakses API! Periksa koneksi atau server API.');
            return '// Error: Gagal mengakses API.';
        }
    });
}
function formatCode(code) {
    let indentLevel = 0;
    const indentSize = 4;
    const lines = code
        .replace(/;\s*/g, ';\n')
        .replace(/{\s*/g, '{\n')
        .replace(/}\s*/g, '}\n')
        .replace(/\)\s*{/g, ') {\n')
        .replace(/\n\s*\n/g, '\n')
        .split('\n');
    const formattedLines = lines.map(line => {
        const trimmedLine = line.trim();
        if (trimmedLine === '}') {
            indentLevel = Math.max(0, indentLevel - 1);
        }
        const indentedLine = ' '.repeat(indentLevel * indentSize) + trimmedLine;
        if (trimmedLine.endsWith('{')) {
            indentLevel++;
        }
        return indentedLine;
    });
    return formattedLines.join('\n').trim();
}
//# sourceMappingURL=extension.js.map