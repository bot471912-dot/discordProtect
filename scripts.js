function toggleLoader(show) {
  const loader = document.getElementById("page-loader");
  if (!loader) return;
  if (show) {
    loader.classList.remove("fade-out");
    loader.style.display = "flex";
  } else {
    loader.classList.add("fade-out");
    setTimeout(() => {
      if (loader.parentNode) {
        loader.parentNode.removeChild(loader);
      }
    }, 300);
  }
}

function bindNavigationEvents() {
  const links = Array.from(document.querySelectorAll("a[href$='.html']"));
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  links.forEach((link) => {
    link.addEventListener("click", function (event) {
      const href = this.getAttribute("href");
      if (!href || href.startsWith("#") || href === currentPage) return;
      event.preventDefault();
      toggleLoader(true);
      setTimeout(() => {
        window.location.href = href;
      }, 320);
    });
  });
}

function showCaptchaOverlay() {
  const overlay = document.getElementById("captcha-overlay");
  if (!overlay) return;
  overlay.classList.add("active");
}

function hideCaptchaOverlay() {
  const overlay = document.getElementById("captcha-overlay");
  if (!overlay) return;
  overlay.classList.remove("active");
}

function lockPageContent() {
  const shell = document.querySelector(".page-shell");
  if (!shell) return;
  shell.classList.add("locked");
}

function unlockPageContent() {
  const shell = document.querySelector(".page-shell");
  if (!shell) return;
  shell.classList.remove("locked");
}

