// DOM Elements
const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultsScreen = document.getElementById('results-screen');
const startBtn = document.getElementById('start-btn');
const nextBtn = document.getElementById('next-btn');
const restartBtn = document.getElementById('restart-btn');
const questionElement = document.getElementById('question');
const optionsElement = document.getElementById('options');
const progressElement = document.getElementById('progress');
const scoreElement = document.getElementById('score');
const finalScoreElement = document.getElementById('final-score');
const highScoresList = document.getElementById('high-scores-list');

// Quiz Variables
let currentQuestionIndex = 0;
let score = 0;
let questions = [];

// Fetch Questions from API
async function fetchQuestions() {
  const category = document.getElementById('category').value;
  const difficulty = document.getElementById('difficulty').value;
  const amount = document.getElementById('amount').value;

  let apiUrl = `https://opentdb.com/api.php?amount=${amount}`;

  if (category !== 'any') apiUrl += `&category=${category}`;
  if (difficulty !== 'any') apiUrl += `&difficulty=${difficulty}`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    questions = data.results.map(q => ({
      question: decodeHTML(q.question),
      correctAnswer: decodeHTML(q.correct_answer),
      incorrectAnswers: q.incorrect_answers.map(a => decodeHTML(a)),
      category: q.category,
      difficulty: q.difficulty
    }));
    startQuiz();
  } catch (error) {
    alert('Failed to load questions. Please try again.');
    console.error(error);
  }
}

// Helper function to decode HTML entities
function decodeHTML(html) {
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
}

// Start Quiz
function startQuiz() {
  startScreen.classList.remove('active');
  quizScreen.classList.add('active');
  showQuestion();
}

// Display Question
function showQuestion() {
  const currentQuestion = questions[currentQuestionIndex];
  questionElement.textContent = currentQuestion.question;
  
  // Combine and shuffle answers
  const allAnswers = [
    currentQuestion.correctAnswer,
    ...currentQuestion.incorrectAnswers
  ].sort(() => Math.random() - 0.5);

  optionsElement.innerHTML = '';
  allAnswers.forEach(answer => {
    const button = document.createElement('div');
    button.classList.add('option');
    button.textContent = answer;
    button.addEventListener('click', () => selectAnswer(answer));
    optionsElement.appendChild(button);
  });

  progressElement.textContent = `Question ${currentQuestionIndex + 1}/${questions.length}`;
  scoreElement.textContent = `Score: ${score}`;
  nextBtn.disabled = true;
}

// Handle Answer Selection
function selectAnswer(selectedAnswer) {
  const currentQuestion = questions[currentQuestionIndex];
  const options = document.querySelectorAll('.option');
  let isCorrect = false;

  options.forEach(option => {
    option.classList.remove('correct', 'incorrect');
    if (option.textContent === currentQuestion.correctAnswer) {
      option.classList.add('correct');
    }
    if (option.textContent === selectedAnswer) {
      if (selectedAnswer === currentQuestion.correctAnswer) {
        option.classList.add('correct');
        isCorrect = true;
        score++;
        scoreElement.textContent = `Score: ${score}`;
      } else {
        option.classList.add('incorrect');
      }
    }
    option.style.pointerEvents = 'none';
  });

  nextBtn.disabled = false;
}

// Show Results
function showResults() {
  quizScreen.classList.remove('active');
  resultsScreen.classList.add('active');
  finalScoreElement.textContent = `You scored ${score}/${questions.length}`;
  updateHighScores();
}

// Update High Scores
function updateHighScores() {
  const highScores = JSON.parse(localStorage.getItem('highScores')) || [];
  const scoreData = {
    score: score,
    total: questions.length,
    date: new Date().toLocaleDateString()
  };
  
  highScores.push(scoreData);
  highScores.sort((a, b) => (b.score/b.total) - (a.score/a.total));
  if (highScores.length > 10) highScores.length = 10;
  
  localStorage.setItem('highScores', JSON.stringify(highScores));
  
  highScoresList.innerHTML = highScores.map((score, index) => 
    `<li>${index + 1}. ${score.score}/${score.total} (${score.date})</li>`
  ).join('');
}

// Event Listeners
startBtn.addEventListener('click', fetchQuestions);
nextBtn.addEventListener('click', () => {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    showQuestion();
  } else {
    showResults();
  }
});
restartBtn.addEventListener('click', () => {
  currentQuestionIndex = 0;
  score = 0;
  resultsScreen.classList.remove('active');
  startScreen.classList.add('active');
});