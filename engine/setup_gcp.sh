#!/usr/bin/env bash
# ╔══════════════════════════════════════════════════════╗
# ║  Neuro-Viral Score Engine — GCP One-Command Setup    ║
# ║  Creates L4 GPU spot VM, installs TRIBE v2, scores   ║
# ╚══════════════════════════════════════════════════════╝
#
# Usage:
#   chmod +x setup_gcp.sh
#   ./setup_gcp.sh              # create VM + install everything
#   ./setup_gcp.sh start        # start existing VM
#   ./setup_gcp.sh stop         # stop VM (save credits)
#   ./setup_gcp.sh ssh          # SSH into the VM
#   ./setup_gcp.sh run video.mp4  # upload video + run scoring
#   ./setup_gcp.sh delete       # delete VM entirely

set -euo pipefail

# ── Configuration ─────────────────────────────────────
PROJECT_ID="project-0e722db8-3776-4066-866"
ZONE="northamerica-northeast2-b"
INSTANCE_NAME="tribe-v2-gpu"
MACHINE_TYPE="g2-standard-8"
GPU_TYPE="nvidia-l4"
GPU_COUNT=1
BOOT_DISK_SIZE="200GB"
IMAGE_FAMILY="pytorch-latest-gpu"
IMAGE_PROJECT="deeplearning-platform-release"

# ── Helpers ───────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
DIM='\033[2m'
BOLD='\033[1m'
RESET='\033[0m'

log()  { echo -e "${CYAN}[neuro-viral]${RESET} $*"; }
ok()   { echo -e "${GREEN}[OK]${RESET} $*"; }
fail() { echo -e "${RED}[ERROR]${RESET} $*" >&2; exit 1; }

check_gcloud() {
    command -v gcloud >/dev/null 2>&1 || fail "gcloud CLI not found. Install: https://cloud.google.com/sdk/docs/install"
    gcloud config set project "$PROJECT_ID" --quiet 2>/dev/null
}

# ── Commands ──────────────────────────────────────────

cmd_create() {
    log "Creating spot L4 VM: ${BOLD}${INSTANCE_NAME}${RESET}"
    log "${DIM}Machine: ${MACHINE_TYPE} | GPU: ${GPU_TYPE} x${GPU_COUNT} (24GB VRAM) | Disk: ${BOOT_DISK_SIZE}${RESET}"
    echo ""

    gcloud compute instances create "$INSTANCE_NAME" \
        --project="$PROJECT_ID" \
        --zone="$ZONE" \
        --machine-type="$MACHINE_TYPE" \
        --accelerator="count=${GPU_COUNT},type=${GPU_TYPE}" \
        --provisioning-model=SPOT \
        --instance-termination-action=STOP \
        --image-family="$IMAGE_FAMILY" \
        --image-project="$IMAGE_PROJECT" \
        --boot-disk-size="$BOOT_DISK_SIZE" \
        --boot-disk-type=pd-ssd \
        --metadata="install-nvidia-driver=True" \
        --scopes=default \
        --maintenance-policy=TERMINATE

    ok "VM created. Waiting for boot..."
    sleep 30

    log "Installing dependencies on VM..."
    gcloud compute ssh "$INSTANCE_NAME" --zone="$ZONE" --command="
        set -e
        echo '=== Installing Neuro-Viral Score Engine ==='

        # Upgrade pip
        pip install --upgrade pip

        # Install TRIBE v2 from source
        pip install git+https://github.com/facebookresearch/tribev2.git

        # Install scoring engine dependencies
        pip install nilearn rich scipy

        echo '=== Installation complete ==='
        nvidia-smi
    "

    ok "VM ready! Upload your engine code and videos."
    echo ""
    log "Next steps:"
    echo "  1. Upload engine:  gcloud compute scp --recurse engine/ ${INSTANCE_NAME}:~/engine --zone=${ZONE}"
    echo "  2. Upload video:   gcloud compute scp my_reel.mp4 ${INSTANCE_NAME}:~ --zone=${ZONE}"
    echo "  3. SSH in:         ./setup_gcp.sh ssh"
    echo "  4. Run:            python -m engine.run my_reel.mp4"
    echo "  5. Stop VM:        ./setup_gcp.sh stop"
}

cmd_start() {
    log "Starting VM: ${INSTANCE_NAME}"
    gcloud compute instances start "$INSTANCE_NAME" --zone="$ZONE"
    ok "VM started. SSH with: ./setup_gcp.sh ssh"
}

cmd_stop() {
    log "Stopping VM: ${INSTANCE_NAME} (credits saved)"
    gcloud compute instances stop "$INSTANCE_NAME" --zone="$ZONE"
    ok "VM stopped. No charges while stopped."
}

cmd_ssh() {
    log "Connecting to ${INSTANCE_NAME}..."
    gcloud compute ssh "$INSTANCE_NAME" --zone="$ZONE"
}

cmd_run() {
    local video_file="${1:?Usage: ./setup_gcp.sh run <video.mp4>}"
    [ -f "$video_file" ] || fail "File not found: $video_file"

    log "Uploading engine code..."
    gcloud compute scp --recurse \
        "$(dirname "$0")/engine" \
        "$(dirname "$0")/requirements.txt" \
        "${INSTANCE_NAME}:~/" --zone="$ZONE"

    log "Uploading video: ${video_file}"
    gcloud compute scp "$video_file" "${INSTANCE_NAME}:~/" --zone="$ZONE"

    local basename
    basename=$(basename "$video_file")

    log "Running Neuro-Viral Score Engine..."
    echo ""
    gcloud compute ssh "$INSTANCE_NAME" --zone="$ZONE" --command="
        cd ~ && python -m engine.run '${basename}'
    "
    echo ""
    ok "Done! Stop VM to save credits: ./setup_gcp.sh stop"
}

cmd_delete() {
    log "Deleting VM: ${INSTANCE_NAME}"
    gcloud compute instances delete "$INSTANCE_NAME" --zone="$ZONE" --quiet
    ok "VM deleted."
}

# ── Dispatch ──────────────────────────────────────────

check_gcloud

case "${1:-create}" in
    create) cmd_create ;;
    start)  cmd_start ;;
    stop)   cmd_stop ;;
    ssh)    cmd_ssh ;;
    run)    cmd_run "${2:-}" ;;
    delete) cmd_delete ;;
    *)      echo "Usage: $0 {create|start|stop|ssh|run <video>|delete}"; exit 1 ;;
esac
