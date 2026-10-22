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

  function parseLocalNumber(value) {
    // Accept both Swedish decimal comma and decimal point.
    const normalized = String(value).trim().replace(/\s/g, "").replace(",", ".");
    if (normalized === "" || normalized === "." || normalized === "-") return NaN;
    return Number(normalized);
  }

  function readPreset() {
    const saved = localStorage.getItem("minus-preset");
    if (saved !== null && Number.isFinite(parseLocalNumber(saved))) {
      return parseLocalNumber(saved);
    }
    return 484;
  }

  function fmt(n) {
    if (!Number.isFinite(n)) return "—";
    return new Intl.NumberFormat("sv-SE", {
      maximumFractionDigits: 8,
      useGrouping: false
    }).format(n);
  }

  function render() {
    presetDisplay.textContent = fmt(preset);
    enteredDisplay.textContent = entered || "Skriv ett tal";
    const hasInput = entered !== "" && Number.isFinite(parseLocalNumber(entered));
    resultDisplay.textContent = hasInput ? fmt(preset - parseLocalNumber(entered)) : "—";
    copyButton.disabled = !hasInput;
    copyStatus.textContent = "";
  }

  function tap(key) {
    copyStatus.textContent = "";
    if (key === "clear") {
      entered = "";
    } else if (key === "backspace") {
      entered = entered.slice(0, -1);
    } else if (key === "decimal") {
      if (!entered.includes(",") && !entered.includes(".")) {
        entered = entered === "" ? "0," : entered + ",";
      }
    } else if (/^\d$/.test(key) && entered.length < 20) {
      entered += key;
    }
    render();
  }

  document.querySelectorAll("[data-key]").forEach((button) => {
    button.addEventListener("click", () => tap(button.dataset.key));
  });

  $("settingsButton").addEventListener("click", () => {
    presetInput.value = fmt(preset);
    dialog.showModal();
  });

  $("settingsForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const next = parseLocalNumber(presetInput.value);
    if (!Number.isFinite(next)) {
      presetInput.focus();
      return;
    }
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
    const value = preset - parseLocalNumber(entered);
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
