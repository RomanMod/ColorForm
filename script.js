// Настройки логирования
const ENABLE_LOGGING = true;

// Константы для времени "перемешивания" и генерации результата в Виденье
const SHUFFLE_BUTTON_DISABLE_TIME = 3000;
const RANDOM_RESULT_MIN_TIME = 1200;
const RANDOM_RESULT_MAX_TIME = 2800;

// Константы для рандомизации в Намеренье
const INTENTION_RANDOMIZER_MIN_INTERVAL = 30;
const INTENTION_RANDOMIZER_MAX_INTERVAL = 100;
const INTENTION_FIXATION_DELAY_MIN = 0;
const INTENTION_FIXATION_DELAY_MAX = 200;

// Инициализация переменных
let telegramUser = null;
let currentGameMode = 'menu';
let gameStartTime = null;
let shuffleStartTime = null;
let intentionShowTime = null; // Время нажатия "Показать" в Намеренье
let choiceButtonsEnabledTime = null; // Время активации кнопок выбора в Виденье
const sessionId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
const sessionStartTime = Date.now();
let sessionSummarySent = false;

let intentionRandomizerInterval = null;
let intentionCurrentResult = null;
let intentionMode = 'color';
let intentionAttemptsMode = 'limited';
let intentionMaxAttempts = 10;
let isProcessingIntention = false;
const intentionStats = {
    attempts: 0,
    successes: 0,
    failures: 0
};
let intentionGuessSequence = []; // Массив для последовательности угадал/не угадал в Намеренье
let intentionRandomizerCount = 0; // Счетчик обновлений рандомайзера

let visionRandomizerTimeout = null;
let visionCurrentResult = null;
let visionMode = 'color';
let visionAttemptsMode = 'limited';
let visionMaxAttempts = 10;
const visionStats = {
    attempts: 0,
    successes: 0,
    failures: 0
};
let visionGuessSequence = []; // Массив для последовательности угадал/не угадал в Виденье

const appDiv = document.getElementById('app');
const userNameSpan = document.getElementById('telegram-user-name');

const menuScreen = document.getElementById('menu-screen');
const btnStartIntention = document.getElementById('btn-start-intention');
const btnStartVision = document.getElementById('btn-start-vision');
const btnReadMore = document.getElementById('btn-read-more');
const readMoreArea = document.getElementById('read-more-area');
const btnCloseReadMore = document.getElementById('btn-close-read-more');

const gameIntention = document.getElementById('game-intention');
const intentionDisplay = document.getElementById('intention-display');
const intentionResultDisplay = document.getElementById('intention-result');
const intentionShowBtn = document.getElementById('intention-show-btn');
const intentionNewGameBtn = document.getElementById('intention-new-game-btn');
const intentionAttemptsModeDiv = document.getElementById('intention-attempts-mode');
const intentionModeRadios = document.querySelectorAll('input[name="intention-mode"]');
const intentionAttemptsModeRadios = document.querySelectorAll('input[name="intention-attempts-mode"]');
const intentionStatsSpanAttempts = document.getElementById('intention-stats-attempts');
const intentionStatsSpanMaxAttempts = document.getElementById('intention-stats-max-attempts');
const intentionStatsSpanSuccesses = document.getElementById('intention-stats-successes');
const intentionStatsSpanFailures = document.getElementById('intention-stats-failures');
const intentionStatsSpanSuccessRate = document.getElementById('intention-stats-success-rate');

const gameVision = document.getElementById('game-vision');
const visionShuffleBtn = document.getElementById('vision-shuffle-btn');
const visionDisplay = document.getElementById('vision-display');
const visionResultDisplay = document.getElementById('vision-result');
const visionChoicesDiv = document.getElementById('vision-choices');
const visionNewGameBtn = document.getElementById('vision-new-game-btn');
const visionAttemptsModeDiv = document.getElementById('vision-attempts-mode');
const visionColorChoiceBtns = document.querySelectorAll('#vision-choices .color-btn');
const visionShapeChoiceBtns = document.querySelectorAll('#vision-choices .shape-btn');
const visionStatsSpanAttempts = document.getElementById('stats-attempts');
const visionStatsSpanMaxAttempts = document.getElementById('stats-max-attempts');
const visionStatsSpanSuccesses = document.getElementById('stats-successes');
const visionStatsSpanFailures = document.getElementById('stats-failures');
const visionStatsSpanSuccessRate = document.getElementById('stats-success-rate');
const visionModeRadios = document.querySelectorAll('input[name="vision-mode"]');
const visionAttemptsModeRadios = document.querySelectorAll('input[name="vision-attempts-mode"]');

