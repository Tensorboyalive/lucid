<p align="center">
<pre>
 _   _ _____ _   _ ____   ___       __     _____ ____      _    _
| \ | | ____| | | |  _ \ / _ \      \ \   / /_ _|  _ \    / \  | |
|  \| |  _| | | | | |_) | | | |_____\ \ / / | || |_) |  / _ \ | |
| |\  | |___| |_| |  _ <| |_| |_____|\ V /  | ||  _ <  / ___ \| |___
|_| \_|_____|\___/|_| \_\\___/        \_/  |___|_| \_\/_/   \_\_____|
</pre>
</p>

<h3 align="center">Score your video's viral potential using neuroscience — not vibes.</h3>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/python-3.11+-blue.svg" alt="Python 3.11+"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-green.svg" alt="MIT License"></a>
  <a href="https://github.com/facebookresearch/tribev2"><img src="https://img.shields.io/badge/Powered%20by-Meta%20TRIBE%20v2-1877F2" alt="Meta TRIBE v2"></a>
  <a href="https://www.remotion.dev"><img src="https://img.shields.io/badge/Video-Remotion%20v4-0B84F3" alt="Remotion"></a>
</p>

<p align="center">
  <b>If this project helped you or you find it interesting, please consider giving it a star!</b><br>
  It helps others discover it and keeps me motivated to improve it.
</p>

---

## What This Does

Feed it a video. It runs Meta's **TRIBE v2** — a foundation model trained on **1,000+ hours of real fMRI brain scans across 720 subjects** — and predicts how **20,484 cortical vertices** respond every second. Then it maps those activations to four engagement networks (Reward, Emotion, Attention, Memory) and outputs a **0-10 neuro-viral score** with brain visualizations and an Instagram-ready video.

---

## Quick Start

### A) Demo Mode — No GPU Required

Try it instantly on any machine (generates synthetic brain data):

```bash
git clone https://github.com/Tensorboyalive/neuro-viral-engine.git
cd neuro-viral-engine
pip install rich scipy nilearn numpy
python -m engine.run my_video.mp4 --demo
```

### B) Full Inference — GCP L4 GPU

Run real TRIBE v2 inference on a cloud GPU (~$0.35/hr spot):

```bash
# 1. Create the VM (one-time)
chmod +x setup_gcp.sh
./setup_gcp.sh

# 2. Upload and score a video
./setup_gcp.sh run my_reel.mp4

# 3. Stop VM when done (saves credits)
./setup_gcp.sh stop
```

### C) Render Brain Scan Video — Remotion

Turn brain activation data into an Instagram-ready vertical video:

```bash
cd brain-video
npm install
npm run studio              # Preview in browser at localhost:3000
npm run render              # Render to out/brain-scan.mp4
```

Output: **1080x1920 MP4** (9:16 portrait) with 5 animated scenes and 7-layer sci-fi audio.

---

## How Scoring Works

### The Four Brain Networks

| Network | Weight | Brain Regions | What It Measures |
|---------|--------|---------------|-----------------|
| **Reward** | 30% | Orbitofrontal cortex (10 regions) | "I want to share this" — dopaminergic arousal |
| **Emotion** | 25% | Insula + cingulate (9 regions) | "This makes me FEEL" — emotional salience |
| **Attention** | 25% | Parietal + frontal (8 regions) | "I can't look away" — sustained focus |
| **Memory** | 20% | Parahippocampal + DMN (10 regions) | "I'll remember this" — encoding strength |

### Per-Network Formula

```
Network Score = 60% x Base Intensity (mean z-normalized activation)
             + 25% x Peak Bonus (moments > 1.5 sigma above mean)
             + 15% x Temporal Dynamics (rising = bonus, falling = penalty)
```

### Score Verdicts

| Score | Verdict | Meaning |
|-------|---------|---------|
| 8.5 - 10.0 | EXPLOSIVE VIRAL POTENTIAL | Brain lights up across all networks |
| 7.0 - 8.4 | HIGH VIRAL POTENTIAL | Strong engagement, likely shared |
| 5.5 - 6.9 | MODERATE POTENTIAL | Decent but not remarkable |
| 4.0 - 5.4 | BELOW AVERAGE | Weak activation, room to improve |
| 0.0 - 3.9 | LOW ENGAGEMENT | Minimal brain response |

---

## CLI Reference

### Engine

```bash
python -m engine.run <video> [options]
```

| Flag | Default | Description |
|------|---------|-------------|
| `--demo` | off | Use synthetic brain data (no GPU needed) |
| `--device` | `cuda` | `cuda` or `cpu` |
| `--dtype` | `float16` | `float16`, `bfloat16`, or `float32` |
| `--modalities` | `video audio` | Which TRIBE v2 encoders to use |

### GCP VM Lifecycle

```bash
./setup_gcp.sh              # Create VM + install everything
./setup_gcp.sh start        # Resume a stopped VM
./setup_gcp.sh stop         # Pause VM (saves credits)
./setup_gcp.sh ssh          # SSH into the VM
./setup_gcp.sh run video.mp4  # Upload video + run scoring
./setup_gcp.sh delete       # Permanently delete VM
```

### Brain Video (Remotion)

```bash
cd brain-video
npm run studio              # Live preview at localhost:3000
npm run render              # Render BrainScanVideo to MP4
```

---

## Project Structure

