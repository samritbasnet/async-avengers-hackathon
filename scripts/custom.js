const questionElement = document.getElementById('question');
const optionsElement = document.getElementById('options');
const feedbackElement = document.getElementById('feedback');
const errorElement = document.getElementById('error');
const timerFillElement = document.getElementById('timer-fill');
const startButton = document.getElementById('start-button');
const moneyLadderElement1 = document.getElementById('money-ladder-1');
const moneyLadderElement2 = document.getElementById('money-ladder-2');
const moneyLadder = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const keyMap = {
    q: 0,
    w: 1,
    a: 2,
    s: 3,
    i: 0,
    o: 1,
    k: 2,
    l: 3
};
const playerKeys = {
    0: ['q', 'w', 'a', 's'],
    1: ['i', 'o', 'k', 'l']
};
let questionAnswered = false;
startButton.addEventListener('click', startGame);
function startGame() {
    let questions = [];
    let currentQuestion;
    let timer;
    let timeLeft = 10;
    let playerAnswers = [,];
    let gameStarted = false;
    let gameEnded = false;
    let scores = [0, 0];
    let currentLadderIndex = [0, 0];
    let options = [];
    startButton.style.display = 'none';
    gameStarted = true;
    gameEnded = false;
    resetMoneyLadders();
    getQuestions();
    document.addEventListener('keydown', function (event) {
        if (!gameStarted || gameEnded) return;

        const key = event.key.toLowerCase();
        let playerIndex = -1;

        if (playerKeys[0].includes(key)) {
            playerIndex = 0;
        } else if (playerKeys[1].includes(key)) {
            playerIndex = 1;
        }

        if (playerIndex !== -1) {
            const selectedIndex = keyMap[key];
            if (selectedIndex !== undefined && playerAnswers[playerIndex] === null) {
                playerAnswers[playerIndex] = selectedIndex;
                handleAnswer(playerIndex, selectedIndex);
            }
        }
    });
    function updateMoneyLadderDisplay() {
        const ladderItems1 = moneyLadderElement1.querySelectorAll('li');
        const ladderItems2 = moneyLadderElement2.querySelectorAll('li');
        ladderItems1.forEach(item => item.classList.remove('current'));
        ladderItems2.forEach(item => item.classList.remove('current'));
        ladderItems1[currentLadderIndex[0]].classList.add('current');
        ladderItems2[currentLadderIndex[1]].classList.add('current');
    }
    function resetMoneyLadders() {
        const ladderItems1 = moneyLadderElement1.querySelectorAll('li');
        const ladderItems2 = moneyLadderElement2.querySelectorAll('li');
        ladderItems1.forEach(item => item.classList.remove('current'));
        ladderItems2.forEach(item => item.classList.remove('current'));
        updateMoneyLadderDisplay();
    }
    async function getQuestions() {
        try {
            const response = await axios.get('https://opentdb.com/api.php?amount=50&category=9&type=multiple');

            if (response.data.response_code === 0) {
                questions = filterQuestions(response.data.results);
                loadQuestion();
            }

        } catch (error) {
            console.error(error);
        }
    }
    function filterQuestions(questions) {
        return questions.filter(q =>
            !q.question.includes('&') &&
            !q.incorrect_answers.some(a => a.includes('&')) &&
            !q.correct_answer.includes('&')
        );
    }
    function loadQuestion() {
        if (questions.length === 0 || gameEnded) {
            endGame();
            return;
        }
        questionAnswered = false;
        currentQuestion = questions.pop();
        questionElement.innerText = currentQuestion.question;
        optionsElement.innerHTML = '';
        feedbackElement.innerHTML = '';
        options = [...currentQuestion.incorrect_answers, currentQuestion.correct_answer];
        shuffleArray(options);
        options.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.innerText = `${index + 1}. ${option} `;
            const player1Key = playerKeys[0][index];
            const player2Key = playerKeys[1][index];
            optionElement.innerHTML = `<span class="player1-key">${player1Key.toUpperCase()}</span> ${optionElement.innerText} <span class="player2-key">${player2Key.toUpperCase()}</span>`;
            optionElement.dataset.index = index;
            optionsElement.appendChild(optionElement);
        });
        playerAnswers = [null, null];
        moneyLadderElement1.querySelectorAll('li').forEach(li => li.classList.remove('player1-answered'));
        moneyLadderElement2.querySelectorAll('li').forEach(li => li.classList.remove('player2-answered'));
        startTimer();
    }
    function startTimer() {
        timeLeft = 10;
        updateTimerDisplay();
        timer = setInterval(() => {
            timeLeft -= 0.1;
            updateTimerDisplay();
            if (timeLeft <= 0) {
                clearInterval(timer);
                endQuestion();
            }
        }, 100);
    }
    function updateTimerDisplay() {
        const fillPercentage = (timeLeft / 10) * 100;
        timerFillElement.style.transform = `scaleY(${fillPercentage / 100})`;
    }
    function handleAnswer(playerIndex, selectedIndex) {
        if (!gameStarted || gameEnded) return;
        const correctAnswerIndex = options.indexOf(currentQuestion.correct_answer);
        if (questionAnswered) {
            return;
        }
        const ladderItems = (playerIndex === 0) ? moneyLadderElement1.querySelectorAll('li') : moneyLadderElement2.querySelectorAll('li');
        ladderItems.forEach(li => li.classList.remove((playerIndex === 0) ? 'player1-answered' : 'player2-answered'));
        if (selectedIndex === correctAnswerIndex) {
            if (!questionAnswered) {
                scores[playerIndex]++;
                currentLadderIndex[playerIndex] = Math.min(currentLadderIndex[playerIndex] + 1, moneyLadder.length - 1);

                ladderItems[currentLadderIndex[playerIndex]].classList.add((playerIndex === 0) ? 'player1-answered' : 'player2-answered');
            }
            questionAnswered = true;
        }
        updateMoneyLadderDisplay();
        if (playerAnswers[0] !== null && playerAnswers[1] !== null) {
            endQuestion();
        }
    }
    function endQuestion() {
        clearInterval(timer);
        revealCorrectAnswer();
        setTimeout(() => {
            loadQuestion();
        }, 2000);
    }
    function revealCorrectAnswer() {
        const correctAnswerIndex = options.indexOf(currentQuestion.correct_answer);
        const optionElements = optionsElement.querySelectorAll('div');
        optionElements.forEach((optionElement, index) => {
            if (index == correctAnswerIndex) {
                optionElement.classList.add('correct-answer');
            }
        });
    }
    function endGame() {
        gameStarted = false;
        gameEnded = true;
        questionElement.innerText = `Game Over! Player 1 Score: ${scores[0]}, Player 2 Score: ${scores[1]}`;
        optionsElement.innerHTML = '';
        feedbackElement.innerText = '';
        startButton.style.display = 'block';
    }
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
}