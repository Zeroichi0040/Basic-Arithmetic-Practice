// DOM elements
const setupSection = document.getElementById('setup-section');
const sessionSection = document.getElementById('session-section');
const startButton = document.getElementById('start-button');
const endSessionButton = document.getElementById('end-session');
const resetButton = document.getElementById('reset-button');
const setupError = document.getElementById('setup-error');
const problemElement = document.getElementById('problem');
const answerInput = document.getElementById('answer-input');
const problemsSolvedElement = document.getElementById('problems-solved');
const correctCountElement = document.getElementById('correct-count');
const accuracyElement = document.getElementById('accuracy');
const progressElement = document.getElementById('progress');
const floatingPopup = document.getElementById('floating-popup');
const keypadButtons = document.querySelectorAll('.key');
const backspaceButton = document.getElementById('backspace');
const submitButton = document.getElementById('submit-answer');
const negativeButton = document.getElementById('negative-sign');
const operatorMixingGroup = document.getElementById('operator-mixing-group');
const operationCheckboxes = document.querySelectorAll('input[type="checkbox"]');
const performanceSummary = document.getElementById('performance-summary');
const performanceSolved = document.getElementById('performance-solved');
const performanceCorrect = document.getElementById('performance-correct');
const performanceAccuracy = document.getElementById('performance-accuracy');
const performanceScore = document.getElementById('performance-score');
const performanceMessage = document.getElementById('performance-message');
const operandCountInput = document.getElementById('operand-count');
const operandDigitsInput = document.getElementById('operand-digits');
const resultDigitsInput = document.getElementById('result-digits');
const problemCountInput = document.getElementById('problem-count');
const operatorMixingSelect = document.getElementById('operator-mixing');
const problemContainer = document.getElementById('problem-container');

// Theme elements
const themeButton = document.getElementById('theme-button');
const themeOptions = document.getElementById('theme-options');
const themeOptionButtons = document.querySelectorAll('.theme-option');

// Default values for input fields
const defaultValues = {
    'operand-digits': 1,
    'result-digits': 2,
    'operand-count': 2,
    'problem-count': 10
};

// Theme settings
const themeSettings = {
    currentTheme: 'system',
    updateTheme() {
        const savedTheme = localStorage.getItem('theme') || 'system';
        this.currentTheme = savedTheme;
        this.applyTheme(savedTheme);
        this.updateActiveOption();
    },
    
    applyTheme(theme) {
        let effectiveTheme = theme;
        
        if (theme === 'system') {
            effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        
        document.documentElement.setAttribute('data-theme', effectiveTheme);
        localStorage.setItem('theme', theme);
        this.currentTheme = theme;
        this.updateActiveOption();
    },
    
    updateActiveOption() {
        themeOptionButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.theme === this.currentTheme);
        });
        
        this.updateThemeIcon();
    },
    
    updateThemeIcon() {
        const themeIcon = themeButton.querySelector('.theme-icon');
        let effectiveTheme = this.currentTheme;
        
        if (this.currentTheme === 'system') {
            effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        
        if (effectiveTheme === 'dark') {
            themeIcon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
        } else {
            themeIcon.innerHTML = '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>';
        }
    },
    
    init() {
        this.updateTheme();
        
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (this.currentTheme === 'system') {
                this.applyTheme('system');
            }
        });
    }
};

// Session variables
let session = {
    problemsSolved: 0,
    correctAnswers: 0,
    totalProblems: 0,
    currentProblem: null,
    isActive: false,
    problemCount: 0
};

// Operation symbols
const operations = {
    addition: '+',
    subtraction: '-',
    multiplication: '×',
    division: '÷'
};

// Event listeners
startButton.addEventListener('click', startSession);
endSessionButton.addEventListener('click', endSession);
resetButton.addEventListener('click', resetToDefaults);
answerInput.addEventListener('keydown', handleAnswerInput);
answerInput.addEventListener('paste', handlePaste);
answerInput.addEventListener('input', validateNumericInput);

