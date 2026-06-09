/* ============================================================================
 * Anchor — charts.js
 * Hand-rolled SVG charts (no dependencies, works offline). Attaches to
 * window.Anchor.charts. Returns SVG DOM nodes.
 * ==========================================================================*/
(function (Anchor) {
  "use strict";

  var SVGNS = "http://www.w3.org/2000/svg";

  function svgEl(name, attrs) {
    var el = document.createElementNS(SVGNS, name);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) { el.setAttribute(k, attrs[k]); });
    }
    return el;
  }

  var charts = {};

  /* ---- Progress ring (donut) for macro coverage ---- */
  charts.ring = function (opts) {
    opts = opts || {};
    var size = opts.size || 120;
    var stroke = opts.stroke || 11;
    var pct = Anchor.util.safeNum(opts.value, { min: 0, max: 1.3, fallback: 0 });
    var r = (size - stroke) / 2;
    var c = size / 2;
    var circ = 2 * Math.PI * r;
    var capped = Math.min(pct, 1);
    var dash = circ * capped;

    var svg = svgEl("svg", {
      width: size, height: size, viewBox: "0 0 " + size + " " + size,
      class: "ring",
    });
    svg.appendChild(svgEl("circle", {
      cx: c, cy: c, r: r, fill: "none",
      stroke: "var(--ring-track)", "stroke-width": stroke,
    }));
    var fg = svgEl("circle", {
      cx: c, cy: c, r: r, fill: "none",
      stroke: opts.color || "var(--accent)",
      "stroke-width": stroke, "stroke-linecap": "round",
      "stroke-dasharray": dash + " " + circ,
      transform: "rotate(-90 " + c + " " + c + ")",
    });
    svg.appendChild(fg);

    var label = svgEl("text", {
      x: c, y: c - 2, "text-anchor": "middle",
      class: "ring-value", "dominant-baseline": "middle",
    });
    label.textContent = Math.round(pct * 100) + "%";
    svg.appendChild(label);

    if (opts.label) {
      var sub = svgEl("text", {
        x: c, y: c + 18, "text-anchor": "middle", class: "ring-label",
      });
      sub.textContent = opts.label;
      svg.appendChild(sub);
    }
    return svg;
  };

  /* ---- Horizontal macro bar ---- */
  charts.bar = function (opts) {
    var value = opts.value || 0;
    var max = opts.max || 1;
    var pct = Anchor.util.clamp(value / max, 0, 1.2);
    var wrap = Anchor.util.h("div.macrobar", {});
    var track = Anchor.util.h("div.macrobar-track", {});
    var fill = Anchor.util.h("div.macrobar-fill", {
      style: { width: Math.min(pct, 1) * 100 + "%", background: opts.color || "var(--accent)" },
    });
    track.appendChild(fill);
    wrap.appendChild(track);
    return wrap;
  };

  /* ---- Weight line chart (SVG) ---- */
  charts.line = function (data, opts) {
    opts = opts || {};
    var w = opts.width || 320;
    var hgt = opts.height || 150;
    var pad = { t: 16, r: 14, b: 24, l: 34 };

    var svg = svgEl("svg", {
      viewBox: "0 0 " + w + " " + hgt, class: "linechart",
      preserveAspectRatio: "none", width: "100%",
    });

    if (!data || data.length === 0) {
      var empty = svgEl("text", { x: w / 2, y: hgt / 2, "text-anchor": "middle", class: "chart-empty" });
      empty.textContent = "No data yet";
      svg.appendChild(empty);
      return svg;
    }

    var xs = data.map(function (d) { return d.x; });
    var ys = data.map(function (d) { return d.y; });
    var minX = Math.min.apply(null, xs), maxX = Math.max.apply(null, xs);
    var minY = Math.min.apply(null, ys), maxY = Math.max.apply(null, ys);
    if (minY === maxY) { minY -= 1; maxY += 1; }
    // pad the y range a touch
    var padY = (maxY - minY) * 0.15;
    minY -= padY; maxY += padY;

    function sx(x) {
      if (maxX === minX) return pad.l + (w - pad.l - pad.r) / 2;
      return pad.l + ((x - minX) / (maxX - minX)) * (w - pad.l - pad.r);
    }
    function sy(y) {
      return pad.t + (1 - (y - minY) / (maxY - minY)) * (hgt - pad.t - pad.b);
    }

    // gridlines + y labels
    var ticks = 3;
    for (var i = 0; i <= ticks; i++) {
      var yv = minY + (i / ticks) * (maxY - minY);
      var yy = sy(yv);
      svg.appendChild(svgEl("line", {
        x1: pad.l, y1: yy, x2: w - pad.r, y2: yy, class: "grid",
      }));
      var lbl = svgEl("text", { x: pad.l - 6, y: yy + 3, "text-anchor": "end", class: "chart-axis" });
      lbl.textContent = Math.round(yv);
      svg.appendChild(lbl);
    }

    // area + line
    var dLine = "";
    data.forEach(function (d, idx) {
      dLine += (idx === 0 ? "M" : "L") + sx(d.x).toFixed(1) + " " + sy(d.y).toFixed(1) + " ";
    });
    var dArea = dLine + "L" + sx(data[data.length - 1].x).toFixed(1) + " " + sy(minY).toFixed(1) +
      " L" + sx(data[0].x).toFixed(1) + " " + sy(minY).toFixed(1) + " Z";

    svg.appendChild(svgEl("path", { d: dArea, class: "line-area" }));
    svg.appendChild(svgEl("path", { d: dLine, class: "line-stroke", fill: "none" }));

    data.forEach(function (d) {
      svg.appendChild(svgEl("circle", { cx: sx(d.x), cy: sy(d.y), r: 3, class: "line-dot" }));
    });

    // trend line if provided
    if (opts.trend && data.length >= 2) {
      var first = data[0], last = data[data.length - 1];
      var tl = svgEl("line", {
        x1: sx(first.x), y1: sy(first.y),
        x2: sx(last.x), y2: sy(first.y + opts.trend.perWeek * ((last.x - first.x) / (7 * 86400000))),
        class: "trend-line",
      });
      svg.appendChild(tl);
    }
    return svg;
  };

  /* ---- Check-in heatmap (last N days) ---- */
  charts.heatmap = function (logs, opts) {
    opts = opts || {};
    var days = opts.days || 28;
    var cols = opts.cols || 7;
    var wrap = Anchor.util.h("div.heatmap", {});
    var today = new Date();
    var cells = [];
    for (var i = days - 1; i >= 0; i--) {
      var d = Anchor.util.addDays(today, -i);
      var key = Anchor.util.todayKey(d);
      var log = logs[key];
      var score = 0;
      if (log) {
        score += log.meals >= 3 ? 1 : (log.meals > 0 ? 0.5 : 0);
        score += log.protein ? 1 : 0;
        score += log.booster ? 1 : 0;
      }
      var level = score === 0 ? 0 : score < 1.5 ? 1 : score < 2.5 ? 2 : 3;
      cells.push({ key: key, level: level, d: d });
    }
    cells.forEach(function (c) {
      var cell = Anchor.util.h("div.heatcell", {
        title: Anchor.util.fmtDate(c.d) + " — level " + c.level,
        dataset: { level: c.level },
      });
      wrap.appendChild(cell);
    });
    wrap.style.gridTemplateColumns = "repeat(" + cols + ", 1fr)";
    return wrap;
  };

  Anchor.charts = charts;
})(window.Anchor = window.Anchor || {});
