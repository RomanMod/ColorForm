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
const SHOW_INTENTION_THROTTLE_MS = 500; // Троттлинг для showIntentionResult

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
let lastShowIntentionTime = 0; // Для троттлинга showIntentionResult

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
let currentAttemptId = 0; // Уникальный ID для каждой попытки

let visionMode = 'color';
let visionStats = {
    attempts: 0,
    successes: 0,
    failures: 0
};
let visionCorrectChoice = null; // Правильный ответ в режиме Виденье
let visionIsShuffling = false;

// Получаем элементы DOM
const app = document.getElementById('app');
const menuScreen = document.getElementById('menu-screen');
const intentionScreen = document.getElementById('intention-screen');
const visionScreen = document.getElementById('vision-screen');

const intentionButtons = document.getElementById('intention-choices');
const intentionResultDisplay = document.getElementById('intention-result');
const intentionShuffleBtn = document.getElementById('intention-shuffle-btn');
const intentionStatsDisplay = document.getElementById('intention-stats');

const visionResultDisplay = document.getElementById('vision-result');
const visionChoices = document.getElementById('vision-choices');
const visionShuffleBtn = document.getElementById('vision-shuffle-btn');
const visionStatsDisplay = document.getElementById('vision-stats');

const userNameSpan = document.getElementById('telegram-user-name');

const statsAttempts = document.getElementById('stats-attempts');
const statsSuccesses = document.getElementById('stats-successes');
const statsFailures = document.getElementById('stats-failures');
const statsSuccessRate = document.getElementById('stats-success-rate');
const statsCurrentMode = document.getElementById('stats-current-mode');

const visionStatsAttempts = document.getElementById('vision-stats-attempts');
const visionStatsSuccesses = document.getElementById('vision-stats-successes');
const visionStatsFailures = document.getElementById('vision-stats-failures');
const visionStatsSuccessRate = document.getElementById('vision-stats-success-rate');
const visionStatsCurrentMode = document.getElementById('vision-stats-current-mode');

// Загрузка и сохранение статистики в Local Storage
const saveStats = () => {
    try {
        localStorage.setItem('intentionStats', JSON.stringify(intentionStats));
        localStorage.setItem('visionStats', JSON.stringify(visionStats));
        localStorage.setItem('telegramUser', JSON.stringify(telegramUser));
        if (ENABLE_LOGGING) console.log('Stats saved:', { intentionStats, visionStats, telegramUser });
    } catch (e) {
        console.error('Error saving stats to localStorage:', e);
        sendGtagEvent('error', {
            event_category: 'App',
            event_label: 'LocalStorage Save Error',
            error_message: e.message
        });
    }
};

const loadStats = () => {
    try {
        const savedIntentionStats = localStorage.getItem('intentionStats');
        if (savedIntentionStats) {
            Object.assign(intentionStats, JSON.parse(savedIntentionStats));
        }
        const savedVisionStats = localStorage.getItem('visionStats');
        if (savedVisionStats) {
            Object.assign(visionStats, JSON.parse(savedVisionStats));
        }
        const savedTelegramUser = localStorage.getItem('telegramUser');
        if (savedTelegramUser) {
            telegramUser = JSON.parse(savedTelegramUser);
            if (userNameSpan && telegramUser) userNameSpan.textContent = telegramUser.first_name;
        }
        if (ENABLE_LOGGING) console.log('Stats loaded:', { intentionStats, visionStats, telegramUser });
    } catch (e) {
        console.error('Error loading stats from localStorage:', e);
        sendGtagEvent('error', {
            event_category: 'App',
            event_label: 'LocalStorage Load Error',
            error_message: e.message
        });
    }
};

const updateIntentionStatsDisplay = () => {
    statsAttempts.textContent = intentionStats.attempts;
    statsSuccesses.textContent = intentionStats.successes;
    statsFailures.textContent = intentionStats.failures;
    const successRate = intentionStats.attempts > 0 ? (intentionStats.successes / intentionStats.attempts * 100).toFixed(1) : '0.0';
    statsSuccessRate.textContent = `${successRate}%`;
    statsCurrentMode.textContent = `${intentionMode} (${intentionAttemptsMode === 'limited' ? intentionStats.attempts + '/' + intentionMaxAttempts : 'без лимита'})`;
    saveStats();
};

