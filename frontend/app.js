const API_BASE = "/api";

const homeScreen = document.getElementById("home-screen");
const collectionScreen = document.getElementById("collection-screen");

const collectionsList = document.getElementById("collections-list");
const segmentsContainer = document.getElementById("segments-container");

const newCollectionButton = document.getElementById("new-collection-button");
const addSegmentButton = document.getElementById("add-segment-button");
const finishButton = document.getElementById("finish-button");
const backButton = document.getElementById("back-button");

const collectionTitle = document.getElementById("collection-title");
const statusMessage = document.getElementById("status-message");
const audioResult = document.getElementById("audio-result");

let currentCollection = null;
let collections = [];


function showHomeScreen() {
    collectionScreen.classList.add("hidden");
    homeScreen.classList.remove("hidden");

    loadCollections();
}


function showCollectionScreen() {
    homeScreen.classList.add("hidden");
    collectionScreen.classList.remove("hidden");
}


function showStatus(message, isError = false) {
    if (!message) {
        statusMessage.classList.add("hidden");
        statusMessage.textContent = "";
        return;
    }

    statusMessage.textContent = message;
    statusMessage.classList.remove("hidden");
    statusMessage.classList.toggle("status-error", isError);
}


function setControlsDisabled(disabled) {
    addSegmentButton.disabled = disabled;
    finishButton.disabled = disabled;
    backButton.disabled = disabled;

    segmentsContainer
        .querySelectorAll("button, textarea")
        .forEach(element => {
            element.disabled = disabled;
        });
}


async function loadCollections() {
    collectionsList.innerHTML = "<p>Carregando coleções...</p>";

    try {
        const response = await fetch(`${API_BASE}/collections`);

        if (!response.ok) {
            throw new Error("Não foi possível carregar as coleções.");
        }

        collections = await response.json();

        renderCollections();

    } catch (error) {
        collectionsList.innerHTML = "";

        const errorMessage = document.createElement("p");
        errorMessage.textContent = `Erro ao carregar coleções: ${error.message}`;

        collectionsList.appendChild(errorMessage);
    }
}


function renderCollections() {
    collectionsList.innerHTML = "";

    if (collections.length === 0) {
        const emptyMessage = document.createElement("p");

        emptyMessage.textContent = "Nenhuma coleção criada.";

        collectionsList.appendChild(emptyMessage);

        return;
    }

    collections.forEach(collection => {
        const item = document.createElement("div");
        item.className = "collection-item";

        const nameSpan = document.createElement("span");
        nameSpan.className = "collection-item-name";
        nameSpan.textContent = collection.name;

        nameSpan.addEventListener("click", () => {
            openCollection(collection);
        });

        const deleteButton = document.createElement("button");
        deleteButton.className = "collection-delete-button";
        deleteButton.type = "button";
        deleteButton.textContent = "Excluir";

        deleteButton.addEventListener("click", async (event) => {
            event.stopPropagation();
            await deleteCollectionById(collection.id);
        });

        item.appendChild(nameSpan);
        item.appendChild(deleteButton);

        collectionsList.appendChild(item);
    });
}


async function deleteCollectionById(collectionId) {
    const confirmed = confirm(
        "Excluir esta coleção? Essa ação não pode ser desfeita."
    );

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(
            `${API_BASE}/collections/${collectionId}`,
            { method: "DELETE" }
        );

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error || "Não foi possível excluir a coleção.");
        }

        await loadCollections();

    } catch (error) {
        alert(`Erro: ${error.message}`);
    }
}


function createNewCollection() {
    const name = prompt("Nome da coleção:");

    if (!name || !name.trim()) {
        return;
    }

    currentCollection = {
        id: null,
        name: name.trim(),
        segments: [""],
        audio_filename: null
    };

    collectionTitle.textContent = currentCollection.name;

    showStatus(null);
    renderAudioResult();
    renderSegments();

    showCollectionScreen();
}


function openCollection(collection) {
    currentCollection = {
        id: collection.id,
        name: collection.name,
        segments: collection.segments && collection.segments.length
            ? [...collection.segments]
            : [""],
        audio_filename: collection.audio_filename || null
    };

    collectionTitle.textContent = currentCollection.name;

    showStatus(null);
    renderAudioResult();
    renderSegments();

    showCollectionScreen();
}


function renderAudioResult() {
    audioResult.innerHTML = "";

    if (!currentCollection || !currentCollection.audio_filename) {
        audioResult.classList.add("hidden");
        return;
    }

    const label = document.createElement("p");
    label.textContent = "Áudio gerado:";

    const audio = document.createElement("audio");
    audio.controls = true;
    audio.src = `${API_BASE}/audio/${currentCollection.audio_filename}`;

    audioResult.appendChild(label);
    audioResult.appendChild(audio);
    audioResult.classList.remove("hidden");
}


