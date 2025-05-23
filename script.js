// Logging settings
const ENABLE_LOGGING = true;

// Constants for Vision game timing
const SHUFFLE_BUTTON_DISABLE_TIME = 1500;
const RANDOM_RESULT_MIN_TIME = 800;
const RANDOM_RESULT_MAX_TIME = 1450;

// Constants for Intention game randomization
const INTENTION_RANDOMIZER_MIN_INTERVAL = 30;
const INTENTION_RANDOMIZER_MAX_INTERVAL = 100;
const INTENTION_FIXATION_DELAY_MIN = 0;
const INTENTION_FIXATION_DELAY_MAX = 500;
const SHOW_INTENTION_THROTTLE_MS = 500;

// Объект с переводами
const translations = {
    ru: {
        greeting: 'Порепетируем, {name}',
        title: 'Намеренье или Виденье',
        playIntention: 'Играть в Намеренье',
        playVision: 'Играть в Виденье',
        readMore: 'Прочти',
        intentionTitle: 'Намеренье',
        visionTitle: 'Виденье',
        newGame: 'Новая игра',
        showResult: 'Показать',
        shuffle: 'Перемешать',
        back: 'На сейчас достаточно',
        readMoreTitle: 'Отличие Намеренья и Виденья',
        readMoreText1: 'В игре «Виденье» за черным экраном находится объект. Сначала перемешайте объекты, нажав на черный экран. Через три секунды перемешивание останавливается. Задача — в воображении увидеть, что скрыто за ширмой, и нажать соответствующую кнопку. Перед выбором обязательно перемешивайте объекты.',
        readMoreText2: 'В игре «Намеренье» за черным экраном происходит циклический перебор объектов. Задача — в воображении зафиксировать объект и нажать на черный экран или кнопку «Показать». В этот момент цикл останавливается. Показанный объект может совпасть с вашим внутренним взором.',
        closeReadMore: 'Закрыть',
        themeToggle: 'День/Ночь',
        success: 'Угадал',
        failure: 'Не угадал',
        color: 'Цвет',
        shape: 'Фигура',
        limited: '10 попыток',
        unlimited: 'Безлимит',
        statsAttempts: 'Попытки',
        statsSuccesses: 'Успехи',
        statsFailures: 'Неудачи',
        statsSuccessRate: 'Процент успеха',
        statsAvgTime: 'Среднее время',
        visionSuccess: 'Успех!',
        visionFailure: 'Попробуй ещё!'
    },
    uk: {
        greeting: 'Порепетируємо, {name}',
        title: 'Намір чи Бачення',
        playIntention: 'Грати в Намір',
        playVision: 'Грати в Бачення',
        readMore: 'Прочитай',
        intentionTitle: 'Намір',
        visionTitle: 'Бачення',
        newGame: 'Нова гра',
        showResult: 'Показати',
        shuffle: 'Перемішати',
        back: 'Наразі досить',
        readMoreTitle: 'Відмінність Наміру та Бачення',
        readMoreText1: 'У грі «Бачення» за чорним екраном знаходиться об’єкт. Спочатку перемішайте об’єкти, натиснувши на чорний екран. Через три секунди перемішування зупиняється. Завдання — уявити, що приховано за ширмою, і натиснути відповідну кнопку. Перед вибором обов’язково перемішуйте об’єкти.',
        readMoreText2: 'У грі «Намір» за чорним екраном відбувається циклічний перегляд об’єктів. Завдання — уявити об’єкт і натиснути на чорний екран або кнопку «Показати». У цей момент цикл зупиняється. Показаний об’єкт може збігтися з вашим внутрішнім баченням.',
        closeReadMore: 'Закрити',
        themeToggle: 'День/Ніч',
        success: 'Вгадав',
        failure: 'Не вгадав',
        color: 'Колір',
        shape: 'Фігура',
        limited: '10 спроб',
        unlimited: 'Безліміт',
        statsAttempts: 'Спроби',
        statsSuccesses: 'Успіхи',
        statsFailures: 'Невдачі',
        statsSuccessRate: 'Відсоток успіху',
        statsAvgTime: 'Середній час',
        visionSuccess: 'Успіх!',
        visionFailure: 'Спробуй ще!'
    },
    en: {
        greeting: 'Let\'s practice, {name}',
        title: 'Intention or Vision',
        playIntention: 'Play Intention',
        playVision: 'Play Vision',
        readMore: 'Read More',
        intentionTitle: 'Intention',
        visionTitle: 'Vision',
        newGame: 'New Game',
        showResult: 'Show',
        shuffle: 'Shuffle',
        back: 'Enough for Now',
        readMoreTitle: 'Difference Between Intention and Vision',
        readMoreText1: 'In the "Vision" game, an object is hidden behind a black screen. First, shuffle the objects by clicking the black screen. After three seconds, the shuffling stops. Your task is to imagine what is hidden behind the screen and press the corresponding button. You must shuffle the objects before making a choice.',
        readMoreText2: 'In the "Intention" game, objects are cycled behind a black screen. Your task is to mentally fixate on an object and click the black screen or the "Show" button. At that moment, the cycle stops. The revealed object may match your mental image.',
        closeReadMore: 'Close',
        themeToggle: 'Day/Night',
        success: 'Guessed',
        failure: 'Not Guessed',
        color: 'Color',
        shape: 'Shape',
        limited: '10 Attempts',
        unlimited: 'Unlimited',
        statsAttempts: 'Attempts',
        statsSuccesses: 'Successes',
        statsFailures: 'Failures',
        statsSuccessRate: 'Success Rate',
        statsAvgTime: 'Average Time',
        visionSuccess: 'Success!',
        visionFailure: 'Try Again!'
    },
    es: {
        greeting: 'Practiquemos, {name}',
        title: 'Intención o Visión',
        playIntention: 'Jugar a Intención',
        playVision: 'Jugar a Visión',
        readMore: 'Leer Más',
        intentionTitle: 'Intención',
        visionTitle: 'Visión',
        newGame: 'Nuevo Juego',
        showResult: 'Mostrar',
        shuffle: 'Mezclar',
        back: 'Suficiente por Ahora',
        readMoreTitle: 'Diferencia entre Intención y Visión',
        readMoreText1: 'En el juego "Visión", un objeto está oculto detrás de una pantalla negra. Primero, mezcla los objetos haciendo clic en la pantalla negra. Después de tres segundos, la mezcla se detiene. Tu tarea es imaginar qué está oculto detrás de la pantalla y presionar el botón correspondiente. Debes mezclar los objetos antes de elegir.',
        readMoreText2: 'En el juego "Intención", los objetos se ciclan detrás de una pantalla negra. Tu tarea es fijar mentalmente un objeto y hacer clic en la pantalla negra o en el botón "Mostrar". En ese momento, el ciclo se detiene. El objeto revelado puede coincidir con tu imagen mental.',
        closeReadMore: 'Cerrar',
        themeToggle: 'Día/Noche',
        success: 'Adivinado',
        failure: 'No Adivinado',
        color: 'Color',
        shape: 'Forma',
        limited: '10 Intentos',
        unlimited: 'Ilimitado',
        statsAttempts: 'Intentos',
        statsSuccesses: 'Éxitos',
        statsFailures: 'Fracasos',
        statsSuccessRate: 'Tasa de Éxito',
        statsAvgTime: 'Tiempo Promedio',
        visionSuccess: '¡Éxito!',
        visionFailure: '¡Intenta de Nuevo!'
    },
    alien: {
        greeting: '⊸◈ {name}',
        title: '△◈▷',
        playIntention: '⊸◉',
        playVision: '⊸◬',
        readMore: '◇',
        intentionTitle: '◉',
        visionTitle: '◬',
        newGame: '↺',
        showResult: '◉',
        shuffle: '↻',
        back: '⟿',
        readMoreTitle: '◉◬',
        readMoreText1: '◬⊸|▥|⊹|↻▥→3⊸→⊹|⊹|◈▥→⊸|⊹|↻',
        readMoreText2: '◉⊸|↺▥|⊹|◈⊸→▥/◉|⊹|⊹↺|⊹|▥=◈',
        closeReadMore: '⊷',
        themeToggle: '◍◌',
        success: '⊸',
        failure: '⊹',
        color: '◼|⊹',
        shape: '◻|⊹',
        limited: '⊸⊸|⊹',
        unlimited: '↺|⊹',
        statsAttempts: '↺|⊹',
        statsSuccesses: '⊸',
        statsFailures: '⊹',
        statsSuccessRate: '%⊸',
        statsAvgTime: '⊸⊹',
        visionSuccess: '⊸◬',
        visionFailure: '↺◬'
    }
};

