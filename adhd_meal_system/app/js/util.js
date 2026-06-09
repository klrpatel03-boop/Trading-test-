/* ============================================================================
 * Anchor — util.js
 * Small DOM + date helpers. No framework. Attaches to window.Anchor.util and
 * provides the `h` hyperscript helper used by every view.
 * ==========================================================================*/
(function (Anchor) {
  "use strict";

  var util = {};

  /* ---- hyperscript: h('div.card', {onClick:fn}, [children]) ---- */
  util.h = function (tag, attrs, children) {
    // parse tag like "div.card.active#id"
    var idMatch = tag.match(/#([\w-]+)/);
    var classMatches = tag.match(/\.([\w-]+)/g) || [];
    var name = tag.replace(/[.#].*$/, "") || "div";
    var el = document.createElement(name);

    if (idMatch) el.id = idMatch[1];
    classMatches.forEach(function (c) { el.classList.add(c.slice(1)); });

    if (attrs && typeof attrs === "object" && !Array.isArray(attrs) && !(attrs instanceof Node)) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v == null || v === false) return;
        if (k === "class" || k === "className") {
          String(v).split(/\s+/).forEach(function (c) { if (c) el.classList.add(c); });
        } else if (k === "style" && typeof v === "object") {
          Object.assign(el.style, v);
        } else if (k === "dataset" && typeof v === "object") {
          Object.assign(el.dataset, v);
        } else if (k === "html") {
          el.innerHTML = v;
        } else if (k.slice(0, 2) === "on" && typeof v === "function") {
          el.addEventListener(k.slice(2).toLowerCase(), v);
        } else if (k === "checked" || k === "disabled" || k === "selected") {
          el[k] = !!v;
        } else {
          el.setAttribute(k, v);
        }
      });
    } else {
      // attrs is actually children
      children = attrs;
    }

    util.append(el, children);
    return el;
  };

  util.append = function (el, children) {
    if (children == null) return el;
    if (Array.isArray(children)) {
      children.forEach(function (c) { util.append(el, c); });
    } else if (children instanceof Node) {
      el.appendChild(children);
    } else {
      el.appendChild(document.createTextNode(String(children)));
    }
    return el;
  };

  util.clear = function (el) {
    while (el && el.firstChild) el.removeChild(el.firstChild);
    return el;
  };

  util.qs = function (sel, root) { return (root || document).querySelector(sel); };
  util.qsa = function (sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  };

  /* ---- dates ---- */
  util.todayKey = function (d) {
    d = d || new Date();
    var m = String(d.getMonth() + 1).padStart(2, "0");
    var day = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + m + "-" + day;
  };
  util.keyToDate = function (key) {
    var p = key.split("-");
    return new Date(+p[0], +p[1] - 1, +p[2]);
  };
  util.fmtDate = function (d) {
    return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  };
  util.fmtLong = function (d) {
    return d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
  };
  util.addDays = function (d, n) {
    var x = new Date(d);
    x.setDate(x.getDate() + n);
    return x;
  };
  util.weekdayName = function (i) {
    return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][i];
  };

  /* ---- money / numbers ---- */
  util.money = function (n) {
    return "$" + (Math.round(n * 100) / 100).toFixed(2);
  };
  util.round = function (n, p) {
    var f = Math.pow(10, p || 0);
    return Math.round(n * f) / f;
  };
  util.clamp = function (n, lo, hi) { return Math.max(lo, Math.min(hi, n)); };

  /* ---- misc ---- */
  util.debounce = function (fn, ms) {
    var t;
    return function () {
      var args = arguments, ctx = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(ctx, args); }, ms || 200);
    };
  };

  util.download = function (filename, text, mime) {
    var blob = new Blob([text], { type: mime || "text/plain" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  };

  util.toast = function (msg, ms) {
    var existing = util.qs("#toast");
    if (existing) existing.remove();
    var t = util.h("div#toast.toast", {}, msg);
    document.body.appendChild(t);
    requestAnimationFrame(function () { t.classList.add("show"); });
    setTimeout(function () {
      t.classList.remove("show");
      setTimeout(function () { t.remove(); }, 300);
    }, ms || 2200);
  };

  Anchor.util = util;
})(window.Anchor = window.Anchor || {});
