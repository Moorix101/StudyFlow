document.addEventListener("DOMContentLoaded", () => {
    const STORAGE_KEY = "blurtingSessions";
    let sessions = [];

    // Elements
    const tabBtns = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tool-tab-content");
    
    const blurtTextarea = document.getElementById("blurt-textarea");
    const saveBlurtBtn = document.getElementById("save-blurt-btn");
    const clearBlurtBtn = document.getElementById("clear-blurt-btn");
    const saveMsg = document.getElementById("save-message");
    const timerDisplay = document.getElementById("timer-display");
    const timer = document.getElementById("timer");
    const startTimerBtn = document.getElementById("start-timer-btn");

    const blurtDisplay = document.getElementById("blurt-display");
    const notesTextarea = document.getElementById("notes-textarea");
    const gapsTextarea = document.getElementById("gaps-textarea");
    const saveGapsBtn = document.getElementById("save-gaps-btn");

    const savedBlurtsList = document.getElementById("saved-blurts-list");
    const deleteAllBtn = document.getElementById("delete-all-btn");

    let timerInterval = null;
    let timeLeft = 15 * 60; // 15 minutes in seconds
    let currentBlurt = null;

    // Tab switching
    tabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const targetTab = btn.getAttribute("data-tab");
            tabBtns.forEach(b => b.classList.remove("active"));
            tabContents.forEach(c => c.classList.remove("active"));
            btn.classList.add("active");
            document.getElementById(targetTab).classList.add("active");
            
            if (targetTab === "compare" && currentBlurt) {
                blurtDisplay.textContent = currentBlurt.blurt;
            }
        });
    });

    function loadSessions() {
        const saved = localStorage.getItem(STORAGE_KEY);
        sessions = saved ? JSON.parse(saved) : [];
        renderSavedBlurts();
    }

    function saveSessions() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
        renderSavedBlurts();
    }

    function renderSavedBlurts() {
        savedBlurtsList.innerHTML = "";
        if (sessions.length === 0) {
            savedBlurtsList.innerHTML = "<p style='color: var(--gray-400);'>No saved blurts yet.</p>";
            return;
        }
        sessions.forEach((session, index) => {
            const sessionDiv = document.createElement("div");
            sessionDiv.className = "saved-session";
            sessionDiv.style.cssText = "margin-bottom: 1.5rem; padding: 1.5rem; background: rgba(255,255,255,0.05); border-radius: 0.5rem; border: 1px solid rgba(255,255,255,0.1);";
            sessionDiv.innerHTML = `
                <h3 style="margin-bottom: 0.5rem;">Blurt ${new Date(session.date).toLocaleDateString()}</h3>
                <div style="margin-bottom: 1rem;">
                    <strong style="color: var(--gray-300);">Your Blurt:</strong>
                    <p style="margin-top: 0.5rem; color: var(--gray-400); white-space: pre-wrap;">${session.blurt}</p>
                </div>
                ${session.gaps ? `
                <div style="margin-bottom: 1rem;">
                    <strong style="color: var(--gray-300);">Gaps Identified:</strong>
                    <p style="margin-top: 0.5rem; color: var(--gray-400); white-space: pre-wrap;">${session.gaps}</p>
                </div>
                ` : ''}
                <button class="btn-danger delete-session-btn" data-index="${index}" style="padding: 0.5rem 1rem; font-size: 0.9rem;">Delete</button>
            `;
            savedBlurtsList.appendChild(sessionDiv);
        });

        document.querySelectorAll(".delete-session-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const index = parseInt(btn.getAttribute("data-index"));
                sessions.splice(index, 1);
                saveSessions();
            });
        });
    }

    function updateTimer() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timer.textContent = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
        
        if (timeLeft === 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            alert("Time's up! Finish your blurt and save it.");
            startTimerBtn.textContent = "Start Timer (15 min)";
        }
    }

    startTimerBtn.addEventListener("click", () => {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
            startTimerBtn.textContent = "Start Timer (15 min)";
        } else {
            timeLeft = 15 * 60;
            timerInterval = setInterval(() => {
                timeLeft--;
                updateTimer();
            }, 1000);
            startTimerBtn.textContent = "Stop Timer";
            updateTimer();
        }
    });

    saveBlurtBtn.addEventListener("click", () => {
        const blurtText = blurtTextarea.value.trim();
        if (blurtText) {
            currentBlurt = {
                blurt: blurtText,
                date: new Date().toISOString()
            };
            saveMsg.style.display = "block";
            setTimeout(() => {
                saveMsg.style.display = "none";
            }, 2000);
            if (timerInterval) {
                clearInterval(timerInterval);
                timerInterval = null;
                startTimerBtn.textContent = "Start Timer (15 min)";
                timeLeft = 15 * 60;
                timer.textContent = "15:00";
            }
        } else {
            alert("Please write something before saving!");
        }
    });

    clearBlurtBtn.addEventListener("click", () => {
        if (confirm("Clear your blurt? This cannot be undone.")) {
            blurtTextarea.value = "";
            currentBlurt = null;
        }
    });

    saveGapsBtn.addEventListener("click", () => {
        if (currentBlurt) {
            const gaps = gapsTextarea.value.trim();
            sessions.push({
                ...currentBlurt,
                gaps: gaps || null
            });
            saveSessions();
            currentBlurt = null;
            blurtTextarea.value = "";
            gapsTextarea.value = "";
            notesTextarea.value = "";
            alert("Session saved! Check the Notes tab to review.");
        } else {
            alert("Please save a blurt first!");
        }
    });

    deleteAllBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to delete all saved blurts? This cannot be undone.")) {
            sessions = [];
            saveSessions();
        }
    });

    loadSessions();
});

