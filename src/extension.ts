import * as vscode from 'vscode';
import { PontisSidebarProvider } from './PontisSidebarProvider';

export function activate(context: vscode.ExtensionContext) {
    console.log('Extension "codeTranslator" is now active!');

    const sidebarProviderInstance = new PontisSidebarProvider(context.extensionUri);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('pontisView', sidebarProviderInstance)
    );
    
    console.log('Sidebar provider didaftarkan!');

    context.subscriptions.push(
        vscode.commands.registerCommand('pontis.translateFromContextMenu', () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) return;

            const selectedText = editor.document.getText(editor.selection);
            vscode.commands.executeCommand('pontis.setInputText', selectedText);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('pontis.setInputText', (text: string) => {
            if (sidebarProviderInstance?.view) {
            sidebarProviderInstance.view.webview.postMessage({
                type: 'setInputText',
                value: text
            });
            }
        })
    );
}

export function deactivate() {}