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
const INTENTION_FIXATION_DELAY_MAX = 500;

// Инициализация переменных
let telegramUser = null;
let currentGameMode = 'menu';
let gameStartTime = null;
let shuffleStartTime = null;
let intentionAttemptStartTime = null;
let choiceButtonsEnabledTime = null;
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
let intentionGuessSequence = [];
let intentionRandomizerCount = 0;

let visionRandomizerTimeout = null;
let visionCurrentResult = null;
let visionMode = 'color';
let visionAttemptMode = 'limited';
let visionMaxAttempts = 10;
const visionStats = {
    attempts: 0,
    successes: 0,
    failures: 0
};
let visionGuessSequence = [];

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

// Проверка наличия критических DOM-элементов
if (!appDiv || !menuScreen || !gameIntention || !gameVision) {
    console.error('Critical DOM elements are missing. Check HTML for ids: app, menu-screen, game-intention, game-vision');
    throw new Error('Missing critical DOM elements');
}

const cachedElements = {
    colorBlock: document.createElement('div'),
    svgCircle: null,
    svgTriangle: null
};
cachedElements.colorBlock.style.width = '100%';
cachedElements.colorBlock.style.height = '100%';

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

function sendSavedStats() {
    ['visionStats', 'intentionStats'].forEach(key => {
        const savedStats = JSON.parse(localStorage.getItem(key) || '[]');
        if (savedStats.length === 0) return;
        savedStats.forEach(stat => {
            const eventName = key === 'visionStats' ? 'game_session_summary' : 'intention_session_summary';
            const eventLabel = key === 'visionStats' ? 'Vision' : 'Intention';
            console.log(`Sending saved ${eventName}:`, stat);
            gtag('event', eventName, {
                'event_category': 'Game',
                'event_label': eventLabel,
                'attempts': stat.stats.attempts,
                'successes': stat.stats.successes,
                'failures': stat.stats.failures,
                'mode': stat.mode,
                'session_duration_seconds': parseFloat(stat.duration),
                'session_id': stat.sessionId,
                'custom_user_id': telegramUser ? telegramUser.id : 'anonymous',
                'session_start_time': Math.floor(stat.timestamp - stat.duration * 1000)
            });
        });
        localStorage.removeItem(key); // Очищаем после отправки
    });
}

