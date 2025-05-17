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
            console.log(`Showing intention result, mode: ${intentionMode}, result: ${intentionCurrentResult}, subsession_id: ${subsessionId}`);
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
            intentionResultDisplay: intentionResultDisplay,
            intentionDisplay: intentionDisplay,
            intentionShowBtn: intentionShowBtn
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
                attempt_number: intentionStats.attempts
            });
            if (ENABLE_LOGGING) {
                const totalTime = ((Date.now() - gameStartTime) / 1000).toFixed(1);
                console.log(`Intention guess: Success, result: ${intentionCurrentResult}, time_to_guess: ${timeToGuess}s, sequence: [${intentionGuessSequence.join(', ')}], total game time: ${totalTime}s, subsession_id: ${subsessionId}`);
                console.log('Intention attempts:', intentionAttempts);
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
                attempt_number: intentionStats.attempts
            });
            if (ENABLE_LOGGING) {
                const totalTime = ((Date.now() - gameStartTime) / 1000).toFixed(1);
                console.log(`Intention guess: Failure, result: ${intentionCurrentResult}, time_to_guess: ${timeToGuess}s, sequence: [${intentionGuessSequence.join(', ')}], total game time: ${totalTime}s, subsession_id: ${subsessionId}`);
                console.log('Intention attempts:', intentionAttempts);
            }
            cleanupAndRestart();
        });

        const timeout = setTimeout(() => {
            if (!isProcessingIntention) return;
            isProcessingIntention = false;
            const guessTimeMs = Date.now();
            const timeDiffMs = intentionAttemptStartTime ? (guessTimeMs - intentionAttemptStartTime) : 0;
            const timeToGuess = timeDiffMs ? Math.max(0.1, Number((timeDiffMs / 1000).toFixed(1))) : 0.1;
            intentionStats.failures++;
            intentionGuessSequence.push(0);
            intentionAttempts.push({ time: timeToGuess, result: 0 });
            saveAttempts('intention');
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
                console.log(`Intention attempt timed out, time_to_guess: ${timeToGuess}s, sequence: [${intentionGuessSequence.join(', ')}], total game time: ${totalTime}s, subsession_id: ${subsessionId}`);
                console.log('Intention attempts:', intentionAttempts);
            }
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
                // Завершение подгруппы в ограниченном режиме
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
                if (intentionShowBtn) intentionShowBtn.disabled = true;
                if (intentionNewGameBtn) intentionNewGameBtn.classList.remove('hidden');
                resetIntentionGame();
            } else {
                // В неограниченном режиме создаём новую подгруппу для аналитики, но сохраняем статистику
                if (intentionStats.attempts % intentionMaxAttempts === 0) {
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
                    subsessionCounter++;
                    subsessionId = `${sessionId}_${subsessionCounter}`;
                    if (ENABLE_LOGGING) {
                        console.log(`New subsession created: ${subsessionId}`);
                    }
                }
                startIntentionGame();
            }
        }
    }, randomDelay);
}
