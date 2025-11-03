// ===== ACTIVITY TAKING INTERFACE COMPONENT =====

/**
 * ActivityTakingInterface Class
 * Handles student activity taking experience with timer, auto-save, and submission
 */
class ActivityTakingInterface {
    constructor(activityManager, questionRenderer, responseManager) {
        this.activityManager = activityManager;
        this.questionRenderer = questionRenderer;
        this.responseManager = responseManager;
        this.currentActivity = null;
        this.currentResponse = null;
        this.currentQuestionIndex = 0;
        this.isSubmitted = false;
        this.timer = null;
        this.timeRemaining = 0;
        this.autoSaveInterval = null;
        this.studentId = 'student_123'; // In real app, would get from session
    }

    /**
     * Start an activity
     * @param {string} activityId - Activity ID to start
     */
    async startActivity(activityId) {
        try {
            this.currentActivity = this.activityManager.getActivity(activityId);
            if (!this.currentActivity) {
                throw new Error('Activity not found');
            }

            // Check if activity is available
            if (this.currentActivity.status !== ActivitySystem.ActivityStatus.PUBLISHED) {
                throw new Error('Activity is not available');
            }

            // Check time bounds
            const now = new Date();
            if (this.currentActivity.startDate && now < this.currentActivity.startDate) {
                throw new Error('Activity has not started yet');
            }
            if (this.currentActivity.endDate && now > this.currentActivity.endDate) {
                throw new Error('Activity is no longer available');
            }

            // Check if already submitted
            const existingResponse = this.activityManager.getStudentResponse(activityId, this.studentId);
            if (existingResponse && existingResponse.submissionStatus === ActivitySystem.SubmissionStatus.SUBMITTED) {
                // Show results instead
                this.showResults(activityId);
                return;
            }

            // Initialize response
            const result = await this.responseManager.startResponse(this.currentActivity, this.studentId);
            if (!result.success) {
                throw new Error(result.errors.join(', '));
            }

            this.currentResponse = result.response;
            this.currentQuestionIndex = 0;
            this.isSubmitted = false;

            // Setup timer if activity has time limit
            if (this.currentActivity.timeLimit) {
                this.setupTimer();
            }

            // Setup auto-save
            this.setupAutoSave();

            // Render the interface
            await this.render();

            // Show start confirmation
            UIUtils.showToast(result.isResuming ? 'Activity resumed' : 'Activity started', 'success');

        } catch (error) {
            console.error('Error starting activity:', error);
            UIUtils.showToast('Error starting activity: ' + error.message, 'error');
        }
    }

    /**
     * Setup timer for timed activities
     */
    setupTimer() {
        if (!this.currentActivity.timeLimit) return;

        // Calculate time remaining
        const startTime = new Date(this.currentResponse.startedAt);
        const timeLimit = this.currentActivity.timeLimit * 60 * 1000; // Convert to milliseconds
        const elapsed = Date.now() - startTime.getTime();
        this.timeRemaining = Math.max(0, timeLimit - elapsed);

        if (this.timeRemaining <= 0) {
            // Time's up - auto submit
            this.autoSubmit();
            return;
        }

        // Start countdown timer
        this.timer = setInterval(() => {
            this.timeRemaining -= 1000;
            this.updateTimerDisplay();

            // Show warnings
            if (this.timeRemaining === 5 * 60 * 1000) { // 5 minutes
                UIUtils.showToast('5 minutes remaining!', 'warning', 'Time Warning');
            } else if (this.timeRemaining === 1 * 60 * 1000) { // 1 minute
                UIUtils.showToast('1 minute remaining!', 'warning', 'Time Warning');
            }

            if (this.timeRemaining <= 0) {
                this.autoSubmit();
            }
        }, 1000);
    }

    /**
     * Setup auto-save functionality
     */
    setupAutoSave() {
        this.autoSaveInterval = setInterval(() => {
            if (!this.isSubmitted) {
                this.saveProgress();
            }
        }, 10000); // Auto-save every 10 seconds
    }

