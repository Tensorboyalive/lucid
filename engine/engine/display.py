"""Polished terminal display for the Neuro-Viral Score Engine.

Uses Rich for beautiful output designed to look great in screen
recordings, reels, and social media content.
"""

from __future__ import annotations

from pathlib import Path

from rich.console import Console
from rich.panel import Panel
from rich.progress import (
    BarColumn,
    Progress,
    SpinnerColumn,
    TextColumn,
    TimeElapsedColumn,
)
from rich.table import Table
from rich.text import Text

from engine.brain_regions import ALL_NETWORKS
from engine.viral_score import ViralScoreResult

# Narrow width looks great in screen recordings / phone-friendly
CONSOLE_WIDTH = 58
console = Console(width=CONSOLE_WIDTH)


def print_header() -> None:
    """Print the engine banner."""
    header = Text()
    header.append("NEURO-VIRAL SCORE ENGINE\n", style="bold white")
    header.append("Powered by Meta TRIBE v2 + fMRI", style="dim")
    console.print(
        Panel(
            header,
            border_style="bright_cyan",
            padding=(1, 4),
        )
    )


def print_video_info(video_path: str, duration: float | None = None) -> None:
    """Show which video is being analysed."""
    name = Path(video_path).name
    console.print()
    console.print(f"  [dim]Video:[/]  [bold]{name}[/]")
    if duration is not None:
        mins = int(duration) // 60
        secs = int(duration) % 60
        console.print(f"  [dim]Length:[/] {mins}:{secs:02d}")
    console.print()


def create_progress() -> Progress:
    """Create a styled progress bar for inference stages."""
    return Progress(
        SpinnerColumn("dots", style="cyan"),
        TextColumn("[bold]{task.description}"),
        BarColumn(bar_width=20, complete_style="cyan", finished_style="green"),
        TimeElapsedColumn(),
        console=console,
        transient=False,
    )


def _bar(value: float, max_val: float = 10.0, width: int = 20) -> str:
    """Render a coloured bar like: [===========         ] 7.2"""
    filled = int((value / max_val) * width)
    empty = width - filled

    if value >= 7.5:
        color = "green"
    elif value >= 5.0:
        color = "yellow"
    else:
        color = "red"

    bar = f"[{color}]{'=' * filled}[/][dim]{'.' * empty}[/]"
    return bar


def _format_moments(moments: list[float]) -> str:
    """Format peak timestamps as a compact string."""
    if not moments:
        return "[dim]no significant peaks[/]"
    tags = []
    for t in moments[:4]:
        mins = int(t) // 60
        secs = int(t) % 60
        tags.append(f"{mins}:{secs:02d}")
    return "[dim]peaks at [/]" + "[dim], [/]".join(f"[bold]{t}[/]" for t in tags)


def print_network_analysis(result: ViralScoreResult) -> None:
    """Print the per-network score breakdown."""
    console.print(
        Panel(
            "[bold]BRAIN NETWORK ANALYSIS[/]",
            border_style="dim",
            padding=(0, 2),
        )
    )
    console.print()

    for network in ALL_NETWORKS:
        ns = result.network_scores[network.name]
        bar = _bar(ns.score)
        console.print(
            f"  {network.icon} [bold]{network.display_name:<20}[/] "
            f"{bar}  [bold]{ns.score:>4.1f}[/]/10"
        )

        # Trend indicator
        if ns.trend_slope > 0.01:
            trend = "[green]rising[/]"
        elif ns.trend_slope < -0.01:
            trend = "[red]falling[/]"
        else:
            trend = "[dim]steady[/]"

        console.print(f"     [dim]{network.description}[/]")
        console.print(f"     trend: {trend}  |  {_format_moments(ns.top_moments_sec)}")
        console.print()


def print_final_score(result: ViralScoreResult) -> None:
    """Print the big final score panel."""
    full = int(result.final_score)
    empty = 10 - full

    score_text = Text()
    score_text.append("NEURO-VIRAL SCORE\n\n", style="bold white")
    score_text.append(f"  {result.final_score:.1f}", style=f"bold {result.verdict_color}")
    score_text.append(" / 10\n  ", style="bold white")
    score_text.append("*" * full, style="yellow")
    score_text.append("." * empty, style="dim")
    score_text.append("\n\n", style="")
    score_text.append(f"  {result.verdict}\n", style=f"bold {result.verdict_color}")

    console.print(
        Panel(
            score_text,
            border_style=result.verdict_color,
            padding=(1, 6),
        )
    )


def print_insights(result: ViralScoreResult) -> None:
    """Print actionable insights based on the scores."""
    console.print()
    console.print("  [bold]Key Insights[/]")
    console.print()

    reward = result.network_scores["reward"]
    emotion = result.network_scores["emotion"]
    attention = result.network_scores["attention"]
    memory = result.network_scores["memory"]

    insights = []

    # Hook analysis
    if result.hook_moments_sec:
        first = result.hook_moments_sec[0]
        mins = int(first) // 60
        secs = int(first) % 60
        insights.append(
            f"First hook at {mins}:{secs:02d} triggers reward response"
        )
    else:
        insights.append(
            "No strong hook detected in first 3s — consider a stronger opener"
        )

    # Attention feedback
    if attention.score >= 7.0:
        insights.append("Strong sustained attention — good pacing throughout")
    elif attention.trend_slope < -0.01:
        insights.append("Attention drops off — tighten the middle section")

    # Emotion feedback
    if emotion.score >= 7.0:
        insights.append("High emotional activation — likely to trigger shares")
    elif emotion.score < 5.0:
        insights.append("Low emotional response — add surprise or tension")

    # Memory feedback
    if memory.score < 5.5:
        insights.append("Weak memory encoding — add a memorable tagline or callback")
    elif memory.score >= 7.0:
        insights.append("Strong memory imprint — content is highly memorable")

    # Reward feedback
    if reward.score >= 8.0:
        insights.append("Exceptional reward activation — dopamine hit confirmed")

    for insight in insights[:5]:
        console.print(f"    [dim]-[/] {insight}")

    console.print()


def print_full_report(result: ViralScoreResult, video_path: str) -> None:
    """Print the complete analysis — network breakdown, score, insights."""
    print_video_info(video_path, result.video_duration_sec)
    print_network_analysis(result)
    print_final_score(result)
    print_insights(result)