// Theme event listeners
themeButton.addEventListener('click', (e) => {
    e.stopPropagation();
    themeOptions.classList.toggle('show');
});

themeOptionButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        e.stopPropagation();
        const theme = button.dataset.theme;
        themeSettings.applyTheme(theme);
        themeOptions.classList.remove('show');
    });
});

// Close theme options when clicking outside
document.addEventListener('click', () => {
    themeOptions.classList.remove('show');
});

// Listen for operation checkbox changes to update operator mixing visibility
operationCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', updateOperatorMixingVisibility);
});

// Listen for operand count changes to update operator mixing visibility
operandCountInput.addEventListener('input', updateOperatorMixingVisibility);

// Listen for digit changes to validate constraints
operandDigitsInput.addEventListener('input', validateConstraints);
resultDigitsInput.addEventListener('input', validateConstraints);
operandCountInput.addEventListener('input', validateConstraints);

// Add input validation for all numeric inputs
document.querySelectorAll('input[type="number"]').forEach(input => {
    input.addEventListener('input', validateNumericInput);
    input.addEventListener('paste', handlePaste);
    input.addEventListener('keydown', handleNumericKeydown);
    input.addEventListener('blur', handleInputBlur);
});

// Keypad event listeners
keypadButtons.forEach(button => {
    if (button.id !== 'backspace' && button.id !== 'submit-answer' && button.id !== 'negative-sign') {
        button.addEventListener('click', () => {
            const value = button.getAttribute('data-value');
            answerInput.value += value;
            if (isMobile()) {
                answerInput.blur();
            }
            updateNegativeButtonState();
        });
    }
});

backspaceButton.addEventListener('click', () => {
    answerInput.value = answerInput.value.slice(0, -1);
    if (isMobile()) {
        answerInput.blur();
    }
    updateNegativeButtonState();
});

submitButton.addEventListener('click', () => {
    checkAnswer();
});

// Negative button event listener
negativeButton.addEventListener('click', () => {
    let currentValue = answerInput.value;
    
    if (currentValue === '' || currentValue === '-') {
        answerInput.value = currentValue === '-' ? '' : '-';
    } else {
        if (currentValue.startsWith('-')) {
            answerInput.value = currentValue.substring(1);
        } else {
            answerInput.value = '-' + currentValue;
        }
    }
    
    updateNegativeButtonState();
    
    if (isMobile()) {
        answerInput.blur();
    }
});

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    themeSettings.init();
    updateOperatorMixingVisibility();
    validateConstraints();
});

// Handle input blur event - restore default value if empty
function handleInputBlur(e) {
    const input = e.target;
    const inputId = input.id;
    
    if (inputId === 'answer-input') return;
    
    if (input.value === '') {
        input.value = defaultValues[inputId];
        input.dispatchEvent(new Event('input'));
    }
}

// Validate numeric input for all input fields
function validateNumericInput(e) {
    const input = e.target;
    
    if (input.id === 'answer-input') {
        let value = input.value;
        if (value.length > 0 && value[0] === '-') {
            const rest = value.substring(1).replace(/[^\d]/g, '');
            input.value = '-' + rest;
        } else {
            input.value = value.replace(/[^\d]/g, '');
        }
    } else {
        if (input.value !== '') {
            input.value = input.value.replace(/[^\d]/g, '');
        }
    }
}

// Handle paste events to prevent non-numeric input
function handlePaste(e) {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text');
    const numericValue = pasteData.replace(/[^\d-]/g, '');
    
    if (e.target.id === 'answer-input') {
        let currentValue = e.target.value;
        const cursorPosition = e.target.selectionStart;
        
        if (numericValue.includes('-')) {
            const withoutMinus = numericValue.replace(/-/g, '');
            if (cursorPosition === 0) {
                e.target.value = '-' + withoutMinus;
            } else {
                e.target.value = withoutMinus;
            }
        } else {
            e.target.value = currentValue.substring(0, cursorPosition) + 
                            numericValue + 
                            currentValue.substring(e.target.selectionEnd);
        }
    } else {
        const cursorPosition = e.target.selectionStart;
        const currentValue = e.target.value;
        e.target.value = currentValue.substring(0, cursorPosition) + 
                        numericValue + 
                        currentValue.substring(e.target.selectionEnd);
    }
    
    updateNegativeButtonState();
}

