(() => {
  const $ = (id) => document.getElementById(id);
  const presetDisplay = $("presetDisplay");
  const enteredDisplay = $("enteredDisplay");
  const resultDisplay = $("resultDisplay");
  const copyButton = $("copyButton");
  const copyStatus = $("copyStatus");
  const dialog = $("settingsDialog");
  const presetInput = $("presetInput");

  let preset = readPreset();
  let entered = "";

  function readPreset() {
    const saved = localStorage.getItem("minus-preset");
    return saved !== null && saved.trim() !== "" && Number.isFinite(Number(saved))
      ? Number(saved) : 484;
  }

  function fmt(n) {
    if (!Number.isFinite(n)) return "—";
    return new Intl.NumberFormat("sv-SE", { maximumFractionDigits: 8 }).format(n);
  }

  function render() {
    presetDisplay.textContent = fmt(preset);
    enteredDisplay.textContent = entered || "Skriv ett tal";
    const hasInput = entered !== "" && Number.isFinite(Number(entered));
    resultDisplay.textContent = hasInput ? fmt(preset - Number(entered)) : "—";
    copyButton.disabled = !hasInput;
    copyStatus.textContent = "";
  }

  function tap(key) {
    copyStatus.textContent = "";
    if (key === "clear") entered = "";
    else if (key === "backspace") entered = entered.slice(0, -1);
    else if (entered.length < 15) entered += key;
    render();
  }

  document.querySelectorAll("[data-key]").forEach((button) => {
    button.addEventListener("click", () => tap(button.dataset.key));
  });

  $("settingsButton").addEventListener("click", () => {
    presetInput.value = String(preset);
    dialog.showModal();
  });

  $("settingsForm").addEventListener("submit", (event) => {
    event.preventDefault();
    if (presetInput.value.trim() === "") return;
    const next = Number(presetInput.value);
    if (!Number.isFinite(next)) return;
    preset = next;
    localStorage.setItem("minus-preset", String(preset));
    dialog.close();
    render();
  });

  $("resetButton").addEventListener("click", () => {
    preset = 484;
    presetInput.value = "484";
  });

  copyButton.addEventListener("click", async () => {
    const value = preset - Number(entered);
    try {
      await navigator.clipboard.writeText(fmt(value));
      copyStatus.textContent = "Resultatet är kopierat.";
    } catch {
      copyStatus.textContent = "Kopiering stöds inte här. Markera resultatet och kopiera.";
    }
  });

  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    });
  }

  render();
})();