    /**
     * Render the activity taking interface
     */
    async render() {
        const contentArea = document.getElementById('contentArea');
        if (!contentArea) return;

        contentArea.innerHTML = `
            <div class="activity-taking-interface">
                <div class="activity-header">
                    <div class="activity-info">
                        <button class="btn-back" onclick="window.activityTakingInterface.confirmExit()">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="15,18 9,12 15,6"></polyline>
                            </svg>
                        </button>
                        <div>
                            <h1>${this.currentActivity.title}</h1>
                            <p>${this.currentActivity.description}</p>
                        </div>
                    </div>
                    <div class="activity-status">
                        ${this.currentActivity.timeLimit ? `
                            <div class="timer-display" id="timerDisplay">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="12" cy="12" r="10"/>
                                    <polyline points="12,6 12,12 16,14"/>
                                </svg>
                                <span id="timeRemaining">${this.formatTime(this.timeRemaining)}</span>
                            </div>
                        ` : ''}
                        <div class="progress-display">
                            <span id="questionProgress">${this.currentQuestionIndex + 1} of ${this.currentActivity.questions.length}</span>
                            <div class="progress-bar">
                                <div class="progress-fill" id="progressFill" style="width: ${((this.currentQuestionIndex + 1) / this.currentActivity.questions.length) * 100}%"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="activity-content">
                    <div class="question-container" id="questionContainer">
                        ${this.renderCurrentQuestion()}
                    </div>

                    <div class="activity-navigation">
                        <button class="btn-nav btn-previous" id="prevBtn" 
                                ${this.currentQuestionIndex === 0 ? 'disabled' : ''} 
                                onclick="window.activityTakingInterface.previousQuestion()">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="15,18 9,12 15,6"></polyline>
                            </svg>
                            Previous
                        </button>

                        <div class="question-indicators">
                            ${this.renderQuestionIndicators()}
                        </div>

                        <button class="btn-nav btn-next" id="nextBtn" 
                                onclick="window.activityTakingInterface.nextQuestion()">
                            ${this.currentQuestionIndex === this.currentActivity.questions.length - 1 ? 'Review & Submit' : 'Next'}
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="9,18 15,12 9,6"></polyline>
                            </svg>
                        </button>
                    </div>
                </div>

                <div class="auto-save-indicator" id="autoSaveIndicator">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                        <polyline points="17,21 17,13 7,13 7,21"/>
                        <polyline points="7,3 7,8 15,8"/>
                    </svg>
                    <span>Auto-saved</span>
                </div>
            </div>
        `;

        // Setup event listeners
        this.setupEventListeners();

        // Store reference for global access
        window.activityTakingInterface = this;
    }

    /**
     * Render current question
     */
    renderCurrentQuestion() {
        const question = this.currentActivity.questions[this.currentQuestionIndex];
        if (!question) return '<div>Question not found</div>';

        const currentAnswer = this.responseManager.getAnswer(question.id);
        
        // Create a temporary container to render the question
        const tempContainer = document.createElement('div');
        const questionElement = this.questionRenderer.renderQuestion(question, {
            currentAnswer: currentAnswer,
            questionNumber: this.currentQuestionIndex + 1,
            showCorrectAnswer: false,
            isReadOnly: false
        });

        tempContainer.appendChild(questionElement);
        return tempContainer.innerHTML;
    }