// Handle keydown for numeric inputs to prevent non-numeric characters
function handleNumericKeydown(e) {
    if ([46, 8, 9, 27, 13].includes(e.keyCode) ||
        (e.keyCode === 65 && e.ctrlKey === true) ||
        (e.keyCode === 67 && e.ctrlKey === true) ||
        (e.keyCode === 86 && e.ctrlKey === true) ||
        (e.keyCode === 88 && e.ctrlKey === true) ||
        (e.keyCode >= 35 && e.keyCode <= 39)) {
        return;
    }
    
    if ((e.keyCode < 48 || e.keyCode > 57) && (e.keyCode < 96 || e.keyCode > 105)) {
        if (e.target.id === 'answer-input' && e.keyCode === 189 && e.target.selectionStart === 0) {
            return;
        }
        e.preventDefault();
    }
}

// Update negative button state
function updateNegativeButtonState() {
    const isNegative = answerInput.value.startsWith('-');
    negativeButton.classList.toggle('active', isNegative);
    negativeButton.textContent = isNegative ? '−' : '+/−';
}

// Reset form to default values
function resetToDefaults() {
    setupError.style.display = 'none';
    
    document.getElementById('addition').checked = true;
    document.getElementById('subtraction').checked = false;
    document.getElementById('multiplication').checked = false;
    document.getElementById('division').checked = false;
    
    operandDigitsInput.value = defaultValues['operand-digits'];
    resultDigitsInput.value = defaultValues['result-digits'];
    operandCountInput.value = defaultValues['operand-count'];
    problemCountInput.value = defaultValues['problem-count'];
    
    operatorMixingSelect.value = 'single';
    
    updateOperatorMixingVisibility();
    validateConstraints();
}

// Check if device is mobile
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Validate constraints based on current settings
function validateConstraints() {
    const operandDigits = parseInt(operandDigitsInput.value) || defaultValues['operand-digits'];
    const resultDigits = parseInt(resultDigitsInput.value) || defaultValues['result-digits'];
    const operandCount = parseInt(operandCountInput.value) || defaultValues['operand-count'];
    const selectedOperations = getSelectedOperations();
    
    setupError.style.display = 'none';
    
    if (resultDigits === 1) {
        let maxPossibleOperands = 0;
        
        if (selectedOperations.includes('addition')) {
            maxPossibleOperands = Math.max(maxPossibleOperands, operandDigits === 1 ? 9 : 1);
        }
        
        if (selectedOperations.includes('subtraction')) {
            maxPossibleOperands = Math.max(maxPossibleOperands, operandDigits === 1 ? 9 : 2);
        }
        
        if (selectedOperations.includes('multiplication')) {
            maxPossibleOperands = Math.max(maxPossibleOperands, operandDigits === 1 ? 3 : 1);
        }
        
        if (selectedOperations.includes('division')) {
            maxPossibleOperands = Math.max(maxPossibleOperands, operandDigits === 1 ? 9 : 3);
        }
        
        if (operandCount > maxPossibleOperands) {
            showSetupError(`With ${operandDigits}-digit operands and ${resultDigits}-digit answers, the current limit is ${maxPossibleOperands} operands. Please reduce the number of operands.`);
            return false;
        }
    }
    
    if (selectedOperations.includes('multiplication')) {
        const minResultDigits = operandDigits * 2;
        if (resultDigits < minResultDigits) {
            showSetupError(`For multiplication with ${operandDigits}-digit numbers, answers should have at least ${minResultDigits} digits.`);
            return false;
        }
    }
    
    if (selectedOperations.includes('addition') && operandCount > 1) {
        const minPossibleResult = operandCount * Math.pow(10, operandDigits - 1);
        const maxPossibleResult = operandCount * (Math.pow(10, operandDigits) - 1);
        const minResultDigits = Math.floor(Math.log10(minPossibleResult)) + 1;
        const maxResultDigits = Math.floor(Math.log10(maxPossibleResult)) + 1;
        
        if (resultDigits < minResultDigits) {
            showSetupError(`For addition with ${operandCount} ${operandDigits}-digit numbers, answers must have at least ${minResultDigits} digits.`);
            return false;
        }
    }
    
    if (selectedOperations.includes('subtraction') && operandCount > 1) {
        const minOperand = Math.pow(10, operandDigits - 1);
        const maxOperand = Math.pow(10, operandDigits) - 1;
        const minResult = minOperand - (operandCount - 1) * maxOperand;
        
        if (minResult < 0 && !selectedOperations.includes('subtraction')) {
            showSetupError(`With ${operandCount} ${operandDigits}-digit numbers and only positive results, subtraction may not be possible.`);
            return false;
        }
    }
    
    if (selectedOperations.includes('division')) {
        if (operandCount < 2) {
            showSetupError('Division requires at least 2 operands.');
            return false;
        }
        
        const maxOperand = Math.pow(10, operandDigits) - 1;
        const minOperand = Math.pow(10, operandDigits - 1);
        const maxResult = maxOperand / minOperand;
        const maxResultDigits = Math.floor(Math.log10(maxResult)) + 1;
        
        if (resultDigits < maxResultDigits) {
            showSetupError(`For division with ${operandDigits}-digit numbers, answers may have up to ${maxResultDigits} digits.`);
            return false;
        }
    }
    
    return true;
}

