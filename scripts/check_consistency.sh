#!/usr/bin/env bash
# Guards against head-boilerplate drift across the hand-copied HTML pages.
# Scoped to the editorial pages: quorum/*.html (noindex dashboards with their
# own fonts URL) and primordial/viewer.html (bare dev utility) are excluded.
set -u
cd "$(dirname "$0")/.."
fail=0
flag() { printf 'FAIL: %s\n' "$1"; fail=1; }

pages=$(find . -name '*.html' -not -path './quorum/*' -not -name 'viewer.html')

for f in $pages; do
  if ! grep -q 'name="robots" content="noindex' "$f"; then
    grep -q 'rel="canonical"' "$f" || flag "$f: missing <link rel=\"canonical\">"
  fi
  case "$f" in ./projects/*)
    grep -q 'property="og:image"' "$f" || flag "$f: missing og:image" ;;
  esac
  grep -q 'd3js.org' "$f" && flag "$f: references d3js.org (use /js/d3.v7.min.js)"
  grep -q 'Outfit:wght@200' "$f" && flag "$f: stale fonts URL (Outfit weight 200 was dropped)"
  grep -q '<div class="essay-divider" style=' "$f" && flag "$f: inline-styled essay-divider"
done

[ "$fail" -eq 0 ] && echo "OK: editorial pages consistent"
exit "$fail"
