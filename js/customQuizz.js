// Sélection des éléments HTML nécessaires pour le quiz
const container = document.querySelector('.container');
const questionElement = document.querySelector('.question');
const optionsElement = document.querySelector('.responses');
const timerElement = document.querySelector('.timer');
const stepElement = document.querySelector('.step');
const skipButton = document.querySelector('.skip input[type="button"]');
const backgroundMusic = document.getElementById('backgroundMusic');
const questionTime = 20; // Temps par question (en secondes)
let timerInterval; // Variable pour stocker l'intervalle du minuteur
let currentQuestionIndex, score, questions; // Variables pour suivre l'état du quiz
const successAudio = new Audio('../music/yay-6326.mp3'); // Son de réussite
const errorAudio = new Audio('../music/windows-error-sound-effect-35894.mp3'); // Son d'erreur

// Écouteur d'événement pour le chargement du document
document.addEventListener('DOMContentLoaded', function () {
    // Attache un gestionnaire d'événement 'change' à l'élément 'uploadFile' (en gros pour savoir si y a un fichier et si y a un fichier on lance le quiz)
    document.getElementById('uploadFile').addEventListener('change', handleFileUpload);
});

// Gestionnaire d'événement pour le téléchargement de fichiers
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const fileContent = e.target.result;
            try {
                const parsedData = JSON.parse(fileContent);
                if (parsedData && parsedData.quiz && parsedData.quiz.questions) {
                    questions = parsedData.quiz.questions;
                    shuffle(questions); // Mélange les questions
                    startQuiz(); // Lance le quiz une fois le fichier téléchargé et traité
                } else {
                    console.error("Le fichier JSON ne contient pas les données attendues.");
                }
            } catch (error) {
                console.error("Erreur lors de la lecture du fichier JSON", error);
            }
        };
        reader.readAsText(file);
    }
}

// Fonction pour mélanger les questions (même chose que dans script.js)
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Échange les éléments pour les mélanger
    }
}

// Fonction pour démarrer le quiz
function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    backgroundMusic.play();

    // Masque le champ d'entrée de fichier
    document.getElementById('uploadFile').style.display = 'none';

    // Affiche l'élément du quiz en utilisant style.display
    document.querySelector('.container').style.display = 'flex';

    showNextQuestion();
}

// Fonction pour sélectionner une réponse
function selectAnswer(selected, correctAnswer, button) {
    document.querySelectorAll('.responses button').forEach(btn => btn.disabled = true);

    if (selected === correctAnswer) {
        score++;
        button.style.backgroundColor = "green"; // Met en vert le bouton de réponse correcte
        playAudio(successAudio); // Joue le son de réussite
    } else {
        button.style.backgroundColor = "red"; // Met en rouge le bouton de réponse incorrecte
        playAudio(errorAudio); // Joue le son d'erreur
    }
}

// Fonction pour jouer un audio avec gestion de la musique de fond
function playAudio(audio) {
    backgroundMusic.pause();

    audio.play().then(() => {
        audio.onended = () => {
            backgroundMusic.play();

            // Déclenche la transition vers la prochaine question ici
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

// Fonction pour afficher la prochaine question
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

// Fonction pour réinitialiser le timer
function resetTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerElement.textContent = formatTime(questionTime);
}

// Fonction pour formater le temps au format MM:SS
function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

// Fonction pour démarrer le timer
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

// Fonction pour terminer le quiz
function endQuiz() {
    clearInterval(timerInterval);
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;

    container.innerHTML = `
        <h1>Fin du quiz!</h1>
        <p>Votre score : ${score}</p>
        <div class="end-quiz-buttons">
            <button id="restartQuizButton">Recommencer le Quizz</button>
        </div>
    `;

    document.getElementById('restartQuizButton').addEventListener('click', restartQuiz);
}

// Fonction pour recommencer le quiz (recharge la page)
function restartQuiz() {
    location.reload();
}

// Écouteur d'événement pour le bouton de saut de question
skipButton.addEventListener('click', () => {
    clearInterval(timerInterval);
    currentQuestionIndex++;
    showNextQuestion();
});
