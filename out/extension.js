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
function deactivate() { }
//# sourceMappingURL=extension.js.map