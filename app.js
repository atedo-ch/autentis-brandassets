// Application State
const state = {
    questionsData: null,
    currentQuestionIndex: 0,
    answers: {}, // Store answers by question ID
    ampelStatus: null,
    leadData: null
};

// Initialize Application
async function init() {
    try {
        const response = await fetch('questions.json');
        state.questionsData = await response.json();
        setupEventListeners();
    } catch (error) {
        console.error('Fehler beim Laden der Fragen:', error);
        alert('Die Anwendung konnte nicht geladen werden. Bitte laden Sie die Seite neu.');
    }
}

// Setup Event Listeners
function setupEventListeners() {
    document.getElementById('start-button').addEventListener('click', startCheck);
    document.getElementById('answer-yes').addEventListener('click', () => selectAnswer(true));
    document.getElementById('answer-no').addEventListener('click', () => selectAnswer(false));
    document.getElementById('info-toggle').addEventListener('click', toggleInfo);
    document.getElementById('btn-back').addEventListener('click', goToPreviousQuestion);
    document.getElementById('btn-next').addEventListener('click', goToNextQuestion);
    document.getElementById('proceed-to-lead').addEventListener('click', showLeadForm);
    document.getElementById('lead-form').addEventListener('submit', handleLeadSubmit);
    document.getElementById('photo-upload').addEventListener('change', handlePhotoUpload);
}

// Start Check
function startCheck() {
    state.currentQuestionIndex = 0;
    state.answers = {};
    showScreen('question-screen');
    displayQuestion();
}

// Select Answer
function selectAnswer(isYes) {
    const allQuestions = getAllQuestions();
    const currentQuestion = allQuestions[state.currentQuestionIndex];

    // Store answer
    state.answers[currentQuestion.id] = isYes;

    // Update UI
    updateAnswerButtons();

    // Enable next button
    document.getElementById('btn-next').disabled = false;
}

// Update Answer Buttons UI
function updateAnswerButtons() {
    const allQuestions = getAllQuestions();
    const currentQuestion = allQuestions[state.currentQuestionIndex];
    const currentAnswer = state.answers[currentQuestion.id];

    const yesBtn = document.getElementById('answer-yes');
    const noBtn = document.getElementById('answer-no');

    yesBtn.classList.toggle('selected', currentAnswer === true);
    noBtn.classList.toggle('selected', currentAnswer === false);
}

// Go to Previous Question
function goToPreviousQuestion() {
    if (state.currentQuestionIndex > 0) {
        state.currentQuestionIndex--;
        displayQuestion();
    }
}

// Go to Next Question
function goToNextQuestion() {
    const allQuestions = getAllQuestions();

    if (state.currentQuestionIndex < allQuestions.length - 1) {
        state.currentQuestionIndex++;
        displayQuestion();
    } else {
        // Last question - calculate result and show
        calculateResult();
        showResultScreen();
    }
}

// Display Current Question
function displayQuestion() {
    const allQuestions = getAllQuestions();
    const totalQuestions = allQuestions.length;
    const currentQuestion = allQuestions[state.currentQuestionIndex];
    const section = getSectionForQuestion(state.currentQuestionIndex);

    // Update progress
    const progressPercent = ((state.currentQuestionIndex + 1) / totalQuestions) * 100;
    document.getElementById('progress-fill').style.width = `${progressPercent}%`;
    document.getElementById('progress-text').textContent = `Frage ${state.currentQuestionIndex + 1} von ${totalQuestions}`;

    // Update question content
    document.getElementById('section-title').textContent = section.title;
    document.getElementById('question-text').textContent = currentQuestion.text;
    document.getElementById('info-text').textContent = currentQuestion.info;
    document.getElementById('info-text').classList.remove('visible');

    // Update button states
    updateAnswerButtons();

    // Update navigation buttons
    const backBtn = document.getElementById('btn-back');
    const nextBtn = document.getElementById('btn-next');

    backBtn.disabled = state.currentQuestionIndex === 0;

    const hasAnswer = state.answers[currentQuestion.id] !== undefined;
    nextBtn.disabled = !hasAnswer;

    // Update next button text
    if (state.currentQuestionIndex === totalQuestions - 1) {
        nextBtn.textContent = 'Ergebnis anzeigen →';
    } else {
        nextBtn.textContent = 'Weiter →';
    }
}

// Get all questions as flat array
function getAllQuestions() {
    const questions = [];
    state.questionsData.sections.forEach(section => {
        section.questions.forEach(question => {
            questions.push(question);
        });
    });
    return questions;
}

