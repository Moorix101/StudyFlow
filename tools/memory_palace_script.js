document.addEventListener("DOMContentLoaded", () => {
    const STORAGE_KEY = "memoryPalaces";
    let palaces = [];
    let currentPalace = {
        name: "",
        locations: []
    };
    let currentPractice = null;
    let currentLocationIndex = 0;

    // Elements
    const tabBtns = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tool-tab-content");
    
    const palaceNameInput = document.getElementById("palace-name-input");
    const locationInput = document.getElementById("location-input");
    const addLocationBtn = document.getElementById("add-location-btn");
    const locationsList = document.getElementById("locations-list");
    const locationSelect = document.getElementById("location-select");
    const itemInput = document.getElementById("item-input");
    const placeItemBtn = document.getElementById("place-item-btn");
    const palaceRoute = document.getElementById("palace-visualization");
    const savePalaceBtn = document.getElementById("save-palace-btn");
    const clearPalaceBtn = document.getElementById("clear-palace-btn");
    const saveMsg = document.getElementById("save-message");

    const practiceStart = document.getElementById("practice-start");
    const startPracticeBtn = document.getElementById("start-practice-btn");
    const practiceSession = document.getElementById("practice-session");
    const practiceComplete = document.getElementById("practice-complete");
    const practiceStats = document.getElementById("practice-stats");
    const currentLocation = document.getElementById("current-location");
    const practiceInstruction = document.getElementById("practice-instruction");
    const practiceAnswer = document.getElementById("practice-answer");
    const checkAnswerBtn = document.getElementById("check-answer-btn");
    const nextLocationBtn = document.getElementById("next-location-btn");
    const practiceSummary = document.getElementById("practice-summary");
    const restartWalkBtn = document.getElementById("restart-walk-btn");

    const savedPalacesList = document.getElementById("saved-palaces-list");
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
                renderSavedPalaces();
            }
        });
    });

    function loadPalaces() {
        const saved = localStorage.getItem(STORAGE_KEY);
        palaces = saved ? JSON.parse(saved) : [];
        renderSavedPalaces();
    }

    function savePalaces() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(palaces));
        renderSavedPalaces();
    }

    function renderLocations() {
        locationsList.innerHTML = "";
        locationSelect.innerHTML = '<option value="">Select a location...</option>';
        
        if (currentPalace.locations.length === 0) {
            locationsList.innerHTML = "<p style='color: var(--gray-400);'>No locations added yet. Add locations to create your route.</p>";
            return;
        }

        currentPalace.locations.forEach((location, index) => {
            locationSelect.innerHTML += `<option value="${index}">${location.name}</option>`;
            
            const locDiv = document.createElement("div");
            locDiv.style.cssText = "display: flex; justify-content: space-between; align-items: start; padding: 1rem; margin-bottom: 0.5rem; background: rgba(255,255,255,0.05); border-radius: 0.5rem; border: 1px solid rgba(255,255,255,0.1);";
            locDiv.innerHTML = `
                <div style="flex: 1;">
                    <strong style="color: var(--gray-300);">${index + 1}. ${location.name}</strong>
                    ${location.items.length > 0 ? `
                        <p style="margin: 0.5rem 0 0 0; color: var(--gray-400);">Items: ${location.items.join(", ")}</p>
                    ` : '<p style="margin: 0.5rem 0 0 0; color: var(--gray-400);">No items placed yet</p>'}
                </div>
                <button class="btn-danger delete-location-btn" data-index="${index}" style="padding: 0.5rem 1rem; font-size: 0.9rem; margin-left: 1rem;">Delete</button>
            `;
            locationsList.appendChild(locDiv);
        });

        document.querySelectorAll(".delete-location-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const index = parseInt(btn.getAttribute("data-index"));
                currentPalace.locations.splice(index, 1);
                renderLocations();
                renderPalaceRoute();
            });
        });
    }

    function renderPalaceRoute() {
        palaceRoute.querySelector("#palace-route").innerHTML = "";
        if (currentPalace.locations.length === 0) {
            palaceRoute.querySelector("#palace-route").innerHTML = "<p style='color: var(--gray-400);'>Add locations to visualize your route.</p>";
            return;
        }
        
        let routeHTML = "<div style='display: flex; flex-direction: column; gap: 1rem;'>";
        currentPalace.locations.forEach((location, index) => {
            routeHTML += `
                <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; background: rgba(255,255,255,0.03); border-radius: 0.5rem;">
                    <div style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, var(--purple-500), var(--pink-500)); display: flex; align-items: center; justify-content: center; font-weight: 600; flex-shrink: 0;">${index + 1}</div>
                    <div style="flex: 1;">
                        <strong style="color: var(--gray-300);">${location.name}</strong>
                        ${location.items.length > 0 ? `<p style="margin: 0.25rem 0 0 0; color: var(--gray-400); font-size: 0.9rem;">${location.items.join(" → ")}</p>` : ''}
                    </div>
                    ${index < currentPalace.locations.length - 1 ? '<div style="color: var(--gray-500);">↓</div>' : ''}
                </div>
            `;
        });
        routeHTML += "</div>";
        palaceRoute.querySelector("#palace-route").innerHTML = routeHTML;
    }

    function renderSavedPalaces() {
        savedPalacesList.innerHTML = "";
        if (palaces.length === 0) {
            savedPalacesList.innerHTML = "<p style='color: var(--gray-400);'>No palaces saved yet.</p>";
            return;
        }
        palaces.forEach((palace, index) => {
            const palaceDiv = document.createElement("div");
            palaceDiv.style.cssText = "margin-bottom: 2rem; padding: 1.5rem; background: rgba(255,255,255,0.05); border-radius: 0.5rem; border: 1px solid rgba(255,255,255,0.1);";
            palaceDiv.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                    <h3 style="margin: 0;">${palace.name}</h3>
                    <button class="btn-danger delete-palace-btn" data-index="${index}" style="padding: 0.5rem 1rem; font-size: 0.9rem;">Delete</button>
                </div>
                <div>
                    ${palace.locations.map((loc, locIndex) => `
                        <div style="padding: 1rem; margin-bottom: 0.5rem; background: rgba(255,255,255,0.03); border-radius: 0.25rem;">
                            <strong style="color: var(--gray-300);">${locIndex + 1}. ${loc.name}</strong>
                            ${loc.items.length > 0 ? `<p style="margin: 0.5rem 0 0 0; color: var(--gray-400);">${loc.items.join(", ")}</p>` : '<p style="margin: 0.5rem 0 0 0; color: var(--gray-400);">No items</p>'}
                        </div>
                    `).join('')}
                </div>
            `;
            savedPalacesList.appendChild(palaceDiv);
        });

        document.querySelectorAll(".delete-palace-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const index = parseInt(btn.getAttribute("data-index"));
                palaces.splice(index, 1);
                savePalaces();
            });
        });
    }

    addLocationBtn.addEventListener("click", () => {
        const locationName = locationInput.value.trim();
        if (locationName) {
            currentPalace.locations.push({
                name: locationName,
                items: []
            });
            locationInput.value = "";
            renderLocations();
            renderPalaceRoute();
        } else {
            alert("Please enter a location name!");
        }
    });

    placeItemBtn.addEventListener("click", () => {
        const locationIndex = parseInt(locationSelect.value);
        const item = itemInput.value.trim();
        if (locationIndex >= 0 && locationIndex < currentPalace.locations.length && item) {
            currentPalace.locations[locationIndex].items.push(item);
            itemInput.value = "";
            renderLocations();
            renderPalaceRoute();
        } else {
            alert("Please select a location and enter an item!");
        }
    });

    savePalaceBtn.addEventListener("click", () => {
        const name = palaceNameInput.value.trim();
        if (!name) {
            alert("Please enter a palace name!");
            return;
        }
        if (currentPalace.locations.length === 0) {
            alert("Add at least one location!");
            return;
        }
        palaces.push({
            id: Date.now(),
            name: name,
            locations: currentPalace.locations.map(loc => ({
                name: loc.name,
                items: [...loc.items]
            })),
            date: new Date().toISOString()
        });
        savePalaces();
        clearPalace();
        saveMsg.style.display = "block";
        setTimeout(() => {
            saveMsg.style.display = "none";
        }, 2000);
    });

    clearPalaceBtn.addEventListener("click", () => {
        if (confirm("Clear current palace? This cannot be undone.")) {
            clearPalace();
        }
    });

    function clearPalace() {
        currentPalace = {
            name: "",
            locations: []
        };
        palaceNameInput.value = "";
        locationInput.value = "";
        itemInput.value = "";
        renderLocations();
        renderPalaceRoute();
    }

    startPracticeBtn.addEventListener("click", () => {
        if (palaces.length === 0) {
            alert("Save a palace first!");
            return;
        }
        const randomPalace = palaces[Math.floor(Math.random() * palaces.length)];
        currentPractice = randomPalace;
        currentLocationIndex = 0;
        practiceStart.style.display = "none";
        practiceSession.style.display = "block";
        practiceComplete.style.display = "none";
        showCurrentLocation();
    });

    function showCurrentLocation() {
        if (currentLocationIndex >= currentPractice.locations.length) {
            completeWalk();
            return;
        }
        const location = currentPractice.locations[currentLocationIndex];
        currentLocation.textContent = location.name;
        practiceInstruction.textContent = "What item(s) did you place at this location?";
        practiceAnswer.value = "";
        practiceStats.textContent = `Location ${currentLocationIndex + 1} of ${currentPractice.locations.length}`;
        checkAnswerBtn.style.display = "inline-block";
        nextLocationBtn.style.display = "none";
    }

    function completeWalk() {
        practiceSession.style.display = "none";
        practiceComplete.style.display = "block";
        practiceSummary.textContent = `You've completed walking through "${currentPractice.name}"! Great job practicing your memory palace.`;
    }

    checkAnswerBtn.addEventListener("click", () => {
        const location = currentPractice.locations[currentLocationIndex];
        const userAnswer = practiceAnswer.value.trim().toLowerCase();
        const correctItems = location.items.map(i => i.toLowerCase());
        const isCorrect = location.items.length > 0 && correctItems.some(item => userAnswer.includes(item));
        
        practiceInstruction.innerHTML = `
            <div>
                <p style="margin-bottom: 0.5rem;"><strong>Your Answer:</strong> ${practiceAnswer.value || "(empty)"}</p>
                <p style="margin-bottom: 0.5rem; color: ${isCorrect ? 'var(--green-400)' : 'var(--red-400)'};">
                    ${isCorrect ? '✓ Correct!' : '✗ Not quite'}
                </p>
                <p><strong>Correct Answer:</strong> ${location.items.length > 0 ? location.items.join(", ") : "No items placed"}</p>
            </div>
        `;
        checkAnswerBtn.style.display = "none";
        nextLocationBtn.style.display = "inline-block";
    });

    nextLocationBtn.addEventListener("click", () => {
        currentLocationIndex++;
        showCurrentLocation();
    });

    restartWalkBtn.addEventListener("click", () => {
        practiceStart.style.display = "block";
        practiceSession.style.display = "none";
        practiceComplete.style.display = "none";
    });

    deleteAllBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to delete all palaces? This cannot be undone.")) {
            palaces = [];
            savePalaces();
        }
    });

    loadPalaces();
    renderLocations();
    renderPalaceRoute();
});

