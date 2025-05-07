// Глобальные переменные
let intentionStartTime = null; // Время начала игры Намеренье
let lastIntentionGuessTime = null; // Время последнего угадывания в Намеренье
let visionChoiceButtonsEnabledTime = null; // Время активации кнопок в Видении
let gameStartTime = null; // Время начала сессии
let sessionSummarySent = false; // Флаг отправки сводки сессии
let sessionId = Math.random().toString(36).substring(2); // Уникальный ID сессии
let sessionStartTime = Date.now(); // Время начала сессии
const ENABLE_LOGGING = true; // Включить логирование для отладки

// Константы для Намеренья
const INTENTION_FIXATION_DELAY_MIN = 0;
const INTENTION_FIXATION_DELAY_MAX = 500; // Увеличено для плавности
const INTENTION_RANDOMIZER_MIN_INTERVAL = 50;
const INTENTION_RANDOMIZER_MAX_INTERVAL = 200;

// Константы для Видения
const SHUFFLE_BUTTON_DISABLE_TIME = 2000;
const RANDOM_RESULT_MIN_TIME = 500;
const RANDOM_RESULT_MAX_TIME = 2000;

// Переменные состояния
let currentGameMode = 'menu';
let intentionMode = 'color'; // или 'shape'
let visionMode = 'color'; // или 'shape'
let intentionCurrentResult = null;
let visionCurrentResult = null;
let intentionRandomizerInterval = null;
let visionRandomizerTimeout = null;
let intentionAttemptsMode = 'unlimited'; // или 'limited'
let visionAttemptsMode = 'unlimited'; // или 'limited'
let intentionMaxAttempts = 10;
let visionMaxAttempts = 10;

// Статистика
const intentionStats = { attempts: 0, successes: 0, failures: 0 };
const visionStats = { attempts: 0, successes: 0, failures: 0 };

// Элементы DOM (предполагается, что они определены в HTML)
const intentionShowBtn = document.querySelector('#intention-show-btn');
const intentionDisplay = document.querySelector('#intention-display');
const intentionResultDisplay = document.querySelector('#intention-result-display');
const intentionAttemptsModeDiv = document.querySelector('#intention-attempts-mode');
const intentionNewGameBtn = document.querySelector('#intention-new-game-btn');
const visionShuffleBtn = document.querySelector('#vision-shuffle-btn');
const visionDisplay = document.querySelector('#vision-display');
const visionResultDisplay = document.querySelector('#vision-result-display');
const visionAttemptsModeDiv = document.querySelector('#vision-attempts-mode');
const visionNewGameBtn = document.querySelector('#vision-new-game-btn');
const btnStartIntention = document.querySelector('#start-intention-btn');
const btnStartVision = document.querySelector('#start-vision-btn');
const backButtons = document.querySelectorAll('.back-btn');

// Telegram WebApp (предполагается, что Telegram.WebApp доступен)
const telegramUser = Telegram.WebApp.initDataUnsafe.user || { id: 'unknown' };

function getRandomResult(mode) {
    if (mode === 'color') {
        const colors = ['red', 'blue', 'green', 'yellow'];
        return colors[Math.floor(Math.random() * colors.length)];
    } else {
        const shapes = ['circle', 'square', 'triangle'];
        return shapes[Math.floor(Math.random() * shapes.length)];
    }
}

function createSvgShape(shape) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100');
    svg.setAttribute('height', '100');
    let shapeElement;
    if (shape === 'circle') {
        shapeElement = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        shapeElement.setAttribute('cx', '50');
        shapeElement.setAttribute('cy', '50');
        shapeElement.setAttribute('r', '40');
    } else if (shape === 'square') {
        shapeElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        shapeElement.setAttribute('x', '10');
        shapeElement.setAttribute('y', '10');
        shapeElement.setAttribute('width', '80');
        shapeElement.setAttribute('height', '80');
    } else if (shape === 'triangle') {
        shapeElement = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        shapeElement.setAttribute('points', '50,10 90,90 10,90');
    }
    shapeElement.setAttribute('fill', 'black');
    svg.appendChild(shapeElement);
    return svg;
}

