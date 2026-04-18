# TV2 — Architecture Deep-Dive

> System design, data flow, component breakdown, and the neuroscience behind the Neuro-Viral Score Engine.

---

## System Overview

```
                    ┌──────────────────────────────────┐
                    │         INPUT: Video (MP4)        │
                    │    Instagram Reel / TikTok / etc  │
                    └──────────────┬───────────────────┘
                                   │
                    ┌──────────────▼───────────────────┐
                    │    META TRIBE v2 (GCP L4 GPU)    │
                    │                                   │
                    │  ┌─────────┐ ┌──────────┐ ┌────┐│
                    │  │ V-JEPA2 │ │Wav2Vec   │ │LLa-││
                    │  │ (video) │ │BERT 2.0  │ │Ma  ││
                    │  │         │ │(audio)   │ │3.2B││
                    │  └────┬────┘ └────┬─────┘ └──┬─┘│
                    │       │           │          │   │
                    │  ┌────▼───────────▼──────────▼─┐│
                    │  │   8-Layer Transformer Head   ││
                    │  │   → fMRI Cortical Prediction ││
                    │  └──────────────┬──────────────┘│
                    └──────────────┬──┘                │
                                   │                    
                    ┌──────────────▼───────────────────┐
                    │   RAW ACTIVATIONS                 │
                    │   Shape: (T × 20,484) float32     │
                    │   T = video duration in seconds    │
                    │   20,484 = cortical vertices       │
                    │   (fsaverage5: 10,242 per hemi)    │
                    └──────────────┬───────────────────┘
                                   │
            ┌──────────────────────┼──────────────────────┐
            │                      │                      │
    ┌───────▼───────┐   ┌─────────▼────────┐   ┌────────▼────────┐
    │ SCORING       │   │ VISUALIZATION    │   │ VIDEO RENDER    │
    │ ENGINE        │   │ ENGINE           │   │ (REMOTION)      │
    │               │   │                  │   │                 │
    │ brain_regions │   │ render_brains.py │   │ 5 scenes +      │
    │ viral_score   │   │ visualize_brain  │   │ 7 audio layers  │
    │ display       │   │ nilearn surfaces │   │ 1080×1920 MP4   │
    └───────┬───────┘   └────────┬─────────┘   └────────┬────────┘
            │                    │                       │
    ┌───────▼───────┐   ┌───────▼──────────┐   ┌───────▼─────────┐
    │ Score: 4.6/10 │   │ PNGs, GIFs,      │   │ brain-scan-     │
    │ Verdict:      │   │ network panels   │   │ final.mp4       │
    │ BELOW AVERAGE │   │ rotating brains  │   │ (20s, 30fps)    │
    └───────────────┘   └──────────────────┘   └─────────────────┘
```

---

## Layer 1: TRIBE v2 Inference

### What Is TRIBE v2?

**TRIBE v2** (TRansformer for In-silico Brain Experiments) is Meta's foundation model that predicts how the human brain responds to video. It was trained on **1,000+ hours of fMRI data across 720 subjects** watching naturalistic video stimuli.

It is NOT a sentiment analyzer or engagement predictor. It predicts actual **cortical blood-oxygen-level-dependent (BOLD) signals** — the same thing a real fMRI scanner measures.

### Three Foundation Models

TRIBE v2 combines three pretrained encoders:

| Encoder | Modality | Model | Parameters | What It Captures |
|---------|----------|-------|-----------|------------------|
| V-JEPA2 | Video (frames) | Self-supervised video model | ~300M | Visual features, motion, scene structure |
| Wav2Vec-BERT 2.0 | Audio (waveform) | Conformer speech encoder | 600M | Speech, music, ambient sound |
| LLaMA 3.2-3B | Text (captions) | Autoregressive language model | 3B | Semantic content, narrative context |

### Inference Pipeline

```
Video → MoviePy (extract audio track)
      → WhisperX via uvx (transcribe audio → text captions)
      → V-JEPA2 (encode video frames)
      → Wav2Vec-BERT 2.0 (encode audio)
      → LLaMA 3.2-3B (encode text captions)
      → 8-layer Transformer head (fuse modalities → predict fMRI)
      → Output: (T, 20484) activation matrix
```

**Key code** (`engine/tribe_scorer.py`):
```python
from tribev2 import TribeModel

model = TribeModel.from_pretrained(
    "facebook/tribev2",
    device=device,
    cache_folder="./cache",
    config_update={"data.text_feature.model_name": "unsloth/Llama-3.2-3B"},
)

events = model.get_events_dataframe(video_path=str(video_path))
predictions, _segments = model.predict(events)
# predictions.shape = (n_timepoints, 20484)
```

