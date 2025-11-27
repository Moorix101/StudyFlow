document.addEventListener("DOMContentLoaded", () => {
    const STORAGE_KEY = "dualCodingItems";
    let items = [];

    // Elements
    const tabBtns = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tool-tab-content");
    
    const verbalInput = document.getElementById("verbal-input");
    const visualInput = document.getElementById("visual-input");
    const topicInput = document.getElementById("topic-input");
    const connectionInput = document.getElementById("connection-input");
    const saveItemBtn = document.getElementById("save-item-btn");
    const clearBtn = document.getElementById("clear-btn");
    const saveMsg = document.getElementById("save-message");

    const savedItemsList = document.getElementById("saved-items-list");
    const deleteAllBtn = document.getElementById("delete-all-btn");

    // Tab switching
    tabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const targetTab = btn.getAttribute("data-tab");
            tabBtns.forEach(b => b.classList.remove("active"));
            tabContents.forEach(c => c.classList.remove("active"));
            btn.classList.add("active");
            document.getElementById(targetTab).classList.add("active");
            if (targetTab === "saved") {
                renderSavedItems();
            }
        });
    });

    function loadItems() {
        const saved = localStorage.getItem(STORAGE_KEY);
        items = saved ? JSON.parse(saved) : [];
        renderSavedItems();
    }

    function saveItems() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        renderSavedItems();
    }

    function renderSavedItems() {
        savedItemsList.innerHTML = "";
        if (items.length === 0) {
            savedItemsList.innerHTML = "<p style='color: var(--gray-400);'>No items saved yet.</p>";
            return;
        }
        items.forEach((item, index) => {
            const itemDiv = document.createElement("div");
            itemDiv.style.cssText = "margin-bottom: 2rem; padding: 1.5rem; background: rgba(255,255,255,0.05); border-radius: 0.5rem; border: 1px solid rgba(255,255,255,0.1);";
            itemDiv.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                    <h3 style="margin: 0;">${item.topic || "Untitled"}</h3>
                    <button class="btn-danger delete-item-btn" data-index="${index}" style="padding: 0.5rem 1rem; font-size: 0.9rem;">Delete</button>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1rem;">
                    <div>
                        <strong style="color: var(--gray-300);">Verbal/Text:</strong>
                        <p style="margin-top: 0.5rem; color: var(--gray-400); white-space: pre-wrap;">${item.verbal}</p>
                    </div>
                    <div>
                        <strong style="color: var(--gray-300);">Visual Description:</strong>
                        <p style="margin-top: 0.5rem; color: var(--gray-400); white-space: pre-wrap;">${item.visual}</p>
                    </div>
                </div>
                ${item.connection ? `
                <div>
                    <strong style="color: var(--gray-300);">Connection:</strong>
                    <p style="margin-top: 0.5rem; color: var(--gray-400); white-space: pre-wrap;">${item.connection}</p>
                </div>
                ` : ''}
            `;
            savedItemsList.appendChild(itemDiv);
        });

        document.querySelectorAll(".delete-item-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const index = parseInt(btn.getAttribute("data-index"));
                items.splice(index, 1);
                saveItems();
            });
        });
    }

    saveItemBtn.addEventListener("click", () => {
        const verbal = verbalInput.value.trim();
        const visual = visualInput.value.trim();
        const topic = topicInput.value.trim();
        const connection = connectionInput.value.trim();
        
        if (verbal || visual) {
            items.push({
                id: Date.now(),
                topic: topic || "Untitled",
                verbal: verbal || "",
                visual: visual || "",
                connection: connection || "",
                date: new Date().toISOString()
            });
            saveItems();
            clearInputs();
            saveMsg.style.display = "block";
            setTimeout(() => {
                saveMsg.style.display = "none";
            }, 2000);
        } else {
            alert("Please enter at least verbal or visual information!");
        }
    });

    clearBtn.addEventListener("click", () => {
        if (confirm("Clear all inputs?")) {
            clearInputs();
        }
    });

    function clearInputs() {
        verbalInput.value = "";
        visualInput.value = "";
        topicInput.value = "";
        connectionInput.value = "";
    }

    deleteAllBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to delete all items? This cannot be undone.")) {
            items = [];
            saveItems();
        }
    });

    loadItems();
});

