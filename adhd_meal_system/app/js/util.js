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
  // Strict YYYY-MM-DD -> local-midnight Date. Returns null on malformed keys so
  // callers can skip instead of getting a month-wrapped garbage date.
  util.keyToDate = function (key) {
    if (typeof key !== "string") return null;
    var m = key.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return null;
    var y = +m[1], mo = +m[2], d = +m[3];
    if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
    var dt = new Date(y, mo - 1, d);
    // reject overflow (e.g. 2026-02-31 -> Mar 3)
    if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
    return dt;
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

  // The one numeric-input guard: coerce, reject NaN/Infinity, clamp, optional int.
  // Single source of truth for every user-entered number (weight, water, cost…).
  util.safeNum = function (value, opts) {
    opts = opts || {};
    var n = typeof value === "number" ? value : parseFloat(value);
    if (!isFinite(n)) n = (opts.fallback != null ? opts.fallback : 0);
    if (opts.min != null && n < opts.min) n = opts.min;
    if (opts.max != null && n > opts.max) n = opts.max;
    if (opts.integer) n = Math.round(n);
    return n;
  };

  // Cap a string's length (bounds what we persist to localStorage).
  util.capStr = function (s, max) {
    s = (s == null ? "" : String(s));
    return s.length > (max || 80) ? s.slice(0, max || 80) : s;
  };

  // weights[] -> [{x:ms, y:lb}] for charts/trend, dropping malformed entries.
  util.weightPoints = function (weights) {
    return (weights || []).map(function (w) {
      var d = util.keyToDate(w && w.date);
      var lb = util.safeNum(w && w.lb, { min: 1, max: 2000, fallback: NaN });
      return d && isFinite(lb) ? { x: d.getTime(), y: lb } : null;
    }).filter(Boolean);
  };

  // Valid "HH:MM" 24h time? Used to reject corrupted schedule times.
  util.isValidTime = function (t) {
    if (typeof t !== "string") return false;
    var m = t.match(/^(\d{1,2}):(\d{2})$/);
    return !!m && +m[1] >= 0 && +m[1] <= 23 && +m[2] >= 0 && +m[2] <= 59;
  };

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
