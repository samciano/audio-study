from pathlib import Path

from pydub import AudioSegment


def merge_audio_files(
    audio_files,
    output_path,
    pause_duration=1500
):
    if not audio_files:
        raise ValueError("Nenhum arquivo de áudio foi fornecido.")

    output_path = Path(output_path)

    output_path.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    final_audio = AudioSegment.empty()

    pause = AudioSegment.silent(
        duration=pause_duration
    )

    for file_path in audio_files:
        file_path = Path(file_path)

        if not file_path.exists():
            raise FileNotFoundError(
                f"Arquivo não encontrado: {file_path}"
            )

        audio = AudioSegment.from_file(
            file_path
        )

        final_audio += audio
        final_audio += pause

    final_audio.export(
        output_path,
        format="mp3"
    )

    return output_path
