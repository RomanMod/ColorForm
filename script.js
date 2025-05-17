// Глобальные переменные
let intentionAttemptsMode = 'limited'; // По умолчанию, обновляется из радиокнопок
let visionAttemptsMode = 'limited'; // По умолчанию для игры Виденье
let intentionStats = { attempts: 0, successes: 0, failures: 0 };
let visionStats = { attempts: 0, successes: 0, failures: 0 };
let intentionGuessSequence = [];
let visionGuessSequence = [];
let intentionAttempts = [];
let visionAttempts = [];
let sessionId = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
let intentionSubsessionId = `${sessionId}_1`;
let visionSubsessionId = `${sessionId}_1`;
let intentionSubsessionCounter = 1;
let visionSubsessionCounter = 1;
let intentionMode = 'color'; // По умолчанию, обновляется из радиокнопок
let visionMode = 'color'; // По умолчанию, обновляется из радиокнопок
let intentionCurrentResult = null;
let visionCurrentResult = null;
let intentionRandomizerInterval = null;
let visionShuffleInterval = null;
let isProcessingIntention = false;
let isProcessingVision = false;
let lastShowIntentionTime = 0;
let lastShuffleVisionTime = 0;
let intentionAttemptStartTime = null;
let visionAttemptStartTime = null;
let gameStartTime = null;
const SHOW_INTENTION_THROTTLE_MS = 1000;
const VISION_SHUFFLE_DURATION_MS = 3000;
const VISION_SHUFFLE_THROTTLE_MS = 1000;
const INTENTION_FIXATION_DELAY_MIN = 0;
const INTENTION_FIXATION_DELAY_MAX = 500;
const INTENTION_RANDOMIZER_MIN_INTERVAL = 30;
const VISION_SHUFFLE_MIN_INTERVAL = 100;
const ENABLE_LOGGING = true;
const intentionMaxAttempts = 10;
const visionMaxAttempts = 10;
let currentGameMode = 'menu';

// Элементы DOM
const app = document.getElementById('app');
const userGreeting = document.getElementById('user-greeting');
const telegramUserName = document.getElementById('telegram-user-name');
const intentionShowBtn = document.getElementById('intention-show-btn');
const intentionNewGameBtn = document.getElementById('intention-new-game-btn');
const intentionDisplay = document.getElementById('intention-display');
const intentionResultDisplay = document.getElementById('intention-result');
const intentionAttemptsModeDiv = document.getElementById('intention-attempts-mode');
const visionShuffleBtn = document.getElementById('vision-shuffle-btn');
const visionNewGameBtn = document.getElementById('vision-new-game-btn');
const visionDisplay = document.getElementById('vision-display');
const visionResultDisplay = document.getElementById('vision-result');
const visionChoices = document.getElementById('vision-choices');
const visionAttemptsModeDiv = document.getElementById('vision-attempts-mode');
const readMoreArea = document.getElementById('read-more-area');

// Telegram Web App инициализация
if (window.Telegram && window.Telegram.WebApp) {
    Telegram.WebApp.ready();
    Telegram.WebApp.expand();
    Telegram.WebApp.setHeaderColor('bg_color');
    Telegram.WebApp.setBottomBarColor('#ffffff');
    const user = Telegram.WebApp.initDataUnsafe.user;
    if (user && user.first_name) {
        telegramUserName.textContent = user.first_name;
        userGreeting.textContent = `Порепетируем, ${user.first_name}👁`;
    } else {
        telegramUserName.textContent = 'Игрок';
    }
    if (ENABLE_LOGGING) console.log('Anonymous User:', { id: 'anonymous_kl85gp3vy' });
}

// GA4 отправка событий
function sendGtagEvent(eventName, params) {
    if (window.gtag) {
        const eventParams = {
            ...params,
            session_id: sessionId,
            custom_user_id: 'anonymous_kl85gp3vy'
        };
        if (eventName.includes('intention')) {
            eventParams.subsession_id = intentionSubsessionId;
        } else if (eventName.includes('vision')) {
            eventParams.subsession_id = visionSubsessionId;
        }
        gtag('event', eventName, eventParams);
        if (ENABLE_LOGGING) console.log(`gtag ${eventName} sent:`, eventParams);
    }
}