// Текущий язык (по умолчанию украинский)
let currentLanguage = 'uk';

// Функция для обновления текста на странице
function updateLanguage() {
    const t = translations[currentLanguage] || translations['uk']; // Fallback на украинский
    const userName = telegramUser ? telegramUser.first_name || 'Игрок' : 'Игрок';

    // Обновление приветствия
    const greetingElement = document.getElementById('user-greeting');
    if (greetingElement && t.greeting) {
        greetingElement.innerHTML = t.greeting.replace('{name}', `<span id="telegram-user-name">${userName}</span>👁`);
    } else {
        console.warn('Greeting element or translation missing for language:', currentLanguage);
    }

    // Обновление заголовка
    const titleElement = document.querySelector('#menu-screen h1');
    if (titleElement && t.title) {
        titleElement.textContent = t.title;
    } else {
        console.warn('Title element or translation missing for language:', currentLanguage);
    }

    // Обновление кнопки "Играть в Намеренье"
    const btnStartIntention = document.getElementById('btn-start-intention');
    if (btnStartIntention && t.playIntention) {
        btnStartIntention.textContent = t.playIntention;
        btnStartIntention.setAttribute('aria-label', t.playIntention);
    } else {
        console.warn('btn-start-intention element or translation missing for language:', currentLanguage);
    }

    // Обновление кнопки "Играть в Виденье"
    const btnStartVision = document.getElementById('btn-start-vision');
    if (btnStartVision && t.playVision) {
        btnStartVision.textContent = t.playVision;
        btnStartVision.setAttribute('aria-label', t.playVision);
    } else {
        console.warn('btn-start-vision element or translation missing for language:', currentLanguage);
    }

    // Обновление кнопки "Прочти"
    const btnReadMore = document.getElementById('btn-read-more');
    if (btnReadMore && t.readMore) {
        btnReadMore.textContent = t.readMore;
        btnReadMore.setAttribute('aria-label', t.readMore);
    } else {
        console.warn('btn-read-more element or translation missing for language:', currentLanguage);
    }

    // Обновление заголовков игр
    const intentionTitleElement = document.getElementById('game-intention')?.querySelector('h2');
    if (intentionTitleElement && t.intentionTitle) {
        intentionTitleElement.textContent = t.intentionTitle;
    }

    const visionTitleElement = document.getElementById('game-vision')?.querySelector('h2');
    if (visionTitleElement && t.visionTitle) {
        visionTitleElement.textContent = t.visionTitle;
    }

    // Обновление кнопок "Новая игра"
    const intentionNewGameBtn = document.getElementById('intention-new-game-btn');
    if (intentionNewGameBtn && t.newGame) {
        intentionNewGameBtn.textContent = t.newGame;
        intentionNewGameBtn.setAttribute('aria-label', `${t.newGame} Намір`);
    }

    const visionNewGameBtn = document.getElementById('vision-new-game-btn');
    if (visionNewGameBtn && t.newGame) {
        visionNewGameBtn.textContent = t.newGame;
        visionNewGameBtn.setAttribute('aria-label', `${t.newGame} Бачення`);
    }

    // Обновление кнопки "Показать" для Intention
    const intentionShowBtn = document.getElementById('intention-show-btn');
    if (intentionShowBtn && t.showResult) {
        intentionShowBtn.textContent = t.showResult;
        intentionShowBtn.setAttribute('aria-label', t.showResult);
    }

    // Обновление кнопки "Перемешать" для Vision
    const visionShuffleBtn = document.getElementById('vision-shuffle-btn');
    if (visionShuffleBtn && t.shuffle) {
        visionShuffleBtn.textContent = t.shuffle;
        visionShuffleBtn.setAttribute('aria-label', t.shuffle);
    }

    // Обновление кнопок "Назад"
    document.querySelectorAll('.back-btn').forEach(btn => {
        if (t.back) {
            btn.textContent = t.back;
            btn.setAttribute('aria-label', t.back);
        }
    });

    // Обновление области "Прочти"
    const readMoreArea = document.getElementById('read-more-area');
    if (readMoreArea && t.readMoreTitle && t.readMoreText1 && t.readMoreText2) {
        readMoreArea.querySelector('h3').textContent = t.readMoreTitle;
        readMoreArea.querySelectorAll('p')[0].textContent = t.readMoreText1;
        readMoreArea.querySelectorAll('p')[1].textContent = t.readMoreText2;
    }

    // Обновление кнопки "Закрыть" для области "Прочти"
    const btnCloseReadMore = document.getElementById('btn-close-read-more');
    if (btnCloseReadMore && t.closeReadMore) {
        btnCloseReadMore.textContent = t.closeReadMore;
        btnCloseReadMore.setAttribute('aria-label', t.closeReadMore);
    }

    // Обновление кнопки переключения темы
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    if (themeToggleBtn && t.themeToggle) {
        themeToggleBtn.querySelector('span').textContent = document.body.classList.contains('light-theme') ? '☀️' : '🌙';
        themeToggleBtn.childNodes[2].textContent = t.themeToggle;
        themeToggleBtn.setAttribute('aria-label', t.themeToggle);
    }

    // Обновление меток для режимов
    const intentionColorLabel = document.querySelector('label[for="intention-mode-color"]');
    if (intentionColorLabel && t.color) {
        intentionColorLabel.childNodes[1].textContent = t.color;
    }

    const intentionShapeLabel = document.querySelector('label[for="intention-mode-shape"]');
    if (intentionShapeLabel && t.shape) {
        intentionShapeLabel.childNodes[1].textContent = t.shape;
    }

    const visionColorLabel = document.querySelector('label[for="vision-mode-color"]');
    if (visionColorLabel && t.color) {
        visionColorLabel.childNodes[1].textContent = t.color;
    }

    const visionShapeLabel = document.querySelector('label[for="vision-mode-shape"]');
    if (visionShapeLabel && t.shape) {
        visionShapeLabel.childNodes[1].textContent = t.shape;
    }

    const intentionLimitedLabel = document.querySelector('label[for="intention-attempts-limited"]');
    if (intentionLimitedLabel && t.limited) {
        intentionLimitedLabel.childNodes[1].textContent = t.limited;
    }

    const intentionUnlimitedLabel = document.querySelector('label[for="intention-attempts-unlimited"]');
    if (intentionUnlimitedLabel && t.unlimited) {
        intentionUnlimitedLabel.childNodes[1].textContent = t.unlimited;
    }

    const visionLimitedLabel = document.querySelector('label[for="vision-attempts-limited"]');
    if (visionLimitedLabel && t.limited) {
        visionLimitedLabel.childNodes[1].textContent = t.limited;
    }

    const visionUnlimitedLabel = document.querySelector('label[for="vision-attempts-unlimited"]');
    if (visionUnlimitedLabel && t.unlimited) {
        visionUnlimitedLabel.childNodes[1].textContent = t.unlimited;
    }

    // Обновление статистики
    const intentionStats = document.querySelector('#intention-stats');
    if (intentionStats && t.statsAttempts && t.statsSuccesses && t.statsFailures && t.statsSuccessRate && t.statsAvgTime) {
        intentionStats.querySelector('p:nth-child(1)').childNodes[0].textContent = `${t.statsAttempts}: `;
        intentionStats.querySelector('p:nth-child(2)').childNodes[0].textContent = `${t.statsSuccesses}: `;
        intentionStats.querySelector('p:nth-child(3)').childNodes[0].textContent = `${t.statsFailures}: `;
        intentionStats.querySelector('p:nth-child(4)').childNodes[0].textContent = `${t.statsSuccessRate}: `;
        intentionStats.querySelector('p:nth-child(5)').childNodes[0].textContent = `${t.statsAvgTime}: `;
    }

    const visionStats = document.querySelector('#vision-stats');
    if (visionStats && t.statsAttempts && t.statsSuccesses && t.statsFailures && t.statsSuccessRate && t.statsAvgTime) {
        visionStats.querySelector('p:nth-child(1)').childNodes[0].textContent = `${t.statsAttempts}: `;
        visionStats.querySelector('p:nth-child(2)').childNodes[0].textContent = `${t.statsSuccesses}: `;
        visionStats.querySelector('p:nth-child(3)').childNodes[0].textContent = `${t.statsFailures}: `;
        visionStats.querySelector('p:nth-child(4)').childNodes[0].textContent = `${t.statsSuccessRate}: `;
        visionStats.querySelector('p:nth-child(5)').childNodes[0].textContent = `${t.statsAvgTime}: `;
    }

    // Обновление кнопок обратной связи
    feedbackButtonsTemplate.querySelectorAll('button')[0].textContent = t.success || 'Success';
    feedbackButtonsTemplate.querySelectorAll('button')[1].textContent = t.failure || 'Failure';

    // Обновление сообщения Vision
    const visionMessage = document.querySelector('#vision-result p');
    if (visionMessage && (visionMessage.textContent.includes('Успех') || visionMessage.textContent.includes('Успіх'))) {
        visionMessage.textContent = t.visionSuccess || 'Success!';
    } else if (visionMessage) {
        visionMessage.textContent = t.visionFailure || 'Try Again!';
    }

    // Обновление aria-label для кнопок выбора
    const colorBtnRed = document.querySelector('.color-btn[data-choice="red"]');
    if (colorBtnRed && t.color) {
        colorBtnRed.setAttribute('aria-label', `${t.color} Червоний`);
    }

    const colorBtnBlue = document.querySelector('.color-btn[data-choice="blue"]');
    if (colorBtnBlue && t.color) {
        colorBtnBlue.setAttribute('aria-label', `${t.color} Синій`);
    }

    const shapeBtnCircle = document.querySelector('.shape-btn[data-choice="circle"]');
    if (shapeBtnCircle && t.shape) {
        shapeBtnCircle.setAttribute('aria-label', `${t.shape} Коло`);
    }

    const shapeBtnTriangle = document.querySelector('.shape-btn[data-choice="triangle"]');
    if (shapeBtnTriangle && t.shape) {
        shapeBtnTriangle.setAttribute('aria-label', `${t.shape} Трикутник`);
    }

    // Управление классом alien-text
    if (readMoreArea) {
        if (currentLanguage === 'alien') {
            readMoreArea.classList.add('alien-text');
        } else {
            readMoreArea.classList.remove('alien-text');
        }
    }
}

