// quiz.js - Main quiz functionality extracted from s (1).html

// Google Apps Script URLs
const DETAILED_RESULTS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyDQPaaj3mB0_Ctw6tqqxigo1y9_P9cQs16mAljqrR1QwsomHHq1ImuQ00OtDjhXd_L/exec';
const SUMMARY_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyjuDlzBCp0D559rHAeOmCCpVk6aGHLlMYCdkfvRslI-GBAGgzDT2yWu11FMB4gMN-8/exec';
const FEEDBACK_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxTjICjfahA7EL_bgpzshrYxwIXSOhGw3Qiq-TZOreIwr0unSYklfiiQzK_1hoah63P/exec';

// Quiz state variables
let currentQuestionIndex = 0;
let userAnswers = [];
let quizData = [];
let timerInterval = null;
let timeLeft = 0;
let visitedQuestions = [];
let currentUser = null;
let currentLanguage = 'en'; // Default language is English

// Language content
const languageContent = {
    en: {
        quizTitle: "Mathematics Quiz",
        timeRemaining: "Time Remaining:",
        questionReview: "Question Review",
        answered: "Answered",
        skipped: "Skipped",
        unanswered: "Unanswered",
        current: "Current",
        prev: "Previous",
        next: "Next",
        submit: "Submit Quiz",
        results: "Quiz Results",
        feedback: "Feedback",
        instructionTitle: "Quiz Instructions",
        importantWarning: "Important Warning:",
        warningText: "Any kind of copying will result in disqualification of your test.",
        testInstructions: "Test Instructions:",
        instructionsList: [
            "This quiz has a total of 30 questions",
            "You have 60 minutes to complete the test",
            "Each question has four options, choose the correct answer",
            "Navigate between questions using Previous and Next buttons",
            "Go directly to any question using the Question Review panel",
            "Once you select an answer, it will be automatically saved",
            "You can change your answer at any time",
            "Click the Submit Quiz button after completing the test"
        ],
        instructionNote: "Read all instructions carefully and take the test honestly.",
        feedbackTitle: "Feedback",
        feedbackNameLabel: "Student Name",
        feedbackMobileLabel: "Mobile Number",
        feedbackComputerLabel: "Computer Number",
        feedbackMessageLabel: "Message for Updates",
        savingFeedback: "Saving your feedback...",
        submitFeedback: "Submit Feedback",
        feedbackSuccessTitle: "Feedback Submitted Successfully!",
        feedbackSuccessText: "Thank you for your valuable feedback."
    },
    hi: {
        quizTitle: "गणित प्रश्नोत्तरी",
        timeRemaining: "शेष समय:",
        questionReview: "प्रश्न समीक्षा",
        answered: "उत्तर दिया",
        skipped: "छोड़ा गया",
        unanswered: "अनुत्तरित",
        current: "वर्तमान",
        prev: "पिछला",
        next: "अगला",
        submit: "प्रश्नोत्तरी जमा करें",
        results: "प्रश्नोत्तरी परिणाम",
        feedback: "प्रतिक्रिया",
        instructionTitle: "प्रश्नोत्तरी निर्देश",
        importantWarning: "महत्वपूर्ण चेतावनी:",
        warningText: "किसी भी प्रकार की नकल करने पर आपका टेस्ट अयोग्य घोषित कर दिया जाएगा।",
        testInstructions: "टेस्ट निर्देश:",
        instructionsList: [
            "इस क्विज में कुल 30 प्रश्न हैं",
            "आपके पास पूरा टेस्ट देने के लिए 60 मिनट का समय है",
            "प्रत्येक प्रश्न के चार विकल्प हैं, सही उत्तर चुनें",
            "Previous और Next बटन का उपयोग करके प्रश्नों के बीच नेविगेट कर सकते हैं",
            "Question Review पैनल से किसी भी प्रश्न पर सीधे जा सकते हैं",
            "एक बार उत्तर चुनने के बाद वह स्वचालित रूप से सेव हो जाएगा",
            "किसी भी समय अपना उत्तर बदल सकते हैं",
            "टेस्ट पूरा करने के बाद Submit Quiz बटन पर क्लिक करें"
        ],
        instructionNote: "सभी निर्देशों को ध्यान से पढ़ें और ईमानदारी से टेस्ट दें।",
        feedbackTitle: "प्रतिक्रिया",
        feedbackNameLabel: "छात्र का नाम",
        feedbackMobileLabel: "मोबाइल नंबर",
        feedbackComputerLabel: "कंप्यूटर नंबर",
        feedbackMessageLabel: "अपडेट के लिए संदेश",
        savingFeedback: "आपकी प्रतिक्रिया सहेजी जा रही है...",
        submitFeedback: "प्रतिक्रिया जमा करें",
        feedbackSuccessTitle: "प्रतिक्रिया सफलतापूर्वक जमा!",
        feedbackSuccessText: "आपकी मूल्यवान प्रतिक्रिया के लिए धन्यवाद।"
    }
};

// DOM elements
let loginSection, userInfoPanel, quizContainer, resultsContainer, questionContainer;
let prevBtn, nextBtn, submitQuiz, progressBar, scoreElement, analysisElement;
let feedbackBtn, timerElement, reviewButtons, modeToggle, instructionToggle, languageToggle;
let modeIcon, loginForm, feedbackModal, instructionModal, feedbackForm, closeFeedbackModal;
let closeInstructionModal, feedbackResult, displayStudentName, displayMobile, displayClass;
let displayComputer, feedbackName, feedbackMobile, feedbackComputer, welcomeAnimation;
let welcomeName, savingOverlay, savingStatus, feedbackSaving, feedbackSubmitBtn;
let logoutBtn, confirmationModal, confirmLogout, cancelLogout, particlesContainer;
let emailStatus, quizTitle, timeRemainingText, questionReviewText, answeredText;
let skippedText, unansweredText, currentText, prevText, nextText, submitText;
let resultsText, feedbackText, instructionTitle, importantWarning, warningText;
let testInstructions, instructionsList, instructionNote, feedbackTitle, feedbackNameLabel;
let feedbackMobileLabel, feedbackComputerLabel, feedbackMessageLabel, savingFeedbackText;
let submitFeedbackText, feedbackSuccessTitle, feedbackSuccessText;