function updateIntentionStatsDisplay() {
    // Обновление отображения статистики (предполагается реализация)
    console.log(`Intention stats: attempts=${intentionStats.attempts}, successes=${intentionStats.successes}, failures=${intentionStats.failures}`);
}

function updateVisionStatsDisplay() {
    // Обновление отображения статистики (предполагается реализация)
    console.log(`Vision stats: attempts=${visionStats.attempts}, successes=${visionStats.successes}, failures=${visionStats.failures}`);
}

function setVisionChoiceButtonsEnabled(enabled) {
    document.querySelectorAll('.choice-btn').forEach(btn => {
        btn.disabled = !enabled;
    });
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('hidden');
    });
    document.querySelector(`#${screenId}`).classList.remove('hidden');
    currentGameMode = screenId === 'game-intention' ? 'intention' : screenId === 'game-vision' ? 'vision' : 'menu';
}

function resetIntentionGame() {
    intentionStats.attempts = 0;
    intentionStats.successes = 0;
    intentionStats.failures = 0;
    intentionCurrentResult = null;
    intentionRandomizerInterval = null;
    intentionShowBtn.disabled = false;
    intentionNewGameBtn.classList.add('hidden');
    updateIntentionStatsDisplay();
    startIntentionGame();
}

function resetVisionGame() {
    visionStats.attempts = 0;
    visionStats.successes = 0;
    visionStats.failures = 0;
    visionCurrentResult = null;
    visionRandomizerTimeout = null;
    visionShuffleBtn.disabled = false;
    setVisionChoiceButtonsEnabled(false);
    visionNewGameBtn.classList.add('hidden');
    updateVisionStatsDisplay();
}

// Намеренье: Запуск игры
function startIntentionGame() {
    console.log('Starting Intention game');
    intentionCurrentResult = getRandomResult(intentionMode);
    intentionStartTime = Date.now();
    lastIntentionGuessTime = null;
    if (ENABLE_LOGGING) {
        console.log('Starting intention game, mode:', intentionMode, 'result:', intentionCurrentResult);
    }

    function updateRandomResult() {
        intentionCurrentResult = getRandomResult(intentionMode);
        const randomInterval = INTENTION_RANDOMIZER_MIN_INTERVAL + Math.random() * (INTENTION_RANDOMIZER_MAX_INTERVAL - INTENTION_RANDOMIZER_MIN_INTERVAL);
        if (ENABLE_LOGGING) {
            console.log(`Randomizer updated, result: ${intentionCurrentResult}, next update in ${randomInterval.toFixed(2)}ms`);
        }
        intentionRandomizerInterval = setTimeout(updateRandomResult, randomInterval);
    }

    updateRandomResult();

    intentionShowBtn.classList.remove('hidden');
    intentionResultDisplay.classList.add('hidden');
    intentionDisplay.style.backgroundColor = 'black';
    intentionResultDisplay.style.backgroundColor = 'white';
    intentionResultDisplay.style.display = 'flex';
    intentionResultDisplay.style.zIndex = '10';
    gtag('event', 'randomizer_start', {
        'event_category': 'Game',
        'event_label': 'Intention Randomizer',
        'mode': intentionMode,
        'session_id': sessionId,
        'custom_user_id': telegramUser ? telegramUser.id : 'unknown'
    });
}