const updateVisionStatsDisplay = () => {
    visionStatsAttempts.textContent = visionStats.attempts;
    visionStatsSuccesses.textContent = visionStats.successes;
    visionStatsFailures.textContent = visionStats.failures;
    const successRate = visionStats.attempts > 0 ? (visionStats.successes / visionStats.attempts * 100).toFixed(1) : '0.0';
    visionStatsSuccessRate.textContent = `${successRate}%`;
    visionStatsCurrentMode.textContent = visionMode;
    saveStats();
};

// Отправка события в GA4
function sendGtagEvent(eventName, params = {}) {
    if (window.gtag) {
        const defaultParams = {
            session_id: sessionId,
            custom_user_id: telegramUser ? telegramUser.id : 'anonymous'
        };
        const mergedParams = { ...defaultParams, ...params };
        if (ENABLE_LOGGING) console.log(`Sending GA4 event: ${eventName}`, mergedParams);
        window.gtag('event', eventName, mergedParams);
    } else {
        if (ENABLE_LOGGING) console.warn(`gtag not available, could not send event: ${eventName}`, params);
    }
}

// Отправка сводки сессии
function sendSessionSummary() {
    if (sessionSummarySent) return; // Предотвращаем повторную отправку

    const sessionDurationSeconds = parseFloat(((Date.now() - gameStartTime) / 1000).toFixed(1));

    // Отправляем сводку для Intention
    if (intentionStats.attempts > 0) {
        sendGtagEvent('intention_session_summary', {
            event_category: 'Game Session',
            event_label: 'Intention Session Summary',
            mode: intentionMode,
            attempts: intentionStats.attempts,
            successes: intentionStats.successes,
            failures: intentionStats.failures,
            session_duration_seconds: sessionDurationSeconds
        });
    }

    // Отправляем сводку для Vision (если применимо)
    if (visionStats.attempts > 0) {
        sendGtagEvent('game_session_summary', { // Используем game_session_summary как более общее
            event_category: 'Game Session',
            event_label: 'Vision Session Summary',
            mode: visionMode,
            attempts: visionStats.attempts,
            successes: visionStats.successes,
            failures: visionStats.failures,
            session_duration_seconds: sessionDurationSeconds
        });
    }

    sessionSummarySent = true;
    if (ENABLE_LOGGING) console.log('Session summary sent.');
}

// Отправка сохраненных статистик в GA4 при запуске
function sendSavedStats() {
    // Отправляем статистику для Намеренья
    if (intentionStats.attempts > 0) {
        sendGtagEvent('saved_intention_stats', {
            event_category: 'User Stats',
            event_label: 'Intention Game Stats on Launch',
            total_attempts: intentionStats.attempts,
            total_successes: intentionStats.successes,
            total_failures: intentionStats.failures,
            mode: intentionMode
        });
    }

    // Отправляем статистику для Виденья
    if (visionStats.attempts > 0) {
        sendGtagEvent('saved_vision_stats', {
            event_category: 'User Stats',
            event_label: 'Vision Game Stats on Launch',
            total_attempts: visionStats.attempts,
            total_successes: visionStats.successes,
            total_failures: visionStats.failures,
            mode: visionMode
        });
    }
}

// Управление экранами
const showScreen = (screenId) => {
    menuScreen.classList.add('hidden');
    intentionScreen.classList.add('hidden');
    visionScreen.classList.add('hidden');
    app.classList.remove('intention-mode', 'vision-mode'); // Сброс классов режима

    if (screenId === 'menu-screen') {
        menuScreen.classList.remove('hidden');
        sendGtagEvent('screen_view', { screen_name: 'menu_screen' });
        if (gameStartTime) {
            sendSessionSummary();
        }
        gameStartTime = null; // Сброс времени начала игры при возврате в меню
    } else if (screenId === 'intention-screen') {
        intentionScreen.classList.remove('hidden');
        app.classList.add('intention-mode');
        startGame('intention');
        sendGtagEvent('screen_view', { screen_name: 'intention_screen', game_mode: intentionMode, attempts_mode: intentionAttemptsMode });
    } else if (screenId === 'vision-screen') {
        visionScreen.classList.remove('hidden');
        app.classList.add('vision-mode');
        startGame('vision');
        sendGtagEvent('screen_view', { screen_name: 'vision_screen', game_mode: visionMode });
    }
};