// Сохранение попыток
function saveIntentionAttempts() {
    localStorage.setItem('intention_attempts', JSON.stringify(intentionAttempts));
    if (ENABLE_LOGGING) console.log('Saved intention attempts to localStorage:', intentionAttempts);
}

function saveVisionAttempts() {
    localStorage.setItem('vision_attempts', JSON.stringify(visionAttempts));
    if (ENABLE_LOGGING) console.log('Saved vision attempts to localStorage:', visionAttempts);
}

// Обновление статистики
function updateIntentionStatsDisplay() {
    const attemptsEl = document.getElementById('intention-stats-attempts');
    const maxAttemptsEl = document.getElementById('intention-stats-max-attempts');
    const successesEl = document.getElementById('intention-stats-successes');
    const failuresEl = document.getElementById('intention-stats-failures');
    const successRateEl = document.getElementById('intention-stats-success-rate');
    const avgTimeEl = document.getElementById('intention-stats-avg-time');

    if (attemptsEl) attemptsEl.textContent = intentionStats.attempts;
    if (maxAttemptsEl) maxAttemptsEl.textContent = intentionAttemptsMode === 'limited' ? intentionMaxAttempts : '∞';
    if (successesEl) successesEl.textContent = intentionStats.successes;
    if (failuresEl) failuresEl.textContent = intentionStats.failures;
    if (successRateEl) {
        successRateEl.textContent = intentionStats.attempts > 0
            ? `${Math.round((intentionStats.successes / intentionStats.attempts) * 100)}%`
            : '0%';
    }
    if (avgTimeEl) {
        const avgTime = intentionAttempts.reduce((sum, a) => sum + a.time, 0) / intentionAttempts.length || 0;
        avgTimeEl.textContent = `${avgTime.toFixed(1)}с`;
    }
}

function updateVisionStatsDisplay() {
    const attemptsEl = document.getElementById('stats-attempts');
    const maxAttemptsEl = document.getElementById('stats-max-attempts');
    const successesEl = document.getElementById('stats-successes');
    const failuresEl = document.getElementById('stats-failures');
    const successRateEl = document.getElementById('stats-success-rate');
    const avgTimeEl = document.getElementById('stats-avg-time');

    if (attemptsEl) attemptsEl.textContent = visionStats.attempts;
    if (maxAttemptsEl) maxAttemptsEl.textContent = visionAttemptsMode === 'limited' ? visionMaxAttempts : '∞';
    if (successesEl) successesEl.textContent = visionStats.successes;
    if (failuresEl) failuresEl.textContent = visionStats.failures;
    if (successRateEl) {
        successRateEl.textContent = visionStats.attempts > 0
            ? `${Math.round((visionStats.successes / visionStats.attempts) * 100)}%`
            : '0%';
    }
    if (avgTimeEl) {
        const avgTime = visionAttempts.reduce((sum, a) => sum + a.time, 0) / visionAttempts.length || 0;
        avgTimeEl.textContent = `${avgTime.toFixed(1)}с`;
    }
}

// Сброс игры
function resetIntentionGame() {
    if (ENABLE_LOGGING) console.log('Resetting Intention game');
    intentionGuessSequence = [];
    intentionAttempts = [];
    intentionAttemptStartTime = null;
    intentionStats = { attempts: 0, successes: 0, failures: 0 };
    saveIntentionAttempts();
    updateIntentionStatsDisplay();
}

function resetVisionGame() {
    if (ENABLE_LOGGING) console.log('Resetting Vision game');
    visionGuessSequence = [];
    visionAttempts = [];
    visionAttemptStartTime = null;
    visionStats = { attempts: 0, successes: 0, failures: 0 };
    saveVisionAttempts();
    updateVisionStatsDisplay();
}