function showScreen(screenId) {
    console.log('Showing screen:', screenId);
    const screens = document.querySelectorAll('.game-screen');
    screens.forEach(screen => screen.classList.add('hidden'));

    stopIntentionGame();
    stopVisionGame();

    if (screenId === 'menu-screen') {
        sendSessionSummary();
        if (menuScreen) menuScreen.classList.remove('hidden');
        currentGameMode = 'menu';
        Telegram.WebApp.MainButton.hide();
        if (readMoreArea) readMoreArea.classList.add('hidden');
        if (btnReadMore) btnReadMore.classList.remove('hidden');
        if (ENABLE_LOGGING && gameStartTime) {
            const totalTime = ((Date.now() - gameStartTime) / 1000).toFixed(1);
            console.log(`Returning to menu, total game time: ${totalTime}s`);
            console.log(`Intention guess sequence: [${intentionGuessSequence.join(', ')}]`);
            console.log(`Vision guess sequence: [${visionGuessSequence.join(', ')}]`);
        }
    } else if (screenId === 'game-intention') {
        if (gameIntention) gameIntention.classList.remove('hidden');
        currentGameMode = 'intention';
        startIntentionGame();
        updateIntentionStatsDisplay();
        if (intentionNewGameBtn) intentionNewGameBtn.classList.add('hidden');
        if (intentionAttemptsModeDiv) intentionAttemptsModeDiv.classList.remove('hidden');
        Telegram.WebApp.MainButton.hide();
    } else if (screenId === 'game-vision') {
        if (gameVision) gameVision.classList.remove('hidden');
        currentGameMode = 'vision';
        updateVisionChoicesDisplay();
        updateVisionStatsDisplay();
        if (visionShuffleBtn) visionShuffleBtn.disabled = false;
        if (visionNewGameBtn) visionNewGameBtn.classList.add('hidden');
        if (visionAttemptsModeDiv) visionAttemptsModeDiv.classList.remove('hidden');
        setVisionChoiceButtonsEnabled(false);
        if (visionResultDisplay) visionResultDisplay.classList.add('hidden');
        if (visionDisplay) visionDisplay.style.backgroundColor = 'black';
        if (visionResultDisplay) visionResultDisplay.style.backgroundColor = 'transparent';
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

cachedElements.svgCircle = createSvgShape('circle');
cachedElements.svgTriangle = createSvgShape('triangle');

function resetIntentionGame() {
    console.log('Resetting Intention game');
    // Сохраняем статистику в localStorage и отправляем
    if (intentionStats.attempts > 0) {
        const savedStats = JSON.parse(localStorage.getItem('intentionStats') || '[]');
        savedStats.push({
            sessionId,
            stats: { ...intentionStats },
            guessSequence: [...intentionGuessSequence],
            mode: intentionMode,
            duration: gameStartTime ? ((Date.now() - gameStartTime) / 1000).toFixed(1) : 0,
            timestamp: Date.now()
        });
        localStorage.setItem('intentionStats', JSON.stringify(savedStats));
        if (!sessionSummarySent) {
            sendSessionSummary();
        }
    }
    intentionStats.attempts = 0;
    intentionStats.successes = 0;
    intentionStats.failures = 0;
    intentionGuessSequence = [];
    intentionAttemptStartTime = null;
    intentionRandomizerCount = 0;
    stopIntentionGame();
    startIntentionGame();
    updateIntentionStatsDisplay();
    if (intentionShowBtn) intentionShowBtn.disabled = false;
    if (intentionNewGameBtn) intentionNewGameBtn.classList.add('hidden');
    if (intentionAttemptsModeDiv) intentionAttemptsModeDiv.classList.remove('hidden');
    sessionSummarySent = false; // Сбрасываем флаг для следующей сессии
    if (ENABLE_LOGGING) {
        console.log('Intention game reset, guess sequence and attempt start time cleared');
    }
}

function resetVisionGame() {
    console.log('Resetting Vision game');
    // Сохраняем статистику в localStorage и отправляем
    if (visionStats.attempts > 0) {
        const savedStats = JSON.parse(localStorage.getItem('visionStats') || '[]');
        savedStats.push({
            sessionId,
            stats: { ...visionStats },
            guessSequence: [...visionGuessSequence],
            mode: visionMode,
            duration: gameStartTime ? ((Date.now() - gameStartTime) / 1000).toFixed(1) : 0,
            timestamp: Date.now()
        });
        localStorage.setItem('visionStats', JSON.stringify(savedStats));
        if (!sessionSummarySent) {
            sendSessionSummary();
        }
    }
    visionStats.attempts = 0;
    visionStats.successes = 0;
    visionStats.failures = 0;
    visionGuessSequence = [];
    stopVisionGame();
    updateVisionStatsDisplay();
    if (visionShuffleBtn) visionShuffleBtn.disabled = false;
    if (visionNewGameBtn) visionNewGameBtn.classList.add('hidden');
    if (visionAttemptsModeDiv) visionAttemptsModeDiv.classList.remove('hidden');
    setVisionChoiceButtonsEnabled(false);
    if (visionResultDisplay) visionResultDisplay.classList.add('hidden');
    if (visionDisplay) visionDisplay.style.backgroundColor = 'black';
    if (visionResultDisplay) visionResultDisplay.style.backgroundColor = 'transparent';
    visionCurrentResult = null;
    choiceButtonsEnabledTime = null;
    sessionSummarySent = false; // Сбрасываем флаг для следующей сессии
    if (ENABLE_LOGGING) {
        console.log('Vision game reset, guess sequence cleared');
    }
}

function startIntentionGame() {
    console.log('Starting Intention game');
    intentionCurrentResult = getRandomResult(intentionMode);
    intentionAttemptStartTime = Date.now();
    intentionRandomizerCount = 0;
    if (ENABLE_LOGGING) {
        console.log('Starting intention game, mode:', intentionMode, 'result:', intentionCurrentResult, 'attempt_start_time:', intentionAttemptStartTime);
    }

    function updateRandomResult() {
        intentionCurrentResult = getRandomResult(intentionMode);
        const randomInterval = INTENTION_RANDOMIZER_MIN_INTERVAL + Math.random() * (INTENTION_RANDOMIZER_MAX_INTERVAL - INTENTION_RANDOMIZER_MIN_INTERVAL);
        intentionRandomizerCount++;
        if (ENABLE_LOGGING && intentionRandomizerCount % 10 === 0) {
            console.log(`Randomizer updated (count: ${intentionRandomizerCount}), result: ${intentionCurrentResult}, next update in ${randomInterval.toFixed(2)}ms`);
        }
        intentionRandomizerInterval = setTimeout(updateRandomResult, randomInterval);
    }

    updateRandomResult();

    if (intentionShowBtn) intentionShowBtn.classList.remove('hidden');
    if (intentionResultDisplay) intentionResultDisplay.classList.add('hidden');
    if (intentionDisplay) intentionDisplay.style.backgroundColor = 'black';
    if (intentionResultDisplay) {
        intentionResultDisplay.style.backgroundColor = 'white';
        intentionResultDisplay.style.display = 'flex';
        intentionResultDisplay.style.zIndex = '10';
    }
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
    if (intentionShowBtn) intentionShowBtn.classList.remove('hidden');
    if (intentionResultDisplay) intentionResultDisplay.classList.add('hidden');
    if (intentionDisplay) intentionDisplay.style.backgroundColor = 'black';
    if (intentionResultDisplay) intentionResultDisplay.style.backgroundColor = 'white';
    intentionAttemptStartTime = null;
}

function showIntentionResult() {
    if (intentionRandomizerInterval === null || isProcessingIntention) {
        console.warn('Randomizer interval is null or processing, cannot show result');
        return;
    }
    isProcessingIntention = true;
    const randomDelay = INTENTION_FIXATION_DELAY_MIN + Math.random() * (INTENTION_FIXATION_DELAY_MAX - INTENTION_RANDOMIZER_MIN_INTERVAL);
    if (ENABLE_LOGGING) {
        console.log(`Fixation delay: ${randomDelay.toFixed(2)}ms`);
    }

    if (intentionShowBtn) intentionShowBtn.classList.add('processing');
    if (intentionDisplay) intentionDisplay.classList.add('processing');

    const feedbackButtons = document.createElement('div');
    feedbackButtons.className = 'feedback-buttons';
    const successBtn = document.createElement('button');
    successBtn.textContent = 'Угадал';
    successBtn.className = 'small-btn';
    const failureBtn = document.createElement('button');
    failureBtn.textContent = 'Не угадал';
    failureBtn.className = 'small-btn';
    feedbackButtons.appendChild(successBtn);
    feedbackButtons.appendChild(failureBtn);

    setTimeout(() => {
        if (ENABLE_LOGGING) {
            console.log('Showing intention result, mode:', intentionMode, 'result:', intentionCurrentResult);
            console.log(`Intention result displayed at: ${Date.now()}`);
        }
        intentionStats.attempts++;
        if (intentionStats.attempts === 1 && intentionAttemptsModeDiv) {
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
        if (intentionResultDisplay) {
            intentionResultDisplay.innerHTML = '';
            intentionResultDisplay.style.backgroundColor = 'white';
            intentionResultDisplay.style.display = 'flex';
        }

        const stylesToUpdate = {
            intentionResultDisplay: {
                flexDirection: intentionMode === 'color' ? 'row' : 'column',
                gap: '0',
                classList: { remove: ['hidden'] }
            },
            intentionDisplay: {
                backgroundColor: 'transparent',
                classList: { remove: ['processing'] }
            },
            intentionShowBtn: {
                classList: { add: ['hidden'], remove: ['processing'] }
            }
        };

        Object.keys(stylesToUpdate).forEach(element => {
            const el = eval(element);
            if (el) {
                Object.assign(el.style, stylesToUpdate[element]);
                if (stylesToUpdate[element].classList) {
                    Object.keys(stylesToUpdate[element].classList).forEach(action => {
                        stylesToUpdate[element].classList[action].forEach(cls => el.classList[action](cls));
                    });
                }
            }
        });

        if (intentionMode === 'color' && intentionResultDisplay) {
            cachedElements.colorBlock.style.backgroundColor = intentionCurrentResult || 'gray';
            intentionResultDisplay.appendChild(cachedElements.colorBlock);
        } else if (intentionResultDisplay) {
            const svg = intentionCurrentResult === 'circle' ? cachedElements.svgCircle : cachedElements.svgTriangle;
            intentionResultDisplay.appendChild(svg.cloneNode(true));
        }

        if (intentionDisplay) intentionDisplay.insertAdjacentElement('afterend', feedbackButtons);

        successBtn.addEventListener('click', () => {
            if (!isProcessingIntention) return;
            isProcessingIntention = false;
            const guessTimeMs = Date.now();
            const timeDiffMs = intentionAttemptStartTime ? (guessTimeMs - intentionAttemptStartTime) : 0;
            const timeToGuess = timeDiffMs ? Math.max(0.1, Number((timeDiffMs / 1000).toFixed(1))) : 0.1;
            intentionAttemptStartTime = guessTimeMs;
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
                'custom_user_id': telegramUser ? telegramUser.id : 'unknown',
                'attempt_id': intentionStats.attempts
            });
            if (ENABLE_LOGGING) {
                const totalTime = ((Date.now() - gameStartTime) / 1000).toFixed(1);
                console.log(`Intention guess: Success, result: ${intentionCurrentResult}, time_to_guess: ${timeToGuess}s, time_diff_ms: ${timeDiffMs}, sequence: [${intentionGuessSequence.join(', ')}], total game time: ${totalTime}s`);
            }
            cleanupAndRestart();
        });

        failureBtn.addEventListener('click', () => {
            if (!isProcessingIntention) return;
            isProcessingIntention = false;
            const guessTimeMs = Date.now();
            const timeDiffMs = intentionAttemptStartTime ? (guessTimeMs - intentionAttemptStartTime) : 0;
            const timeToGuess = timeDiffMs ? Math.max(0.1, Number((timeDiffMs / 1000).toFixed(1))) : 0.1;
            intentionAttemptStartTime = guessTimeMs;
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
                'custom_user_id': telegramUser ? telegramUser.id : 'unknown',
                'attempt_id': intentionStats.attempts
            });
            if (ENABLE_LOGGING) {
                const totalTime = ((Date.now() - gameStartTime) / 1000).toFixed(1);
                console.log(`Intention guess: Failure, result: ${intentionCurrentResult}, time_to_guess: ${timeToGuess}s, time_diff_ms: ${timeDiffMs}, sequence: [${intentionGuessSequence.join(', ')}], total game time: ${totalTime}s`);
            }
            cleanupAndRestart();
        });

        const timeout = setTimeout(() => {
            if (ENABLE_LOGGING) {
                const timeDiffMs = intentionAttemptStartTime ? (Date.now() - intentionAttemptStartTime) : 0;
                const timeToGuess = timeDiffMs ? Math.max(0.1, Number((timeDiffMs / 1000).toFixed(1))) : 0.1;
                console.log(`Intention attempt timed out, time_to_guess: ${timeToGuess}s, time_diff_ms: ${timeDiffMs}`);
            }
            gtag('event', 'intention_timeout', {
                'event_category': 'Game',
                'event_label': 'Intention Timeout',
                'mode': intentionMode,
                'result': intentionCurrentResult,
                'session_id': sessionId,
                'custom_user_id': telegramUser ? telegramUser.id : 'unknown',
                'time_to_guess': timeToGuess
            });
            cleanupAndRestart();
        }, 60000);

        function cleanupAndRestart() {
            clearTimeout(timeout);
            feedbackButtons.remove();
            if (intentionResultDisplay) intentionResultDisplay.classList.add('hidden');
            if (intentionDisplay) intentionDisplay.style.backgroundColor = 'black';
            if (intentionResultDisplay) intentionResultDisplay.style.backgroundColor = 'white';
            if (intentionShowBtn) intentionShowBtn.classList.remove('hidden');
            isProcessingIntention = false;
            if (intentionAttemptsMode === 'limited' && intentionStats.attempts >= intentionMaxAttempts) {
                if (intentionShowBtn) intentionShowBtn.disabled = true;
                if (intentionNewGameBtn) intentionNewGameBtn.classList.remove('hidden');
            } else {
                start intentionGame();
            }
        }
    }, randomDelay);
}

