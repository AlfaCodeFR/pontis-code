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
        vscode.commands.registerCommand('pontis.translateFromContextMenu', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showInformationMessage('No code selected');
                return;
            }
        })
    );
}

export function deactivate() {}