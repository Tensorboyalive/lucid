#!/usr/bin/env python3
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.animation as animation
from pathlib import Path
from nilearn.datasets import fetch_surf_fsaverage
from nilearn.plotting import plot_surf_stat_map

print("Loading brain mesh...", flush=True)
fs = fetch_surf_fsaverage("fsaverage5")
MESH = {"left": fs["pial_left"], "right": fs["pial_right"]}
BG = {"left": fs["sulc_left"], "right": fs["sulc_right"]}


def render_frame(act, title, path):
    """Render a single timepoint as a 4-view brain panel (left, right, dorsal, ventral)."""
    half = len(act) // 2
    sides = {"left": act[:half], "right": act[half:]}
    views = {"left": (0, 180), "right": (0, 0), "dorsal": (90, 0), "ventral": (-90, 0)}
    fig, axes = plt.subplots(1, 4, figsize=(16, 4), subplot_kw={"projection": "3d"})
    fig.patch.set_facecolor("black")
    vmax = max(abs(act.max()), abs(act.min()), 2.0)
    for ax, (vn, (el, az)) in zip(axes, views.items()):
        s = "left" if "left" in vn or vn in ("dorsal", "ventral") else "right"
        plot_surf_stat_map(
            surf_mesh=MESH[s], stat_map=sides[s], bg_map=BG[s],
            view=(el, az), axes=ax, figure=fig, cmap="cold_hot", threshold=0.3,
            vmax=vmax, symmetric_cbar=True, colorbar=False, bg_on_data=True,
        )
        ax.set_title(vn, fontsize=10, color="white", pad=-2)
    fig.suptitle(title, fontsize=14, fontweight="bold", color="white", y=0.98)
    fig.tight_layout()
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(path, dpi=150, bbox_inches="tight", facecolor="black")
    plt.close(fig)


def make_gif(act, title, path, frames=72, fps=18):
    """Generate a rotating brain GIF from a single activation snapshot."""
    half = len(act) // 2
    fig, ax = plt.subplots(1, 1, figsize=(6, 6), subplot_kw={"projection": "3d"})
    fig.patch.set_facecolor("black")
    vmax = max(abs(act.max()), abs(act.min()), 2.0)
    plot_surf_stat_map(
        surf_mesh=MESH["left"], stat_map=act[:half], bg_map=BG["left"],
        view=(0, 180), axes=ax, figure=fig, cmap="cold_hot", threshold=0.3,
        vmax=vmax, symmetric_cbar=True, colorbar=False, bg_on_data=True,
    )
    fig.suptitle(title, fontsize=14, fontweight="bold", color="white")
    angles = np.linspace(0, 360, frames, endpoint=False)

    def anim(i):
        ax.view_init(elev=5, azim=angles[i])
        return (ax,)

    ani = animation.FuncAnimation(fig, anim, frames=frames, interval=1000 // fps)
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    ani.save(str(path), writer=animation.PillowWriter(fps=fps))
    plt.close(fig)


def network_panels(activations, t_idx, path):
    """Render a 4-panel view showing each engagement network's activation at a given timepoint."""
    from engine.brain_regions import ALL_NETWORKS, build_masks
    masks = build_masks()
    act = activations[t_idx]
    half = len(act) // 2
    fig, axes = plt.subplots(1, 4, figsize=(20, 5), subplot_kw={"projection": "3d"})
    fig.patch.set_facecolor("black")
    cms = {"reward": "YlOrRd", "emotion": "RdPu", "attention": "Blues", "memory": "Purples"}
    for ax, net in zip(axes, ALL_NETWORKS):
        m = np.zeros_like(act)
        m[masks[net.name]] = act[masks[net.name]]
        plot_surf_stat_map(
            surf_mesh=MESH["left"], stat_map=m[:half], bg_map=BG["left"],
            view=(0, 180), axes=ax, figure=fig, cmap=cms[net.name],
            threshold=0.1, colorbar=False, bg_on_data=True,
        )
        label = f"{net.display_name} ({int(net.weight * 100)}%)"
        ax.set_title(label, fontsize=11, color="white", fontweight="bold", pad=-2)
    fig.suptitle("Engagement Networks", fontsize=15, fontweight="bold", color="white", y=1.0)
    fig.tight_layout()
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(path, dpi=150, bbox_inches="tight", facecolor="black")
    plt.close(fig)


if __name__ == "__main__":
    from engine.brain_regions import build_masks
    npzs = sorted(Path("brain_renders").glob("*_activations.npz"))
    print(f"Found {len(npzs)} activation files", flush=True)

    for npz in npzs:
        name = npz.stem.replace("_activations", "")
        d = np.load(npz)
        act = d["activations"]
        tp = d["timepoints_sec"]
        print(f"\n=== {name} ({act.shape[0]} frames) ===", flush=True)

        # Render brain frames
        step = max(1, act.shape[0] // 12)
        for i in range(0, act.shape[0], step):
            t_sec = tp[i]
            p = f"brain_renders/{name}_frames/brain_t{int(t_sec):03d}.png"
            render_frame(act[i], f"{name} t={int(t_sec)}s", p)
            print(f"  Frame t={int(t_sec)}s", flush=True)

        # Network panel at peak reward
        masks = build_masks()
        rts = act[:, masks["reward"]].mean(axis=1)
        pk = int(np.argmax(rts))
        network_panels(act, pk, f"brain_renders/{name}_networks.png")
        print(f"  Network panel (peak t={int(tp[pk])}s)", flush=True)

        # Rotating GIF at peak reward
        make_gif(
            act[pk],
            f"{name} Peak Reward t={int(tp[pk])}s",
            f"brain_renders/{name}_rotating_reward.gif",
        )
        print("  GIF: rotating reward", flush=True)

        # Rotating GIF at max activation
        gp = int(np.argmax(np.abs(act).mean(axis=1)))
        make_gif(
            act[gp],
            f"{name} Max Activation t={int(tp[gp])}s",
            f"brain_renders/{name}_rotating_max.gif",
        )
        print("  GIF: rotating max", flush=True)

    print("\nAll done.", flush=True)