// Initialize sessionId, userId, and subsessionId
window.sessionId = `${Date.now()}${Math.random().toString(36).slice(2)}`;
window.userId = 'anonymous_' + Math.random().toString(36).slice(2, 9);
window.currentSubsessionId = `${window.sessionId}_0`; // Initial subsession_id
let subsessionCounter = 0;

// Initialize variables
let telegramUser = null;
let currentGameMode = 'menu';
let gameStartTime = null;
let shuffleStartTime = null;
let intentionAttemptStartTime = null;
let choiceButtonsEnabledTime = null;
let sessionSummarySent = false;
let lastShowIntentionTime = 0;
let subsessionSequences = [];
const sentRandomizerStartEvents = new Set();

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
const intentionAttempts = [];

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
const visionAttempts = [];

// DOM elements
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
const intentionStatsSpanAvgTime = document.getElementById('intention-stats-avg-time');
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
const visionStatsSpanAvgTime = document.getElementById('stats-avg-time');
const visionModeRadios = document.querySelectorAll('input[name="vision-mode"]');
const visionAttemptsModeRadios = document.querySelectorAll('input[name="vision-attempts-mode"]');
const backButtons = document.querySelectorAll('.back-btn');
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const languageSelect = document.getElementById('language-select');

// Check critical DOM elements
if (!appDiv || !menuScreen || !gameIntention || !gameVision) {
    console.error('Critical DOM elements are missing. Check HTML for ids: app, menu-screen, game-intention, game-vision');
    throw new Error('Missing critical DOM elements');
}

// Cached DOM elements
const cachedElements = {
    colorBlock: document.createElement('div'),
    svgCircle: null,
    svgTriangle: null
};
cachedElements.colorBlock.style.width = '100%';
cachedElements.colorBlock.style.height = '100%';

// Feedback buttons template
const feedbackButtonsTemplate = document.createElement('div');
feedbackButtonsTemplate.className = 'feedback-buttons';
const successBtnTemplate = document.createElement('button');
successBtnTemplate.textContent = translations[currentLanguage].success;
successBtnTemplate.className = 'small-btn';
const failureBtnTemplate = document.createElement('button');
failureBtnTemplate.textContent = translations[currentLanguage].failure;
failureBtnTemplate.className = 'small-btn';
feedbackButtonsTemplate.appendChild(successBtnTemplate);
feedbackButtonsTemplate.appendChild(failureBtnTemplate);

