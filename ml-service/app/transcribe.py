import os
from functools import lru_cache
from faster_whisper import WhisperModel

MODEL_SIZE = os.getenv("WHISPER_MODEL", "base")
DEVICE = os.getenv("WHISPER_DEVICE", "cpu")
COMPUTE_TYPE = os.getenv("WHISPER_COMPUTE", "int8")


@lru_cache(maxsize=1)
def get_model() -> WhisperModel:
    """Loaded once per process. Model load takes seconds; transcription takes less."""
    return WhisperModel(MODEL_SIZE, device=DEVICE, compute_type=COMPUTE_TYPE)


def transcribe_file(path: str) -> dict:
    segments, info = get_model().transcribe(path, vad_filter=True, beam_size=1)

    items = [
        {"start": round(s.start, 2), "end": round(s.end, 2), "text": s.text.strip()}
        for s in segments
    ]

    return {
        "language": info.language,
        "duration": round(info.duration, 2),
        "segments": items,
        "text": " ".join(i["text"] for i in items).strip(),
    }