// Update operator mixing field visibility based on selected operations
function updateOperatorMixingVisibility() {
    const selectedOperations = getSelectedOperations();
    const operandCount = parseInt(operandCountInput.value) || defaultValues['operand-count'];
    
    const shouldShow = selectedOperations.length >= 2 && operandCount >= 3;
    
    operatorMixingGroup.style.display = shouldShow ? 'block' : 'none';
    
    validateConstraints();
}

// Start a new practice session
function startSession() {
    performanceSummary.style.display = 'none';
    
    const selectedOperations = getSelectedOperations();
    const operandDigits = parseInt(operandDigitsInput.value) || defaultValues['operand-digits'];
    const resultDigits = parseInt(resultDigitsInput.value) || defaultValues['result-digits'];
    const operandCount = parseInt(operandCountInput.value) || defaultValues['operand-count'];
    const operatorMixing = document.getElementById('operator-mixing').value;
    const problemCount = parseInt(problemCountInput.value) || defaultValues['problem-count'];

    if (!validateInputs(selectedOperations, operandDigits, resultDigits, operandCount)) {
        return;
    }

    session = {
        problemsSolved: 0,
        correctAnswers: 0,
        totalProblems: problemCount,
        currentProblem: null,
        isActive: true,
        problemCount: problemCount,
        settings: {
            operations: selectedOperations,
            operandDigits: operandDigits,
            resultDigits: resultDigits,
            operandCount: operandCount,
            operatorMixing: operatorMixing
        }
    };

    setupSection.style.display = 'none';
    sessionSection.style.display = 'block';
    updateStats();
    
    const shouldShowNegative = selectedOperations.includes('subtraction');
    negativeButton.style.display = shouldShowNegative ? 'block' : 'none';
    
    generateProblem();
    
    if (!isMobile()) {
        answerInput.focus();
    }
}

// End the current session
function endSession() {
    session.isActive = false;
    sessionSection.style.display = 'none';
    setupSection.style.display = 'block';
    setupError.textContent = '';
    setupError.style.display = 'none';
    
    showPerformanceSummary();
}