### Hardware Requirements

| Resource | Minimum | Our Setup |
|----------|---------|-----------|
| GPU VRAM | 12 GB (with sequential offload) | 24 GB (NVIDIA L4) |
| RAM | 16 GB | 16 GB |
| Disk | 50 GB (model cache) | 200 GB |
| Python | 3.11+ | 3.11 |
| CUDA | 12.x | 12.4 |

---

## Layer 2: Brain Region Mapping

### The fsaverage5 Mesh

The output of TRIBE v2 is a matrix of activations on the **fsaverage5** cortical surface:
- **10,242 vertices per hemisphere** (left + right)
- **20,484 total vertices**
- Standard FreeSurfer template brain used across neuroimaging research
- Every vertex represents a small patch of cortex (~3mm resolution)

### The Destrieux Atlas

We use the **Destrieux atlas** (`aparc.a2009s`) to group these 20,484 vertices into meaningful brain regions:
- **75 parcels per hemisphere** (150 total)
- Named by anatomical gyri and sulci
- We map 37 of these parcels to 4 engagement networks

### Four Engagement Networks

Each network is a cortical proxy for subcortical circuits involved in viral content processing:

```
┌─────────────────────────────────────────────────────┐
│                                                      │
│  REWARD NETWORK (weight: 30%)                       │
│  ├─ 10 orbitofrontal cortex regions                 │
│  ├─ Proxy for: dopaminergic arousal, sharing impulse│
│  └─ Maps to: "I want to share this"                 │
│                                                      │
│  EMOTION NETWORK (weight: 25%)                      │
│  ├─ 9 insular + cingulate cortex regions            │
│  ├─ Proxy for: salience, emotional arousal          │
│  └─ Maps to: "This makes me FEEL something"         │
│                                                      │
│  ATTENTION NETWORK (weight: 25%)                    │
│  ├─ 8 parietal + frontal regions                    │
│  ├─ Proxy for: sustained focus, cognitive control   │
│  └─ Maps to: "I can't look away"                    │
│                                                      │
│  MEMORY NETWORK (weight: 20%)                       │
│  ├─ 10 parahippocampal + DMN regions                │
│  ├─ Proxy for: encoding, retrieval, narrative       │
│  └─ Maps to: "I'll remember this tomorrow"          │
│                                                      │
└─────────────────────────────────────────────────────┘
```

**Key code** (`engine/brain_regions.py`):
```python
VERTICES_PER_HEMISPHERE = 10_242
TOTAL_VERTICES = 20_484  # 10,242 * 2

REWARD = EngagementNetwork(
    name="reward",
    weight=0.30,
    destrieux_labels=(
        "G_orbital", "G_rectus", "S_orbital_med-olfact",
        "S_orbital-H_Shaped", "S_orbital_lateral",
        "G_front_inf-Orbital", "G_subcallosal",
        "S_suborbital", "G_front_middle", "S_front_middle",
    ),
)
# ... EMOTION, ATTENTION, MEMORY defined similarly
```

---

## Layer 3: Viral Scoring

### Per-Network Scoring Formula

For each of the 4 networks, we compute a composite score:

```
Network Score = 60% × Base Intensity
             + 25% × Peak Bonus
             + 15% × Temporal Dynamics
```

**Base Intensity** (60%):
- Z-normalize activations across the network's vertex mask
- Map mean z-score to 0-10 scale via sigmoid-like curve

**Peak Bonus** (25%):
- Detect peaks exceeding 1.5 standard deviations above mean
- More peaks + higher peaks = higher bonus
- Identifies "hook moments" — timestamps where brain lights up

**Temporal Dynamics** (15%):
- Compute linear slope of activation over time
- Rising activation = positive bonus (content builds engagement)
- Falling activation = penalty (audience is checking out)

### Composite Score

```
Final Score = 0.30 × Reward + 0.25 × Emotion + 0.25 × Attention + 0.20 × Memory
```

### Verdict Thresholds

| Score Range | Verdict | What It Means |
|-------------|---------|---------------|
| 8.5 - 10.0 | EXPLOSIVE VIRAL POTENTIAL | Brain lights up across all networks |
| 7.0 - 8.4 | HIGH VIRAL POTENTIAL | Strong engagement, likely to be shared |
| 5.5 - 6.9 | MODERATE POTENTIAL | Decent but not remarkable |
| 4.0 - 5.4 | BELOW AVERAGE | Weak activation, room for improvement |
| 0.0 - 3.9 | LOW ENGAGEMENT PREDICTED | Minimal brain response |

