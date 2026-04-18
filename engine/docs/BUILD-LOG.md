# TV1 — Project Journey & Issues Log

> Complete chronological record of building the Neuro-Viral Score Engine.
> Every error, every fix, every decision — from zero to rendered video.

---

## Who We Are

**Builder**: Manav Gupta (@Tensorboyalive / "Viral Manav") — Instagram content creator
**Goal**: Score Instagram Reels for viral potential using real neuroscience, not vibes

---

## Timeline

### Phase 0: Setup & Reconnaissance

**Starting state**: A local repo at `neuro-viral-engine` with Python engine code, a GCP project with L4 GPU quota, and an Instagram Reel to score.

**Chrome tabs open**:
- Instagram Reel: `https://www.instagram.com/reels/DVufop_kRcm/`
- Meta TRIBE v2 demo: `https://aidemos.atmeta.com/tribev2`
- GCP Console

**Local repo structure**:
```
engine/
  __init__.py
  tribe_scorer.py    # TRIBE v2 model wrapper
  viral_score.py     # Brain-to-score mapping
  brain_regions.py   # Destrieux atlas parcellation
  display.py         # Rich terminal UI
  run.py             # CLI entry point
setup_gcp.sh         # One-command VM lifecycle
requirements.txt
GUIDE.md
```

---

### Issue #1: gcloud CLI Not in PATH

**Error**: `exit code 127` — gcloud command not found

**Root cause**: gcloud was installed at `~/google-cloud-sdk/bin/gcloud` but not added to shell PATH.

**Fix**:
```bash
export PATH="$HOME/google-cloud-sdk/bin:$PATH"
```

**Result**: gcloud found, but no credentialed accounts — user needed to run `gcloud auth login`.

---

### Issue #2: Existing VM Had Wrong Specs

**The `tribev1` VM** (already running in GCP):

| Spec | Current | Needed |
|------|---------|--------|
| Boot disk | 10 GB | 200 GB |
| OS | Bare Debian 12 | Needs CUDA + PyTorch |
| GPU | 1x NVIDIA L4 (24 GB) | Perfect |
| RAM | 16 GB | Sufficient |
| Zone | northamerica-northeast2-b | Works |

**Key decision**: Keep the VM, don't delete it.

> "GPU quota is the bottleneck in GCP, not disk or software. Disk can be resized in 30 seconds. CUDA + PyTorch install in ~10 minutes. But getting a new L4 quota approved? That's 24-48 hours of waiting. Never throw away a working GPU allocation."

**Fix**: User resized disk to 200 GB via GCP Console (30 seconds while VM was stopped).

---

### Issue #3: SSH Browser Terminal Limitations

**Problem**: GCP's browser-based SSH (xterm.js) could not reliably accept pasted commands via Chrome automation tools.

**Impact**: Commands had to be provided as copy-paste blocks for the user to run manually.

**Workaround**: Provided step-by-step commands. This constraint shaped the entire VM setup workflow.

---

### Phase 1: VM Environment Setup

Commands provided to user for manual execution:

```bash
# Step 1: Python 3.11 venv (Debian 12 has PEP 668 blocking system pip)
python3 -m venv ~/venv && source ~/venv/bin/activate

# Step 2: PyTorch with CUDA 12.4
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu124

# Step 3: TRIBE v2 from source
pip install git+https://github.com/facebookresearch/tribev2.git

# Step 4: Dependencies
pip install nilearn rich scipy

# Step 5: Clone engine
cd ~ && git clone https://github.com/Tensorboyalive/neuro-viral-engine.git

# Step 6: Upload video via SSH browser toolbar
# Step 7: Run inference
python -m engine.run ~/April-11_R1.mp4
```

---

### Issue #4: Python 3.10 Too Old for TRIBE v2

**Error**:
```
ERROR: Package 'tribev2' requires a different Python: 3.10.12 not in '>=3.11'
```

**Root cause**: Debian 12's default Python is 3.10.12. TRIBE v2's `pyproject.toml` requires `>=3.11` (uses `tomllib`, newer typing features).

**Fix**:
```bash
sudo apt update && sudo apt install -y python3.11 python3.11-venv python3.11-dev
python3.11 -m venv ~/venv311 && source ~/venv311/bin/activate
# Reinstall everything in the new venv
```

---

### Issue #5: TRIBE v2 API Mismatch (4 Bugs)

**Context**: Our `tribe_scorer.py` was written against assumed API. Meta's actual API differed.

