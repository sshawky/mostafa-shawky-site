// Mobile menu, project category filter and image lightbox. No dependencies.
(function () {
  var rtl = document.documentElement.dir === "rtl";
  var ar = document.documentElement.lang === "ar";

  // menu
  var toggle = document.querySelector(".menu-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // category filter (works without JS: all cards are visible)
  var chips = document.querySelectorAll(".chip[data-filter]");
  var cards = document.querySelectorAll("#project-grid .card");
  function applyFilter(cat, push) {
    var found = false;
    chips.forEach(function (c) {
      var on = c.dataset.filter === cat;
      if (on) found = true;
      c.setAttribute("aria-pressed", on ? "true" : "false");
    });
    if (!found) { cat = "*"; chips[0] && chips[0].setAttribute("aria-pressed", "true"); }
    cards.forEach(function (card) { card.hidden = cat !== "*" && card.dataset.cat !== cat; });
    if (push) history.replaceState(null, "", cat === "*" ? location.pathname : "#" + cat);
  }
  if (chips.length) {
    chips.forEach(function (c) { c.addEventListener("click", function () { applyFilter(c.dataset.filter, true); }); });
    if (location.hash.length > 1) applyFilter(decodeURIComponent(location.hash.slice(1)), false);
  }

  // lightbox
  var links = Array.prototype.slice.call(document.querySelectorAll("a[data-lightbox]"));
  if (!links.length) return;
  var T = ar ? { close: "إغلاق", prev: "السابق", next: "التالي" } : { close: "Close", prev: "Previous", next: "Next" };
  var box = document.createElement("div");
  box.className = "lb"; box.hidden = true;
  box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true");
  box.innerHTML = '<button class="lb-close" type="button">' + T.close + ' ✕</button>' +
    '<div class="lb-stage"><img alt=""></div>' +
    '<div class="lb-bar"><button class="lb-prev" type="button">' + T.prev + '</button><span class="lb-cap"></span><button class="lb-next" type="button">' + T.next + '</button></div>';
  document.body.appendChild(box);
  var img = box.querySelector("img"), cap = box.querySelector(".lb-cap");
  var idx = 0, lastFocus = null;

  function show(i) {
    idx = (i + links.length) % links.length;
    var a = links[idx];
    img.src = a.href;
    var inner = a.querySelector("img");
    img.alt = inner ? inner.alt : "";
    var c = a.dataset.caption || "";
    var n = (idx + 1) + " / " + links.length;
    if (ar) n = n.replace(/\d/g, function (d) { return "٠١٢٣٤٥٦٧٨٩"[d]; });
    cap.textContent = (c ? c + " · " : "") + n;
  }
  function open(i) { lastFocus = document.activeElement; show(i); box.hidden = false; document.body.classList.add("lb-open"); box.querySelector(".lb-close").focus(); }
  function close() { box.hidden = true; img.removeAttribute("src"); document.body.classList.remove("lb-open"); lastFocus && lastFocus.focus(); }

  links.forEach(function (a, i) { a.addEventListener("click", function (ev) { ev.preventDefault(); open(i); }); });
  box.querySelector(".lb-close").addEventListener("click", close);
  box.querySelector(".lb-prev").addEventListener("click", function () { show(idx - 1); });
  box.querySelector(".lb-next").addEventListener("click", function () { show(idx + 1); });
  box.addEventListener("click", function (ev) { if (ev.target === box || ev.target.classList.contains("lb-stage")) close(); });
  document.addEventListener("keydown", function (ev) {
    if (box.hidden) return;
    if (ev.key === "Escape") close();
    // arrow keys follow reading direction
    if (ev.key === "ArrowRight") show(idx + (rtl ? -1 : 1));
    if (ev.key === "ArrowLeft") show(idx + (rtl ? 1 : -1));
  });
  var x0 = null;
  box.addEventListener("touchstart", function (ev) { x0 = ev.touches[0].clientX; }, { passive: true });
  box.addEventListener("touchend", function (ev) {
    if (x0 === null) return;
    var dx = ev.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 50) show(idx + ((dx < 0) !== rtl ? 1 : -1));
  });
})();
