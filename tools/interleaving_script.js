document.addEventListener("DOMContentLoaded", () => {
    const STORAGE_KEY = "interleavingData";
    let topics = [];
    let currentPracticeSet = [];
    let currentProblemIndex = 0;

    // Elements
    const tabBtns = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tool-tab-content");
    
    const practiceStart = document.getElementById("practice-start");
    const startPracticeBtn = document.getElementById("start-practice-btn");
    const practiceArea = document.getElementById("practice-area");
    const practiceComplete = document.getElementById("practice-complete");
    const practiceStats = document.getElementById("practice-stats");
    const topicTag = document.getElementById("topic-tag");
    const problemText = document.getElementById("problem-text");
    const nextProblemBtn = document.getElementById("next-problem-btn");
    const finishPracticeBtn = document.getElementById("finish-practice-btn");
    const practiceSummary = document.getElementById("practice-summary");
    const restartPracticeBtn = document.getElementById("restart-practice-btn");

    const topicNameInput = document.getElementById("topic-name-input");
    const addTopicBtn = document.getElementById("add-topic-btn");
    const topicSelect = document.getElementById("topic-select");
    const problemInput = document.getElementById("problem-input");
    const addProblemBtn = document.getElementById("add-problem-btn");
    const topicsList = document.getElementById("topics-list");

    // Tab switching
    tabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const targetTab = btn.getAttribute("data-tab");
            tabBtns.forEach(b => b.classList.remove("active"));
            tabContents.forEach(c => c.classList.remove("active"));
            btn.classList.add("active");
            document.getElementById(targetTab).classList.add("active");
            if (targetTab === "topics") {
                renderTopics();
            }
        });
    });

    function loadData() {
        const saved = localStorage.getItem(STORAGE_KEY);
        topics = saved ? JSON.parse(saved) : [];
        renderTopics();
        updateStartButton();
    }

    function saveData() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(topics));
        renderTopics();
        updateStartButton();
    }

    function renderTopics() {
        topicsList.innerHTML = "";
        topicSelect.innerHTML = '<option value="">Select a topic...</option>';
        
        if (topics.length === 0) {
            topicsList.innerHTML = "<p style='color: var(--gray-400);'>No topics added yet. Add a topic to get started!</p>";
            return;
        }

        topics.forEach((topic, topicIndex) => {
            topicSelect.innerHTML += `<option value="${topicIndex}">${topic.name}</option>`;
            
            const topicDiv = document.createElement("div");
            topicDiv.style.cssText = "margin-bottom: 2rem; padding: 1.5rem; background: rgba(255,255,255,0.05); border-radius: 0.5rem; border: 1px solid rgba(255,255,255,0.1);";
            topicDiv.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <h3 style="margin: 0;">${topic.name}</h3>
                    <button class="btn-danger delete-topic-btn" data-index="${topicIndex}" style="padding: 0.5rem 1rem; font-size: 0.9rem;">Delete Topic</button>
                </div>
                <div id="problems-${topicIndex}">
                    ${topic.problems.length === 0 ? '<p style="color: var(--gray-400);">No problems added yet.</p>' : ''}
                    ${topic.problems.map((problem, probIndex) => `
                        <div style="padding: 1rem; margin-bottom: 0.5rem; background: rgba(255,255,255,0.03); border-radius: 0.25rem; display: flex; justify-content: space-between; align-items: start;">
                            <p style="margin: 0; color: var(--gray-300); flex: 1;">${problem}</p>
                            <button class="btn-danger delete-problem-btn" data-topic="${topicIndex}" data-problem="${probIndex}" style="padding: 0.25rem 0.75rem; font-size: 0.85rem; margin-left: 1rem;">Delete</button>
                        </div>
                    `).join('')}
                </div>
            `;
            topicsList.appendChild(topicDiv);
        });

        document.querySelectorAll(".delete-topic-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const index = parseInt(btn.getAttribute("data-index"));
                topics.splice(index, 1);
                saveData();
            });
        });

        document.querySelectorAll(".delete-problem-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const topicIndex = parseInt(btn.getAttribute("data-topic"));
                const probIndex = parseInt(btn.getAttribute("data-problem"));
                topics[topicIndex].problems.splice(probIndex, 1);
                saveData();
            });
        });
    }

    function updateStartButton() {
        const totalProblems = topics.reduce((sum, topic) => sum + topic.problems.length, 0);
        if (totalProblems === 0) {
            startPracticeBtn.textContent = "Add topics and problems first!";
            startPracticeBtn.disabled = true;
        } else {
            startPracticeBtn.textContent = `Start Mixed Practice (${totalProblems} problems)`;
            startPracticeBtn.disabled = false;
        }
    }

    function createPracticeSet() {
        currentPracticeSet = [];
        topics.forEach(topic => {
            topic.problems.forEach(problem => {
                currentPracticeSet.push({
                    topic: topic.name,
                    problem: problem
                });
            });
        });
        shuffleArray(currentPracticeSet);
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function showCurrentProblem() {
        if (currentProblemIndex >= currentPracticeSet.length) {
            completePractice();
            return;
        }
        const item = currentPracticeSet[currentProblemIndex];
        topicTag.textContent = item.topic;
        problemText.textContent = item.problem;
        practiceStats.textContent = `Problem ${currentProblemIndex + 1} of ${currentPracticeSet.length}`;
    }

    function completePractice() {
        practiceArea.style.display = "none";
        practiceComplete.style.display = "block";
        practiceSummary.textContent = `You've completed ${currentPracticeSet.length} mixed problems! Great job practicing interleaving.`;
    }

    startPracticeBtn.addEventListener("click", () => {
        createPracticeSet();
        if (currentPracticeSet.length === 0) {
            alert("Add some problems first!");
            return;
        }
        currentProblemIndex = 0;
        practiceStart.style.display = "none";
        practiceArea.style.display = "block";
        practiceComplete.style.display = "none";
        showCurrentProblem();
    });

    nextProblemBtn.addEventListener("click", () => {
        currentProblemIndex++;
        showCurrentProblem();
    });

    finishPracticeBtn.addEventListener("click", () => {
        completePractice();
    });

    restartPracticeBtn.addEventListener("click", () => {
        practiceStart.style.display = "block";
        practiceArea.style.display = "none";
        practiceComplete.style.display = "none";
    });

    addTopicBtn.addEventListener("click", () => {
        const name = topicNameInput.value.trim();
        if (name) {
            topics.push({
                name: name,
                problems: []
            });
            saveData();
            topicNameInput.value = "";
        } else {
            alert("Please enter a topic name!");
        }
    });

    addProblemBtn.addEventListener("click", () => {
        const topicIndex = parseInt(topicSelect.value);
        const problem = problemInput.value.trim();
        if (topicIndex >= 0 && topicIndex < topics.length && problem) {
            topics[topicIndex].problems.push(problem);
            saveData();
            problemInput.value = "";
        } else {
            alert("Please select a topic and enter a problem!");
        }
    });

    loadData();
});