const backButtons = document.querySelectorAll('.back-btn');

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

function showScreen(screenId) {
    console.log('Showing screen:', screenId);
    const screens = document.querySelectorAll('.game-screen');
    screens.forEach(screen => screen.classList.add('hidden'));

    stopIntentionGame();
    stopVisionGame();

    if (screenId === 'menu-screen') {
        sendSessionSummary();
        menuScreen.classList.remove('hidden');
        currentGameMode = 'menu';
        Telegram.WebApp.MainButton.hide();
        readMoreArea.classList.add('hidden');
        btnReadMore.classList.remove('hidden');
        if (ENABLE_LOGGING && gameStartTime) {
            const totalTime = ((Date.now() - gameStartTime) / 1000).toFixed(1);
            console.log(`Returning to menu, total game time: ${totalTime}s`);
            console.log(`Intention guess sequence: [${intentionGuessSequence.join(', ')}]`);
            console.log(`Vision guess sequence: [${visionGuessSequence.join(', ')}]`);
        }
    } else if (screenId === 'game-intention') {
        gameIntention.classList.remove('hidden');
        currentGameMode = 'intention';
        startIntentionGame();
        updateIntentionStatsDisplay();
        intentionNewGameBtn.classList.add('hidden');
        intentionAttemptsModeDiv.classList.remove('hidden');
        Telegram.WebApp.MainButton.hide();
    } else if (screenId === 'game-vision') {
        gameVision.classList.remove('hidden');
        currentGameMode = 'vision';
        updateVisionChoicesDisplay();
        updateVisionStatsDisplay();
        visionShuffleBtn.disabled = false;
        visionNewGameBtn.classList.add('hidden');
        visionAttemptsModeDiv.classList.remove('hidden');
        setVisionChoiceButtonsEnabled(false);
        visionResultDisplay.classList.add('hidden');
        visionDisplay.style.backgroundColor = 'black';
        visionResultDisplay.style.backgroundColor = 'transparent';
        visionCurrentResult = null;
        choiceButtonsEnabledTime = null;
    }
}

function getRandomResult(mode) {
    if (mode === 'color') {
        return Math.random() > 0.5 ? 'red' : 'blue';
    } else {
        return Math.random() > 0.5 ? 'circle' : 'triangle';
    }
}

function createSvgShape(type) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "100");
    svg.setAttribute("height", "100");
    svg.setAttribute("viewBox", "0 0 100 100");
    svg.style.fill = 'black';

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

function resetIntentionGame() {
    console.log('Resetting Intention game');
    intentionStats.attempts = 0;
    intentionStats.successes = 0;
    intentionStats.failures = 0;
    intentionGuessSequence = [];
    intentionShowTime = null; // Сбрасываем время показа
    intentionRandomizerCount = 0; // Сбрасываем счетчик рандомайзера
    stopIntentionGame();
    startIntentionGame();
    updateIntentionStatsDisplay();
    intentionShowBtn.disabled = false;
    intentionNewGameBtn.classList.add('hidden');
    intentionAttemptsModeDiv.classList.remove('hidden');
    if (ENABLE_LOGGING) {
        console.log('Intention game reset, guess sequence and show time cleared');
    }
}

function resetVisionGame() {
    console.log('Resetting Vision game');
    visionStats.attempts = 0;
    visionStats.successes = 0;
    visionStats.failures = 0;
    visionGuessSequence = [];
    stopVisionGame();
    updateVisionStatsDisplay();
    visionShuffleBtn.disabled = false;
    visionNewGameBtn.classList.add('hidden');
    visionAttemptsModeDiv.classList.remove('hidden');
    setVisionChoiceButtonsEnabled(false);
    visionResultDisplay.classList.add('hidden');
    visionDisplay.style.backgroundColor = 'black';
    visionResultDisplay.style.backgroundColor = 'transparent';
    visionCurrentResult = null;
    choiceButtonsEnabledTime = null;
    if (ENABLE_LOGGING) {
        console.log('Vision game reset, guess sequence cleared');
    }
}

