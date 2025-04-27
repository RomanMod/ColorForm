let telegramUser = null;
let currentGameMode = 'menu'; // 'menu', 'intention', 'vision'
let gameStartTime = null; // Для отслеживания времени в игре
let shuffleStartTime = null; // Для времени между "Перемешать" и "Угадать"
const sessionId = Date.now().toString() + Math.random().toString(36).substr(2, 9); // Уникальный ID сессии
const sessionStartTime = Date.now(); // Время начала сессии

// Intention Game State
let intentionRandomizerInterval = null;
let intentionCurrentResult = null;
let intentionMode = 'color'; // 'color' or 'shape'
let intentionStats = {
    attempts: 0,
    successes: 0,
    failures: 0
};

// Vision Game State
let visionRandomizerTimeout = null;
let visionCurrentResult = null;
let visionMode = 'color'; // 'color' or 'shape'
let visionStats = {
    attempts: 0,
    successes: 0,
    failures: 0
};

// --- Element References ---
const appDiv = document.getElementById('app');
const userNameSpan = document.getElementById('telegram-user-name');

const menuScreen = document.getElementById('menu-screen');
const btnStartIntention = document.getElementById('btn-start-intention');
const btnStartVision = document.getElementById('btn-start-vision');
const btnReadMore = document.getElementById('btn-read-more');
const readMoreArea = document.getElementById('read-more-area');
const btnCloseReadMore = document.getElementById('btn-close-read-more');

// Intention Game Elements
const gameIntention = document.getElementById('game-intention');
const intentionDisplay = document.getElementById('intention-display');
const intentionResultDisplay = document.getElementById('intention-result');
const intentionShowBtn = document.getElementById('intention-show-btn');
const intentionModeRadios = document.querySelectorAll('input[name="intention-mode"]');
const intentionStatsSpanAttempts = document.getElementById('intention-stats-attempts');
const intentionStatsSpanSuccesses = document.getElementById('intention-stats-successes');
const intentionStatsSpanFailures = document.getElementById('intention-stats-failures');

// Vision Game Elements
const gameVision = document.getElementById('game-vision');
const visionShuffleBtn = document.getElementById('vision-shuffle-btn');
const visionDisplay = document.getElementById('vision-display');
const visionResultDisplay = document.getElementById('vision-result');
const visionChoicesDiv = document.getElementById('vision-choices');
const visionColorChoiceBtns = document.querySelectorAll('#vision-choices .color-btn');
const visionShapeChoiceBtns = document.querySelectorAll('#vision-choices .shape-btn');
const visionStatsSpanAttempts = document.getElementById('stats-attempts');
const visionStatsSpanSuccesses = document.getElementById('stats-successes');
const visionStatsSpanFailures = document.getElementById('stats-failures');
const visionModeRadios = document.querySelectorAll('input[name="vision-mode"]');

// Common Elements
const backButtons = document.querySelectorAll('.back-btn');

// --- Utility Functions ---

// Show a specific game screen
function showScreen(screenId) {
    const screens = document.querySelectorAll('.game-screen');
    screens.forEach(screen => screen.classList.add('hidden'));

    stopIntentionGame();
    stopVisionGame();

    if (screenId === 'menu-screen') {
        menuScreen.classList.remove('hidden');
        currentGameMode = 'menu';
        Telegram.WebApp.MainButton.hide();
        readMoreArea.classList.add('hidden');
        btnReadMore.classList.remove('hidden');
    } else if (screenId === 'game-intention') {
        gameIntention.classList.remove('hidden');
        currentGameMode = 'intention';
        startIntentionGame();
        updateIntentionStatsDisplay();
        Telegram.WebApp.MainButton.hide();
    } else if (screenId === 'game-vision') {
        gameVision.classList.remove('hidden');
        currentGameMode = 'vision';
        updateVisionChoicesDisplay();
        updateVisionStatsDisplay();
        visionShuffleBtn.disabled = false;
        setVisionChoiceButtonsEnabled(false);
        visionResultDisplay.classList.add('hidden');
        visionDisplay.style.backgroundColor = 'black';
        visionResultDisplay.style.backgroundColor = 'transparent';
        visionCurrentResult = null;
        Telegram.WebApp.MainButton.hide();
    }
}

