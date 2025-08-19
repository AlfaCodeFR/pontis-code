import * as vscode from 'vscode';
import { PontisSidebarProvider } from './PontisSidebarProvider';

export function activate(context: vscode.ExtensionContext) {
    console.log('Extension "codeTranslator" is now active!');

    const provider = new PontisSidebarProvider(context.extensionUri);
    
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('pontisView', provider)
    );
    
    console.log('Sidebar provider didaftarkan!');

    context.subscriptions.push(
        vscode.commands.registerCommand('pontis.translateFromContextMenu', () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) return;

            const selection = editor.selection;
            const selectedText = editor.document.getText(selection);

            vscode.commands.executeCommand('pontis.setInputText', selectedText);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('pontis.setInputText', (text: string) => {
            if (provider?.view) {
            provider.view.webview.postMessage({
                type: 'setInputText',
                value: text
            });
            }
        })
    );
}

export function deactivate() {}