function updateIntentionStatsDisplay() {
    if (intentionStatsSpanAttempts) intentionStatsSpanAttempts.textContent = intentionStats.attempts;
    if (intentionStatsSpanMaxAttempts) intentionStatsSpanMaxAttempts.textContent = intentionAttemptsMode === 'limited' ? intentionMaxAttempts : '∞';
    if (intentionStatsSpanSuccesses) intentionStatsSpanSuccesses.textContent = intentionStats.successes;
    if (intentionStatsSpanFailures) intentionStatsSpanFailures.textContent = intentionStats.failures;
    const successRate = intentionStats.attempts > 0 ? Math.round((intentionStats.successes / intentionStats.attempts) * 100) : 0;
    if (intentionStatsSpanSuccessRate) intentionStatsSpanSuccessRate.textContent = `${successRate}%`;
}

function startVisionShuffle() {
    console.log('Starting Vision shuffle');
    if (!visionShuffleBtn || visionShuffleBtn.disabled) return;
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
    if (visionResultDisplay) visionResultDisplay.classList.add('hidden');
    if (visionDisplay) visionDisplay.style.backgroundColor = 'black';
    if (visionResultDisplay) visionResultDisplay.style.backgroundColor = 'transparent';

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
        if (visionChoicesDiv) {
            visionChoicesDiv.classList.add('active');
            setTimeout(() => visionChoicesDiv.classList.remove('active'), 1000);
        }
        if (ENABLE_LOGGING) {
            console.log(`Choice buttons enabled at: ${choiceButtonsEnabledTime}, mode: ${visionMode}`);
        }
    }, SHUFFLE_BUTTON_DISABLE_TIME);
}