const startGame = (gameType) => {
    if (!gameStartTime) { // Устанавливаем время начала игры только один раз за сессию
        gameStartTime = Date.now();
        sessionSummarySent = false; // Сброс флага
        sendGtagEvent('game_start', {
            event_category: 'Game',
            event_label: `${gameType} Game Started`,
            game_type: gameType,
            session_id: sessionId,
            custom_user_id: telegramUser ? telegramUser.id : 'anonymous'
        });
    }
    if (gameType === 'intention') {
        // Сброс статистики, если режим лимитированных попыток и игра начинается заново
        if (intentionAttemptsMode === 'limited' && intentionStats.attempts >= intentionMaxAttempts) {
            resetIntentionStats();
            sendGtagEvent('game_reset', {
                event_category: 'Game',
                event_label: 'Intention Limited Attempts Reset',
                game_mode: intentionMode,
                session_id: sessionId,
                custom_user_id: telegramUser ? telegramUser.id : 'anonymous'
            });
        }
        updateIntentionStatsDisplay();
        startIntentionAttempt();
    } else if (gameType === 'vision') {
        updateVisionStatsDisplay();
        startVisionShuffle(); // Начинаем сразу перемешивание для виденья
    }
};

const resetIntentionStats = () => {
    intentionStats.attempts = 0;
    intentionStats.successes = 0;
    intentionStats.failures = 0;
    updateIntentionStatsDisplay();
};

const resetVisionStats = () => {
    visionStats.attempts = 0;
    visionStats.successes = 0;
    visionStats.failures = 0;
    updateVisionStatsDisplay();
};

// Логика игры "Намеренье"
const startIntentionAttempt = () => {
    if (isProcessingIntention) return;
    isProcessingIntention = true;
    intentionAttemptStartTime = Date.now();
    currentAttemptId++;

    intentionResultDisplay.style.backgroundColor = 'black';
    intentionResultDisplay.textContent = 'Намерься';
    intentionResultDisplay.classList.remove('feedback-text'); // Удаляем текстовую обратную связь
    
    // Включение кнопок выбора после задержки
    choiceButtonsEnabledTime = Date.now() + INTENTION_FIXATION_DELAY_MAX; // Кнопки будут доступны через MAX_DELAY

    // Рандомизация цвета для намерения
    const colors = ['red', 'blue'];
    const shapes = ['circle', 'triangle'];
    const choices = intentionMode === 'color' ? colors : shapes;
    intentionCurrentResult = choices[Math.floor(Math.random() * choices.length)];

    // Сброс всех кнопок и скрытие/показ по режиму
    intentionButtons.querySelectorAll('.choice-btn').forEach(btn => {
        btn.classList.add('hidden');
        btn.style.pointerEvents = 'none'; // Деактивировать кнопки
    });

    if (intentionMode === 'color') {
        intentionButtons.querySelector('[data-choice="red"]').classList.remove('hidden');
        intentionButtons.querySelector('[data-choice="blue"]').classList.remove('hidden');
    } else if (intentionMode === 'shape') {
        intentionButtons.querySelector('[data-choice="circle"]').classList.remove('hidden');
        intentionButtons.querySelector('[data-choice="triangle"]').classList.remove('hidden');
    }

    // Запуск интервала для "Намерься"
    let intervalCount = 0;
    intentionRandomizerInterval = setInterval(() => {
        intentionResultDisplay.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        if (intervalCount >= INTENTION_RANDOMIZER_MIN_INTERVAL) {
            clearInterval(intentionRandomizerInterval);
            showIntentionResult();
        }
        intervalCount++;
    }, Math.random() * (INTENTION_RANDOMIZER_MAX_INTERVAL - INTENTION_RANDOMIZER_MIN_INTERVAL) + INTENTION_RANDOMIZER_MIN_INTERVAL);
};

