// Staleness banner. Reads /quorum-api/manifest.json and inserts a fixed
// banner above the dashboard if any of the keys this page reads from
// are older than expected.
//
// Per-page key sets are declared via:
//     <body data-staleness-keys="predictions,accounts,trades_30d">
// If absent, the banner watches every key in the manifest.
//
// Cadence buckets (must match config/dashboard_snapshots.yaml):
//   5m  → green up to 8min,  amber up to 30min, red beyond
//   15m → green up to 25min, amber up to 90min, red beyond
//   60m → green up to 90min, amber up to 4h,    red beyond
//   default fallback if cadence unknown → 30min/4h thresholds
//
// Updates every minute. Manifest.json is refetched too — the writer
// updates it atomically so a stale manifest implies the writer itself
// hasn't run.

(function () {
  "use strict";

  var MANIFEST_URL = "/quorum-api/manifest.json";
  var POLL_MS = 60 * 1000;

  // (cadence string from yaml) -> { greenMaxMs, amberMaxMs }
  var CADENCE_THRESHOLDS = {
    "5m":  { green: 8 * 60_000,   amber: 30 * 60_000 },
    "15m": { green: 25 * 60_000,  amber: 90 * 60_000 },
    "60m": { green: 90 * 60_000,  amber: 4 * 3_600_000 },
  };
  var DEFAULT_THRESHOLDS = { green: 30 * 60_000, amber: 4 * 3_600_000 };

  function thresholdsFor(cadence) {
    return CADENCE_THRESHOLDS[cadence] || DEFAULT_THRESHOLDS;
  }

  function ensureBanner() {
    var b = document.getElementById("quorum-staleness-banner");
    if (b) return b;
    b = document.createElement("div");
    b.id = "quorum-staleness-banner";
    b.style.cssText = [
      "position:sticky","top:0","z-index:1000",
      "padding:0.55rem 2rem",
      "font-family:'Outfit',system-ui,sans-serif",
      "font-size:0.7rem","letter-spacing:0.06em",
      "text-transform:uppercase",
      "border-bottom:1px solid var(--border-light, #33341f)",
      "display:none",
    ].join(";");
    document.body.insertBefore(b, document.body.firstChild);
    return b;
  }

  function renderBanner({ status, maxAgeMs, manifestAge, worstKey, worstAgeMs, manifestErr }) {
    var b = ensureBanner();
    if (status === "ok") { b.style.display = "none"; return; }

    var palette = {
      amber: { bg: "rgba(180,154,110,0.15)", color: "#d4be8c", border: "#b49a6e" },
      red:   { bg: "rgba(196,80,106,0.18)",  color: "#e88aa0", border: "#c4506a" },
      gray:  { bg: "rgba(122,120,104,0.18)", color: "#d4cfc3", border: "#7a7868" },
    }[status] || { bg: "#332", color: "#fc9", border: "#fc9" };
    b.style.background    = palette.bg;
    b.style.color         = palette.color;
    b.style.borderBottom  = "1px solid " + palette.border;
    b.style.display       = "block";

    var msg;
    if (manifestErr) {
      msg = "Snapshot manifest unreachable — dashboard may be stale (" + manifestErr + ")";
    } else if (worstKey) {
      msg = "Stale: " + worstKey + " is " + fmtAge(worstAgeMs)
          + " old (limit " + fmtAge(maxAgeMs) + ")";
    } else {
      msg = "Manifest age " + fmtAge(manifestAge) + " — writer may be down";
    }
    b.textContent = msg;
  }

  function fmtAge(ms) {
    if (ms == null || !isFinite(ms)) return "?";
    var s = Math.round(ms / 1000);
    if (s < 60)        return s + "s";
    var m = Math.round(s / 60);
    if (m < 90)        return m + "m";
    var h = (m / 60).toFixed(1);
    if (Number(h) < 48) return h + "h";
    var d = Math.round(m / (60 * 24));
    return d + "d";
  }

  function pageKeys() {
    var attr = document.body.getAttribute("data-staleness-keys");
    if (!attr) return null; // null = "watch everything"
    return attr.split(",").map(function (s) { return s.trim(); }).filter(Boolean);
  }

  function check() {
    fetch(MANIFEST_URL, { cache: "no-store" })
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (m) {
        var entries = m.entries || {};
        var manifestAge = Date.now() - new Date(m.generated_at).getTime();
        var keys = pageKeys();
        if (keys === null) keys = Object.keys(entries);

        var worst = null;
        keys.forEach(function (k) {
          var e = entries[k];
          if (!e) return; // not in manifest = page-side has no snapshot for it; ignore here
          var thr = thresholdsFor(e.cadence);
          var age = Date.now() - new Date(e.generated_at).getTime();
          var status = age > thr.amber ? "red" : age > thr.green ? "amber" : "ok";
          if (status === "ok") return;
          var rank = status === "red" ? 2 : 1;
          if (!worst || rank > worst.rank) {
            worst = { key: k, age: age, status: status, maxAgeMs: thr.amber, rank: rank };
          }
        });

        // If the manifest itself is older than the slowest expected cadence (60m × 1.5)
        // assume the writer has stopped.
        if (manifestAge > 90 * 60_000 && (!worst || worst.status !== "red")) {
          renderBanner({ status: "amber", manifestAge: manifestAge });
          return;
        }

        if (!worst) {
          renderBanner({ status: "ok" });
          return;
        }
        renderBanner({
          status: worst.status,
          worstKey: worst.key,
          worstAgeMs: worst.age,
          maxAgeMs: worst.maxAgeMs,
          manifestAge: manifestAge,
        });
      })
      .catch(function (err) {
        renderBanner({ status: "gray", manifestErr: err.message || String(err) });
      });
  }

  // Run after DOM is parsed.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", check);
  } else {
    check();
  }
  setInterval(check, POLL_MS);
})();
