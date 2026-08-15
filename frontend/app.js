const homeScreen = document.getElementById("home-screen");
const collectionScreen = document.getElementById("collection-screen");

const collectionsList = document.getElementById("collections-list");
const segmentsContainer = document.getElementById("segments-container");

const newCollectionButton = document.getElementById("new-collection-button");
const addSegmentButton = document.getElementById("add-segment-button");
const finishButton = document.getElementById("finish-button");
const backButton = document.getElementById("back-button");

const collectionTitle = document.getElementById("collection-title");

let currentCollection = null;
let collections = [];


function showHomeScreen() {
    collectionScreen.classList.add("hidden");
    homeScreen.classList.remove("hidden");

    renderCollections();
}


function showCollectionScreen() {
    homeScreen.classList.add("hidden");
    collectionScreen.classList.remove("hidden");
}


function createNewCollection() {
    const name = prompt("Nome da coleção:");

    if (!name || !name.trim()) {
        return;
    }

    currentCollection = {
        id: Date.now(),
        name: name.trim(),
        segments: []
    };

    collectionTitle.textContent = currentCollection.name;

    segmentsContainer.innerHTML = "";

    addSegment();

    showCollectionScreen();
}


function addSegment() {
    if (!currentCollection) {
        return;
    }

    const segmentIndex = currentCollection.segments.length;

    currentCollection.segments.push("");

    const segment = document.createElement("div");
    segment.className = "segment";

    const label = document.createElement("label");
    label.textContent = `Trecho ${segmentIndex + 1}`;

    const textarea = document.createElement("textarea");
    textarea.placeholder = "Digite ou cole o texto deste trecho...";

    textarea.addEventListener("input", () => {
        currentCollection.segments[segmentIndex] = textarea.value;
    });

    segment.appendChild(label);
    segment.appendChild(textarea);

    segmentsContainer.appendChild(segment);

    textarea.focus();
}


function finishCollection() {
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
        "Concluir esta coleção?"
    );

    if (!confirmed) {
        return;
    }

    collections.push(currentCollection);

    currentCollection = null;

    alert("Coleção criada com sucesso.");

    showHomeScreen();
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

        item.textContent = collection.name;

        item.addEventListener("click", () => {
            openCollection(collection);
        });

        collectionsList.appendChild(item);
    });
}


function openCollection(collection) {
    currentCollection = collection;

    collectionTitle.textContent = collection.name;

    segmentsContainer.innerHTML = "";

    collection.segments.forEach((text, index) => {
        const segment = document.createElement("div");

        segment.className = "segment";

        const label = document.createElement("label");

        label.textContent = `Trecho ${index + 1}`;

        const textarea = document.createElement("textarea");

        textarea.value = text;

        textarea.placeholder =
            "Digite ou cole o texto deste trecho...";

        textarea.addEventListener("input", () => {
            currentCollection.segments[index] = textarea.value;
        });

        segment.appendChild(label);
        segment.appendChild(textarea);

        segmentsContainer.appendChild(segment);
    });

    showCollectionScreen();
}


newCollectionButton.addEventListener(
    "click",
    createNewCollection
);


addSegmentButton.addEventListener(
    "click",
    addSegment
);


finishButton.addEventListener(
    "click",
    finishCollection
);


backButton.addEventListener(
    "click",
    () => {
        currentCollection = null;
        showHomeScreen();
    }
);


renderCollections();