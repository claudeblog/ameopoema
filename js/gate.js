(function () {
  "use strict";

  const gate = document.getElementById("gate");
  const gateForm = document.getElementById("gate-form");

  if (!gate || !gateForm) {
    return;
  }

  const waitBox = document.getElementById("wait-message");
  const waitText = waitBox ? waitBox.querySelector(".wait-text") : null;
  const cancelBtn = document.getElementById("cancel-btn");
  const resetBtn = document.getElementById("reset-storage");
  const contactLink = document.querySelector("[data-open-gate]");

  const formAction = gate.dataset.formAction || "";
  const minInterval = Number(gate.dataset.minIntervalMs || 60 * 1000);
  const storageKey = gate.dataset.storageKey || "ameopoema_last_submit";
  const sessionCookie = gate.dataset.sessionCookie || "ameopoema_unlocked";

  const spamWords = [
    "viagra",
    "bitcoin",
    "crypto",
    "casino",
    "ganhe dinheiro",
    "free money",
    "porn"
  ];

  function getFieldValue(id) {
    const field = document.getElementById(id);
    return field ? field.value.trim() : "";
  }

  function validEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  }

  function looksLikeSpam(text) {
    if (text.length < 8) {
      return true;
    }

    if ((text.match(/https?:\/\//g) || []).length > 2) {
      return true;
    }

    if (/([a-zA-Z])\1{7,}/.test(text)) {
      return true;
    }

    const lower = text.toLowerCase();
    return spamWords.some((word) => lower.includes(word));
  }

  function showWait(message) {
    if (!waitBox || !waitText) {
      return;
    }

    waitText.innerHTML = message;
    waitBox.style.display = "block";
  }

  function hideWait() {
    if (waitBox) {
      waitBox.style.display = "none";
    }
  }

  function setGateVisible(isVisible) {
    gate.style.display = isVisible ? "flex" : "none";
    document.body.classList.toggle("locked", isVisible);
  }

  function hasSessionUnlock() {
    return document.cookie
      .split(";")
      .map((cookie) => cookie.trim())
      .some((cookie) => cookie === `${sessionCookie}=1`);
  }

  function setSessionUnlock() {
    document.cookie = `${sessionCookie}=1; path=/; SameSite=Lax`;
  }

  function clearSessionUnlock() {
    document.cookie = `${sessionCookie}=; path=/; Max-Age=0; SameSite=Lax`;
  }

  function getLastSubmitTime() {
    try {
      return localStorage.getItem(storageKey);
    } catch {
      return null;
    }
  }

  function setLastSubmitTime(value) {
    try {
      localStorage.setItem(storageKey, String(value));
    } catch {
      // no-op when localStorage is unavailable
    }
  }

  function clearLastSubmitTime() {
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // no-op when localStorage is unavailable
    }
  }

  function appendHiddenInput(form, name, value) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }

  function submitContactForm(payload) {
    if (!formAction) {
      return;
    }

    const form = document.createElement("form");
    form.method = "POST";
    form.action = formAction;
    form.target = "hidden_iframe";

    appendHiddenInput(form, "entry.409672853", payload.name);
    appendHiddenInput(form, "entry.2040541815", payload.email);
    appendHiddenInput(form, "entry.739396940", payload.message);

    document.body.appendChild(form);
    form.submit();
    form.remove();
  }

  function handleSubmit(event) {
    event.preventDefault();
    hideWait();

    if (getFieldValue("website")) {
      return;
    }

    const name = getFieldValue("name");
    const email = getFieldValue("email");
    const message = getFieldValue("message");

    if (!name || !email || !message) {
      showWait(
        "Todos os campos precisam ser preenchidos. <br>Deixe sua mensagem. <br> Nos conte, você é um robô?"
      );
      return;
    }

    if (!validEmail(email)) {
      showWait("O email não parece válido.");
      return;
    }

    if (looksLikeSpam(message)) {
      showWait("Essa mensagem parece automática demais.");
      return;
    }

    const now = Date.now();
    const lastSubmit = Number(getLastSubmitTime());

    if (lastSubmit && now - lastSubmit < minInterval) {
      showWait(
        "A poesia habita no silêncio entre os versos.<br>Tente novamente daqui a 1 minuto."
      );
      return;
    }

    submitContactForm({ name, email, message });
    setLastSubmitTime(now);
    setSessionUnlock();
    setGateVisible(false);
  }

  function openGate(event) {
    event.preventDefault();

    if (!hasSessionUnlock()) {
      return;
    }

    setGateVisible(true);

    if (cancelBtn) {
      cancelBtn.style.display = "block";
    }
  }

  function cancelGate() {
    setGateVisible(false);

    if (cancelBtn) {
      cancelBtn.style.display = "none";
    }

    window.location.assign("/");
  }

  function resetAccess() {
    clearLastSubmitTime();
    clearSessionUnlock();
    setGateVisible(true);

    if (cancelBtn) {
      cancelBtn.style.display = "none";
    }
  }

  gateForm.addEventListener("submit", handleSubmit);

  if (contactLink) {
    contactLink.addEventListener("click", openGate);
  }

  if (cancelBtn) {
    cancelBtn.addEventListener("click", cancelGate);
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", resetAccess);
  }

  if (hasSessionUnlock()) {
    setGateVisible(false);
  }
})();
