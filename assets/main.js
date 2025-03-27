// Game variables
let score = 0;
let timeLeft = 180;
let timerInterval;
let correctCount = 0;
let incorrectCount = 0;
let totalQuestions = 0;
let level = 'easy';
let correctStreak = 0;
let powerUps = {
    extraTime: 1,
    doublePoints: 1,
    skipQuestion: 1
};
let isDoublePointsActive = false;

// Comment tracking variables
let currentCorrectIndex = 0;
let currentIncorrectIndex = 0;
let lastAnswerType = null; // 'correct' or 'incorrect'

// Comments for correct answers
const correctComments = [
    "Correct! ✅",
    "Awesome! 🎉",
    "Wow! 🔥",
    "Math Genius! 🧠✨",
    "Unbelievable! 🤯",
    "Unstoppable 🌟"
];

// Comments for incorrect answers
const incorrectComments = [
    "Oops! 😕",
    "Try Again! 😅",
    "Don't Give Up! 💪",
    "Almost There! 👍",
    "You'll Get It Next Time! 🤞"
];

// Celebrate messages based on score
const celebrateMessages = [
    { minScore: 0, message: "Keep practicing! You'll get better! 💪" },
    { minScore: 10, message: "Good job! You're getting there! 🎉" },
    { minScore: 20, message: "Great work! You're a math whiz! 🔥" },
    { minScore: 30, message: "Amazing! You're a Math Genius! 🧠✨" }
];

// Themes
const themes = {
    ocean: { background: "linear-gradient(135deg, #1D4ED8, #1E90FF)", bodyClass: "ocean-theme" },
    sunset: { background: "linear-gradient(135deg, #D97706, #FF4500)", bodyClass: "sunset-theme" },
    forest: { background: "linear-gradient(135deg, #047857, #228B22)", bodyClass: "forest-theme" },
    midnight: { background: "linear-gradient(135deg, #1E1E2F, #2C3E50)", bodyClass: "midnight-theme" },
    candy: { background: "linear-gradient(135deg, #FF6F61, #FF1493)", bodyClass: "candy-theme" },
};

// Error handling function
function showError(message) {
    const errorButton = document.getElementById('errorButton');
    errorButton.textContent = message;
    errorButton.style.display = 'block';
    errorButton.style.animation = 'errorFadeIn 0.3s ease-out';
    
    setTimeout(() => {
        errorButton.style.animation = 'errorFadeOut 0.5s ease-out';
        setTimeout(() => {
            errorButton.style.display = 'none';
        }, 500);
    }, 3000);
}

// Initialize game
document.addEventListener('DOMContentLoaded', function() {
    // Theme Selector
    document.querySelectorAll('.theme-btn').forEach(button => {
        button.addEventListener('click', function() {
            const theme = themes[this.dataset.theme];
            document.body.style.background = theme.background;
            document.body.className = theme.bodyClass;
        });
    });

    // Start Game
    document.getElementById('startGame').addEventListener('click', function() {
        const playerName = document.getElementById('playerName').value.trim();
        
        if (!playerName) {
            showError('Please enter your name to start!');
            return;
        }
        
        const validNameRegex = /^[a-zA-Z0-9_\- ]{2,20}$/;
        if (!validNameRegex.test(playerName)) {
            showError('Name must be 2-20 characters (letters, numbers, spaces, - or _)');
            return;
        }
        
        level = document.getElementById('level').value;
        document.getElementById('playerNameDisplay').textContent = playerName;
        document.getElementById('landingPage').style.display = 'none';
        document.getElementById('gameScreen').style.display = 'block';
        startTimer();
        generateQuestion();
    });

    // Power-Ups
    document.getElementById('extraTime').addEventListener('click', function() {
        if (powerUps.extraTime <= 0) {
            showError('No more time boosts available!');
            return;
        }
        timeLeft += 10;
        powerUps.extraTime--;
        this.classList.add('disabled');
        showScoreAnimation("+10s", "#00b894");
    });

    document.getElementById('doublePoints').addEventListener('click', function() {
        if (powerUps.doublePoints <= 0) {
            showError('No more double points available!');
            return;
        }
        powerUps.doublePoints--;
        isDoublePointsActive = true;
        this.classList.add('disabled');
        showScoreAnimation("2x Points Active!", "#6c5ce7");
        
        const indicator = document.createElement('div');
        indicator.className = 'double-points-indicator';
        indicator.textContent = '2x Points Active!';
        document.querySelector('.game-stats').appendChild(indicator);
        
        setTimeout(() => {
            indicator.remove();
        }, 3000);
        
        const originalTotalQuestions = totalQuestions;
        const checkDeactivation = setInterval(() => {
            if (totalQuestions >= originalTotalQuestions + 3 || timeLeft <= 0) {
                isDoublePointsActive = false;
                clearInterval(checkDeactivation);
            }
        }, 1000);
    });

    document.getElementById('skipQuestion').addEventListener('click', function() {
        if (powerUps.skipQuestion <= 0) {
            showError('No more skips available!');
            return;
        }
        generateQuestion();
        powerUps.skipQuestion--;
        this.classList.add('disabled');
    });

    // Submit Answer
    document.getElementById('submitAnswer').addEventListener('click', submitAnswer);
    document.getElementById('answer').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            submitAnswer();
        }
    });

    // Restart Game
    document.getElementById('restartGame').addEventListener('click', function() {
        location.reload();
    });
});

