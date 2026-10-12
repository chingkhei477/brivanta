/* Brivanta — renders offers from data/offers.json (edit that file to add or remove offers) */
(function () {
  "use strict";
  var grid = document.getElementById("offers-grid");
  if (!grid) return;
  var tools = document.getElementById("offer-tools");
  var search = document.getElementById("offer-search");
  var catSel = document.getElementById("offer-cat");
  var count = document.getElementById("offer-count");
  var empty = document.getElementById("offers-empty");
  var offers = [], updated = "";

  var now = new Date();
  var today = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0") + "-" + String(now.getDate()).padStart(2, "0");

  function fmtDate(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
    if (!m) return "";
    var d = new Date(+m[1], +m[2] - 1, +m[3]);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  }
  function str(v, max) { return typeof v === "string" ? v.trim().slice(0, max || 300) : ""; }
  function safeUrl(u) {
    try { var url = new URL(u); return url.protocol === "https:" ? url.href : ""; } catch (e) { return ""; }
  }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function clean(o) {
    if (!o || typeof o !== "object") return null;
    var x = {
      store: str(o.store, 80),
      category: str(o.category, 40) || "Other",
      cashback: str(o.cashback, 40),
      cashbackNote: str(o.cashbackNote, 80),
      description: str(o.description, 400),
      confirmation: str(o.confirmation, 60),
      validTill: str(o.validTill, 10),
      terms: Array.isArray(o.terms) ? o.terms.map(function (t) { return str(t, 300); }).filter(Boolean).slice(0, 12) : [],
      link: safeUrl(o.link)
    };
    if (!x.store || !x.cashback || !x.link) return null;      // incomplete offers are never shown
    if (x.validTill && /^\d{4}-\d{2}-\d{2}$/.test(x.validTill) && x.validTill < today) return null; // expired
    return x;
  }

  function card(o) {
    var art = el("article", "offer");
    var top = el("div", "offer-top");
    var name = el("div");
    name.appendChild(el("h3", "offer-store", o.store));
    name.appendChild(el("span", "offer-cat", o.category));
    var rate = el("div", "offer-rate", o.cashback);
    if (o.cashbackNote) rate.appendChild(el("small", null, o.cashbackNote));
    top.appendChild(name); top.appendChild(rate);
    art.appendChild(top);
    if (o.description) art.appendChild(el("p", "offer-desc", o.description));

    var dl = el("dl", "offer-meta");
    [["Confirmation", o.confirmation || "Set by store"], ["Valid till", fmtDate(o.validTill) || "Until further notice"]].forEach(function (p) {
      var d = el("div"); d.appendChild(el("dt", null, p[0])); d.appendChild(el("dd", null, p[1])); dl.appendChild(d);
    });
    art.appendChild(dl);

    if (o.terms.length) {
      var det = el("details");
      det.appendChild(el("summary", null, "Offer terms (" + o.terms.length + ")"));
      var ul = el("ul");
      o.terms.forEach(function (t) { ul.appendChild(el("li", null, t)); });
      det.appendChild(ul);
      art.appendChild(det);
    }

    var actions = el("div", "offer-actions");
    var go = el("a", "btn btn-primary btn-sm", "Shop via Brivanta");
    go.href = o.link; go.target = "_blank"; go.rel = "sponsored noopener";
    go.setAttribute("aria-label", "Shop at " + o.store + " via Brivanta (opens the store in a new tab)");
    var claim = el("a", "btn btn-ghost btn-sm", "Claim cashback");
    claim.href = "contact.html?topic=claim&store=" + encodeURIComponent(o.store) + "#form";
    actions.appendChild(go); actions.appendChild(claim);
    art.appendChild(actions);
    return art;
  }

  function render() {
    var q = (search.value || "").toLowerCase().trim();
    var c = catSel.value;
    var list = offers.filter(function (o) {
      return (!c || o.category === c) && (!q || (o.store + " " + o.category + " " + o.description).toLowerCase().indexOf(q) !== -1);
    });
    grid.replaceChildren.apply(grid, list.map(card));
    var label = list.length === 1 ? "1 offer" : list.length + " offers";
    count.textContent = list.length
      ? "Showing " + label + (updated ? " · Last updated " + updated : "")
      : "No offers match your search.";
  }

  function showEmpty(title, text) {
    if (title) document.getElementById("offers-empty-title").textContent = title;
    if (text) document.getElementById("offers-empty-text").textContent = text;
    empty.hidden = false;
  }

  fetch("data/offers.json", { cache: "no-cache" })
    .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
    .then(function (data) {
      offers = (Array.isArray(data && data.offers) ? data.offers : []).map(clean).filter(Boolean);
      updated = fmtDate(str(data && data.updated, 10));
      if (!offers.length) { showEmpty(); return; }
      var cats = Array.from(new Set(offers.map(function (o) { return o.category; }))).sort();
      cats.forEach(function (cat) { var op = el("option", null, cat); op.value = cat; catSel.appendChild(op); });
      tools.hidden = false;
      search.addEventListener("input", render);
      catSel.addEventListener("change", render);
      render();
    })
    .catch(function () {
      showEmpty("Offers could not be loaded", "Something went wrong while loading offers. Please refresh the page, or email support@brivanta.in if the problem continues.");
    });
})();
