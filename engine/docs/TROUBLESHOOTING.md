# Troubleshooting

Common issues and fixes for the Neuro-Viral Score Engine.

---

## Prerequisites

### Google Cloud CLI (`gcloud`)

Install the gcloud CLI:

```bash
curl https://sdk.cloud.google.com | bash
```

Restart your shell, then authenticate:

```bash
gcloud init
gcloud auth login
```

### GPU Quota

You need NVIDIA L4 GPU quota in `us-central1`. If not yet approved:

1. Go to [GCP Quotas](https://console.cloud.google.com/iam-admin/quotas)
2. Filter for `NVIDIA_L4_GPUS`
3. Select `us-central1` region
4. Click **Edit Quotas** and request 1
5. Wait for approval email (usually 24-48 hours for new accounts)

---

## Common Errors

### `gcloud: command not found`

Install the gcloud CLI:

```bash
curl https://sdk.cloud.google.com | bash
```

Then restart your terminal so the PATH updates take effect.

### `Quota NVIDIA_L4_GPUS exceeded`

Your L4 GPU quota hasn't been approved yet. Check your email for the quota response, or request it at **GCP Console > IAM & Admin > Quotas**.

### `CUDA out of memory`

The engine uses sequential encoder offloading by default, keeping peak VRAM at ~12 GB on the 24 GB L4. If you still hit OOM:

```bash
python -m engine.run video.mp4 --modalities audio
```

This skips the video encoder (the largest model) and runs audio-only inference.

### VM won't start

Spot instances can be preempted by GCP at any time. Run:

```bash
./setup_gcp.sh start
```

For guaranteed availability, edit `setup_gcp.sh` and change `--provisioning-model=SPOT` to `--provisioning-model=STANDARD` (costs ~3x more).

---

## Network Score Interpretation

### Reward Network (30% weight)

Cortical proxies for the dopamine system. High scores mean your content triggers the "I need to share this" response. Look for peaks in the first 3 seconds (your hook).

### Emotion Network (25% weight)

Insular cortex and anterior cingulate activity. High scores mean emotional arousal (surprise, awe, laughter, tension). Flat emotion = scroll-past.

### Attention Network (25% weight)

Dorsal attention and frontoparietal control. A *rising* trend is better than a high flat score -- it means your pacing builds and holds attention. Falling trend = you're losing viewers.

### Memory Network (20% weight)

Parahippocampal and default mode network. High scores mean your content encodes into memory. Viewers will remember and come back. Callbacks, taglines, and repeated motifs boost this.

---

## Cost Reference

| Item | Cost |
|------|------|
| L4 spot instance (g2-standard-8) | ~$0.35/hr |
| Per video inference (~30s reel) | ~$0.02 |
| Boot disk (200 GB SSD, stopped) | ~$0.17/day |

Always run `./setup_gcp.sh stop` when done. The VM costs nothing while stopped (only disk storage).
