"""Generate sci-fi sound effects for the Brain Scan video."""

import numpy as np
import wave
import struct
import os

RATE = 44100
PUBLIC = os.path.join(os.path.dirname(__file__), "public")


def write_wav(filename: str, samples: np.ndarray, rate: int = RATE) -> None:
    """Write a mono WAV file from float samples in [-1, 1]."""
    path = os.path.join(PUBLIC, filename)
    samples = np.clip(samples, -1.0, 1.0)
    int_samples = (samples * 32767).astype(np.int16)
    with wave.open(path, "w") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(rate)
        wf.writeframes(int_samples.tobytes())
    size_kb = os.path.getsize(path) / 1024
    print(f"  {filename}: {size_kb:.0f} KB ({len(samples) / rate:.1f}s)")


def fade(samples: np.ndarray, fade_in: float = 0.05, fade_out: float = 0.05) -> np.ndarray:
    """Apply fade in/out to avoid clicks."""
    n_in = int(fade_in * RATE)
    n_out = int(fade_out * RATE)
    result = samples.copy()
    if n_in > 0 and n_in < len(result):
        result[:n_in] *= np.linspace(0, 1, n_in)
    if n_out > 0 and n_out < len(result):
        result[-n_out:] *= np.linspace(1, 0, n_out)
    return result


def generate_ambient_drone(duration: float = 22.0) -> np.ndarray:
    """Deep sci-fi ambient drone — runs under the entire video."""
    t = np.linspace(0, duration, int(RATE * duration), endpoint=False)

    # Base drone: low fundamental with slow modulation
    drone = 0.3 * np.sin(2 * np.pi * 55 * t)  # A1
    drone += 0.15 * np.sin(2 * np.pi * 82.5 * t)  # fifth above
    drone += 0.1 * np.sin(2 * np.pi * 110 * t)  # octave

    # Slow LFO modulation for movement
    lfo = 0.5 + 0.5 * np.sin(2 * np.pi * 0.15 * t)
    drone *= 0.4 + 0.6 * lfo

    # Add filtered noise for texture
    noise = np.random.randn(len(t)) * 0.02
    # Simple low-pass via moving average
    kernel_size = 200
    kernel = np.ones(kernel_size) / kernel_size
    noise = np.convolve(noise, kernel, mode="same")
    drone += noise

    # Fade in 1s, fade out 2s
    return fade(drone * 0.35, fade_in=1.0, fade_out=2.0)


def generate_boot_up(duration: float = 2.5) -> np.ndarray:
    """Digital startup/boot sound for intro scene."""
    t = np.linspace(0, duration, int(RATE * duration), endpoint=False)

    # Rising frequency sweep
    freq_start, freq_end = 200, 1200
    freq = freq_start + (freq_end - freq_start) * (t / duration) ** 2
    phase = 2 * np.pi * np.cumsum(freq) / RATE
    sweep = 0.4 * np.sin(phase)

    # Digital clicks at intervals
    clicks = np.zeros_like(t)
    click_times = [0.3, 0.6, 0.85, 1.05, 1.2, 1.32, 1.42, 1.5]
    for ct in click_times:
        idx = int(ct * RATE)
        if idx < len(clicks) - 500:
            click_env = np.exp(-np.arange(500) / 80)
            clicks[idx : idx + 500] += 0.3 * click_env * np.sin(
                2 * np.pi * 2400 * np.arange(500) / RATE
            )

    # Combine with volume envelope
    env = np.minimum(t / 0.3, 1.0)  # fade in
    env *= np.where(t > duration - 0.3, np.maximum(0, (duration - t) / 0.3), 1.0)

    return fade((sweep * env + clicks) * 0.5, fade_in=0.02, fade_out=0.1)


def generate_scan_beep(duration: float = 0.15) -> np.ndarray:
    """Short electronic scan pulse — plays on each brain frame change."""
    t = np.linspace(0, duration, int(RATE * duration), endpoint=False)

    # Sharp sine burst at 1800 Hz with quick decay
    env = np.exp(-t * 25)
    beep = 0.5 * np.sin(2 * np.pi * 1800 * t) * env

    # Add a subtle digital click at start
    click_len = min(100, len(t))
    click_env = np.exp(-np.arange(click_len) / 15)
    beep[:click_len] += 0.3 * click_env * np.sin(
        2 * np.pi * 4000 * np.arange(click_len) / RATE
    )

    return fade(beep * 0.6, fade_in=0.005, fade_out=0.02)


