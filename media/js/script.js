(function () {
  const vscode = acquireVsCodeApi();

  const languageSupport = {
    "microsoft/Phi-4-mini-instruct": ['C', 'C++', 'C#', 'Dart', 'Go', 'Java', 'Javascript', 'Kotlin', 'PHP', 'Python', 'R','Ruby', 'Rust', 'Scala', 'Swift', 'Typescript'],
    "deepseek-ai/deepseek-coder-6.7b-instruct": ['C', 'C++', 'C#', 'Dart', 'Go', 'Java', 'Javascript', 'Kotlin', 'PHP', 'Python', 'R', 'Ruby', 'Rust', 'Scala', 'Swift', 'Typescript'],
    "Qwen/Qwen2.5-Coder-7B-Instruct": ['C', 'C++', 'C#', 'Dart', 'Go', 'Java', 'Javascript', 'Kotlin', 'PHP', 'Python', 'R', 'Ruby', 'Rust', 'Scala', 'Swift', 'Typescript'],
    "Salesforce/codet5-base": ['Java', 'C#'],
    "uclanlp/plbart-base": ['Java', 'C#']
  };

  const modelSelect = document.getElementById("modelSelect");
  const langFromSelect = document.getElementById("langFrom");
  const langToSelect = document.getElementById("langTo");
  const inputBox = document.getElementById("inputBox");
  const outputBox = document.getElementById("outputBox");

  // Simpan state lokal
  function saveState() {
    const state = {
      input: inputBox.value,
      output: outputBox.value,
      model: modelSelect.value,
      langFrom: langFromSelect.value,
      langTo: langToSelect.value,
      timestamp: Date.now() // tambahkan waktu penyimpanan
    };
    vscode.setState(state);
  }

  // Restore state saat webview load
  window.addEventListener('load', () => {
    vscode.postMessage({ type: 'ready' }); // Kirim sinyal bahwa panel siap
    
    const previousState = vscode.getState();

    // Cek jika state terlalu lama (lebih dari 5 menit)
    const maxAge = 1000 * 60 * 5; // 5 menit
    const isStateFresh = previousState && Date.now() - previousState.timestamp < maxAge;

    if (isStateFresh) {
      inputBox.value = previousState.input || '';
      outputBox.value = previousState.output || '';
      modelSelect.value = previousState.model || '';

      modelSelect.dispatchEvent(new Event("change")); // Perbarui dropdown

      // Delay agar dropdown bahasa sempat terisi
      setTimeout(() => {
        langFromSelect.value = previousState.langFrom || '';
        langToSelect.value = previousState.langTo || '';
        saveState();
      }, 50);
    } else {
      vscode.setState(null);
      modelSelect.dispatchEvent(new Event("change"));
    }
  });

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

    if (supportedLangs.length > 1) {
      langToSelect.selectedIndex = 1;
    }

    saveState();
  });

  // Simpan perubahan saat user mengetik/memilih
  inputBox.addEventListener("input", saveState);
  outputBox.addEventListener("input", saveState);
  langFromSelect.addEventListener("change", saveState);
  langToSelect.addEventListener("change", saveState);

  document.getElementById('translateBtn').addEventListener('click', () => {
    const input = inputBox.value;
    const model = modelSelect.value;
    const source = langFromSelect.value;
    const target = langToSelect.value;

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
      console.log('[Pontis Frontend] Setting input text from backend');
      document.getElementById('inputBox').value = msg.value;
      
      saveState();
    } else if (msg.type === 'output') {
      document.getElementById('outputBox').value = msg.value;
    }
  });

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