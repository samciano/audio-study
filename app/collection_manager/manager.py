import json
from pathlib import Path
from datetime import datetime


BASE_DIR = Path(__file__).resolve().parent.parent.parent
COLLECTIONS_DIR = BASE_DIR / "data" / "collections"

COLLECTIONS_DIR.mkdir(
    parents=True,
    exist_ok=True
)


def _get_collection_path(collection_id):
    return COLLECTIONS_DIR / f"{collection_id}.json"


def _generate_collection_id():
    return datetime.now().strftime("%Y%m%d%H%M%S%f")


def create_collection(name, segments=None):
    if segments is None:
        segments = []

    collection_id = _generate_collection_id()

    collection = {
        "id": collection_id,
        "name": name.strip(),
        "segments": segments
    }

    save_collection(collection)

    return collection


def save_collection(collection):
    collection_id = collection.get("id")

    if not collection_id:
        raise ValueError("A coleção precisa possuir um ID.")

    file_path = _get_collection_path(collection_id)

    with open(
        file_path,
        "w",
        encoding="utf-8"
    ) as file:
        json.dump(
            collection,
            file,
            ensure_ascii=False,
            indent=4
        )


def get_collection(collection_id):
    file_path = _get_collection_path(collection_id)

    if not file_path.exists():
        return None

    with open(
        file_path,
        "r",
        encoding="utf-8"
    ) as file:
        return json.load(file)


def get_all_collections():
    collections = []

    for file_path in COLLECTIONS_DIR.glob("*.json"):
        try:
            with open(
                file_path,
                "r",
                encoding="utf-8"
            ) as file:
                collection = json.load(file)

            collections.append(collection)

        except (json.JSONDecodeError, OSError):
            continue

    collections.sort(
        key=lambda collection: collection.get("id", ""),
        reverse=True
    )

    return collections


def update_collection(collection_id, name, segments):
    collection = get_collection(collection_id)

    if collection is None:
        return None

    collection["name"] = name.strip()
    collection["segments"] = segments

    save_collection(collection)

    return collection


def delete_collection(collection_id):
    file_path = _get_collection_path(collection_id)

    if not file_path.exists():
        return False

    file_path.unlink()

    return True