// Намеренье: Показ результата
function showIntentionResult() {
    if (intentionRandomizerInterval === null) {
        console.warn('Randomizer interval is null, cannot show result');
        return;
    }

    let isProcessingIntention = true;
    const randomDelay = INTENTION_FIXATION_DELAY_MIN + Math.random() * (INTENTION_FIXATION_DELAY_MAX - INTENTION_FIXATION_DELAY_MIN);
    if (ENABLE_LOGGING) {
        console.log(`Fixation delay: ${randomDelay.toFixed(2)}ms`);
    }

    intentionShowBtn.classList.add('processing');
    intentionDisplay.classList.add('processing');
    setTimeout(() => {
        if (ENABLE_LOGGING) {
            console.log('Showing intention result, mode:', intentionMode, 'result:', intentionCurrentResult);
        }
        intentionStats.attempts++;
        if (intentionStats.attempts === 1) {
            intentionAttemptsModeDiv.classList.add('hidden');
        }
        updateIntentionStatsDisplay();

        gtag('event', 'show_result', {
            'event_category': 'Game',
            'event_label': 'Intention Show',
            'mode': intentionMode,
            'session_id': sessionId,
            'custom_user_id': telegramUser ? telegramUser.id : 'unknown'
        });

        clearTimeout(intentionRandomizerInterval);
        intentionRandomizerInterval = null;
        intentionResultDisplay.innerHTML = '';
        intentionResultDisplay.style.backgroundColor = 'white';
        intentionResultDisplay.style.display = 'flex';

        if (intentionMode === 'color') {
            const colorBlock = document.createElement('div');
            colorBlock.style.width = '100%';
            colorBlock.style.height = '100%';
            colorBlock.style.backgroundColor = intentionCurrentResult || 'gray';
            intentionResultDisplay.appendChild(colorBlock);
            intentionResultDisplay.style.flexDirection = 'row';
            intentionResultDisplay.style.gap = '0';
        } else {
            const svg = createSvgShape(intentionCurrentResult || 'circle');
            intentionResultDisplay.appendChild(svg);
            intentionResultDisplay.style.flexDirection = 'column';
            intentionResultDisplay.style.gap = '0';
        }

        intentionResultDisplay.classList.remove('hidden');
        intentionDisplay.style.backgroundColor = 'transparent';
        intentionShowBtn.classList.add('hidden');
        intentionShowBtn.classList.remove('processing');
        intentionDisplay.classList.remove('processing');

        const feedbackButtons = document.createElement('div');
        feedbackButtons.className = 'feedback-buttons';
        const successBtn = document.createElement('button');
        successBtn.textContent = 'Угадал';
        successBtn.className = 'small-btn';
        successBtn.addEventListener('click', () => {
            if (!isProcessingIntention) return;
            isProcessingIntention = false;
            const guessTime = Date.now();
            const timeToGuess = lastIntentionGuessTime === null
                ? ((guessTime - intentionStartTime) / 1000).toFixed(1)
                : ((guessTime - lastIntentionGuessTime) / 1000).toFixed(1);
            lastIntentionGuessTime = guessTime;
            intentionStats.successes++;
            updateIntentionStatsDisplay();
            gtag('event', 'intention_guess', {
                'event_category': 'Game',
                'event_label': 'Intention Guess',
                'value': 'success',
                'guess_result': 1,
                'mode': intentionMode,
                'result': intentionCurrentResult,
                'time_to_guess': parseFloat(timeToGuess),
                'session_id': sessionId,
                'custom_user_id': telegramUser ? telegramUser.id : 'unknown'
            });
            if (ENABLE_LOGGING) {
                console.log(`Intention guess: time_to_guess=${timeToGuess}, guess_result=1`);
            }
            cleanupAndRestart();
        });
        const failureBtn = document.createElement('button');
        failureBtn.textContent = 'Не угадал';
        failureBtn.className = 'small-btn';
        failureBtn.addEventListener('click', () => {
            if (!isProcessingIntention) return;
            isProcessingIntention = false;
            const guessTime = Date.now();
            const timeToGuess = lastIntentionGuessTime === null
                ? ((guessTime - intentionStartTime) / 1000).toFixed(1)
                : ((guessTime - lastIntentionGuessTime) / 1000).toFixed(1);
            lastIntentionGuessTime = guessTime;
            intentionStats.failures++;
            updateIntentionStatsDisplay();
            gtag('event', 'intention_guess', {
                'event_category': 'Game',
                'event_label': 'Intention Guess',
                'value': 'failure',
                'guess_result': 0,
                'mode': intentionMode,
                'result': intentionCurrentResult,
                'time_to_guess': parseFloat(timeToGuess),
                'session_id': sessionId,
                'custom_user_id': telegramUser ? telegramUser.id : 'unknown'
            });
            if (ENABLE_LOGGING) {
                console.log(`Intention guess: time_to_guess=${timeToGuess}, guess_result=0`);
            }
            cleanupAndRestart();
        });
        feedbackButtons.appendChild(successBtn);
        feedbackButtons.appendChild(failureBtn);

        intentionDisplay.insertAdjacentElement('afterend', feedbackButtons);

        const timeout = setTimeout(cleanupAndRestart, 10000);

        function cleanupAndRestart() {
            clearTimeout(timeout);
            feedbackButtons.remove();
            intentionResultDisplay.classList.add('hidden');
            intentionDisplay.style.backgroundColor = 'black';
            intentionResultDisplay.style.backgroundColor = 'white';
            intentionShowBtn.classList.remove('hidden');
            isProcessingIntention = false;
            if (intentionAttemptsMode === 'limited' && intentionStats.attempts >= intentionMaxAttempts) {
                intentionShowBtn.disabled = true;
                intentionNewGameBtn.classList.remove('hidden');
            } else {
                startIntentionGame();
            }
        }
    }, randomDelay);
}

