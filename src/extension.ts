import * as vscode from 'vscode';
import axios from 'axios';
import { TranslatorViewProvider } from './panel/TranslatorViewProvider';

const API_URL_JAVA_TO_CS = 'https://causal-simply-foal.ngrok-free.app/translate_java_to_cs';
const API_URL_CS_TO_JAVA = 'https://causal-simply-foal.ngrok-free.app/translate_cs_to_java';

export function activate(context: vscode.ExtensionContext) {
    console.log('Extension "codeTranslator" is now active!');

    // Registrasi view provider SAAT AKTIVASI
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
        TranslatorViewProvider.viewType,
        new TranslatorViewProvider(context)
        )
    );

    context.subscriptions.push(vscode.commands.registerCommand('extension.translateJavaToCSharp', async () => {
        await executeTranslationCommand('Java ke C#', API_URL_JAVA_TO_CS);
    }));

    context.subscriptions.push(vscode.commands.registerCommand('extension.translateCSharpToJava', async () => {
        await executeTranslationCommand('C# ke Java', API_URL_CS_TO_JAVA);
    }));

    context.subscriptions.push(vscode.commands.registerCommand('extension.showTranslatorPanel', () => {
        // Fokus ke panel secara manual
        vscode.commands.executeCommand('workbench.view.extension.pontisPanel');
    }));
}

async function executeTranslationCommand(title: string, apiUrl: string) {
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

        const translatedCode = await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: `Translating ${title}...`,
            cancellable: false
        }, async () => {
            try {
                const result = await callTranslationAPI(apiUrl, selectedText);
                return result;
            } catch (error) {
                console.error(`Error saat translasi ${title}:`, error);
                vscode.window.showErrorMessage(`Terjadi kesalahan saat translasi ${title}.`);
                return `// Error: translasi ${title} gagal.`;
            }
        });

        if (!translatedCode || translatedCode.startsWith('// Error:')) {
            const retry = await vscode.window.showErrorMessage(`Translasi ${title} gagal. Coba ulang?`, 'Coba Ulang', 'Batal');
            if (retry === 'Coba Ulang') {
                await executeTranslationCommand(title, apiUrl);
            }
            return;
        }

        const lang = apiUrl.includes('java_to_cs') ? 'csharp' : 'java';
        const outputDoc = await vscode.workspace.openTextDocument({
            content: translatedCode,
            language: lang
        });
        vscode.window.showTextDocument(outputDoc, vscode.ViewColumn.Beside);
    } catch (error) {
        console.error(`Error pada command ${title}:`, error);
        vscode.window.showErrorMessage(`Command gagal dijalankan untuk ${title}.`);
    }
}

async function callTranslationAPI(apiUrl: string, code: string): Promise<string> {
    console.log("Input ke API:", code);
    console.log("Menggunakan URL API:", apiUrl);

    try {
        const payload = { code };
        const response = await axios.post(apiUrl, payload, {
            headers: { 'Content-Type': 'application/json' }
        });

        console.log('Response dari API:', response.data);

        if (response.status !== 200 || !response.data?.translated_code) {
            vscode.window.showErrorMessage(`API Error: ${response.status} - ${response.statusText}`);
            return `// Error: API tidak mengembalikan hasil translasi yang valid.`;
        }

        return formatCode(response.data.translated_code);
    } catch (error) {
        console.error('Error saat mengakses API:', error);
        vscode.window.showErrorMessage('Gagal mengakses API! Periksa koneksi atau server API.');
        return '// Error: Gagal mengakses API.';
    }
}

function formatCode(code: string): string {
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
        if (trimmedLine === '}') {indentLevel = Math.max(0, indentLevel - 1);}
        const indentedLine = ' '.repeat(indentLevel * indentSize) + trimmedLine;
        if (trimmedLine.endsWith('{')) {indentLevel++;}
        return indentedLine;
    });

    return formattedLines.join('\n').trim();
  }
