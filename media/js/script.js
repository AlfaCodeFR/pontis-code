(function () {
  const vscode = acquireVsCodeApi();

  const languageSupport = {
    "microsoft/Phi-4-mini-instruct": ['C', 'C++', 'CSharp', 'Go', 'Java', 'Javascript', 'Typescript',  'Python', 'Kotlin', 'PHP', 'Rust', 'Swift', 'Scala', 'Ruby',  'Dart'],
    "deepseek-ai/deepseek-coder-6.7b-instruct": ['C', 'C++', 'CSharp', 'Go', 'Java', 'Javascript', 'Typescript',  'Python', 'Kotlin', 'PHP', 'Rust', 'Swift', 'Scala', 'Ruby',  'Dart'],
    "Qwen/Qwen2.5-Coder-3B-Instruct": ['C', 'C++', 'CSharp', 'Go', 'Java', 'Javascript', 'Typescript',  'Python', 'Kotlin', 'PHP', 'Rust', 'Swift', 'Scala', 'Ruby',  'Dart'],
    "Salesforce/codet5-base": ['Java', 'C#'],
    "uclanlp/plbart-base": ['Java', 'C#']
  };

  const modelSelect = document.getElementById("modelSelect");
  const langFromSelect = document.getElementById("langFrom");
  const langToSelect = document.getElementById("langTo");

  modelSelect.addEventListener("change", () => {
    const selectedModel = modelSelect.value;
    const supportedLangs = languageSupport[selectedModel] || [];

    // Bersihkan dropdown
    langFromSelect.innerHTML = "";
    langToSelect.innerHTML = "";

    // Tambahkan opsi sesuai model
    supportedLangs.forEach((lang) => {
      const optionFrom = document.createElement("option");
      optionFrom.value = lang;
      optionFrom.textContent = lang;
      langFromSelect.appendChild(optionFrom);

      const optionTo = document.createElement("option");
      optionTo.value = lang;
      optionTo.textContent = lang;
      langToSelect.appendChild(optionTo);
    });

    // Default bahasa sumber dan target
    if (supportedLangs.length > 1) {
      langToSelect.selectedIndex = 1;
    }
  });

  // Inisialisasi sekali saat halaman dimuat
  modelSelect.dispatchEvent(new Event("change"));

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