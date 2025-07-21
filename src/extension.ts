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
        vscode.commands.registerCommand('pontis.translateFromContextMenu', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) return;

            const selectedText = editor.document.getText(editor.selection);

            await vscode.commands.executeCommand('workbench.view.extension.pontisSidebar');

            // Simpan input sementara agar bisa digunakan nanti saat webview siap
            sidebarProviderInstance.setPendingInputText(selectedText);

            // Buka panel secara otomatis
            await vscode.commands.executeCommand('workbench.view.extension.pontisSidebar');

            // Setelah panel siap, baru kirim teks
            // vscode.commands.executeCommand('pontis.setInputText', selectedText);
        })
    );

    // context.subscriptions.push(
    //     vscode.commands.registerCommand('pontis.setInputText', (text: string) => {
    //         console.log('[Pontis] Setting input text:', text);
    //         if (sidebarProviderInstance?.view) {
    //         sidebarProviderInstance.view.webview.postMessage({
    //             type: 'setInputText',
    //             value: text
    //         });
    //         } else {
    //             console.warn('[Pontis] Webview not ready!');
    //         }
    //     })
    // );
}

export function deactivate() {}