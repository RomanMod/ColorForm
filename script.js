const ENABLE_LOGGING = true;

const intentionShowBtn = document.getElementById('intention-show-btn');
const intentionResultDisplay = document.getElementById('intention-result');
const intentionDisplay = document.getElementById('intention-display');
const intentionStatsDisplay = document.getElementById('intention-stats');
const intentionStatsAttempts = document.getElementById('intention-stats-attempts');
const intentionStatsMaxAttempts = document.getElementById('intention-stats-max-attempts');
const intentionStatsSuccesses = document.getElementById('intention-stats-successes');
const intentionStatsFailures = document.getElementById('intention-stats-failures');
const intentionStatsSuccessRate = document.getElementById('intention-stats-success-rate');
const intentionNewGameBtn = document.getElementById('intention-new-game-btn');
const intentionModeInputs = document.getElementsByName('intention-mode');
const intentionAttemptsModeInputs = document.getElementsByName('intention-attempts-mode');
const intentionAttemptsModeDiv = document.getElementById('intention-attempts-mode');

const visionResultDisplay = document.getElementById('vision-result');
const visionChoices = document.getElementById('vision-choices');
const visionStatsDisplay = document.getElementById('vision-stats');
const visionStatsAttempts = document.getElementById('stats-attempts');
const visionStatsMaxAttempts = document.getElementById('stats-max-attempts');
const visionStatsSuccesses = document.getElementById('stats-successes');
const visionStatsFailures = document.getElementById('stats-failures');
const visionStatsSuccessRate = document.getElementById('stats-success-rate');
const visionShuffleBtn = document.getElementById('vision-shuffle-btn');
const visionNewGameBtn = document.getElementById('vision-new-game-btn');
const visionModeInputs = document.getElementsByName('vision-mode');
const visionAttemptsModeInputs = document.getElementsByName('vision-attempts-mode');
const visionAttemptsModeDiv = document.getElementById('vision-attempts-mode');

let telegramUser = null;
let currentGameMode = 'menu';
let gameStartTime = null;
let sessionStartTime = Date.now();
let sessionId = `${sessionStartTime}${Math.random().toString(36).substring(2, 9)}`;
let sessionSummarySent = false;
let choiceButtonsEnabledTime = null;

let visionMode = 'color';
let visionAttemptsMode = 'limited';
let visionMaxAttempts = 10;
let visionGuessSequence = [];
let visionCurrentResult = null;

const visionStats = {
  attempts: 0,
  successes: 0,
  failures: 0
};

let intentionMode = 'color';
let intentionAttemptsMode = 'limited';
let intentionMaxAttempts = 10;
let intentionGuessSequence = [];
let intentionCurrentResult = null;
let intentionAttemptStartTime = null;

const intentionStats = {
  attempts: 0,
  successes: 0,
  failures: 0
};

const intentionRandomizer = {
  result: null,
  updateInterval: null,
  updateCount: 0,
  maxUpdates: 50
};

function generateRandomResult(mode) {
  const colors = ['red', 'blue'];
  const shapes = ['circle', 'triangle'];
  const options = mode === 'color' ? colors : shapes;
  return options[Math.floor(Math.random() * options.length)];
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
  console.log(`Sending session summary at ${Date.now()}, mode: ${currentGameMode}, duration: ${duration}s`);
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
  document.querySelectorAll('.game-screen').forEach(screen => {
    screen.classList.add('hidden');
  });
  const screen = document.getElementById(screenId);
  if (screen) {
    screen.classList.remove('hidden');
  }

  if (screenId === 'menu-screen') {
    sendSessionSummary();
    currentGameMode = 'menu';
    const totalTime = gameStartTime ? ((Date.now() - gameStartTime) / 1000).toFixed(1) : 'N/A';
    console.log(`Returning to menu, total game time: ${totalTime}s`);
    console.log(`Intention guess sequence: [${intentionGuessSequence.join(', ')}]`);
    console.log(`Vision guess sequence: [${visionGuessSequence.join(', ')}]`);
    gameStartTime = null;
    sessionSummarySent = false;
  }

  console.log(`Showing screen: ${screenId}`);
}