function renderSegments() {
    segmentsContainer.innerHTML = "";

    currentCollection.segments.forEach((text, index) => {
        segmentsContainer.appendChild(buildSegmentElement(text, index));
    });
}


function buildSegmentElement(text, index) {
    const segment = document.createElement("div");
    segment.className = "segment";

    const headerRow = document.createElement("div");
    headerRow.className = "segment-header";

    const label = document.createElement("label");
    label.textContent = `Trecho ${index + 1}`;

    const actions = document.createElement("div");
    actions.className = "segment-actions";

    const upButton = document.createElement("button");
    upButton.type = "button";
    upButton.textContent = "▲";
    upButton.title = "Mover para cima";
    upButton.disabled = index === 0;
    upButton.addEventListener("click", () => moveSegment(index, -1));

    const downButton = document.createElement("button");
    downButton.type = "button";
    downButton.textContent = "▼";
    downButton.title = "Mover para baixo";
    downButton.disabled = index === currentCollection.segments.length - 1;
    downButton.addEventListener("click", () => moveSegment(index, 1));

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "Excluir";
    deleteButton.title = "Excluir trecho";
    deleteButton.addEventListener("click", () => deleteSegment(index));

    actions.appendChild(upButton);
    actions.appendChild(downButton);
    actions.appendChild(deleteButton);

    headerRow.appendChild(label);
    headerRow.appendChild(actions);

    const textarea = document.createElement("textarea");
    textarea.placeholder = "Digite ou cole o texto deste trecho...";
    textarea.value = text;

    textarea.addEventListener("input", () => {
        currentCollection.segments[index] = textarea.value;
    });

    segment.appendChild(headerRow);
    segment.appendChild(textarea);

    return segment;
}


function addSegment() {
    if (!currentCollection) {
        return;
    }

    currentCollection.segments.push("");

    renderSegments();

    const textareas = segmentsContainer.querySelectorAll("textarea");
    const lastTextarea = textareas[textareas.length - 1];

    if (lastTextarea) {
        lastTextarea.focus();
    }
}


function deleteSegment(index) {
    if (!currentCollection) {
        return;
    }

    if (currentCollection.segments.length <= 1) {
        alert("A coleção precisa ter pelo menos um trecho.");
        return;
    }

    const confirmed = confirm("Excluir este trecho?");

    if (!confirmed) {
        return;
    }

    currentCollection.segments.splice(index, 1);

    renderSegments();
}


function moveSegment(index, direction) {
    if (!currentCollection) {
        return;
    }

    const newIndex = index + direction;

    if (newIndex < 0 || newIndex >= currentCollection.segments.length) {
        return;
    }

    const segments = currentCollection.segments;

    [segments[index], segments[newIndex]] = [segments[newIndex], segments[index]];

    renderSegments();
}


async function finishCollection() {
    if (!currentCollection) {
        return;
    }

    const hasText = currentCollection.segments.some(
        segment => segment.trim().length > 0
    );

    if (!hasText) {
        alert("Adicione pelo menos um trecho antes de concluir.");
        return;
    }

    const confirmed = confirm(
        "Concluir esta coleção? O áudio será gerado a partir dos trechos."
    );

    if (!confirmed) {
        return;
    }

    setControlsDisabled(true);
    showStatus("Salvando coleção...");

    try {
        const payload = {
            name: currentCollection.name,
            segments: currentCollection.segments
        };

        let response;

        if (currentCollection.id) {
            response = await fetch(`${API_BASE}/collections/${currentCollection.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
        } else {
            response = await fetch(`${API_BASE}/collections`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
        }

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error || "Não foi possível salvar a coleção.");
        }

        const savedCollection = await response.json();

        currentCollection.id = savedCollection.id;

        showStatus("Gerando áudio, isso pode levar um tempo...");

        const generateResponse = await fetch(
            `${API_BASE}/collections/${currentCollection.id}/generate`,
            { method: "POST" }
        );

        const generateData = await generateResponse.json().catch(() => ({}));

        if (!generateResponse.ok) {
            throw new Error(generateData.error || "Não foi possível gerar o áudio.");
        }

        currentCollection.audio_filename = generateData.filename;

        showStatus("Áudio gerado com sucesso.");
        renderAudioResult();

    } catch (error) {
        showStatus(`Erro: ${error.message}`, true);

    } finally {
        setControlsDisabled(false);
    }
}


newCollectionButton.addEventListener("click", createNewCollection);
addSegmentButton.addEventListener("click", addSegment);
finishButton.addEventListener("click", finishCollection);

backButton.addEventListener("click", () => {
    currentCollection = null;
    showHomeScreen();
});


loadCollections();
