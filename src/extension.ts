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

            const selectedText = editor.document.getText(editor.selection);

            // Simpan input sementara agar bisa digunakan nanti saat webview siap
            provider.setPendingInputText(selectedText);

            // Buka panel secara otomatis jika belum terbuka
            await vscode.commands.executeCommand('workbench.view.extension.pontisSidebar');
        })
    );
}

export function deactivate() {}