// Запуск игры Намеренье
function startIntentionGame() {
    if (ENABLE_LOGGING) console.log('Starting Intention game');
    gameStartTime = gameStartTime || Date.now();
    intentionAttemptStartTime = Date.now();
    intentionCurrentResult = intentionMode === 'color'
        ? ['red', 'blue'][Math.floor(Math.random() * 2)]
        : ['circle', 'triangle'][Math.floor(Math.random() * 2)];
    if (intentionRandomizerInterval) clearTimeout(intentionRandomizerInterval);
    let randomizerCount = 0;
    intentionRandomizerInterval = setInterval(() => {
        randomizerCount++;
        const nextResult = intentionMode === 'color'
            ? ['red', 'blue'][Math.floor(Math.random() * 2)]
            : ['circle', 'triangle'][Math.floor(Math.random() * 2)];
        if (ENABLE_LOGGING) console.log(`Randomizer updated (count: ${randomizerCount}), result: ${nextResult}, next update in ${INTENTION_RANDOMIZER_MIN_INTERVAL}ms`);
    }, INTENTION_RANDOMIZER_MIN_INTERVAL);
    sendGtagEvent('randomizer_start', {
        event_category: 'Game',
        event_label: 'Intention Randomizer',
        mode: intentionMode
    });
    if (ENABLE_LOGGING) console.log(`Starting intention game, mode: ${intentionMode}, result: ${intentionCurrentResult}, attempt_start_time: ${intentionAttemptStartTime}, subsession_id: ${intentionSubsessionId}`);
}

// Запуск игры Виденье
function startVisionGame() {
    if (ENABLE_LOGGING) console.log('Starting Vision game');
    gameStartTime = gameStartTime || Date.now();
    visionAttemptStartTime = Date.now();
    visionCurrentResult = null; // Результат будет установлен после перемешивания
    if (visionShuffleInterval) clearInterval(visionShuffleInterval);
    if (visionDisplay) visionDisplay.classList.remove('processing');
    if (visionResultDisplay) visionResultDisplay.classList.add('hidden');
    if (visionShuffleBtn) visionShuffleBtn.classList.remove('hidden');
    updateVisionStatsDisplay();
}