const showIntentionResult = () => {
    // Троттлинг, чтобы избежать многократных вызовов при быстром клике/таймауте
    const now = Date.now();
    if (now - lastShowIntentionTime < SHOW_INTENTION_THROTTLE_MS) {
        return;
    }
    lastShowIntentionTime = now;

    intentionResultDisplay.style.backgroundColor = intentionCurrentResult;
    intentionResultDisplay.textContent = ''; // Очищаем текст "Намерься"

    // Активируем кнопки после задержки фиксации
    setTimeout(() => {
        intentionButtons.querySelectorAll('.choice-btn').forEach(btn => {
            btn.style.pointerEvents = 'auto'; // Активировать кнопки
        });
        // Устанавливаем таймаут для всей попытки
        const attemptTimeout = setTimeout(() => {
            if (isProcessingIntention) { // Если еще не обработано
                handleIntentionTimeout();
            }
        }, 10000); // 10 секунд на попытку
        // Сохраняем таймаут для возможности очистки при выборе
        intentionAttemptStartTime = { timestamp: intentionAttemptStartTime, timeoutId: attemptTimeout };
    }, INTENTION_FIXATION_DELAY_MIN + Math.random() * (INTENTION_FIXATION_DELAY_MAX - INTENTION_FIXATION_DELAY_MIN));
};

const processIntentionChoice = (chosenResult, choiceTime) => {
    if (!isProcessingIntention) return;
    isProcessingIntention = false; // Блокируем дальнейшую обработку

    // Очищаем таймаут для текущей попытки
    if (intentionAttemptStartTime && intentionAttemptStartTime.timeoutId) {
        clearTimeout(intentionAttemptStartTime.timeoutId);
    }

    const guessResult = chosenResult === intentionCurrentResult ? 'success' : 'failure';
    const timeToGuess = parseFloat(((choiceTime - intentionAttemptStartTime.timestamp) / 1000).toFixed(1)); // Используем сохраненную метку времени

    intentionStats.attempts++;
    if (guessResult === 'success') {
        intentionStats.successes++;
        intentionResultDisplay.classList.add('feedback-text');
        intentionResultDisplay.textContent = 'Верно!';
        intentionResultDisplay.style.backgroundColor = 'green';
        sendGtagEvent('intention_guess', {
            event_category: 'Game',
            event_label: 'Intention Guess',
            game_mode: intentionMode,
            guess_result: guessResult,
            correct_answer: 1, // Добавлен новый параметр: 1 = верно
            time_to_guess: timeToGuess,
            attempt_id: currentAttemptId,
            custom_user_id: telegramUser ? telegramUser.id : 'anonymous',
            session_id: sessionId,
            session_duration_seconds: parseFloat(((Date.now() - gameStartTime) / 1000).toFixed(1))
        });
    } else {
        intentionStats.failures++;
        intentionResultDisplay.classList.add('feedback-text');
        intentionResultDisplay.textContent = 'Неверно!';
        intentionResultDisplay.style.backgroundColor = 'red';
        sendGtagEvent('intention_guess', {
            event_category: 'Game',
            event_label: 'Intention Guess',
            game_mode: intentionMode,
            guess_result: guessResult,
            correct_answer: 0, // Добавлен новый параметр: 0 = неверно
            time_to_guess: timeToGuess,
            attempt_id: currentAttemptId,
            custom_user_id: telegramUser ? telegramUser.id : 'anonymous',
            session_id: sessionId,
            session_duration_seconds: parseFloat(((Date.now() - gameStartTime) / 1000).toFixed(1))
        });
    }

    updateIntentionStatsDisplay();
    intentionButtons.querySelectorAll('.choice-btn').forEach(btn => {
        btn.style.pointerEvents = 'none'; // Деактивировать кнопки после выбора
    });

    // Если достигнут лимит попыток, показываем меню
    if (intentionAttemptsMode === 'limited' && intentionStats.attempts >= intentionMaxAttempts) {
        setTimeout(() => showScreen('menu-screen'), 2000); // Задержка перед переходом в меню
    } else {
        setTimeout(startIntentionAttempt, 2000); // Начать следующую попытку через 2 секунды
    }
};

