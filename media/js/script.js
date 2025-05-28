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

  window.addEventListener("message", event => {
    const message = event.data;
    switch (message.type) {
      case "setInputText":
        document.getElementById('inputBox').value = message.value;
        break;
    }
  });
})();