// Показ результата Намеренье
function showIntentionResult() {
    const now = Date.now();
    const timeSinceLast = now - lastShowIntentionTime;
    if (intentionRandomizerInterval === null || isProcessingIntention || timeSinceLast < SHOW_INTENTION_THROTTLE_MS) {
        if (ENABLE_LOGGING) {
            console.warn('showIntentionResult throttled or invalid state:', {
                timeSinceLast,
                randomizerInterval: intentionRandomizerInterval,
                isProcessing: isProcessingIntention
            });
        }
        return;
    }
    lastShowIntentionTime = now;
    isProcessingIntention = true;
    const randomDelay = INTENTION_FIXATION_DELAY_MIN + Math.random() * (INTENTION_FIXATION_DELAY_MAX - INTENTION_RANDOMIZER_MIN_INTERVAL);
    if (ENABLE_LOGGING) console.log(`Fixation delay: ${randomDelay.toFixed(2)}ms`);

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
            console.log(`Showing intention result, mode: ${intentionMode}, result: ${intentionCurrentResult}, subsession_id: ${intentionSubsessionId}`);
            console.log(`Intention result displayed at: ${Date.now()}`);
        }
        intentionStats.attempts++;
        if (intentionStats.attempts === 1 && intentionAttemptsModeDiv) {
            intentionAttemptsModeDiv.classList.add('hidden');
        }
        updateIntentionStatsDisplay();

        sendGtagEvent('show_result', {
            event_category: 'Game',
            event_label: 'Intention Show',
            mode: intentionMode
        });

        clearTimeout(intentionRandomizerInterval);
        intentionRandomizerInterval = null;
        if (intentionResultDisplay) {
            intentionResultDisplay.innerHTML = '';
            intentionResultDisplay.style.backgroundColor = 'white';
            intentionResultDisplay.style.display = 'flex';
        }

        // Обновление стилей
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

        const elementsMap = {
            intentionResultDisplay,
            intentionDisplay,
            intentionShowBtn
        };

        Object.keys(stylesToUpdate).forEach(element => {
            const el = elementsMap[element];
            if (el) {
                Object.assign(el.style, stylesToUpdate[element]);
                if (stylesToUpdate[element].classList) {
                    Object.keys(stylesToUpdate[element].classList).forEach(action => {
                        stylesToUpdate[element].classList[action].forEach(cls => el.classList[action](cls));
                    });
                }
            }
        });

        // Отображение результата
        if (intentionMode === 'color' && intentionResultDisplay) {
            const colorBlock = document.createElement('div');
            colorBlock.style.backgroundColor = intentionCurrentResult || 'gray';
            colorBlock.style.width = '100px';
            colorBlock.style.height = '100px';
            intentionResultDisplay.appendChild(colorBlock);
        } else if (intentionResultDisplay) {
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('width', '100');
            svg.setAttribute('height', '100');
            if (intentionCurrentResult === 'circle') {
                const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circle.setAttribute('cx', '50');
                circle.setAttribute('cy', '50');
                circle.setAttribute('r', '40');
                svg.appendChild(circle);
            } else {
                const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                polygon.setAttribute('points', '50,10 90,90 10,90');
                svg.appendChild(polygon);
            }
            intentionResultDisplay.appendChild(svg);
        }

        if (intentionDisplay) intentionDisplay.insertAdjacentElement('afterend', feedbackButtons);

        // Обработчики кнопок "Угадал" и "Не угадал"
        successBtn.addEventListener('click', () => {
            if (!isProcessingIntention) return;
            isProcessingIntention = false;
            const guessTimeMs = Date.now();
            const timeDiffMs = intentionAttemptStartTime ? (guessTimeMs - intentionAttemptStartTime) : 0;
            const timeToGuess = timeDiffMs ? Math.max(0.1, Number((timeDiffMs / 1000).toFixed(1))) : 0.1;
            intentionAttemptStartTime = guessTimeMs;
            intentionStats.successes++;
            intentionGuessSequence.push(1);
            intentionAttempts.push({ time: timeToGuess, result: 1 });
            saveIntentionAttempts();
            updateIntentionStatsDisplay();
            sendGtagEvent('intention_guess', {
                event_category: 'Game',
                event_label: 'Intention Guess',
                value: 'success',
                guess_result: 1,
                mode: intentionMode,
                result: intentionCurrentResult,
                time_to_guess: timeToGuess,
                attempt_number: intentionStats.attempts
            });
            if (ENABLE_LOGGING) {
                const totalTime = ((Date.now() - gameStartTime) / 1000).toFixed(1);
                console.log(`Intention guess: Success, result: ${intentionCurrentResult}, time_to_guess: ${timeToGuess}s, sequence: [${intentionGuessSequence.join(', ')}], total game time: ${totalTime}s, subsession_id: ${intentionSubsessionId}`);
                console.log('Intention attempts:', intentionAttempts);
            }
            cleanupAndRestartIntention();
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
            intentionAttempts.push({ time: timeToGuess, result: 0 });
            saveIntentionAttempts();
            updateIntentionStatsDisplay();
            sendGtagEvent('intention_guess', {
                event_category: 'Game',
                event_label: 'Intention Guess',
                value: 'failure',
                guess_result: 0,
                mode: intentionMode,
                result: intentionCurrentResult,
                time_to_guess: timeToGuess,
                attempt_number: intentionStats.attempts
            });
            if (ENABLE_LOGGING) {
                const totalTime = ((Date.now() - gameStartTime) / 1000).toFixed(1);
                console.log(`Intention guess: Failure, result: ${intentionCurrentResult}, time_to_guess: ${timeToGuess}s, sequence: [${intentionGuessSequence.join(', ')}], total game time: ${totalTime}s, subsession_id: ${intentionSubsessionId}`);
                console.log('Intention attempts:', intentionAttempts);
            }
            cleanupAndRestartIntention();
        });

        // Таймаут
        const timeout = setTimeout(() => {
            if (!isProcessingIntention) return;
            isProcessingIntention = false;
            const guessTimeMs = Date.now();
            const timeDiffMs = intentionAttemptStartTime ? (guessTimeMs - intentionAttemptStartTime) : 0;
            const timeToGuess = timeDiffMs ? Math.max(0.1, Number((timeDiffMs / 1000).toFixed(1))) : 0.1;
            intentionStats.failures++;
            intentionGuessSequence.push(0);
            intentionAttempts.push({ time: timeToGuess, result: 0 });
            saveIntentionAttempts();
            updateIntentionStatsDisplay();
            sendGtagEvent('intention_timeout', {
                event_category: 'Game',
                event_label: 'Intention Timeout',
                mode: intentionMode,
                result: intentionCurrentResult,
                time_to_guess: timeToGuess,
                attempt_number: intentionStats.attempts
            });
            if (ENABLE_LOGGING) {
                const totalTime = ((Date.now() - gameStartTime) / 1000).toFixed(1);
                console.log(`Intention attempt timed out, time_to_guess: ${timeToGuess}s, sequence: [${intentionGuessSequence.join(', ')}], total game time: ${totalTime}s, subsession_id: ${intentionSubsessionId}`);
                console.log('Intention attempts:', intentionAttempts);
            }
            cleanupAndRestartIntention();
        }, 60000);

        // Очистка и перезапуск
        function cleanupAndRestartIntention() {
            clearTimeout(timeout);
            feedbackButtons.remove();
            if (intentionResultDisplay) intentionResultDisplay.classList.add('hidden');
            if (intentionDisplay) intentionDisplay.style.backgroundColor = 'black';
            if (intentionResultDisplay) intentionResultDisplay.style.backgroundColor = 'white';
            if (intentionShowBtn) intentionShowBtn.classList.remove('hidden');
            isProcessingIntention = false;

            // Проверка на завершение подгруппы
            if (intentionAttemptsMode === 'limited' && intentionStats.attempts >= intentionMaxAttempts) {
                sendGtagEvent('intention_session_summary', {
                    event_category: 'Game',
                    event_label: 'Intention',
                    attempts: intentionStats.attempts,
                    successes: intentionStats.successes,
                    failures: intentionStats.failures,
                    mode: intentionMode,
                    attempts_mode: intentionAttemptsMode,
                    session_duration_seconds: parseFloat(((Date.now() - gameStartTime) / 1000).toFixed(1))
                });
                if (intentionShowBtn) {
                    intentionShowBtn.disabled = true;
                    if (ENABLE_LOGGING) console.log('intentionShowBtn disabled');
                }
                if (intentionNewGameBtn) {
                    intentionNewGameBtn.classList.remove('hidden');
                    if (ENABLE_LOGGING) console.log('intentionNewGameBtn shown');
                }
                // НЕ вызываем startIntentionGame
            } else {
                if (intentionAttemptsMode === 'unlimited' && intentionStats.attempts % intentionMaxAttempts === 0) {
                    sendGtagEvent('intention_session_summary', {
                        event_category: 'Game',
                        event_label: 'Intention',
                        attempts: intentionStats.attempts,
                        successes: intentionStats.successes,
                        failures: intentionStats.failures,
                        mode: intentionMode,
                        attempts_mode: intentionAttemptsMode,
                        session_duration_seconds: parseFloat(((Date.now() - gameStartTime) / 1000).toFixed(1))
                    });
                    intentionSubsessionCounter++;
                    intentionSubsessionId = `${sessionId}_${intentionSubsessionCounter}`;
                    intentionStats = { attempts: 0, successes: 0, failures: 0 };
                    resetIntentionGame();
                    if (ENABLE_LOGGING) console.log(`New subsession created: ${intentionSubsessionId}`);
                }
                startIntentionGame();
            }
        }
    }, randomDelay);
}