// Get a random result based on the current mode
function getRandomResult(mode) {
    if (mode === 'color') {
        return Math.random() > 0.5 ? 'red' : 'blue';
    } else { // shape
        return Math.random() > 0.5 ? 'circle' : 'triangle';
    }
}

// Create SVG for a shape
function createSvgShape(type) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "100");
    svg.setAttribute("height", "100");
    svg.setAttribute("viewBox", "0 0 100 100");

    if (type === 'circle') {
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", "50");
        circle.setAttribute("cy", "50");
        circle.setAttribute("r", "40");
        svg.appendChild(circle);
    } else if (type === 'triangle') {
        const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        polygon.setAttribute("points", "50,10 90,90 10,90");
        svg.appendChild(polygon);
    }
    return svg;
}

// --- Intention Game Logic ---

function startIntentionGame() {
    intentionCurrentResult = getRandomResult(intentionMode);
    intentionRandomizerInterval = setInterval(() => {
        intentionCurrentResult = getRandomResult(intentionMode);
    }, 50);
    intentionShowBtn.classList.remove('hidden');
    intentionResultDisplay.classList.add('hidden');
    intentionDisplay.style.backgroundColor = 'black';
    intentionResultDisplay.style.backgroundColor = 'white';
    gtag('event', 'randomizer_start', {
        'event_category': 'Game',
        'event_label': 'Intention Randomizer',
        'mode': intentionMode,
        'session_id': sessionId
    });
}

function stopIntentionGame() {
    if (intentionRandomizerInterval !== null) {
        clearInterval(intentionRandomizerInterval);
        intentionRandomizerInterval = null;
    }
    intentionShowBtn.classList.remove('hidden');
    intentionResultDisplay.classList.add('hidden');
    intentionDisplay.style.backgroundColor = 'black';
    intentionResultDisplay.style.backgroundColor = 'white';
}

function showIntentionResult() {
    if (intentionRandomizerInterval === null) return;

    intentionStats.attempts++; // Увеличиваем попытки
    updateIntentionStatsDisplay();

    gtag('event', 'show_result', {
        'event_category': 'Game',
        'event_label': 'Intention Show',
        'mode': intentionMode,
        'session_id': sessionId
    });

    clearInterval(intentionRandomizerInterval);
    intentionRandomizerInterval = null;
    intentionResultDisplay.innerHTML = '';
    intentionResultDisplay.style.backgroundColor = 'white';

    if (intentionMode === 'color') {
        const colorBlock = document.createElement('div');
        colorBlock.style.width = '100%';
        colorBlock.style.height = '100%';
        colorBlock.style.backgroundColor = intentionCurrentResult;
        intentionResultDisplay.appendChild(colorBlock);
        intentionResultDisplay.style.flexDirection = 'row';
        intentionResultDisplay.style.gap = '0';
    } else {
        intentionResultDisplay.appendChild(createSvgShape(intentionCurrentResult));
        intentionResultDisplay.style.flexDirection = 'column';
        intentionResultDisplay.style.gap = '0';
    }

    intentionResultDisplay.classList.remove('hidden');
    intentionDisplay.style.backgroundColor = 'transparent';
    intentionShowBtn.classList.add('hidden');

    // Кнопки "Угадал"/"Не угадал"
    const feedbackButtons = document.createElement('div');
    feedbackButtons.classList.add('feedback-buttons');
    const successBtn = document.createElement('button');
    successBtn.textContent = 'Угадал';
    successBtn.className = 'small-btn';
    successBtn.addEventListener('click', () => {
        intentionStats.successes++;
        updateIntentionStatsDisplay();
        gtag('event', 'intention_guess', {
            'event_category': 'Game',
            'event_label': 'Intention Guess',
            'value': 'success',
            'mode': intentionMode,
            'result': intentionCurrentResult,
            'session_id': sessionId
        });
        feedbackButtons.remove();
        resetIntentionDisplay();
    });
    const failureBtn = document.createElement('button');
    failureBtn.textContent = 'Не угадал';
    failureBtn.className = 'small-btn';
    failureBtn.addEventListener('click', () => {
        intentionStats.failures++;
        updateIntentionStatsDisplay();
        gtag('event', 'intention_guess', {
            'event_category': 'Game',
            'event_label': 'Intention Guess',
            'value': 'failure',
            'mode': intentionMode,
            'result': intentionCurrentResult,
            'session_id': sessionId
        });
        feedbackButtons.remove();
        resetIntentionDisplay();
    });
    feedbackButtons.appendChild(successBtn);
    feedbackButtons.appendChild(failureBtn);
    intentionResultDisplay.appendChild(feedbackButtons);

    setTimeout(() => {
        if (feedbackButtons.parentNode) {
            feedbackButtons.remove();
            resetIntentionDisplay();
        }
    }, 10000); // Увеличено до 10 секунд
}