// Show performance summary
function showPerformanceSummary() {
    const problemsSolved = session.problemsSolved;
    const correctAnswers = session.correctAnswers;
    const accuracy = problemsSolved > 0 ? Math.round((correctAnswers / problemsSolved) * 100) : 0;
    
    const score = correctAnswers * accuracy;
    
    performanceSolved.textContent = problemsSolved;
    performanceCorrect.textContent = correctAnswers;
    performanceAccuracy.textContent = `${accuracy}%`;
    performanceScore.textContent = score;
    
    let message = '';
    if (accuracy >= 90) {
        message = 'Excellent work! You\'re a math wizard!';
    } else if (accuracy >= 75) {
        message = 'Great job! You\'re doing very well!';
    } else if (accuracy >= 60) {
        message = 'Good effort! Keep practicing to improve!';
    } else {
        message = 'Keep practicing! You\'ll get better with time!';
    }
    performanceMessage.textContent = message;
    
    performanceSummary.style.display = 'block';
}

// Get selected operations from checkboxes
function getSelectedOperations() {
    const selected = [];
    if (document.getElementById('addition').checked) selected.push('addition');
    if (document.getElementById('subtraction').checked) selected.push('subtraction');
    if (document.getElementById('multiplication').checked) selected.push('multiplication');
    if (document.getElementById('division').checked) selected.push('division');
    return selected;
}

// Validate user inputs
function validateInputs(selectedOperations, operandDigits, resultDigits, operandCount) {
    if (selectedOperations.length === 0) {
        showSetupError('Please select at least one operation.');
        return false;
    }

    if (operandCount < 2) {
        showSetupError('Number of values must be at least 2.');
        return false;
    }

    if (selectedOperations.includes('multiplication') && resultDigits < operandDigits * 2) {
        showSetupError(`For multiplication with ${operandDigits}-digit numbers, answers should have at least ${operandDigits * 2} digits.`);
        return false;
    }

    if (resultDigits === 1) {
        let maxPossibleOperands = 0;
        
        if (selectedOperations.includes('addition')) {
            maxPossibleOperands = Math.max(maxPossibleOperands, operandDigits === 1 ? 9 : 1);
        }
        
        if (selectedOperations.includes('subtraction')) {
            maxPossibleOperands = Math.max(maxPossibleOperands, operandDigits === 1 ? 9 : 2);
        }
        
        if (selectedOperations.includes('multiplication')) {
            maxPossibleOperands = Math.max(maxPossibleOperands, operandDigits === 1 ? 3 : 1);
        }
        
        if (selectedOperations.includes('division')) {
            maxPossibleOperands = Math.max(maxPossibleOperands, operandDigits === 1 ? 9 : 3);
        }
        
        if (operandCount > maxPossibleOperands) {
            showSetupError(`With ${operandDigits}-digit operands and ${resultDigits}-digit answers, the current limit is ${maxPossibleOperands} operands. Please reduce the number of operands.`);
            return false;
        }
    }

    if (selectedOperations.includes('addition') && operandCount > 1) {
        const minPossibleResult = operandCount * Math.pow(10, operandDigits - 1);
        const minResultDigits = Math.floor(Math.log10(minPossibleResult)) + 1;
        
        if (resultDigits < minResultDigits) {
            showSetupError(`For addition with ${operandCount} ${operandDigits}-digit numbers, answers must have at least ${minResultDigits} digits.`);
            return false;
        }
    }

    setupError.style.display = 'none';
    return true;
}

// Show setup error message
function showSetupError(message) {
    setupError.textContent = message;
    setupError.style.display = 'block';
}

