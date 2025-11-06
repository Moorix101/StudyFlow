document.addEventListener("DOMContentLoaded", () => {
    // --- Card Data ---
    const STORAGE_KEY = "spacedRepetitionCards";
    let boxes = [[], [], [], [], []]; // 5 boxes for the Leitner system
    let currentCard = null;

    // --- Tab Elements ---
    const tabBtns = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tool-tab-content");

    // --- Review Tab Elements ---
    const statsEl = document.getElementById("review-stats");
    const cardContainer = document.getElementById("flashcard-container");
    const cardInner = document.getElementById("flashcard-inner");
    const cardQuestion = document.getElementById("card-question");
    const cardAnswer = document.getElementById("card-answer");
    const showAnswerBtn = document.getElementById("show-answer-btn");
    const reviewActions = document.querySelector(".review-actions");
    const wrongBtn = document.getElementById("wrong-btn");
    const rightBtn = document.getElementById("right-btn");

    // --- Add Tab Elements ---
    const addCardForm = document.getElementById("add-card-form");
    const questionInput = document.getElementById("question-input");
    const answerInput = document.getElementById("answer-input");
    const saveMsg = document.getElementById("save-message");

    // --- Manage Tab Elements ---
    const resetAllBtn = document.getElementById("reset-all-btn");

    // --- Functions ---

    function loadCards() {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
            boxes = JSON.parse(savedData);
        }
        updateStats();
        loadNextCard();
    }

    function saveCards() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(boxes));
        updateStats();
    }

    function updateStats() {
        const totalCards = boxes.flat().length;
        statsEl.textContent = `Total Cards: ${totalCards} | Box 1: ${boxes[0].length} | Box 2: ${boxes[1].length} | Box 3: ${boxes[2].length} | Box 4: ${boxes[3].length} | Box 5: ${boxes[4].length}`;
    }

    function loadNextCard() {
        // Find the lowest box that has cards
        let boxIndex = -1;
        for (let i = 0; i < boxes.length; i++) {
            if (boxes[i].length > 0) {
                boxIndex = i;
                break;
            }
        }

        // Reset UI
        cardContainer.classList.remove("is-flipped");
        showAnswerBtn.style.display = "block";

        if (boxIndex === -1) {
            // No cards left to review
            cardQuestion.textContent = "You've reviewed all your cards! 🎉";
            cardAnswer.textContent = "Add more cards in the 'Add Cards' tab.";
            currentCard = null;
            showAnswerBtn.style.display = "none";
        } else {
            // Get a random card from the chosen box
            const cardIndex = Math.floor(Math.random() * boxes[boxIndex].length);
            currentCard = boxes[boxIndex][cardIndex];
            currentCard.box = boxIndex; // Store which box it came from
            
            cardQuestion.textContent = currentCard.question;
            cardAnswer.textContent = currentCard.answer;
        }
    }

    function handleTabClick(e) {
        // Deactivate all
        tabBtns.forEach(btn => btn.classList.remove("active"));
        tabContents.forEach(content => content.classList.remove("active"));

        // Activate clicked
        const tabName = e.target.dataset.tab;
        e.target.classList.add("active");
        document.getElementById(tabName).classList.add("active");
    }

    function handleShowAnswer() {
        cardContainer.classList.add("is-flipped");
    }

    function handleWrongAnswer() {
        if (!currentCard) return;

        // Move card back to Box 1
        // 1. Remove from current box
        const cardIndex = boxes[currentCard.box].findIndex(card => card.id === currentCard.id);
        if (cardIndex > -1) {
            boxes[currentCard.box].splice(cardIndex, 1);
        }
        // 2. Add to Box 0 (always add it back)
        boxes[0].push(currentCard);

        saveCards();
        loadNextCard();
    }

    function handleRightAnswer() {
        if (!currentCard) return;

        // Move card to the next box (max 4, which is Box 5)
        const nextBox = Math.min(currentCard.box + 1, 4);
        
        // 1. Remove from current box
        const cardIndex = boxes[currentCard.box].findIndex(card => card.id === currentCard.id);
        if (cardIndex > -1) {
            boxes[currentCard.box].splice(cardIndex, 1);
        }
        // 2. Add to next box (always add it)
        boxes[nextBox].push(currentCard);
       
        saveCards();
        loadNextCard();
    }

    function handleAddCard(e) {
        e.preventDefault();
        const question = questionInput.value;
        const answer = answerInput.value;

        if (!question || !answer) return;

        const newCard = {
            id: Date.now(), // Simple unique ID
            question: question,
            answer: answer
        };

        // Add new card to Box 1
        boxes[0].push(newCard);
        saveCards();

        // Reset form and show message
        questionInput.value = "";
        answerInput.value = "";
        saveMsg.style.opacity = "1";
        setTimeout(() => {
            saveMsg.style.opacity = "0";
        }, 2000);
    }

    function handleResetAll() {
        if (confirm("Are you sure you want to delete ALL your cards? This cannot be undone.")) {
            boxes = [[], [], [], [], []];
            currentCard = null;
            saveCards();
            loadNextCard();
        }
    }

    // --- Event Listeners ---
    tabBtns.forEach(btn => btn.addEventListener("click", handleTabClick));
    showAnswerBtn.addEventListener("click", handleShowAnswer);
    wrongBtn.addEventListener("click", handleWrongAnswer);
    rightBtn.addEventListener("click", handleRightAnswer);
    addCardForm.addEventListener("submit", handleAddCard);
    resetAllBtn.addEventListener("click", handleResetAll);

    // --- Initial Load ---
    loadCards();
});