**Bug 1 — Wrong class name**:
```python
# WRONG
from tribev2 import TRIBEv2Model
model = TRIBEv2Model.from_pretrained(...)

# CORRECT
from tribev2 import TribeModel
model = TribeModel.from_pretrained(...)
```

**Bug 2 — Wrong `from_pretrained` parameters**:
```python
# WRONG
model = TRIBEv2Model.from_pretrained("facebook/tribev2", torch_dtype=dtype, device_map="auto")

# CORRECT
model = TribeModel.from_pretrained("facebook/tribev2", device=device, cache_folder="./cache")
```

**Bug 3 — `predict()` returns a tuple, not just predictions**:
```python
# WRONG
predictions = model.predict(events)

# CORRECT
predictions, _segments = model.predict(events)
```

**Bug 4 — `get_events_dataframe` uses keyword arg**:
```python
# WRONG
events = model.get_events_dataframe(str(video_path), modalities=...)

# CORRECT
events = model.get_events_dataframe(video_path=str(video_path))
```

**How we found these**: Read Meta's actual source code via GitHub API (`facebookresearch/tribev2/tribev2/__init__.py` and `demo_utils.py`).

---

### Issue #6: Missing `uvx` for WhisperX

**Error**: `RuntimeError: whisperx failed` (in `tribev2/eventstransforms.py` line 137)

**Root cause**: TRIBE v2's audio pipeline uses `uvx` (from the `uv` package manager) to run WhisperX for audio transcription.

**Fix**: `pip install uv`

---

### Issue #7: Missing ffmpeg

**Error**: WhisperX failed to decode audio

**Root cause**: Bare Debian 12 VM had no ffmpeg installed.

**Fix**: `sudo apt install -y ffmpeg`

---

### Issue #8: LLaMA 3.2-3B HuggingFace Gate

**Error**:
```
httpx.HTTPStatusError: Client error '401 Unauthorized'
for url 'https://huggingface.co/meta-llama/Llama-3.2-3B/resolve/main/config.json'
```

**Root cause**: TRIBE v2's brain-mapping model (`facebook/tribev2`) is open, but during `predict()` it loads LLaMA 3.2-3B's tokenizer for text processing. LLaMA is gated by Meta on HuggingFace — requires license acceptance and approval.

**User's response**: "Can we use any other model rather than Llama because it's awaiting to get approval from the author"

---

### Issue #9: LLaMA Gate Approval Pending

**Solution**: Found the ungated mirror `unsloth/Llama-3.2-3B` (exact same weights, no gate).

**How we found it**: Searched Meta's TRIBE v2 source for the config key:
```python
# In tribev2/grids/defaults.py
# Key: data.text_feature.model_name
```

**Fix** — Override the model name via config:
```python
model = TribeModel.from_pretrained(
    "facebook/tribev2",
    device=device,
    cache_folder="./cache",
    config_update={"data.text_feature.model_name": "unsloth/Llama-3.2-3B"},
)
```

**This was the breakthrough** — after this fix, TRIBE v2 inference completed successfully.

---

### Phase 2: First Successful Inference

After fixing all 9 issues, TRIBE v2 ran end-to-end on the GCP VM:

**April-11_R1.mp4 Results**:

| Network | Weight | Score | Mean Activation | Peak | Peak Time | Trend |
|---------|--------|-------|----------------|------|-----------|-------|
| Reward | 30% | 4.0/10 | -0.425 | 0.164 | t=25.0s | Rising |
| Emotion | 25% | 5.5/10 | 0.308 | 0.907 | t=25.0s | Rising |
| Attention | 25% | 4.9/10 | 0.034 | 0.653 | t=25.0s | Rising |
| Memory | 20% | 4.2/10 | -0.501 | 0.647 | t=25.0s | Rising |

**Final Score: 4.6/10 — BELOW AVERAGE**

---

### Phase 3: Multi-Video Processing

Three videos on the VM:
```
/home/manav_tensorboy/April-11_R1.mp4
/home/manav_tensorboy/v2.mp4
/home/manav_tensorboy/Download Instagram Reels.mp4
```

### Issue #10: Video Path Not Found

**Error**: `FileNotFoundError: Video not found: April-11_R1.mp4`

**Root cause**: Videos were in `~/` but the script was running from `~/neuro-viral-engine/`. Relative path resolution failed.

**Fix**: Used `find ~ -name "*.mp4"` to get full absolute paths.

---

**All 3 videos scored**:

