import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

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

		vscode.window.withProgress(
			{
				location: vscode.ProgressLocation.Notification,
				title: `Translating to ${targetLang}...`
			},
			async () => {
				const translatedCode = await mockTranslate(selectedText, sourceLang, targetLang);
				const doc = await vscode.workspace.openTextDocument({ language: targetLang, content: translatedCode });
				await vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
			}
		);
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}

function detectLanguage(langId: string): 'java' | 'csharp' {
	switch (langId) {
	  case 'java': return 'java';
	  case 'csharp': return 'csharp';
	  default: return 'java';
	}
  }
  
  async function mockTranslate(code: string, from: string, to: string): Promise<string> {
	return `// Translated from ${from} to ${to}\n${code.split('').reverse().join('')}`;
  }
