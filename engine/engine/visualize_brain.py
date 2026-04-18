#!/usr/bin/env python3
"""Brain activation visualizer for the Neuro-Viral Score Engine.

Renders TRIBE v2 cortical predictions as brain surface images and
an animated GIF — the same data the Meta demo website shows, but
rendered locally using nilearn + matplotlib.

Usage:
    # After running inference, visualize the saved activations:
    python -m engine.visualize_brain activations.npz

    # Or run fresh inference + visualization in one shot:
    python -m engine.visualize_brain video.mp4 --live

    # Demo mode (no GPU needed):
    python -m engine.visualize_brain video.mp4 --demo
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

import matplotlib
matplotlib.use("Agg")  # headless rendering — no display needed

import matplotlib.pyplot as plt
import matplotlib.animation as animation
import numpy as np

# nilearn surface plotting
from nilearn.datasets import load_fsaverage
from nilearn.plotting import plot_surf_stat_map


# ── Configuration ─────────────────────────────────────────────────

VIEWS = {
    "left":   (0, 180),
    "right":  (0, 0),
    "dorsal": (90, 0),
    "ventral": (-90, 0),
}

OUTPUT_DIR = Path("brain_renders")


# ── Core rendering ────────────────────────────────────────────────

def render_brain_frame(
    activations_1d: np.ndarray,
    fsaverage: dict,
    title: str = "",
    views: dict | None = None,
    save_path: Path | None = None,
    cmap: str = "cold_hot",
    threshold: float = 0.3,
) -> plt.Figure:
    """Render one timepoint of cortical activations across multiple views.

    Parameters
    ----------
    activations_1d : (20484,) array — vertex activations for one timepoint
    fsaverage : nilearn fsaverage5 mesh dict
    title : figure title
    views : dict of {name: (elev, azim)} angles
    save_path : optional path to save the figure
    cmap : matplotlib colormap (cold_hot shows + and - activations)
    threshold : minimum absolute value to display
    """
    if views is None:
        views = VIEWS

    n_vertices = len(activations_1d)
    half = n_vertices // 2
    left_data = activations_1d[:half]
    right_data = activations_1d[half:]

    fig, axes = plt.subplots(
        1, len(views),
        figsize=(4 * len(views), 4),
        subplot_kw={"projection": "3d"},
    )

    if len(views) == 1:
        axes = [axes]

    for ax, (view_name, (elev, azim)) in zip(axes, views.items()):
        is_left = "left" in view_name or view_name in ("dorsal", "ventral")

        if is_left:
            surf_mesh = fsaverage["pial_left"]
            bg_map = fsaverage["sulc_left"]
            stat_map = left_data
        else:
            surf_mesh = fsaverage["pial_right"]
            bg_map = fsaverage["sulc_right"]
            stat_map = right_data

        vmax = max(abs(activations_1d.max()), abs(activations_1d.min()), 2.0)

        plot_surf_stat_map(
            surf_mesh=surf_mesh,
            stat_map=stat_map,
            bg_map=bg_map,
            view=(elev, azim),
            axes=ax,
            figure=fig,
            cmap=cmap,
            threshold=threshold,
            vmax=vmax,
            symmetric_cbar=True,
            colorbar=False,
            bg_on_data=True,
        )

        ax.set_title(view_name, fontsize=9, pad=-2)

    fig.suptitle(title, fontsize=12, fontweight="bold", y=0.98)
    fig.tight_layout()

    if save_path is not None:
        save_path.parent.mkdir(parents=True, exist_ok=True)
        fig.savefig(save_path, dpi=150, bbox_inches="tight", facecolor="black")
        print(f"  Saved: {save_path}")

    return fig


def render_all_timepoints(
    activations: np.ndarray,
    timepoints_sec: np.ndarray,
    output_dir: Path,
    fsaverage: dict,
) -> list[Path]:
    """Render every timepoint as a separate PNG.

    Parameters
    ----------
    activations : (n_timepoints, 20484) array
    timepoints_sec : (n_timepoints,) array
    output_dir : directory to write PNGs into
    fsaverage : nilearn fsaverage mesh

    Returns
    -------
    List of saved file paths
    """
    output_dir.mkdir(parents=True, exist_ok=True)
    saved = []

    n = activations.shape[0]
    # Sample at most 15 frames for sanity
    step = max(1, n // 15)
    indices = list(range(0, n, step))

    print(f"\n  Rendering {len(indices)} brain frames...")

    for i, t_idx in enumerate(indices):
        t_sec = timepoints_sec[t_idx]
        title = f"t = {t_sec:.0f}s"
        path = output_dir / f"brain_t{int(t_sec):03d}.png"

        fig = render_brain_frame(
            activations[t_idx],
            fsaverage=fsaverage,
            title=title,
            save_path=path,
        )
        plt.close(fig)

        pct = (i + 1) / len(indices) * 100
        print(f"  [{pct:5.1f}%] Frame {i+1}/{len(indices)}", end="\r")
        saved.append(path)

    print()
    return saved


def create_rotating_gif(
    activations_1d: np.ndarray,
    fsaverage: dict,
    save_path: Path,
    title: str = "Brain Activation",
    n_frames: int = 60,
    fps: int = 15,
) -> None:
    """Create a GIF of a brain rotating 360 degrees.

    Parameters
    ----------
    activations_1d : (20484,) array — single timepoint
    fsaverage : nilearn fsaverage mesh
    save_path : output .gif path
    title : figure title
    n_frames : how many rotation frames (more = smoother)
    fps : frames per second
    """
    half = len(activations_1d) // 2
    left_data = activations_1d[:half]

    fig, ax = plt.subplots(
        1, 1, figsize=(5, 5),
        subplot_kw={"projection": "3d"},
    )

    vmax = max(abs(activations_1d.max()), abs(activations_1d.min()), 2.0)

    plot_surf_stat_map(
        surf_mesh=fsaverage["pial_left"],
        stat_map=left_data,
        bg_map=fsaverage["sulc_left"],
        view=(0, 180),
        axes=ax,
        figure=fig,
        cmap="cold_hot",
        threshold=0.3,
        vmax=vmax,
        symmetric_cbar=True,
        colorbar=False,
        bg_on_data=True,
    )

    fig.suptitle(title, fontsize=14, fontweight="bold", color="white")
    fig.patch.set_facecolor("black")

    angles = np.linspace(0, 360, n_frames, endpoint=False)

    def animate(i: int):
        ax.view_init(elev=5, azim=angles[i])
        return (ax,)

    ani = animation.FuncAnimation(fig, animate, frames=n_frames, interval=1000 // fps)
    writer = animation.PillowWriter(fps=fps)

    save_path.parent.mkdir(parents=True, exist_ok=True)
    ani.save(str(save_path), writer=writer)
    plt.close(fig)
    print(f"  Saved rotating brain GIF: {save_path}")


def create_network_highlight(
    activations: np.ndarray,
    timepoint_idx: int,
    fsaverage: dict,
    save_path: Path,
) -> None:
    """Render a 4-panel figure highlighting each engagement network.

    Shows Reward, Emotion, Attention, Memory networks side by side
    with only their vertices colored.
    """
    from engine.brain_regions import ALL_NETWORKS, build_masks

    masks = build_masks()
    act = activations[timepoint_idx]
    half = len(act) // 2

    fig, axes = plt.subplots(
        1, 4, figsize=(16, 4),
        subplot_kw={"projection": "3d"},
    )

    colors = {
        "reward": "YlOrRd",
        "emotion": "RdPu",
        "attention": "Blues",
        "memory": "Purples",
    }

    for ax, network in zip(axes, ALL_NETWORKS):
        mask = masks[network.name]
        masked_act = np.zeros_like(act)
        masked_act[mask] = act[mask]

        left_data = masked_act[:half]

        plot_surf_stat_map(
            surf_mesh=fsaverage["pial_left"],
            stat_map=left_data,
            bg_map=fsaverage["sulc_left"],
            view=(0, 180),
            axes=ax,
            figure=fig,
            cmap=colors[network.name],
            threshold=0.1,
            colorbar=False,
            bg_on_data=True,
        )

        ax.set_title(
            network.display_name,
            fontsize=10,
            fontweight="bold",
            color="white",
            pad=-2,
        )

    fig.suptitle("Engagement Network Activations", fontsize=13, fontweight="bold", y=1.02)
    fig.tight_layout()
    save_path.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(save_path, dpi=150, bbox_inches="tight", facecolor="black")
    plt.close(fig)
    print(f"  Saved network highlight: {save_path}")


# ── CLI ───────────────────────────────────────────────────────────

def parse_args() -> argparse.Namespace:
    """Parse CLI arguments for the brain visualization tool."""
    parser = argparse.ArgumentParser(
        prog="visualize-brain",
        description="Render TRIBE v2 brain activations as images and GIFs.",
    )
    parser.add_argument(
        "input",
        help="Path to .npz activations file OR video file (with --live/--demo)",
    )
    parser.add_argument(
        "--live",
        action="store_true",
        help="Run TRIBE v2 inference on a video first",
    )
    parser.add_argument(
        "--demo",
        action="store_true",
        help="Use synthetic brain data (no GPU needed)",
    )
    parser.add_argument(
        "--output-dir",
        default="brain_renders",
        help="Output directory for images (default: brain_renders/)",
    )
    parser.add_argument(
        "--gif",
        action="store_true",
        default=True,
        help="Generate rotating brain GIF (default: True)",
    )
    parser.add_argument(
        "--peak-time",
        type=int,
        default=None,
        help="Specific timepoint index for the GIF (default: max reward)",
    )
    return parser.parse_args()


def main() -> None:
    """Run the brain visualization pipeline: load activations, render frames, and generate GIFs."""
    args = parse_args()
    input_path = Path(args.input)
    output_dir = Path(args.output_dir)

    print("\n  Neuro-Viral Brain Visualizer")
    print("  ─────────────────────────────────\n")

    # Step 1: Get activations
    if args.demo:
        print("  Mode: DEMO (synthetic brain data)")
        from engine.tribe_scorer import run_demo_inference

        result = run_demo_inference(video_path=str(input_path), duration_sec=30.0)
        activations = result.activations
        timepoints = result.timepoints_sec

    elif args.live:
        print("  Mode: LIVE (TRIBE v2 inference)")
        from engine.tribe_scorer import load_model, run_inference

        model = load_model()
        result = run_inference(model, video_path=str(input_path))
        activations = result.activations
        timepoints = result.timepoints_sec

        # Save for re-use without re-running inference
        npz_path = output_dir / "activations.npz"
        npz_path.parent.mkdir(parents=True, exist_ok=True)
        np.savez(
            npz_path,
            activations=activations,
            timepoints_sec=timepoints,
        )
        print(f"  Saved activations: {npz_path}")

    else:
        print(f"  Loading saved activations: {input_path}")
        data = np.load(input_path)
        activations = data["activations"]
        timepoints = data["timepoints_sec"]

    n_timepoints, n_vertices = activations.shape
    print(f"  Shape: {n_timepoints} timepoints × {n_vertices} vertices")

    # Step 2: Load fsaverage5 mesh
    print("  Loading fsaverage5 brain mesh...")
    fsaverage = load_fsaverage(mesh="fsaverage5")

    # Step 3: Render frames
    render_all_timepoints(activations, timepoints, output_dir / "frames", fsaverage)

    # Step 4: Rotating GIF at peak reward moment
    if args.gif:
        from engine.brain_regions import build_masks

        if args.peak_time is not None:
            peak_idx = args.peak_time
        else:
            # Find the timepoint with maximum reward network activation
            masks = build_masks()
            reward_ts = activations[:, masks["reward"]].mean(axis=1)
            peak_idx = int(np.argmax(reward_ts))

        peak_sec = timepoints[peak_idx]
        print(f"\n  Peak reward at t={peak_sec:.0f}s — rendering rotating GIF...")

        create_rotating_gif(
            activations[peak_idx],
            fsaverage=fsaverage,
            save_path=output_dir / "brain_rotating.gif",
            title=f"Peak Reward Activation (t={peak_sec:.0f}s)",
            n_frames=60,
            fps=15,
        )

    # Step 5: Summary
    print(f"\n  ✅ All renders saved to: {output_dir}/")
    print(f"     - frames/      → {len(list((output_dir / 'frames').glob('*.png')))} PNG snapshots")
    if args.gif:
        print(f"     - brain_rotating.gif → 360° rotation at peak reward")
    print()


if __name__ == "__main__":
    main()