```
neuro-viral-engine/
├── engine/                    # Python scoring pipeline
│   ├── tribe_scorer.py        # TRIBE v2 model wrapper + inference
│   ├── viral_score.py         # Activations -> 0-10 score
│   ├── brain_regions.py       # Destrieux atlas -> 4 network masks
│   ├── display.py             # Rich terminal UI
│   ├── run.py                 # CLI entry point
│   ├── render_brains.py       # Batch brain frame/GIF rendering
│   └── visualize_brain.py     # Comprehensive visualization CLI
│
├── brain-video/               # Remotion video pipeline
│   ├── src/
│   │   ├── BrainScanVideo.tsx # Main 5-scene composition
│   │   ├── SoundDesign.tsx    # 7-layer audio design
│   │   ├── scenes/            # Intro, BrainScan, Networks,
│   │   │                      # ScoreReveal, RotatingBrain
│   │   ├── data.ts            # Video data types + constants
│   │   └── styles.ts          # Design tokens
│   ├── generate_sfx.py        # Procedural sci-fi sound synthesis
│   └── package.json           # Remotion v4, React 19
│
├── docs/
│   ├── BUILD-LOG.md           # Build log (16 issues solved)
│   ├── ARCHITECTURE.md        # Full system design
│   └── TROUBLESHOOTING.md     # Setup + common error fixes
│
├── setup_gcp.sh               # One-command GCP VM lifecycle
├── requirements.txt           # Python dependencies
├── CONTRIBUTING.md            # How to contribute
└── LICENSE                    # MIT
```

---

## Architecture

```
                         YOUR VIDEO (.mp4)
                               |
                               v
                +---------------------------------+
                |       META TRIBE v2 (GPU)       |
                |                                 |
                |  +--------+ +--------+ +------+ |
                |  |V-JEPA2 | |Wav2Vec | |LLaMA | |
                |  |(video) | |BERT 2.0| |3.2-3B| |
                |  +---+----+ +---+----+ +--+---+ |
                |      |         |          |     |
                |  +---v---------v----------v---+ |
                |  |  8-Layer Transformer Head   | |
                |  |  fMRI Cortical Prediction   | |
                |  +-------------+---------------+ |
                +---------------------------------+
                               |
                    (T x 20,484) activations
                               |
              +----------------+----------------+
              |                |                |
              v                v                v
     +--------+------+ +------+-------+ +------+--------+
     | SCORING ENGINE | | BRAIN RENDER | | VIDEO RENDER  |
     |                | |              | | (Remotion)    |
     | brain_regions  | | nilearn      | |               |
     | viral_score    | | matplotlib   | | 5 scenes      |
     | display (Rich) | | fsaverage5   | | 7 audio layers|
     +--------+-------+ +------+------+ +------+--------+
              |                |                |
              v                v                v
        0-10 Score       PNGs + GIFs      1080x1920 MP4
        + Insights       Brain Maps       Brain Scan Video
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Brain Model | [Meta TRIBE v2](https://github.com/facebookresearch/tribev2) — fMRI prediction from video |
| Video Encoder | [V-JEPA2](https://github.com/facebookresearch/vjepa2) — self-supervised video model |
| Audio Encoder | [Wav2Vec-BERT 2.0](https://huggingface.co/facebook/w2v-bert-2.0) — 600M speech encoder |
| Text Encoder | [LLaMA 3.2-3B](https://huggingface.co/unsloth/Llama-3.2-3B) — language model (ungated mirror) |
| Brain Atlas | [Destrieux Atlas](https://nilearn.github.io/stable/modules/generated/nilearn.datasets.fetch_atlas_destrieux_2009.html) on [fsaverage5](https://surfer.nmr.mgh.harvard.edu/fswiki/FsAverage) (20,484 vertices) |
| Visualization | [nilearn](https://nilearn.github.io/stable/) + matplotlib |
| Terminal UI | [Rich](https://github.com/Textualize/rich) |
| Video Render | [Remotion v4](https://www.remotion.dev) + React 19 |
| GPU Cloud | GCP g2-standard-8 + [NVIDIA L4](https://www.nvidia.com/en-us/data-center/l4/) (24 GB VRAM) |

---

## Documentation

| Doc | What's Inside |
|-----|--------------|
| **[Build Log](docs/BUILD-LOG.md)** | Every issue solved (16 total), chronological build log, all error messages and fixes |
| **[Architecture](docs/ARCHITECTURE.md)** | Full system design, data flow diagrams, neuroscience explanation, file-by-file breakdown |
| **[Troubleshooting](docs/TROUBLESHOOTING.md)** | Prerequisites, common errors, cost reference |

---

## References

- **TRIBE v2 Paper**: [A foundation model of vision, audition, and language for in-silico neuroscience](https://ai.meta.com/research/publications/a-foundation-model-of-vision-audition-and-language-for-in-silico-neuroscience/) (d'Ascoli et al., 2026)
- **TRIBE v2 Code**: [github.com/facebookresearch/tribev2](https://github.com/facebookresearch/tribev2)
- **TRIBE v2 Demo**: [aidemos.atmeta.com/tribev2](https://aidemos.atmeta.com/tribev2)
- **V-JEPA2 Paper**: [arxiv.org/abs/2506.09985](https://arxiv.org/abs/2506.09985)

---

## License

MIT — see [LICENSE](LICENSE)

---

<p align="center">
  Built by <a href="https://instagram.com/tensor._.boy">Manav Gupta</a>
</p>

<p align="center">
  <a href="https://instagram.com/tensor._.boy">Instagram @tensor._.boy</a> &nbsp;·&nbsp;
  <a href="https://x.com/tensor___boy">Twitter @tensor___boy</a> &nbsp;·&nbsp;
  <b>Newsletter:</b> Tensor Protocol
</p>
