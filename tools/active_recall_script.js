document.addEventListener("DOMContentLoaded", () => {
    const STORAGE_KEY = "activeRecallQuestions";
    let questions = [];
    let currentQuiz = [];
    let currentQuestionIndex = 0;
    let score = 0;

    // --- Get All Elements ---
    const tabBtns = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tool-tab-content");

    // --- Quiz Tab ---
    const startQuizWrapper = document.getElementById("start-quiz-wrapper");
    const startQuizBtn = document.getElementById("start-quiz-btn");
    const quizArea = document.getElementById("quiz-area");
    const resultsArea = document.getElementById("results-area");
    const quizStats = document.getElementById("quiz-stats");
    const quizQuestion = document.getElementById("quiz-question");
    const quizAnswer = document.getElementById("quiz-answer");
    const quizButtons1 = document.getElementById("quiz-buttons-1");
    const quizButtons2 = document.getElementById("quiz-buttons-2");
    const showAnswerBtn = document.getElementById("show-answer-btn");
    const wrongBtn = document.getElementById("wrong-btn");
    const rightBtn = document.getElementById("right-btn");
    const scorePercent = document.getElementById("score-percent");
    const scoreDetails = document.getElementById("score-details");

    // --- Add Tab ---
    const addQuestionForm = document.getElementById("add-question-form");
    const questionInput = document.getElementById("question-input");
    const answerInput = document.getElementById("answer-input");
    const saveMsg = document.getElementById("save-message");

    // --- Manage Tab ---
    const manageList = document.getElementById("manage-list");
    const managePrompt = document.getElementById("manage-prompt");
    const deleteAllBtn = document.getElementById("delete-all-btn");

    // --- Core Functions ---

    function loadQuestions() {
        const savedQuestions = localStorage.getItem(STORAGE_KEY);
        questions = savedQuestions ? JSON.parse(savedQuestions) : [];
        renderManageList();
        updateQuizStartButton();
    }

    function saveQuestions() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
        renderManageList();
        updateQuizStartButton();
    }

    function updateQuizStartButton() {
        if (questions.length === 0) {
            startQuizBtn.textContent = "Add Questions to Start";
            startQuizBtn.disabled = true;
        } else {
            startQuizBtn.textContent = "Start Quiz";
            startQuizBtn.disabled = false;
        }
    }

    // --- Tab Switching ---
    tabBtns.forEach(btn => btn.addEventListener("click", (e) => {
        tabBtns.forEach(b => b.classList.remove("active"));
        tabContents.forEach(c => c.classList.remove("active"));
        e.target.classList.add("active");
        document.getElementById(e.target.dataset.tab).classList.add("active");
    }));

    // --- Manage Tab Logic ---

    function renderManageList() {
        manageList.innerHTML = ""; // Clear list
        if (questions.length === 0) {
            managePrompt.textContent = "You have no saved questions.";
            deleteAllBtn.style.display = "none";
            return;
        }
        
        managePrompt.textContent = "Your saved questions:";
        deleteAllBtn.style.display = "inline-flex";

        questions.forEach(q => {
            const item = document.createElement("div");
            item.className = "question-item";
            item.innerHTML = `
                <div class="question-item-text">
                    <strong>${q.question}</strong>
                    <span>${q.answer}</span>
                </div>
                <button class="delete-btn" data-id="${q.id}">&times;</button>
            `;
            manageList.appendChild(item);
        });
    }

    deleteAllBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to delete ALL questions?")) {
            questions = [];
            saveQuestions();
        }
    });

    manageList.addEventListener("click", (e) => {
        if (e.target.classList.contains("delete-btn")) {
            const idToDelete = parseInt(e.target.dataset.id);
            questions = questions.filter(q => q.id !== idToDelete);
            saveQuestions();
        }
    });

    // --- Add Question Tab Logic ---

    addQuestionForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const newQuestion = {
            id: Date.now(),
            question: questionInput.value,
            answer: answerInput.value
        };
        questions.push(newQuestion);
        saveQuestions();
        
        questionInput.value = "";
        answerInput.value = "";
        questionInput.focus();

        saveMsg.style.opacity = "1";
        setTimeout(() => { saveMsg.style.opacity = "0"; }, 2000);
    });

    // --- Quiz Tab Logic ---

    startQuizBtn.addEventListener("click", () => {
        startQuizWrapper.style.display = "none";
        resultsArea.style.display = "none";
        quizArea.style.display = "block";

        // Shuffle the questions for the quiz
        currentQuiz = [...questions].sort(() => Math.random() - 0.5);
        currentQuestionIndex = 0;
        score = 0;
        
        loadNextQuestion();
    });

    function loadNextQuestion() {
        if (currentQuestionIndex < currentQuiz.length) {
            const q = currentQuiz[currentQuestionIndex];
            quizStats.textContent = `Question ${currentQuestionIndex + 1} of ${currentQuiz.length}`;
            quizQuestion.textContent = q.question;
            quizAnswer.textContent = q.answer;

            // Reset UI
            quizAnswer.style.display = "none";
            quizButtons1.style.display = "flex";
            quizButtons2.style.display = "none";
        } else {
            showResults();
        }
    }

    showAnswerBtn.addEventListener("click", () => {
        quizAnswer.style.display = "block";
        quizButtons1.style.display = "none";
        quizButtons2.style.display = "flex";
    });

    wrongBtn.addEventListener("click", () => handleGrade(false));
    rightBtn.addEventListener("click", () => handleGrade(true));

    function handleGrade(isCorrect) {
        if (isCorrect) {
            score++;
        }
        currentQuestionIndex++;
        loadNextQuestion();
    }

    function showResults() {
        quizArea.style.display = "none";
        resultsArea.style.display = "block";
        startQuizWrapper.style.display = "flex";
        startQuizBtn.textContent = "Restart Quiz";

        const percent = Math.round((score / currentQuiz.length) * 100) || 0;
        scorePercent.textContent = `${percent}%`;
        scoreDetails.textContent = `(${score} / ${currentQuiz.length} correct)`;
    }

    // --- Initial Load ---
    loadQuestions();
});