// Намеренье: Клик по дисплею
intentionDisplay.addEventListener('click', () => {
    if (!intentionShowBtn.classList.contains('hidden') && !intentionShowBtn.disabled && currentGameMode === 'intention' && !isProcessingIntention) {
        console.log('Intention display clicked, triggering show result');
        gtag('event', 'display_click', {
            'event_category': 'Game',
            'event_label': 'Intention Display',
            'session_id': sessionId,
            'custom_user_id': telegramUser ? telegramUser.id : 'unknown'
        });
        intentionShowBtn.click();
    }
});

// Видение: Запуск перемешивания
function startVisionShuffle() {
    console.log('Starting Vision shuffle');
    if (visionShuffleBtn.disabled) return;
    shuffleStartTime = Date.now();
    gtag('event', 'shuffle', {
        'event_category': 'Game',
        'event_label': 'Vision Shuffle',
        'mode': visionMode,
        'session_id': sessionId,
        'custom_user_id': telegramUser ? telegramUser.id : 'unknown'
    });

    visionShuffleBtn.disabled = true;
    setVisionChoiceButtonsEnabled(false);
    visionResultDisplay.classList.add('hidden');
    visionDisplay.style.backgroundColor = 'black';
    visionResultDisplay.style.backgroundColor = 'transparent';

    const randomTime = RANDOM_RESULT_MIN_TIME + Math.random() * (RANDOM_RESULT_MAX_TIME - RANDOM_RESULT_MIN_TIME);

    visionRandomizerTimeout = setTimeout(() => {
        visionCurrentResult = getRandomResult(visionMode);
        if (ENABLE_LOGGING) {
            console.log(`Random result generated at ${randomTime.toFixed(2)}ms:`, visionCurrentResult);
        }
    }, randomTime);

    setTimeout(() => {
        visionShuffleBtn.disabled = false;
        setVisionChoiceButtonsEnabled(true);
        visionChoiceButtonsEnabledTime = Date.now();
        if (ENABLE_LOGGING) {
            console.log(`Vision choice buttons enabled at ${visionChoiceButtonsEnabledTime}`);
        }
    }, SHUFFLE_BUTTON_DISABLE_TIME);
}