// Centralized subsession_id generation
function generateSubsessionId() {
    subsessionCounter++;
    const newSubsessionId = `${window.sessionId}_${subsessionCounter}`;
    window.currentSubsessionId = newSubsessionId;
    logDebug(`Generated subsession_id: ${newSubsessionId}`);
    return newSubsessionId;
}

// Debug logging function
function logDebug(...args) {
    if (ENABLE_LOGGING) console.log(...args);
}

function isOnline() {
    return navigator.onLine;
}

function sendGtagEvent(eventName, params) {
    if (!eventName || !params) {
        console.error('Invalid eventName or params:', { eventName, params });
        return false;
    }
    const currentSubsessionId = window.currentSubsessionId || `temp_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
    const eventParams = {
        ...params,
        subsession_id: params.subsession_id || currentSubsessionId,
        session_id: window.sessionId,
        custom_user_id: telegramUser ? telegramUser.id : window.userId
    };
    if (!params.subsession_id && (eventName.includes('intention') || eventName === 'randomizer_start' || eventName === 'mode_change' || eventName === 'display_click' || eventName === 'game_select' || eventName === 'show_result' || eventName === 'game_exit')) {
        logDebug(`subsession_id was undefined for ${eventName}, used: ${eventParams.subsession_id}`);
    }
    if (!isOnline()) {
        logDebug(`No internet connection, saving ${eventName} to localStorage`);
        saveToLocalStorage(eventName, eventParams);
        return false;
    }
    try {
        gtag('event', eventName, eventParams);
        logDebug(`gtag ${eventName} sent:`, eventParams);
        return true;
    } catch (error) {
        console.error(`gtag ${eventName} failed:`, error);
        saveToLocalStorage(eventName, eventParams);
        return false;
    }
}

function saveToLocalStorage(eventName, params) {
    const key = eventName.includes('vision') ? 'visionStats' : 'intentionStats';
    const savedStats = JSON.parse(localStorage.getItem(key) || '[]');
    savedStats.push({
        eventName,
        params,
        sessionId: window.sessionId,
        timestamp: Date.now()
    });
    localStorage.setItem(key, JSON.stringify(savedStats));
    logDebug(`Saved ${eventName} to localStorage:`, params);
}

function saveAttempts(gameMode) {
    const key = gameMode === 'intention' ? 'intentionAttempts' : 'visionAttempts';
    const attempts = gameMode === 'intention' ? intentionAttempts : visionAttempts;
    localStorage.setItem(key, JSON.stringify(attempts));
    logDebug(`Saved ${gameMode} attempts to localStorage:`, attempts);
}

function saveSubsessionSequence() {
    if (intentionGuessSequence.length > 0) {
        subsessionSequences.push({
            subsessionId: window.currentSubsessionId,
            sequence: [...intentionGuessSequence],
            attempts: intentionStats.attempts,
            successes: intentionStats.successes,
            failures: intentionStats.failures
        });
        logDebug(`Saved subsession sequence:`, subsessionSequences[subsessionSequences.length - 1]);
    }
}

function sendSessionSummary() {
    if (!gameStartTime || currentGameMode === 'menu' || sessionSummarySent) {
        logDebug('sendSessionSummary skipped:', { gameStartTime, currentGameMode, sessionSummarySent });
        return;
    }
    if (currentGameMode === 'vision' && visionStats.attempts === 0) {
        logDebug('No vision attempts, skipping sendSessionSummary');
        return;
    }
    if (currentGameMode === 'intention' && intentionStats.attempts === 0) {
        logDebug('No intention attempts, skipping sendSessionSummary');
        return;
    }

    const duration = ((Date.now() - gameStartTime) / 1000).toFixed(1);
    const eventName = currentGameMode === 'vision' ? 'game_session_summary' : 'intention_session_summary';
    const eventLabel = currentGameMode === 'vision' ? 'Vision' : 'Intention';
    const stats = currentGameMode === 'vision' ? visionStats : intentionStats;
    const mode = currentGameMode === 'vision' ? visionMode : intentionMode;
    const guessSequence = currentGameMode === 'vision' ? visionGuessSequence : intentionGuessSequence;

    const eventParams = {
        event_category: 'Game',
        event_label: eventLabel,
        attempts: stats.attempts,
        successes: stats.successes,
        failures: stats.failures,
        mode: mode,
        session_duration_seconds: parseFloat(duration),
        session_start_time: Math.floor(gameStartTime),
        win_sequence: guessSequence.join(',') || 'none',
        subsession_id: window.currentSubsessionId
    };

    logDebug(`Sending ${eventName} with win_sequence: [${guessSequence.join(', ')}]`, eventParams);
    const success = sendGtagEvent(eventName, eventParams);
    if (success) {
        sessionSummarySent = true;
        if (currentGameMode === 'intention') {
            saveSubsessionSequence();
        }
        saveAttempts(currentGameMode);
    } else {
        logDebug('sendSessionSummary failed, saved to localStorage');
    }
}

function sendSavedStats() {
    ['visionStats', 'intentionStats'].forEach(key => {
        const savedStats = JSON.parse(localStorage.getItem(key) || '[]');
        if (savedStats.length === 0) return;
        logDebug(`Found ${savedStats.length} saved stats in ${key}`);
        savedStats.forEach(stat => {
            logDebug(`Sending saved ${stat.eventName}:`, stat.params);
            const success = sendGtagEvent(stat.eventName, stat.params);
            if (success) {
                logDebug(`Successfully sent saved ${stat.eventName}`);
            } else {
                logDebug(`Failed to send saved ${stat.eventName}, keeping in localStorage`);
            }
        });
        if (savedStats.every(stat => sendGtagEvent(stat.eventName, stat.params))) {
            localStorage.removeItem(key);
            logDebug(`Cleared ${key} from localStorage`);
        } else {
            logDebug(`Retaining ${key} in localStorage due to failed sends`);
        }
    });
}

function showScreen(screenId) {
    logDebug('Showing screen:', screenId, 'current subsessionId:', window.currentSubsessionId);
    const screens = document.querySelectorAll('.game-screen');
    screens.forEach(screen => screen.classList.add('hidden'));

    if (screenId !== 'game-intention') {
        stopIntentionGame();
    }
    stopVisionGame();

    if (screenId === 'menu-screen') {
        sendSessionSummary();
        if (menuScreen) menuScreen.classList.remove('hidden');
        currentGameMode = 'menu';
        gameStartTime = null;
        Telegram.WebApp.MainButton.hide();
        if (readMoreArea) readMoreArea.classList.add('hidden');
        if (btnReadMore) btnReadMore.classList.remove('hidden');
        if (ENABLE_LOGGING) {
            logDebug('Returned to menu');
            logDebug(`Intention subsession sequences:`, subsessionSequences);
            logDebug(`Vision guess sequence: [${visionGuessSequence.join(', ')}]`);
        }
    } else if (screenId === 'game-intention') {
        if (gameIntention) gameIntention.classList.remove('hidden');
        currentGameMode = 'intention';
        updateIntentionStatsDisplay();
        if (intentionNewGameBtn) intentionNewGameBtn.classList.add('hidden');
        if (intentionAttemptsModeDiv) intentionAttemptsModeDiv.classList.remove('hidden');
        Telegram.WebApp.MainButton.hide();
        if (intentionRandomizerInterval === null) {
            startIntentionGame('showScreen');
        } else {
            logDebug('Intention randomizer already active, skipping startIntentionGame');
        }
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
        generateSubsessionId();
    }
}

function getRandomResult(mode) {
    const randomValue = Math.random();
    logDebug(`getRandomResult: mode=${mode}, randomValue=${randomValue}`);
    if (mode === 'color') {
        return randomValue > 0.5 ? 'red' : 'blue';
    } else {
        return randomValue > 0.5 ? 'circle' : 'triangle';
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
    logDebug(`Resetting Intention game, current subsessionId: ${window.currentSubsessionId}`);
    if (intentionStats.attempts > 0 && !sessionSummarySent) {
        sendSessionSummary();
    }
    intentionStats.attempts = 0;
    intentionStats.successes = 0;
    intentionStats.failures = 0;
    intentionGuessSequence = [];
    intentionAttempts.length = 0;
    intentionAttemptStartTime = null;
    intentionRandomizerCount = 0;
    gameStartTime = null;
    generateSubsessionId();
    sentRandomizerStartEvents.clear();
    stopIntentionGame();
    startIntentionGame('resetIntentionGame');
    updateIntentionStatsDisplay();
    if (intentionShowBtn) intentionShowBtn.disabled = false;
    if (intentionNewGameBtn) intentionNewGameBtn.classList.add('hidden');
    if (intentionAttemptsModeDiv) intentionAttemptsModeDiv.classList.remove('hidden');
    sessionSummarySent = false;
    logDebug('Intention game reset, new subsession_id:', window.currentSubsessionId);
}

function resetVisionGame() {
    logDebug('Resetting Vision game');
    if (visionStats.attempts > 0 && !sessionSummarySent) {
        sendSessionSummary();
    }
    visionStats.attempts = 0;
    visionStats.successes = 0;
    visionStats.failures = 0;
    visionGuessSequence = [];
    visionAttempts.length = 0;
    stopVisionGame();
    generateSubsessionId();
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
    sessionSummarySent = false;
    logDebug('Vision game reset, new subsession_id:', window.currentSubsessionId);
}

function startIntentionGame(caller = 'unknown') {
    logDebug(`startIntentionGame called by: ${caller}`);
    if (intentionRandomizerInterval !== null) {
        logDebug('Intention randomizer already running, skipping start');
        return;
    }
    if (!window.currentSubsessionId || caller === 'resetIntentionGame' || caller === 'modeChange') {
        generateSubsessionId();
    }
    logDebug(`Starting intention game, mode: ${intentionMode} attempt_start_time: ${Date.now()} subsession_id: ${window.currentSubsessionId}`);
    intentionAttemptStartTime = Date.now();
    intentionRandomizerCount = 0;

    const INACTIVITY_TIMEOUT = 5 * 60 * 1000;
    let inactivityTimer = null;

    function updateRandomResult() {
        const randomInterval = INTENTION_RANDOMIZER_MIN_INTERVAL + Math.random() * (INTENTION_RANDOMIZER_MAX_INTERVAL - INTENTION_RANDOMIZER_MIN_INTERVAL);
        intentionRandomizerCount++;
        if (ENABLE_LOGGING && intentionRandomizerCount % 10 === 0) {
            logDebug(`Randomizer updated (count: ${intentionRandomizerCount}), next update in ${randomInterval.toFixed(2)}ms`);
        }
        intentionRandomizerInterval = setTimeout(updateRandomResult, randomInterval);
        if (inactivityTimer) clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
            logDebug('Inactivity timeout, stopping intention randomizer');
            stopIntentionGame();
        }, INACTIVITY_TIMEOUT);
    }

    updateRandomResult();

    sendGtagEvent('randomizer_start', {
        event_category: 'Game',
        event_label: 'Intention Randomizer',
        mode: intentionMode,
        subsession_id: window.currentSubsessionId
    });
    sentRandomizerStartEvents.add(window.currentSubsessionId);
    logDebug(`randomizer_start event sent for subsession_id: ${window.currentSubsessionId}`);

    if (intentionShowBtn) intentionShowBtn.classList.remove('hidden');
    if (intentionResultDisplay) intentionResultDisplay.classList.add('hidden');
    if (intentionDisplay) intentionDisplay.style.backgroundColor = 'black';
    if (intentionResultDisplay) {
        intentionResultDisplay.style.backgroundColor = 'white';
        intentionResultDisplay.style.display = 'flex';
        intentionResultDisplay.style.zIndex = '10';
    }
}

function stopIntentionGame() {
    logDebug(`Stopping Intention game, current subsessionId: ${window.currentSubsessionId}`);
    if (intentionRandomizerInterval !== null) {
        clearTimeout(intentionRandomizerInterval);
        intentionRandomizerInterval = null;
        logDebug('Intention randomizer stopped');
    }
    if (intentionShowBtn) intentionShowBtn.classList.remove('hidden');
    if (intentionResultDisplay) intentionResultDisplay.classList.add('hidden');
    if (intentionDisplay) intentionDisplay.style.backgroundColor = 'black';
    if (intentionResultDisplay) intentionResultDisplay.style.backgroundColor = 'white';
    intentionAttemptStartTime = null;
    intentionCurrentResult = null;
}

function showIntentionResult() {
    const now = Date.now();
    const timeSinceLast = now - lastShowIntentionTime;
    if (currentGameMode !== 'intention' || isProcessingIntention || timeSinceLast < SHOW_INTENTION_THROTTLE_MS) {
        logDebug('showIntentionResult throttled or invalid state:', {
            timeSinceLast,
            gameMode: currentGameMode,
            currentResult: intentionCurrentResult,
            isProcessing: isProcessingIntention
        });
        return;
    }
    lastShowIntentionTime = now;
    isProcessingIntention = true;
    const randomDelay = INTENTION_FIXATION_DELAY_MIN + Math.random() * (INTENTION_FIXATION_DELAY_MAX - INTENTION_RANDOMIZER_MIN_INTERVAL);
    logDebug(`Fixation delay: ${randomDelay.toFixed(2)}ms`);

    setTimeout(() => {
        requestAnimationFrame(() => {
            intentionCurrentResult = getRandomResult(intentionMode);
            logDebug('Showing intention result, mode:', intentionMode, 'result:', intentionCurrentResult, 'subsession_id:', window.currentSubsessionId);
            logDebug(`Intention result displayed at: ${Date.now()}`);
            intentionStats.attempts++;
            if (intentionStats.attempts === 1 && intentionAttemptsModeDiv) {
                intentionAttemptsModeDiv.classList.add('hidden');
            }
            updateIntentionStatsDisplay();

            sendGtagEvent('show_result', {
                event_category: 'Game',
                event_label: 'Intention Show',
                mode: intentionMode,
                subsession_id: window.currentSubsessionId
            });

            clearTimeout(intentionRandomizerInterval);
            intentionRandomizerInterval = null;
            if (intentionResultDisplay) {
                intentionResultDisplay.innerHTML = '';
                intentionResultDisplay.style.backgroundColor = 'white';
                intentionResultDisplay.style.display = 'flex';
            }

            if (intentionResultDisplay) {
                intentionResultDisplay.style.flexDirection = intentionMode === 'color' ? 'row' : 'column';
                intentionResultDisplay.style.gap = '0';
                intentionResultDisplay.classList.remove('hidden');
            }
            if (intentionDisplay) {
                intentionDisplay.style.backgroundColor = 'transparent';
                intentionDisplay.classList.remove('processing');
            }
            if (intentionShowBtn) {
                intentionShowBtn.classList.add('hidden');
                intentionShowBtn.classList.remove('processing');
            }

            if (intentionMode === 'color' && intentionResultDisplay) {
                cachedElements.colorBlock.style.backgroundColor = intentionCurrentResult || 'gray';
                intentionResultDisplay.appendChild(cachedElements.colorBlock);
            } else if (intentionResultDisplay) {
                const svg = intentionCurrentResult === 'circle' ? cachedElements.svgCircle : cachedElements.svgTriangle;
                intentionResultDisplay.appendChild(svg.cloneNode(true));
            }

            const feedbackButtons = feedbackButtonsTemplate.cloneNode(true);
            const successBtn = feedbackButtons.querySelectorAll('button')[0];
            const failureBtn = feedbackButtons.querySelectorAll('button')[1];

            if (intentionDisplay) intentionDisplay.insertAdjacentElement('afterend', feedbackButtons);

            successBtn.addEventListener('click', handleSuccess);
            failureBtn.addEventListener('click', handleFailure);

            const timeout = setTimeout(() => {
                if (!isProcessingIntention) return;
                isProcessingIntention = false;
                const guessTimeMs = Date.now();
                const timeDiffMs = intentionAttemptStartTime ? (guessTimeMs - intentionAttemptStartTime) : 0;
                const timeToGuess = timeDiffMs ? Math.max(0.1, Number((timeDiffMs / 1000).toFixed(1))) : 0.1;
                intentionAttempts.push({ time: timeToGuess, result: 0 });
                saveAttempts('intention');
                updateIntentionStatsDisplay();
                sendGtagEvent('intention_timeout', {
                    event_category: 'Game',
                    event_label: 'Intention Timeout',
                    mode: intentionMode,
                    result: intentionCurrentResult,
                    time_to_guess: timeToGuess,
                    subsession_id: window.currentSubsessionId
                });
                logDebug(`Intention attempt timed out, time_to_guess: ${timeToGuess}s, subsession_id: ${window.currentSubsessionId}`);
                logDebug('Intention attempts:', intentionAttempts);
                cleanupAndRestart();
            }, 60000);

            function handleSuccess() {
                if (!isProcessingIntention) return;
                isProcessingIntention = false;
                const guessTimeMs = Date.now();
                const timeDiffMs = intentionAttemptStartTime ? (guessTimeMs - intentionAttemptStartTime) : 0;
                const timeToGuess = timeDiffMs ? Math.max(0.1, Number((timeDiffMs / 1000).toFixed(1))) : 0.1;
                intentionAttemptStartTime = guessTimeMs;
                intentionStats.successes++;
                intentionGuessSequence.push(1);
                intentionAttempts.push({ time: timeToGuess, result: 1 });
                saveAttempts('intention');
                updateIntentionStatsDisplay();
                sendGtagEvent('intention_guess', {
                    event_category: 'Game',
                    event_label: 'Intention Guess',
                    value: 'success',
                    guess_result: 1,
                    mode: intentionMode,
                    result: intentionCurrentResult,
                    time_to_guess: timeToGuess,
                    attempt_id: intentionStats.attempts,
                    subsession_id: window.currentSubsessionId
                });
                const totalTime = gameStartTime ? ((Date.now() - gameStartTime) / 1000).toFixed(1) : 'N/A';
                logDebug(`Intention guess: Success, result: ${intentionCurrentResult}, time_to_guess: ${timeToGuess}s, sequence: [${intentionGuessSequence.join(', ')}], total game time: ${totalTime}s, subsession_id: ${window.currentSubsessionId}`);
                logDebug('Intention attempts:', intentionAttempts);
                cleanupAndRestart();
            }

            function handleFailure() {
                if (!isProcessingIntention) return;
                isProcessingIntention = false;
                const guessTimeMs = Date.now();
                const timeDiffMs = intentionAttemptStartTime ? (guessTimeMs - intentionAttemptStartTime) : 0;
                const timeToGuess = timeDiffMs ? Math.max(0.1, Number((timeDiffMs / 1000).toFixed(1))) : 0.1;
                intentionAttemptStartTime = guessTimeMs;
                intentionStats.failures++;
                intentionGuessSequence.push(0);
                intentionAttempts.push({ time: timeToGuess, result: 0 });
                saveAttempts('intention');
                updateIntentionStatsDisplay();
                sendGtagEvent('intention_guess', {
                    event_category: 'Game',
                    event_label: 'Intention Guess',
                    value: 'failure',
                    guess_result: 0,
                    mode: intentionMode,
                    result: intentionCurrentResult,
                    time_to_guess: timeToGuess,
                    attempt_id: intentionStats.attempts,
                    subsession_id: window.currentSubsessionId
                });
                const totalTime = gameStartTime ? ((Date.now() - gameStartTime) / 1000).toFixed(1) : 'N/A';
                logDebug(`Intention guess: Failure, result: ${intentionCurrentResult}, time_to_guess: ${timeToGuess}s, sequence: [${intentionGuessSequence.join(', ')}], total game time: ${totalTime}s, subsession_id: ${window.currentSubsessionId}`);
                logDebug('Intention attempts:', intentionAttempts);
                cleanupAndRestart();
            }

            function cleanupAndRestart() {
                try {
                    clearTimeout(timeout);
                    if (feedbackButtons && feedbackButtons.parentNode) {
                        feedbackButtons.remove();
                        logDebug('Feedback buttons removed');
                    } else {
                        logDebug('Feedback buttons not found or already removed');
                    }
                    if (intentionResultDisplay) intentionResultDisplay.classList.add('hidden');
                    if (intentionDisplay) intentionDisplay.style.backgroundColor = 'black';
                    if (intentionResultDisplay) intentionResultDisplay.style.backgroundColor = 'white';
                    if (intentionShowBtn) intentionShowBtn.classList.remove('hidden');
                    isProcessingIntention = false;
                    if (intentionAttemptsMode === 'limited' && intentionStats.attempts >= intentionMaxAttempts) {
                        if (intentionShowBtn) intentionShowBtn.disabled = true;
                        if (!sessionSummarySent) {
                            sendSessionSummary();
                        }
                        if (intentionNewGameBtn) {
                            logDebug('Showing New Game Button');
                            intentionNewGameBtn.classList.remove('hidden');
                        }
                    } else {
                        intentionCurrentResult = null;
                        if (intentionRandomizerInterval === null) {
                            logDebug('Restarting intention game from cleanupAndRestart');
                            startIntentionGame('cleanupAndRestart');
                        } else {
                            logDebug('Randomizer already active, skipping restart');
                        }
                    }
                } catch (error) {
                    console.error('Error in cleanupAndRestart:', error);
                    sendGtagEvent('error', {
                        event_category: 'App',
                        event_label: 'Runtime Error',
                        error_message: error.message,
                        error_file: 'script.js',
                        subsession_id: window.currentSubsessionId
                    });
                }
            }
        });
    }, randomDelay);
}

function updateIntentionStatsDisplay() {
    if (intentionStatsSpanAttempts) intentionStatsSpanAttempts.textContent = intentionStats.attempts;
    if (intentionStatsSpanMaxAttempts) intentionStatsSpanMaxAttempts.textContent = intentionAttemptsMode === 'limited' ? intentionMaxAttempts : '∞';
    if (intentionStatsSpanSuccesses) intentionStatsSpanSuccesses.textContent = intentionStats.successes;
    if (intentionStatsSpanFailures) intentionStatsSpanFailures.textContent = intentionStats.failures;
    const successRate = intentionStats.attempts > 0 ? Math.round((intentionStats.successes / intentionStats.attempts) * 100) : 0;
    if (intentionStatsSpanSuccessRate) intentionStatsSpanSuccessRate.textContent = `${successRate}%`;
    const avgTime = intentionAttempts.length ? (intentionAttempts.reduce((sum, a) => sum + a.time, 0) / intentionAttempts.length).toFixed(1) : 0;
    if (intentionStatsSpanAvgTime) intentionStatsSpanAvgTime.textContent = `${avgTime}s`;
}

function startVisionShuffle() {
    logDebug('Starting Vision shuffle');
    if (!visionShuffleBtn || visionShuffleBtn.disabled) return;
    shuffleStartTime = Date.now();
    sendGtagEvent('shuffle', {
        event_category: 'Game',
        event_label: 'Vision Shuffle',
        mode: visionMode,
        subsession_id: window.currentSubsessionId
    });

    visionShuffleBtn.disabled = true;
    setVisionChoiceButtonsEnabled(false);
    if (visionResultDisplay) visionResultDisplay.classList.add('hidden');
    if (visionDisplay) visionDisplay.style.backgroundColor = 'black';
    if (visionResultDisplay) visionResultDisplay.style.backgroundColor = 'transparent';

    const randomTime = RANDOM_RESULT_MIN_TIME + Math.random() * (RANDOM_RESULT_MAX_TIME - RANDOM_RESULT_MIN_TIME);

    visionRandomizerTimeout = setTimeout(() => {
        visionCurrentResult = getRandomResult(visionMode);
        logDebug(`Random result generated at ${randomTime.toFixed(2)}ms:`, visionCurrentResult);
    }, randomTime);

    setTimeout(() => {
        visionShuffleBtn.disabled = false;
        setVisionChoiceButtonsEnabled(true);
        choiceButtonsEnabledTime = Date.now();
        if (visionChoicesDiv) {
            visionChoicesDiv.classList.add('active');
            setTimeout(() => visionChoicesDiv.classList.remove('active'), 1000);
        }
        logDebug(`Choice buttons enabled at: ${choiceButtonsEnabledTime}, mode: ${visionMode}`);
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

    const resultDisplayTime = Date.now();
    const timeDiffMs = choiceButtonsEnabledTime ? (resultDisplayTime - choiceButtonsEnabledTime) : 0;
    const timeToGuess = timeDiffMs ? Math.max(0.1, Number((timeDiffMs / 1000).toFixed(1))) : 0.1;
    choiceButtonsEnabledTime = null;
    visionGuessSequence.push(guessResult);
    visionAttempts.push({ time: timeToGuess, result: guessResult });
    saveAttempts('vision');

    const totalTime = gameStartTime ? ((Date.now() - gameStartTime) / 1000).toFixed(1) : 'N/A';
    logDebug(`Vision guess: ${isCorrect ? 'Success' : 'Failure'}, choice: ${choice}, correct: ${visionCurrentResult}, time_to_guess: ${timeToGuess}s, sequence: [${visionGuessSequence.join(', ')}], total game time: ${totalTime}s`);
    logDebug('Vision attempts:', visionAttempts);

    sendGtagEvent('guess', {
        event_category: 'Game',
        event_label: 'Vision Guess',
        value: isCorrect ? 'success' : 'failure',
        guess_result: guessResult,
        mode: visionMode,
        choice: choice,
        correct_answer: visionCurrentResult,
        time_to_guess: timeToGuess,
        attempt_id: visionStats.attempts,
        subsession_id: window.currentSubsessionId
    });

    if (isCorrect) {
        visionStats.successes++;
    } else {
        visionStats.failures++;
    }

    if (visionResultDisplay) visionResultDisplay.classList.remove('hidden');
    if (visionDisplay) visionDisplay.style.backgroundColor = 'transparent';
    if (visionResultDisplay) {
        visionResultDisplay.innerHTML = '';
        visionResultDisplay.style.backgroundColor = 'transparent';
    }

    if (visionMode === 'color' && visionResultDisplay) {
        visionResultDisplay.style.backgroundColor = visionCurrentResult;
        let messageText = document.createElement('p');
        messageText.textContent = isCorrect ? translations[currentLanguage].visionSuccess : translations[currentLanguage].visionFailure;
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
        messageText.textContent = isCorrect ? translations[currentLanguage].visionSuccess : translations[currentLanguage].visionFailure;
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
            if (!sessionSummarySent) {
                sendSessionSummary();
            }
            if (visionNewGameBtn) visionNewGameBtn.classList.remove('hidden');
        } else {
            if (visionShuffleBtn) visionShuffleBtn.disabledmeteorology = false;
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
    const avgTime = visionAttempts.length ? (visionAttempts.reduce((sum, a) => sum + a.time, 0) / visionAttempts.length).toFixed(1) : 0;
    if (visionStatsSpanAvgTime) visionStatsSpanAvgTime.textContent = `${avgTime}s`;
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

// Theme toggle functionality
function toggleTheme() {
    document.body.classList.toggle('light-theme');
    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) themeIcon.textContent = document.body.classList.contains('light-theme') ? '☀️' : '🌙';
    updateLanguage(); // Обновляем текст кнопки темы
    sendGtagEvent('theme_change', {
        event_category: 'App',
        event_label: 'Theme Toggle',
        value: document.body.classList.contains('light-theme') ? 'light' : 'dark',
        subsession_id: window.currentSubsessionId
    });
}

// Event listeners
if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
}

if (languageSelect) {
    languageSelect.addEventListener('change', (event) => {
        currentLanguage = event.target.value;
        updateLanguage();
        sendGtagEvent('language_change', {
            event_category: 'App',
            event_label: 'Language Change',
            value: currentLanguage,
            subsession_id: window.currentSubsessionId
        });
    });
}

if (btnStartIntention) {
    btnStartIntention.addEventListener('click', () => {
        gameStartTime = Date.now();
        sessionSummarySent = false;
        resetIntentionGame();
        showScreen('game-intention');
        setTimeout(() => {
            sendGtagEvent('game_select', {
                event_category: 'Game',
                event_label: 'Intention',
                game_mode: intentionMode,
                subsession_id: window.currentSubsessionId
            });
        }, 0);
    });
}

if (btnStartVision) {
    btnStartVision.addEventListener('click', () => {
        gameStartTime = Date.now();
        sessionSummarySent = false;
        resetVisionGame();
        showScreen('game-vision');
        setTimeout(() => {
            sendGtagEvent('game_select', {
                event_category: 'Game',
                event_label: 'Vision',
                game_mode: visionMode,
                subsession_id: window.currentSubsessionId
            });
        }, 0);
    });
}

if (btnReadMore) {
    btnReadMore.addEventListener('click', () => {
        if (readMoreArea) readMoreArea.classList.remove('hidden');
        btnReadMore.classList.add('hidden');
        sendGtagEvent('read_more', {
            event_category: 'App',
            event_label: 'Read More Clicked',
            subsession_id: window.currentSubsessionId
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
                sendGtagEvent('game_exit', {
                    event_category: 'Game',
                    event_label: currentGameMode === 'intention' ? 'Intention' : 'Vision',
                    game_mode: currentGameMode === 'intention' ? intentionMode : visionMode,
                    session_duration_seconds: parseFloat(duration),
                    subsession_id: window.currentSubsessionId
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
            logDebug('Intention display clicked, triggering show result');
            sendGtagEvent('display_click', {
                event_category: 'Game',
                event_label: 'Intention Display',
                subsession_id: window.currentSubsessionId
            });
            intentionShowBtn.click();
        } else {
            logDebug('Intention display click ignored:', {
                showBtnHidden: intentionShowBtn.classList.contains('hidden'),
                showBtnDisabled: intentionShowBtn.disabled,
                gameMode: currentGameMode,
                isProcessing: isProcessingIntention
            });
        }
    });
}

if (!intentionModeRadios.length) {
    console.error('No radio buttons found for intention-mode');
} else {
    intentionModeRadios.forEach(radio => {
        radio.addEventListener('change', (event) => {
            if (intentionStats.attempts > 0 && !sessionSummarySent) {
                sendSessionSummary();
            }
            intentionMode = event.target.value;
            sendGtagEvent('mode_change', {
                event_category: 'Game',
                event_label: 'Intention Mode',
                value: intentionMode,
                subsession_id: window.currentSubsessionId
            });
            stopIntentionGame();
            startIntentionGame('modeChange');
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
    intentionNewGameBtn.addEventListener('click', () => {
        logDebug('New Game Button Clicked');
        resetIntentionGame();
    });
}

if (visionShuffleBtn) {
    visionShuffleBtn.addEventListener('click', startVisionShuffle);
}

if (visionDisplay) {
    visionDisplay.addEventListener('click', () => {
        if (visionShuffleBtn && !visionShuffleBtn.disabled && currentGameMode === 'vision') {
            sendGtagEvent('display_click', {
                event_category: 'Game',
                event_label: 'Vision Display',
                subsession_id: window.currentSubsessionId
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
        radio.addEventListener('click', (event) => {
            if (visionStats.attempts > 0 && !sessionSummarySent) {
                sendSessionSummary();
            }
            visionMode = event.target.value;
            generateSubsessionId();
            sendGtagEvent('mode_change', {
                event_category: 'Game',
                event_label: 'Vision Mode',
                value: visionMode,
                subsession_id: window.currentSubsessionId
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
    sendGtagEvent('error', {
        event_category: 'App',
        event_label: 'Runtime Error',
        error_message: error.message,
        error_file: error.filename,
        subsession_id: window.currentSubsessionId
    });
});

window.addEventListener('beforeunload', () => {
    if (gameStartTime && !sessionSummarySent) {
        sendSessionSummary();
        saveAttempts(currentGameMode);
        sendGtagEvent('session_end', {
            event_category: 'App',
            event_label: 'App Closed',
            session_duration_seconds: parseFloat(((Date.now() - gameStartTime) / 1000).toFixed(1)),
            subsession_id: window.currentSubsessionId
        });
    }
});

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && gameStartTime && !sessionSummarySent) {
        logDebug('App hidden, sending session summary');
        sendSessionSummary();
        sendGtagEvent('app_background', {
            event_category: 'App',
            event_label: 'App Minimized',
            session_duration_seconds: parseFloat(((Date.now() - gameStartTime) / 1000).toFixed(1)),
            subsession_id: window.currentSubsessionId
        });
    }
});

window.addEventListener('online', () => {
    logDebug('Internet connection restored, sending saved stats');
    sendSavedStats();
});

Telegram.WebApp.MainButton.onClick(() => {
    if (gameStartTime && !sessionSummarySent) {
        logDebug('MainButton clicked, sending session summary');
        sendSessionSummary();
        sendGtagEvent('app_close', {
            event_category: 'App',
            event_label: 'MainButton Close',
            session_duration_seconds: parseFloat(((Date.now() - gameStartTime) / 1000).toFixed(1)),
            subsession_id: window.currentSubsessionId
        });
    }
    Telegram.WebApp.close();
});

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    try {
        Telegram.WebApp.ready();
        Telegram.WebApp.expand();
        if (Telegram.WebApp.initDataUnsafe && Telegram.WebApp.initDataUnsafe.user) {
            telegramUser = Telegram.WebApp.initDataUnsafe.user;
            window.userId = telegramUser.id;
            if (userNameSpan) userNameSpan.textContent = telegramUser.first_name || 'Игрок';
            logDebug('Telegram User:', { id: telegramUser.id, first_name: telegramUser.first_name });
            gtag('set', 'user_properties', { custom_user_id: telegramUser.id });
            sendGtagEvent('app_launch', {
                event_category: 'App',
                event_label: 'Mini App Started',
                start_param: Telegram.WebApp.initDataUnsafe.start_param || 'none',
                subsession_id: window.currentSubsessionId
            });
        } else {
            telegramUser = { id: window.userId, first_name: 'Игрок' };
            if (userNameSpan) userNameSpan.textContent = telegramUser.first_name;
            logDebug('Anonymous User:', { id: window.userId });
            gtag('set', 'user_properties', { custom_user_id: window.userId });
            sendGtagEvent('app_launch', {
                event_category: 'App',
                event_label: 'Mini App Started (No User)',
                start_param: Telegram.WebApp.initDataUnsafe.start_param || 'none',
                subsession_id: window.currentSubsessionId
            });
        }
    } catch (e) {
        console.warn('Telegram WebApp not available, using anonymous user');
        telegramUser = { id: window.userId, first_name: 'Игрок' };
        if (userNameSpan) userNameSpan.textContent = telegramUser.first_name;
    }

    updateLanguage();
    logDebug('Initialization completed, calling sendSavedStats and showScreen');
    sendSavedStats();
    showScreen('menu-screen');
});

Telegram.WebApp.onEvent('viewportChanged', (isStateStable) => {
    if (!isStateStable && !Telegram.WebApp.isExpanded() && gameStartTime && !sessionSummarySent) {
        logDebug('Viewport changed, sending session summary');
        sendSessionSummary();
        sendGtagEvent('app_background', {
            event_category: 'App',
            event_label: 'Viewport Minimized',
            session_duration_seconds: parseFloat(((Date.now() - gameStartTime) / 1000).toFixed(1)),
            subsession_id: window.currentSubsessionId
        });
    }
});

window.dataLayer = window.dataLayer || [];
function gtag() {
    window.dataLayer.push(arguments);
    logDebug('gtag call:', arguments);
}
