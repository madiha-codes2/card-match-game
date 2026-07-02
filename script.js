let difficulty = 'easy';
let cardsArray = [];
let flippedCards = [];
let matchedCount = 0;
let movesCount = 0;
let scoreCount = 0;
let timerInterval = null;
let secondsElapsed = 0;
let isProcessing = false;

// Dynamic global pool mix (Animals, Vehicles, Foods, Objects)
const emojiBank = [
    '🐱', '🚀', '🍉', '⚽', '🍕',  
    '🤖', '🦁', '🛸', '🥑', '🎸',  
    '🐵', '🏎️', '🍍', '🍩', '💎',  
    '🐼', '🚂', '🍒', '🍔', '🎈'   
];

const difficultySettings = {
    easy: { pairs: 8 },
    medium: { pairs: 10 },
    hard: { pairs: 12 }
};

const startScreen = document.getElementById('start-screen');
const difficultyScreen = document.getElementById('difficulty-screen');
const gameScreen = document.getElementById('game-screen');
const winScreen = document.getElementById('win-screen');
const cardGrid = document.getElementById('card-grid');
const timeDisplay = document.getElementById('time-display');
const movesDisplay = document.getElementById('moves-display');
const scoreDisplay = document.getElementById('score-display');
const mainPlayBtn = document.getElementById('main-play-btn');
const restartBtn = document.getElementById('restart-btn');
const newGameBtn = document.getElementById('new-game-btn');
const playAgainBtn = document.getElementById('play-again-btn');
const backToMenuBtn = document.getElementById('back-to-menu-btn');
const diffButtons = document.querySelectorAll('.difficulty-options .btn');

function changeScreen(targetScreen) {
    const currentActive = document.querySelector('.screen.active');
    if (currentActive) {
        currentActive.classList.remove('active');
    }
    targetScreen.classList.add('active');
}

// Helper tool to check if any adjacent elements are identical duplicates
function hasAdjacentNeighbors(arr) {
    for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i] === arr[i + 1]) {
            return true; // Found neighbors matching, validation fails!
        }
    }
    return false;
}

function startMatchGame() {
    flippedCards = [];
    matchedCount = 0;
    movesCount = 0;
    scoreCount = 0;
    secondsElapsed = 0;
    isProcessing = false;
    
    clearInterval(timerInterval);
    updateGameStats();

    const currentConfig = difficultySettings[difficulty];
    
    // 1. Filter unique random emojis out of global master bank
    let shuffledPool = [...emojiBank];
    for (let i = shuffledPool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledPool[i], shuffledPool[j]] = [shuffledPool[j], shuffledPool[i]];
    }
    const extractedEmojis = shuffledPool.slice(0, currentConfig.pairs);
    
    // 2. Double them to create matched pairs
    cardsArray = [...extractedEmojis, ...extractedEmojis];

    // 3. Shuffle with strict Anti-Neighbor validation constraints
    let attempts = 0;
    do {
        for (let i = cardsArray.length - 1; i > 0; i--) {
            const randomIndex = Math.floor(Math.random() * (i + 1));
            [cardsArray[i], cardsArray[randomIndex]] = [cardsArray[randomIndex], cardsArray[i]];
        }
        attempts++;
        // Break out automatically if it takes too long to avoid resource locking loops (safety guardrail)
    } while (hasAdjacentNeighbors(cardsArray) && attempts < 100);

    // Render configuration to layout interface window
    cardGrid.innerHTML = '';
    cardGrid.className = `grid ${difficulty}`;

    cardsArray.forEach((emoji) => {
        const cardElement = document.createElement('div');
        // made my madiha
        cardElement.classList.add('card');
        cardElement.dataset.value = emoji;
        cardElement.innerHTML = `
            <div class="card-inner">
                <div class="card-back"></div>
                <div class="card-front">${emoji}</div>
            </div>
        `;
        cardElement.addEventListener('click', flipActiveCard);
        cardGrid.appendChild(cardElement);
    });

    timerInterval = setInterval(() => {
        secondsElapsed++;
        timeDisplay.textContent = formatTimerOutput(secondsElapsed);
    }, 1000);

    changeScreen(gameScreen);
}

function flipActiveCard() {
    if (isProcessing) return;
    if (this.classList.contains('flipped') || this.classList.contains('matched')) return;

    this.classList.add('flipped');
    flippedCards.push(this);

    if (flippedCards.length === 2) {
        movesCount++;
        isProcessing = true;
        evaluateCardPair();
    }
}

function evaluateCardPair() {
    const [cardOne, cardTwo] = flippedCards;

    if (cardOne.dataset.value === cardTwo.dataset.value) {
        setTimeout(() => {
            cardOne.classList.add('matched');
            cardTwo.classList.add('matched');
            matchedCount++;
            scoreCount += 10;
            flippedCards = [];
            isProcessing = false;
            updateGameStats();

            if (matchedCount === difficultySettings[difficulty].pairs) {
                concludeGame();
            }
        }, 300);
    } else {
        setTimeout(() => {
            cardOne.classList.remove('flipped');
            cardTwo.classList.remove('flipped');
            flippedCards = [];
            isProcessing = false;
            updateGameStats();
        }, 800);
    }
}

function formatTimerOutput(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
}

function updateGameStats() {
    movesDisplay.textContent = movesCount;
    scoreDisplay.textContent = scoreCount;
    timeDisplay.textContent = formatTimerOutput(secondsElapsed);
}

function concludeGame() {
    clearInterval(timerInterval);
    document.getElementById('final-score').textContent = scoreCount;
    document.getElementById('final-moves').textContent = movesCount;
    document.getElementById('final-time').textContent = formatTimerOutput(secondsElapsed);
    setTimeout(() => { changeScreen(winScreen); }, 500);
}

mainPlayBtn.addEventListener('click', () => changeScreen(difficultyScreen));
diffButtons.forEach(btn => {
    btn.addEventListener('click', function() {
        difficulty = this.dataset.difficulty;
        startMatchGame();
    });
});
restartBtn.addEventListener('click', startMatchGame);
newGameBtn.addEventListener('click', () => changeScreen(startScreen));
playAgainBtn.addEventListener('click', startMatchGame); 
backToMenuBtn.addEventListener('click', () => changeScreen(startScreen));