function startTimer() {
    timerInterval = setInterval(function() {
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            endGame();
            return;
        }
        
        timeLeft--;
        updateTimerDisplay();
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    document.getElementById('timer').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
    if (timeLeft <= 30) {
        document.querySelector('.timer').style.color = '#d63031';
    }
}

function generateQuestion() {
    let num1, num2, operator;
    operator = ['+', '-', '*', '/'][Math.floor(Math.random() * 4)];

    if (level === 'easy') {
        if (operator === '-') {
            num1 = Math.floor(Math.random() * 9) + 2;
            num2 = Math.floor(Math.random() * (num1 - 1)) + 1;
        } else if (operator === '/') {
            num2 = Math.floor(Math.random() * 5) + 1;
            num1 = num2 * (Math.floor(Math.random() * 5) + 1);
        } else {
            num1 = Math.floor(Math.random() * 10) + 1;
            num2 = Math.floor(Math.random() * 10) + 1;
        }
    } else if (level === 'medium') {
        if (operator === '-') {
            num1 = Math.floor(Math.random() * 30) + 10;
            num2 = Math.floor(Math.random() * (num1 - 5)) + 5;
        } else if (operator === '/') {
            num2 = Math.floor(Math.random() * 8) + 3;
            num1 = num2 * (Math.floor(Math.random() * 10) + 3);
        } else if (operator === '*') {
            num1 = Math.floor(Math.random() * 15) + 5;
            num2 = Math.floor(Math.random() * 10) + 3;
        } else {
            num1 = Math.floor(Math.random() * 30) + 10;
            num2 = Math.floor(Math.random() * 30) + 10;
        }
    } else {
        if (operator === '-') {
            num1 = Math.floor(Math.random() * 60) + 40;
            num2 = Math.floor(Math.random() * (num1 - 20)) + 20;
        } else if (operator === '/') {
            num2 = Math.floor(Math.random() * 15) + 6;
            num1 = num2 * (Math.floor(Math.random() * 15) + 6);
        } else if (operator === '*') {
            num1 = Math.floor(Math.random() * 30) + 10;
            num2 = Math.floor(Math.random() * 20) + 10;
        } else {
            num1 = Math.floor(Math.random() * 80) + 20;
            num2 = Math.floor(Math.random() * 80) + 20;
        }
    }

    const questionElement = document.getElementById('question');
    questionElement.textContent = `${num1} ${operator} ${num2} = ?`;
    questionElement.dataset.answer = eval(`${num1} ${operator} ${num2}`).toFixed(2);
    totalQuestions++;

    questionElement.style.animation = 'none';
    void questionElement.offsetWidth;
    questionElement.style.animation = 'bounce 0.5s ease-in-out';
}

function submitAnswer() {
    const userAnswer = document.getElementById('answer').value.trim();
    const feedback = document.getElementById('feedback');
    
    if (!userAnswer) {
        showError('Please enter an answer!');
        return;
    }

    if (isNaN(userAnswer)) {
        showError('Please enter a valid number!');
        return;
    }

    const correctAnswer = parseFloat(document.getElementById('question').dataset.answer);
    const userAnswerNum = parseFloat(userAnswer);

    if (Math.abs(userAnswerNum - correctAnswer) < 0.01) {
        handleCorrectAnswer(feedback);
    } else {
        handleIncorrectAnswer(feedback, correctAnswer);
    }

    document.getElementById('answer').value = '';
    updateProgressBar();
    generateQuestion();
}

function handleCorrectAnswer(feedback) {
    // Reset to first comment if previous was incorrect
    if (lastAnswerType === 'incorrect') {
        currentCorrectIndex = 0;
    }
    
    const points = isDoublePointsActive ? 6 : 3;
    score += points;
    correctCount++;
    correctStreak++;
    
    // Get current correct comment
    feedback.textContent = correctComments[currentCorrectIndex];
    
    // Move to next comment (loop if at end)
    currentCorrectIndex = (currentCorrectIndex + 1) % correctComments.length;
    
    feedback.className = 'feedback correct';
    feedback.style.display = 'block';
    lastAnswerType = 'correct';
    
    document.getElementById('correctSound').play();
    showScoreAnimation(`+${points}`, "#00b894");
    createConfetti();
    updateScoreDisplay();
}

function handleIncorrectAnswer(feedback, correctAnswer) {
    // Reset to first comment if previous was correct
    if (lastAnswerType === 'correct') {
        currentIncorrectIndex = 0;
    }
    
    score = Math.max(0, score - 1);
    incorrectCount++;
    correctStreak = 0;
    
    // Get current incorrect comment
    feedback.textContent = `${incorrectComments[currentIncorrectIndex]} (Answer: ${correctAnswer})`;
    
    // Move to next comment (loop if at end)
    currentIncorrectIndex = (currentIncorrectIndex + 1) % incorrectComments.length;
    
    feedback.className = 'feedback incorrect';
    feedback.style.display = 'block';
    lastAnswerType = 'incorrect';
    
    document.getElementById('incorrectSound').play();
    showScoreAnimation("-1", "#d63031");
    updateScoreDisplay();
}

function updateScoreDisplay() {
    document.getElementById('score').textContent = score;
}

function updateProgressBar() {
    const progress = (correctCount / totalQuestions) * 100;
    document.getElementById('progressBar').style.width = `${progress}%`;
}

function createConfetti() {
    const colors = ['#6c5ce7', '#fd79a8', '#00b894', '#fdcb6e', '#0984e3'];
    const container = document.querySelector('.game-card');
    
    for (let i = 0; i < 30; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = `${Math.random() * 100}%`;
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.width = `${Math.random() * 6 + 3}px`;
        confetti.style.height = `${Math.random() * 6 + 3}px`;
        confetti.style.animationDuration = `${Math.random() * 2 + 1}s`;
        container.appendChild(confetti);
        
        setTimeout(() => {
            confetti.remove();
        }, 2000);
    }
}

function showScoreAnimation(text, color) {
    const animation = document.createElement('div');
    animation.className = 'score-animation';
    animation.textContent = text;
    animation.style.color = color;
    animation.style.left = `${Math.random() * 60 + 20}%`;
    
    document.querySelector('.game-card').appendChild(animation);
    
    setTimeout(() => {
        animation.remove();
    }, 1000);
}

function endGame() {
    clearInterval(timerInterval);
    document.getElementById('gameScreen').style.display = 'none';
    document.getElementById('gameOver').style.display = 'block';
    
    document.getElementById('totalQuestions').textContent = totalQuestions;
    document.getElementById('correctAnswers').textContent = correctCount;
    document.getElementById('incorrectAnswers').textContent = incorrectCount;
    document.getElementById('finalScore').textContent = score;
    
    const minutes = Math.floor((180 - timeLeft) / 60);
    const seconds = (180 - timeLeft) % 60;
    document.getElementById('timeTaken').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    const message = celebrateMessages.reduce((selected, current) => {
        return score >= current.minScore ? current : selected;
    }, celebrateMessages[0]).message;
    
    document.getElementById('celebrateMessage').textContent = message;
    
    if (score >= 20) {
        for (let i = 0; i < 20; i++) {
            setTimeout(() => createConfetti(), i * 50);
        }
    }
}