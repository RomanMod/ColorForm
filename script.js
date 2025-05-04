// Константы для времени "перемешивания" и генерации результата в Виденье
const SHUFFLE_BUTTON_DISABLE_TIME = 3000; // Время недоступности кнопки "Перемешать" (в мс)
const RANDOM_RESULT_MIN_TIME = 1200; // Минимальное время для генерации результата (в мс)
const RANDOM_RESULT_MAX_TIME = 2800; // Максимальное время для генерации результата (в мс)

// Константы для рандомизации в Намеренье
const INTENTION_RANDOMIZER_MIN_INTERVAL = 30; // Минимальный интервал обновления результата (в мс)
const INTENTION_RANDOMIZER_MAX_INTERVAL = 100; // Максимальный интервал обновления результата (в мс)
const INTENTION_FIXATION_DELAY_MIN = 0; // Минимальная задержка перед фиксацией результата (в мс)
const INTENTION_FIXATION_DELAY_MAX = 200; // Максимальная задержка перед фиксацией результата (в мс)

// Инициализация переменных
let telegramUser = null;
let currentGameMode = 'menu';
let gameStartTime = null;
let shuffleStartTime = null;
const sessionId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
const sessionStartTime = Date.now();
let sessionSummarySent = false;

let intentionRandomizerInterval = null;
let intentionCurrentResult = null;
let intentionMode = 'color';
let intentionAttemptsMode = 'limited';
let intentionMaxAttempts = 10;
let intentionStats = {
    attempts: 0,
    successes: 0,
    failures: 0
};

