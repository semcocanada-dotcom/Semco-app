"""
Task 1 — Frame Extractor
Extracts frames from a video at a fixed FPS using ffmpeg (serial, single-threaded).
Writes a crash-safe JSON log after every frame and validates output before exit.
"""

import argparse
import datetime
import json
import math
import os
import re
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path

DEFAULT_FPS = 2.0
DEFAULT_BASE_DIR = "/tmp/semco_frames"
DEFAULT_FORMAT = "jpg"
DEFAULT_JPEG_QUALITY = 2   # ffmpeg q:v: 1=best, 31=worst; 2 ≈ JPEG 95+
FRAME_COUNT_TOLERANCE = 1  # allow ±1 for ffmpeg timestamp boundary rounding


# ---------------------------------------------------------------------------
# Custom exceptions
# ---------------------------------------------------------------------------

class FrameExtractorError(Exception):
    pass

class VideoProbeError(FrameExtractorError):
    pass

class ExtractionError(FrameExtractorError):
    pass

class ValidationError(FrameExtractorError):
    pass


# ---------------------------------------------------------------------------
# Data container
# ---------------------------------------------------------------------------

@dataclass
class VideoInfo:
    path: Path
    duration_seconds: float
    source_fps_str: str
    width: int
    height: int
    codec: str


# ---------------------------------------------------------------------------
# Tool availability
# ---------------------------------------------------------------------------

def check_tool_available(tool_name: str) -> str:
    try:
        result = subprocess.run(
            [tool_name, "-version"],
            capture_output=True,
            text=True,
        )
        first_line = result.stdout.splitlines()[0] if result.stdout else tool_name
        return first_line
    except FileNotFoundError:
        raise RuntimeError(
            f"{tool_name} not found. Install with: sudo apt install ffmpeg"
        )


# ---------------------------------------------------------------------------
# Video probing
# ---------------------------------------------------------------------------