function stopVisionGame() {
    if (visionRandomizerTimeout !== null) {
        clearTimeout(visionRandomizerTimeout);
        visionRandomizerTimeout = null;
    }
    if (visionShuffleBtn) visionShuffleBtn.disabled = false;
    setVisionChoiceButtonsEnabled(false);
    if (visionResultDisplay) visionResultDisplay.classList.add('hidden');
    if (visionDisplay) visionDisplay.style.backgroundColor = 'black';
    if (visionResultDisplay) visionResultDisplay.style.backgroundColor = 'transparent';
    visionCurrentResult = null;
    choiceButtonsEnabledTime = null;
}

function setVisionChoiceButtonsEnabled(enabled) {
    if (!visionChoicesDiv) return;
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
    if (visionShuffleBtn) visionShuffleBtn.disabled = true;
    visionStats.attempts++;
    if (visionStats.attempts === 1 && visionAttemptsModeDiv) {
        visionAttemptsModeDiv.classList.add('hidden');
    }
    const isCorrect = (choice === visionCurrentResult);
    const guessResult = isCorrect ? 1 : 0;

    if (visionResultDisplay) visionResultDisplay.classList.remove('hidden');
    const resultDisplayTime = Date.now();
    const timeDiffMs = choiceButtonsEnabledTime ? (resultDisplayTime - choiceButtonsEnabledTime) : 0;
    const timeToGuess = timeDiffMs ? Math.max(0.1, Number((timeDiffMs / 1000).toFixed(1))) : 0.1;
    choiceButtonsEnabledTime = null;
    visionGuessSequence.push(guessResult);
    if (ENABLE_LOGGING) {
        const totalTime = gameStartTime ? ((Date.now() - gameStartTime) / 1000).toFixed(1) : 'N/A';
        console.log(`Vision guess: ${isCorrect ? 'Success' : 'Failure'}, choice: ${choice}, correct: ${visionCurrentResult}, time_to_guess: ${timeToGuess}s, time_diff_ms: ${timeDiffMs}, sequence: [${visionGuessSequence.join(', ')}], total game time: ${totalTime}s`);
    }

    gtag('event', 'guess', {
        'event_category': 'Game',
        'event_label': 'Vision Guess',
        'value': isCorrect ? 'success' : 'failure',
        'guess_result': guessResult,
        'mode': visionMode,
        'choice': choice,
        'correct_answer': visionCurrentResult,
        'time_to_guess': timeToGuess,
        'session_id': sessionId,
        'custom_user_id': telegramUser ? telegramUser.id : 'unknown',
        'attempt_id': visionStats.attempts
    });

    if (isCorrect) {
        visionStats.successes++;
    } else {
        visionStats.failures++;
    }

    if (visionDisplay) visionDisplay.style.backgroundColor = 'transparent';
    if (visionResultDisplay) {
        visionResultDisplay.innerHTML = '';
        visionResultDisplay.style.backgroundColor = 'transparent';
    }

    if (visionMode === 'color' && visionResultDisplay) {
        visionResultDisplay.style.backgroundColor = visionCurrentResult;
        let messageText = document.createElement('p');
        messageText.textContent = isCorrect ? `Успех!` : `Попробуй ещё!`;
        messageText.style.color = 'white';
        messageText.style.textShadow = '1px 1px 3px rgba(0,0,0,0.5)';
        visionResultDisplay.appendChild(messageText);
        visionResultDisplay.style.flexDirection = 'column';
        visionResultDisplay.style.gap = '0';
    } else if (visionResultDisplay) {
        const feedbackContent = document.createElement('div');
        feedbackContent.classList.add('vision-feedback-content');
        feedbackContent.style.backgroundColor = 'white';
        const svg = visionCurrentResult === 'circle' ? cachedElements.svgCircle : cachedElements.svgTriangle;
        feedbackContent.appendChild(svg.cloneNode(true));
        const messageText = document.createElement('p');
        messageText.textContent = isCorrect ? `Успех!` : `Попробуй ещё!`;
        messageText.style.color = 'black';
        feedbackContent.appendChild(messageText);
        visionResultDisplay.appendChild(feedbackContent);
        visionResultDisplay.style.flexDirection = 'row';
        visionResultDisplay.style.gap = '0';
    }

    updateVisionStatsDisplay();
    visionCurrentResult = null;
    setTimeout(() => {
        if (visionResultDisplay) visionResultDisplay.classList.add('hidden');
        if (visionResultDisplay) visionResultDisplay.style.backgroundColor = 'transparent';
        if (visionDisplay) visionDisplay.style.backgroundColor = 'black';
        if (visionAttemptMode === 'limited' && visionStats.attempts >= visionMaxAttempts) {
            if (visionShuffleBtn) visionShuffleBtn.disabled = true;
            setVisionChoiceButtonsEnabled(false);
            if (visionNewGameBtn) visionNewGameBtn.classList.remove('hidden');
        } else {
            if (visionShuffleBtn) visionShuffleBtn.disabled = false;
        }
    }, 2500);
}

