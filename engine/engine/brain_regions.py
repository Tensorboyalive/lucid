"""Brain region mapping for viral engagement scoring.

Maps Destrieux atlas parcels on fsaverage5 to four engagement-relevant
cortical networks. Each network acts as a cortical proxy for the
subcortical circuits that drive sharing, emotional response, sustained
viewing, and memorability.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List, Tuple

import numpy as np

VERTICES_PER_HEMISPHERE = 10_242
TOTAL_VERTICES = VERTICES_PER_HEMISPHERE * 2


@dataclass(frozen=True)
class EngagementNetwork:
    name: str
    display_name: str
    icon: str
    weight: float
    description: str
    destrieux_labels: Tuple[str, ...]


# ── Network definitions ──────────────────────────────────────────────

REWARD = EngagementNetwork(
    name="reward",
    display_name="Reward Network",
    icon="[bold yellow]$[/]",
    weight=0.30,
    description="Dopaminergic arousal — cortical proxies for ventral striatum / NAcc",
    destrieux_labels=(
        "G_and_S_cingul-Ant",
        "G_front_inf-Orbital",
        "G_orbital",
        "G_rectus",
        "G_subcallosal",
        "S_orbital_lateral",
        "S_orbital-H_Shaped",
        "S_orbital_med-olfact",
        "S_suborbital",
        "G_and_S_transv_frontopol",
    ),
)

EMOTION = EngagementNetwork(
    name="emotion",
    display_name="Emotion Network",
    icon="[bold red]![/]",
    weight=0.25,
    description="Salience and emotional arousal — insular cortex + anterior cingulate",
    destrieux_labels=(
        "G_insular_short",
        "G_Ins_lg_and_S_cent_ins",
        "S_circular_insula_ant",
        "S_circular_insula_inf",
        "S_circular_insula_sup",
        "G_and_S_cingul-Mid-Ant",
        "G_temp_sup-Lateral",
        "G_front_inf-Opercular",
        "G_temp_sup-Plan_polar",
    ),
)

ATTENTION = EngagementNetwork(
    name="attention",
    display_name="Attention Network",
    icon="[bold cyan]>[/]",
    weight=0.25,
    description="Sustained focus — dorsal attention + frontoparietal control",
    destrieux_labels=(
        "G_parietal_sup",
        "S_intrapariet_and_P_trans",
        "G_front_sup",
        "G_precentral",
        "S_precentral-sup-part",
        "G_front_middle",
        "S_front_sup",
        "G_and_S_paracentral",
    ),
)

MEMORY = EngagementNetwork(
    name="memory",
    display_name="Memory Network",
    icon="[bold magenta]@[/]",
    weight=0.20,
    description="Encoding and retrieval — parahippocampal + default mode network",
    destrieux_labels=(
        "G_oc-temp_med-Parahip",
        "G_precuneus",
        "G_and_S_cingul-Mid-Post",
        "G_cingul-Post-dorsal",
        "G_cingul-Post-ventral",
        "G_temporal_middle",
        "Pole_temporal",
        "S_collat_transv_ant",
        "G_pariet_inf-Angular",
        "S_subparietal",
    ),
)

ALL_NETWORKS = (REWARD, EMOTION, ATTENTION, MEMORY)


# ── Vertex-to-network mapping ────────────────────────────────────────

def _decode_label(label: bytes | str) -> str:
    """Normalise a Destrieux label to a plain string."""
    if isinstance(label, bytes):
        return label.decode("utf-8", errors="replace")
    return str(label)


def load_network_vertex_masks(
    parcellation_left: np.ndarray,
    parcellation_right: np.ndarray,
    label_names: List[str | bytes],
) -> Dict[str, np.ndarray]:
    """Build a boolean mask over all 20 484 vertices for each network.

    Parameters
    ----------
    parcellation_left : (10242,) int array — Destrieux label index per vertex, left hemi.
    parcellation_right : (10242,) int array — right hemi.
    label_names : ordered list of label strings (index → name).

    Returns
    -------
    dict mapping network.name → bool array of shape (20484,).
    """
    decoded_names = [_decode_label(n) for n in label_names]
    name_to_idx = {name: idx for idx, name in enumerate(decoded_names)}

    masks: Dict[str, np.ndarray] = {}

    for network in ALL_NETWORKS:
        mask = np.zeros(TOTAL_VERTICES, dtype=bool)
        matched = 0

        for region_name in network.destrieux_labels:
            idx = name_to_idx.get(region_name)
            if idx is None:
                continue
            matched += 1
            left_hits = parcellation_left == idx
            right_hits = parcellation_right == idx
            mask[:VERTICES_PER_HEMISPHERE] |= left_hits
            mask[VERTICES_PER_HEMISPHERE:] |= right_hits

        if matched == 0:
            raise ValueError(
                f"No Destrieux labels matched for {network.name}. "
                f"Expected labels like: {network.destrieux_labels[:3]}"
            )
        masks[network.name] = mask

    return masks


def fetch_parcellation() -> Tuple[np.ndarray, np.ndarray, List[str]]:
    """Download the Destrieux surface atlas on fsaverage5 via nilearn.

    Returns (parcellation_left, parcellation_right, label_names).
    """
    import warnings

    from nilearn import datasets

    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        destrieux = datasets.fetch_atlas_surf_destrieux(verbose=0)
    labels = [_decode_label(lb) for lb in destrieux["labels"]]
    return destrieux["map_left"], destrieux["map_right"], labels


def build_masks() -> Dict[str, np.ndarray]:
    """Convenience: fetch parcellation and return network masks."""
    parc_l, parc_r, labels = fetch_parcellation()
    return load_network_vertex_masks(parc_l, parc_r, labels)