// Initialize quiz when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    loginSection = document.getElementById('loginSection');
    userInfoPanel = document.getElementById('userInfoPanel');
    quizContainer = document.getElementById('quizContainer');
    resultsContainer = document.getElementById('resultsContainer');
    questionContainer = document.getElementById('questionContainer');
    prevBtn = document.getElementById('prevBtn');
    nextBtn = document.getElementById('nextBtn');
    submitQuiz = document.getElementById('submitQuiz');
    progressBar = document.getElementById('progressBar');
    scoreElement = document.getElementById('score');
    analysisElement = document.getElementById('analysis');
    feedbackBtn = document.getElementById('feedbackBtn');
    timerElement = document.getElementById('timer');
    reviewButtons = document.getElementById('reviewButtons');
    modeToggle = document.getElementById('modeToggle');
    instructionToggle = document.getElementById('instructionToggle');
    languageToggle = document.getElementById('languageToggle');
    modeIcon = modeToggle?.querySelector('i');
    loginForm = document.getElementById('login-form');
    feedbackModal = document.getElementById('feedbackModal');
    instructionModal = document.getElementById('instructionModal');
    feedbackForm = document.getElementById('feedback-form');
    closeFeedbackModal = document.getElementById('closeFeedbackModal');
    closeInstructionModal = document.getElementById('closeInstructionModal');
    feedbackResult = document.getElementById('feedback-result');
    displayStudentName = document.getElementById('display-student-name');
    displayMobile = document.getElementById('display-mobile');
    displayClass = document.getElementById('display-class');
    displayComputer = document.getElementById('display-computer');
    feedbackName = document.getElementById('feedback-name');
    feedbackMobile = document.getElementById('feedback-mobile');
    feedbackComputer = document.getElementById('feedback-computer');
    welcomeAnimation = document.getElementById('welcomeAnimation');
    welcomeName = document.getElementById('welcomeName');
    savingOverlay = document.getElementById('savingOverlay');
    savingStatus = document.getElementById('savingStatus');
    feedbackSaving = document.getElementById('feedbackSaving');
    feedbackSubmitBtn = document.getElementById('feedbackSubmitBtn');
    logoutBtn = document.getElementById('logoutBtn');
    confirmationModal = document.getElementById('confirmationModal');
    confirmLogout = document.getElementById('confirmLogout');
    cancelLogout = document.getElementById('cancelLogout');
    particlesContainer = document.getElementById('particles');
    emailStatus = document.getElementById('emailStatus');
    
    // Get text elements for language switching
    quizTitle = document.getElementById('quizTitle');
    timeRemainingText = document.getElementById('timeRemainingText');
    questionReviewText = document.getElementById('questionReviewText');
    answeredText = document.getElementById('answeredText');
    skippedText = document.getElementById('skippedText');
    unansweredText = document.getElementById('unansweredText');
    currentText = document.getElementById('currentText');
    prevText = document.getElementById('prevText');
    nextText = document.getElementById('nextText');
    submitText = document.getElementById('submitText');
    resultsText = document.getElementById('resultsText');
    feedbackText = document.getElementById('feedbackText');
    instructionTitle = document.getElementById('instructionTitle');
    importantWarning = document.getElementById('importantWarning');
    warningText = document.getElementById('warningText');
    testInstructions = document.getElementById('testInstructions');
    instructionsList = document.getElementById('instructionsList');
    instructionNote = document.getElementById('instructionNote');
    feedbackTitle = document.getElementById('feedbackTitle');
    feedbackNameLabel = document.getElementById('feedbackNameLabel');
    feedbackMobileLabel = document.getElementById('feedbackMobileLabel');
    feedbackComputerLabel = document.getElementById('feedbackComputerLabel');
    feedbackMessageLabel = document.getElementById('feedbackMessageLabel');
    savingFeedbackText = document.getElementById('savingFeedbackText');
    submitFeedbackText = document.getElementById('submitFeedbackText');
    feedbackSuccessTitle = document.getElementById('feedbackSuccessTitle');
    feedbackSuccessText = document.getElementById('feedbackSuccessText');
    
    // Only initialize quiz functionality if on quiz page
    if (loginForm || quizContainer) {
        // Set up event listeners
        if (loginForm) loginForm.addEventListener('submit', handleLogin);
        if (prevBtn) prevBtn.addEventListener('click', showPreviousQuestion);
        if (nextBtn) nextBtn.addEventListener('click', showNextQuestion);
        if (submitQuiz) submitQuiz.addEventListener('click', showResults);
        if (feedbackBtn) feedbackBtn.addEventListener('click', showFeedbackModal);
        if (modeToggle) modeToggle.addEventListener('click', toggleDarkMode);
        if (instructionToggle) instructionToggle.addEventListener('click', showInstructionModal);
        if (languageToggle) languageToggle.addEventListener('click', toggleLanguage);
        if (feedbackForm) feedbackForm.addEventListener('submit', handleFeedback);
        if (closeFeedbackModal) closeFeedbackModal.addEventListener('click', closeFeedbackModalFunc);
        if (closeInstructionModal) closeInstructionModal.addEventListener('click', closeInstructionModalFunc);
        if (logoutBtn) logoutBtn.addEventListener('click', showLogoutConfirmation);
        if (confirmLogout) confirmLogout.addEventListener('click', performLogout);
        if (cancelLogout) cancelLogout.addEventListener('click', hideLogoutConfirmation);
        
        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (feedbackModal && e.target === feedbackModal) {
                closeFeedbackModalFunc();
            }
            if (instructionModal && e.target === instructionModal) {
                closeInstructionModalFunc();
            }
            if (confirmationModal && e.target === confirmationModal) {
                hideLogoutConfirmation();
            }
        });
        
        // Initialize dark mode
        if (localStorage.getItem('darkMode') === 'enabled') {
            document.body.classList.add('dark-mode');
            if (modeIcon) {
                modeIcon.classList.remove('fa-moon');
                modeIcon.classList.add('fa-sun');
            }
        }
        
        // Initialize language
        if (localStorage.getItem('language')) {
            currentLanguage = localStorage.getItem('language');
            updateLanguage();
        }
        
        // Create floating particles
        if (particlesContainer) createParticles();
        
        // Check if user is already logged in for quiz
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser && loginSection && quizContainer) {
            currentUser = JSON.parse(savedUser);
            showQuizInterface();
        }
    }
});