function resetIntentionDisplay() {
    intentionResultDisplay.classList.add('hidden');
    intentionDisplay.style.backgroundColor = 'black';
    intentionResultDisplay.style.backgroundColor = 'white';
    intentionShowBtn.classList.remove('hidden');
    startIntentionGame();
}

function updateIntentionStatsDisplay() {
    intentionStatsSpanAttempts.textContent = intentionStats.attempts;
    intentionStatsSpanSuccesses.textContent = intentionStats.successes;
    intentionStatsSpanFailures.textContent = intentionStats.failures;
}

// --- Vision Game Logic ---

function startVisionShuffle() {
    if (visionShuffleBtn.disabled) return;
    shuffleStartTime = Date.now();
    gtag('event', 'shuffle', {
        'event_category': 'Game',
        'event_label': 'Vision Shuffle',
        'mode': visionMode,
        'session_id': sessionId
    });

    visionShuffleBtn.disabled = true;
    setVisionChoiceButtonsEnabled(false);
    visionResultDisplay.classList.add('hidden');
    visionDisplay.style.backgroundColor = 'black';
    visionResultDisplay.style.backgroundColor = 'transparent';

    visionRandomizerTimeout = setTimeout(() => {
        visionCurrentResult = getRandomResult(visionMode);
        visionShuffleBtn.disabled = false;
        setVisionChoiceButtonsEnabled(true);
    }, 3000);
}

function stopVisionGame() {
    if (visionRandomizerTimeout !== null) {
        clearTimeout(visionRandomizerTimeout);
        visionRandomizerTimeout = null;
    }
    visionShuffleBtn.disabled = false;
    setVisionChoiceButtonsEnabled(false);
    visionResultDisplay.classList.add('hidden');
    visionDisplay.style.backgroundColor = 'black';
    visionResultDisplay.style.backgroundColor = 'transparent';
    visionCurrentResult = null;
}

function setVisionChoiceButtonsEnabled(enabled) {
    const buttons = visionChoicesDiv.querySelectorAll('.choice-btn');
    buttons.forEach(button => {
        if (!button.classList.contains('hidden')) {
            button.disabled = !enabled;
        } else {
            button.disabled = true;
        }
    });
}