// Перемешивание Виденье
function shuffleVision() {
    const now = Date.now();
    const timeSinceLast = now - lastShuffleVisionTime;
    if (isProcessingVision || timeSinceLast < VISION_SHUFFLE_THROTTLE_MS) {
        if (ENABLE_LOGGING) {
            console.warn('shuffleVision throttled or invalid state:', {
                timeSinceLast,
                isProcessing: isProcessingVision
            });
        }
        return;
    }
    lastShuffleVisionTime = now;
    isProcessingVision = true;
    visionAttemptStartTime = Date.now();

    if (visionShuffleBtn) visionShuffleBtn.classList.add('hidden');
    if (visionDisplay) visionDisplay.classList.add('processing');
    if (visionResultDisplay) visionResultDisplay.classList.add('hidden');

    visionCurrentResult = visionMode === 'color'
        ? ['red', 'blue'][Math.floor(Math.random() * 2)]
        : ['circle', 'triangle'][Math.floor(Math.random() * 2)];

    let shuffleCount = 0;
    visionShuffleInterval = setInterval(() => {
        shuffleCount++;
        const tempResult = visionMode === 'color'
            ? ['red', 'blue'][Math.floor(Math.random() * 2)]
            : ['circle', 'triangle'][Math.floor(Math.random() * 2)];
        if (ENABLE_LOGGING) console.log(`Shuffling vision (count: ${shuffleCount}), temp result: ${tempResult}`);
    }, VISION_SHUFFLE_MIN_INTERVAL);

    setTimeout(() => {
        clearInterval(visionShuffleInterval);
        visionShuffleInterval = null;
        if (visionDisplay) visionDisplay.classList.remove('processing');
        if (visionResultDisplay) {
            visionResultDisplay.innerHTML = '';
            visionResultDisplay.style.display = 'flex';
            visionResultDisplay.classList.remove('hidden');
        }

        if (visionMode === 'color' && visionResultDisplay) {
            const colorBlock = document.createElement('div');
            colorBlock.style.backgroundColor = visionCurrentResult || 'gray';
            colorBlock.style.width = '100px';
            colorBlock.style.height = '100px';
            visionResultDisplay.appendChild(colorBlock);
        } else if (visionResultDisplay) {
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('width', '100');
            svg.setAttribute('height', '100');
            if (visionCurrentResult === 'circle') {
                const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circle.setAttribute('cx', '50');
                circle.setAttribute('cy', '50');
                circle.setAttribute('r', '40');
                svg.appendChild(circle);
            } else {
                const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                polygon.setAttribute('points', '50,10 90,90 10,90');
                svg.appendChild(polygon);
            }
            visionResultDisplay.appendChild(svg);
        }

        sendGtagEvent('vision_shuffle_complete', {
            event_category: 'Game',
            event_label: 'Vision Shuffle Complete',
            mode: visionMode,
            result: visionCurrentResult
        });

        if (ENABLE_LOGGING) console.log(`Vision shuffle completed, result: ${visionCurrentResult}, subsession_id: ${visionSubsessionId}`);
        isProcessingVision = false;
    }, VISION_SHUFFLE_DURATION_MS);

    sendGtagEvent('vision_shuffle_start', {
        event_category: 'Game',
        event_label: 'Vision Shuffle Start',
        mode: visionMode
    });
}

