# shaneconner.com

Personal portfolio site — abstract oil paintings and technical projects.

**[shaneconner.com](https://shaneconner.com)**

## Structure

```
/              Landing page
/art           Painting gallery
/projects      Technical project showcase
/contact       CV and contact info
/quorum        Private dashboard for the Quorum pipeline (noindex, behind Cloudflare Access)
/functions     Cloudflare Pages Functions (quorum-api serves JSON snapshots from R2)
/scripts       Utilities: extract_clip.py (simulation clip extraction), check_consistency.sh
/data          Simulation clip and timeline JSON for the Primordial visualizations
```

## Stack

Static HTML/CSS/JS hosted on Cloudflare Pages. D3.js (self-hosted at /js/d3.v7.min.js) for project visualizations.

The quorum-api Pages Function requires an R2 binding: `LAKE` → bucket `quorum-prod-lake` (Pages → Settings → Functions → R2 bindings).

`scripts/check_consistency.sh` greps the editorial pages for head-boilerplate drift (canonical links, og:image, fonts URL, self-hosted d3) and exits nonzero on offenders.