// Generate a new problem
function generateProblem() {
    if (!session.isActive) return;

    if (session.totalProblems > 0 && session.problemsSolved >= session.totalProblems) {
        endSession();
        return;
    }

    const settings = session.settings;
    let problem, answer;
    let attempts = 0;
    const maxAttempts = 100;

    do {
        attempts++;
        if (attempts > maxAttempts) {
            showSetupError('Could not generate valid problems with current settings. Please adjust your constraints.');
            endSession();
            return;
        }

        problem = [];
        const operands = [];
        
        for (let i = 0; i < settings.operandCount; i++) {
            const min = Math.pow(10, settings.operandDigits - 1);
            const max = Math.pow(10, settings.operandDigits) - 1;
            operands.push(Math.floor(Math.random() * (max - min + 1)) + min);
        }

        let operators;
        const shouldMixOperators = settings.operatorMixing === 'mixed' && 
                                 settings.operations.length > 1 && 
                                 settings.operandCount >= 3;
        
        if (!shouldMixOperators) {
            const op = settings.operations[Math.floor(Math.random() * settings.operations.length)];
            operators = Array(settings.operandCount - 1).fill(op);
        } else {
            operators = [];
            for (let i = 0; i < settings.operandCount - 1; i++) {
                operators.push(settings.operations[Math.floor(Math.random() * settings.operations.length)]);
            }
        }

        problem.push(operands[0]);
        for (let i = 0; i < operators.length; i++) {
            problem.push(operations[operators[i]]);
            problem.push(operands[i + 1]);
        }

        answer = operands[0];
        for (let i = 0; i < operators.length; i++) {
            const operator = operators[i];
            const nextOperand = operands[i + 1];
            
            switch (operator) {
                case 'addition':
                    answer += nextOperand;
                    break;
                case 'subtraction':
                    answer -= nextOperand;
                    break;
                case 'multiplication':
                    answer *= nextOperand;
                    break;
                case 'division':
                    if (nextOperand === 0) {
                        answer = NaN;
                    } else {
                        if (answer % nextOperand !== 0) {
                            answer = NaN;
                        } else {
                            answer = answer / nextOperand;
                        }
                    }
                    break;
            }
        }
    } while (
        isNaN(answer) || 
        !isFinite(answer) ||
        Math.abs(answer).toString().length > settings.resultDigits ||
        (answer < 0 && !settings.operations.includes('subtraction')) ||
        (settings.operations.includes('division') && !Number.isInteger(answer))
    );

    session.currentProblem = {
        expression: problem.join(' '),
        answer: answer
    };

    problemElement.textContent = session.currentProblem.expression + ' = ?';
    answerInput.value = '';
    updateNegativeButtonState();
    
    problemContainer.classList.remove('correct', 'incorrect');
    
    if (!isMobile()) {
        answerInput.focus();
    }
}

// Handle answer input (keyboard)
function handleAnswerInput(e) {
    if (e.key === 'Enter') {
        checkAnswer();
    } else if (e.key === 'Backspace') {
        // Allow backspace
    } else if (!/^\d$|-/.test(e.key)) {
        e.preventDefault();
    }
}

// Check the user's answer
function checkAnswer() {
    if (!session.isActive || !session.currentProblem) return;

    const userAnswer = parseInt(answerInput.value);
    const correctAnswer = session.currentProblem.answer;
    const isCorrect = userAnswer === correctAnswer;

    session.problemsSolved++;
    if (isCorrect) {
        session.correctAnswers++;
    }

    updateStats();
    showFloatingPopup(isCorrect, correctAnswer);
    
    problemContainer.classList.add(isCorrect ? 'correct' : 'incorrect');

    setTimeout(() => {
        generateProblem();
    }, 1000);
}

// Update statistics display
function updateStats() {
    problemsSolvedElement.textContent = session.problemsSolved;
    correctCountElement.textContent = session.correctAnswers;
    
    const accuracy = session.problemsSolved > 0 
        ? Math.round((session.correctAnswers / session.problemsSolved) * 100) 
        : 0;
    accuracyElement.textContent = `${accuracy}%`;
    
    if (session.totalProblems > 0) {
        const progress = (session.problemsSolved / session.totalProblems) * 100;
        progressElement.style.width = `${progress}%`;
    } else {
        progressElement.style.width = '0%';
    }
}

// Show floating result popup
function showFloatingPopup(isCorrect, correctAnswer) {
    floatingPopup.textContent = isCorrect ? 'Correct!' : `Incorrect! Answer: ${correctAnswer}`;
    floatingPopup.className = `floating-popup ${isCorrect ? 'correct' : 'incorrect'}`;
    floatingPopup.classList.add('show');
    
    setTimeout(() => {
        floatingPopup.classList.remove('show');
    }, 2000);
}

// Debug function for development
window.debugSession = function() {
    console.log('Current Session:', session);
};
