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

// Comments for correct answers
const correctComments = [
    "Correct! ✅",
    "Awesome! 🎉",
    "Wow! 🔥",
    "Math Genius! 🧠✨"
];

// Comments for incorrect answers
const incorrectComments = [
    "Oops! 😕",
    "Try Again! 😅",
    "Don't Give Up! 💪"
];

// Celebrate messages based on score
const celebrateMessages = [
    { minScore: 0, message: "Keep practicing! You'll get better! 💪" },
    { minScore: 10, message: "Good job! You're getting there! 🎉" },
    { minScore: 20, message: "Great work! You're a math whiz! 🔥" },
    { minScore: 30, message: "Amazing! You're a Math Genius! 🧠✨" }
];

// Function to get the celebrate message based on score
function getCelebrateMessage(score) {
    return celebrateMessages.reduce((selectedMessage, currentMessage) => {
        if (score >= currentMessage.minScore && currentMessage.minScore > selectedMessage.minScore) {
            return currentMessage;
        }
        return selectedMessage;
    }, { minScore: -1, message: "" }).message;
}

// Themes
const themes = {
    ocean: { background: "linear-gradient(135deg, #93C5FD, #3B82F6)", bodyClass: "ocean-theme" },
    sunset: { background: "linear-gradient(135deg, #FCD34D, #F59E0B)", bodyClass: "sunset-theme" },
    forest: { background: "linear-gradient(135deg, #6EE7B7, #10B981)", bodyClass: "forest-theme" },
    midnight: { background: "linear-gradient(135deg, #1E1E2F, #3B3B4F)", bodyClass: "midnight-theme" },
    candy: { background: "linear-gradient(135deg, #FF6F61, #FFA07A)", bodyClass: "candy-theme" },
};

// Theme Selector
document.querySelectorAll('.theme-selector button').forEach(button => {
    button.addEventListener('click', function() {
        const theme = themes[this.dataset.theme];
        document.body.style.background = theme.background;
        document.body.className = theme.bodyClass;
    });
});

// Function to show error message
function showError(message) {
    console.log('Error:', message); // Debugging
    const errorButton = document.getElementById('errorButton');
    errorButton.textContent = message;
    errorButton.style.display = 'block';
    setTimeout(() => {
        errorButton.style.display = 'none';
    }, 3000);
}

// Start Game
document.getElementById('startGame').addEventListener('click', function() {
    // Preload sounds
    document.getElementById('correctSound').load();
    document.getElementById('incorrectSound').load();

    let playerName = document.getElementById('playerName').value.trim();

    // Validate player name
    if (playerName === '') {
        showError('Please enter your name!'); // Show error message
        return;
    }

    // Check for invalid characters using regex
    const validNameRegex = /^[a-zA-Z0-9_\- ]+$/; // Allows letters, numbers, _, -, and spaces
    if (!validNameRegex.test(playerName)) {
        showError('Invalid characters! Only letters, numbers, _, -, and spaces are allowed.'); // Show error message
        return;
    }

    // If validation passes, start the game
    level = document.getElementById('level').value;
    document.getElementById('playerNameDisplay').textContent = playerName;
    document.getElementById('landingPage').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'block';
    startTimer();
    generateQuestion();
});

// Power-Ups
document.getElementById('extraTime').addEventListener('click', function() {
    if (powerUps.extraTime > 0) {
        timeLeft += 10;
        powerUps.extraTime--;
        this.style.opacity = '0.5';
        this.style.pointerEvents = 'none';
    }
});

document.getElementById('doublePoints').addEventListener('click', function() {
    if (powerUps.doublePoints > 0) {
        score += 3; // Double points for the next correct answer
        powerUps.doublePoints--;
        this.style.opacity = '0.5';
        this.style.pointerEvents = 'none';
    }
});

document.getElementById('skipQuestion').addEventListener('click', function() {
    if (powerUps.skipQuestion > 0) {
        generateQuestion();
        powerUps.skipQuestion--;
        this.style.opacity = '0.5';
        this.style.pointerEvents = 'none';
    }
});