const handleIntentionTimeout = () => {
    if (!isProcessingIntention) return;
    isProcessingIntention = false;

    // Очищаем таймаут для текущей попытки (на всякий случай)
    if (intentionAttemptStartTime && intentionAttemptStartTime.timeoutId) {
        clearTimeout(intentionAttemptStartTime.timeoutId);
    }

    const timeToGuess = parseFloat(((Date.now() - intentionAttemptStartTime.timestamp) / 1000).toFixed(1));

    intentionStats.attempts++;
    intentionStats.failures++; // Таймаут - это всегда неудача

    intentionResultDisplay.classList.add('feedback-text');
    intentionResultDisplay.textContent = 'Время вышло!';
    intentionResultDisplay.style.backgroundColor = 'orange'; // Или другой цвет для таймаута

    updateIntentionStatsDisplay();
    intentionButtons.querySelectorAll('.choice-btn').forEach(btn => {
        btn.style.pointerEvents = 'none'; // Деактивировать кнопки
    });

    sendGtagEvent('intention_timeout', {
        event_category: 'Game',
        event_label: 'Intention Timeout',
        game_mode: intentionMode,
        time_to_guess: timeToGuess,
        guess_result: 'timeout', // Добавлен для ясности
        correct_answer: 0, // Таймаут = 0 (неверно)
        attempt_id: currentAttemptId,
        custom_user_id: telegramUser ? telegramUser.id : 'anonymous',
        session_id: sessionId,
        session_duration_seconds: parseFloat(((Date.now() - gameStartTime) / 1000).toFixed(1))
    });

    if (intentionAttemptsMode === 'limited' && intentionStats.attempts >= intentionMaxAttempts) {
        setTimeout(() => showScreen('menu-screen'), 2000);
    } else {
        setTimeout(startIntentionAttempt, 2000);
    }
};

// Логика игры "Виденье"
const startVisionShuffle = () => {
    if (visionIsShuffling) return;
    visionIsShuffling = true;

    visionResultDisplay.classList.remove('feedback-text', 'correct', 'incorrect');
    visionResultDisplay.innerHTML = ''; // Очистить текст и цвет
    visionResultDisplay.style.backgroundColor = 'black'; // Сброс цвета фона

    visionChoices.querySelectorAll('.choice-btn').forEach(btn => {
        btn.style.pointerEvents = 'none'; // Деактивировать кнопки
        btn.classList.add('hidden'); // Скрыть все кнопки пока не определится режим
    });

    // Определить, какие кнопки показывать в зависимости от режима
    const colors = ['red', 'blue'];
    const shapes = ['circle', 'triangle'];
    const availableChoices = visionMode === 'color' ? colors : shapes;

    availableChoices.forEach(choice => {
        const btn = visionChoices.querySelector(`[data-choice="${choice}"]`);
        if (btn) btn.classList.remove('hidden');
    });
    
    // Определяем правильный ответ
    visionCorrectChoice = availableChoices[Math.floor(Math.random() * availableChoices.length)];

    shuffleStartTime = Date.now(); // Запоминаем время начала перемешивания
    visionShuffleBtn.disabled = true; // Отключаем кнопку "Перемешать"
    
    // Рандомное время для отображения результата
    const displayTime = Math.random() * (RANDOM_RESULT_MAX_TIME - RANDOM_RESULT_MIN_TIME) + RANDOM_RESULT_MIN_TIME;

    // Запуск анимации перемешивания
    let shuffleInterval = setInterval(() => {
        visionResultDisplay.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    }, 100);

    // Завершение перемешивания и отображение результата
    setTimeout(() => {
        clearInterval(shuffleInterval);
        visionResultDisplay.style.backgroundColor = visionCorrectChoice; // Показать правильный цвет/форму
        visionResultDisplay.textContent = ''; // Убрать текст

        // Активировать кнопки выбора
        visionChoices.querySelectorAll('.choice-btn').forEach(btn => {
            btn.style.pointerEvents = 'auto'; // Активировать кнопки
        });
        visionIsShuffling = false;
    }, displayTime);
};