function handleVisionChoice(event) {
    const targetBtn = event.target.closest('.choice-btn');
    if (visionCurrentResult === null || !targetBtn || targetBtn.disabled) return;

    const choice = targetBtn.dataset.choice;
    const guessTime = shuffleStartTime ? (Date.now() - shuffleStartTime) / 1000 : 0;
    setVisionChoiceButtonsEnabled(false);
    visionShuffleBtn.disabled = true;
    visionStats.attempts++;
    const isCorrect = (choice === visionCurrentResult);

    gtag('event', 'guess', {
        'event_category': 'Game',
        'event_label': 'Vision Guess',
        'value': isCorrect ? 'success' : 'failure',
        'mode': visionMode,
        'choice': choice,
        'correct_answer': visionCurrentResult,
        'time_to_guess': guessTime,
        'session_id': sessionId
    });

    if (isCorrect) {
        visionStats.successes++;
    } else {
        visionStats.failures++;
    }

    visionResultDisplay.classList.remove('hidden');
    visionDisplay.style.backgroundColor = 'transparent';
    visionResultDisplay.innerHTML = '';
    visionResultDisplay.style.backgroundColor = 'transparent';

    if (visionMode === 'color') {
        visionResultDisplay.style.backgroundColor = visionCurrentResult;
        let messageText = document.createElement('p');
        messageText.classList.add('feedback-text');
        messageText.textContent = isCorrect ? 'Успех!' : 'Попробуй ещё!';
        messageText.style.color = 'white';
        messageText.style.textShadow = '1px 1px 3px rgba(0,0,0,0.5)';
        visionResultDisplay.appendChild(messageText);
        visionResultDisplay.style.flexDirection = 'column';
        visionResultDisplay.style.gap = '0';
    } else {
        const feedbackContent = document.createElement('div');
        feedbackContent.classList.add('vision-feedback-content');
        feedbackContent.style.backgroundColor = 'white';
        feedbackContent.appendChild(createSvgShape(visionCurrentResult));
        visionResultDisplay.appendChild(feedbackContent);
        visionResultDisplay.style.flexDirection = 'row';
        visionResultDisplay.style.gap = '0';
    }

    updateVisionStatsDisplay();
    visionCurrentResult = null;
    setTimeout(() => {
        visionResultDisplay.classList.add('hidden');
        visionResultDisplay.style.backgroundColor = 'transparent';
        visionDisplay.style.backgroundColor = 'black';
        visionShuffleBtn.disabled = false;
    }, 2500);
}

function updateVisionStatsDisplay() {
    visionStatsSpanAttempts.textContent = visionStats.attempts;
    visionStatsSpanSuccesses.textContent = visionStats.successes;
    visionStatsSpanFailures.textContent = visionStats.failures;
}

function updateVisionChoicesDisplay() {
    visionColorChoiceBtns.forEach(btn => btn.classList.add('hidden'));
    visionShapeChoiceBtns.forEach(btn => btn.classList.add('hidden'));
    setVisionChoiceButtonsEnabled(false);

    if (visionMode === 'color') {
        visionColorChoiceBtns.forEach(btn => btn.classList.remove('hidden'));
    } else {
        visionShapeChoiceBtns.forEach(btn => btn.classList.remove('hidden'));
    }
}

// --- Event Listeners ---

// Menu buttons
btnStartIntention.addEventListener('click', () => {
    gameStartTime = Date.now();
    showScreen('game-intention');
    gtag('event', 'game_select', {
        'event_category': 'Game',
        'event_label': 'Intention',
        'game_mode': intentionMode,
        'session_id': sessionId
    });
});

btnStartVision.addEventListener('click', () => {
    gameStartTime = Date.now();
    showScreen('game-vision');
    gtag('event', 'game_select', {
        'event_category': 'Game',
        'event_label': 'Vision',
        'game_mode': visionMode,
        'session_id': sessionId
    });
});

btnReadMore.addEventListener('click', () => {
    readMoreArea.classList.remove('hidden');
    btnReadMore.classList.add('hidden');
    gtag('event', 'read_more', {
        'event_category': 'App',
        'event_label': 'Read More Clicked',
        'session_id': sessionId
    });
});

btnCloseReadMore.addEventListener('click', () => {
    readMoreArea.classList.add('hidden');
    btnReadMore.classList.remove('hidden');
});

// Back buttons
backButtons.forEach(button => {
    button.addEventListener('click', () => {
        if (gameStartTime) {
            const duration = (Date.now() - gameStartTime) / 1000;
            gtag('event', 'game_exit', {
                'event_category': 'Game',
                'event_label': currentGameMode === 'intention' ? 'Intention' : 'Vision',
                'game_mode': currentGameMode === 'intention' ? intentionMode : visionMode,
                'duration_seconds': duration,
                'session_id': sessionId
            });
            if (currentGameMode === 'vision') {
                gtag('event', 'game_session_summary', {
                    'event_category': 'Game',
                    'event_label': 'Vision',
                    'attempts': visionStats.attempts,
                    'successes': visionStats.successes,
                    'failures': visionStats.failures,
                    'mode': visionMode,
                    'duration_seconds': duration,
                    'session_id': sessionId
                });
            } else if (currentGameMode === 'intention') {
                gtag('event', 'intention_game_session_summary', {
                    'event_category': 'Game',
                    'event_label': 'Intention',
                    'attempts': intentionStats.attempts,
                    'successes': intentionStats.successes,
                    'failures': intentionStats.failures,
                    'mode': intentionMode,
                    'duration_seconds': duration,
                    'session_id': sessionId
                });
            }
            gameStartTime = null;
        }
        showScreen('menu-screen');
    });
});