function resetIntentionGame() {
  console.log('Resetting Intention game');
  intentionStats.attempts = 0;
  intentionStats.successes = 0;
  intentionStats.failures = 0;
  intentionGuessSequence = [];
  intentionCurrentResult = null;
  intentionAttemptStartTime = null;
  intentionRandomizer.result = null;
  intentionRandomizer.updateCount = 0;
  if (intentionRandomizer.updateInterval) {
    clearInterval(intentionRandomizer.updateInterval);
    intentionRandomizer.updateInterval = null;
  }
  updateIntentionStatsDisplay();
  if (intentionResultDisplay) {
    intentionResultDisplay.classList.add('hidden');
    intentionResultDisplay.innerHTML = '';
  }
  if (intentionShowBtn) {
    intentionShowBtn.disabled = false;
  }
  if (intentionNewGameBtn) {
    intentionNewGameBtn.classList.add('hidden');
  }
  if (intentionAttemptsModeDiv) {
    intentionAttemptsModeDiv.classList.remove('hidden');
  }
  console.log('Intention game reset, guess sequence and attempt start time cleared');
}

function resetVisionGame() {
  console.log('Resetting Vision game');
  visionStats.attempts = 0;
  visionStats.successes = 0;
  visionStats.failures = 0;
  visionGuessSequence = [];
  visionCurrentResult = null;
  updateVisionStatsDisplay();
  setVisionChoiceButtonsEnabled(true);
  if (visionResultDisplay) {
    visionResultDisplay.classList.add('hidden');
    visionResultDisplay.innerHTML = '';
  }
  if (visionShuffleBtn) {
    visionShuffleBtn.disabled = false;
  }
  if (visionNewGameBtn) {
    visionNewGameBtn.classList.add('hidden');
  }
  if (visionAttemptsModeDiv) {
    visionAttemptsModeDiv.classList.remove('hidden');
  }
  console.log('Vision game reset, guess sequence cleared');
}

function startIntentionGame() {
  console.log('Starting Intention game');
  resetIntentionGame();
  intentionCurrentResult = generateRandomResult(intentionMode);
  intentionAttemptStartTime = Date.now();
  console.log(`Starting intention game, mode: ${intentionMode} result: ${intentionCurrentResult} attempt_start_time: ${intentionAttemptStartTime}`);
  intentionRandomizer.updateCount = 0;
  intentionRandomizer.result = intentionCurrentResult;

  intentionRandomizer.updateInterval = setInterval(() => {
    intentionRandomizer.updateCount++;
    intentionRandomizer.result = generateRandomResult(intentionMode);
    const nextUpdateDelay = Math.random() * 100;
    console.log(`Randomizer updated (count: ${intentionRandomizer.updateCount}), result: ${intentionRandomizer.result}, next update in ${nextUpdateDelay.toFixed(2)}ms`);
    if (intentionRandomizer.updateCount >= intentionRandomizer.maxUpdates) {
      clearInterval(intentionRandomizer.updateInterval);
      intentionRandomizer.updateInterval = null;
    }
  }, Math.random() * 100);
}

function showIntentionResult() {
  if (!intentionCurrentResult || !intentionShowBtn) return;

  intentionShowBtn.disabled = true;
  const fixationDelay = Math.random() * (500 - 10) + 10;
  console.log(`Fixation delay: ${fixationDelay.toFixed(2)}ms`);

  setTimeout(() => {
    if (intentionRandomizer.updateInterval) {
      clearInterval(intentionRandomizer.updateInterval);
      intentionRandomizer.updateInterval = null;
    }

    let content = '';
    if (intentionMode === 'color') {
      content = `<div style="width: 100%; height: 100%; background-color: ${intentionCurrentResult};"></div>`;
    } else {
      if (intentionCurrentResult === 'circle') {
        content = `<svg width="100%" height="100%" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="black"></circle></svg>`;
      } else if (intentionCurrentResult === 'triangle') {
        content = `<svg width="100%" height="100%" viewBox="0 0 100 100"><polygon points="50,10 90,90 10,90" fill="black"></polygon></svg>`;
      }
    }

    if (intentionResultDisplay) {
      intentionResultDisplay.innerHTML = content;
      intentionResultDisplay.classList.remove('hidden');
    }

    const resultDisplayTime = Date.now();
    console.log(`Showing intention result, mode: ${intentionMode} result: ${intentionCurrentResult}`);
    console.log(`Intention result displayed at: ${resultDisplayTime}`);

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
    intentionResultDisplay.appendChild(feedbackButtons);

    let isProcessingIntention = true;

    intentionStats.attempts++;

    const cleanupAndRestart = () => {
      if (intentionResultDisplay) {
        intentionResultDisplay.innerHTML = '';
        intentionResultDisplay.classList.add('hidden');
      }
      if (intentionShowBtn) {
        intentionShowBtn.disabled = false;
      }
      if (intentionStats.attempts >= intentionMaxAttempts && intentionAttemptsMode === 'limited') {
        if (intentionNewGameBtn) {
          intentionNewGameBtn.classList.remove('hidden');
        }
        return;
      }
      startIntentionGame();
    };

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
      console.log(`Sending intention_guess event: attempt_id=${intentionStats.attempts}, guess_result=1, time_to_guess=${timeToGuess}`);
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
      console.log(`Sending intention_guess event: attempt_id=${intentionStats.attempts}, guess_result=0, time_to_guess=${timeToGuess}`);
      if (ENABLE_LOGGING) {
        const totalTime = ((Date.now() - gameStartTime) / 1000).toFixed(1);
        console.log(`Intention guess: Failure, result: ${intentionCurrentResult}, time_to_guess: ${timeToGuess}s, time_diff_ms: ${timeDiffMs}, sequence: [${intentionGuessSequence.join(', ')}], total game time: ${totalTime}s`);
      }
      cleanupAndRestart();
    });
  }, fixationDelay);
}