// Выбор в Виденье
function handleVisionChoice(choice) {
    if (isProcessingVision || !visionCurrentResult) return;
    isProcessingVision = true;
    const guessTimeMs = Date.now();
    const timeDiffMs = visionAttemptStartTime ? (guessTimeMs - visionAttemptStartTime) : 0;
    const timeToGuess = timeDiffMs ? Math.max(0.1, Number((timeDiffMs / 1000).toFixed(1))) : 0.1;
    visionStats.attempts++;
    const isSuccess = choice === visionCurrentResult;
    if (isSuccess) {
        visionStats.successes++;
        visionGuessSequence.push(1);
    } else {
        visionStats.failures++;
        visionGuessSequence.push(0);
    }
    visionAttempts.push({ time: timeToGuess, result: isSuccess ? 1 : 0 });
    saveVisionAttempts();
    updateVisionStatsDisplay();

    sendGtagEvent('vision_guess', {
        event_category: 'Game',
        event_label: 'Vision Guess',
        value: isSuccess ? 'success' : 'failure',
        guess_result: isSuccess ? 1 : 0,
        mode: visionMode,
        result: visionCurrentResult,
        guess: choice,
        time_to_guess: timeToGuess,
        attempt_number: visionStats.attempts
    });

    if (ENABLE_LOGGING) {
        const totalTime = ((Date.now() - gameStartTime) / 1000).toFixed(1);
        console.log(`Vision guess: ${isSuccess ? 'Success' : 'Failure'}, result: ${visionCurrentResult}, guess: ${choice}, time_to_guess: ${timeToGuess}s, sequence: [${visionGuessSequence.join(', ')}], total game time: ${totalTime}s, subsession_id: ${visionSubsessionId}`);
        console.log('Vision attempts:', visionAttempts);
    }

    if (visionAttemptsMode === 'limited' && visionStats.attempts >= visionMaxAttempts) {
        sendGtagEvent('vision_session_summary', {
            event_category: 'Game',
            event_label: 'Vision',
            attempts: visionStats.attempts,
            successes: visionStats.successes,
            failures: visionStats.failures,
            mode: visionMode,
            attempts_mode: visionAttemptsMode,
            session_duration_seconds: parseFloat(((Date.now() - gameStartTime) / 1000).toFixed(1))
        });
        if (visionShuffleBtn) {
            visionShuffleBtn.disabled = true;
            if (ENABLE_LOGGING) console.log('visionShuffleBtn disabled');
        }
        if (visionNewGameBtn) {
            visionNewGameBtn.classList.remove('hidden');
            if (ENABLE_LOGGING) console.log('visionNewGameBtn shown');
        }
    } else {
        if (visionAttemptsMode === 'unlimited' && visionStats.attempts % visionMaxAttempts === 0) {
            sendGtagEvent('vision_session_summary', {
                event_category: 'Game',
                event_label: 'Vision',
                attempts: visionStats.attempts,
                successes: visionStats.successes,
                failures: visionStats.failures,
                mode: visionMode,
                attempts_mode: visionAttemptsMode,
                session_duration_seconds: parseFloat(((Date.now() - gameStartTime) / 1000).toFixed(1))
            });
            visionSubsessionCounter++;
            visionSubsessionId = `${sessionId}_${visionSubsessionCounter}`;
            visionStats = { attempts: 0, successes: 0, failures: 0 };
            resetVisionGame();
            if (ENABLE_LOGGING) console.log(`New subsession created: ${visionSubsessionId}`);
        }
        if (visionShuffleBtn) visionShuffleBtn.classList.remove('hidden');
        if (visionResultDisplay) visionResultDisplay.classList.add('hidden');
        isProcessingVision = false;
    }
}