| Video | Score | Verdict |
|-------|-------|---------|
| April-11_R1.mp4 | 4.6/10 | BELOW AVERAGE |
| v2.mp4 | 4.9/10 | BELOW AVERAGE |
| Download Instagram Reels.mp4 | 4.9/10 | BELOW AVERAGE |

---

### Phase 4: Brain Visualization

User asked: "Could you just tell me is there any way to run those animations as well, as shown in the Meta website?"

**Research findings**:
- TRIBE v2 has a `tribev2/plotting/` module with `PlotBrainNilearn` and `PlotBrainPyvista`
- `PlotBrainPyvista` needs GPU display server (not available headless)
- `PlotBrainNilearn` uses matplotlib — works headless on the VM

**Created** `engine/render_brains.py` — renders 4-view brain frames, network panels, and rotating GIFs.

### Issue #11: nilearn API Version Mismatch

**Error**: `KeyError: 'pial_left'`

**Root cause**: Two different nilearn APIs exist:
- `load_fsaverage()` (newer) — returns keys like `pial`, `inflated` (each contains both hemispheres)
- `fetch_surf_fsaverage()` (older) — returns flat keys: `pial_left`, `pial_right`, `sulc_left`, `sulc_right`

The VM had the older API. Our code assumed the newer one.

**Diagnosis**:
```python
from nilearn.datasets import load_fsaverage
fs = load_fsaverage('fsaverage5')
print(list(fs.keys()))
# ['description', 'pial', 'white_matter', 'inflated', 'sphere', 'flat']
```

**Fix**: Switched to `fetch_surf_fsaverage("fsaverage5")` which returns the flat per-hemisphere keys we needed.

---

### Issue #12: Browser SSH Corrupts Large Pastes

**Problem**: Pasting the render script via heredoc (`cat << 'PYEOF'`) in browser SSH produced mangled Python with garbled characters mid-stream.

**Multiple failed attempts**:
1. Standard heredoc — corrupted
2. Smaller heredoc chunks — still corrupted
3. `python3 -c "..."` with triple quotes — shell quote nesting broke it

**Final solution**: Base64 encoding:
```bash
# Local machine:
base64 -i render_brains.py | tr -d '\n'

# VM:
echo 'BASE64STRING...' | base64 -d > ~/neuro-viral-engine/engine/render_brains.py
```

**This became our standard method** for transferring any script to the VM.

---

### Issue #13: `zip` Command Not Found

**Error**: `Command 'zip' not found, but can be installed with: apt install zip`

**Root cause**: Debian minimal doesn't include zip.

**Fix**: `sudo apt install -y zip`

---

### Issue #14: SyntaxError in Render Script

**Error**: `SyntaxError: unterminated string literal (detected at line 76)`

**Root cause**: Earlier heredoc paste attempt had corrupted the script file. Nested f-strings with quotes got mangled.

