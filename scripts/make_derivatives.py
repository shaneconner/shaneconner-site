"""Generate grid and filmstrip derivatives for the art gallery images.

Usage:
  python scripts/make_derivatives.py
  python scripts/make_derivatives.py --html art/index.html

For every image referenced in art/index.html (grid src and data-gallery
entries) this produces, next to the original:
  grid_<name>.jpg   800px wide, q82, metadata stripped  (grid cells)
  thumb_<name>.jpg  96px tall, q80, metadata stripped   (lightbox filmstrip)

Skips derivatives that are already newer than their source. Requires the
ImageMagick `magick` CLI.
"""

import argparse
import os
import re
import subprocess


def find_image_urls(html_path):
    with open(html_path, "r") as f:
        html = f.read()

    urls = set()
    for match in re.findall(r'src="(/img/[^"]+)"', html):
        urls.add(match)
    for gallery in re.findall(r'data-gallery="([^"]+)"', html):
        urls.update(gallery.split(","))

    # Drop cache-buster query strings and anything that's already a derivative
    paths = set()
    for url in urls:
        path = url.split("?")[0]
        name = os.path.basename(path)
        if not name.startswith(("grid_", "thumb_")):
            paths.add(path)
    return sorted(paths)


def make_derivative(src, dst, geometry, quality):
    # Only regenerate when the source is newer than the derivative
    if os.path.exists(dst) and os.path.getmtime(dst) >= os.path.getmtime(src):
        return False
    subprocess.run(
        ["magick", src, "-auto-orient", "-resize", geometry,
         "-strip", "-quality", str(quality), dst],
        check=True,
    )
    return True


def main(site_root, html_path):
    urls = find_image_urls(html_path)
    made = skipped = missing = 0

    for url in urls:
        src = os.path.join(site_root, url.lstrip("/"))
        if not os.path.exists(src):
            print(f"  MISSING: {src}")
            missing += 1
            continue
        directory, name = os.path.split(src)
        for prefix, geometry, quality in (
            ("grid_", "800x>", 82),   # > = shrink only, never upscale
            ("thumb_", "x96>", 80),
        ):
            dst = os.path.join(directory, prefix + name)
            if make_derivative(src, dst, geometry, quality):
                made += 1
            else:
                skipped += 1

    print(f"{len(urls)} source images: {made} derivatives written, "
          f"{skipped} up to date, {missing} missing")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate gallery image derivatives")
    parser.add_argument("--html", default="art/index.html", help="HTML file to scan")
    args = parser.parse_args()

    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    main(root, os.path.join(root, args.html))