// Create floating particles for background
function createParticles() {
    if (!particlesContainer) return;
    
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        // Random size and position
        const size = Math.random() * 10 + 5;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${Math.random() * 100}vw`;
        particle.style.top = `${Math.random() * 100}vh`;
        
        // Random animation duration and delay
        particle.style.animationDuration = `${Math.random() * 20 + 10}s`;
        particle.style.animationDelay = `${Math.random() * 5}s`;
        
        particlesContainer.appendChild(particle);
    }
}

// Toggle language between English and Hindi
function toggleLanguage() {
    currentLanguage = currentLanguage === 'en' ? 'hi' : 'en';
    localStorage.setItem('language', currentLanguage);
    updateLanguage();
    
    // If quiz is active, refresh the current question
    if (quizContainer && quizContainer.style.display === 'block') {
        displayQuestion();
    }
}

// Update all text elements based on current language
function updateLanguage() {
    if (!languageContent[currentLanguage]) return;
    
    const content = languageContent[currentLanguage];
    
    if (quizTitle) quizTitle.textContent = content.quizTitle;
    if (timeRemainingText) timeRemainingText.textContent = content.timeRemaining;
    if (questionReviewText) questionReviewText.textContent = content.questionReview;
    if (answeredText) answeredText.textContent = content.answered;
    if (skippedText) skippedText.textContent = content.skipped;
    if (unansweredText) unansweredText.textContent = content.unanswered;
    if (currentText) currentText.textContent = content.current;
    if (prevText) prevText.textContent = content.prev;
    if (nextText) nextText.textContent = content.next;
    if (submitText) submitText.textContent = content.submit;
    if (resultsText) resultsText.textContent = content.results;
    if (feedbackText) feedbackText.textContent = content.feedback;
    if (instructionTitle) instructionTitle.textContent = content.instructionTitle;
    if (importantWarning) importantWarning.textContent = content.importantWarning;
    if (warningText) warningText.textContent = content.warningText;
    if (testInstructions) testInstructions.textContent = content.testInstructions;
    
    // Update instructions list
    if (instructionsList) {
        instructionsList.innerHTML = '';
        content.instructionsList.forEach(instruction => {
            const li = document.createElement('li');
            li.textContent = instruction;
            instructionsList.appendChild(li);
        });
    }
    
    if (instructionNote) instructionNote.textContent = content.instructionNote;
    if (feedbackTitle) feedbackTitle.textContent = content.feedbackTitle;
    if (feedbackNameLabel) feedbackNameLabel.textContent = content.feedbackNameLabel;
    if (feedbackMobileLabel) feedbackMobileLabel.textContent = content.feedbackMobileLabel;
    if (feedbackComputerLabel) feedbackComputerLabel.textContent = content.feedbackComputerLabel;
    if (feedbackMessageLabel) feedbackMessageLabel.textContent = content.feedbackMessageLabel;
    if (savingFeedbackText) savingFeedbackText.textContent = content.savingFeedback;
    if (submitFeedbackText) submitFeedbackText.textContent = content.submitFeedback;
    if (feedbackSuccessTitle) feedbackSuccessTitle.textContent = content.feedbackSuccessTitle;
    if (feedbackSuccessText) feedbackSuccessText.textContent = content.feedbackSuccessText;
}

// Show logout confirmation modal
function showLogoutConfirmation() {
    if (confirmationModal) confirmationModal.style.display = 'flex';
}

// Hide logout confirmation modal
function hideLogoutConfirmation() {
    if (confirmationModal) confirmationModal.style.display = 'none';
}

// Perform logout
function performLogout() {
    hideLogoutConfirmation();
    
    currentUser = null;
    localStorage.removeItem('currentUser');
    
    if (userInfoPanel) userInfoPanel.style.display = 'none';
    if (quizContainer) quizContainer.style.display = 'none';
    if (resultsContainer) resultsContainer.style.display = 'none';
    if (loginSection) {
        loginSection.style.display = 'flex';
        if (loginForm) loginForm.reset();
    }
    if (welcomeAnimation) welcomeAnimation.style.display = 'none';
    
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    // Redirect to login page
    window.location.href = 'login.html';
}

// Show instruction modal
function showInstructionModal() {
    if (instructionModal) instructionModal.style.display = 'flex';
}

// Close instruction modal
function closeInstructionModalFunc() {
    if (instructionModal) instructionModal.style.display = 'none';
}

// Show feedback modal
function showFeedbackModal() {
    if (!feedbackModal || !currentUser) return;
    
    if (feedbackName) feedbackName.value = currentUser.name;
    if (feedbackMobile) feedbackMobile.value = currentUser.mobile || "Not available";
    if (feedbackComputer) feedbackComputer.value = currentUser.computer || "Not available";
    
    feedbackModal.style.display = 'flex';
    if (feedbackResult) feedbackResult.style.display = 'none';
    if (feedbackSaving) feedbackSaving.style.display = 'none';
    if (feedbackForm) feedbackForm.reset();
}

// Close feedback modal
function closeFeedbackModalFunc() {
    if (feedbackModal) feedbackModal.style.display = 'none';
}

// Validate mobile number
function isValidMobile(mobile) {
    return /^\d{10}$/.test(mobile);
}

// Validate test code
function isValidTestCode(testCode) {
    return testCode === '9512'; // Example test code
}

// Handle login form submission
function handleLogin(e) {
    e.preventDefault();
    
    const name = document.getElementById('login-name')?.value;
    const mobile = document.getElementById('login-mobile')?.value;
    const fatherName = document.getElementById('login-father')?.value;
    const computer = document.getElementById('login-computer')?.value;
    const studentClass = "Class 10"; // Fixed value
    const subject = "Mathematics"; // Fixed value
    const testCode = document.getElementById('login-testcode')?.value;
    
    if (!isValidMobile(mobile)) {
        alert('Please enter a valid 10-digit mobile number');
        return;
    }
    
    if (!isValidTestCode(testCode)) {
        alert('Invalid test code. Please enter the correct test code');
        return;
    }
    
    currentUser = {
        name: name,
        mobile: mobile,
        fatherName: fatherName,
        computer: computer,
        class: studentClass,
        subject: subject,
        testCode: testCode
    };
    
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    showQuizInterface();
}

// Show quiz interface after login
function showQuizInterface() {
    if (!loginSection || !userInfoPanel || !quizContainer) return;
    
    loginSection.style.display = 'none';
    userInfoPanel.style.display = 'flex';
    quizContainer.style.display = 'block';
    
    if (displayStudentName) displayStudentName.textContent = currentUser.name;
    if (displayMobile) displayMobile.textContent = currentUser.mobile;
    if (displayClass) displayClass.textContent = `${currentUser.class} - ${currentUser.subject}`;
    if (displayComputer) displayComputer.textContent = `Computer: ${currentUser.computer}`;
    if (welcomeName) welcomeName.textContent = currentUser.name;
    
    if (welcomeAnimation) {
        welcomeAnimation.style.display = 'block';
        setTimeout(() => {
            welcomeAnimation.style.display = 'none';
        }, 3000);
    }
    
    generateQuiz();
}

// Toggle dark mode
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    
    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('darkMode', 'enabled');
        if (modeIcon) {
            modeIcon.classList.remove('fa-moon');
            modeIcon.classList.add('fa-sun');
        }
    } else {
        localStorage.setItem('darkMode', 'disabled');
        if (modeIcon) {
            modeIcon.classList.remove('fa-sun');
            modeIcon.classList.add('fa-moon');
        }
    }
}

// Generate quiz questions
function generateQuiz() {
    quizData = mathematicsQuestions;
    userAnswers = new Array(quizData.length).fill(null);
    visitedQuestions = new Array(quizData.length).fill(false);
    
    currentQuestionIndex = 0;
    visitedQuestions[0] = true;
    
    createReviewButtons();
    updateReviewPanel();
    
    startTimer(3600); // 60 minutes for 30 questions (3600 seconds)
    
    updateProgressBar();
    displayQuestion();
}

// Create review buttons for each question
function createReviewButtons() {
    if (!reviewButtons) return;
    
    reviewButtons.innerHTML = '';
    for (let i = 0; i < quizData.length; i++) {
        const button = document.createElement('div');
        button.className = 'review-btn';
        button.textContent = i + 1;
        button.setAttribute('data-index', i);
        
        button.addEventListener('click', () => {
            currentQuestionIndex = i;
            visitedQuestions[i] = true;
            updateProgressBar();
            updateReviewPanel();
            displayQuestion();
        });
        
        reviewButtons.appendChild(button);
    }
}

// Update review panel status
function updateReviewPanel() {
    if (!reviewButtons) return;
    
    const buttons = reviewButtons.querySelectorAll('.review-btn');
    buttons.forEach((button, index) => {
        const i = parseInt(button.getAttribute('data-index'));
        
        button.classList.remove('answered', 'skipped', 'unanswered', 'current');
        
        if (i === currentQuestionIndex) {
            button.classList.add('current');
        } else if (userAnswers[i] !== null) {
            button.classList.add('answered');
        } else if (visitedQuestions[i]) {
            button.classList.add('skipped');
        } else {
            button.classList.add('unanswered');
        }
    });
}

// Start quiz timer
function startTimer(seconds) {
    timeLeft = seconds;
    updateTimerDisplay();
    
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            alert('Time is up! Submitting your quiz now.');
            showResults();
        } else if (timeLeft <= 300) { // 5 minutes warning
            if (timerElement) timerElement.classList.add('warning');
        }
    }, 1000);
}

// Update timer display
function updateTimerDisplay() {
    if (!timerElement) return;
    
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerElement.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

// Display current question
function displayQuestion() {
    if (!questionContainer) return;
    
    const question = quizData[currentQuestionIndex];
    const questionText = currentLanguage === 'en' ? question.question : question.questionHindi;
    const options = currentLanguage === 'en' ? question.options : question.optionsHindi;
    
    questionContainer.innerHTML = `
        <div class="question">
            <h3>${currentLanguage === 'en' ? 'Question' : 'प्रश्न'} ${currentQuestionIndex + 1}</h3>
            <p>${questionText}</p>
            ${question.image ? `<img src="${question.image}" alt="Question Image" class="question-image">` : ''}
            <div class="options">
                ${options.map((option, index) => `
                    <div class="option ${userAnswers[currentQuestionIndex] === String.fromCharCode(65 + index) ? 'selected' : ''}" 
                         data-option="${String.fromCharCode(65 + index)}">
                        ${String.fromCharCode(65 + index)}. ${option}
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    document.querySelectorAll('.option').forEach(option => {
        option.addEventListener('click', selectOption);
    });
    
    if (prevBtn) prevBtn.disabled = currentQuestionIndex === 0;
    if (nextBtn) nextBtn.disabled = false;
    if (submitQuiz) submitQuiz.style.display = currentQuestionIndex === quizData.length - 1 ? 'block' : 'none';
    
    updateReviewPanel();
}

// Handle option selection
function selectOption(e) {
    const selectedOption = e.target.getAttribute('data-option');
    userAnswers[currentQuestionIndex] = selectedOption;
    
    document.querySelectorAll('.option').forEach(option => {
        option.classList.remove('selected');
    });
    e.target.classList.add('selected');
    
    updateReviewPanel();
}

// Show next question
function showNextQuestion() {
    if (currentQuestionIndex < quizData.length - 1) {
        currentQuestionIndex++;
        visitedQuestions[currentQuestionIndex] = true;
        updateProgressBar();
        updateReviewPanel();
        displayQuestion();
    }
}

// Show previous question
function showPreviousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        visitedQuestions[currentQuestionIndex] = true;
        updateProgressBar();
        updateReviewPanel();
        displayQuestion();
    }
}

// Update progress bar
function updateProgressBar() {
    if (!progressBar) return;
    
    const progress = ((currentQuestionIndex + 1) / quizData.length) * 100;
    progressBar.style.width = `${progress}%`;
}

// Show quiz results
async function showResults() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    let correctCount = 0;
    quizData.forEach((question, index) => {
        if (userAnswers[index] === question.answer) {
            correctCount++;
        }
    });
    
    const score = (correctCount / quizData.length) * 100;
    
    if (scoreElement) {
        scoreElement.textContent = `Score: ${score.toFixed(1)}% (${correctCount}/${quizData.length})`;
    }
    
    let analysisHTML = `
        <h3>${currentLanguage === 'en' ? 'Quiz Details:' : 'प्रश्नोत्तरी विवरण:'}</h3>
        <p><span class="badge">${currentLanguage === 'en' ? 'Quiz Type' : 'प्रश्नोत्तरी प्रकार'}</span> ${currentLanguage === 'en' ? 'Mathematics' : 'गणित'}</p>
        <p><span class="badge">${currentLanguage === 'en' ? 'Total Questions' : 'कुल प्रश्न'}</span> ${quizData.length}</p>
        <p><span class="badge">${currentLanguage === 'en' ? 'Correct Answers' : 'सही उत्तर'}</span> ${correctCount}</p>
        <p><span class="badge">${currentLanguage === 'en' ? 'Score' : 'अंक'}</span> ${score.toFixed(1)}%</p>
        
        <h3 style="margin-top: 15px;">${currentLanguage === 'en' ? 'Question Analysis:' : 'प्रश्न विश्लेषण:'}</h3>
    `;
    
    quizData.forEach((question, index) => {
        const isCorrect = userAnswers[index] === question.answer;
        const userAnswerLetter = userAnswers[index] || (currentLanguage === 'en' ? 'Not answered' : 'उत्तर नहीं दिया');
        const correctAnswerLetter = question.answer;
        const correctAnswerIndex = correctAnswerLetter.charCodeAt(0) - 65;
        const correctAnswerText = currentLanguage === 'en' ? question.options[correctAnswerIndex] : question.optionsHindi[correctAnswerIndex];
        
        const explanation = currentLanguage === 'en' ? question.explanation : question.explanationHindi;
        
        analysisHTML += `
            <div class="question-analysis">
                <p><strong>${currentLanguage === 'en' ? 'Question' : 'प्रश्न'} ${index + 1}:</strong> ${currentLanguage === 'en' ? question.question : question.questionHindi}</p>
                <p class="${isCorrect ? 'correct' : 'incorrect'}">
                    ${currentLanguage === 'en' ? 'Your answer:' : 'आपका उत्तर:'} ${userAnswerLetter} 
                    ${isCorrect ? (currentLanguage === 'en' ? '✓ Correct' : '✓ सही') : (currentLanguage === 'en' ? '✗ Incorrect' : '✗ गलत')}
                </p>
                <div class="correct-answer">
                    <strong>${currentLanguage === 'en' ? 'Correct Answer:' : 'सही उत्तर:'}</strong> ${correctAnswerLetter}. ${correctAnswerText}
                    <br><strong>${currentLanguage === 'en' ? 'Explanation:' : 'स्पष्टीकरण:'}</strong> ${explanation}
                </div>
            </div>
        `;
    });
    
    if (analysisElement) {
        analysisElement.innerHTML = analysisHTML;
    }
    
    // Show saving overlay
    if (savingOverlay) {
        savingOverlay.style.display = 'flex';
        if (savingStatus) savingStatus.textContent = currentLanguage === 'en' ? 'Saving detailed results...' : 'विस्तृत परिणाम सहेजे जा रहे हैं...';
    }
    
    // Save detailed results to Google Docs (original)
    await saveResultsToGoogleDocs(correctCount);
    
    if (savingStatus) savingStatus.textContent = currentLanguage === 'en' ? 'Saving summary data...' : 'सारांश डेटा सहेजा जा रहा है...';
    
    // Save summary to another Google Docs
    await saveSummaryToGoogleDocs(correctCount, score);
    
    if (savingStatus) savingStatus.textContent = currentLanguage === 'en' ? 'All data saved successfully!' : 'सभी डेटा सफलतापूर्वक सहेजा गया!';
    
    // Wait a moment to show the success message
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Hide saving overlay
    if (savingOverlay) savingOverlay.style.display = 'none';
    
    if (quizContainer) quizContainer.style.display = 'none';
    if (resultsContainer) resultsContainer.style.display = 'block';
}

// Save results to Google Docs
async function saveResultsToGoogleDocs(correctCount) {
    if (!currentUser) return;
    
    try {
        if (savingStatus) savingStatus.textContent = currentLanguage === 'en' ? 'Creating detailed document...' : 'विस्तृत दस्तावेज़ बनाया जा रहा है...';
        
        const timestamp = new Date().toLocaleString();
        const studentName = currentUser.name;
        const mobile = currentUser.mobile;
        const fatherName = currentUser.fatherName;
        const computer = currentUser.computer;
        const studentClass = currentUser.class || "Class 10";
        const subject = currentUser.subject || "Mathematics";
        const testCode = currentUser.testCode || "Not provided";
        
        // Prepare data for Google Docs
        const data = {
            timestamp: timestamp,
            studentName: studentName,
            mobile: mobile,
            fatherName: fatherName,
            computer: computer,
            class: studentClass,
            subject: subject,
            testCode: testCode,
            correctAnswers: correctCount,
            totalQuestions: quizData.length,
            score: ((correctCount / quizData.length) * 100).toFixed(1) + '%',
            questions: quizData.map((q, i) => ({
                question: q.question,
                options: q.options,
                userAnswer: userAnswers[i] || 'Not answered',
                correctAnswer: q.answer
            }))
        };
        
        if (savingStatus) savingStatus.textContent = currentLanguage === 'en' ? 'Sending detailed data...' : 'विस्तृत डेटा भेजा जा रहा है...';
        
        // Send data to Google Apps Script
        const response = await fetch(DETAILED_RESULTS_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        console.log('Detailed results saved to Google Docs');
    } catch (error) {
        console.error('Error saving detailed results to Google Docs:', error);
        if (savingStatus) savingStatus.textContent = currentLanguage === 'en' ? 'Error: Could not save detailed results. Saving locally...' : 'त्रुटि: विस्तृत परिणाम सहेजे नहीं जा सके। स्थानीय रूप से सहेजा जा रहा है...';
        
        // Fallback: Save to localStorage
        saveResultsToLocalStorage(correctCount);
    }
}

// Save summary to Google Docs
async function saveSummaryToGoogleDocs(correctCount, score) {
    if (!currentUser) return;
    
    try {
        if (savingStatus) savingStatus.textContent = currentLanguage === 'en' ? 'Creating summary document...' : 'सारांश दस्तावेज़ बनाया जा रहा है...';
        
        const timestamp = new Date().toLocaleString();
        const studentName = currentUser.name;
        const mobile = currentUser.mobile;
        const computer = currentUser.computer;
        const subject = currentUser.subject || "Mathematics";
        const testCode = currentUser.testCode || "Not provided";
        
        // Prepare summary data
        const summaryData = {
            action: 'saveSummary',
            timestamp: timestamp,
            studentName: studentName,
            mobile: mobile,
            computer: computer,
            subject: subject,
            testCode: testCode,
            score: score.toFixed(1) + '%',
            correctAnswers: correctCount,
            totalQuestions: quizData.length,
            percentage: score.toFixed(1)
        };
        
        if (savingStatus) savingStatus.textContent = currentLanguage === 'en' ? 'Sending summary data...' : 'सारांश डेटा भेजा जा रहा है...';
        
        // Send summary data to Google Apps Script
        const response = await fetch(SUMMARY_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(summaryData)
        });
        
        console.log('Summary saved to Google Docs');
    } catch (error) {
        console.error('Error saving summary to Google Docs:', error);
        if (savingStatus) savingStatus.textContent = currentLanguage === 'en' ? 'Error: Could not save summary. Saving locally...' : 'त्रुटि: सारांश सहेजा नहीं जा सका। स्थानीय रूप से सहेजा जा रहा है...';
        
        // Fallback: Save summary to localStorage
        saveSummaryToLocalStorage(correctCount, score);
    }
}

// Save feedback to Google Docs
async function saveFeedbackToGoogleDocs(feedbackData) {
    try {
        const response = await fetch(FEEDBACK_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(feedbackData)
        });
        
        console.log('Feedback saved to Google Docs');
        return true;
    } catch (error) {
        console.error('Error saving feedback to Google Docs:', error);
        return false;
    }
}

// Save results to localStorage as fallback
function saveResultsToLocalStorage(correctCount) {
    if (!currentUser) return;
    
    const timestamp = new Date().toLocaleString();
    const studentName = currentUser.name;
    const mobile = currentUser.mobile;
    const fatherName = currentUser.fatherName;
    const computer = currentUser.computer;
    const studentClass = currentUser.class || "Class 10";
    const subject = currentUser.subject || "Mathematics";
    const testCode = currentUser.testCode || "Not provided";
    
    const resultData = {
        timestamp: timestamp,
        studentName: studentName,
        mobile: mobile,
        fatherName: fatherName,
        computer: computer,
        class: studentClass,
        subject: subject,
        testCode: testCode,
        correctAnswers: correctCount,
        totalQuestions: quizData.length,
        score: ((correctCount / quizData.length) * 100).toFixed(1) + '%',
        questions: quizData.map((q, i) => ({
            question: q.question,
            options: q.options,
            userAnswer: userAnswers[i] || 'Not answered',
            correctAnswer: q.answer
        }))
    };
    
    // Save to localStorage as fallback
    let savedResults = JSON.parse(localStorage.getItem('quizResults')) || [];
    savedResults.push(resultData);
    localStorage.setItem('quizResults', JSON.stringify(savedResults));
    
    console.log('Detailed results saved to localStorage as fallback');
}

// Save summary to localStorage as fallback
function saveSummaryToLocalStorage(correctCount, score) {
    if (!currentUser) return;
    
    const timestamp = new Date().toLocaleString();
    const studentName = currentUser.name;
    const mobile = currentUser.mobile;
    const computer = currentUser.computer;
    const subject = currentUser.subject || "Mathematics";
    const testCode = currentUser.testCode || "Not provided";
    
    const summaryData = {
        timestamp: timestamp,
        studentName: studentName,
        mobile: mobile,
        computer: computer,
        subject: subject,
        testCode: testCode,
        score: score.toFixed(1) + '%',
        correctAnswers: correctCount,
        totalQuestions: quizData.length,
        percentage: score.toFixed(1)
    };
    
    // Save summary to localStorage as fallback
    let savedSummaries = JSON.parse(localStorage.getItem('quizSummaries')) || [];
    savedSummaries.push(summaryData);
    localStorage.setItem('quizSummaries', JSON.stringify(savedSummaries));
    
    console.log('Summary saved to localStorage as fallback');
}

// Handle feedback form submission
async function handleFeedback(e) {
    e.preventDefault();
    
    const message = document.getElementById('feedback-message')?.value;
    
    if (!message) {
        alert(currentLanguage === 'en' ? 'Please enter your feedback message' : 'कृपया अपनी प्रतिक्रिया संदेश दर्ज करें');
        return;
    }
    
    // Show loading state
    if (feedbackSaving) feedbackSaving.style.display = 'block';
    if (feedbackSubmitBtn) feedbackSubmitBtn.disabled = true;
    
    const feedbackData = {
        name: currentUser.name,
        mobile: currentUser.mobile || "Not available",
        fatherName: currentUser.fatherName || "Not provided",
        computer: currentUser.computer || "Not available",
        message: message,
        timestamp: new Date().toLocaleString()
    };
    
    // Save to Google Docs
    const googleDocsSuccess = await saveFeedbackToGoogleDocs(feedbackData);
    
    // Always save to localStorage as fallback
    let feedbacks = JSON.parse(localStorage.getItem('feedbacks')) || [];
    feedbacks.push(feedbackData);
    localStorage.setItem('feedbacks', JSON.stringify(feedbacks));
    
    // Hide loading state
    if (feedbackSaving) feedbackSaving.style.display = 'none';
    if (feedbackSubmitBtn) feedbackSubmitBtn.disabled = false;
    
    // Show success message
    if (feedbackResult) feedbackResult.style.display = 'block';
    
    if (feedbackForm) feedbackForm.reset();
    
    setTimeout(() => {
        if (feedbackModal) feedbackModal.style.display = 'none';
    }, 2000);
}

// Mathematics questions data (30 questions from the document)
const mathematicsQuestions = [
    {
        question: "The HCF of 135 and 225 is",
        questionHindi: "135 और 225 का HCF है",
        options: ["15", "45", "75", "90"],
        optionsHindi: ["15", "45", "75", "90"],
        answer: "B",
        explanation: "135 = 3³ × 5, 225 = 3² × 5². HCF = 3² × 5 = 45",
        explanationHindi: "135 = 3³ × 5, 225 = 3² × 5². HCF = 3² × 5 = 45"
    },
    {
        question: "The decimal expansion of 7/125 is",
        questionHindi: "7/125 का दशमलव प्रसार है",
        options: ["Terminating", "Non-terminating recurring", "Non-terminating non-recurring", "Irrational"],
        optionsHindi: ["सांत", "असांत आवर्ती", "असांत अनावर्ती", "अपरिमेय"],
        answer: "A",
        explanation: "7/125 = 7/5³ = 7×8/1000 = 56/1000 = 0.056 which is terminating decimal",
        explanationHindi: "7/125 = 7/5³ = 7×8/1000 = 56/1000 = 0.056 जो कि सांत दशमलव है"
    },
    {
        question: "If α and β are zeroes of the polynomial x² − 3x − 10, then αβ is",
        questionHindi: "यदि α और β बहुपद x² − 3x − 10 के शून्यक हैं, तो αβ है",
        options: ["−10", "10", "−3", "3"],
        optionsHindi: ["−10", "10", "−3", "3"],
        answer: "A",
        explanation: "For quadratic polynomial ax² + bx + c, product of zeroes = c/a. Here c = -10, a = 1, so αβ = -10/1 = -10",
        explanationHindi: "द्विघात बहुपद ax² + bx + c के लिए, शून्यकों का गुणनफल = c/a. यहाँ c = -10, a = 1, अतः αβ = -10/1 = -10"
    },
    {
        question: "Number of zeroes of a polynomial whose graph touches x-axis at exactly one point is",
        questionHindi: "एक बहुपद के शून्यकों की संख्या जिसका ग्राफ x-अक्ष को ठीक एक बिंदु पर स्पर्श करता है",
        options: ["0", "1", "2", "3"],
        optionsHindi: ["0", "1", "2", "3"],
        answer: "B",
        explanation: "When graph touches x-axis at one point, it has one real zero with even multiplicity (like (x-2)²)",
        explanationHindi: "जब ग्राफ x-अक्ष को एक बिंदु पर स्पर्श करता है, तो उसका एक वास्तविक शून्यक होता है जिसकी बहुलता सम होती है (जैसे (x-2)²)"
    },
    {
        question: "The pair of linear equations x − 2y = 4 and 2x − 4y = 8 has",
        questionHindi: "रैखिक समीकरणों के युग्म x − 2y = 4 और 2x − 4y = 8 के हैं",
        options: ["No solution", "Unique solution", "Infinitely many solutions", "Exactly two solutions"],
        optionsHindi: ["कोई हल नहीं", "अद्वितीय हल", "अनंत हल", "ठीक दो हल"],
        answer: "C",
        explanation: "Both equations are multiples of each other: 2(x − 2y) = 2x − 4y = 8. So they represent the same line, hence infinitely many solutions",
        explanationHindi: "दोनों समीकरण एक दूसरे के गुणज हैं: 2(x − 2y) = 2x − 4y = 8. अतः वे एक ही रेखा को निरूपित करते हैं, इसलिए अनंत हल हैं"
    },
    {
        question: "The graph of a linear equation in two variables is a",
        questionHindi: "दो चरों में एक रैखिक समीकरण का ग्राफ होता है",
        options: ["Circle", "Parabola", "Straight line", "Curve"],
        optionsHindi: ["वृत्त", "परवलय", "सीधी रेखा", "वक्र"],
        answer: "C",
        explanation: "A linear equation in two variables always represents a straight line",
        explanationHindi: "दो चरों में एक रैखिक समीकरण हमेशा एक सीधी रेखा को निरूपित करता है"
    },
    {
        question: "The discriminant of quadratic equation x² + 4x + 4 = 0 is",
        questionHindi: "द्विघात समीकरण x² + 4x + 4 = 0 का विविक्तकर है",
        options: ["−4", "0", "4", "8"],
        optionsHindi: ["−4", "0", "4", "8"],
        answer: "B",
        explanation: "Discriminant D = b² - 4ac = 4² - 4×1×4 = 16 - 16 = 0",
        explanationHindi: "विविक्तकर D = b² - 4ac = 4² - 4×1×4 = 16 - 16 = 0"
    },
    {
        question: "Roots of a quadratic equation are real and equal when",
        questionHindi: "द्विघात समीकरण के मूल वास्तविक और समान होते हैं जब",
        options: ["D > 0", "D < 0", "D = 0", "D ≠ 0"],
        optionsHindi: ["D > 0", "D < 0", "D = 0", "D ≠ 0"],
        answer: "C",
        explanation: "For real and equal roots, discriminant D must be zero",
        explanationHindi: "वास्तविक और समान मूलों के लिए, विविक्तकर D शून्य होना चाहिए"
    },
    {
        question: "The 15th term of the AP 3, 7, 11, ... is",
        questionHindi: "समांतर श्रेणी 3, 7, 11, ... का 15वाँ पद है",
        options: ["55", "59", "63", "67"],
        optionsHindi: ["55", "59", "63", "67"],
        answer: "B",
        explanation: "a = 3, d = 4. 15th term = a + 14d = 3 + 14×4 = 3 + 56 = 59",
        explanationHindi: "a = 3, d = 4. 15वाँ पद = a + 14d = 3 + 14×4 = 3 + 56 = 59"
    },
    {
        question: "Which term of the AP 5, 9, 13, ... is 181?",
        questionHindi: "समांतर श्रेणी 5, 9, 13, ... का कौन सा पद 181 है?",
        options: ["43rd", "44th", "45th", "46th"],
        optionsHindi: ["43वाँ", "44वाँ", "45वाँ", "46वाँ"],
        answer: "C",
        explanation: "a = 5, d = 4. Let nth term = 181. Then 5 + (n-1)×4 = 181 ⇒ (n-1)×4 = 176 ⇒ n-1 = 44 ⇒ n = 45",
        explanationHindi: "a = 5, d = 4. माना nवाँ पद = 181. तब 5 + (n-1)×4 = 181 ⇒ (n-1)×4 = 176 ⇒ n-1 = 44 ⇒ n = 45"
    },
    {
        question: "If two triangles are similar, then ratio of their areas is equal to",
        questionHindi: "यदि दो त्रिभुज समरूप हैं, तो उनके क्षेत्रफलों का अनुपात बराबर होता है",
        options: ["Ratio of their heights", "Ratio of their bases", "Square of ratio of corresponding sides", "Ratio of their perimeters"],
        optionsHindi: ["उनकी ऊँचाइयों का अनुपात", "उनके आधारों का अनुपात", "संगत भुजाओं के अनुपात का वर्ग", "उनके परिमापों का अनुपात"],
        answer: "C",
        explanation: "For similar triangles, ratio of areas = (ratio of corresponding sides)²",
        explanationHindi: "समरूप त्रिभुजों के लिए, क्षेत्रफलों का अनुपात = (संगत भुजाओं के अनुपात)²"
    },
    {
        question: "In similar triangles, ratio of corresponding sides is 3 : 5. Ratio of their areas is",
        questionHindi: "समरूप त्रिभुजों में, संगत भुजाओं का अनुपात 3 : 5 है। उनके क्षेत्रफलों का अनुपात है",
        options: ["3 : 5", "5 : 3", "9 : 25", "25 : 9"],
        optionsHindi: ["3 : 5", "5 : 3", "9 : 25", "25 : 9"],
        answer: "C",
        explanation: "Ratio of areas = (ratio of sides)² = (3/5)² = 9/25 = 9:25",
        explanationHindi: "क्षेत्रफलों का अनुपात = (भुजाओं का अनुपात)² = (3/5)² = 9/25 = 9:25"
    },
    {
        question: "Distance between points (2, −2) and (5, 2) is",
        questionHindi: "बिंदुओं (2, −2) और (5, 2) के बीच की दूरी है",
        options: ["4", "5", "6", "7"],
        optionsHindi: ["4", "5", "6", "7"],
        answer: "B",
        explanation: "Distance = √[(5-2)² + (2-(-2))²] = √[3² + 4²] = √[9+16] = √25 = 5",
        explanationHindi: "दूरी = √[(5-2)² + (2-(-2))²] = √[3² + 4²] = √[9+16] = √25 = 5"
    },
    {
        question: "Coordinates of midpoint of (−4, 6) and (2, −2) are",
        questionHindi: "(−4, 6) और (2, −2) के मध्यबिंदु के निर्देशांक हैं",
        options: ["(−1, 2)", "(2, −1)", "(1, 4)", "(−2, 4)"],
        optionsHindi: ["(−1, 2)", "(2, −1)", "(1, 4)", "(−2, 4)"],
        answer: "A",
        explanation: "Midpoint = ((x1+x2)/2, (y1+y2)/2) = ((-4+2)/2, (6+(-2))/2) = (-2/2, 4/2) = (-1, 2)",
        explanationHindi: "मध्यबिंदु = ((x1+x2)/2, (y1+y2)/2) = ((-4+2)/2, (6+(-2))/2) = (-2/2, 4/2) = (-1, 2)"
    },
    {
        question: "Value of sin30° + cos60° is",
        questionHindi: "sin30° + cos60° का मान है",
        options: ["0", "1", "2", "undefined"],
        optionsHindi: ["0", "1", "2", "अपरिभाषित"],
        answer: "B",
        explanation: "sin30° = 1/2, cos60° = 1/2. Sum = 1/2 + 1/2 = 1",
        explanationHindi: "sin30° = 1/2, cos60° = 1/2. योग = 1/2 + 1/2 = 1"
    },
    {
        question: "tan45° × sin60° equals",
        questionHindi: "tan45° × sin60° बराबर है",
        options: ["1/2", "√3/2", "1", "√3"],
        optionsHindi: ["1/2", "√3/2", "1", "√3"],
        answer: "B",
        explanation: "tan45° = 1, sin60° = √3/2. Product = 1 × √3/2 = √3/2",
        explanationHindi: "tan45° = 1, sin60° = √3/2. गुणनफल = 1 × √3/2 = √3/2"
    },
    {
        question: "Tangent to a circle is perpendicular to the radius at the point of",
        questionHindi: "एक वृत्त की स्पर्श रेखा त्रिज्या के लंबवत होती है उस बिंदु पर जहाँ",
        options: ["Centre", "Contact", "Diameter", "Chord"],
        optionsHindi: ["केंद्र", "संपर्क", "व्यास", "जीवा"],
        answer: "B",
        explanation: "The tangent to a circle is perpendicular to the radius at the point of contact",
        explanationHindi: "एक वृत्त की स्पर्श रेखा संपर्क बिंदु पर त्रिज्या के लंबवत होती है"
    },
    {
        question: "Number of tangents drawn from an external point to a circle is",
        questionHindi: "एक बाह्य बिंदु से एक वृत्त पर खींची जा सकने वाली स्पर्श रेखाओं की संख्या है",
        options: ["1", "2", "3", "Infinite"],
        optionsHindi: ["1", "2", "3", "अनंत"],
        answer: "B",
        explanation: "From an external point, exactly two tangents can be drawn to a circle",
        explanationHindi: "एक बाह्य बिंदु से एक वृत्त पर ठीक दो स्पर्श रेखाएँ खींची जा सकती हैं"
    },
    {
        question: "Radius of a circle whose area is 154 cm² is",
        questionHindi: "एक वृत्त जिसका क्षेत्रफल 154 cm² है, की त्रिज्या है",
        options: ["7 cm", "14 cm", "21 cm", "28 cm"],
        optionsHindi: ["7 cm", "14 cm", "21 cm", "28 cm"],
        answer: "A",
        explanation: "Area = πr² = 154 ⇒ r² = 154/π = 154/(22/7) = 154×7/22 = 49 ⇒ r = √49 = 7 cm",
        explanationHindi: "क्षेत्रफल = πr² = 154 ⇒ r² = 154/π = 154/(22/7) = 154×7/22 = 49 ⇒ r = √49 = 7 cm"
    },
    {
        question: "Area of a sector of angle 90° and radius 14 cm is",
        questionHindi: "90° कोण और 14 cm त्रिज्या वाले त्रिज्यखंड का क्षेत्रफल है",
        options: ["77 cm²", "154 cm²", "308 cm²", "616 cm²"],
        optionsHindi: ["77 cm²", "154 cm²", "308 cm²", "616 cm²"],
        answer: "B",
        explanation: "Area of sector = (θ/360) × πr² = (90/360) × (22/7)×14² = (1/4) × (22/7)×196 = (1/4) × 616 = 154 cm²",
        explanationHindi: "त्रिज्यखंड का क्षेत्रफल = (θ/360) × πr² = (90/360) × (22/7)×14² = (1/4) × (22/7)×196 = (1/4) × 616 = 154 cm²"
    },
    {
        question: "Volume of a sphere of radius 3.5 cm is",
        questionHindi: "3.5 cm त्रिज्या वाले एक गोले का आयतन है",
        options: ["143.7 cm³", "179.6 cm³", "224.6 cm³", "268.8 cm³"],
        optionsHindi: ["143.7 cm³", "179.6 cm³", "224.6 cm³", "268.8 cm³"],
        answer: "B",
        explanation: "Volume = (4/3)πr³ = (4/3)×(22/7)×(3.5)³ = (4/3)×(22/7)×42.875 = (4/3)×(22×6.125) = (4/3)×134.75 ≈ 179.67 cm³",
        explanationHindi: "आयतन = (4/3)πr³ = (4/3)×(22/7)×(3.5)³ = (4/3)×(22/7)×42.875 = (4/3)×(22×6.125) = (4/3)×134.75 ≈ 179.67 cm³"
    },
    {
        question: "Curved surface area of a cylinder is",
        questionHindi: "एक बेलन का वक्र पृष्ठीय क्षेत्रफल है",
        options: ["πr²", "2πr²", "2πrh", "πd²"],
        optionsHindi: ["πr²", "2πr²", "2πrh", "πd²"],
        answer: "C",
        explanation: "Curved surface area of cylinder = 2πrh",
        explanationHindi: "बेलन का वक्र पृष्ठीय क्षेत्रफल = 2πrh"
    },
    {
        question: "Mean of first 10 natural numbers is",
        questionHindi: "पहली 10 प्राकृत संख्याओं का माध्य है",
        options: ["5", "5.5", "6", "10"],
        optionsHindi: ["5", "5.5", "6", "10"],
        answer: "B",
        explanation: "First 10 natural numbers: 1 to 10. Sum = 55. Mean = 55/10 = 5.5",
        explanationHindi: "पहली 10 प्राकृत संख्याएँ: 1 से 10. योग = 55. माध्य = 55/10 = 5.5"
    },
    {
        question: "Graph of cumulative frequency distribution is called",
        questionHindi: "संचयी बारंबारता वितरण का ग्राफ कहलाता है",
        options: ["Histogram", "Bar graph", "Ogive", "Pie chart"],
        optionsHindi: ["आयतचित्र", "दंड आरेख", "तोरण", "वृत्त आरेख"],
        answer: "C",
        explanation: "The graph of cumulative frequency distribution is called an ogive",
        explanationHindi: "संचयी बारंबारता वितरण के ग्राफ को तोरण कहते हैं"
    },
    {
        question: "Mode of a data is",
        questionHindi: "डेटा का बहुलक है",
        options: ["Mean value", "Middle value", "Most frequent value", "Least value"],
        optionsHindi: ["माध्य मान", "मध्य मान", "सबसे अधिक बार आने वाला मान", "सबसे छोटा मान"],
        answer: "C",
        explanation: "Mode is the value that appears most frequently in a data set",
        explanationHindi: "बहुलक वह मान है जो डेटा सेट में सबसे अधिक बार आता है"
    },
    {
        question: "Probability of getting a head when a coin is tossed once is",
        questionHindi: "एक सिक्के को एक बार उछालने पर चित आने की प्रायिकता है",
        options: ["0", "1", "1/2", "2"],
        optionsHindi: ["0", "1", "1/2", "2"],
        answer: "C",
        explanation: "A fair coin has two equally likely outcomes: head or tail. P(head) = 1/2",
        explanationHindi: "एक निष्पक्ष सिक्के के दो समान रूप से संभावित परिणाम हैं: चित या पट। P(चित) = 1/2"
    },
    {
        question: "A die is thrown once. Probability of getting an even number is",
        questionHindi: "एक पासा एक बार फेंका जाता है। एक सम संख्या आने की प्रायिकता है",
        options: ["1/6", "1/3", "1/2", "2/3"],
        optionsHindi: ["1/6", "1/3", "1/2", "2/3"],
        answer: "C",
        explanation: "Even numbers on a die: 2, 4, 6 (3 outcomes). Total outcomes: 6. P(even) = 3/6 = 1/2",
        explanationHindi: "पासे पर सम संख्याएँ: 2, 4, 6 (3 परिणाम)। कुल परिणाम: 6. P(सम) = 3/6 = 1/2"
    },
    {
        question: "Value of cos60° is",
        questionHindi: "cos60° का मान है",
        options: ["0", "1/2", "1", "−1"],
        optionsHindi: ["0", "1/2", "1", "−1"],
        answer: "B",
        explanation: "cos60° = 1/2",
        explanationHindi: "cos60° = 1/2"
    },
    {
        question: "Which of the following is a quadratic polynomial?",
        questionHindi: "निम्नलिखित में से कौन सा एक द्विघात बहुपद है?",
        options: ["x³ − 1", "x² + 2x + 1", "x − 3", "9"],
        optionsHindi: ["x³ − 1", "x² + 2x + 1", "x − 3", "9"],
        answer: "B",
        explanation: "A quadratic polynomial has degree 2. Only x² + 2x + 1 has degree 2",
        explanationHindi: "एक द्विघात बहुपद की घात 2 होती है। केवल x² + 2x + 1 की घात 2 है"
    },
    {
        question: "If the quadratic equation x² + kx + 9 = 0 has equal roots, then the value of k is",
        questionHindi: "यदि द्विघात समीकरण x² + kx + 9 = 0 के मूल समान हैं, तो k का मान है",
        options: ["6", "−6", "±6", "9"],
        optionsHindi: ["6", "−6", "±6", "9"],
        answer: "C",
        explanation: "For equal roots, discriminant D = 0. k² - 4×1×9 = 0 ⇒ k² = 36 ⇒ k = ±6",
        explanationHindi: "समान मूलों के लिए, विविक्तकर D = 0. k² - 4×1×9 = 0 ⇒ k² = 36 ⇒ k = ±6"
    }
];
