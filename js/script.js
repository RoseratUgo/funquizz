const container = document.querySelector('.container');
const questionElement = document.querySelector('.question');
const optionsElement = document.querySelector('.responses');
const timerElement = document.querySelector('.timer');
const stepElement = document.querySelector('.step');
const skipButton = document.querySelector('.skip input[type="button"]');
const backgroundMusic = document.getElementById('backgroundMusic');
const questionTime = 20;
let timerInterval;
let currentQuestionIndex, score, questions;
const startQuizButton = document.getElementById('startQuizButton');
const startQuizTitle = document.getElementById('startQuizTitle');
const quizContainer = document.querySelector('.container');
const pseudoInput = document.querySelector('.pseudo');
const successAudio = new Audio('../music/yay-6326.mp3');
const errorAudio = new Audio('../music/windows-error-sound-effect-35894.mp3');

startQuizButton.addEventListener('click', () => {
    if (pseudoInput.value.trim() === '') {
        alert('Veuillez entrer un pseudo.');
        return;
    }

    backgroundMusic.play().catch(e => {
        console.error("La lecture automatique de la musique a échoué", e);
    });

    quizContainer.style.display = 'flex';

    startQuizButton.style.display = 'none';
    startQuizTitle.style.display = 'none';
    pseudoInput.style.display = 'none';

    if (questions && questions.length > 0) {
        startQuiz();
    }
});


fetch('../quizz/default_quizz.json')
    .then(response => response.json())
    .then(data => {
        let allQuestions = data.quiz.questions;
        shuffle(allQuestions);
        questions = allQuestions.slice(0, 25);

        if (quizContainer.style.display === 'flex' && pseudoInput.value.trim() !== '') {
            startQuiz();
        }
    });

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // échange les éléments
    }
}

function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    backgroundMusic.play();
    if (pseudoInput.value.trim() === '') {
        alert('Veuillez entrer un pseudo.');
        return;
    }
    showNextQuestion();
}


function selectAnswer(selected, correctAnswer, button) {
    document.querySelectorAll('.responses button').forEach(btn => btn.disabled = true);

    if (selected === correctAnswer) {
        score++;
        button.style.backgroundColor = "green";
        playAudio(successAudio);
    } else {
        button.style.backgroundColor = "darkred";
        playAudio(errorAudio);
    }
}
function playAudio(audio) {
    backgroundMusic.pause();

    audio.play().then(() => {
        audio.onended = () => {
            backgroundMusic.play();

            currentQuestionIndex++;
            showNextQuestion();
            document.querySelectorAll('.responses button').forEach(btn => {
                btn.disabled = false;
                btn.style.backgroundColor = "";
            });
        };
    }).catch(e => {
        console.error("Erreur lors de la lecture de la musique", e);
    });
}
function showNextQuestion() {
    if (currentQuestionIndex >= questions.length) {
        endQuiz();
        return;
    }

    const question = questions[currentQuestionIndex];
    questionElement.textContent = question.question;
    optionsElement.innerHTML = '';
    question.options.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option;
        button.addEventListener('click', () => selectAnswer(option, question.answer, button));
        optionsElement.appendChild(button);
    });
    stepElement.textContent = `${currentQuestionIndex + 1}/${questions.length}`;

    resetTimer();
    startTimer();
}

// Réinitialiser le timer
function resetTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerElement.textContent = formatTime(questionTime);
}

function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function startTimer() {
    let timeLeft = questionTime;
    timerInterval = setInterval(() => {
        timeLeft--;
        timerElement.textContent = formatTime(timeLeft);
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            currentQuestionIndex++;
            showNextQuestion();
        }
    }, 500);
}

function endQuiz() {
    clearInterval(timerInterval);
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;

    let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    leaderboard.push({ pseudo: pseudoInput.value, score: score });
    leaderboard.sort((a, b) => b.score - a.score);
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));

    container.innerHTML = `
        <h1>Fin du quiz!</h1>
        <p>Votre score : ${score}</p>
        <div class="end-quiz-buttons">
            <button id="restartQuizButton">Recommencer le Quizz</button>
            <button id="goToHomeButton">Retour à l'accueil</button>
        </div>
    `;

    document.getElementById('restartQuizButton').addEventListener('click', restartQuiz);
    document.getElementById('goToHomeButton').addEventListener('click', () => {
        window.location.href = 'index.html';
    });
}

function restartQuiz() {
    location.reload();
}

skipButton.addEventListener('click', () => {
    clearInterval(timerInterval);
    currentQuestionIndex++;
    showNextQuestion();
});
