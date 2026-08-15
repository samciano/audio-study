from pathlib import Path
import shutil
import re

from flask import Flask, jsonify, request, send_from_directory

from app.collection_manager.manager import (
    create_collection,
    get_collection,
    get_all_collections,
    update_collection,
    delete_collection
)

from app.tts.engine import create_engine

from app.audio.merger import merge_audio_files


BASE_DIR = Path(__file__).resolve().parent.parent

FRONTEND_DIR = BASE_DIR / "frontend"
AUDIO_DIR = BASE_DIR / "data" / "audio"
TEMP_DIR = BASE_DIR / "temp"

AUDIO_DIR.mkdir(parents=True, exist_ok=True)
TEMP_DIR.mkdir(parents=True, exist_ok=True)


app = Flask(
    __name__,
    static_folder=str(FRONTEND_DIR),
    static_url_path=""
)


def safe_filename(name):
    name = name.strip()

    name = re.sub(
        r'[<>:"/\\|?*]',
        "",
        name
    )

    name = re.sub(
        r"\s+",
        " ",
        name
    )

    return name[:100] or "colecao"


@app.route("/")
def index():
    return send_from_directory(
        FRONTEND_DIR,
        "index.html"
    )


@app.route("/api/health")
def health():
    return jsonify({
        "status": "ok"
    })


@app.route("/api/collections", methods=["GET"])
def api_get_collections():
    collections = get_all_collections()

    print(
        f"[API] Carregadas {len(collections)} coleções."
    )

    return jsonify(collections)


@app.route("/api/collections/<collection_id>", methods=["GET"])
def api_get_collection(collection_id):
    collection = get_collection(
        collection_id
    )

    if collection is None:
        return jsonify({
            "error": "Coleção não encontrada."
        }), 404

    return jsonify(collection)


@app.route("/api/collections", methods=["POST"])
def api_create_collection():
    print("[API] POST /api/collections")

    data = request.get_json()

    print("[API] Dados recebidos:", data)

    if not data:
        return jsonify({
            "error": "Dados não fornecidos."
        }), 400

    name = data.get("name")
    segments = data.get("segments", [])

    if not name or not name.strip():
        return jsonify({
            "error": "O nome da coleção é obrigatório."
        }), 400

    if not isinstance(segments, list):
        return jsonify({
            "error": "Os trechos devem ser uma lista."
        }), 400

    try:
        collection = create_collection(
            name=name,
            segments=segments
        )

        print(
            "[API] Coleção criada:",
            collection
        )

        return jsonify(collection), 201

    except Exception as error:
        print(
            "[ERRO] Falha ao criar coleção:",
            error
        )

        return jsonify({
            "error": str(error)
        }), 500


@app.route("/api/collections/<collection_id>", methods=["PUT"])
def api_update_collection(collection_id):
    data = request.get_json()

    if not data:
        return jsonify({
            "error": "Dados não fornecidos."
        }), 400

    name = data.get("name")
    segments = data.get("segments")

    if not name or not name.strip():
        return jsonify({
            "error": "O nome da coleção é obrigatório."
        }), 400

    if not isinstance(segments, list):
        return jsonify({
            "error": "Os trechos devem ser uma lista."
        }), 400

    collection = update_collection(
        collection_id=collection_id,
        name=name,
        segments=segments
    )

    if collection is None:
        return jsonify({
            "error": "Coleção não encontrada."
        }), 404

    return jsonify(collection)


@app.route("/api/collections/<collection_id>", methods=["DELETE"])
def api_delete_collection(collection_id):
    deleted = delete_collection(
        collection_id
    )

    if not deleted:
        return jsonify({
            "error": "Coleção não encontrada."
        }), 404

    return jsonify({
        "message": "Coleção excluída com sucesso."
    })


@app.route(
    "/api/collections/<collection_id>/generate",
    methods=["POST"]
)
def api_generate_audio(collection_id):

    print(
        f"[AUDIO] Iniciando geração: {collection_id}"
    )

    collection = get_collection(
        collection_id
    )

    if collection is None:
        return jsonify({
            "error": "Coleção não encontrada."
        }), 404

    segments = collection.get(
        "segments",
        []
    )

    valid_segments = [
        segment.strip()
        for segment in segments
        if isinstance(segment, str)
        and segment.strip()
    ]

    if not valid_segments:
        return jsonify({
            "error": "A coleção não possui trechos com texto."
        }), 400

    collection_temp_dir = (
        TEMP_DIR / str(collection_id)
    )

    if collection_temp_dir.exists():
        shutil.rmtree(
            collection_temp_dir
        )

    collection_temp_dir.mkdir(
        parents=True,
        exist_ok=True
    )

    audio_files = []

    try:
        print("[AUDIO] Criando mecanismo TTS...")

        engine = create_engine()

        for index, segment in enumerate(
            valid_segments,
            start=1
        ):
            print(
                f"[AUDIO] Gerando trecho {index}..."
            )

            segment_path = (
                collection_temp_dir
                / f"segment_{index:04d}.wav"
            )

            engine.generate_audio(
                text=segment,
                output_path=segment_path
            )

            print(
                f"[AUDIO] Gerado: {segment_path}"
            )

            audio_files.append(
                segment_path
            )

        filename = (
            f"{safe_filename(collection['name'])}.mp3"
        )

        output_path = AUDIO_DIR / filename

        print(
            "[AUDIO] Juntando arquivos..."
        )

        merge_audio_files(
            audio_files=audio_files,
            output_path=output_path,
            pause_duration=1500
        )

        print(
            f"[AUDIO] FINALIZADO: {output_path}"
        )

    except Exception as error:

        print(
            "[ERRO AUDIO]",
            repr(error)
        )

        return jsonify({
            "error": "Não foi possível gerar o áudio.",
            "details": str(error)
        }), 500

    finally:

        if collection_temp_dir.exists():
            shutil.rmtree(
                collection_temp_dir
            )

    return jsonify({
        "message": "Áudio gerado com sucesso.",
        "filename": filename,
        "path": f"/api/audio/{filename}"
    })


@app.route("/api/audio/<filename>")
def api_get_audio(filename):
    return send_from_directory(
        AUDIO_DIR,
        filename
    )


if __name__ == "__main__":
    print()
    print("==============================")
    print("       AUDIO STUDY")
    print("==============================")
    print()
    print(
        f"Diretório do projeto: {BASE_DIR}"
    )
    print(
        f"Coleções: {BASE_DIR / 'data' / 'collections'}"
    )
    print(
        f"Áudios: {AUDIO_DIR}"
    )
    print()

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )