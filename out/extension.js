"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) {k2 = k;}
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) {k2 = k;}
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
            for (var k in o) {if (Object.prototype.hasOwnProperty.call(o, k)) {ar[ar.length] = k;}}
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) {return mod;}
        var result = {};
        if (mod !== null) {for (var k = ownKeys(mod), i = 0; i < k.length; i++) {if (k[i] !== "default") {__createBinding(result, mod, k[i]);}}}
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
function activate(context) {
    console.log('Pontis Code activated!');
    const disposable = vscode.commands.registerCommand('pontis-code.translateCode', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }
        const selectedText = editor.document.getText(editor.selection);
        if (!selectedText) {
            vscode.window.showInformationMessage('Please select some code to translate.');
            return;
        }
        const sourceLang = detectLanguage(editor.document.languageId);
        const targetLang = sourceLang === 'java' ? 'csharp' : 'java';
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: `Translating to ${targetLang}...`
        }, async () => {
            const translatedCode = await mockTranslate(selectedText, sourceLang, targetLang);
            const doc = await vscode.workspace.openTextDocument({ language: targetLang, content: translatedCode });
            await vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
        });
    });
    context.subscriptions.push(disposable);
}
function deactivate() { }
function detectLanguage(langId) {
    switch (langId) {
        case 'java': return 'java';
        case 'csharp': return 'csharp';
        default: return 'java';
    }
}
async function mockTranslate(code, from, to) {
    return `// Translated from ${from} to ${to}\n${code.split('').reverse().join('')}`;
}
//# sourceMappingURL=extension.js.map