const processVisionChoice = (chosenResult) => {
    if (visionIsShuffling) return; // Не обрабатывать выбор, пока идет перемешивание

    visionStats.attempts++;
    let guessResult = '';

    if (chosenResult === visionCorrectChoice) {
        visionStats.successes++;
        guessResult = 'success';
        visionResultDisplay.classList.add('feedback-text', 'correct');
        visionResultDisplay.textContent = 'Верно!';
        visionResultDisplay.style.backgroundColor = 'green';
    } else {
        visionStats.failures++;
        guessResult = 'failure';
        visionResultDisplay.classList.add('feedback-text', 'incorrect');
        visionResultDisplay.textContent = 'Неверно!';
        visionResultDisplay.style.backgroundColor = 'red';
    }

    updateVisionStatsDisplay();
    
    sendGtagEvent('guess', { // Используем общее событие 'guess'
        event_category: 'Game',
        event_label: 'Vision Guess',
        game_mode: visionMode,
        guess_result: guessResult,
        correct_answer: guessResult === 'success' ? 1 : 0, // Добавлен новый параметр
        time_to_guess: parseFloat(((Date.now() - shuffleStartTime) / 1000).toFixed(1)), // Время от начала перемешивания до выбора
        custom_user_id: telegramUser ? telegramUser.id : 'anonymous',
        session_id: sessionId,
        session_duration_seconds: parseFloat(((Date.now() - gameStartTime) / 1000).toFixed(1))
    });

    visionChoices.querySelectorAll('.choice-btn').forEach(btn => {
        btn.style.pointerEvents = 'none'; // Деактивировать кнопки после выбора
    });
    visionShuffleBtn.disabled = false; // Включаем кнопку "Перемешать" снова
};


