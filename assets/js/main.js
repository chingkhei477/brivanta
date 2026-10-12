/* Brivanta — site behaviour (navigation, copy buttons, contact form) */
(function () {
  "use strict";
  var EMAIL = "support@brivanta.in";

  // Sticky header shadow
  var header = document.querySelector(".site-header");
  function onScroll() { if (header) header.classList.toggle("scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Mobile menu
  var toggle = document.querySelector(".menu-toggle");
  var nav = document.getElementById("site-nav");
  function setMenu(open) {
    if (!toggle || !nav) return;
    nav.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  if (toggle && nav) {
    toggle.addEventListener("click", function () { setMenu(!nav.classList.contains("open")); });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) { setMenu(false); toggle.focus(); }
    });
    window.addEventListener("resize", function () { if (window.innerWidth > 880) setMenu(false); });
  }

  // Current year
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = String(new Date().getFullYear()); });

  // Copy buttons
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve, reject) {
      var ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy") ? resolve() : reject(); } catch (err) { reject(err); }
      document.body.removeChild(ta);
    });
  }
  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    var original = btn.textContent;
    btn.addEventListener("click", function () {
      copyText(btn.getAttribute("data-copy")).then(function () {
        btn.textContent = "Copied ✓";
      }, function () {
        btn.textContent = "Press and hold to copy the address above";
      });
      setTimeout(function () { btn.textContent = original; }, 2500);
    });
  });

  // Contact form
  var form = document.getElementById("contact-form");
  if (!form) return;

  var TOPICS = {
    general: "General question",
    claim: "Cashback claim",
    missing: "Missing or declined cashback",
    withdrawal: "Withdrawal request",
    privacy: "Privacy / data deletion request"
  };
  var $ = function (id) { return document.getElementById(id); };
  var topic = $("topic"), method = $("method"), statusBox = $("form-status");
  var today = new Date();
  var todayStr = today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0") + "-" + String(today.getDate()).padStart(2, "0");
  $("order_date").setAttribute("max", todayStr);

  // Prefill from URL (?topic=claim&store=Name)
  var params = new URLSearchParams(window.location.search);
  var t = params.get("topic");
  if (t && Object.prototype.hasOwnProperty.call(TOPICS, t)) topic.value = t;
  var storeParam = params.get("store");
  if (storeParam) $("store").value = storeParam.replace(/[\r\n]+/g, " ").slice(0, 80);

  function updateTopic() {
    var v = topic.value;
    form.querySelectorAll(".topic-fields").forEach(function (fs) {
      var show = fs.getAttribute("data-topics").split(" ").indexOf(v) !== -1;
      fs.hidden = !show;
    });
    var msgRequired = v === "general" || v === "privacy";
    $("message-optional").hidden = msgRequired;
    $("message").placeholder = v === "privacy"
      ? "Tell us what you would like us to do with your data (access, correct or delete)."
      : v === "missing" ? "Anything that helps — for example, the status shown by the store or the reason given."
      : v === "withdrawal" ? "Optional: the amount you want to withdraw, if not your full confirmed balance."
      : "";
    updateMethod();
  }
  function updateMethod() {
    var isUpi = method.value === "UPI";
    $("upi-field").hidden = !isUpi;
    $("bank-hint").hidden = isUpi;
  }
  topic.addEventListener("change", function () { clearErrors(); updateTopic(); });
  method.addEventListener("change", updateMethod);
  updateTopic();

  function setError(id, msg) {
    var input = $(id), err = $(id + "-error");
    if (input) { input.setAttribute("aria-invalid", "true"); if (err) input.setAttribute("aria-describedby", id + "-error"); }
    if (err) err.textContent = msg;
  }
  function clearErrors() {
    form.querySelectorAll("[aria-invalid]").forEach(function (el) { el.removeAttribute("aria-invalid"); });
    form.querySelectorAll(".field-error").forEach(function (el) { el.textContent = ""; });
    statusBox.className = "form-status"; statusBox.textContent = "";
  }
  function val(id) { return $(id).value.trim(); }
  function oneLine(s) { return s.replace(/[\r\n]+/g, " ").trim(); }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    clearErrors();
    var v = topic.value, ok = true;
    var name = oneLine(val("name")), email = oneLine(val("email")), msg = val("message");

    if (name.length < 2) { setError("name", "Please enter your name."); ok = false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { setError("email", "Please enter a valid email address."); ok = false; }

    if (v === "claim" || v === "missing") {
      if (!val("store")) { setError("store", "Please enter the store name."); ok = false; }
      if (!val("order_id")) { setError("order_id", "Please enter your order ID."); ok = false; }
      var d = val("order_date");
      if (!d) { setError("order_date", "Please choose the order date."); ok = false; }
      else if (d > todayStr) { setError("order_date", "The order date cannot be in the future."); ok = false; }
      var amt = parseFloat(val("order_value"));
      if (!(amt > 0)) { setError("order_value", "Please enter the order value in rupees."); ok = false; }
    }
    if (v === "withdrawal" && method.value === "UPI") {
      if (!/^[A-Za-z0-9._-]{2,256}@[A-Za-z][A-Za-z0-9]{1,63}$/.test(val("upi"))) { setError("upi", "Please enter a valid UPI ID, like name@bank."); ok = false; }
    }
    if ((v === "general" || v === "privacy") && msg.length < 10) { setError("message", "Please write a short message (at least 10 characters)."); ok = false; }
    if (!$("consent").checked) { $("consent-error").textContent = "Please tick the box to continue."; ok = false; }

    if (!ok) {
      var first = form.querySelector("[aria-invalid='true']") || $("consent");
      if (first) first.focus();
      statusBox.className = "form-status show err";
      statusBox.textContent = "Please check the highlighted fields.";
      return;
    }

    var lines = ["Topic: " + TOPICS[v], "Name: " + name, "Email: " + email];
    var subject = "Brivanta — " + TOPICS[v];
    if (v === "claim" || v === "missing") {
      var store = oneLine(val("store")), oid = oneLine(val("order_id"));
      lines.push("Store: " + store, "Order ID: " + oid, "Order date: " + val("order_date"), "Order value: ₹" + parseFloat(val("order_value")).toFixed(2));
      subject += " — " + store + " — Order " + oid;
    }
    if (v === "withdrawal") {
      lines.push("Payout method: " + method.value);
      if (method.value === "UPI") lines.push("UPI ID: " + oneLine(val("upi")));
      else lines.push("Bank details: please reply to collect them securely.");
    }
    if (msg) lines.push("", "Message:", msg);
    lines.push("", "I agree that Brivanta may use these details to reply and handle my request, as explained in the Privacy Policy.");

    var href = "mailto:" + EMAIL + "?subject=" + encodeURIComponent(oneLine(subject).slice(0, 150)) + "&body=" + encodeURIComponent(lines.join("\n"));
    window.location.href = href;

    statusBox.className = "form-status show ok";
    statusBox.textContent = "Your email app should now open with your message ready. Press send there to reach us. If nothing opened, please email " + EMAIL + " directly with the same details.";
  });
})();