function updateVisionStatsDisplay() {
    if (visionStatsSpanAttempts) visionStatsSpanAttempts.textContent = visionStats.attempts;
    if (visionStatsSpanMaxAttempts) visionStatsSpanMaxAttempts.textContent = visionAttemptMode === 'limited' ? visionMaxAttempts : '∞';
    if (visionStatsSpanSuccesses) visionStatsSpanSuccesses.textContent = visionStats.successes;
    if (visionStatsSpanFailures) visionStatsSpanFailures.textContent = visionStats.failures;
    const successRate = visionStats.attempts > 0 ? Math.round((visionStats.successes / visionStats.attempts) * 100) : 0;
    if (visionStatsSpanSuccessRate) visionStatsSpanSuccessRate.textContent = `${successRate}%`;
}

function updateVisionChoicesDisplay() {
    if (visionColorChoiceBtns) visionColorChoiceBtns.forEach(btn => btn.classList.add('hidden'));
    if (visionShapeChoiceBtns) visionShapeChoiceBtns.forEach(btn => btn.classList.add('hidden'));
    setVisionChoiceButtonsEnabled(false);

    if (visionMode === 'color') {
        if (visionColorChoiceBtns) visionColorChoiceBtns.forEach(btn => btn.classList.remove('hidden'));
    } else {
        if (visionShapeChoiceBtns) visionShapeChoiceBtns.forEach(btn => btn.classList.remove('hidden'));
    }
}