function startVisionShuffle() {
  console.log('Starting Vision shuffle');
  if (visionResultDisplay) {
    visionResultDisplay.classList.add('hidden');
    visionResultDisplay.innerHTML = '';
  }

  const shuffleDuration = Math.random() * (3000 - 1000) + 1000;
  const startTime = Date.now();

  function updateShuffle() {
    const elapsed = Date.now() - startTime;
    if (elapsed >= shuffleDuration) {
      visionCurrentResult = generateRandomResult(visionMode);
      console.log(`Random result generated at ${elapsed.toFixed(2)}ms: ${visionCurrentResult}`);
      setVisionChoiceButtonsEnabled(true);
      if (visionShuffleBtn) {
        visionShuffleBtn.disabled = false;
      }
      console.log(`Choice buttons enabled at: ${Date.now()}, mode: ${visionMode}`);
      return;
    }
    setTimeout(updateShuffle, 50);
  }

  updateShuffle();
}

function handleVisionChoice(event) {
  const targetBtn = event.target.closest('.choice-btn');
  if (visionCurrentResult === null || !targetBtn || targetBtn.disabled || targetBtn.dataset.processing) return;
  targetBtn.dataset.processing = true;

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
  console.log(`Sending guess event: attempt_id=${visionStats.attempts}, guess_result=${guessResult}, time_to_guess=${timeToGuess}`);

  if (isCorrect) {
    visionStats.successes++;
  } else {
    visionStats.failures++;
  }

  let content = '';
  if (visionMode === 'color') {
    content = `<div class="vision-feedback-content" style="background-color: ${visionCurrentResult};"></div>`;
  } else {
    if (visionCurrentResult === 'circle') {
      content = `<div class="vision-feedback-content"><svg width="100%" height="100%" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="black"></circle></svg></div>`;
    } else if (visionCurrentResult === 'triangle') {
      content = `<div class="vision-feedback-content"><svg width="100%" height="100%" viewBox="0 0 100 100"><polygon points="50,10 90,90 10,90" fill="black"></polygon></svg></div>`;
    }
  }

  if (visionResultDisplay) {
    visionResultDisplay.innerHTML = content;
    const feedbackText = document.createElement('span');
    feedbackText.className = 'feedback-text';
    feedbackText.textContent = isCorrect ? 'Правильно!' : 'Неправильно!';
    visionResultDisplay.appendChild(feedbackText);
  }

  updateVisionStatsDisplay();

  setTimeout(() => {
    if (visionStats.attempts >= visionMaxAttempts && visionAttemptsMode === 'limited') {
      if (visionNewGameBtn) {
        visionNewGameBtn.classList.remove('hidden');
      }
      delete targetBtn.dataset.processing;
      return;
    }
    startVisionShuffle();
    delete targetBtn.dataset.processing;
  }, 2500);
}

function updateIntentionStatsDisplay() {
  if (intentionStatsAttempts) {
    intentionStatsAttempts.textContent = intentionStats.attempts;
  }
  if (intentionStatsMaxAttempts) {
    intentionStatsMaxAttempts.textContent = intentionAttemptsMode === 'limited' ? intentionMaxAttempts : '∞';
  }
  if (intentionStatsSuccesses) {
    intentionStatsSuccesses.textContent = intentionStats.successes;
  }
  if (intentionStatsFailures) {
    intentionStatsFailures.textContent = intentionStats.failures;
  }
  if (intentionStatsSuccessRate) {
    const successRate = intentionStats.attempts > 0 ? ((intentionStats.successes / intentionStats.attempts) * 100).toFixed(1) : 0;
    intentionStatsSuccessRate.textContent = `${successRate}%`;
  }
}