**Key code** (`engine/viral_score.py`):
```python
def compute_viral_score(result: InferenceResult) -> ViralScoreResult:
    masks = build_masks()
    global_mean = activations.mean()
    global_std = activations.std()
    
    network_scores = {}
    for network in ALL_NETWORKS:
        mask = masks[network.name]
        network_scores[network.name] = score_network(
            network, activations, mask, timepoints_sec, global_mean, global_std
        )
    
    final = sum(ns.score * ns.weight for ns in network_scores.values())
    verdict, color = _get_verdict(final)
```

---

## Layer 4: Brain Visualization

### Render Pipeline

```
Raw activations (T, 20484)
    │
    ├─ render_frame(t) ──────→ 4-view PNG (left, right, dorsal, ventral)
    │                           Using nilearn's plot_surf_stat_map
    │                           Colormap: cold_hot (blue negative, red positive)
    │
    ├─ network_panels(t) ───→ 4-panel PNG (one per network, masked vertices)
    │                           Each network shown with distinct colormap
    │
    └─ make_gif(t_peak) ───→ 72-frame rotating GIF (360° rotation, 18fps)
                               Rendered at peak reward timepoint
```

**Surface rendering**: nilearn's `plot_surf_stat_map` projects vertex activations onto the fsaverage5 pial surface mesh, creating publication-quality brain maps.

---

## Layer 5: Video Generation (Remotion)

### Why Remotion?

| Feature | FFmpeg | MoviePy | Remotion |
|---------|--------|---------|----------|
| Text overlays | Limited | Basic | Full React JSX |
| Animation control | None | Keyframes | Per-frame interpolation |
| Typography | System fonts | PIL | Google Fonts, any CSS |
| SVG graphics | No | No | Full SVG support |
| Reusable components | No | No | React component system |
| Data-driven | No | No | Props-based rendering |
| Sound design | Concat only | Basic | Multi-layer with volume curves |

### Composition Specs

```
Resolution:  1080 × 1920 (9:16 portrait, Instagram Reels)
Frame rate:  30 fps
Duration:    20 seconds (600 frames)
Codec:       H.264
Output size: ~2.7 MB
```

### Scene Timeline

```
0.0s ──────── 2.5s ──────── 9.0s ──────── 12.5s ──────── 16.0s ──────── 20.0s
│    INTRO    │  BRAIN SCAN  │   NETWORKS   │ SCORE REVEAL │  ROTATING   │
│   (75 fr)   │  (195 fr)    │   (105 fr)   │   (105 fr)   │  (120 fr)  │
│             │              │              │              │             │
│ Scan line   │ 13 frames    │ 4-panel      │ Ring fills   │ Peak reward │
│ Title fade  │ cycling @    │ activation   │ Score counts │ 360° GIF    │
│ Grid overlay│ 0.5s each    │ Animated     │ 0 → 4.6     │ Chime       │
│ Boot SFX    │ Beep per     │ score bars   │ Verdict      │             │
│             │ frame change │ Whoosh SFX   │ Rise + Hit   │             │
└─────────────┴──────────────┴──────────────┴──────────────┴─────────────┘
```

### Audio Architecture

7 audio layers mixed in real-time:

```
Layer 1: ████████████████████████████████████████ Ambient drone (0-22s, vol 0.25)
Layer 2: ████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ Boot-up (0-2.5s, vol 0.7)
Layer 3: ░░░░░█░█░█░█░█░█░█░█░█░█░█░█░█░░░░░░░░ Scan beeps (13x during scan)
Layer 4: ░░░░░░░░░░░░░░░░░░░██░░░░░░░░░░░░░░░░░ Whoosh (networks entrance)
Layer 5: ░░░░░░░░░░░░░░░░░░░░░░░░██████░░░░░░░░ Rising tone (score count)
Layer 6: ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░██░░░░░░░ Reveal hit (score lands)
Layer 7: ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░████ Chime (outro)
```

---

## File Map

### Engine (Python — runs on GCP VM)

```
engine/
├── tribe_scorer.py     # 181 lines — TribeModel wrapper, inference
├── viral_score.py      # 218 lines — activations → 0-10 score
├── brain_regions.py    # 187 lines — Destrieux atlas → 4 network masks
├── display.py          # 212 lines — Rich terminal UI for screen recording
├── run.py              # 140 lines — CLI entry point (--demo, --dtype)
├── render_brains.py    # 132 lines — batch brain frame/GIF rendering
└── visualize_brain.py  # 434 lines — comprehensive visualization CLI
```