function startIntentionGame() {
    console.log('Starting Intention game');
    intentionCurrentResult = getRandomResult(intentionMode);
    intentionShowTime = null; // Сбрасываем время показа
    intentionRandomizerCount = 0; // Сбрасываем счетчик
    if (ENABLE_LOGGING) {
        console.log('Starting intention game, mode:', intentionMode, 'result:', intentionCurrentResult);
    }

    function updateRandomResult() {
        intentionCurrentResult = getRandomResult(intentionMode);
        const randomInterval = INTENTION_RANDOMIZER_MIN_INTERVAL + Math.random() * (INTENTION_RANDOMIZER_MAX_INTERVAL - INTENTION_RANDOMIZER_MIN_INTERVAL);
        intentionRandomizerCount++;
        if (ENABLE_LOGGING && intentionRandomizerCount % 10 === 0) { // Логируем каждое 10-е обновление
            console.log(`Randomizer updated (count: ${intentionRandomizerCount}), result: ${intentionCurrentResult}, next update in ${randomInterval.toFixed(2)}ms`);
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

function stopIntentionGame() {
    if (intentionRandomizerInterval !== null) {
        clearTimeout(intentionRandomizerInterval);
        intentionRandomizerInterval = null;
    }
    intentionShowBtn.classList.remove('hidden');
    intentionResultDisplay.classList.add('hidden');
    intentionDisplay.style.backgroundColor = 'black';
    intentionResultDisplay.style.backgroundColor = 'white';
    intentionShowTime = null; // Сбрасываем время показа
}

function showIntentionResult() {
    if (intentionRandomizerInterval === null || isProcessingIntention) {
        console.warn('Randomizer interval is null or processing, cannot show result');
        return;
    }

    isProcessingIntention = true;
    intentionShowTime = Date.now(); // Фиксируем время нажатия "Показать"
    const randomDelay = INTENTION_FIXATION_DELAY_MIN + Math.random() * (INTENTION_FIXATION_DELAY_MAX - INTENTION_FIXATION_DELAY_MIN);
    if (ENABLE_LOGGING) {
        console.log(`Fixation delay: ${randomDelay.toFixed(2)}ms, show time: ${intentionShowTime}`);
    }

    intentionShowBtn.classList.add('processing');
    intentionDisplay.classList.add('processing');
    setTimeout(() => {
        if (ENABLE_LOGGING) {
            console.log('Showing intention result, mode:', intentionMode, 'result:', intentionCurrentResult);
            console.log(`Intention result displayed at: ${Date.now()}`);
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
            const timeToGuess = intentionShowTime
                ? Math.round((guessTime - intentionShowTime) / 1000)
                : 0;
            intentionStats.successes++;
            intentionGuessSequence.push(1);
            updateIntentionStatsDisplay();
            gtag('event', 'intention_guess', {
                'event_category': 'Game',
                'event_label': 'Intention Guess',
                'value': 'success',
                'guess_result': 1,
                'mode': intentionMode,
                'result': intentionCurrentResult,
                'time_to_guess': timeToGuess,
                'session_id': sessionId,
                'custom_user_id': telegramUser ? telegramUser.id : 'unknown'
            });
            if (ENABLE_LOGGING) {
                const totalTime = ((Date.now() - gameStartTime) / 1000).toFixed(1);
                console.log(`Intention guess: Success, result: ${intentionCurrentResult}, time_to_guess: ${timeToGuess}s, sequence: [${intentionGuessSequence.join(', ')}], total game time: ${totalTime}s`);
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
            const timeToGuess = intentionShowTime
                ? Math.round((guessTime - intentionShowTime) / 1000)
                : 0;
            intentionStats.failures++;
            intentionGuessSequence.push(0);
            updateIntentionStatsDisplay();
            gtag('event', 'intention_guess', {
                'event_category': 'Game',
                'event_label': 'Intention Guess',
                'value': 'failure',
                'guess_result': 0,
                'mode': intentionMode,
                'result': intentionCurrentResult,
                'time_to_guess': timeToGuess,
                'session_id': sessionId,
                'custom_user_id': telegramUser ? telegramUser.id : 'unknown'
            });
            if (ENABLE_LOGGING) {
                const totalTime = ((Date.now() - gameStartTime) / 1000).toFixed(1);
                console.log(`Intention guess: Failure, result: ${intentionCurrentResult}, time_to_guess: ${timeToGuess}s, sequence: [${intentionGuessSequence.join(', ')}], total game time: ${totalTime}s`);
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
            intentionShowTime = null; // Сбрасываем после попытки
            if (intentionAttemptsMode === 'limited' && intentionStats.attempts >= intentionMaxAttempts) {
                intentionShowBtn.disabled = true;
                intentionNewGameBtn.classList.remove('hidden');
            } else {
                startIntentionGame();
            }
        }
    }, randomDelay);
}

function updateIntentionStatsDisplay() {
    intentionStatsSpanAttempts.textContent = intentionStats.attempts;
    intentionStatsSpanMaxAttempts.textContent = intentionAttemptsMode === 'limited' ? intentionMaxAttempts : '∞';
    intentionStatsSpanSuccesses.textContent = intentionStats.successes;
    intentionStatsSpanFailures.textContent = intentionStats.failures;
    const successRate = intentionStats.attempts > 0 ? Math.round((intentionStats.successes / intentionStats.attempts) * 100) : 0;
    intentionStatsSpanSuccessRate.textContent = `${successRate}%`;
}

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
        choiceButtonsEnabledTime = Date.now();
        if (ENABLE_LOGGING) {
            console.log(`Choice buttons enabled at: ${choiceButtonsEnabledTime}`);
        }
    }, SHUFFLE_BUTTON_DISABLE_TIME);
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
    choiceButtonsEnabledTime = null;
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
    setVisionChoiceButtonsEnabled(false);
    visionShuffleBtn.disabled = true;
    visionStats.attempts++;
    if (visionStats.attempts === 1) {
        visionAttemptsModeDiv.classList.add('hidden');
    }
    const isCorrect = (choice === visionCurrentResult);
    const guessResult = isCorrect ? 1 : 0;

    visionResultDisplay.classList.remove('hidden');
    const resultDisplayTime = Date.now();
    const guessTime = choiceButtonsEnabledTime
        ? Math.round((resultDisplayTime - choiceButtonsEnabledTime) / 1000)
        : 0;
    choiceButtonsEnabledTime = null;
    visionGuessSequence.push(guessResult);
    if (ENABLE_LOGGING) {
        const totalTime = ((Date.now() - gameStartTime) / 1000).toFixed(1);
        console.log(`Vision guess: ${isCorrect ? 'Success' : 'Failure'}, choice: ${choice}, correct: ${visionCurrentResult}, time_to_guess: ${guessTime}s, sequence: [${visionGuessSequence.join(', ')}], total game time: ${totalTime}s`);
    }

    gtag('event', 'guess', {
        'event_category': 'Game',
        'event_label': 'Vision Guess',
        'value': isCorrect ? 'success' : 'failure',
        'guess_result': guessResult,
        'mode': visionMode,
        'choice': choice,
        'correct_answer': visionCurrentResult,
        'time_to_guess': guessTime,
        'session_id': sessionId,
        'custom_user_id': telegramUser ? telegramUser.id : 'unknown'
    });

    if (isCorrect) {
        visionStats.successes++;
    } else {
        visionStats.failures++;
    }

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

function updateVisionStatsDisplay() {
    visionStatsSpanAttempts.textContent = visionStats.attempts;
    visionStatsSpanMaxAttempts.textContent = visionAttemptsMode === 'limited' ? visionMaxAttempts : '∞';
    visionStatsSpanSuccesses.textContent = visionStats.successes;
    visionStatsSpanFailures.textContent = visionStats.failures;
    const successRate = visionStats.attempts > 0 ? Math.round((visionStats.successes / visionStats.attempts) * 100) : 0;
    visionStatsSpanSuccessRate.textContent = `${successRate}%`;
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

btnStartIntention.addEventListener('click', () => {
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

btnReadMore.addEventListener('click', () => {
    readMoreArea.classList.remove('hidden');
    btnReadMore.classList.add('hidden');
    gtag('event', 'read_more', {
        'event_category': 'App',
        'event_label': 'Read More Clicked',
        'session_id': sessionId,
        'custom_user_id': telegramUser ? telegramUser.id : 'unknown'
    });
});

btnCloseReadMore.addEventListener('click', () => {
    readMoreArea.classList.add('hidden');
    btnReadMore.classList.remove('hidden');
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

intentionShowBtn.addEventListener('click', showIntentionResult);
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

intentionModeRadios.forEach(radio => {
    radio.addEventListener('change', (event) => {
        intentionMode = event.target.value;
        gtag('event', 'mode_change', {
            'event_category': 'Game',
            'event_label': 'Intention Mode',
            'value': intentionMode,
            'session_id': sessionId,
            'custom_user_id': telegramUser ? telegramUser.id : 'unknown'
        });
        stopIntentionGame();
        startIntentionGame();
    });
});

intentionAttemptsModeRadios.forEach(radio => {
    radio.addEventListener('change', (event) => {
        intentionAttemptsMode = event.target.value;
        updateIntentionStatsDisplay();
        if (intentionAttemptsMode === 'unlimited' && intentionShowBtn.disabled) {
            intentionShowBtn.disabled = false;
            intentionNewGameBtn.classList.add('hidden');
        }
    });
});

intentionNewGameBtn.addEventListener('click', resetIntentionGame);

visionShuffleBtn.addEventListener('click', startVisionShuffle);
visionDisplay.addEventListener('click', () => {
    if (!visionShuffleBtn.disabled && currentGameMode === 'vision') {
        gtag('event', 'display_click', {
            'event_category': 'Game',
            'event_label': 'Vision Display',
            'session_id': sessionId,
            'custom_user_id': telegramUser ? telegramUser.id : 'unknown'
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
            'session_id': sessionId,
            'custom_user_id': telegramUser ? telegramUser.id : 'unknown'
        });
        updateVisionChoicesDisplay();
        setVisionChoiceButtonsEnabled(false);
        visionShuffleBtn.disabled = false;
        visionResultDisplay.classList.add('hidden');
        visionDisplay.style.backgroundColor = 'black';
        visionResultDisplay.style.backgroundColor = 'transparent';
        visionCurrentResult = null;
        choiceButtonsEnabledTime = null;
    });
});

visionAttemptsModeRadios.forEach(radio => {
    radio.addEventListener('change', (event) => {
        visionAttemptsMode = event.target.value;
        updateVisionStatsDisplay();
        if (visionAttemptsMode === 'unlimited' && visionShuffleBtn.disabled) {
            visionShuffleBtn.disabled = false;
            setVisionChoiceButtonsEnabled(false);
            visionNewGameBtn.classList.add('hidden');
        }
    });
});

visionNewGameBtn.addEventListener('click', resetVisionGame);

window.addEventListener('error', (error) => {
    gtag('event', 'error', {
        'event_category': 'App',
        'event_label': 'Runtime Error',
        'error_message': error.message,
        'error_file': error.filename,
        'session_id': sessionId,
        'custom_user_id': telegramUser ? telegramUser.id : 'unknown'
    });
});

window.addEventListener('beforeunload', () => {
    gtag('event', 'session_end', {
        'event_category': 'App',
        'event_label': 'App Closed',
        'session_id': sessionId,
        'session_duration_seconds': parseFloat(((Date.now() - sessionStartTime) / 1000).toFixed(1)),
        'custom_user_id': telegramUser ? telegramUser.id : 'unknown'
    });
    sendSessionSummary();
});

try {
    Telegram.WebApp.ready();
    if (Telegram.WebApp.initDataUnsafe && Telegram.WebApp.initDataUnsafe.user) {
        telegramUser = Telegram.WebApp.initDataUnsafe.user;
        userNameSpan.textContent = telegramUser.first_name || 'Игрок';
        console.log('Telegram User:', { id: telegramUser.id, first_name: telegramUser.first_name });
        gtag('set', 'user_properties', { 'custom_user_id': telegramUser.id });
        gtag('event', 'app_launch', {
            'event_category': 'App',
            'event_label': 'Mini App Started',
            'start_param': Telegram.WebApp.initDataUnsafe.start_param || 'none',
            'session_id': sessionId,
            'custom_user_id': telegramUser.id
        });
    } else {
        telegramUser = { id: 'anonymous_' + Math.random().toString(36).substr(2, 9), first_name: 'Игрок' };
        userNameSpan.textContent = telegramUser.first_name;
        console.log('Anonymous User:', { id: telegramUser.id });
        gtag('set', 'user_properties', { 'custom_user_id': telegramUser.id });
        gtag('event', 'app_launch', {
            'event_category': 'App',
            'event_label': 'Mini App Started (No User)',
            'start_param': Telegram.WebApp.initDataUnsafe.start_param || 'none',
            'session_id': sessionId,
            'custom_user_id': telegramUser.id
        });
    }
} catch (e) {
    console.warn('Telegram WebApp not available, using anonymous user');
    telegramUser = { id: 'anonymous_' + Math.random().toString(36).substr(2, 9), first_name: 'Игрок' };
    userNameSpan.textContent = telegramUser.first_name;
}

setInterval(() => {
    if (!sessionSummarySent) {
        sendSessionSummary();
    }
}, 30000);

Telegram.WebApp.expand();
showScreen('menu-screen');

Telegram.WebApp.onEvent('viewportChanged', (isStateStable) => {
    if (!isStateStable && !Telegram.WebApp.isExpanded()) {
        gtag('event', 'app_background', {
            'event_category': 'App',
            'event_label': 'App Minimized',
            'session_id': sessionId,
            'session_duration_seconds': parseFloat(((Date.now() - gameStartTime) / 1000).toFixed(1)),
            'custom_user_id': telegramUser ? telegramUser.id : 'unknown'
        });
        sendSessionSummary();
    }
});
