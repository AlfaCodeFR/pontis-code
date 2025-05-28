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

export function deactivate() {}