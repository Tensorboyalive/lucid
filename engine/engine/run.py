#!/usr/bin/env python3
"""CLI entry point for the Neuro-Viral Score Engine.

Usage:
    python -m engine.run video.mp4              # full TRIBE v2 inference (GPU)
    python -m engine.run video.mp4 --demo       # synthetic data (no GPU needed)
    python -m engine.run video.mp4 --dtype bf16 # BF16 mode (3x faster, A100)
"""

from __future__ import annotations

import argparse
import sys
import warnings
from pathlib import Path

warnings.filterwarnings("ignore", category=DeprecationWarning)
warnings.filterwarnings("ignore", message=".*urllib3.*")
warnings.filterwarnings("ignore", message=".*NotOpenSSLWarning.*")

import logging
logging.getLogger("nilearn").setLevel(logging.ERROR)

from engine.display import console, create_progress, print_full_report, print_header


def parse_args() -> argparse.Namespace:
    """Parse CLI arguments for the neuro-viral scoring engine."""
    parser = argparse.ArgumentParser(
        prog="neuro-viral",
        description="Score your video's viral potential using neuroscience.",
    )
    parser.add_argument(
        "video",
        type=str,
        help="Path to video file (.mp4, .mov, .webm)",
    )
    parser.add_argument(
        "--demo",
        action="store_true",
        help="Use synthetic brain data (no GPU / TRIBE v2 needed)",
    )
    parser.add_argument(
        "--device",
        default="cuda",
        choices=["cuda", "cpu"],
        help="Device for inference (default: cuda)",
    )
    parser.add_argument(
        "--dtype",
        default="float16",
        choices=["float16", "bfloat16", "float32"],
        help="Model precision (bf16 is faster on A100)",
    )
    parser.add_argument(
        "--modalities",
        nargs="+",
        default=["video", "audio"],
        choices=["video", "audio", "text"],
        help="Which encoders to run (default: video audio)",
    )
    return parser.parse_args()


def main() -> None:
    """Run the scoring pipeline: load model, infer, score, and display."""
    args = parse_args()
    video_path = Path(args.video)

    if not args.demo and not video_path.exists():
        console.print(f"[red]Error:[/] Video not found: {video_path}")
        sys.exit(1)

    print_header()

    if args.demo:
        # -- Demo mode: no GPU needed ---
        console.print("  [dim]Mode:[/]   [yellow]DEMO[/] (synthetic brain data)")
        console.print()

        from engine.tribe_scorer import run_demo_inference

        progress = create_progress()
        with progress:
            task = progress.add_task("Simulating brain response...", total=1.0)

            def on_stage(stage: str, pct: float) -> None:
                progress.update(task, description=stage, completed=pct)

            result = run_demo_inference(
                video_path=str(video_path),
                duration_sec=30.0,
                on_stage=on_stage,
            )
            progress.update(task, completed=1.0)

    else:
        # -- Real TRIBE v2 inference ---
        console.print("  [dim]Mode:[/]   [green]LIVE[/] (TRIBE v2 inference)")
        console.print(f"  [dim]Device:[/] {args.device} | dtype: {args.dtype}")
        console.print(f"  [dim]Mods:[/]   {', '.join(args.modalities)}")
        console.print()

        from engine.tribe_scorer import load_model, run_inference

        progress = create_progress()
        with progress:
            load_task = progress.add_task("Loading TRIBE v2 model...", total=1.0)
            model = load_model(device=args.device, dtype=args.dtype)
            progress.update(load_task, completed=1.0, description="Model loaded")

            infer_task = progress.add_task("Running brain simulation...", total=1.0)

            def on_stage(stage: str, pct: float) -> None:
                progress.update(infer_task, description=stage, completed=pct)

            result = run_inference(
                model,
                video_path=str(video_path),
                modalities=tuple(args.modalities),
                on_stage=on_stage,
            )
            progress.update(infer_task, completed=1.0, description="Inference complete")

    # -- Score and display ---
    from engine.viral_score import compute_viral_score

    console.print()
    with console.status("[cyan]Mapping brain regions to engagement networks...[/]"):
        score_result = compute_viral_score(result)

    print_full_report(score_result, video_path=str(video_path))

    console.print(
        f"  [dim]Inference time: {result.inference_time_sec:.1f}s "
        f"| Modalities: {', '.join(result.modalities_used)}[/]"
    )
    console.print()


if __name__ == "__main__":
    main()