// Видение: Обработка выбора
function handleVisionChoice(event) {
    const targetBtn = event.target.closest('.choice-btn');
    if (visionCurrentResult === null || !targetBtn || targetBtn.disabled) return;

    const choice = targetBtn.dataset.choice;
    const guessTime = Date.now();
    const timeToGuess = visionChoiceButtonsEnabledTime
        ? ((guessTime - visionChoiceButtonsEnabledTime) / 1000).toFixed(1)
        : 0;
    setVisionChoiceButtonsEnabled(false);
    visionShuffleBtn.disabled = true;
    visionStats.attempts++;
    if (visionStats.attempts === 1) {
        visionAttemptsModeDiv.classList.add('hidden');
    }
    const isCorrect = (choice === visionCurrentResult);
    const guessResult = isCorrect ? 1 : 0;

    gtag('event', 'guess', {
        'event_category': 'Game',
        'event_label': 'Vision Guess',
        'value': isCorrect ? 'success' : 'failure',
        'guess_result': guessResult,
        'mode': visionMode,
        'choice': choice,
        'correct_answer': visionCurrentResult,
        'time_to_guess': parseFloat(timeToGuess),
        'session_id': sessionId,
        'custom_user_id': telegramUser ? telegramUser.id : 'unknown'
    });
    if (ENABLE_LOGGING) {
        console.log(`Vision guess: time_to_guess=${timeToGuess}, guess_result=${guessResult}`);
    }

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
        if (visionAttemptsMode === 'limited' && visionStats.attempts >= visionMaxAttempts) {
            visionShuffleBtn.disabled = true;
            setVisionChoiceButtonsEnabled(false);
            visionNewGameBtn.classList.remove('hidden');
        } else {
            visionShuffleBtn.disabled = false;
        }
    }, 2500);
}

// Отправка сводки сессии
function sendSessionSummary() {
    if (!gameStartTime || currentGameMode === 'menu' || sessionSummarySent) return;
    if (currentGameMode === 'vision' && visionStats.attempts === 0) return;
    if (currentGameMode === 'intention' && intentionStats.attempts === 0) return;
    if (!telegramUser || !telegramUser.id) {
        console.warn('telegramUser.id is missing, cannot send session summary');
        return;
    }

    const duration = ((Date.now() - gameStartTime) / 1000).toFixed(1);
    if (currentGameMode === 'vision') {
        console.log('Sending game_session_summary:', {
            sessionId,
            custom_user_id: telegramUser.id,
            session_duration_seconds: parseFloat(duration),
            session_start_time: Math.floor(sessionStartTime),
            attempts: visionStats.attempts,
            successes: visionStats.successes,
            failures: visionStats.failures,
            mode: visionMode
        });
        gtag('event', 'game_session_summary', {
            'event_category': 'Game',
            'event_label': 'Vision',
            'attempts': visionStats.attempts,
            'successes': visionStats.successes,
            'failures': visionStats.failures,
            'mode': visionMode,
            'session_duration_seconds': parseFloat(duration),
            'session_id': sessionId,
            'custom_user_id': telegramUser.id,
            'session_start_time': Math.floor(sessionStartTime)
        });
    } else if (currentGameMode === 'intention') {
        console.log('Sending intention_session_summary:', {
            sessionId,
            custom_user_id: telegramUser.id,
            session_duration_seconds: parseFloat(duration),
            session_start_time: Math.floor(sessionStartTime),
            attempts: intentionStats.attempts,
            successes: intentionStats.successes,
            failures: intentionStats.failures,
            mode: intentionMode
        });
        gtag('event', 'intention_session_summary', {
            'event_category': 'Game',
            'event_label': 'Intention',
            'attempts': intentionStats.attempts,
            'successes': intentionStats.successes,
            'failures': intentionStats.failures,
            'mode': intentionMode,
            'session_duration_seconds': parseFloat(duration),
            'session_id': sessionId,
            'custom_user_id': telegramUser.id,
            'session_start_time': Math.floor(sessionStartTime)
        });
    }
    sessionSummarySent = true;
}

