// Sélection des éléments HTML nécessaires pour le quiz
const container = document.querySelector('.container');
const questionElement = document.querySelector('.question');
const optionsElement = document.querySelector('.responses');
const timerElement = document.querySelector('.timer');
const stepElement = document.querySelector('.step');
const skipButton = document.querySelector('.skip input[type="button"]');
const backgroundMusic = document.getElementById('backgroundMusic');
const questionTime = 20; // Durée en secondes pour chaque question
let timerInterval; // Variable pour stocker l'intervalle du minuteur
let currentQuestionIndex, score, questions; // Variables pour suivre l'état du quiz

// Sélection des éléments de démarrage du quiz
const startQuizButton = document.getElementById('startQuizButton');
const startQuizTitle = document.getElementById('startQuizTitle');
const quizContainer = document.querySelector('.container');
const pseudoInput = document.querySelector('.pseudo');

// Création des objets Audio pour les sons de réussite et d'erreur
const successAudio = new Audio('../music/yay-6326.mp3');
const errorAudio = new Audio('../music/windows-error-sound-effect-35894.mp3');

// Écouteur d'événement pour le bouton "Commencer le quiz"
startQuizButton.addEventListener('click', () => {
    // Vérifie si le champ pseudo est vide
    if (pseudoInput.value.trim() === '') {
        alert('Veuillez entrer un pseudo.');
        return;
    }

    // Lecture de la musique de fond du quiz avec gestion des erreurs
    backgroundMusic.play().catch(e => {
        console.error("La lecture automatique de la musique a échoué", e);
    });

    // Affiche le conteneur du quiz et masque les éléments de démarrage
    quizContainer.style.display = 'flex';
    startQuizButton.style.display = 'none';
    startQuizTitle.style.display = 'none';
    pseudoInput.style.display = 'none';

    // Si des questions ont été chargées, commence le quiz
    if (questions && questions.length > 0) {
        startQuiz();
    }
});

// Chargement des questions à partir d'un fichier JSON
fetch('../quizz/default_quizz.json')
    .then(response => response.json())
    .then(data => {
        let allQuestions = data.quiz.questions;

        // Mélange aléatoirement les questions
        shuffle(allQuestions);

        // Sélectionne les 25 premières questions pour le quiz
        questions = allQuestions.slice(0, 25);

        // Si le conteneur du quiz est déjà affiché et un pseudo a été saisi, commence le quiz
        if (quizContainer.style.display === 'flex' && pseudoInput.value.trim() !== '') {
            startQuiz();
        }
    });

// Fonction pour mélanger les questions du quiz
//
// La fonction shuffle(array) a pour but de prendre un
// tableau (ou une liste) d'éléments et de les réorganiser
// de manière aléatoire. Imagine que tu aies un jeu de cartes,
// et que tu les mélanges pour qu'ils ne soient plus dans
// leur ordre d'origine. Eh bien, cette fonction fait exactement
// cela avec les éléments du tableau. Elle les échange aléatoirement
// les uns avec les autres jusqu'à ce que tu obtiennes un ordre aléatoire complet.
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

    // Vérifie à nouveau si le champ pseudo est vide
    if (pseudoInput.value.trim() === '') {
        alert('Veuillez entrer un pseudo.');
        return;
    }
    showNextQuestion();
}

// Fonction pour sélectionner une réponse
function selectAnswer(selected, correctAnswer, button) {
    // Désactive tous les boutons de réponse pour éviter les clics multiples
    document.querySelectorAll('.responses button').forEach(btn => btn.disabled = true);

    if (selected === correctAnswer) {
        score++;
        button.style.backgroundColor = "green"; // Met en vert le bouton de réponse correcte
        playAudio(successAudio); // Joue le son de réussite grâce à la fonction playAudio
    } else {
        button.style.backgroundColor = "darkred"; // Met en rouge le bouton de réponse incorrecte
        playAudio(errorAudio); // Joue le son d'erreur grâce à la fonction playAudio
    }
}

// Fonction pour jouer un audio avec gestion de la musique de fond
function playAudio(audio) {
    backgroundMusic.pause(); // Je mets en pause la musique de fond

    audio.play().then(() => {
        // Une fois l'audio terminé, réactive les boutons de réponse
        audio.onended = () => {
            backgroundMusic.play(); // Une fois la musique terminer je remets la musique de fond

            currentQuestionIndex++; // J'incrémente les étapes (2/25) par exemple
            showNextQuestion(); // Je passe  à la question suivante grâce à la fonction showNextQuestion
            document.querySelectorAll('.responses button').forEach(btn => {
                btn.disabled = false;
                btn.style.backgroundColor = "";
            }); // Je reset le style des boutons
        };
    }).catch(e => {
        console.error("Erreur lors de la lecture de la musique", e);
    });
}

// Fonction pour afficher la prochaine question
function showNextQuestion() {
    if (currentQuestionIndex >= questions.length) {
        endQuiz(); // Si toutes les questions ont été posées, termine le quiz
        return;
    }

    const question = questions[currentQuestionIndex];
    questionElement.textContent = question.question;
    optionsElement.innerHTML = '';

    // Crée les boutons de réponse pour chaque option
    question.options.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option;
        button.addEventListener('click', () => selectAnswer(option, question.answer, button));
        optionsElement.appendChild(button);
    });

    stepElement.textContent = `${currentQuestionIndex + 1}/${questions.length}`; // Là je modifie le texte pour les étapes

    resetTimer();
    startTimer();
}

// Réinitialise le timer
function resetTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerElement.textContent = formatTime(questionTime);
}

// Fonction pour formater le temps au format MM:SS pour que sa affiche 00:20 secondes
function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

// Démarre le timer
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
    }, 1000);
}

// Fonction pour terminer le quiz
function endQuiz() {
    clearInterval(timerInterval);
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;

    // Récupère le leaderboard depuis le stockage local ou crée un nouveau tableau
    let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    leaderboard.push({ pseudo: pseudoInput.value, score: score });

    // Trie le leaderboard en fonction du score décroissant pour afficher les meilleurs en premier
    leaderboard.sort((a, b) => b.score - a.score);

    // Enregistre le leaderboard dans le stockage local
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));

    // Affiche le résultat du quiz avec les options pour recommencer ou revenir à l'accueil
    container.innerHTML = `
        <h1>Fin du quiz!</h1>
        <p>Votre score : ${score}</p>
        <div class="end-quiz-buttons">
            <button id="restartQuizButton">Recommencer le Quizz</button>
            <button id="goToHomeButton">Retour à l'accueil</button>
        </div>
    `;

    // Écouteurs d'événements pour les boutons de recommencement et de retour à l'accueil
    document.getElementById('restartQuizButton').addEventListener('click', restartQuiz);
    document.getElementById('goToHomeButton').addEventListener('click', () => {
        window.location.href = 'index.html'; // Redirige vers la page d'accueil
    });
}

// Fonction pour recommencer le quiz (recharge la page)
function restartQuiz() {
    location.reload();
}

// Écouteur d'événement pour le bouton SKIP pour sauter une question
skipButton.addEventListener('click', () => {
    clearInterval(timerInterval);
    currentQuestionIndex++;
    showNextQuestion();
});
