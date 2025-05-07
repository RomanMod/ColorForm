const ENABLE_LOGGING = true;

const INTENTION_RANDOMIZER_MIN_INTERVAL = 50;
const INTENTION_RANDOMIZER_MAX_INTERVAL = 200;
const INTENTION_FIXATION_DELAY_MIN = 0;
const INTENTION_FIXATION_DELAY_MAX = 500;
const SHUFFLE_BUTTON_DISABLE_TIME = 3000;
const RANDOM_RESULT_MIN_TIME = 1000;
const RANDOM_RESULT_MAX_TIME = 4000;

let currentGameMode = 'menu';
let gameStartTime = null;
let sessionStartTime = Date.now();
let sessionSummarySent = false;
const sessionId = Math.floor(Math.random() * 1000000000).toString();
let telegramUser = null;

let intentionMode = 'color';
let intentionAttemptsMode = 'limited';
const intentionMaxAttempts = 10;
let intentionCurrentResult = null;
let intentionRandomizerInterval = null;
const intentionStats = { attempts: 0, successes: 0, failures: 0 };

let visionMode = 'color';
let visionAttemptsMode = 'limited';
const visionMaxAttempts = 10;
let visionCurrentResult = null;
let visionRandomizerTimeout = null;
let shuffleStartTime = null;
const visionStats = { attempts: 0, successes: 0, failures: 0 };

let intentionStartTime = null;
let lastIntentionGuessTime = null;
let visionChoiceButtonsEnabledTime = null;

const intentionColors = ['red', 'green', 'blue', 'yellow'];
const intentionShapes = ['circle', 'square', 'triangle', 'pentagon'];
const visionColors = ['red', 'green', 'blue', 'yellow'];
const visionShapes = ['circle', 'square', 'triangle', 'pentagon'];

const btnStartIntention = document.getElementById('start-intention');
const btnStartVision = document.getElementById('start-vision');
const backButtons = document.querySelectorAll('.back-btn');
const intentionShowBtn = document.getElementById('intention-show-btn');
const intentionDisplay = document.getElementById('intention-display');
const intentionResultDisplay = document.getElementById('intention-result-display');
const intentionNewGameBtn = document.getElementById('intention-new-game');
const intentionAttemptsModeDiv = document.getElementById('intention-attempts-mode');
const intentionModeSelector = document.getElementById('intention-mode');
const visionShuffleBtn = document.getElementById('vision-shuffle-btn');
const visionDisplay = document.getElementById('vision-display');
const visionResultDisplay = document.getElementById('vision-result-display');
const visionChoiceButtons = document.getElementById('vision-choice-buttons');
const visionNewGameBtn = document.getElementById('vision-new-game');
const visionAttemptsModeDiv = document.getElementById('vision-attempts-mode');
const visionModeSelector = document.getElementById('vision-mode');

function getRandomResult(mode) {
    const options = mode === 'color' ? (currentGameMode === 'intention' ? intentionColors : visionColors) : (currentGameMode === 'intention' ? intentionShapes : visionShapes);
    return options[Math.floor(Math.random() * options.length)];
}

function createSvgShape(shape) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100');
    svg.setAttribute('height', '100');
    const shapeElement = document.createElementNS('http://www.w3.org/2000/svg', shape === 'circle' ? 'circle' : shape === 'square' ? 'rect' : 'polygon');
    if (shape === 'circle') {
        shapeElement.setAttribute('cx', '50');
        shapeElement.setAttribute('cy', '50');
        shapeElement.setAttribute('r', '40');
    } else if (shape === 'square') {
        shapeElement.setAttribute('x', '10');
        shapeElement.setAttribute('y', '10');
        shapeElement.setAttribute('width', '80');
        shapeElement.setAttribute('height', '80');
    } else if (shape === 'triangle') {
        shapeElement.setAttribute('points', '50,10 90,90 10,90');
    } else if (shape === 'pentagon') {
        shapeElement.setAttribute('points', '50,10 90,35 75,85 25,85 10,35');
    }
    shapeElement.setAttribute('fill', 'black');
    svg.appendChild(shapeElement);
    return svg;
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => screen.classList.add('hidden'));
    document.getElementById(screenId).classList.remove('hidden');
    currentGameMode = screenId === 'menu-screen' ? 'menu' : screenId === 'game-intention' ? 'intention' : 'vision';
    if (currentGameMode !== 'intention') {
        clearTimeout(intentionRandomizerInterval);
        intentionRandomizerInterval = null;
    }
    if (currentGameMode !== 'vision') {
        clearTimeout(visionRandomizerTimeout);
        visionRandomizerTimeout = null;
    }
}

