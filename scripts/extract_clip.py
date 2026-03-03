"""Extract a viewable clip from full-frame JSONL files.

Usage:
  python scripts/extract_clip.py --start 108000 --end 112000
  python scripts/extract_clip.py --start 108000 --end 112000 --step 4
  python scripts/extract_clip.py --start 0 --end 10000 --dir data/full-frames-p4

Outputs a JSON clip file that the primordial-viz.js viewer can play.
"""

import argparse
import json
import os
import glob


def extract(frames_dir, start_tick, end_tick, step, output):
    # Find all JSONL chunk files, sorted
    pattern = os.path.join(frames_dir, "frames-*.jsonl")
    files = sorted(glob.glob(pattern))
    if not files:
        print(f"No JSONL files found in {frames_dir}")
        return

    snapshots = []
    total_scanned = 0

    for fpath in files:
        print(f"  Scanning {os.path.basename(fpath)}...")
        with open(fpath, "r") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                total_scanned += 1
                try:
                    frame = json.loads(line)
                except json.JSONDecodeError:
                    continue

                tick = frame.get("t", 0)
                if tick < start_tick:
                    continue
                if tick > end_tick:
                    # JSONL files are sequential, so we can stop early
                    break

                if (tick - start_tick) % step == 0:
                    snapshots.append(frame)

        # If we already passed end_tick, no need to read more files
        if snapshots and snapshots[-1].get("t", 0) >= end_tick:
            break

    if not snapshots:
        print(f"No frames found between tick {start_tick} and {end_tick}")
        return

    clip = {
        "world": {"width": 4000, "height": 2250},
        "snapshots": snapshots,
    }

    with open(output, "w") as f:
        json.dump(clip, f, separators=(",", ":"))

    size_mb = os.path.getsize(output) / (1024 * 1024)
    print(f"\nExtracted {len(snapshots)} frames (tick {snapshots[0]['t']} - {snapshots[-1]['t']})")
    print(f"Output: {output} ({size_mb:.1f} MB)")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Extract clip from JSONL frames")
    parser.add_argument("--start", type=int, required=True, help="Start tick")
    parser.add_argument("--end", type=int, required=True, help="End tick")
    parser.add_argument("--step", type=int, default=2, help="Tick step (default: 2, every frame)")
    parser.add_argument("--dir", default="data/full-frames-p4", help="Frames directory")
    parser.add_argument("--output", "-o", default=None, help="Output file path")
    args = parser.parse_args()

    if args.output is None:
        args.output = f"data/clip-p4-{args.start}-{args.end}.json"

    os.makedirs(os.path.dirname(args.output) or ".", exist_ok=True)
    print(f"Extracting ticks {args.start}-{args.end} (step {args.step}) from {args.dir}")
    extract(args.dir, args.start, args.end, args.step, args.output)
