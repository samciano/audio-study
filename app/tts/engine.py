import pyttsx3
from pathlib import Path


class TTSEngine:
    def __init__(self, voice_id=None, rate=160, volume=1.0):
        self.voice_id = voice_id
        self.rate = rate
        self.volume = volume
        self.engine = None

        self._init_engine()

    def _init_engine(self):
        # pyttsx3 tem um problema conhecido: usar a mesma instância de
        # engine para gerar mais de um arquivo em sequência (save_to_file +
        # runAndWait chamados várias vezes) frequentemente falha em gerar
        # o áudio a partir do segundo trecho em diante. Para garantir que
        # TODOS os trechos sejam realmente convertidos em áudio, o engine
        # é recriado antes de cada geração.
        self.engine = pyttsx3.init()

        self.engine.setProperty("rate", self.rate)
        self.engine.setProperty("volume", self.volume)

        if self.voice_id is not None:
            self._apply_voice()

    def _apply_voice(self):
        voices = self.engine.getProperty("voices")

        if self.voice_id < 0 or self.voice_id >= len(voices):
            raise ValueError("Voz inválida.")

        self.engine.setProperty(
            "voice",
            voices[self.voice_id].id
        )

    def get_voices(self):
        voices = self.engine.getProperty("voices")

        result = []

        for index, voice in enumerate(voices):
            result.append({
                "id": index,
                "name": voice.name,
                "languages": voice.languages
            })

        return result

    def set_voice(self, voice_id):
        self.voice_id = voice_id
        self._apply_voice()

    def set_rate(self, rate=160):
        self.rate = rate
        self.engine.setProperty(
            "rate",
            rate
        )

    def set_volume(self, volume=1.0):
        self.volume = volume
        self.engine.setProperty(
            "volume",
            volume
        )

    def generate_audio(self, text, output_path):
        if not text or not text.strip():
            raise ValueError("O texto não pode estar vazio.")

        output_path = Path(output_path)

        output_path.parent.mkdir(
            parents=True,
            exist_ok=True
        )

        # Recria o engine com as mesmas configurações antes de cada
        # geração (ver comentário em _init_engine).
        self._init_engine()

        self.engine.save_to_file(
            text,
            str(output_path)
        )

        self.engine.runAndWait()

        if not output_path.exists() or output_path.stat().st_size == 0:
            raise RuntimeError(
                f"O mecanismo TTS não gerou o arquivo de áudio: {output_path}"
            )

        return output_path


def create_engine(
    voice_id=None,
    rate=160,
    volume=1.0
):
    return TTSEngine(
        voice_id=voice_id,
        rate=rate,
        volume=volume
    )
