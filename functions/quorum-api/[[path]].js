// Cloudflare Pages Function: serves dashboard JSON snapshots from R2.
//
// Route:  /quorum-api/<path>           e.g. /quorum-api/predictions
// R2:     dashboard/v1/<path>.json     e.g. dashboard/v1/predictions.json
//
// Bindings (configure in Pages → Settings → Functions → R2 bindings):
//   LAKE  →  bucket: quorum-prod-lake
//
// Auth note: this function is also gated by Cloudflare Access (policy on
// shaneconner.com/quorum*). Access blocks unauthenticated requests before
// they reach the function. We do NOT re-check auth here — Access is the
// source of truth.

const PREFIX = "dashboard/v1";

export async function onRequestGet({ request, env, params }) {
  if (!env.LAKE) {
    return jsonError(500, "r2_binding_missing",
      "LAKE R2 binding not configured on this Pages project");
  }

  // params.path is an array of path segments (catch-all route).
  const segments = Array.isArray(params.path) ? params.path : [params.path];
  const cleaned = segments
    .filter((s) => s && s !== "." && s !== "..")
    .join("/");

  if (!cleaned) {
    return jsonError(400, "missing_path", "request path must be /quorum-api/<key>");
  }

  // Append .json if the caller didn't include it.
  const r2Key = cleaned.endsWith(".json")
    ? `${PREFIX}/${cleaned}`
    : `${PREFIX}/${cleaned}.json`;

  const obj = await env.LAKE.get(r2Key);
  if (!obj) {
    return jsonError(404, "not_found",
      `no snapshot at ${r2Key} — check manifest.json or run dashboard_snapshot`);
  }

  // Stream the R2 body straight to the client. R2 stores it as JSON already.
  return new Response(obj.body, {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      // Always pull fresh from R2 — the snapshot writer's cadence is the
      // freshness boundary, not the browser. R2 reads from a Worker are
      // sub-100ms and dashboard correctness > a few ms of latency.
      "cache-control": "no-store",
      "x-r2-key": r2Key,
      "x-r2-uploaded": obj.uploaded ? obj.uploaded.toISOString() : "",
    },
  });
}

function jsonError(status, code, detail) {
  // Structured error body — matches the no-silent-fallbacks rule. Frontend
  // can distinguish "no data yet" (404) from "binding broken" (500).
  return new Response(
    JSON.stringify({ error: code, detail, status }),
    {
      status,
      headers: { "content-type": "application/json; charset=utf-8" },
    }
  );
}