// Get section for current question
function getSectionForQuestion(questionIndex) {
    let currentIndex = 0;
    for (const section of state.questionsData.sections) {
        if (questionIndex < currentIndex + section.questions.length) {
            return section;
        }
        currentIndex += section.questions.length;
    }
    return state.questionsData.sections[0];
}

// Toggle Info Text
function toggleInfo() {
    const infoText = document.getElementById('info-text');
    infoText.classList.toggle('visible');
}

// Calculate Result based on Ampel Logic
function calculateResult() {
    // Count "Nein" answers (false values)
    let riskPoints = 0;
    Object.values(state.answers).forEach(answer => {
        if (answer === false) {
            riskPoints++;
        }
    });

    const scoring = state.questionsData.scoring;

    if (riskPoints >= scoring.red.min && riskPoints <= scoring.red.max) {
        state.ampelStatus = 'red';
    } else if (riskPoints >= scoring.yellow.min && riskPoints <= scoring.yellow.max) {
        state.ampelStatus = 'yellow';
    } else if (riskPoints >= scoring.green.min && riskPoints <= scoring.green.max) {
        state.ampelStatus = 'green';
    }
}

// Show Result Screen
function showResultScreen() {
    const scoring = state.questionsData.scoring[state.ampelStatus];

    // Update Ampel indicator
    const ampelCircle = document.getElementById('ampel-circle');
    const ampelLabel = document.getElementById('ampel-label');
    ampelCircle.className = `ampel-circle ampel-${state.ampelStatus}`;
    ampelLabel.textContent = scoring.label;

    // Update result content
    document.getElementById('result-title').textContent = scoring.title;
    document.getElementById('result-description').textContent = scoring.description;
    document.getElementById('result-recommendation').textContent = scoring.recommendation;

    showScreen('result-screen');
}

// Show Lead Form
function showLeadForm() {
    const scoring = state.questionsData.scoring[state.ampelStatus];

    // Contextualize lead form based on Ampel status
    let contextText = '';
    if (state.ampelStatus === 'red') {
        contextText = 'Aufgrund des ermittelten hohen Risikos empfehlen wir dringend eine fachliche Ersteinschätzung. Geben Sie Ihre Kontaktdaten ein, um das Ergebnis zu dokumentieren und eine Einschätzung zu erhalten.';
    } else if (state.ampelStatus === 'yellow') {
        contextText = 'Das Ergebnis zeigt erhöhte Risiken. Eine fachliche Ersteinschätzung kann helfen, die identifizierten Lücken zu schliessen. Geben Sie Ihre Kontaktdaten ein, um das Ergebnis zu sichern.';
    } else {
        contextText = 'Sichern Sie Ihr Ergebnis für die Projektdokumentation. Geben Sie Ihre Kontaktdaten ein, um eine Bestätigung und Ersteinschätzung zu erhalten.';
    }

    document.getElementById('lead-context').textContent = contextText;
    showScreen('lead-screen');
}

// Handle Lead Form Submit
function handleLeadSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.target);

    // Count risk points
    let riskPoints = 0;
    Object.values(state.answers).forEach(answer => {
        if (answer === false) riskPoints++;
    });

    state.leadData = {
        firstname: formData.get('firstname'),
        lastname: formData.get('lastname'),
        email: formData.get('email'),
        description: formData.get('description'),
        ampelStatus: state.ampelStatus,
        riskPoints: riskPoints,
        answers: state.answers,
        timestamp: new Date().toISOString()
    };

    // In production, this would send data to backend
    console.log('Lead Data:', state.leadData);

    showSuccessScreen();
}

// Show Success Screen
function showSuccessScreen() {
    const scoring = state.questionsData.scoring[state.ampelStatus];

    let statusMessage = '';
    if (state.ampelStatus === 'red') {
        statusMessage = `Ihr Check ergab den Status ${scoring.label}. Ein Spezialist wird sich zeitnah bei Ihnen melden, um die nächsten Schritte zu besprechen.`;
    } else if (state.ampelStatus === 'yellow') {
        statusMessage = `Ihr Check ergab den Status ${scoring.label}. Sie erhalten in Kürze eine Ersteinschätzung per E-Mail.`;
    } else {
        statusMessage = `Ihr Check ergab den Status ${scoring.label}. Eine Bestätigung wurde an Ihre E-Mail-Adresse gesendet.`;
    }

    document.getElementById('success-status').textContent = statusMessage;
    showScreen('success-screen');
}

// Handle Photo Upload
function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const uploadStatus = document.getElementById('upload-status');
        uploadStatus.textContent = `Foto ausgewählt: ${file.name}`;

        // In production, this would upload to backend
        console.log('Photo uploaded:', file.name);
    }
}

// Show Screen
function showScreen(screenId) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);