if (btnStartIntention) {
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
}

if (btnStartVision) {
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
}

if (btnReadMore) {
    btnReadMore.addEventListener('click', () => {
        if (readMoreArea) readMoreArea.classList.remove('hidden');
        btnReadMore.classList.add('hidden');
        gtag('event', 'read_more', {
            'event_category': 'App',
            'event_label': 'Read More Clicked',
            'session_id': sessionId,
            'custom_user_id': telegramUser ? telegramUser.id : 'unknown'
        });
    });
}

if (btnCloseReadMore) {
    btnCloseReadMore.addEventListener('click', () => {
        if (readMoreArea) readMoreArea.classList.add('hidden');
        if (btnReadMore) btnReadMore.classList.remove('hidden');
    });
}

if (backButtons) {
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
}

if (intentionShowBtn) {
    intentionShowBtn.addEventListener('click', showIntentionResult);
}

if (intentionDisplay) {
    intentionDisplay.addEventListener('click', () => {
        if (intentionShowBtn && !intentionShowBtn.classList.contains('hidden') && !intentionShowBtn.disabled && currentGameMode === 'intention' && !isProcessingIntention) {
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
}

if (intentionModeRadios) {
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
}

if (intentionAttemptsModeRadios) {
    intentionAttemptsModeRadios.forEach(radio => {
        radio.addEventListener('change', (event) => {
            intentionAttemptsMode = event.target.value;
            updateIntentionStatsDisplay();
            if (intentionAttemptsMode === 'unlimited' && intentionShowBtn && intentionShowBtn.disabled) {
                intentionShowBtn.disabled = false;
                if (intentionNewGameBtn) intentionNewGameBtn.classList.add('hidden');
            }
        });
    });
}

if (intentionNewGameBtn) {
    intentionNewGameBtn.addEventListener('click', resetIntentionGame);
}

if (visionShuffleBtn) {
    visionShuffleBtn.addEventListener('click', startVisionShuffle);
}

if (visionDisplay) {
    visionDisplay.addEventListener('click', () => {
        if (visionShuffleBtn && !visionShuffleBtn.disabled && currentGameMode === 'vision') {
            gtag('event', 'display_click', {
                'event_category': 'Game',
                'event_label': 'Vision Display',
                'session_id': sessionId,
                'custom_user_id': telegramUser ? telegramUser.id : 'unknown'
            });
            visionShuffleBtn.click();
        }
    });
}

if (visionChoicesDiv) {
    visionChoicesDiv.addEventListener('click', handleVisionChoice);
}

if (visionModeRadios) {
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
            if (visionShuffleBtn) visionShuffleBtn.disabled = false;
            if (visionResultDisplay) visionResultDisplay.classList.add('hidden');
            if (visionDisplay) visionDisplay.style.backgroundColor = 'black';
            if (visionResultDisplay) visionResultDisplay.style.backgroundColor = 'transparent';
            visionCurrentResult = null;
            choiceButtonsEnabledTime = null;
        });
    });
}