    /**
     * Render question indicators
     */
    renderQuestionIndicators() {
        return this.currentActivity.questions.map((question, index) => {
            const isAnswered = this.responseManager.getAnswer(question.id) !== null;
            const isCurrent = index === this.currentQuestionIndex;
            
            return `
                <button class="question-indicator ${isCurrent ? 'current' : ''} ${isAnswered ? 'answered' : ''}" 
                        onclick="window.activityTakingInterface.goToQuestion(${index})"
                        title="Question ${index + 1}${isAnswered ? ' (Answered)' : ''}">
                    ${index + 1}
                </button>
            `;
        }).join('');
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Remove any existing listeners to prevent duplicates
        this.removeEventListeners();

        // Listen for answer changes
        this.questionAnswerHandler = (event) => {
            this.handleAnswerChange(event.detail);
        };
        document.addEventListener('questionAnswerChanged', this.questionAnswerHandler);

        // Listen for radio button and checkbox changes (with delegation)
        this.radioChangeHandler = (event) => {
            if (event.target.matches('input[type="radio"]')) {
                const questionId = event.target.name.replace('question-', '');
                console.log('Radio button changed:', questionId, event.target.value);
                this.handleAnswerChange({
                    questionId: questionId,
                    answer: event.target.value,
                    timestamp: new Date()
                });
            }
        };
        document.addEventListener('change', this.radioChangeHandler);

        // Listen for text input changes (with delegation)
        this.textInputHandler = (event) => {
            if (event.target.matches('.short-answer-input, .essay-textarea')) {
                const questionId = event.target.getAttribute('data-question-id');
                if (questionId) {
                    console.log('Text input changed:', questionId, event.target.value);
                    this.handleAnswerChange({
                        questionId: questionId,
                        answer: event.target.value,
                        timestamp: new Date()
                    });
                }
            }
        };
        document.addEventListener('input', this.textInputHandler);

        // Prevent accidental page refresh
        this.beforeUnloadHandler = (event) => {
            if (!this.isSubmitted) {
                event.preventDefault();
                event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
                return event.returnValue;
            }
        };
        window.addEventListener('beforeunload', this.beforeUnloadHandler);
    }

    /**
     * Remove event listeners
     */
    removeEventListeners() {
        if (this.questionAnswerHandler) {
            document.removeEventListener('questionAnswerChanged', this.questionAnswerHandler);
        }
        if (this.radioChangeHandler) {
            document.removeEventListener('change', this.radioChangeHandler);
        }
        if (this.textInputHandler) {
            document.removeEventListener('input', this.textInputHandler);
        }
        if (this.beforeUnloadHandler) {
            window.removeEventListener('beforeunload', this.beforeUnloadHandler);
        }
    }

    /**
     * Handle answer changes
     */
    handleAnswerChange(detail) {
        const { questionId, answer } = detail;
        
        console.log('Handling answer change:', questionId, answer);
        
        // Ensure response manager exists
        if (!this.responseManager) {
            console.error('Response manager not available');
            return;
        }
        
        // Update response manager
        this.responseManager.setAnswer(questionId, answer);
        
        // Update question indicators
        this.updateQuestionIndicators();
        
        // Show auto-save indicator
        this.showAutoSaveIndicator();
        
        console.log('Answer change handled successfully');
    }

    /**
     * Navigate to next question
     */
    nextQuestion() {
        if (this.currentQuestionIndex < this.currentActivity.questions.length - 1) {
            this.currentQuestionIndex++;
            this.updateQuestionDisplay();
        } else {
            // Last question - show review
            this.showReviewScreen();
        }
    }

