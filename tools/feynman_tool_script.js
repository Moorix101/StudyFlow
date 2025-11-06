document.addEventListener("DOMContentLoaded", () => {
    const saveBtn = document.getElementById("save");
    const clearBtn = document.getElementById("clear");
    const textArea = document.getElementById("feynman-text");
    const saveMsg = document.getElementById("save-message");

    const storageKey = "feynmanToolText";

    // 1. Load saved text on page load
    const savedText = localStorage.getItem(storageKey);
    if (savedText) {
        textArea.value = savedText;
    }

    // 2. Save text to localStorage
    saveBtn.addEventListener("click", () => {
        const textToSave = textArea.value;
        localStorage.setItem(storageKey, textToSave);

        // Show "Saved!" message
        saveMsg.style.opacity = "1";
        setTimeout(() => {
            saveMsg.style.opacity = "0";
        }, 2000); // Hide after 2 seconds
    });

    // 3. Clear text from textarea and localStorage
    clearBtn.addEventListener("click", () => {
        textArea.value = "";
        localStorage.removeItem(storageKey);

        // Show "Cleared!" message
        saveMsg.textContent = "Cleared!";
        saveMsg.style.opacity = "1";
        setTimeout(() => {
            saveMsg.style.opacity = "0";
            saveMsg.textContent = "Saved!"; // Reset text for next time
        }, 2000);
    });
});