"use strict";

const $ = (id) => document.getElementById(id);
const status = $("status");
let currentListings = [];
let sortKey = "manageability_score";
let sortDir = -1;

function setStatus(msg, isError) {
  status.textContent = msg || "";
  status.style.color = isError ? "#b42318" : "";
}

function fmtPrice(p) {
  if (p == null) return "—";
  return "$" + Number(p).toLocaleString();
}
function fmtNum(n, digits) {
  if (n == null) return "—";
  return digits != null ? Number(n).toFixed(digits) : Number(n).toLocaleString();
}

function scoreClass(s) {
  if (s >= 70) return "high";
  if (s >= 45) return "mid";
  return "low";
}

function ceilingCell(l) {
  if (l.ceiling_status === "mentioned") {
    const note = l.ceiling_note ? `<span class="snippet">${escapeHtml(l.ceiling_note)}</span>` : "";
    return `<span class="badge ceiling-ok">mentioned</span>${note}`;
  }
  return `<span class="badge ceiling-check">needs checking</span>`;
}

function kitchenCell(l) {
  if (l.kitchen_status === "spacious") {
    const note = l.kitchen_note ? `<span class="snippet">${escapeHtml(l.kitchen_note)}</span>` : "";
    return `<span class="badge kitchen-ok">big kitchen</span>${note}`;
  }
  return `<span class="badge ceiling-check">needs checking</span>`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function render() {
  const tbody = $("rows");
  if (!currentListings.length) {
    tbody.innerHTML = `<tr><td class="empty" colspan="11">No matching homes. Try widening the filters or refreshing the data.</td></tr>`;
    return;
  }
  const sorted = [...currentListings].sort((a, b) => {
    const av = a[sortKey], bv = b[sortKey];
    if (av == null) return 1;
    if (bv == null) return -1;
    if (av < bv) return -1 * sortDir;
    if (av > bv) return 1 * sortDir;
    return 0;
  });

  tbody.innerHTML = sorted.map((l) => {
    const addr = [l.address, l.city, l.state].filter(Boolean).join(", ");
    const verify = l.single_story_flagged
      ? ` <span class="badge verify">verify single-story</span>` : "";
    const link = l.url
      ? `<a class="view" href="${escapeHtml(l.url)}" target="_blank" rel="noopener">View ↗</a>` : "";
    return `<tr>
      <td><span class="score ${scoreClass(l.manageability_score)}">${l.manageability_score}</span></td>
      <td>${escapeHtml(addr)}${verify}</td>
      <td>${fmtPrice(l.price)}</td>
      <td>${fmtNum(l.lot_size_acres, 2)}</td>
      <td>${l.year_built ?? "—"}</td>
      <td>${fmtNum(l.sqft)}</td>
      <td>${l.beds ?? "—"}/${l.baths ?? "—"}</td>
      <td>${escapeHtml(l.property_type || "—")}</td>
      <td>${ceilingCell(l)}</td>
      <td>${kitchenCell(l)}</td>
      <td>${link}</td>
    </tr>`;
  }).join("");
}

async function loadListings() {
  const params = new URLSearchParams({
    lot_min: $("lot_min").value,
    lot_max: $("lot_max").value,
    min_year: $("min_year").value,
    single_story: $("single_story").checked ? "1" : "0",
    big_kitchen: $("big_kitchen").checked ? "1" : "0",
  });
  setStatus("Loading…");
  try {
    const res = await fetch("/api/listings?" + params.toString());
    const data = await res.json();
    currentListings = data.listings || [];
    const age = data.cache_age_hours != null ? `, data ~${data.cache_age_hours}h old` : "";
    setStatus(`${data.count} matching homes (of ${data.total_cached} cached${age}).`);
    render();
  } catch (e) {
    setStatus("Could not load listings: " + e.message, true);
  }
}

async function refresh() {
  const source = $("source").value;
  setStatus(`Refreshing from ${source}… (live sources can take a few seconds)`);
  try {
    const res = await fetch("/api/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source }),
    });
    const data = await res.json();
    if (!data.ok) { setStatus(data.error || "Refresh failed.", true); return; }
    setStatus(`Fetched ${data.fetched}, cached ${data.cached} from ${data.source}.`);
    await loadListings();
  } catch (e) {
    setStatus("Refresh error: " + e.message, true);
  }
}

async function importCsv(file) {
  const fd = new FormData();
  fd.append("file", file);
  setStatus(`Importing ${file.name}…`);
  try {
    const res = await fetch("/api/import", { method: "POST", body: fd });
    const data = await res.json();
    if (!data.ok) { setStatus(data.error || "Import failed.", true); return; }
    setStatus(`Imported ${data.fetched} listings (cached ${data.cached}).`);
    await loadListings();
  } catch (e) {
    setStatus("Import error: " + e.message, true);
  }
}

// --- wire up events --- #
$("apply").addEventListener("click", loadListings);
$("refresh").addEventListener("click", refresh);
$("csvfile").addEventListener("change", (e) => {
  if (e.target.files.length) importCsv(e.target.files[0]);
});
document.querySelectorAll("#results thead th").forEach((th, idx) => {
  const keys = ["manageability_score", "address", "price", "lot_size_acres",
    "year_built", "sqft", null, "property_type", null, null, null];
  const key = keys[idx];
  if (!key) return;
  th.addEventListener("click", () => {
    if (sortKey === key) sortDir *= -1; else { sortKey = key; sortDir = key === "manageability_score" ? -1 : 1; }
    render();
  });
});

loadListings();
