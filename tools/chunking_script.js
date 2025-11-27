document.addEventListener("DOMContentLoaded", () => {
    const STORAGE_KEY = "chunkingData";
    let items = [];
    let chunks = [];
    let savedChunks = [];
    let currentPractice = null;
    let practiceMode = "chunks"; // "chunks" or "items"

    // Elements
    const tabBtns = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tool-tab-content");
    
    const itemInput = document.getElementById("item-input");
    const addItemBtn = document.getElementById("add-item-btn");
    const itemsList = document.getElementById("items-list");
    const chunksContainer = document.getElementById("chunks-container");
    const createChunkBtn = document.getElementById("create-chunk-btn");
    const autoChunkBtn = document.getElementById("auto-chunk-btn");
    const saveChunksBtn = document.getElementById("save-chunks-btn");
    const clearAllBtn = document.getElementById("clear-all-btn");
    const saveMsg = document.getElementById("save-message");

    const practiceStart = document.getElementById("practice-start");
    const startPracticeBtn = document.getElementById("start-practice-btn");
    const practiceSession = document.getElementById("practice-session");
    const practiceInstruction = document.getElementById("practice-instruction");
    const practiceDisplay = document.getElementById("practice-display");
    const showAnswerBtn = document.getElementById("show-answer-btn");
    const nextPracticeBtn = document.getElementById("next-practice-btn");
    const savedChunksList = document.getElementById("saved-chunks-list");

    // Tab switching
    tabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const targetTab = btn.getAttribute("data-tab");
            tabBtns.forEach(b => b.classList.remove("active"));
            tabContents.forEach(c => c.classList.remove("active"));
            btn.classList.add("active");
            document.getElementById(targetTab).classList.add("active");
            if (targetTab === "practice") {
                loadSavedChunks();
            }
        });
    });

    function loadData() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const data = JSON.parse(saved);
            savedChunks = data.savedChunks || [];
        }
        renderItems();
        renderChunks();
        loadSavedChunks();
    }

    function saveData() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            savedChunks: savedChunks
        }));
        loadSavedChunks();
    }

    function renderItems() {
        itemsList.innerHTML = "";
        if (items.length === 0) {
            itemsList.innerHTML = "<p style='color: var(--gray-400);'>No items added yet.</p>";
            return;
        }
        items.forEach((item, index) => {
            const itemDiv = document.createElement("div");
            itemDiv.style.cssText = "display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; margin-bottom: 0.5rem; background: rgba(255,255,255,0.05); border-radius: 0.25rem;";
            itemDiv.innerHTML = `
                <span style="color: var(--gray-300);">${item}</span>
                <button class="btn-danger delete-item-btn" data-index="${index}" style="padding: 0.25rem 0.75rem; font-size: 0.85rem;">Remove</button>
            `;
            itemsList.appendChild(itemDiv);
        });

        document.querySelectorAll(".delete-item-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const index = parseInt(btn.getAttribute("data-index"));
                items.splice(index, 1);
                renderItems();
            });
        });
    }

    function renderChunks() {
        chunksContainer.innerHTML = "";
        if (chunks.length === 0) {
            chunksContainer.innerHTML = "<p style='color: var(--gray-400);'>No chunks created yet. Create chunks to organize your items.</p>";
            return;
        }
        chunks.forEach((chunk, chunkIndex) => {
            const chunkDiv = document.createElement("div");
            chunkDiv.style.cssText = "margin-bottom: 1.5rem; padding: 1.5rem; background: rgba(255,255,255,0.05); border-radius: 0.5rem; border: 1px solid rgba(255,255,255,0.1);";
            chunkDiv.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <input type="text" class="chunk-name-input" value="${chunk.name || `Chunk ${chunkIndex + 1}`}" placeholder="Chunk name..." style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 0.25rem; padding: 0.5rem; color: var(--white); font-size: 1.1rem; font-weight: 600; flex: 1; max-width: 300px;">
                    <button class="btn-danger delete-chunk-btn" data-index="${chunkIndex}" style="padding: 0.5rem 1rem; font-size: 0.9rem;">Delete Chunk</button>
                </div>
                <div class="chunk-items" data-chunk="${chunkIndex}">
                    ${chunk.items.map((item, itemIndex) => `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; margin-bottom: 0.25rem; background: rgba(255,255,255,0.03); border-radius: 0.25rem;">
                            <span style="color: var(--gray-300);">${item}</span>
                            <button class="btn-danger remove-from-chunk-btn" data-chunk="${chunkIndex}" data-item="${itemIndex}" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">Remove</button>
                        </div>
                    `).join('')}
                </div>
                <div style="margin-top: 1rem;">
                    <select class="add-to-chunk-select" data-chunk="${chunkIndex}" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 0.25rem; padding: 0.5rem; color: var(--white);">
                        <option value="">Add item to this chunk...</option>
                        ${items.filter(item => !chunk.items.includes(item)).map(item => `<option value="${item}">${item}</option>`).join('')}
                    </select>
                </div>
            `;
            chunksContainer.appendChild(chunkDiv);
        });

        document.querySelectorAll(".chunk-name-input").forEach(input => {
            input.addEventListener("change", (e) => {
                const chunkIndex = parseInt(e.target.closest('[data-chunk]')?.getAttribute('data-chunk') || e.target.closest('.chunk-items')?.getAttribute('data-chunk') || 0);
                chunks[chunkIndex].name = e.target.value;
            });
        });

        document.querySelectorAll(".delete-chunk-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const index = parseInt(btn.getAttribute("data-index"));
                chunks.splice(index, 1);
                renderChunks();
            });
        });

        document.querySelectorAll(".remove-from-chunk-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const chunkIndex = parseInt(btn.getAttribute("data-chunk"));
                const itemIndex = parseInt(btn.getAttribute("data-item"));
                chunks[chunkIndex].items.splice(itemIndex, 1);
                renderChunks();
            });
        });

        document.querySelectorAll(".add-to-chunk-select").forEach(select => {
            select.addEventListener("change", (e) => {
                if (e.target.value) {
                    const chunkIndex = parseInt(e.target.getAttribute("data-chunk"));
                    chunks[chunkIndex].items.push(e.target.value);
                    items = items.filter(item => item !== e.target.value);
                    e.target.value = "";
                    renderItems();
                    renderChunks();
                }
            });
        });
    }

    function loadSavedChunks() {
        savedChunksList.innerHTML = "";
        if (savedChunks.length === 0) {
            savedChunksList.innerHTML = "<p style='color: var(--gray-400);'>No saved chunks. Create and save chunks in the Organize tab.</p>";
            return;
        }
        savedChunks.forEach((saved, index) => {
            const savedDiv = document.createElement("div");
            savedDiv.style.cssText = "margin-bottom: 1.5rem; padding: 1.5rem; background: rgba(255,255,255,0.05); border-radius: 0.5rem; border: 1px solid rgba(255,255,255,0.1);";
            savedDiv.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                    <h3 style="margin: 0;">${saved.name || "Untitled"}</h3>
                    <button class="btn-danger delete-saved-btn" data-index="${index}" style="padding: 0.5rem 1rem; font-size: 0.9rem;">Delete</button>
                </div>
                <div>
                    ${saved.chunks.map(chunk => `
                        <div style="margin-bottom: 1rem; padding: 1rem; background: rgba(255,255,255,0.03); border-radius: 0.25rem;">
                            <strong style="color: var(--gray-300);">${chunk.name}:</strong>
                            <p style="margin: 0.5rem 0 0 0; color: var(--gray-400);">${chunk.items.join(", ")}</p>
                        </div>
                    `).join('')}
                </div>
            `;
            savedChunksList.appendChild(savedDiv);
        });

        document.querySelectorAll(".delete-saved-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const index = parseInt(btn.getAttribute("data-index"));
                savedChunks.splice(index, 1);
                saveData();
            });
        });
    }

    addItemBtn.addEventListener("click", () => {
        const item = itemInput.value.trim();
        if (item) {
            items.push(item);
            itemInput.value = "";
            renderItems();
            renderChunks();
        }
    });

    itemInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            addItemBtn.click();
        }
    });

    createChunkBtn.addEventListener("click", () => {
        chunks.push({
            name: `Chunk ${chunks.length + 1}`,
            items: []
        });
        renderChunks();
    });

    autoChunkBtn.addEventListener("click", () => {
        if (items.length === 0) {
            alert("Add items first!");
            return;
        }
        const chunkSize = 4; // Default to 4 items per chunk
        chunks = [];
        for (let i = 0; i < items.length; i += chunkSize) {
            chunks.push({
                name: `Chunk ${chunks.length + 1}`,
                items: items.slice(i, i + chunkSize)
            });
        }
        items = [];
        renderItems();
        renderChunks();
    });

    saveChunksBtn.addEventListener("click", () => {
        if (chunks.length === 0) {
            alert("Create chunks first!");
            return;
        }
        const name = prompt("Enter a name for this chunk set:", "Chunk Set " + (savedChunks.length + 1));
        if (name) {
            savedChunks.push({
                name: name,
                chunks: chunks.map(chunk => ({
                    name: chunk.name,
                    items: [...chunk.items]
                }))
            });
            saveData();
            saveMsg.style.display = "block";
            setTimeout(() => {
                saveMsg.style.display = "none";
            }, 2000);
        }
    });

    clearAllBtn.addEventListener("click", () => {
        if (confirm("Clear all items and chunks? This cannot be undone.")) {
            items = [];
            chunks = [];
            renderItems();
            renderChunks();
        }
    });

    startPracticeBtn.addEventListener("click", () => {
        if (savedChunks.length === 0) {
            alert("Save some chunks first!");
            return;
        }
        const randomSet = savedChunks[Math.floor(Math.random() * savedChunks.length)];
        currentPractice = randomSet;
        practiceMode = "chunks";
        practiceStart.style.display = "none";
        practiceSession.style.display = "block";
        startPractice();
    });

    function startPractice() {
        if (practiceMode === "chunks") {
            practiceInstruction.textContent = "Recall the names of all chunks:";
            practiceDisplay.innerHTML = "<textarea id='practice-answer' class='tool-textarea' placeholder='Type the chunk names here...' style='min-height: 150px;'></textarea>";
            showAnswerBtn.style.display = "block";
            nextPracticeBtn.textContent = "Check Answer";
        } else {
            const randomChunk = currentPractice.chunks[Math.floor(Math.random() * currentPractice.chunks.length)];
            practiceInstruction.textContent = `Recall all items in the chunk: "${randomChunk.name}"`;
            practiceDisplay.innerHTML = "<textarea id='practice-answer' class='tool-textarea' placeholder='Type the items here...' style='min-height: 150px;'></textarea>";
            showAnswerBtn.style.display = "block";
            nextPracticeBtn.textContent = "Check Answer";
        }
    }

    showAnswerBtn.addEventListener("click", () => {
        if (practiceMode === "chunks") {
            const answer = currentPractice.chunks.map(c => c.name).join(", ");
            practiceDisplay.innerHTML = `
                <div>
                    <p style="color: var(--gray-300); margin-bottom: 0.5rem;"><strong>Your Answer:</strong></p>
                    <p style="color: var(--gray-400); margin-bottom: 1rem; white-space: pre-wrap;">${document.getElementById("practice-answer")?.value || "(empty)"}</p>
                    <p style="color: var(--gray-300); margin-bottom: 0.5rem;"><strong>Correct Answer:</strong></p>
                    <p style="color: var(--green-400);">${answer}</p>
                </div>
            `;
        } else {
            const chunk = currentPractice.chunks.find(c => practiceInstruction.textContent.includes(c.name));
            if (chunk) {
                const answer = chunk.items.join(", ");
                practiceDisplay.innerHTML = `
                    <div>
                        <p style="color: var(--gray-300); margin-bottom: 0.5rem;"><strong>Your Answer:</strong></p>
                        <p style="color: var(--gray-400); margin-bottom: 1rem; white-space: pre-wrap;">${document.getElementById("practice-answer")?.value || "(empty)"}</p>
                        <p style="color: var(--gray-300); margin-bottom: 0.5rem;"><strong>Correct Answer:</strong></p>
                        <p style="color: var(--green-400);">${answer}</p>
                    </div>
                `;
            }
        }
        showAnswerBtn.style.display = "none";
        nextPracticeBtn.textContent = "Next Practice";
    });

    nextPracticeBtn.addEventListener("click", () => {
        if (nextPracticeBtn.textContent === "Check Answer") {
            showAnswerBtn.click();
        } else {
            if (practiceMode === "chunks") {
                practiceMode = "items";
            } else {
                practiceMode = "chunks";
            }
            startPractice();
        }
    });

    loadData();
});