// Обработчики событий
btnStartIntention.addEventListener('click', () => {
    if (gameStartTime && !sessionSummarySent && currentGameMode === 'vision') {
        const duration = ((Date.now() - gameStartTime) / 1000).toFixed(1);
        gtag('event', 'game_session_summary', {
            'event_category': 'Game',
            'event_label': 'Vision',
            'attempts': visionStats.attempts,
            'successes': visionStats.successes,
            'failures': visionStats.failures,
            'mode': visionMode,
            'session_duration_seconds': parseFloat(duration),
            'session_id': sessionId,
            'custom_user_id': telegramUser ? telegramUser.id : 'unknown',
            'session_start_time': Math.floor(sessionStartTime)
        });
        sessionSummarySent = true;
    }
    gameStartTime = Date.now();
    sessionSummarySent = false;
    resetIntentionGame();
    showScreen('game-intention');
    gtag('event', 'game_select', {
        'event_category': 'Game',
        'event_label': 'Intention',
        'game_mode': intentionMode,
        'session_id': sessionId,
        'custom_user_id': telegramUser ? telegramUser.id : 'unknown'
    });
});

btnStartVision.addEventListener('click', () => {
    if (gameStartTime && !sessionSummarySent && currentGameMode === 'intention') {
        const duration = ((Date.now() - gameStartTime) / 1000).toFixed(1);
        gtag('event', 'intention_session_summary', {
            'event_category': 'Game',
            'event_label': 'Intention',
            'attempts': intentionStats.attempts,
            'successes': intentionStats.successes,
            'failures': intentionStats.failures,
            'mode': intentionMode,
            'session_duration_seconds': parseFloat(duration),
            'session_id': sessionId,
            'custom_user_id': telegramUser ? telegramUser.id : 'unknown',
            'session_start_time': Math.floor(sessionStartTime)
        });
        sessionSummarySent = true;
    }
    gameStartTime = Date.now();
    sessionSummarySent = false;
    resetVisionGame();
    showScreen('game-vision');
    gtag('event', 'game_select', {
        'event_category': 'Game',
        'event_label': 'Vision',
        'game_mode': visionMode,
        'session_id': sessionId,
        'custom_user_id': telegramUser ? telegramUser.id : 'unknown'
    });
});

backButtons.forEach(button => {
    button.addEventListener('click', () => {
        if (gameStartTime && !sessionSummarySent) {
            const duration = ((Date.now() - gameStartTime) / 1000).toFixed(1);
            gtag('event', 'game_exit', {
                'event_category': 'Game',
                'event_label': currentGameMode === 'intention' ? 'Intention' : 'Vision',
                'game_mode': currentGameMode === 'intention' ? intentionMode : visionMode,
                'session_duration_seconds': parseFloat(duration),
                'session_id': sessionId,
                'custom_user_id': telegramUser ? telegramUser.id : 'unknown'
            });
            sendSessionSummary();
        }
        showScreen('menu-screen');
    });
});

window.addEventListener('beforeunload', () => {
    if (gameStartTime && !sessionSummarySent) {
        const duration = ((Date.now() - gameStartTime) / 1000).toFixed(1);
        gtag('event', 'session_end', {
            'event_category': 'App',
            'event_label': 'App Closed',
            'session_id': sessionId,
            'session_duration_seconds': parseFloat(duration),
            'custom_user_id': telegramUser ? telegramUser.id : 'unknown'
        });
        sendSessionSummary();
    }
});

Telegram.WebApp.onEvent('viewportChanged', (isStateStable) => {
    if (!isStateStable && !Telegram.WebApp.isExpanded() && gameStartTime && !sessionSummarySent) {
        const duration = ((Date.now() - gameStartTime) / 1000).toFixed(1);
        gtag('event', 'app_background', {
            'event_category': 'App',
            'event_label': 'App Minimized',
            'session_id': sessionId,
            'session_duration_seconds': parseFloat(duration),
            'custom_user_id': telegramUser ? telegramUser.id : 'unknown'
        });
        sendSessionSummary();
    }
});

// Инициализация (пример)
showScreen('menu-screen');
