"""Reader for the ABC subset used by MVP 2 listening features (P05 ADR-010).

Turns a score into normalized note events shared by instrument playback (HU15),
spoken solfege (HU13) and the audio tutor (HU14). Pure Python, no Django.

Supported: header fields X/T/M/L/K/Q (others ignored), notes A-G/a-g with
octave marks and accidentals (^ _ =), rests z/x, numeric durations (2, /2, 3/2,
/), bar lines and repeat signs (played once), slurs, annotations in quotes and
spaces. Anything else (chords, tuplets, ties, grace notes, voices, inline fields,
decorations, broken rhythm) makes the score unsupported for listening.
"""

from dataclasses import dataclass, field
from fractions import Fraction
import re

SOLFEGE = {"C": "Do", "D": "Re", "E": "Mi", "F": "Fa", "G": "Sol", "A": "La", "B": "Si"}
LETTER_SEMITONES = {"C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11}
SHARP_ORDER = "FCGDAEB"
FLAT_ORDER = "BEADGCF"
# Number of sharps (positive) or flats (negative) for major keys.
MAJOR_KEYS = {
    "C": 0, "G": 1, "D": 2, "A": 3, "E": 4, "B": 5, "F#": 6, "C#": 7,
    "F": -1, "Bb": -2, "Eb": -3, "Ab": -4, "Db": -5, "Gb": -6, "Cb": -7,
}
MINOR_KEYS = {
    "A": 0, "E": 1, "B": 2, "F#": 3, "C#": 4, "G#": 5, "D#": 6, "A#": 7,
    "D": -1, "G": -2, "C": -3, "F": -4, "Bb": -5, "Eb": -6, "Ab": -7,
}
CLEF_NAMES = {"treble": "Sol", "bass": "Fa", "alto": "Do", "tenor": "Do"}
NUMBER_WORDS = {
    1: "uno", 2: "dos", 3: "tres", 4: "cuatro", 5: "cinco", 6: "seis",
    7: "siete", 8: "ocho", 9: "nueve", 10: "diez", 11: "once", 12: "doce", 16: "dieciséis",
}

HEADER_RE = re.compile(r"^([A-Za-z]):(.*)$")
NOTE_RE = re.compile(r"(\^\^|\^|__|_|=)?([A-Ga-g])([,']*)(\d*)(/*)(\d*)")
REST_RE = re.compile(r"([zx])(\d*)(/*)(\d*)")
BAR_RE = re.compile(r":*\|+\]?:*|\[\||::")


class UnsupportedAbc(ValueError):
    pass


@dataclass
class NoteEvent:
    start: Fraction
    duration: Fraction  # in quarter notes
    midi: int | None  # None for a rest
    letter: str | None = None
    accidental: int = 0  # -2..2 effective accidental of the spelled note
    written_accidental: bool = False


@dataclass
class AbcReading:
    meter: tuple[int, int]
    unit: Fraction
    tempo_bpm: int | None
    key_name: str
    clef: str
    events: list[NoteEvent] = field(default_factory=list)

    @property
    def notes(self):
        return [event for event in self.events if event.midi is not None]


def _parse_fraction(text: str) -> Fraction:
    numerator, _, denominator = text.partition("/")
    return Fraction(int(numerator), int(denominator))


def _parse_meter(value: str) -> tuple[int, int]:
    value = value.strip()
    if value in ("", "none"):
        return (4, 4)
    if value == "C":
        return (4, 4)
    if value == "C|":
        return (2, 2)
    match = re.fullmatch(r"(\d+)\s*/\s*(\d+)", value)
    if not match:
        raise UnsupportedAbc("meter")
    return (int(match.group(1)), int(match.group(2)))


def _parse_key(value: str) -> tuple[dict[str, int], str, str]:
    tokens = value.strip().split()
    clef = "treble"
    key_tokens = []
    for token in tokens:
        lowered = token.lower()
        if lowered.startswith("clef="):
            clef = lowered.split("=", 1)[1]
        elif lowered in CLEF_NAMES:
            clef = lowered
        else:
            key_tokens.append(token)
    if clef not in CLEF_NAMES:
        raise UnsupportedAbc("clef")
    key_text = "".join(key_tokens) or "C"
    match = re.fullmatch(r"([A-Ga-g])([#b]?)(m|min|minor|maj|major)?", key_text, re.IGNORECASE)
    if not match:
        raise UnsupportedAbc("key")
    tonic = match.group(1).upper() + match.group(2)
    is_minor = (match.group(3) or "").lower() in ("m", "min", "minor")
    table = MINOR_KEYS if is_minor else MAJOR_KEYS
    if tonic not in table:
        raise UnsupportedAbc("key")
    count = table[tonic]
    signature = {}
    if count > 0:
        for letter in SHARP_ORDER[:count]:
            signature[letter] = 1
    elif count < 0:
        for letter in FLAT_ORDER[: -count]:
            signature[letter] = -1
    spoken = SOLFEGE[tonic[0]]
    if tonic.endswith("#"):
        spoken += " sostenido"
    elif tonic.endswith("b"):
        spoken += " bemol"
    key_name = f"{spoken} {'menor' if is_minor else 'mayor'}"
    return signature, key_name, CLEF_NAMES[clef]


def _parse_tempo(value: str) -> int | None:
    match = re.search(r"(?:(\d+)/(\d+)\s*=\s*)?(\d+)", value)
    if not match:
        return None
    bpm = int(match.group(3))
    if match.group(1):
        beat = Fraction(int(match.group(1)), int(match.group(2)))
        bpm = int(bpm * beat / Fraction(1, 4))
    return bpm if 20 <= bpm <= 300 else None


def _length(multiplier: str, slashes: str, divisor: str) -> Fraction:
    value = Fraction(int(multiplier)) if multiplier else Fraction(1)
    if slashes:
        if divisor:
            value /= int(divisor)
        else:
            value /= 2 ** len(slashes)
    if value <= 0:
        raise UnsupportedAbc("duration")
    return value


def read_abc(content: str) -> AbcReading:
    headers = {}
    body_lines = []
    for raw_line in content.splitlines():
        line = raw_line.split("%", 1)[0].rstrip()
        if not line.strip():
            continue
        header = HEADER_RE.match(line.strip())
        if header and not body_lines:
            headers.setdefault(header.group(1).upper(), header.group(2).strip())
            continue
        if header:
            raise UnsupportedAbc("header in body")
        body_lines.append(line)

    if not body_lines:
        raise UnsupportedAbc("no music")
    meter = _parse_meter(headers.get("M", "4/4"))
    if "L" in headers:
        try:
            unit = _parse_fraction(headers["L"].strip())
        except (ValueError, ZeroDivisionError) as exc:
            raise UnsupportedAbc("unit") from exc
    else:
        unit = Fraction(1, 16) if Fraction(*meter) < Fraction(3, 4) else Fraction(1, 8)
    signature, key_name, clef = _parse_key(headers.get("K", "C"))
    tempo = _parse_tempo(headers["Q"]) if "Q" in headers else None

    reading = AbcReading(meter=meter, unit=unit, tempo_bpm=tempo, key_name=key_name, clef=clef)
    position = Fraction(0)
    bar_accidentals: dict[tuple[str, int], int] = {}
    unit_quarters = unit * 4
    text = " ".join(body_lines)
    index = 0
    while index < len(text):
        char = text[index]
        if char.isspace() or char in "()" and not (char == "(" and index + 1 < len(text) and text[index + 1].isdigit()):
            index += 1
            continue
        if char == '"':
            end = text.find('"', index + 1)
            if end == -1:
                raise UnsupportedAbc("annotation")
            index = end + 1
            continue
        bar = BAR_RE.match(text, index)
        if bar and bar.end() > index:
            bar_accidentals.clear()
            index = bar.end()
            continue
        note = NOTE_RE.match(text, index)
        if note and note.end() > index:
            accidental_text, letter, octave_marks, mult, slashes, div = note.groups()
            upper = letter.upper()
            octave = 4 if letter.isupper() else 5
            octave += octave_marks.count("'") - octave_marks.count(",")
            if accidental_text:
                accidental = {"^": 1, "^^": 2, "_": -1, "__": -2, "=": 0}[accidental_text]
                bar_accidentals[(upper, octave)] = accidental
            else:
                accidental = bar_accidentals.get((upper, octave), signature.get(upper, 0))
            duration = _length(mult, slashes, div) * unit_quarters
            midi = 12 * (octave + 1) + LETTER_SEMITONES[upper] + accidental
            if not 21 <= midi <= 108:
                raise UnsupportedAbc("range")
            reading.events.append(
                NoteEvent(position, duration, midi, upper, accidental, bool(accidental_text))
            )
            position += duration
            index = note.end()
            continue
        rest = REST_RE.match(text, index)
        if rest and rest.end() > index:
            _, mult, slashes, div = rest.groups()
            duration = _length(mult, slashes, div) * unit_quarters
            reading.events.append(NoteEvent(position, duration, None))
            position += duration
            index = rest.end()
            continue
        raise UnsupportedAbc(f"unsupported symbol {char!r}")

    if not reading.notes:
        raise UnsupportedAbc("no notes")
    return reading


def playback_data(content: str, score_format: str) -> dict:
    """Payload for the score detail response (HU15)."""
    if score_format != "ABC":
        return {"playable": False, "reason": "NOT_ABC", "events": []}
    try:
        reading = read_abc(content)
    except UnsupportedAbc:
        return {"playable": False, "reason": "UNSUPPORTED_ELEMENTS", "events": []}
    return {
        "playable": True,
        "reason": None,
        "meter": f"{reading.meter[0]}/{reading.meter[1]}",
        "tempo_bpm": reading.tempo_bpm or 100,
        "events": [
            {"midi": event.midi, "start": float(event.start), "duration": float(event.duration)}
            for event in reading.events
        ],
    }


def _note_name(event: NoteEvent) -> str:
    name = SOLFEGE[event.letter]
    if event.accidental > 0:
        name += " sostenido" if event.accidental == 1 else " doble sostenido"
    elif event.accidental < 0:
        name += " bemol" if event.accidental == -1 else " doble bemol"
    return name


def solfege_text(reading: AbcReading, with_pauses: bool) -> str:
    """Spoken solfege (HU13, DEC-206). With pauses, uses SSML break tags whose
    length follows the note duration; otherwise commas give a steady pace."""
    beat_seconds = 60 / (reading.tempo_bpm or 100)
    parts = []
    for event in reading.events:
        word = "silencio" if event.midi is None else _note_name(event)
        if with_pauses:
            pause = max(0.15, min(2.5, float(event.duration) * beat_seconds - 0.35))
            parts.append(f'{word} <break time="{pause:.2f}s" />')
        else:
            parts.append(word)
    return " ".join(parts) if with_pauses else ", ".join(parts) + "."


def estimated_difficulty(reading: AbcReading) -> str:
    """BR-014 (initial version, DEC-238)."""
    notes = reading.notes
    shortest = min(event.duration for event in notes)
    points = 0 if shortest >= 1 else 1 if shortest >= Fraction(1, 2) else 2
    accidentals = sum(1 for event in notes if event.written_accidental)
    points += 0 if accidentals == 0 else 1 if accidentals <= 3 else 2
    span = max(event.midi for event in notes) - min(event.midi for event in notes)
    points += 0 if span <= 12 else 1 if span <= 18 else 2
    points += 0 if len(notes) <= 16 else 1 if len(notes) <= 48 else 2
    return "baja" if points <= 2 else "media" if points <= 5 else "alta"


def _number(value: int) -> str:
    return NUMBER_WORDS.get(value, str(value))


def tutor_text(reading: AbcReading) -> str:
    """Audio tutor locution (HU14, BR-028, DEC-236)."""
    numerator, denominator = reading.meter
    parts = [
        f"Partitura en clave de {reading.clef}",
        f"tonalidad de {reading.key_name}",
        f"compás de {_number(numerator)} por {_number(denominator)}",
    ]
    if reading.tempo_bpm:
        parts.append(f"tempo de {reading.tempo_bpm} pulsos por minuto")
    parts.append(f"dificultad estimada: {estimated_difficulty(reading)}")
    return ", ".join(parts) + "."