function bindCaptcha() {
  const overlay = document.getElementById("captcha-overlay");
  const challengeText = document.getElementById("captcha-challenge");
  const imageGrid = document.getElementById("captcha-image-grid");
  const input = document.getElementById("captcha-input");
  const refreshButton = document.getElementById("captcha-refresh-code");
  const errorMessage = document.getElementById("captcha-error");
  const submit = document.getElementById("captcha-submit");
  const cancel = document.getElementById("captcha-cancel");
  if (!overlay || !challengeText || !imageGrid || !input || !refreshButton || !errorMessage || !submit || !cancel) return;

  const digitImages = {
    0: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAYAAACOEfKtAAAAvElEQVR4nO3QwQnAIBREwbQg6b/WpAVJhF1xhL3K+3ONcT8zS73ZvtQugAABAgQIECBAgAABfgBsP6S9DyBAgAABFge29wEECBAgwEDg6gcQIECAAAECBAgQIMCTAdv/AwgQIECAAAECBAgQ4E6AqUMAAgQIECBAgAABAgR4MmAqsL0PIECAAAEWB7b3AQQIEODRgKsPWf1SMAABAgQIECDANBBAgHkkgA2ABhBg4wACBLj1AAIEuPUA/twLZ1O7T/+WawsAAAAASUVORK5CYII=",
    1: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAYAAACOEfKtAAAAsklEQVR4nO3Q0QmAQAwFQVsQ+69VWxA8yS3Mg/0OmeM8r3tlb7f67lQHQIAAywEECDAdQIAA070GXL3pxwFuEkCAANMBBAgwHUCAEcDV0NOPA9wkgAABpgMIEGA6gAABpgMIEGA6gAABpgMIEGA6gAABpgMIEGA6gAABpgMIEGA6gAABpgMIEGA6gAAjgFObBgIIcB4JIMB9AwgQIECAAP8HFECAOwYQIMB0AAECTAfwYw8hOfOZEK6gQAAAAABJRU5ErkJggg==",
    2: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAYAAACOEfKtAAAAx0lEQVR4nO3Q0Q2DQBBDQVpA6b9W0gKKJbxLxtL7vr05zvNz3am1u/e1OgACBAgQIECAAAECBPgD4PSPTL8PIECAAAEOPnD6fQABAgT414CthwECBAgQIECAbSCAAPtIAAE+/+HpMAABAgQIECDANhBAgH0kgBMA3/JhgMMCCBDg6gACBLg6gADLgGAAAtwcQIAAVwcQIMDVAXwKcPoAhgMYDmA4gOEAhgMYDmA4gOEAhqsBth5+SwABAlwdQIAAVwcQIMDVfQF2f2KT3CSaFgAAAABJRU5ErkJggg==",
    3: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAYAAACOEfKtAAAAxUlEQVR4nO3RwQmAMBREwbQg9l+rViCIirshE3hn949j2/bjTql3d1+qARAgQIAAAQIECBAgwAeA7Ye07wMIECBAgMUD2/cBBAgQ4NKAqQ8DBAgQIECAANNAAAHmkQAC/P/gdhiAAAECBAgQYBoIIMA8EsCZAFM/BCBAgJUBBAgQIECAAAFeALYPbN8HECBAgACLB7bvAwgQIMClAb8+5OuXggEIECBAgAABpoEAAswjAWwAFECAjQEECHDqAAIEOHUAX3YCRMJMZElXR3wAAAAASUVORK5CYII=",
    4: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAYAAACOEfKtAAAAvUlEQVR4nO3Q0QmAMBBEQVsQ+69VWxA2sheZB/ud3Bzned2Nva31v7c7AAIECBAgQIAAAQIEOABwdW0ggAD7SAABzh1AgAABAgT4PeDqgwECBAhwwAACBAgQIECANcDWIQABAgQ4YAABAgQIECDA8YDTAxgGMAxgGMAwgGEAwwCGAQwDGFYDbD08HQYgQIAAAQIE2AYCCLCPBBDg3AEECBAgQIAAAQIECHAnwL8MIECAWw8gQIBbDyBAgFvvAfosTGQCAxpTAAAAAElFTkSuQmCC",
    5: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAYAAACOEfKtAAAAzElEQVR4nO3QwQ3CAAwEwbQQ0X+toYPwcMSdYU7avz3H9SM7z1ekI/34UwM4HMDhAA4HcDiAwwEcDuBwAIerB0wd2B5AgABXBxAgwNUBBAhwdQABAlwdQIAAVwcQIMDVAfwWYGppIIAA80gAAfYGECDA26WBAALMI90Cpg/4VDs0QIAAAQIsDiBAgAABFgO2H9h+H0CAAAECLD6w/T6AAAEC/GvApx95eikYgAABAgQIEGAaCCDAPBLA BkABBNgYQIAAVwcQIMDVARz2BqbqjvGJPaD2AAAAAElFTkSuQmCC",
    6: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAYAAACOEfKtAAAAxUlEQVR4nO3QwRHCAAwDwbSQof9aSQf54CAZ1jP3l/c4z9d7sumb3jfdARAgQIAAAQIECBAgwAcBf+VhgGUBBAhwdQABAlwdQIBhQDAAAW4OIECAqwMIEODqAH4LMHVpIIAA80gAAfYGECDA20sDAQSYRxoBTA1s3wcQIECAAIsHtu8DCBAgQIDFA9v3AQQIECDA4oHt+wACBAjwrwGnH5m+FAxAgAABAgQIMA0EEGAeCWADoAACbAwgQICrAwgQ4OoAftgF4WJik7xX4BwAAAAASUVORK5CYII=",
    7: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAYAAACOEfKtAAAAuklEQVR4nO3bwQnDQBAEQaUgnH+sdgqGNV61VAP9Prb+d7xvsvN8rXRsH/6rARwO4HAAhwM4HMDhAA4HcDiAw60Bbj38bQABAgQIECBAgAABAgT4HBiAAAECBAgQ4DYQQID7SABLgHeBAQiwEUCAANMBBAgwHcB/AT4NBiDARgABAkwHECDAdAABAkwHECDAdAABAkwHECDAdAABAkwHECDAdAABAkx3+S//Vw8gQIDpAAIEmA4gQIDpPgZ2CdepTSSVAAAAAElFTkSuQmCC",
    8: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAYAAACOEfKtAAAAx0lEQVR4nO3Q0QnDQAwFQbdwpP9anRZMfEFrPIL3v5pjrc95ZVN3tW9qB0CAAAECBAgQIECAAH8ArD9S7wMIECBAgOHAeh9AgAABAgwH1vsAAgQIEGA4sN4HECBAgK8G3P3I7puCAQgQIECAAAFOAwEEOI8E8J+A9UfqfQABAgQIMBxY7wMIECBAgOHAeh9AgAABAgwH1vsAAgQI8NWAux/ZfVMwAAECBAgQIMBpIIAA55EAFgANIMDiAAIE+OgBBAjw0QN4c1/iKY7xgLj9AgAAAABJRU5ErkJggg==",
    9: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAYAAACOEfKtAAAAw0lEQVR4nO3Q0QmEAAxEQVsQ+6/1rgVxhWxwHux/Msd5Xr87m+rufVM7AAIECBAgQIAAAQIE+ACw/ZH2+wACBAgQYPGB7fcBBAgQIMDiA9vvAwgQIECAxQe23wcQIECAnwZ8+5GpAIYBDAMYBjAMYBjAMIBhAMMAhtUDTg0gQIAAAQIECBAgQIAAvwMDECBAgAABApwGAghwHglgA+DbTT8OsGQAAQJcPYAAAa4eQIBLAA0gwMYBBAhw9QACBLh6AMP9AdirYpPv1bg0AAAAAElFTkSuQmCC"
  };
  let activeCode = "";

  const renderCaptcha = () => {
    activeCode = Array.from({ length: 5 }, () => String(Math.floor(Math.random() * 10))).join("");
    imageGrid.innerHTML = "";
    activeCode.split("").forEach((digit) => {
      const cell = document.createElement("div");
      cell.className = "captcha-image-cell";
      const img = document.createElement("img");
      img.src = digitImages[digit];
      img.alt = `Chiffre ${digit}`;
      img.className = "captcha-digit-image";
      cell.appendChild(img);
      cell.style.transform = `rotate(${Math.floor(Math.random() * 21) - 10}deg) scale(${(Math.random() * 0.12) + 0.94})`;
      cell.style.background = `linear-gradient(135deg, rgba(255,255,255,${0.06 + Math.random() * 0.08}), rgba(255,255,255,0))`;
      imageGrid.appendChild(cell);
    });
    errorMessage.classList.remove("visible");
    input.value = "";
    challengeText.textContent = "Saisissez le code affiché sur les blocs ci-dessous :";
  };

  refreshButton.addEventListener("click", function () {
    renderCaptcha();
    input.focus();
  });

  submit.addEventListener("click", function () {
    const value = input.value.trim();
    if (!value) {
      errorMessage.textContent = "Veuillez entrer le code visible.";
      errorMessage.classList.add("visible");
      input.classList.add("captcha-input-error");
      setTimeout(() => input.classList.remove("captcha-input-error"), 500);
      return;
    }

    if (value === activeCode) {
      hideCaptchaOverlay();
      unlockPageContent();
      errorMessage.classList.remove("visible");
      input.value = "";
    } else {
      errorMessage.textContent = "Code incorrect, essayez encore.";
      errorMessage.classList.add("visible");
      input.classList.add("captcha-input-error");
      setTimeout(() => input.classList.remove("captcha-input-error"), 500);
    }
  });

  cancel.addEventListener("click", function () {
    window.location.href = "index.html";
  });

  renderCaptcha();
}