function startTimer() {
    timerInterval = setInterval(function() {
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            endGame();
        }
        let minutes = Math.floor(timeLeft / 60);
        let seconds = timeLeft % 60;
        document.getElementById('timer').textContent = `Time: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        timeLeft--;
    }, 1000);
}

function generateQuestion() {
    let num1, num2, operator;
    if (level === 'easy') {
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
    } else if (level === 'medium') {
        num1 = Math.floor(Math.random() * 20) + 1;
        num2 = Math.floor(Math.random() * 20) + 1;
    } else if (level === 'hard') {
        num1 = Math.floor(Math.random() * 50) + 1;
        num2 = Math.floor(Math.random() * 50) + 1;
    }

    operator = ['+', '-', '*', '/'][Math.floor(Math.random() * 4)];
    if (operator === '/') {
        num1 = num1 * num2; // Ensure division results in whole numbers
    }

    const questionElement = document.getElementById('question');
    questionElement.textContent = `${num1} ${operator} ${num2} = ?`;
    questionElement.dataset.answer = eval(`${num1} ${operator} ${num2}`).toFixed(2);
    totalQuestions++;

    // Trigger bounce animation
    questionElement.style.animation = 'none'; // Reset animation
    void questionElement.offsetWidth; // Trigger reflow
    questionElement.style.animation = 'bounce 0.5s ease-in-out'; // Reapply animation
}

// Function to show score animation
function showScoreAnimation(points, color) {
    let scoreAnimation = document.getElementById('scoreAnimation');
    scoreAnimation.textContent = (points > 0 ? `+${points}` : `${points}`);
    scoreAnimation.style.color = color;

    // Reset animation
    scoreAnimation.style.animation = 'none';
    void scoreAnimation.offsetWidth; // Trigger reflow
    scoreAnimation.style.animation = 'floatUp 1s ease-out';

    // Display the animation
    scoreAnimation.style.display = 'block';

    // Hide the animation after 1 second
    setTimeout(() => {
        scoreAnimation.style.display = 'none';
    }, 1000);
}

document.getElementById('submitAnswer').addEventListener('click', function() {
    let userAnswer = document.getElementById('answer').value.trim();
    let feedback = document.getElementById('feedback');
    feedback.style.display = 'block';

    if (userAnswer === '') {
        feedback.className = 'alert alert-danger alert-box';
        feedback.textContent = 'Please enter an answer!';
        return;
    }

    let correctAnswer = parseFloat(document.getElementById('question').dataset.answer);
    userAnswer = parseFloat(userAnswer);

    if (userAnswer === correctAnswer) {
        score += 3;
        correctCount++;
        correctStreak++;
        if (correctStreak >= 3) {
            feedback.textContent = correctComments[3]; // Math Genius!
        } else {
            feedback.textContent = correctComments[correctStreak - 1];
        }
        feedback.className = 'alert alert-success alert-box';
        document.getElementById('correctSound').play();
        showScoreAnimation(3, 'green'); // Show +3 animation
        createConfetti();
    } else {
        score -= 1;
        incorrectCount++;
        correctStreak = 0; // Reset streak
        feedback.textContent = incorrectComments[Math.min(incorrectCount - 1, incorrectComments.length - 1)];
        feedback.className = 'alert alert-danger alert-box';
        document.getElementById('incorrectSound').play();
        showScoreAnimation(-1, 'red'); // Show -1 animation
    }

    document.getElementById('score').textContent = `Score: ${score}`;
    document.getElementById('answer').value = '';
    updateProgressBar();
    generateQuestion();
});

function updateProgressBar() {
    let progress = (correctCount / totalQuestions) * 100;
    document.getElementById('progressBar').style.width = `${progress}%`;
}

function createConfetti() {
    const emojis = ["🎉", "🎊", "✨"];
    for (let i = 0; i < 30; i++) {
        let confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        confetti.style.left = `${Math.random() * 100}%`;
        confetti.style.animationDelay = `${Math.random()}s`;
        document.getElementById('gameScreen').appendChild(confetti);
        setTimeout(() => confetti.remove(), 1000);
    }
}

function endGame() {
    document.getElementById('gameScreen').style.display = 'none';
    document.getElementById('gameOver').style.display = 'block';

    // Display stats
    document.getElementById('totalQuestions').textContent = totalQuestions;
    document.getElementById('correctAnswers').textContent = correctCount;
    document.getElementById('incorrectAnswers').textContent = incorrectCount;
    document.getElementById('finalScore').textContent = score;

    // Show celebrate message
    let message = getCelebrateMessage(score); // Use the new function
    document.getElementById('celebrateMessage').textContent = message;

    // Add confetti
    for (let i = 0; i < 50; i++) {
        createConfetti();
    }
}

document.getElementById('restartGame').addEventListener('click', function() {
    location.reload();
});