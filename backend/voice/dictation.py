import re
import unicodedata
from dataclasses import dataclass

# Whisper context for HU11 dictation: lists the BR-013 vocabulary so short words such as
# "Do negra" or "Re corchea" are not merged or misspelled ("Donegra", "recorcea").
DICTATION_PROMPT = (
    "Dictado musical: compás cuatro cuartos, tres cuartos, seis octavos. Do negra, "
    "Re corchea, Mi blanca, Fa sostenido, Sol redonda, La semicorchea, Si bemol, "
    "silencio de negra, barra."
)


class Uninterpretable(ValueError):
    pass


@dataclass(frozen=True)
class DictationResult:
    meter: str
    abc_line: str


NOTE_NAMES = {
    "do": "C",
    "re": "D",
    "mi": "E",
    "fa": "F",
    "sol": "G",
    "la": "A",
    "si": "B",
}
FIGURES = {
    "redonda": "4",
    "blanca": "2",
    "negra": "",
    "corchea": "/2",
    "semicorchea": "/4",
}
NUMBERS = {
    "uno": 1,
    "un": 1,
    "dos": 2,
    "tres": 3,
    "cuatro": 4,
    "cinco": 5,
    "seis": 6,
    "siete": 7,
    "ocho": 8,
    "nueve": 9,
    "diez": 10,
    "once": 11,
    "doce": 12,
}


def _tokens(text: str) -> list[str]:
    normalized = unicodedata.normalize("NFD", text.casefold())
    without_accents = "".join(
        character
        for character in normalized
        if unicodedata.category(character) != "Mn"
    )
    return re.findall(r"[a-z]+|\d+", without_accents)


def _number(token: str) -> int:
    if token.isdigit():
        return int(token)
    if token in NUMBERS:
        return NUMBERS[token]
    raise Uninterpretable


def parse(transcript: str) -> DictationResult:
    tokens = _tokens(transcript)
    if not tokens:
        raise Uninterpretable

    meter = "4/4"
    index = 0
    if tokens[0] == "compas":
        if len(tokens) < 3:
            raise Uninterpretable
        numerator = _number(tokens[1])
        denominator_token = tokens[2]
        denominator = {
            "medios": 2,
            "cuartos": 4,
            "octavos": 8,
            "dieciseisavos": 16,
        }.get(denominator_token)
        if denominator is None:
            raise Uninterpretable
        meter = f"{numerator}/{denominator}"
        index = 3

    music = []
    while index < len(tokens):
        token = tokens[index]
        if token == "barra":
            music.append("|")
            index += 1
            continue

        is_rest = token == "silencio"
        if is_rest:
            index += 1
            if index >= len(tokens) or tokens[index] != "de":
                raise Uninterpretable
            index += 1
            note = "z"
        else:
            note = NOTE_NAMES.get(token)
            if note is None:
                raise Uninterpretable
            index += 1
            if index < len(tokens) and tokens[index] in {"sostenido", "bemol"}:
                note = ("^" if tokens[index] == "sostenido" else "_") + note
                index += 1

        if index < len(tokens) and tokens[index] in FIGURES:
            music.append(note + FIGURES[tokens[index]])
            index += 1
        elif is_rest:
            raise Uninterpretable
        else:
            # Las notas sin figura usan la negra por defecto.
            music.append(note)

    if not music or all(token == "|" for token in music):
        raise Uninterpretable
    return DictationResult(meter=meter, abc_line=" ".join(music))


def compose_document(result: DictationResult, title: str | None = None) -> str:
    normalized_title = " ".join((title or "Dictado").split())
    normalized_title = "".join(
        character for character in normalized_title if character >= " " and character != "\x7f"
    )
    if not normalized_title:
        normalized_title = "Dictado"
    return (
        f"X:1\nT:{normalized_title}\nM:{result.meter}\n"
        f"L:1/4\nK:C\n{result.abc_line}"
    )