function initRefreshButton() {
  const refreshButton = document.getElementById("refresh-button");
  const updateMeta = document.querySelector(".update-meta");
  const tableBody = document.querySelector("tbody");
  if (!refreshButton || !updateMeta || !tableBody) return;

  const sourceUrl = refreshButton.dataset.source || "https://raw.githubusercontent.com/bot471912-dot/discordProtect/refs/heads/main/blacklist.txt";

  const createCell = (text, className) => {
    const cell = document.createElement("td");
    if (className) cell.className = className;
    cell.textContent = text || "";
    return cell;
  };

  const renderRows = (items) => {
    tableBody.innerHTML = "";
    items.forEach((item) => {
      const row = document.createElement("tr");
      row.appendChild(createCell(item.id));
      row.appendChild(createCell(item.user));
      row.appendChild(createCell(item.reason));
      row.appendChild(createCell(item.date));
      const status = String(item.status || "").trim();
      row.appendChild(createCell(status, status.toLowerCase().replace(/\s+/g, "-")));
      tableBody.appendChild(row);
    });
  };

  const updateTimestamp = (message) => {
    if (message) {
      updateMeta.textContent = message;
      return;
    }
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    updateMeta.textContent = `Dernière mise à jour : ${hours}:${minutes}`;
  };

  refreshButton.addEventListener("click", async function () {
    refreshButton.disabled = true;
    refreshButton.textContent = "Chargement...";
    updateTimestamp("Suppression de la liste en cours...");
    tableBody.innerHTML = "";

    try {
      const response = await fetch(sourceUrl);
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}`);
      }
      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error("Format JSON invalide");
      }
      renderRows(data);
      updateTimestamp();
    } catch (error) {
      updateTimestamp(`Erreur de chargement : ${error.message}`);
    } finally {
      refreshButton.disabled = false;
      refreshButton.textContent = "Rafraîchir";
    }
  });
}

function rotateLoaderSubtitle() {
  const lines = [
    "Initialisation des assets",
    "Chargement de la blacklist",
    "Synchronisation serveur",
    "Vérification de la configuration"
  ];
  const subtitle = document.querySelector(".loader-subtitle");
  if (!subtitle) return null;

  let index = 0;
  let forward = true;
  subtitle.textContent = lines[index];

  const interval = setInterval(() => {
    if (forward) {
      index += 1;
      if (index >= lines.length - 1) {
        forward = false;
      }
    } else {
      index -= 1;
      if (index <= 0) {
        forward = true;
      }
    }
    subtitle.textContent = lines[index];
  }, 1250);

  return () => clearInterval(interval);
}

function animateLoaderDots() {
  const dots = document.querySelector(".loader-dots");
  if (!dots) return null;

  const sequence = ["...", "..", "."];
  let index = 0;

  dots.textContent = sequence[index];

  const interval = setInterval(() => {
    index = (index + 1) % sequence.length;
    dots.textContent = sequence[index];
  }, 500);

  return () => clearInterval(interval);
}

window.addEventListener("DOMContentLoaded", function () {
  const stopRotation = rotateLoaderSubtitle();
  const stopDots = animateLoaderDots();
  setTimeout(() => {
    toggleLoader(false);
    if (stopRotation) stopRotation();
    if (stopDots) stopDots();
  }, 4000);
  bindNavigationEvents();
  bindCaptcha();
  initRefreshButton();
  if (window.location.pathname.split("/").pop() === "blacklist.html") {
    lockPageContent();
    showCaptchaOverlay();
  }
});