function updateVisionStatsDisplay() {
  if (visionStatsAttempts) {
    visionStatsAttempts.textContent = visionStats.attempts;
  }
  if (visionStatsMaxAttempts) {
    visionStatsMaxAttempts.textContent = visionAttemptsMode === 'limited' ? visionMaxAttempts : '∞';
  }
  if (visionStatsSuccesses) {
    visionStatsSuccesses.textContent = visionStats.successes;
  }
  if (visionStatsFailures) {
    visionStatsFailures.textContent = visionStats.failures;
  }
  if (visionStatsSuccessRate) {
    const successRate = visionStats.attempts > 0 ? ((visionStats.successes / visionStats.attempts) * 100).toFixed(1) : 0;
    visionStatsSuccessRate.textContent = `${successRate}%`;
  }
}

function setVisionChoiceButtonsEnabled(enabled) {
  const buttons = visionChoices ? visionChoices.querySelectorAll('.choice-btn') : [];
  buttons.forEach(btn => {
    btn.disabled = !enabled;
  });
  if (enabled) {
    choiceButtonsEnabledTime = Date.now();
  } else {
    choiceButtonsEnabledTime = null;
  }
}

function updateVisionChoicesVisibility() {
  const colorButtons = visionChoices ? visionChoices.querySelectorAll('.color-btn') : [];
  const shapeButtons = visionChoices ? visionChoices.querySelectorAll('.shape-btn') : [];
  colorButtons.forEach(btn => {
    btn.classList.toggle('hidden', visionMode !== 'color');
  });
  shapeButtons.forEach(btn => {
    btn.classList.toggle('hidden', visionMode !== 'shape');
  });
}

document.getElementById('btn-start-intention').addEventListener('click', () => {
  gameStartTime = Date.now();
  currentGameMode = 'intention';
  resetIntentionGame();
  startIntentionGame();
  showScreen('game-intention');
});

document.getElementById('btn-start-vision').addEventListener('click', () => {
  gameStartTime = Date.now();
  currentGameMode = 'vision';
  resetVisionGame();
  startVisionShuffle();
  showScreen('game-vision');
});

document.getElementById('btn-read-more').addEventListener('click', () => {
  const readMoreArea = document.getElementById('read-more-area');
  if (readMoreArea) {
    readMoreArea.classList.toggle('hidden');
  }
});

document.getElementById('btn-close-read-more').addEventListener('click', () => {
  const readMoreArea = document.getElementById('read-more-area');
  if (readMoreArea) {
    readMoreArea.classList.add('hidden');
  }
});

if (intentionNewGameBtn) {
  intentionNewGameBtn.addEventListener('click', () => {
    resetIntentionGame();
    startIntentionGame();
  });
}

if (visionNewGameBtn) {
  visionNewGameBtn.addEventListener('click', () => {
    resetVisionGame();
    startVisionShuffle();
  });
}

if (intentionShowBtn) {
  intentionShowBtn.addEventListener('click', showIntentionResult);
}

if (visionShuffleBtn) {
  visionShuffleBtn.addEventListener('click', startVisionShuffle);
}

if (visionChoices) {
  visionChoices.addEventListener('click', handleVisionChoice);
}

if (intentionDisplay) {
  intentionDisplay.addEventListener('click', () => {
    console.log('Intention display clicked, triggering show result');
    showIntentionResult();
  });
}

document.querySelectorAll('.back-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    showScreen('menu-screen');
  });
});

intentionModeInputs.forEach(input => {
  input.addEventListener('change', () => {
    intentionMode = input.value;
    resetIntentionGame();
    startIntentionGame();
  });
});

intentionAttemptsModeInputs.forEach(input => {
  input.addEventListener('change', () => {
    intentionAttemptsMode = input.value;
    resetIntentionGame();
    startIntentionGame();
  });
});

visionModeInputs.forEach(input => {
  input.addEventListener('change', () => {
    visionMode = input.value;
    updateVisionChoicesVisibility();
    resetVisionGame();
    startVisionShuffle();
  });
});

visionAttemptsModeInputs.forEach(input => {
  input.addEventListener('change', () => {
    visionAttemptsMode = input.value;
    resetVisionGame();
    startVisionShuffle();
  });
});

if (typeof Telegram !== 'undefined' && Telegram.WebApp) {
  Telegram.WebApp.ready();
  Telegram.WebApp.expand();
  telegramUser = Telegram.WebApp.initDataUnsafe.user || {};
  console.log('Anonymous User:', telegramUser);
  if (telegramUser.username) {
    const telegramUserName = document.getElementById('telegram-user-name');
    if (telegramUserName) {
      telegramUserName.textContent = telegramUser.username;
    }
  }

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
}

updateVisionChoicesVisibility();
showScreen('menu-screen');
