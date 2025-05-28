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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const PontisSidebarProvider_1 = require("./PontisSidebarProvider");
function activate(context) {
    console.log('Extension "codeTranslator" is now active!');
    const sidebarProviderInstance = new PontisSidebarProvider_1.PontisSidebarProvider(context.extensionUri);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider('pontisView', sidebarProviderInstance));
    console.log('Sidebar provider didaftarkan!');
    context.subscriptions.push(vscode.commands.registerCommand('pontis.translateFromContextMenu', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor)
            return;
        const selectedText = editor.document.getText(editor.selection);
        vscode.commands.executeCommand('pontis.setInputText', selectedText);
    }));
    context.subscriptions.push(vscode.commands.registerCommand('pontis.setInputText', (text) => {
        if (sidebarProviderInstance === null || sidebarProviderInstance === void 0 ? void 0 : sidebarProviderInstance.view) {
            sidebarProviderInstance.view.webview.postMessage({
                type: 'setInputText',
                value: text
            });
        }
    }));
}
// async function executeTranslationCommand(title: string, apiUrl: string) {
//     try {
//         const editor = vscode.window.activeTextEditor;
//         if (!editor) {
//             vscode.window.showErrorMessage('Tidak ada editor yang aktif.');
//             return;
//         }
//         const selectedText = editor.document.getText(editor.selection);
//         if (!selectedText) {
//             vscode.window.showWarningMessage('Tidak ada teks yang dipilih.');
//             return;
//         }
//         const translatedCode = await vscode.window.withProgress({
//             location: vscode.ProgressLocation.Notification,
//             title: `Translating ${title}...`,
//             cancellable: false
//         }, async () => {
//             try {
//                 const result = await callTranslationAPI(apiUrl, selectedText);
//                 return result;
//             } catch (error) {
//                 console.error(`Error saat translasi ${title}:`, error);
//                 vscode.window.showErrorMessage(`Terjadi kesalahan saat translasi ${title}.`);
//                 return `// Error: translasi ${title} gagal.`;
//             }
//         });
//         if (!translatedCode || translatedCode.startsWith('// Error:')) {
//             const retry = await vscode.window.showErrorMessage(`Translasi ${title} gagal. Coba ulang?`, 'Coba Ulang', 'Batal');
//             if (retry === 'Coba Ulang') {
//                 await executeTranslationCommand(title, apiUrl);
//             }
//             return;
//         }
//         const lang = apiUrl.includes('java_to_cs') ? 'csharp' : 'java';
//         const outputDoc = await vscode.workspace.openTextDocument({
//             content: translatedCode,
//             language: lang
//         });
//         vscode.window.showTextDocument(outputDoc, vscode.ViewColumn.Beside);
//     } catch (error) {
//         console.error(`Error pada command ${title}:`, error);
//         vscode.window.showErrorMessage(`Command gagal dijalankan untuk ${title}.`);
//     }
// }
// async function callTranslationAPI(apiUrl: string, code: string): Promise<string> {
//     console.log("Input ke API:", code);
//     console.log("Menggunakan URL API:", apiUrl);
//     try {
//         const payload = { code };
//         const response = await axios.post(apiUrl, payload, {
//             headers: { 'Content-Type': 'application/json' }
//         });
//         console.log('Response dari API:', response.data);
//         if (response.status !== 200 || !response.data?.translated_code) {
//             vscode.window.showErrorMessage(`API Error: ${response.status} - ${response.statusText}`);
//             return `// Error: API tidak mengembalikan hasil translasi yang valid.`;
//         }
//         return formatCode(response.data.translated_code);
//     } catch (error) {
//         console.error('Error saat mengakses API:', error);
//         vscode.window.showErrorMessage('Gagal mengakses API! Periksa koneksi atau server API.');
//         return '// Error: Gagal mengakses API.';
//     }
// }
// function formatCode(code: string): string {
//     let indentLevel = 0;
//     const indentSize = 4;
//     const lines = code
//         .replace(/;\s*/g, ';\n')
//         .replace(/{\s*/g, '{\n')
//         .replace(/}\s*/g, '}\n')
//         .replace(/\)\s*{/g, ') {\n')
//         .replace(/\n\s*\n/g, '\n')
//         .split('\n');
//     const formattedLines = lines.map(line => {
//         const trimmedLine = line.trim();
//         if (trimmedLine === '}') {indentLevel = Math.max(0, indentLevel - 1);}
//         const indentedLine = ' '.repeat(indentLevel * indentSize) + trimmedLine;
//         if (trimmedLine.endsWith('{')) {indentLevel++;}
//         return indentedLine;
//     });
//     return formattedLines.join('\n').trim();
// }
function deactivate() { }
//# sourceMappingURL=extension.js.map