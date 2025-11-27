document.addEventListener("DOMContentLoaded", () => {
    const STORAGE_KEY = "leitnerCards";
    let cards = [];
    let currentBox = 1;
    let currentCardIndex = 0;
    let currentBoxCards = [];

    // Elements
    const tabBtns = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tool-tab-content");
    
    const studyStart = document.getElementById("study-start");
    const startStudyBtn = document.getElementById("start-study-btn");
    const studyArea = document.getElementById("study-area");
    const studyComplete = document.getElementById("study-complete");
    const studyStats = document.getElementById("study-stats");
    const cardQuestion = document.getElementById("card-question");
    const cardAnswer = document.getElementById("card-answer");
    const flashcard = document.getElementById("flashcard");
    const flashcardFront = document.getElementById("flashcard-front");
    const flashcardBack = document.getElementById("flashcard-back");
    const flipCardBtn = document.getElementById("flip-card-btn");
    const cardButtons = document.getElementById("card-buttons");
    const wrongBtn = document.getElementById("wrong-btn");
    const rightBtn = document.getElementById("right-btn");
    const nextBoxBtn = document.getElementById("next-box-btn");
    const finishStudyBtn = document.getElementById("finish-study-btn");
    const boxCompleteMessage = document.getElementById("box-complete-message");

    const addCardForm = document.getElementById("add-card-form");
    const questionInput = document.getElementById("question-input");
    const answerInput = document.getElementById("answer-input");
    const saveMsg = document.getElementById("save-message");

    const boxesDisplay = document.getElementById("boxes-display");
    const deleteAllBtn = document.getElementById("delete-all-btn");

    // Tab switching
    tabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const targetTab = btn.getAttribute("data-tab");
            tabBtns.forEach(b => b.classList.remove("active"));
            tabContents.forEach(c => c.classList.remove("active"));
            btn.classList.add("active");
            document.getElementById(targetTab).classList.add("active");
        });
    });

    function loadCards() {
        const saved = localStorage.getItem(STORAGE_KEY);
        cards = saved ? JSON.parse(saved) : [];
        renderBoxes();
        updateStartButton();
    }

    function saveCards() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
        renderBoxes();
    }

    function renderBoxes() {
        const boxes = { 1: [], 2: [], 3: [], 4: [], 5: [] };
        cards.forEach(card => {
            if (card.box >= 1 && card.box <= 5) {
                boxes[card.box].push(card);
            }
        });

        boxesDisplay.innerHTML = "";
        for (let i = 1; i <= 5; i++) {
            const boxDiv = document.createElement("div");
            boxDiv.className = "box-card";
            boxDiv.innerHTML = `
                <h3>Box ${i}</h3>
                <p class="box-count">${boxes[i].length} cards</p>
                <p class="box-schedule">${getSchedule(i)}</p>
            `;
            boxesDisplay.appendChild(boxDiv);
        }
    }

    function getSchedule(box) {
        const schedules = {
            1: "Review daily",
            2: "Review every 2-3 days",
            3: "Review weekly",
            4: "Review every 2 weeks",
            5: "Review monthly"
        };
        return schedules[box] || "Review as needed";
    }

    function updateStartButton() {
        const box1Cards = cards.filter(c => c.box === 1);
        if (box1Cards.length === 0) {
            startStudyBtn.textContent = "No cards in Box 1. Add cards first!";
            startStudyBtn.disabled = true;
        } else {
            startStudyBtn.textContent = `Start Studying Box 1 (${box1Cards.length} cards)`;
            startStudyBtn.disabled = false;
        }
    }

    function startStudying(boxNumber) {
        currentBox = boxNumber;
        currentBoxCards = cards.filter(c => c.box === boxNumber);
        if (currentBoxCards.length === 0) {
            alert(`No cards in Box ${boxNumber}. Add cards first!`);
            return;
        }
        shuffleArray(currentBoxCards);
        currentCardIndex = 0;
        studyStart.style.display = "none";
        studyArea.style.display = "block";
        studyComplete.style.display = "none";
        showCurrentCard();
    }

    function showCurrentCard() {
        if (currentCardIndex >= currentBoxCards.length) {
            completeBox();
            return;
        }
        const card = currentBoxCards[currentCardIndex];
        cardQuestion.textContent = card.question;
        cardAnswer.textContent = card.answer;
        flashcardFront.style.display = "block";
        flashcardBack.style.display = "none";
        flipCardBtn.textContent = "Show Answer";
        flipCardBtn.style.display = "block";
        cardButtons.style.display = "none";
        studyStats.textContent = `Card ${currentCardIndex + 1} of ${currentBoxCards.length} in Box ${currentBox}`;
    }

    function completeBox() {
        studyArea.style.display = "none";
        studyComplete.style.display = "block";
        const nextBox = currentBox + 1;
        const nextBoxCards = cards.filter(c => c.box === nextBox);
        if (nextBoxCards.length > 0 && nextBox <= 5) {
            boxCompleteMessage.textContent = `You've finished Box ${currentBox}! Continue to Box ${nextBox}?`;
            nextBoxBtn.style.display = "inline-block";
        } else {
            boxCompleteMessage.textContent = `You've finished Box ${currentBox}! All done for now.`;
            nextBoxBtn.style.display = "none";
        }
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    flipCardBtn.addEventListener("click", () => {
        if (flashcardBack.style.display === "none") {
            flashcardFront.style.display = "none";
            flashcardBack.style.display = "block";
            flipCardBtn.style.display = "none";
            cardButtons.style.display = "flex";
        }
    });

    wrongBtn.addEventListener("click", () => {
        const card = currentBoxCards[currentCardIndex];
        card.box = 1;
        saveCards();
        currentCardIndex++;
        showCurrentCard();
    });

    rightBtn.addEventListener("click", () => {
        const card = currentBoxCards[currentCardIndex];
        if (card.box < 5) {
            card.box++;
        }
        saveCards();
        currentCardIndex++;
        showCurrentCard();
    });

    nextBoxBtn.addEventListener("click", () => {
        startStudying(currentBox + 1);
    });

    finishStudyBtn.addEventListener("click", () => {
        studyStart.style.display = "block";
        studyArea.style.display = "none";
        studyComplete.style.display = "none";
        updateStartButton();
    });

    startStudyBtn.addEventListener("click", () => {
        startStudying(1);
    });

    addCardForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const question = questionInput.value.trim();
        const answer = answerInput.value.trim();
        if (question && answer) {
            cards.push({
                id: Date.now(),
                question,
                answer,
                box: 1
            });
            saveCards();
            questionInput.value = "";
            answerInput.value = "";
            saveMsg.style.display = "block";
            setTimeout(() => {
                saveMsg.style.display = "none";
            }, 2000);
        }
    });

    deleteAllBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to delete all cards? This cannot be undone.")) {
            cards = [];
            saveCards();
            updateStartButton();
        }
    });

    loadCards();
});

