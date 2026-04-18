"""Neuro-viral score computation.

Takes raw brain activations from TRIBE v2, maps them to engagement
networks, and produces a 0-10 score with per-network breakdown.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List, Tuple

import numpy as np

from engine.brain_regions import ALL_NETWORKS, EngagementNetwork, build_masks
from engine.tribe_scorer import InferenceResult


@dataclass
class NetworkScore:
    """Score breakdown for a single brain network."""

    network: EngagementNetwork
    score: float                     # 0-10
    mean_activation: float           # z-scored mean
    peak_value: float                # strongest activation
    peak_time_sec: float             # when the peak occurred
    trend_slope: float               # positive = rising engagement
    top_moments_sec: List[float]     # timestamps of significant peaks


@dataclass
class ViralScoreResult:
    """Complete neuro-viral scoring output."""

    final_score: float               # 0-10 weighted composite
    network_scores: Dict[str, NetworkScore]
    verdict: str                     # e.g. "HIGH VIRAL POTENTIAL"
    verdict_color: str               # rich color tag
    hook_moments_sec: List[float]    # timestamps that trigger dopamine
    video_duration_sec: float


# -- Score thresholds and verdicts -------------------------------------

VERDICTS: List[Tuple[float, str, str]] = [
    (8.5, "EXPLOSIVE VIRAL POTENTIAL", "bold green"),
    (7.0, "HIGH VIRAL POTENTIAL",      "green"),
    (5.5, "MODERATE POTENTIAL",        "yellow"),
    (4.0, "BELOW AVERAGE",            "dark_orange"),
    (0.0, "LOW ENGAGEMENT PREDICTED",  "red"),
]


def _get_verdict(score: float) -> Tuple[str, str]:
    """Return (verdict_label, rich_color) for a 0-10 composite score."""
    for threshold, label, color in VERDICTS:
        if score >= threshold:
            return label, color
    return VERDICTS[-1][1], VERDICTS[-1][2]


# -- Per-network scoring -----------------------------------------------

def _z_normalize(arr: np.ndarray) -> np.ndarray:
    """Z-score normalize, handling zero-variance gracefully."""
    std = arr.std()
    if std < 1e-8:
        return np.zeros_like(arr)
    return (arr - arr.mean()) / std


def _detect_peaks(
    timeseries: np.ndarray,
    threshold_std: float = 1.5,
) -> List[int]:
    """Find timepoints where activation exceeds threshold_std above mean."""
    z = _z_normalize(timeseries)
    peak_indices = np.where(z > threshold_std)[0]
    if len(peak_indices) == 0:
        return []

    # Merge peaks within 2 TRs of each other — keep the strongest
    merged: List[int] = []
    current_group = [peak_indices[0]]
    for idx in peak_indices[1:]:
        if idx - current_group[-1] <= 2:
            current_group.append(idx)
        else:
            best = current_group[int(np.argmax(z[current_group]))]
            merged.append(best)
            current_group = [idx]
    best = current_group[int(np.argmax(z[current_group]))]
    merged.append(best)
    return merged


def _linear_slope(y: np.ndarray) -> float:
    """Compute slope of best-fit line over the timeseries."""
    n = len(y)
    if n < 2:
        return 0.0
    x = np.arange(n, dtype=np.float64)
    x_mean = x.mean()
    y_mean = y.mean()
    denom = ((x - x_mean) ** 2).sum()
    if denom < 1e-12:
        return 0.0
    return float(((x - x_mean) * (y - y_mean)).sum() / denom)


def score_network(
    network: EngagementNetwork,
    activations: np.ndarray,
    mask: np.ndarray,
    timepoints_sec: np.ndarray,
    global_mean: float,
    global_std: float,
) -> NetworkScore:
    """Compute engagement score for one brain network.

    Combines three signals:
      - base intensity    (60% weight) — mean activation vs global baseline
      - peak moments      (25% weight) — strength of strongest activations
      - temporal dynamics  (15% weight) — rising vs falling trend
    """
    # Extract mean activation across network vertices at each timepoint
    network_ts = activations[:, mask].mean(axis=1)

    # Normalise relative to the whole-brain baseline
    if global_std > 1e-8:
        z_ts = (network_ts - global_mean) / global_std
    else:
        z_ts = np.zeros_like(network_ts)

    # -- Base intensity (0-10) --
    mean_z = float(z_ts.mean())
    # Map z-scores roughly: z=0 → 5, z=+2 → 10, z=-2 → 0
    base_score = np.clip(mean_z * 2.5 + 5.0, 0.0, 10.0)

    # -- Peak bonus (0-10) --
    peak_indices = _detect_peaks(network_ts)
    if peak_indices:
        peak_z_values = z_ts[peak_indices]
        peak_bonus = np.clip(float(peak_z_values.max()) * 2.0 + 3.0, 0.0, 10.0)
        peak_value = float(z_ts.max())
        peak_time = float(timepoints_sec[int(np.argmax(z_ts))])
        top_moments = [float(timepoints_sec[i]) for i in peak_indices[:5]]
    else:
        peak_bonus = 3.0
        peak_value = float(z_ts.max()) if len(z_ts) > 0 else 0.0
        peak_time = 0.0
        top_moments = []

    # -- Temporal dynamics bonus (0-10) --
    slope = _linear_slope(z_ts)
    # Positive slope = rising engagement (good); clamp to reasonable range
    dynamics_score = np.clip(slope * 15.0 + 5.0, 0.0, 10.0)

    # -- Composite --
    composite = base_score * 0.60 + peak_bonus * 0.25 + dynamics_score * 0.15
    final = float(np.clip(composite, 0.0, 10.0))

    return NetworkScore(
        network=network,
        score=round(final, 1),
        mean_activation=round(mean_z, 3),
        peak_value=round(peak_value, 3),
        peak_time_sec=round(peak_time, 1),
        trend_slope=round(slope, 4),
        top_moments_sec=[round(t, 1) for t in top_moments],
    )


# -- Full pipeline ------------------------------------------------------

def compute_viral_score(result: InferenceResult) -> ViralScoreResult:
    """Compute the complete neuro-viral score from TRIBE v2 output."""
    masks = build_masks()

    # Global baseline stats (across all vertices and timepoints)
    global_mean = float(result.activations.mean())
    global_std = float(result.activations.std())

    network_scores: Dict[str, NetworkScore] = {}

    for network in ALL_NETWORKS:
        ns = score_network(
            network=network,
            activations=result.activations,
            mask=masks[network.name],
            timepoints_sec=result.timepoints_sec,
            global_mean=global_mean,
            global_std=global_std,
        )
        network_scores[network.name] = ns

    # Weighted final score
    final = sum(
        network_scores[net.name].score * net.weight
        for net in ALL_NETWORKS
    )
    final = round(float(np.clip(final, 0.0, 10.0)), 1)

    verdict, verdict_color = _get_verdict(final)

    # Collect hook moments (reward + emotion peaks)
    hook_moments = sorted(set(
        network_scores["reward"].top_moments_sec
        + network_scores["emotion"].top_moments_sec
    ))

    return ViralScoreResult(
        final_score=final,
        network_scores=network_scores,
        verdict=verdict,
        verdict_color=verdict_color,
        hook_moments_sec=hook_moments[:8],
        video_duration_sec=result.video_duration_sec,
    )
