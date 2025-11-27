document.addEventListener("DOMContentLoaded", () => {
    const STORAGE_KEY = "practiceTestQuestions";
    const RESULTS_KEY = "practiceTestResults";
    let questions = [];
    let results = [];
    let currentTest = [];
    let currentQuestionIndex = 0;
    let currentTestAnswers = [];

    // Elements
    const tabBtns = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tool-tab-content");
    
    const testStart = document.getElementById("test-start");
    const startTestBtn = document.getElementById("start-test-btn");
    const testArea = document.getElementById("test-area");
    const testComplete = document.getElementById("test-complete");
    const testStats = document.getElementById("test-stats");
    const testQuestion = document.getElementById("test-question");
    const testAnswer = document.getElementById("test-answer");
    const submitAnswerBtn = document.getElementById("submit-answer-btn");
    const skipQuestionBtn = document.getElementById("skip-question-btn");
    const scorePercent = document.getElementById("score-percent");
    const scoreDetails = document.getElementById("score-details");
    const reviewTestBtn = document.getElementById("review-test-btn");
    const newTestBtn = document.getElementById("new-test-btn");

    const addQuestionForm = document.getElementById("add-question-form");
    const questionInput = document.getElementById("question-input");
    const answerInput = document.getElementById("answer-input");
    const saveMsg = document.getElementById("save-message");

    const resultsList = document.getElementById("results-list");
    const deleteAllBtn = document.getElementById("delete-all-btn");

    // Tab switching
    tabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const targetTab = btn.getAttribute("data-tab");
            tabBtns.forEach(b => b.classList.remove("active"));
            tabContents.forEach(c => c.classList.remove("active"));
            btn.classList.add("active");
            document.getElementById(targetTab).classList.add("active");
            if (targetTab === "results") {
                renderResults();
            }
        });
    });

    function loadData() {
        const savedQuestions = localStorage.getItem(STORAGE_KEY);
        const savedResults = localStorage.getItem(RESULTS_KEY);
        questions = savedQuestions ? JSON.parse(savedQuestions) : [];
        results = savedResults ? JSON.parse(savedResults) : [];
        renderResults();
        updateStartButton();
    }

    function saveData() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
        localStorage.setItem(RESULTS_KEY, JSON.stringify(results));
        renderResults();
        updateStartButton();
    }

    function renderResults() {
        resultsList.innerHTML = "";
        
        if (questions.length === 0) {
            resultsList.innerHTML = "<p style='color: var(--gray-400);'>No questions added yet. Add questions to get started!</p>";
            return;
        }

        resultsList.innerHTML += `
            <div style="margin-bottom: 2rem; padding: 1.5rem; background: rgba(255,255,255,0.05); border-radius: 0.5rem; border: 1px solid rgba(255,255,255,0.1);">
                <h3 style="margin-bottom: 1rem;">Your Questions (${questions.length})</h3>
                <div id="questions-list"></div>
            </div>
        `;

        const questionsList = document.getElementById("questions-list");
        questions.forEach((q, index) => {
            const qDiv = document.createElement("div");
            qDiv.style.cssText = "padding: 1rem; margin-bottom: 0.5rem; background: rgba(255,255,255,0.03); border-radius: 0.25rem;";
            qDiv.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div style="flex: 1;">
                        <p style="margin: 0 0 0.5rem 0; color: var(--gray-300);"><strong>Q:</strong> ${q.question}</p>
                        <p style="margin: 0; color: var(--gray-400); font-size: 0.9rem;"><strong>A:</strong> ${q.answer}</p>
                    </div>
                    <button class="btn-danger delete-question-btn" data-index="${index}" style="padding: 0.25rem 0.75rem; font-size: 0.85rem; margin-left: 1rem;">Delete</button>
                </div>
            `;
            questionsList.appendChild(qDiv);
        });

        document.querySelectorAll(".delete-question-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const index = parseInt(btn.getAttribute("data-index"));
                questions.splice(index, 1);
                saveData();
            });
        });

        if (results.length > 0) {
            resultsList.innerHTML += `
                <div style="margin-top: 2rem; padding: 1.5rem; background: rgba(255,255,255,0.05); border-radius: 0.5rem; border: 1px solid rgba(255,255,255,0.1);">
                    <h3 style="margin-bottom: 1rem;">Recent Test Results</h3>
                    ${results.slice(-5).reverse().map(result => `
                        <div style="padding: 1rem; margin-bottom: 0.5rem; background: rgba(255,255,255,0.03); border-radius: 0.25rem;">
                            <p style="margin: 0; color: var(--gray-300);">
                                ${new Date(result.date).toLocaleString()} - 
                                <strong>${result.score}%</strong> (${result.correct}/${result.total})
                            </p>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    }

    function updateStartButton() {
        if (questions.length === 0) {
            startTestBtn.textContent = "Add questions first!";
            startTestBtn.disabled = true;
        } else {
            startTestBtn.textContent = `Start Practice Test (${questions.length} questions)`;
            startTestBtn.disabled = false;
        }
    }

    function startTest() {
        currentTest = [...questions];
        shuffleArray(currentTest);
        currentQuestionIndex = 0;
        currentTestAnswers = [];
        testStart.style.display = "none";
        testArea.style.display = "block";
        testComplete.style.display = "none";
        showCurrentQuestion();
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function showCurrentQuestion() {
        if (currentQuestionIndex >= currentTest.length) {
            completeTest();
            return;
        }
        const question = currentTest[currentQuestionIndex];
        testQuestion.textContent = question.question;
        testAnswer.value = "";
        testStats.textContent = `Question ${currentQuestionIndex + 1} of ${currentTest.length}`;
    }

    function completeTest() {
        let correct = 0;
        currentTestAnswers.forEach((answer, index) => {
            const question = currentTest[index];
            if (answer.trim().toLowerCase() === question.answer.trim().toLowerCase()) {
                correct++;
            }
        });
        const score = Math.round((correct / currentTest.length) * 100);
        
        results.push({
            date: new Date().toISOString(),
            score: score,
            correct: correct,
            total: currentTest.length,
            answers: currentTestAnswers,
            questions: currentTest
        });
        saveData();

        testArea.style.display = "none";
        testComplete.style.display = "block";
        scorePercent.textContent = `${score}%`;
        scoreDetails.textContent = `(${correct} / ${currentTest.length} correct)`;
    }

    startTestBtn.addEventListener("click", () => {
        startTest();
    });

    submitAnswerBtn.addEventListener("click", () => {
        const answer = testAnswer.value.trim();
        if (answer) {
            currentTestAnswers.push(answer);
            currentQuestionIndex++;
            showCurrentQuestion();
        } else {
            alert("Please enter an answer or skip the question.");
        }
    });

    skipQuestionBtn.addEventListener("click", () => {
        currentTestAnswers.push("");
        currentQuestionIndex++;
        showCurrentQuestion();
    });

    reviewTestBtn.addEventListener("click", () => {
        if (results.length > 0) {
            const lastResult = results[results.length - 1];
            let reviewHTML = "<h3 style='margin-bottom: 1rem;'>Test Review</h3>";
            lastResult.questions.forEach((q, index) => {
                const userAnswer = lastResult.answers[index] || "(skipped)";
                const isCorrect = userAnswer.trim().toLowerCase() === q.answer.trim().toLowerCase();
                reviewHTML += `
                    <div style="padding: 1rem; margin-bottom: 1rem; background: rgba(255,255,255,0.05); border-radius: 0.5rem; border: 1px solid ${isCorrect ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'};">
                        <p style="margin: 0 0 0.5rem 0; color: var(--gray-300);"><strong>Q:</strong> ${q.question}</p>
                        <p style="margin: 0 0 0.5rem 0; color: ${isCorrect ? 'var(--green-400)' : 'var(--red-400)'};">
                            <strong>Your Answer:</strong> ${userAnswer} ${isCorrect ? '✓' : '✗'}
                        </p>
                        ${!isCorrect ? `<p style="margin: 0; color: var(--gray-400);"><strong>Correct Answer:</strong> ${q.answer}</p>` : ''}
                    </div>
                `;
            });
            resultsList.innerHTML = reviewHTML;
            tabBtns.forEach(b => b.classList.remove("active"));
            tabContents.forEach(c => c.classList.remove("active"));
            document.querySelector('[data-tab="results"]').classList.add("active");
            document.getElementById("results").classList.add("active");
        }
    });

    newTestBtn.addEventListener("click", () => {
        testStart.style.display = "block";
        testArea.style.display = "none";
        testComplete.style.display = "none";
    });

    addQuestionForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const question = questionInput.value.trim();
        const answer = answerInput.value.trim();
        if (question && answer) {
            questions.push({
                id: Date.now(),
                question,
                answer
            });
            saveData();
            questionInput.value = "";
            answerInput.value = "";
            saveMsg.style.display = "block";
            setTimeout(() => {
                saveMsg.style.display = "none";
            }, 2000);
        }
    });

    deleteAllBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to delete all questions? This cannot be undone.")) {
            questions = [];
            saveData();
        }
    });

    loadData();
});