function resetIntentionGame() {
    intentionStats.attempts = 0;
    intentionStats.successes = 0;
    intentionStats.failures = 0;
    updateIntentionStatsDisplay();
    intentionShowBtn.disabled = false;
    intentionNewGameBtn.classList.add('hidden');
    intentionAttemptsModeDiv.classList.remove('hidden');
    intentionResultDisplay.classList.add('hidden');
    intentionDisplay.style.backgroundColor = 'black';
    startIntentionGame();
}

function resetVisionGame() {
    visionStats.attempts = 0;
    visionStats.successes = 0;
    visionStats.failures = 0;
    updateVisionStatsDisplay();
    visionShuffleBtn.disabled = false;
    setVisionChoiceButtonsEnabled(false);
    visionNewGameBtn.classList.add('hidden');
    visionAttemptsModeDiv.classList.remove('hidden');
    visionResultDisplay.classList.add('hidden');
    visionDisplay.style.backgroundColor = 'black';
    populateVisionChoiceButtons();
}

function updateIntentionStatsDisplay() {
    document.getElementById('intention-attempts').textContent = intentionStats.attempts;
    document.getElementById('intention-successes').textContent = intentionStats.successes;
    document.getElementById('intention-failures').textContent = intentionStats.failures;
}

function updateVisionStatsDisplay() {
    document.getElementById('vision-attempts').textContent = visionStats.attempts;
    document.getElementById('vision-successes').textContent = visionStats.successes;
    document.getElementById('vision-failures').textContent = visionStats.failures;
}

function setVisionChoiceButtonsEnabled(enabled) {
    visionChoiceButtons.querySelectorAll('.choice-btn').forEach(btn => {
        btn.disabled = !enabled;
        btn.classList.toggle('disabled', !enabled);
    });
}

function populateVisionChoiceButtons() {
    visionChoiceButtons.innerHTML = '';
    const options = visionMode === 'color' ? visionColors : visionShapes;
    options.forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.dataset.choice = option;
        if (visionMode === 'color') {
            btn.style.backgroundColor = option;
        } else {
            const svg = createSvgShape(option);
            btn.appendChild(svg);
        }
        visionChoiceButtons.appendChild(btn);
    });
}

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
    gtag('event', 'randomizer_start', {
        'event_category': 'Game',
        'event_label': 'Intention Randomizer',
        'mode': intentionMode,
        'session_id': sessionId,
        'custom_user_id': telegramUser ? telegramUser.id : 'unknown'
    });
}

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

visionShuffleBtn.addEventListener('click', startVisionShuffle);
visionChoiceButtons.addEventListener('click', handleVisionChoice);

intentionModeSelector.addEventListener('change', (e) => {
    intentionMode = e.target.value;
    if (ENABLE_LOGGING) {
        console.log('Intention mode changed to:', intentionMode);
    }
});

visionModeSelector.addEventListener('change', (e) => {
    visionMode = e.target.value;
    populateVisionChoiceButtons();
    if (ENABLE_LOGGING) {
        console.log('Vision mode changed to:', visionMode);
    }
});

intentionAttemptsModeDiv.addEventListener('change', (e) => {
    intentionAttemptsMode = e.target.value;
    if (ENABLE_LOGGING) {
        console.log('Intention attempts mode changed to:', intentionAttemptsMode);
    }
});

visionAttemptsModeDiv.addEventListener('change', (e) => {
    visionAttemptsMode = e.target.value;
    if (ENABLE_LOGGING) {
        console.log('Vision attempts mode changed to:', visionAttemptsMode);
    }
});

intentionNewGameBtn.addEventListener('click', resetIntentionGame);
visionNewGameBtn.addEventListener('click', resetVisionGame);

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

try {
    Telegram.WebApp.ready();
    telegramUser = Telegram.WebApp.initDataUnsafe.user || { id: 'anonymous_' + Math.random().toString(36).substr(2, 9) };
    if (ENABLE_LOGGING) {
        console.log('Telegram user:', telegramUser);
    }
    gtag('set', 'user_properties', {
        'custom_user_id': telegramUser.id
    });
} catch (e) {
    console.warn('Telegram WebApp not available, using anonymous user');
    telegramUser = { id: 'anonymous_' + Math.random().toString(36).substr(2, 9) };
}