let visionRandomizerTimeout = null;
let visionCurrentResult = null;
let visionMode = 'color';
let visionAttemptsMode = 'limited';
let visionMaxAttempts = 10;
let visionStats = {
    attempts: 0,
    successes: 0,
    failures: 0
};

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

    const duration = (Date.now() - gameStartTime) / 1000;
    if (currentGameMode === 'vision') {
        console.log('Sending game_session_summary:', {
            sessionId,
            custom_user_id: telegramUser.id,
            session_duration_seconds: duration,
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
            'session_duration_seconds': duration,
            'session_id': sessionId,
            'custom_user_id': telegramUser.id,
            'session_start_time': Math.floor(sessionStartTime)
        });
    } else if (currentGameMode === 'intention') {
        console.log('Sending intention_session_summary:', {
            sessionId,
            custom_user_id: telegramUser.id,
            session_duration_seconds: duration,
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
            'session_duration_seconds': duration,
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
        Telegram.WebApp.MainButton.hide();
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
    intentionStats = { attempts: 0, successes: 0, failures: 0 };
    stopIntentionGame();
    startIntentionGame();
    updateIntentionStatsDisplay();
    intentionShowBtn.disabled = false;
    intentionNewGameBtn.classList.add('hidden');
    intentionAttemptsModeDiv.classList.remove('hidden');
}

function resetVisionGame() {
    console.log('Resetting Vision game');
    visionStats = { attempts: 0, successes: 0, failures: 0 };
    stopVisionGame();
    updateVisionChoicesDisplay();
    updateVisionStatsDisplay();
    visionShuffleBtn.disabled = false;
    visionNewGameBtn.classList.add('hidden');
    visionAttemptsModeDiv.classList.remove('hidden');
}

function startIntentionGame() {
    console.log('Starting Intention game');
    intentionCurrentResult = getRandomResult(intentionMode);
    console.log('Starting intention game, mode:', intentionMode, 'result:', intentionCurrentResult);

    // Функция для обновления результата с случайным интервалом
    function updateRandomResult() {
        intentionCurrentResult = getRandomResult(intentionMode);
        const randomInterval = INTENTION_RANDOMIZER_MIN_INTERVAL + Math.random() * (INTENTION_RANDOMIZER_MAX_INTERVAL - INTENTION_RANDOMIZER_MIN_INTERVAL);
        console.log(`Randomizer updated, result: ${intentionCurrentResult}, next update in ${randomInterval.toFixed(2)}ms`);
        // Планируем следующее обновление с новым случайным интервалом
        intentionRandomizerInterval = setTimeout(updateRandomResult, randomInterval);
    }

    // Запускаем первый цикл обновления
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
}

function showIntentionResult() {
    if (intentionRandomizerInterval === null) {
        console.warn('Randomizer interval is null, cannot show result');
        return;
    }

    // Генерируем случайную задержку перед фиксацией результата
    const randomDelay = INTENTION_FIXATION_DELAY_MIN + Math.random() * (INTENTION_FIXATION_DELAY_MAX - INTENTION_FIXATION_DELAY_MIN);
    console.log(`Fixation delay: ${randomDelay.toFixed(2)}ms`);

    setTimeout(() => {
        console.log('Showing intention result, mode:', intentionMode, 'result:', intentionCurrentResult);
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

        const feedbackButtons = document.createElement('div');
        feedbackButtons.className = 'feedback-buttons';
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
                'session_id': sessionId,
                'custom_user_id': telegramUser ? telegramUser.id : 'unknown'
            });
            cleanupAndRestart();
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
                'session_id': sessionId,
                'custom_user_id': telegramUser ? telegramUser.id : 'unknown'
            });
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

    // Отключаем кнопку "Перемешать" и кнопки выбора
    visionShuffleBtn.disabled = true;
    setVisionChoiceButtonsEnabled(false);
    visionResultDisplay.classList.add('hidden');
    visionDisplay.style.backgroundColor = 'black';
    visionResultDisplay.style.backgroundColor = 'transparent';

    // Генерируем случайное время для выбора результата
    const randomTime = RANDOM_RESULT_MIN_TIME + Math.random() * (RANDOM_RESULT_MAX_TIME - RANDOM_RESULT_MIN_TIME);

    // Устанавливаем таймер для генерации случайного результата в randomTime
    visionRandomizerTimeout = setTimeout(() => {
        visionCurrentResult = getRandomResult(visionMode);
        console.log(`Random result generated at ${randomTime.toFixed(2)}ms:`, visionCurrentResult);
    }, randomTime);

    // Устанавливаем таймер для завершения цикла перемешивания
    setTimeout(() => {
        visionShuffleBtn.disabled = false;
        setVisionChoiceButtonsEnabled(true);
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
    if (visionStats.attempts === 1) {
        visionAttemptsModeDiv.classList.add('hidden');
    }
    const isCorrect = (choice === visionCurrentResult);

    gtag('event', 'guess', {
        'event_category': 'Game',
        'event_label': 'Vision Guess',
        'value': isCorrect ? 'success' : 'failure',
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

 ткань для копирования

---

### Что изменено

1. **Логирование интервала обновления в `startIntentionGame`**:
   - В функции `updateRandomResult` добавлено логирование значения `randomInterval`:
     ```javascript
     console.log(`Randomizer updated, result: ${intentionCurrentResult}, next update in ${randomInterval.toFixed(2)}ms`);
     ```
   - Теперь в консоли будет отображаться, через сколько миллисекунд запланировано следующее обновление результата (например, `next update in 67.45ms`).

2. **Логирование задержки фиксации в `showIntentionResult`**:
   - Перед вызовом `setTimeout` добавлено логирование значения `randomDelay`:
     ```javascript
     console.log(`Fixation delay: ${randomDelay.toFixed(2)}ms`);
     ```
   - Это покажет, сколько миллисекунд составила задержка перед фиксацией результата (например, `Fixation delay: 123.78ms`).

3. **Форматирование логов**:
   - Значения `randomInterval` и `randomDelay` округляются до двух знаков после запятой с помощью `.toFixed(2)` для удобства чтения.

---

### Ожидаемый вывод в консоли
Теперь при игре в **Намеренье** в консоли будут отображаться:
- Для каждого обновления результата:
