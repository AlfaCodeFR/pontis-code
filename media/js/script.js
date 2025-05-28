(function () {
  const vscode = acquireVsCodeApi();

  document.getElementById('translateBtn').addEventListener('click', () => {
    const input = document.getElementById('inputBox').value;
    const model = document.getElementById('modelSelect').value;
    const source = document.getElementById('langFrom').value;
    const target = document.getElementById('langTo').value;

    vscode.postMessage({
      type: 'translate',
      value: {
        inputCode: input,
        model: model,
        langFrom: source,
        langTo: target
      }
    });
  });

  window.addEventListener('message', (event) => {
    const msg = event.data;

    if (msg.type === 'setInputText') {
      document.getElementById('inputBox').value = msg.value;
    } else if (msg.type === 'output') {
      document.getElementById('outputBox').value = msg.value;
    }
  });

  const outputBox = document.getElementById('outputBox');

  // Copy Button Handler
  document.getElementById('copyBtn').addEventListener('click', async () => {
    const output = outputBox.value;
    try {
      await navigator.clipboard.writeText(output);
      alert("Output berhasil disalin ke clipboard!");
    } catch (err) {
      console.error("Clipboard copy error:", err);
      alert("Gagal menyalin output.");
    }
  });

  // Add New File Button Handler
  document.getElementById('newFileBtn').addEventListener('click', () => {
    const output = document.getElementById('outputBox').value;
    const langTo = document.getElementById('langTo').value;

    vscode.postMessage({
      type: 'createNewFile',
      value: output,
      lang: langTo
    });
  });
})();