// Обработчики событий DOM
document.addEventListener('DOMContentLoaded', () => {
    loadStats(); // Загружаем статистику при загрузке страницы
    updateIntentionStatsDisplay(); // Обновляем отображение статистики при загрузке
    updateVisionStatsDisplay();

    // Главное меню
    document.getElementById('start-intention-btn').addEventListener('click', () => showScreen('intention-screen'));
    document.getElementById('start-vision-btn').addEventListener('click', () => showScreen('vision-screen'));

    // Кнопка "Назад в меню"
    document.querySelectorAll('.back-to-menu-btn').forEach(btn => {
        btn.addEventListener('click', () => showScreen('menu-screen'));
    });

    // Намеренье: кнопки выбора
    intentionButtons.addEventListener('click', (event) => {
        const choice = event.target.closest('.choice-btn');
        if (choice && choice.style.pointerEvents !== 'none') { // Проверяем, активна ли кнопка
            processIntentionChoice(choice.dataset.choice, Date.now());
        }
    });

    // Намеренье: кнопки настроек
    document.getElementById('intention-mode-select').addEventListener('change', (event) => {
        intentionMode = event.target.value;
        resetIntentionStats(); // Сбрасываем статистику при смене режима
        updateIntentionStatsDisplay();
        sendGtagEvent('game_mode_change', { event_category: 'Game Settings', event_label: 'Intention Mode Changed', new_mode: intentionMode });
    });
    document.getElementById('intention-attempts-mode-select').addEventListener('change', (event) => {
        intentionAttemptsMode = event.target.value;
        resetIntentionStats(); // Сбрасываем статистику при смене режима попыток
        updateIntentionStatsDisplay();
        sendGtagEvent('attempts_mode_change', { event_category: 'Game Settings', event_label: 'Intention Attempts Mode Changed', new_mode: intentionAttemptsMode });
    });
    document.getElementById('intention-max-attempts-input').addEventListener('change', (event) => {
        const newMax = parseInt(event.target.value);
        if (!isNaN(newMax) && newMax > 0) {
            intentionMaxAttempts = newMax;
            resetIntentionStats(); // Сбрасываем статистику при смене лимита
            updateIntentionStatsDisplay();
            sendGtagEvent('max_attempts_change', { event_category: 'Game Settings', event_label: 'Intention Max Attempts Changed', new_max_attempts: intentionMaxAttempts });
        }
    });
    document.getElementById('reset-intention-stats-btn').addEventListener('click', () => {
        resetIntentionStats();
        sendGtagEvent('stats_reset', { event_category: 'Game Settings', event_label: 'Intention Stats Reset' });
    });

    // Виденье: кнопки выбора
    visionChoices.addEventListener('click', (event) => {
        const choice = event.target.closest('.choice-btn');
        if (choice && choice.style.pointerEvents !== 'none') { // Проверяем, активна ли кнопка
            processVisionChoice(choice.dataset.choice);
        }
    });

    // Виденье: кнопка "Перемешать"
    visionShuffleBtn.addEventListener('click', startVisionShuffle);

    // Виденье: кнопки настроек
    document.getElementById('vision-mode-select').addEventListener('change', (event) => {
        visionMode = event.target.value;
        resetVisionStats(); // Сбрасываем статистику при смене режима
        updateVisionStatsDisplay();
        sendGtagEvent('game_mode_change', { event_category: 'Game Settings', event_label: 'Vision Mode Changed', new_mode: visionMode });
        // Скрываем/показываем кнопки в зависимости от режима
        visionChoices.querySelectorAll('.shape-btn, .color-btn').forEach(btn => btn.classList.add('hidden'));
        if (visionMode === 'color') {
            visionChoices.querySelector('[data-choice="red"]').classList.remove('hidden');
            visionChoices.querySelector('[data-choice="blue"]').classList.remove('hidden');
        } else if (visionMode === 'shape') {
            visionChoices.querySelector('[data-choice="circle"]').classList.remove('hidden');
            visionChoices.querySelector('[data-choice="triangle"]').classList.remove('hidden');
        }
    });
    document.getElementById('reset-vision-stats-btn').addEventListener('click', () => {
        resetVisionStats();
        sendGtagEvent('stats_reset', { event_category: 'Game Settings', event_label: 'Vision Stats Reset' });
    });
});


// Инициализация Telegram WebApp
try {
    if (Telegram.WebApp) {
        telegramUser = Telegram.WebApp.initDataUnsafe.user;
        if (telegramUser && userNameSpan) {
            userNameSpan.textContent = telegramUser.first_name || 'Игрок';
            sendGtagEvent('app_launch', {
                event_category: 'App',
                event_label: 'Mini App Started',
                start_param: Telegram.WebApp.initDataUnsafe.start_param || 'none',
                session_id: sessionId,
                custom_user_id: telegramUser.id
            });
        } else {
            // Если пользователь не определен, но WebApp доступен (например, при локальном запуске без инициализации)
            // Создаем анонимного пользователя для GA4
            telegramUser = { id: 'anonymous_' + Math.random().toString(36).substr(2, 9), first_name: 'Игрок' };
            if (userNameSpan) userNameSpan.textContent = telegramUser.first_name;
            sendGtagEvent('app_launch', {
                event_category: 'App',
                event_label: 'Mini App Started (No User)',
                start_param: Telegram.WebApp.initDataUnsafe.start_param || 'none',
                session_id: sessionId,
                custom_user_id: telegramUser.id
            });
        }
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
    if (!isStateStable && !Telegram.WebApp.isExpanded() && gameStartTime && !sessionSummarySent) {
        console.log('Viewport changed, sending session summary');
        sendSessionSummary();
        sendGtagEvent('app_background', {
            event_category: 'App',
            event_label: 'Viewport Minimized',
            session_id: sessionId,
            session_duration_seconds: parseFloat(((Date.now() - gameStartTime) / 1000).toFixed(1)),
            custom_user_id: telegramUser ? telegramUser.id : 'anonymous'
        });
    }
});

// Добавить отладку gtag
window.dataLayer = window.dataLayer || [];