// Переключение экранов
function showScreen(screenId) {
    document.querySelectorAll('.game-screen').forEach(screen => {
        screen.classList.add('hidden');
    });
    document.getElementById(screenId).classList.remove('hidden');
    if (ENABLE_LOGGING) console.log(`Showing screen: ${screenId}`);
}

// Отправка сводки сессии
function sendSessionSummary() {
    if (!gameStartTime || currentGameMode === 'menu') {
        if (ENABLE_LOGGING) console.log('sendSessionSummary skipped:', { gameStartTime, currentGameMode });
        return;
    }
    const sessionDuration = parseFloat(((Date.now() - gameStartTime) / 1000).toFixed(1));
    if (currentGameMode === 'intention') {
        sendGtagEvent('intention_session_summary', {
            event_category: 'Game',
            event_label: 'Intention',
            attempts: intentionStats.attempts,
            successes: intentionStats.successes,
            failures: intentionStats.failures,
            mode: intentionMode,
            attempts_mode: intentionAttemptsMode,
            session_duration_seconds: sessionDuration
        });
    } else if (currentGameMode === 'vision') {
        sendGtagEvent('vision_session_summary', {
            event_category: 'Game',
            event_label: 'Vision',
            attempts: visionStats.attempts,
            successes: visionStats.successes,
            failures: visionStats.failures,
            mode: visionMode,
            attempts_mode: visionAttemptsMode,
            session_duration_seconds: sessionDuration
        });
    }
}