### Video (TypeScript/React — runs locally)

```
brain-video/
├── src/
│   ├── data.ts              # 40 lines — VideoData types + APRIL_11 constants
│   ├── styles.ts            # 44 lines — Design tokens, scoreColor()
│   ├── Root.tsx             # 32 lines — Remotion Composition config
│   ├── BrainScanVideo.tsx   # 68 lines — Main scene orchestrator
│   ├── SoundDesign.tsx      # 111 lines — 7-layer audio design
│   ├── index.ts             # 4 lines — registerRoot entry
│   └── scenes/
│       ├── Intro.tsx        # 147 lines — Title sequence + scan line
│       ├── BrainScan.tsx    # 248 lines — Frame-by-frame brain display
│       ├── Networks.tsx     # 214 lines — Network breakdown cards
│       ├── ScoreReveal.tsx  # 285 lines — Animated ring + score count
│       └── RotatingBrain.tsx# 122 lines — Rotating brain GIF outro
├── public/                  # Static assets (brain PNGs, GIFs, WAVs)
├── generate_sfx.py          # 219 lines — Procedural sound synthesis
├── package.json
└── tsconfig.json
```

### Config & Setup

```
requirements.txt    # Python dependencies
setup_gcp.sh       # VM lifecycle management (create/start/stop/ssh/run/delete)
GUIDE.md            # User-facing documentation
```

---

## Data Flow Detail

### Step 1: Video → Events

```python
events = model.get_events_dataframe(video_path=str(video_path))
# events is a DataFrame with columns for each modality:
#   - video: frame features from V-JEPA2
#   - audio: speech/sound features from Wav2Vec-BERT 2.0
#   - text: caption embeddings from LLaMA 3.2-3B
```

### Step 2: Events → Predictions

```python
predictions, _segments = model.predict(events)
# predictions: numpy array shape (T, 20484)
# T = number of TR windows (1 per second of video)
# 20484 = cortical vertices (fsaverage5)
```

### Step 3: Predictions → Network Scores

```python
masks = build_masks()
# masks["reward"]:    bool[20484] — 10 orbitofrontal regions
# masks["emotion"]:   bool[20484] — 9 insular/cingulate regions
# masks["attention"]: bool[20484] — 8 parietal/frontal regions
# masks["memory"]:    bool[20484] — 10 parahippocampal/DMN regions

for network in ALL_NETWORKS:
    masked = activations[:, masks[network.name]]
    # masked: (T, ~2000-3000) — only vertices in this network
    score = score_network(network, activations, masks[network.name], ...)
```

### Step 4: Network Scores → Final Score

```
Reward:    4.0/10 × 0.30 = 1.20
Emotion:   5.5/10 × 0.25 = 1.38
Attention: 4.9/10 × 0.25 = 1.23
Memory:    4.2/10 × 0.20 = 0.84
                           ─────
Final:                      4.64 → rounded to 4.6/10
Verdict:                    BELOW AVERAGE
```

---

## Core Links & Repos

| Resource | URL |
|----------|-----|
| Our engine repo | https://github.com/Tensorboyalive/neuro-viral-engine |
| Meta TRIBE v2 code | https://github.com/facebookresearch/tribev2 |
| TRIBE v2 weights | https://huggingface.co/facebook/tribev2 |
| TRIBE v2 paper | https://ai.meta.com/research/publications/a-foundation-model-of-vision-audition-and-language-for-in-silico-neuroscience/ |
| TRIBE v2 demo | https://aidemos.atmeta.com/tribev2 |
| V-JEPA2 repo | https://github.com/facebookresearch/vjepa2 |
| V-JEPA2 paper | https://arxiv.org/abs/2506.09985 |
| Wav2Vec-BERT 2.0 | https://huggingface.co/facebook/w2v-bert-2.0 |
| LLaMA 3.2-3B (ungated) | https://huggingface.co/unsloth/Llama-3.2-3B |
| nilearn docs | https://nilearn.github.io/stable/ |
| fsaverage5 wiki | https://surfer.nmr.mgh.harvard.edu/fswiki/FsAverage |
| Destrieux atlas | https://nilearn.github.io/stable/modules/generated/nilearn.datasets.fetch_atlas_destrieux_2009.html |
| Remotion | https://www.remotion.dev |
| NVIDIA L4 specs | https://www.nvidia.com/en-us/data-center/l4/ |