if (visionAttemptsModeRadios) {
    visionAttemptsModeRadios.forEach(radio => {
        radio.addEventListener('change', (event) => {
            visionAttemptMode = event.target.value;
            updateVisionStatsDisplay();
            if (visionAttemptMode === 'unlimited' && visionShuffleBtn && visionShuffleBtn.disabled) {
                visionShuffleBtn.disabled = false;
                setVisionChoiceButtonsEnabled(false);
                if (visionNewGameBtn) visionNewGameBtn.classList.add('hidden');
            }
        });
    });
}

if (visionNewGameBtn) {
    visionNewGameBtn.addEventListener('click', resetVisionGame);
}

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

// Обработка сворачивания приложения
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && gameStartTime && !sessionSummarySent) {
        console.log('App hidden, sending session summary');
        sendSessionSummary();
        gtag('event', 'app_background', {
            'event_category': 'App',
            'event_label': 'App Minimized',
            'session_id': sessionId,
            'session_duration_seconds': parseFloat(((Date.now() - gameStartTime) / 1000).toFixed(1)),
            'custom_user_id': telegramUser ? telegramUser.id : 'unknown'
        });
    }
});

try {
    Telegram.WebApp.ready();
    if (Telegram.WebApp.initDataUnsafe && Telegram.WebApp.initDataUnsafe.user) {
        telegramUser = Telegram.WebApp.initDataUnsafe.user;
        if (userNameSpan) userNameSpan.textContent = telegramUser.first_name || 'Игрок';
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
        if (userNameSpan) userNameSpan.textContent = telegramUser.first_name;
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
    if (userNameSpan) userNameSpan.textContent = telegramUser.first_name;
}

// Отправляем сохранённые статистики при запуске
sendSavedStats();

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
    }
});
