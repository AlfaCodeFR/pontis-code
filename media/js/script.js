(function () {
  const vscode = acquireVsCodeApi();

  const inputBox = document.getElementById('inputBox');
  const outputBox = document.getElementById('outputBox');
  const modelSelect = document.getElementById('modelSelect');
  const langFrom = document.getElementById('langFrom');
  const langTo = document.getElementById('langTo');
  const score = document.getElementById('score');

  document.getElementById('copyBtn').addEventListener('click', () => {
    navigator.clipboard.writeText(outputBox.value);
  });

  document.getElementById('newFileBtn').addEventListener('click', () => {
    vscode.postMessage({
      type: 'newFile',
      content: outputBox.value
    });
  });

  // TODO: Add more events like `Translate` if needed
})();