**Fix**: Re-delivered via base64 encoding (the reliable method from Issue #12).

---

### Phase 5: Brain Renders Complete

Successfully generated for all 3 videos:

**Per video output**:
- `{name}_frames/brain_tNNN.png` — Per-second brain surface renders (4 views: left, right, dorsal, ventral)
- `{name}_networks.png` — 4-panel network activation map
- `{name}_rotating_reward.gif` — 72-frame rotating brain at peak reward activation
- `{name}_rotating_max.gif` — 72-frame rotating brain at peak overall activation
- `{name}_score.txt` — Score breakdown text file
- `{name}_activations.npz` — Raw numpy activation data

April-11_R1 had 13 frames (brain_t000.png through brain_t024.png, sampled every 2 seconds).

Downloaded everything as `brain_renders.zip` to local machine.

---

### Phase 6: Remotion Video Creation

User asked: "I want you to use remotion or anything to create a video out of it."

### Issue #15: Remotion CLI Interactive Prompt

**Problem**: `npx create-video@latest` uses an interactive template selector. Could not be bypassed with `--template blank`, `--no-interactive`, piped stdin, or `printf`.

**Fix**: Manually scaffolded the project:
```bash
mkdir -p brain-video/src brain-video/public
cd brain-video && npm init -y
npm install remotion @remotion/cli @remotion/google-fonts react react-dom
npm install typescript @types/react @types/react-dom
```

---

### Issue #16: Remotion Chrome Download ENOENT

**Problem**: Space in path "trive 2" caused Chrome headless shell download to fail during render.

**Fix**: Pre-created the `.remotion` cache directory:
```bash
mkdir -p node_modules/.remotion/chrome-headless-shell
```

---

**Built 5-scene Remotion composition** (1080x1920, 30fps, 20 seconds):
1. Intro — scan line + "NEURO-VIRAL SCORE ENGINE"
2. Brain Scan — 13 frames cycling at 0.5s each
3. Networks — 4-panel activation map with animated bars
4. Score Reveal — ring animation counting to 4.6/10
5. Rotating Brain — peak reward GIF

**First render**: `out/brain-scan.mp4` — 600 frames, 2.8 MB

---

### Phase 7: Sound Design

User: "This is perfect but would you want to add a sound in this as well?"

**Generated 7 programmatic sci-fi sound effects** using Python/numpy (no external downloads):

| File | Duration | Description |
|------|----------|-------------|
| sfx_ambient.wav | 22.0s | Deep drone (55Hz + harmonics + LFO + filtered noise) |
| sfx_boot.wav | 2.5s | Frequency sweep (200-1200Hz) + digital clicks |
| sfx_beep.wav | 0.15s | 1800Hz burst + 4000Hz click (plays 13x) |
| sfx_whoosh.wav | 1.2s | Filtered noise with frequency sweep |
| sfx_rise.wav | 2.0s | Rising tone (300-900Hz) + building harmonics |
| sfx_reveal.wav | 1.5s | Low thud (80Hz) + bright shimmer (2200-4400Hz) |
| sfx_chime.wav | 2.0s | Major triad (C5-E5-G5) with staggered attack |

**Final render**: `out/brain-scan-final.mp4` — 600 frames, 2.7 MB, full audio

---

## Issues Summary

| # | Issue | Root Cause | Fix | Time Impact |
|---|-------|-----------|-----|-------------|
| 1 | gcloud not in PATH | Install location not in shell PATH | `export PATH` | 2 min |
| 2 | VM 10GB disk | Default GCP disk too small | Resize to 200GB via Console | 1 min |
| 3 | SSH terminal automation | xterm.js doesn't accept programmatic input | Manual copy-paste workflow | Ongoing |
| 4 | Python 3.10 too old | Debian 12 default Python | Install Python 3.11, new venv | 5 min |
| 5 | TRIBE v2 API 4 bugs | Wrong class name, params, return type, kwargs | Read Meta source, fix all 4 | 15 min |
| 6 | Missing `uvx` | WhisperX dependency | `pip install uv` | 1 min |
| 7 | Missing ffmpeg | Bare Debian has no ffmpeg | `sudo apt install ffmpeg` | 1 min |
| 8 | LLaMA 401 Unauthorized | HuggingFace gate on meta-llama | Login + accept license | 2 min |
| 9 | LLaMA gate pending | Meta approval takes days | Use `unsloth/Llama-3.2-3B` mirror | 10 min |
| 10 | Video path not found | Relative vs absolute paths | Use `find` for full paths | 2 min |
| 11 | nilearn API mismatch | `load_fsaverage` vs `fetch_surf_fsaverage` | Switch to older flat-key API | 10 min |
| 12 | SSH paste corruption | Browser xterm.js mangles large pastes | Base64 encode scripts | 15 min |
| 13 | zip not found | Debian minimal | `apt install zip` | 1 min |
| 14 | SyntaxError render script | Corrupted heredoc paste | Re-deliver via base64 | 5 min |
| 15 | Remotion CLI interactive | create-video needs interactive input | Manual project scaffolding | 10 min |
| 16 | Remotion Chrome ENOENT | Space in directory path | Pre-create cache directory | 2 min |

**Total issues solved: 16**

---

## Key Technical Decisions

| Decision | Why |
|----------|-----|
| Keep existing VM (don't recreate) | GPU quota takes 24-48hrs to approve. Disk resize takes 30s. |
| Python 3.11 venv (not system pip) | Debian 12's PEP 668 blocks system-wide pip installs |
| `unsloth/Llama-3.2-3B` mirror | Same weights as meta-llama, no HuggingFace gate |
| `fetch_surf_fsaverage` not `load_fsaverage` | VM's nilearn version only had the old flat-key API |
| Base64 for script delivery | Browser SSH corrupts heredoc pastes with nested quotes |
| Remotion (not FFmpeg) | Programmatic React framework = full control over motion, text, branding |
| Procedural SFX (not downloaded audio) | Zero external deps, precise control, custom aesthetic |
| Sequential encoder offloading | Keeps peak VRAM at ~12GB on 24GB L4 card |