// Intention Game Listeners
intentionShowBtn.addEventListener('click', showIntentionResult);
intentionDisplay.addEventListener('click', () => {
    if (!intentionShowBtn.classList.contains('hidden') && !intentionShowBtn.disabled && currentGameMode === 'intention') {
        gtag('event', 'display_click', {
            'event_category': 'Game',
            'event_label': 'Intention Display',
            'session_id': sessionId
        });
        intentionShowBtn.click();
    }
});

intentionModeRadios.forEach(radio => {
    radio.addEventListener('change', (event) => {
        intentionMode = event.target.value;
        gtag('event', 'mode_change', {
            'event_category': 'Game',
            'event_label': 'Intention Mode',
            'value': intentionMode,
            'session_id': sessionId
        });
        stopIntentionGame();
        startIntentionGame();
    });
});

// Vision Game Listeners
visionShuffleBtn.addEventListener('click', startVisionShuffle);
visionDisplay.addEventListener('click', () => {
    if (!visionShuffleBtn.disabled && currentGameMode === 'vision') {
        gtag('event', 'display_click', {
            'event_category': 'Game',
            'event_label': 'Vision Display',
            'session_id': sessionId
        });
        visionShuffleBtn.click();
    }
});

visionChoicesDiv.addEventListener('click', handleVisionChoice);

visionModeRadios.forEach(radio => {
    radio.addEventListener('change', (event) => {
        visionMode = event.target.value;
        gtag('event', 'mode_change', {
            'event_category': 'Game',
            'event_label': 'Vision Mode',
            'value': visionMode,
            'session_id': sessionId
        });
        updateVisionChoicesDisplay();
        setVisionChoiceButtonsEnabled(false);
        visionShuffleBtn.disabled = false;
        visionResultDisplay.classList.add('hidden');
        visionDisplay.style.backgroundColor = 'black';
        visionResultDisplay.style.backgroundColor = 'transparent';
        visionCurrentResult = null;
    });
});

// --- Error Handling ---
window.addEventListener('error', (error) => {
    gtag('event', 'error', {
        'event_category': 'App',
        'event_label': 'Runtime Error',
        'error_message': error.message,
        'error_file': error.filename,
        'session_id': sessionId
    });
});

// --- Session End ---
window.addEventListener('beforeunload', () => {
    gtag('event', 'session_end', {
        'event_category': 'App',
        'event_label': 'App Closed',
        'session_id': sessionId,
        'duration_seconds': (Date.now() - sessionStartTime) / 1000
    });
});

// --- Telegram Web Apps Initialization ---
Telegram.WebApp.ready();

if (Telegram.WebApp.initDataUnsafe && Telegram.WebApp.initDataUnsafe.user) {
    telegramUser = Telegram.WebApp.initDataUnsafe.user;
    userNameSpan.textContent = telegramUser.first_name || 'Игрок';
    gtag('set', 'user_id', telegramUser.id);
    gtag('event', 'app_launch', {
        'event_category': 'App',
        'event_label': 'Mini App Started',
        'start_param': Telegram.WebApp.initDataUnsafe.start_param || 'none',
        'session_id': sessionId
    });
} else {
    gtag('event', 'app_launch', {
        'event_category': 'App',
        'event_label': 'Mini App Started (No User)',
        'start_param': Telegram.WebApp.initDataUnsafe.start_param || 'none',
        'session_id': sessionId
    });
}

Telegram.WebApp.expand();
showScreen('menu-screen');

// App minimized
Telegram.WebApp.onEvent('viewportChanged', (isStateStable) => {
    if (!isStateStable && !Telegram.WebApp.isExpanded()) {
        gtag('event', 'app_background', {
            'event_category': 'App',
            'event_label': 'App Minimized',
            'session_id': sessionId
        });
    }
});