def generate_data_whoosh(duration: float = 1.2) -> np.ndarray:
    """Whoosh/data processing sound for networks scene."""
    t = np.linspace(0, duration, int(RATE * duration), endpoint=False)

    # Filtered noise sweep
    noise = np.random.randn(len(t))

    # Frequency sweep filter (simulate with modulated sine * noise)
    freq_sweep = 400 + 2000 * np.sin(np.pi * t / duration) ** 2
    phase = 2 * np.pi * np.cumsum(freq_sweep) / RATE
    filtered = noise * np.sin(phase) * 0.3

    # Volume envelope: swell in, sustain, fade
    env = np.sin(np.pi * t / duration) ** 0.7
    filtered *= env

    return fade(filtered * 0.4, fade_in=0.05, fade_out=0.1)


def generate_score_rise(duration: float = 2.0) -> np.ndarray:
    """Rising tone that builds tension during score counting."""
    t = np.linspace(0, duration, int(RATE * duration), endpoint=False)

    # Rising pitch from 300 to 900 Hz
    freq = 300 + 600 * (t / duration) ** 1.5
    phase = 2 * np.pi * np.cumsum(freq) / RATE
    tone = 0.3 * np.sin(phase)

    # Add harmonics that build over time
    harmonic_mix = (t / duration) ** 2
    tone += 0.15 * harmonic_mix * np.sin(2 * phase)
    tone += 0.08 * harmonic_mix * np.sin(3 * phase)

    # Filtered noise layer that increases
    noise = np.random.randn(len(t)) * 0.05 * (t / duration)
    kernel = np.ones(100) / 100
    noise = np.convolve(noise, kernel, mode="same")

    # Volume: build up then sustain
    env = np.minimum(t / 0.2, 1.0) * np.minimum((t / duration) * 1.5, 1.0)

    return fade((tone + noise) * env * 0.5, fade_in=0.1, fade_out=0.05)


def generate_reveal_hit(duration: float = 1.5) -> np.ndarray:
    """Impact/reveal sound when the final score appears."""
    t = np.linspace(0, duration, int(RATE * duration), endpoint=False)

    # Low impact thud
    thud = 0.6 * np.sin(2 * np.pi * 80 * t) * np.exp(-t * 4)

    # Bright shimmer
    shimmer = 0.25 * np.sin(2 * np.pi * 2200 * t) * np.exp(-t * 6)
    shimmer += 0.15 * np.sin(2 * np.pi * 3300 * t) * np.exp(-t * 8)
    shimmer += 0.1 * np.sin(2 * np.pi * 4400 * t) * np.exp(-t * 10)

    # Noise burst
    burst_len = min(int(0.05 * RATE), len(t))
    noise_burst = np.zeros_like(t)
    noise_burst[:burst_len] = np.random.randn(burst_len) * 0.3 * np.exp(
        -np.arange(burst_len) / (0.01 * RATE)
    )

    return fade((thud + shimmer + noise_burst) * 0.6, fade_in=0.002, fade_out=0.3)


def generate_completion_chime(duration: float = 2.0) -> np.ndarray:
    """Gentle completion chime for the rotating brain outro."""
    t = np.linspace(0, duration, int(RATE * duration), endpoint=False)

    # Bell-like tones (C5, E5, G5 — major triad)
    freqs = [523.25, 659.25, 783.99]
    chime = np.zeros_like(t)
    for i, f in enumerate(freqs):
        delay = i * 0.15
        mask = t >= delay
        t_shifted = t[mask] - delay
        env = np.exp(-t_shifted * 2.0)
        tone = 0.25 * np.sin(2 * np.pi * f * t_shifted) * env
        tone += 0.1 * np.sin(2 * np.pi * f * 2 * t_shifted) * env * np.exp(-t_shifted * 3)
        chime[mask] += tone

    return fade(chime * 0.5, fade_in=0.005, fade_out=0.5)


if __name__ == "__main__":
    print("Generating sound effects...")

    print("\n1. Ambient drone (full video background)")
    write_wav("sfx_ambient.wav", generate_ambient_drone(22.0))

    print("2. Boot-up sound (intro scene)")
    write_wav("sfx_boot.wav", generate_boot_up(2.5))

    print("3. Scan beep (per brain frame)")
    write_wav("sfx_beep.wav", generate_scan_beep(0.15))

    print("4. Data whoosh (networks scene)")
    write_wav("sfx_whoosh.wav", generate_data_whoosh(1.2))

    print("5. Score rise (score counting)")
    write_wav("sfx_rise.wav", generate_score_rise(2.0))

    print("6. Reveal hit (score reveal)")
    write_wav("sfx_reveal.wav", generate_reveal_hit(1.5))

    print("7. Completion chime (outro)")
    write_wav("sfx_chime.wav", generate_completion_chime(2.0))

    print("\nAll sound effects generated!")
