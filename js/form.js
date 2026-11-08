(() => {
  "use strict";
  const { $, announce } = window.TW;
  function setupForm() {
    const form = $("#journeyForm");
    if (!form) return;
    const fields = {
      visitorName: { element: $("#visitorName"), validate: (value) => value.trim().length >= 2 ? "" : "Please enter at least 2 characters." },
      visitorEmail: { element: $("#visitorEmail"), validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim()) ? "" : "Enter a valid email address." },
      visitorPhone: { element: $("#visitorPhone"), validate: (value) => { const digits = value.replace(/\D/g, ""); return /^\+?[0-9\s()\-]+$/.test(value.trim()) && digits.length >= 7 && digits.length <= 15 ? "" : "Enter a valid phone number with 7–15 digits."; } },
      departureDate: { element: $("#departureDate"), validate: (value) => { if (!value) return "Choose a preferred date."; const chosen = new Date(`${value}T00:00:00`); const today = new Date(); today.setHours(0,0,0,0); return chosen >= today ? "" : "Choose today or a future date."; } },
      tripDays: { element: $("#tripDays"), validate: (value) => Number.isInteger(Number(value)) && Number(value) >= 1 && Number(value) <= 21 ? "" : "Enter a whole number from 1 to 21." },
      tripFocus: { element: $("#tripFocus"), validate: (value) => value ? "" : "Choose one area of interest." },
      visitorMessage: { element: $("#visitorMessage"), validate: (value) => value.trim().length >= 20 && value.trim().length <= 500 ? "" : "Write 20–500 characters so your message has enough detail." }
    };
    const dateInput = fields.departureDate.element;
    if (dateInput) {
      const today = new Date();
      const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0,10);
      dateInput.min = localDate;
    }
    const message = fields.visitorMessage.element;
    const counter = $("#messageCounter");
    const success = $("#formSuccess");
    const progress = $("#formProgress");
    const progressFill = $("#formProgressFill");
    const progressText = $("#formProgressText");
    const submitButton = $("button[type=submit]", form);
    const jq = window.jQuery;
    const calm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Give every field a deliberate entrance rhythm when the letter is opened.
    if (jq) {
      jq(form).find(".field-group").each(function (index) {
        this.style.setProperty("--field-order", index);
      });
      jq(form).on("focusin.twForm", ".form-control, .form-select", function () {
        jq(this).closest(".field-group").addClass("is-focused");
      }).on("focusout.twForm", ".form-control, .form-select", function () {
        jq(this).closest(".field-group").removeClass("is-focused");
      });
    }

    if (message && counter) message.addEventListener("input", () => { counter.textContent = `${message.value.length} / 500`; });
    function updateProgress() {
      const complete = Object.keys(fields).filter((name) => !fields[name].validate(fields[name].element.value)).length;
      const total = Object.keys(fields).length;
      if (progressText) progressText.textContent = `${complete} / ${total} COMPLETE`;
      if (progress) progress.setAttribute("aria-valuenow", String(complete));
      if (progressFill) progressFill.style.width = `${complete / total * 100}%`;
      const card = form.closest(".form-card");
      if (card) card.classList.toggle("is-form-complete", complete === total);
    }
    function validateField(name) {
      const field = fields[name];
      const error = field.validate(field.element.value);
      const errorNode = $(`#${name}Error`);
      field.element.classList.toggle("is-invalid", Boolean(error));
      field.element.classList.toggle("is-valid", !error && field.element.value.trim().length > 0);
      field.element.setAttribute("aria-invalid", String(Boolean(error)));
      if (errorNode) errorNode.textContent = error;
      updateProgress();
      return !error;
    }
    Object.keys(fields).forEach((name) => {
      const field = fields[name].element;
      field.addEventListener("blur", () => validateField(name));
      field.addEventListener(field.tagName === "SELECT" ? "change" : "input", () => {
        if (field.classList.contains("is-invalid") || field.classList.contains("is-valid")) validateField(name);
        if (success && !success.hidden) {
          success.hidden = true;
          if (jq) jq(success).stop(true,true).slideUp(150);
        }
        updateProgress();
      });
    });
    updateProgress();
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const allValid = Object.keys(fields).map(validateField).every(Boolean);
      if (!allValid) {
        const firstInvalid = $(".is-invalid", form);
        const card = form.closest(".form-card");
        if (card) { card.classList.remove("has-errors"); void card.offsetWidth; card.classList.add("has-errors"); }
        if (jq && firstInvalid) jq(firstInvalid).stop(true,true).fadeTo(calm ? 0 : 70,.35).fadeTo(calm ? 0 : 230,1);
        firstInvalid?.focus();
        announce("Please correct the highlighted fields before sending.");
        return;
      }
      if (submitButton) { submitButton.disabled = true; submitButton.setAttribute("aria-busy", "true"); }
      form.reset();
      Object.keys(fields).forEach((name) => {
        const field = fields[name].element;
        field.classList.remove("is-valid", "is-invalid");
        field.removeAttribute("aria-invalid");
        const errorNode = $(`#${name}Error`);
        if (errorNode) errorNode.textContent = "";
      });
      if (counter) counter.textContent = "0 / 500";
      if (success) {
        success.hidden = false;
        if (jq) jq(success).stop(true,true).hide().slideDown(calm ? 0 : 330);
        success.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
      const card = form.closest(".form-card");
      if (card) card.classList.add("has-sent");
      updateProgress();
      if (submitButton) {
        const oldText = submitButton.innerHTML;
        submitButton.innerHTML = "NOTE VALIDATED <span>✓</span>";
        window.setTimeout(() => {
          submitButton.disabled = false;
          submitButton.removeAttribute("aria-busy");
          submitButton.innerHTML = oldText;
          if (card) card.classList.remove("has-sent");
        }, 1800);
      }
      announce("Your message has passed validation. This demonstration does not send data to a server.");
    });
  }

  window.TW.form = { setupForm };
})();
