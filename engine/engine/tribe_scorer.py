"""TRIBE v2 model wrapper.

Loads Meta's TRIBE v2 (TRansformer for In-silico Brain Experiments)
and runs inference on a video file, returning raw cortical activation
predictions on the fsaverage5 mesh.
"""

from __future__ import annotations

import time
from dataclasses import dataclass
from pathlib import Path
from typing import Callable, Optional

import numpy as np


@dataclass
class InferenceResult:
    """Raw output from TRIBE v2 inference."""

    activations: np.ndarray          # (n_timepoints, 20484) cortical vertices
    timepoints_sec: np.ndarray       # (n_timepoints,) seconds into video
    video_duration_sec: float
    video_path: str
    inference_time_sec: float
    modalities_used: list[str]       # e.g. ["video", "audio"]


StageCallback = Callable[[str, float], None]   # (stage_name, progress_0_to_1)


def load_model(
    device: str = "cuda",
    dtype: str = "float16",
    sequential_offload: bool = True,
):
    """Load TRIBE v2 for inference on L4 (24GB VRAM).

    Falls back to CPU when CUDA is unavailable.
    """
    import torch

    if device == "cuda" and not torch.cuda.is_available():
        device = "cpu"

    from tribev2 import TribeModel

    model = TribeModel.from_pretrained(
        "facebook/tribev2",
        device=device,
        cache_folder="./cache",
    )

    return model


def run_inference(
    model,
    video_path: str | Path,
    *,
    modalities: tuple[str, ...] = ("video", "audio"),
    on_stage: Optional[StageCallback] = None,
) -> InferenceResult:
    """Run TRIBE v2 on a video and return cortical activation predictions.

    Parameters
    ----------
    model : loaded TRIBEv2Model
    video_path : path to .mp4 / .mov / .webm file
    modalities : which encoders to run ("video", "audio", "text")
    on_stage : optional callback for progress updates
    """
    import torch

    video_path = Path(video_path)
    if not video_path.exists():
        raise FileNotFoundError(f"Video not found: {video_path}")

    def _notify(stage: str, pct: float = 0.0):
        if on_stage is not None:
            on_stage(stage, pct)

    t0 = time.perf_counter()

    _notify("Extracting stimuli events", 0.0)
    events = model.get_events_dataframe(video_path=str(video_path))
    _notify("Extracting stimuli events", 1.0)

    _notify("Running brain prediction", 0.0)
    predictions, _segments = model.predict(events)
    _notify("Running brain prediction", 1.0)

    elapsed = time.perf_counter() - t0

    activations = np.asarray(predictions, dtype=np.float32)

    n_timepoints = activations.shape[0]
    tr_sec = 1.0  # TRIBE v2 default TR
    video_duration = n_timepoints * tr_sec
    timepoints = np.arange(n_timepoints) * tr_sec

    return InferenceResult(
        activations=activations,
        timepoints_sec=timepoints,
        video_duration_sec=video_duration,
        video_path=str(video_path),
        inference_time_sec=elapsed,
        modalities_used=list(modalities),
    )


# -- Demo / offline mode ----------------------------------------------

def run_demo_inference(
    video_path: str | Path,
    *,
    duration_sec: float = 30.0,
    on_stage: Optional[StageCallback] = None,
) -> InferenceResult:
    """Generate synthetic brain activations for UI testing without a GPU.

    Creates plausible-looking activation patterns with reward spikes
    and attention ramps so the display layer can be developed offline.
    """
    from engine.brain_regions import TOTAL_VERTICES, build_masks
    from scipy.ndimage import uniform_filter1d

    def _notify(stage: str, pct: float = 0.0):
        if on_stage is not None:
            on_stage(stage, pct)

    t0 = time.perf_counter()
    n_timepoints = int(duration_sec)
    rng = np.random.default_rng(42)

    _notify("Generating synthetic brain data", 0.0)

    activations = rng.standard_normal((n_timepoints, TOTAL_VERTICES)).astype(np.float32)

    # Get the real atlas-mapped vertex masks so demo data hits correctly
    masks = build_masks()

    # Reward: strong hook at 3s, dopamine bursts at 12s and 22s
    reward_verts = masks["reward"]
    for spike_t, strength in [(3, 5.0), (12, 4.5), (22, 4.0)]:
        if spike_t < n_timepoints:
            activations[spike_t, reward_verts] += strength
            activations[min(spike_t + 1, n_timepoints - 1), reward_verts] += strength * 0.6
    # Sustained reward baseline
    activations[:, reward_verts] += 1.5

    # Emotion: arc peaking at 15s (emotional climax)
    emotion_verts = masks["emotion"]
    emotion_arc = np.exp(-0.5 * ((np.arange(n_timepoints) - 15) / 6) ** 2) * 4.0
    activations[:, emotion_verts] += emotion_arc[:, None] + 1.0

    # Attention: rising trend = content holds attention throughout
    attn_verts = masks["attention"]
    ramp = np.linspace(0.5, 3.5, n_timepoints)
    activations[:, attn_verts] += ramp[:, None]

    # Memory: moderate encoding with peaks at key moments
    mem_verts = masks["memory"]
    memory_signal = np.sin(np.linspace(0, 2 * np.pi, n_timepoints)) * 1.5 + 0.8
    activations[:, mem_verts] += memory_signal[:, None]

    # Smooth temporally for realism
    activations = uniform_filter1d(activations, size=3, axis=0)

    _notify("Generating synthetic brain data", 1.0)

    return InferenceResult(
        activations=activations,
        timepoints_sec=np.arange(n_timepoints, dtype=np.float32),
        video_duration_sec=duration_sec,
        video_path=str(video_path),
        inference_time_sec=time.perf_counter() - t0,
        modalities_used=["demo"],
    )