def probe_video(video_path: Path) -> dict:
    result = subprocess.run(
        [
            "ffprobe",
            "-v", "quiet",
            "-print_format", "json",
            "-show_streams",
            "-show_format",
            str(video_path),
        ],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        raise VideoProbeError(f"ffprobe failed:\n{result.stderr[:1000]}")
    return json.loads(result.stdout)


def get_video_info(video_path: Path, probe_data: dict) -> VideoInfo:
    video_stream = None
    for stream in probe_data.get("streams", []):
        if stream.get("codec_type") == "video":
            video_stream = stream
            break

    if video_stream is None:
        raise VideoProbeError(
            "No video stream found — file may be audio-only or corrupt"
        )

    raw_duration = probe_data.get("format", {}).get("duration")
    if not raw_duration:
        raw_duration = video_stream.get("duration")
    if not raw_duration or float(raw_duration) <= 0:
        raise VideoProbeError("Video duration is unknown or zero")

    return VideoInfo(
        path=video_path,
        duration_seconds=float(raw_duration),
        source_fps_str=video_stream.get("r_frame_rate", "unknown"),
        width=int(video_stream.get("width", 0)),
        height=int(video_stream.get("height", 0)),
        codec=video_stream.get("codec_name", "unknown"),
    )


# ---------------------------------------------------------------------------
# Output directory
# ---------------------------------------------------------------------------

def sanitize_dirname(name: str) -> str:
    return re.sub(r"[^a-zA-Z0-9_-]", "_", name)


def make_output_directory(base_dir: Path, video_stem: str) -> Path:
    safe_name = sanitize_dirname(video_stem)
    output_dir = base_dir / safe_name
    output_dir.mkdir(parents=True, exist_ok=True)
    return output_dir


# ---------------------------------------------------------------------------
# ffmpeg extraction
# ---------------------------------------------------------------------------

def run_ffmpeg_extraction(
    video_path: Path,
    output_dir: Path,
    fps: float,
    fmt: str,
    jpeg_quality: int,
) -> None:
    if fmt == "jpg":
        cmd = [
            "ffmpeg",
            "-i", str(video_path),
            "-threads", "1",
            "-vf", f"fps={fps}",
            "-q:v", str(jpeg_quality),
            "-y",
            str(output_dir / "frame_%04d.jpg"),
        ]
    else:
        cmd = [
            "ffmpeg",
            "-i", str(video_path),
            "-threads", "1",
            "-vf", f"fps={fps}",
            "-compression_level", "1",
            "-y",
            str(output_dir / "frame_%04d.png"),
        ]

    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise ExtractionError(
            f"ffmpeg failed (exit {result.returncode}):\n{result.stderr[-2000:]}"
        )


# ---------------------------------------------------------------------------
# Atomic JSON logging
# ---------------------------------------------------------------------------

def write_log_atomic(log_data: dict, log_path: Path) -> None:
    tmp_path = log_path.with_suffix(".tmp")
    with open(tmp_path, "w", encoding="utf-8") as f:
        json.dump(log_data, f, indent=2)
        f.flush()
        os.fsync(f.fileno())
    os.replace(tmp_path, log_path)


# ---------------------------------------------------------------------------
# Validation gate + per-frame serial logging
# ---------------------------------------------------------------------------

def validate_and_log_frames(
    output_dir: Path,
    expected_count: int,
    fps: float,
    fmt: str,
) -> list:
    log_path = output_dir / "extraction_log.json"
    frame_files = sorted(output_dir.glob(f"frame_*.{fmt}"))
    actual_count = len(frame_files)

    # Gate 1: frame count
    min_ok = expected_count - FRAME_COUNT_TOLERANCE
    max_ok = expected_count + FRAME_COUNT_TOLERANCE
    if not (min_ok <= actual_count <= max_ok):
        raise ValidationError(
            f"Frame count mismatch: expected {expected_count} "
            f"±{FRAME_COUNT_TOLERANCE}, got {actual_count}"
        )

    frame_records = []
    partial_log = {
        "extraction_metadata": {"validation_passed": False},
        "frames": frame_records,
    }

    for i, frame_file in enumerate(frame_files, start=1):
        size = frame_file.stat().st_size

        # Gate 2: zero-byte check
        if size == 0:
            raise ValidationError(
                f"Frame {frame_file.name} is 0 bytes — possible corrupt output"
            )

        timestamp_seconds = round((i - 1) / fps, 6)
        record = {
            "frame_number": i,
            "filename": frame_file.name,
            "timestamp_seconds": timestamp_seconds,
            "file_size_bytes": size,
            "validation_ok": True,
        }
        frame_records.append(record)

        # Write log after every frame (crash recovery)
        write_log_atomic(partial_log, log_path)

        print(
            f"  [frame {i:4d}/{actual_count}]  {frame_file.name}"
            f"  {size:,} bytes  @ {timestamp_seconds:.3f}s"
        )

    return frame_records


# ---------------------------------------------------------------------------
# Final log assembly
# ---------------------------------------------------------------------------

def build_final_log(
    video_path: Path,
    output_dir: Path,
    video_info: VideoInfo,
    fps: float,
    fmt: str,
    jpeg_quality: int,
    frames: list,
    ffmpeg_version: str,
) -> dict:
    return {
        "extraction_metadata": {
            "video_path": str(video_path.resolve()),
            "video_filename": video_path.name,
            "output_directory": str(output_dir),
            "extraction_timestamp": datetime.datetime.now().isoformat(),
            "fps_requested": fps,
            "fps_source_video": video_info.source_fps_str,
            "duration_seconds": video_info.duration_seconds,
            "video_width": video_info.width,
            "video_height": video_info.height,
            "video_codec": video_info.codec,
            "expected_frame_count": math.floor(video_info.duration_seconds * fps),
            "actual_frame_count": len(frames),
            "output_format": fmt,
            "jpeg_quality_qv": jpeg_quality if fmt == "jpg" else None,
            "validation_passed": True,
            "ffmpeg_version": ffmpeg_version,
            "total_output_size_bytes": sum(f["file_size_bytes"] for f in frames),
        },
        "frames": frames,
    }


# ---------------------------------------------------------------------------
# Main orchestrator
# ---------------------------------------------------------------------------

def extract_frames(
    video_path_str: str,
    output_base_dir: str = DEFAULT_BASE_DIR,
    fps: float = DEFAULT_FPS,
    fmt: str = DEFAULT_FORMAT,
    jpeg_quality: int = DEFAULT_JPEG_QUALITY,
) -> Path:
    # Step 1 & 2: confirm tools exist
    ffmpeg_version = check_tool_available("ffmpeg")
    check_tool_available("ffprobe")
    print(f"[INFO] ffmpeg found: {ffmpeg_version}")

    # Step 3: validate input file
    video_path = Path(video_path_str)
    if not video_path.exists():
        raise FileNotFoundError(f"{video_path} not found")

    # Step 4 & 5: probe video
    probe_data = probe_video(video_path)
    video_info = get_video_info(video_path, probe_data)
    print(
        f"[INFO] Video: {video_info.path.name} | "
        f"{video_info.duration_seconds:.3f}s | "
        f"{video_info.width}x{video_info.height} | "
        f"{video_info.codec} | source {video_info.source_fps_str} fps"
    )

    # Step 6: expected frame count
    expected = math.floor(video_info.duration_seconds * fps)

    # Step 7: create output directory
    base_dir = Path(output_base_dir)
    output_dir = make_output_directory(base_dir, video_path.stem)

    # Step 8: print plan
    print(
        f"[INFO] Extracting ~{expected} frames at {fps} FPS "
        f"-> {output_dir}/"
    )

    # Step 9: run ffmpeg
    print("[INFO] Running ffmpeg...")
    run_ffmpeg_extraction(video_path, output_dir, fps, fmt, jpeg_quality)

    # Step 10: validate + per-frame serial log
    print("[INFO] Validating frames...")
    frames = validate_and_log_frames(output_dir, expected, fps, fmt)

    # Step 11 & 12: write final complete log
    final_log = build_final_log(
        video_path, output_dir, video_info,
        fps, fmt, jpeg_quality, frames, ffmpeg_version,
    )
    log_path = output_dir / "extraction_log.json"
    write_log_atomic(final_log, log_path)

    # Step 13: summary
    total_mb = final_log["extraction_metadata"]["total_output_size_bytes"] / (1024 * 1024)
    print(
        f"[INFO] Validation passed: {len(frames)}/{len(frames)} frames, "
        f"0 empty files"
    )
    print(f"[INFO] Log written: {log_path}")
    print(f"[INFO] Total output size: {total_mb:.1f} MB")

    return output_dir


# ---------------------------------------------------------------------------
# CLI entry point
# ---------------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser(
        description="Extract frames from a video at 2 FPS (Task 1 — Frame Extractor)"
    )
    parser.add_argument("video_path", help="Path to input video file")
    parser.add_argument(
        "--output-base-dir",
        default=DEFAULT_BASE_DIR,
        help=f"Base directory for output frames (default: {DEFAULT_BASE_DIR})",
    )
    parser.add_argument(
        "--fps",
        type=float,
        default=DEFAULT_FPS,
        help=f"Frames per second to extract (default: {DEFAULT_FPS})",
    )
    parser.add_argument(
        "--format",
        choices=["jpg", "png"],
        default=DEFAULT_FORMAT,
        help=f"Output image format (default: {DEFAULT_FORMAT})",
    )
    parser.add_argument(
        "--jpeg-quality",
        type=int,
        default=DEFAULT_JPEG_QUALITY,
        help="ffmpeg q:v value 1-31 (1=best, 31=worst). Default 2 ≈ 95+ quality",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Probe video and show extraction plan without extracting",
    )
    args = parser.parse_args()

    try:
        if args.dry_run:
            check_tool_available("ffprobe")
            video_path = Path(args.video_path)
            if not video_path.exists():
                raise FileNotFoundError(f"{video_path} not found")
            probe_data = probe_video(video_path)
            video_info = get_video_info(video_path, probe_data)
            expected = math.floor(video_info.duration_seconds * args.fps)
            print(f"[DRY RUN] Video:    {video_info.path.name}")
            print(f"[DRY RUN] Duration: {video_info.duration_seconds:.3f}s")
            print(f"[DRY RUN] Source:   {video_info.width}x{video_info.height} @ {video_info.source_fps_str} fps ({video_info.codec})")
            print(f"[DRY RUN] Output:   ~{expected} frames at {args.fps} FPS")
            print(f"[DRY RUN] Format:   {args.format}" + (f" (q:v {args.jpeg_quality})" if args.format == "jpg" else ""))
            output_dir = Path(args.output_base_dir) / sanitize_dirname(video_path.stem)
            print(f"[DRY RUN] Dest:     {output_dir}/")
            sys.exit(0)

        output_dir = extract_frames(
            args.video_path,
            output_base_dir=args.output_base_dir,
            fps=args.fps,
            fmt=args.format,
            jpeg_quality=args.jpeg_quality,
        )
        print(f"\nDone. Frames at: {output_dir}")
        sys.exit(0)

    except FileNotFoundError as e:
        print(f"ERROR: {e}", file=sys.stderr)
        sys.exit(1)
    except (VideoProbeError, ExtractionError, ValidationError, RuntimeError) as e:
        print(f"ERROR: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
