// Translates legacy /api/... fetch calls used by the local dashboard server
// into R2 snapshot keys served by the Pages Function at /quorum-api/<key>.
//
// Mapping must stay in sync with config/dashboard_snapshots.yaml in the
// quorum repo. If a route returns 404, check that the writer produced the
// expected key (look at /quorum-api/manifest.json).

(function () {
  "use strict";

  var BASE = "/quorum-api";

  function horizonSlug(h) {
    // "latest"   → "latest"
    // "5"        → "5"        (numeric horizon, sent as plain int by EXIT_OPTIONS)
    // "5-day fwd" / "20-day fwd" → "5" / "20"
    // "window_end" → "window_end"
    var s = String(h || "").trim();
    if (!s) return "unk";
    if (/^\d+$/.test(s)) return s;            // bare integer
    var m = s.match(/^(\d+)-day fwd$/);
    if (m) return m[1];
    return s.toLowerCase().replace(/\s+/g, "_");
  }

  // (path, queryObj) → snapshot key (no leading slash, no .json suffix).
  // The Pages Function appends .json and prefixes dashboard/v1/.
  var ROUTE_MAP = {
    // Tab: index
    "/api/session":           function ()  { return "session"; },
    "/api/accounts":          function ()  { return "accounts"; },
    "/api/predictions":       function ()  { return "predictions"; },
    "/api/trades":            function (q) { return "trades_" + (q.days || 30) + "d"; },
    "/api/portfolio-history": function (q) { return "portfolio_history_" + (q.days || 90) + "d"; },
    "/api/news":              function ()  { return "news"; },
    "/api/journal":           function ()  { return "journal"; },
    "/api/rl-signal":         function ()  { return "rl_signal"; },
    "/api/prediction-history": function (q) {
      // Single deterministic snapshot of all current holdings (writer pulls
      // tickers from /api/accounts). Page-side ticker list is ignored — the
      // snapshot is always "current holdings, 30d".
      return "prediction_history/current_30d";
    },

    // Tab: pipeline
    "/api/data-health":                  function ()  { return "pipeline/data_health"; },
    "/api/news-volume":                  function (q) { return "pipeline/news_volume_" + q.hours + "h"; },
    "/api/gdelt-pipeline-volume":        function (q) { return "pipeline/gdelt_volume_" + q.hours + "h"; },
    "/api/gdelt-source-theme-sunburst":  function (q) { return "pipeline/gdelt_sunburst_" + q.hours + "h"; },
    "/api/extractor-orchestrator":       function (q) { return "pipeline/extractor_orchestrator_" + q.hours + "h"; },
    "/api/extractor-state":              function ()  { return "pipeline/extractor_state"; },

    // Tab: themes
    "/api/themes":         function ()  { return "themes/index"; },
    "/api/theme-history":  function (q) { return "themes/history_" + (q.limit || 100); },
    "/api/theme-heatmap":  function (q) {
      // Empty parent on initial load means "all roots"; handler treats parent="_root" the same.
      var p = q.parent ? String(q.parent) : "_root";
      return "themes/heatmap_" + encodeURIComponent(p);
    },

    // Tab: models / diagnostics
    "/api/model-ic-pit-latest": function (q) {
      // Key shape: models/ic_<horizon>_<days>[_<spread_n>]
      // e.g. models/ic_latest_20_25, models/ic_latest_30
      var base = "models/ic_" + horizonSlug(q.horizon) + "_" + (q.days || 30);
      if (q.spread_n) base += "_" + q.spread_n;
      return base;
    },
    "/api/prediction-diagnostics": function (q) {
      // Per-trading-day snapshot with default minimal=1/horizon=window_end/spread_n=25
      // params. Advanced (interactive) controls in models.html will hit a 404
      // because we don't pre-snapshot every (horizon, spread_n, window_end) combo.
      return "diagnostics/" + (q.date || "");
    },
    "/api/trading-days": function (q) {
      // Single rolling 90-day window snapshot — frontend filters client-side.
      return "trading_days/recent";
    },
  };

  function rewrite(urlString) {
    if (typeof urlString !== "string") return null;
    if (urlString.indexOf("/api/") !== 0 && urlString.indexOf("api/") !== 0) return null;
    var u;
    try {
      u = new URL(urlString, window.location.origin);
    } catch (e) {
      return null;
    }
    var path = u.pathname;
    if (path[0] !== "/") path = "/" + path;
    var mapper = ROUTE_MAP[path];
    if (!mapper) {
      console.warn("[quorum-api-adapter] no route mapping for", path);
      return null;
    }
    var qs = {};
    u.searchParams.forEach(function (v, k) { qs[k] = v; });
    var key = mapper(qs);
    return BASE + "/" + key;
  }

  var origFetch = window.fetch.bind(window);
  window.fetch = function (input, init) {
    if (typeof input === "string") {
      var rewritten = rewrite(input);
      if (rewritten) return origFetch(rewritten, init);
    } else if (input && typeof input.url === "string") {
      var r = rewrite(input.url);
      if (r) return origFetch(r, init);
    }
    return origFetch(input, init);
  };
})();