// Инициализация обработчиков
document.addEventListener('DOMContentLoaded', () => {
    // Запуск приложения
    sendGtagEvent('app_launch', {
        event_category: 'App',
        event_label: 'Mini App Started (No User)',
        start_param: 'none'
    });

    // Намеренье: выбор режима
    document.querySelectorAll('input[name="intention-mode"]').forEach(input => {
        input.addEventListener('change', () => {
            intentionMode = input.value;
            if (ENABLE_LOGGING) console.log(`intentionMode set to: ${intentionMode}`);
        });
    });

    // Намеренье: выбор количества попыток
    document.querySelectorAll('input[name="intention-attempts-mode"]').forEach(input => {
        input.addEventListener('change', () => {
            intentionAttemptsMode = input.value;
            if (ENABLE_LOGGING) console.log(`intentionAttemptsMode set to: ${intentionAttemptsMode}`);
            updateIntentionStatsDisplay();
        });
    });

    // Виденье: выбор режима
    document.querySelectorAll('input[name="vision-mode"]').forEach(input => {
        input.addEventListener('change', () => {
            visionMode = input.value;
            if (ENABLE_LOGGING) console.log(`visionMode set to: ${visionMode}`);
            document.querySelectorAll('.choice-btn').forEach(btn => {
                btn.classList.add('hidden');
            });
            if (visionMode === 'color') {
                document.querySelectorAll('.color-btn').forEach(btn => btn.classList.remove('hidden'));
            } else {
                document.querySelectorAll('.shape-btn').forEach(btn => btn.classList.remove('hidden'));
            }
        });
    });

    // Виденье: выбор количества попыток
    document.querySelectorAll('input[name="vision-attempts-mode"]').forEach(input => {
        input.addEventListener('change', () => {
            visionAttemptsMode = input.value;
            if (ENABLE_LOGGING) console.log(`visionAttemptsMode set to: ${visionAttemptsMode}`);
            updateVisionStatsDisplay();
        });
    });

    // Запуск Намеренье
    document.getElementById('btn-start-intention').addEventListener('click', () => {
        currentGameMode = 'intention';
        showScreen('game-intention');
        resetIntentionGame();
        startIntentionGame();
        sendGtagEvent('game_select', {
            event_category: 'Game',
            event_label: 'Intention',
            game_mode: intentionMode
        });
    });

    // Запуск Виденье
    document.getElementById('btn-start-vision').addEventListener('click', () => {
        currentGameMode = 'vision';
        showScreen('game-vision');
        resetVisionGame();
        startVisionGame();
        sendGtagEvent('game_select', {
            event_category: 'Game',
            event_label: 'Vision',
            game_mode: visionMode
        });
    });

    // Показать/скрыть описание
    document.getElementById('btn-read-more').addEventListener('click', () => {
        readMoreArea.classList.toggle('hidden');
    });
    document.getElementById('btn-close-read-more').addEventListener('click', () => {
        readMoreArea.classList.add('hidden');
    });

    // Намеренье: показать результат
    if (intentionShowBtn) {
        intentionShowBtn.addEventListener('click', showIntentionResult);
    }

    // Намеренье: новая игра
    if (intentionNewGameBtn) {
        intentionNewGameBtn.addEventListener('click', () => {
            if (ENABLE_LOGGING) console.log('New game button clicked, resetting game');
            resetIntentionGame();
            intentionSubsessionCounter++;
            intentionSubsessionId = `${sessionId}_${intentionSubsessionCounter}`;
            intentionStats = { attempts: 0, successes: 0, failures: 0 };
            updateIntentionStatsDisplay();
            if (intentionShowBtn) {
                intentionShowBtn.disabled = false;
                if (ENABLE_LOGGING) console.log('intentionShowBtn enabled');
            }
            if (intentionNewGameBtn) {
                intentionNewGameBtn.classList.add('hidden');
                if (ENABLE_LOGGING) console.log('intentionNewGameBtn hidden');
            }
            startIntentionGame();
        });
    }

    // Виденье: перемешивание
    if (visionShuffleBtn) {
        visionShuffleBtn.addEventListener('click', shuffleVision);
    }

    // Виденье: выбор результата
    if (visionChoices) {
        visionChoices.addEventListener('click', (e) => {
            const choiceBtn = e.target.closest('.choice-btn');
            if (choiceBtn && !isProcessingVision) {
                const choice = choiceBtn.dataset.choice;
                handleVisionChoice(choice);
            }
        });
    }

    // Виденье: новая игра
    if (visionNewGameBtn) {
        visionNewGameBtn.addEventListener('click', () => {
            if (ENABLE_LOGGING) console.log('New vision game button clicked, resetting game');
            resetVisionGame();
            visionSubsessionCounter++;
            visionSubsessionId = `${sessionId}_${visionSubsessionCounter}`;
            visionStats = { attempts: 0, successes: 0, failures: 0 };
            updateVisionStatsDisplay();
            if (visionShuffleBtn) {
                visionShuffleBtn.disabled = false;
                if (ENABLE_LOGGING) console.log('visionShuffleBtn enabled');
            }
            if (visionNewGameBtn) {
                visionNewGameBtn.classList.add('hidden');
                if (ENABLE_LOGGING) console.log('visionNewGameBtn hidden');
            }
            startVisionGame();
        });
    }

    // Возврат в меню
    document.querySelectorAll('.back-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentGameMode = 'menu';
            showScreen('menu-screen');
            sendGtagEvent('game_exit', {
                event_category: 'Game',
                event_label: currentGameMode === 'intention' ? 'Intention' : 'Vision',
                game_mode: currentGameMode === 'intention' ? intentionMode : visionMode,
                session_duration_seconds: parseFloat(((Date.now() - gameStartTime) / 1000).toFixed(1))
            });
            if (ENABLE_LOGGING) {
                const totalTime = ((Date.now() - gameStartTime) / 1000).toFixed(1);
                console.log(`Returning to menu, total game time: ${totalTime}s`);
                console.log(`Intention guess sequence: [${intentionGuessSequence.join(', ')}]`);
                console.log(`Vision guess sequence: [${visionGuessSequence.join(', ')}]`);
            }
            gameStartTime = null;
        });
    });
});
