document.addEventListener("DOMContentLoaded", () => {
    const STORAGE_KEY = "mnemonicsData";
    let mnemonics = [];

    // Elements
    const tabBtns = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tool-tab-content");
    
    const itemsInput = document.getElementById("items-input");
    const mnemonicType = document.getElementById("mnemonic-type");
    const mnemonicInput = document.getElementById("mnemonic-input");
    const mnemonicTitle = document.getElementById("mnemonic-title");
    const acronymHelper = document.getElementById("acronym-helper");
    const firstLetters = document.getElementById("first-letters");
    const saveMnemonicBtn = document.getElementById("save-mnemonic-btn");
    const clearMnemonicBtn = document.getElementById("clear-mnemonic-btn");
    const saveMsg = document.getElementById("save-message");

    const savedMnemonicsList = document.getElementById("saved-mnemonics-list");
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
                renderSavedMnemonics();
            }
        });
    });

    function loadMnemonics() {
        const saved = localStorage.getItem(STORAGE_KEY);
        mnemonics = saved ? JSON.parse(saved) : [];
        renderSavedMnemonics();
    }

    function saveMnemonics() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mnemonics));
        renderSavedMnemonics();
    }

    function renderSavedMnemonics() {
        savedMnemonicsList.innerHTML = "";
        if (mnemonics.length === 0) {
            savedMnemonicsList.innerHTML = "<p style='color: var(--gray-400);'>No mnemonics saved yet.</p>";
            return;
        }
        mnemonics.forEach((m, index) => {
            const mnemonicDiv = document.createElement("div");
            mnemonicDiv.style.cssText = "margin-bottom: 2rem; padding: 1.5rem; background: rgba(255,255,255,0.05); border-radius: 0.5rem; border: 1px solid rgba(255,255,255,0.1);";
            mnemonicDiv.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                    <div>
                        <h3 style="margin: 0 0 0.5rem 0;">${m.title || "Untitled"}</h3>
                        <span class="tag" style="background: rgba(168, 85, 247, 0.3);">${m.type}</span>
                    </div>
                    <button class="btn-danger delete-mnemonic-btn" data-index="${index}" style="padding: 0.5rem 1rem; font-size: 0.9rem;">Delete</button>
                </div>
                <div style="margin-bottom: 1rem;">
                    <strong style="color: var(--gray-300);">Items to Remember:</strong>
                    <p style="margin-top: 0.5rem; color: var(--gray-400); white-space: pre-wrap;">${m.items}</p>
                </div>
                <div>
                    <strong style="color: var(--gray-300);">Mnemonic:</strong>
                    <p style="margin-top: 0.5rem; color: var(--purple-400); font-size: 1.1rem; white-space: pre-wrap;">${m.mnemonic}</p>
                </div>
            `;
            savedMnemonicsList.appendChild(mnemonicDiv);
        });

        document.querySelectorAll(".delete-mnemonic-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const index = parseInt(btn.getAttribute("data-index"));
                mnemonics.splice(index, 1);
                saveMnemonics();
            });
        });
    }

    function updateAcronymHelper() {
        const items = itemsInput.value.trim();
        if (items && mnemonicType.value === "acronym") {
            const itemList = items.split(/[,\n]/).map(i => i.trim()).filter(i => i);
            if (itemList.length > 0) {
                const letters = itemList.map(item => item.charAt(0).toUpperCase()).join("");
                firstLetters.textContent = letters;
                acronymHelper.style.display = "block";
            } else {
                acronymHelper.style.display = "none";
            }
        } else {
            acronymHelper.style.display = "none";
        }
    }

    itemsInput.addEventListener("input", updateAcronymHelper);
    mnemonicType.addEventListener("change", () => {
        updateAcronymHelper();
        if (mnemonicType.value !== "acronym") {
            acronymHelper.style.display = "none";
        }
    });

    saveMnemonicBtn.addEventListener("click", () => {
        const items = itemsInput.value.trim();
        const mnemonic = mnemonicInput.value.trim();
        const type = mnemonicType.value;
        const title = mnemonicTitle.value.trim();
        
        if (items && mnemonic) {
            mnemonics.push({
                id: Date.now(),
                title: title || "Untitled Mnemonic",
                items: items,
                mnemonic: mnemonic,
                type: type,
                date: new Date().toISOString()
            });
            saveMnemonics();
            clearInputs();
            saveMsg.style.display = "block";
            setTimeout(() => {
                saveMsg.style.display = "none";
            }, 2000);
        } else {
            alert("Please enter items to remember and create a mnemonic!");
        }
    });

    clearMnemonicBtn.addEventListener("click", () => {
        if (confirm("Clear all inputs?")) {
            clearInputs();
        }
    });

    function clearInputs() {
        itemsInput.value = "";
        mnemonicInput.value = "";
        mnemonicTitle.value = "";
        mnemonicType.value = "acronym";
        acronymHelper.style.display = "none";
    }

    deleteAllBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to delete all mnemonics? This cannot be undone.")) {
            mnemonics = [];
            saveMnemonics();
        }
    });

    loadMnemonics();
});