    /**
     * Navigate to previous question
     */
    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.updateQuestionDisplay();
        }
    }

    /**
     * Go to specific question
     */
    goToQuestion(index) {
        if (index >= 0 && index < this.currentActivity.questions.length) {
            this.currentQuestionIndex = index;
            this.updateQuestionDisplay();
        }
    }

    /**
     * Update question display
     */
    updateQuestionDisplay() {
        const questionContainer = document.getElementById('questionContainer');
        const questionProgress = document.getElementById('questionProgress');
        const progressFill = document.getElementById('progressFill');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');

        if (questionContainer) {
            questionContainer.innerHTML = this.renderCurrentQuestion();
        }

        if (questionProgress) {
            questionProgress.textContent = `${this.currentQuestionIndex + 1} of ${this.currentActivity.questions.length}`;
        }

        if (progressFill) {
            const progress = ((this.currentQuestionIndex + 1) / this.currentActivity.questions.length) * 100;
            progressFill.style.width = progress + '%';
        }

        if (prevBtn) {
            prevBtn.disabled = this.currentQuestionIndex === 0;
        }

        if (nextBtn) {
            nextBtn.innerHTML = this.currentQuestionIndex === this.currentActivity.questions.length - 1 
                ? 'Review & Submit <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9,18 15,12 9,6"></polyline></svg>'
                : 'Next <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9,18 15,12 9,6"></polyline></svg>';
        }

        this.updateQuestionIndicators();
    }

    /**
     * Update question indicators
     */
    updateQuestionIndicators() {
        const indicators = document.querySelectorAll('.question-indicator');
        
        indicators.forEach((indicator, index) => {
            const isAnswered = this.responseManager.getAnswer(this.currentActivity.questions[index].id) !== null;
            const isCurrent = index === this.currentQuestionIndex;
            
            indicator.className = `question-indicator ${isCurrent ? 'current' : ''} ${isAnswered ? 'answered' : ''}`;
            indicator.title = `Question ${index + 1}${isAnswered ? ' (Answered)' : ''}`;
        });
    }

    /**
     * Show review screen before submission
     */
    showReviewScreen() {
        const contentArea = document.getElementById('contentArea');
        if (!contentArea) return;

        const unansweredQuestions = this.getUnansweredQuestions();
        const completionPercentage = this.responseManager.getCompletionPercentage();

        contentArea.innerHTML = `
            <div class="activity-review-screen">
                <div class="review-header">
                    <div class="review-title">
                        <h1>📋 Review Your Answers</h1>
                        <p>Please review your responses before submitting</p>
                    </div>
                    <div class="review-stats">
                        <div class="stat-item">
                            <span class="stat-number">${completionPercentage}%</span>
                            <span class="stat-label">Complete</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number">${this.currentActivity.questions.length - unansweredQuestions.length}</span>
                            <span class="stat-label">Answered</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number">${unansweredQuestions.length}</span>
                            <span class="stat-label">Remaining</span>
                        </div>
                    </div>
                </div>

                <div class="review-content">
                    ${unansweredQuestions.length > 0 ? `
                        <div class="unanswered-warning">
                            <h3>⚠️ Unanswered Questions</h3>
                            <p>The following questions haven't been answered yet:</p>
                            <div class="unanswered-list">
                                ${unansweredQuestions.map(q => `
                                    <button class="unanswered-item" onclick="window.activityTakingInterface.goToQuestionFromReview(${q.index})">
                                        <span class="question-number">Q${q.index + 1}</span>
                                        <span class="question-text">${q.question.question.substring(0, 60)}...</span>
                                    </button>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}

                    <div class="review-summary">
                        <h3>📊 Summary</h3>
                        <div class="summary-grid">
                            <div class="summary-item">
                                <strong>Activity:</strong> ${this.currentActivity.title}
                            </div>
                            <div class="summary-item">
                                <strong>Questions:</strong> ${this.currentActivity.questions.length}
                            </div>
                            <div class="summary-item">
                                <strong>Time Spent:</strong> ${this.responseManager.getFormattedTimeSpent()}
                            </div>
                            ${this.currentActivity.timeLimit ? `
                                <div class="summary-item">
                                    <strong>Time Remaining:</strong> ${this.formatTime(this.timeRemaining)}
                                </div>
                            ` : ''}
                        </div>
                    </div>

                    <div class="submission-options">
                        <h3>🚀 Ready to Submit?</h3>
                        <p>Once you submit, you won't be able to change your answers.</p>
                        
                        <div class="submission-actions">
                            <button class="btn-back-to-questions" onclick="window.activityTakingInterface.backToQuestions()">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="15,18 9,12 15,6"></polyline>
                                </svg>
                                Back to Questions
                            </button>
                            
                            <button class="btn-submit-activity" onclick="window.activityTakingInterface.submitActivity()">
                                Submit Activity
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M22 2L11 13"/>
                                    <polygon points="22,2 15,22 11,13 2,9 22,2"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Go to question from review screen
     */
    goToQuestionFromReview(index) {
        this.currentQuestionIndex = index;
        this.render();
    }

    /**
     * Back to questions from review
     */
    backToQuestions() {
        this.render();
    }

    /**
     * Submit the activity
     */
    async submitActivity() {
        try {
            // Show confirmation dialog
            if (!confirm('Are you sure you want to submit? You won\'t be able to change your answers after submission.')) {
                return;
            }

            // Stop timer and auto-save
            this.cleanup();

            // Submit through response manager
            const result = await this.responseManager.submitResponse();
            
            if (result.success) {
                this.isSubmitted = true;
                UIUtils.showToast('Activity submitted successfully!', 'success');
                
                // Show results or return to activities
                setTimeout(() => {
                    if (this.currentActivity.showResultsImmediately) {
                        this.showResults(this.currentActivity.id);
                    } else {
                        window.currentActivitiesInterface.render();
                    }
                }, 2000);
            } else {
                UIUtils.showToast('Failed to submit: ' + result.errors.join(', '), 'error');
            }

        } catch (error) {
            console.error('Error submitting activity:', error);
            UIUtils.showToast('Error submitting activity', 'error');
        }
    }

    /**
     * Auto-submit when time runs out
     */
    async autoSubmit() {
        try {
            this.cleanup();
            
            UIUtils.showToast('Time\'s up! Submitting your responses...', 'warning');
            
            const result = await this.responseManager.submitResponse();
            
            if (result.success) {
                this.isSubmitted = true;
                UIUtils.showToast('Activity auto-submitted due to time limit', 'info');
                
                setTimeout(() => {
                    if (this.currentActivity.showResultsImmediately) {
                        this.showResults(this.currentActivity.id);
                    } else {
                        window.currentActivitiesInterface.render();
                    }
                }, 3000);
            }

        } catch (error) {
            console.error('Error auto-submitting activity:', error);
            UIUtils.showToast('Error auto-submitting activity', 'error');
        }
    }

    /**
     * Save progress
     */
    async saveProgress() {
        try {
            await this.responseManager.saveProgress();
            this.showAutoSaveIndicator();
        } catch (error) {
            console.error('Error saving progress:', error);
        }
    }

    /**
     * Show auto-save indicator
     */
    showAutoSaveIndicator() {
        const indicator = document.getElementById('autoSaveIndicator');
        if (indicator) {
            indicator.classList.add('show');
            setTimeout(() => {
                indicator.classList.remove('show');
            }, 2000);
        }
    }

    /**
     * Update timer display
     */
    updateTimerDisplay() {
        const timeRemaining = document.getElementById('timeRemaining');
        const timerDisplay = document.getElementById('timerDisplay');
        
        if (timeRemaining) {
            timeRemaining.textContent = this.formatTime(this.timeRemaining);
        }
        
        if (timerDisplay) {
            // Add warning classes based on time remaining
            timerDisplay.classList.remove('warning', 'critical');
            if (this.timeRemaining <= 5 * 60 * 1000) { // 5 minutes
                timerDisplay.classList.add('warning');
            }
            if (this.timeRemaining <= 1 * 60 * 1000) { // 1 minute
                timerDisplay.classList.add('critical');
            }
        }
    }

    /**
     * Confirm exit
     */
    confirmExit() {
        if (this.isSubmitted) {
            window.currentActivitiesInterface.render();
            return;
        }

        if (confirm('Are you sure you want to exit? Your progress will be saved, but you can continue later.')) {
            this.saveProgress();
            this.cleanup();
            window.currentActivitiesInterface.render();
        }
    }

    /**
     * Show results
     */
    showResults(activityId) {
        if (!window.currentActivitiesInterface.resultsViewer) {
            window.currentActivitiesInterface.resultsViewer = new ResultsViewer(
                this.activityManager, 
                this.questionRenderer
            );
        }
        window.currentActivitiesInterface.resultsViewer.showResults(activityId);
    }

    /**
     * Get unanswered questions
     */
    getUnansweredQuestions() {
        return this.currentActivity.questions
            .map((question, index) => ({ question, index }))
            .filter(({ question }) => {
                const answer = this.responseManager.getAnswer(question.id);
                return answer === null || answer === undefined || answer === '';
            });
    }

    /**
     * Format time in milliseconds to readable format
     */
    formatTime(milliseconds) {
        if (milliseconds <= 0) return '00:00';
        
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    /**
     * Cleanup timers and intervals
     */
    cleanup() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
    }

    /**
     * Destroy the interface
     */
    destroy() {
        this.cleanup();
        this.removeEventListeners();
        this.currentActivity = null;
        this.currentResponse = null;
        if (this.responseManager) {
            this.responseManager.reset();
        }
    }
}

// Export ActivityTakingInterface
window.ActivityTakingInterface = ActivityTakingInterface;

console.log('ActivityTakingInterface component loaded successfully');