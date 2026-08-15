import pyttsx3
from pathlib import Path


class TTSEngine:
    def __init__(self):
        self.engine = pyttsx3.init()

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
        voices = self.engine.getProperty("voices")

        if voice_id < 0 or voice_id >= len(voices):
            raise ValueError("Voz inválida.")

        self.engine.setProperty(
            "voice",
            voices[voice_id].id
        )

    def set_rate(self, rate=160):
        self.engine.setProperty(
            "rate",
            rate
        )

    def set_volume(self, volume=1.0):
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

        self.engine.save_to_file(
            text,
            str(output_path)
        )

        self.engine.runAndWait()

        return output_path


def create_engine(
    voice_id=None,
    rate=160,
    volume=1.0
):
    engine = TTSEngine()

    engine.set_rate(rate)
    engine.set_volume(volume)

    if voice_id is not None:
        engine.set_voice(voice_id)

    return engine