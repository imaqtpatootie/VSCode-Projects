// ===== RESPONSE MANAGER COMPONENT =====

/**
 * ResponseManager Class
 * Handles student response processing, auto-save, and submission management
 */
class ResponseManager {
    constructor(activityManager = null) {
        this.activityManager = activityManager;
        this.currentResponse = null;
        this.currentActivity = null;
        this.autoSaveInterval = null;
        this.autoSaveDelay = 3000; // 3 seconds
        this.lastSaveTime = null;
        this.isDirty = false;
        this.isSubmitting = false;
        
        this.init();
    }

    /**
     * Initialize the Response Manager
     */
    init() {
        this.setupEventListeners();
        console.log('ResponseManager initialized');
    }

    /**
     * Setup event listeners for response handling
     */
    setupEventListeners() {
        // Listen for answer changes
        document.addEventListener('questionAnswerChanged', (event) => {
            this.handleAnswerChange(event.detail);
        });

        // Listen for page visibility changes (for auto-save)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.isDirty) {
                this.saveProgress();
            }
        });

        // Listen for beforeunload (page refresh/close)
        window.addEventListener('beforeunload', (event) => {
            if (this.isDirty && this.currentResponse) {
                this.saveProgress();
                event.preventDefault();
                event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
                return event.returnValue;
            }
        });
    }

    // ===== RESPONSE INITIALIZATION =====

    /**
     * Start a new response session for an activity
     * @param {Object} activity - Activity object
     * @param {string} studentId - Student ID
     * @returns {Promise<Object>} Initialization result
     */
    async startResponse(activity, studentId) {
        try {
            this.currentActivity = activity;
            
            // Check if student already has a response for this activity
            const existingResponse = window.activityManager?.getStudentResponse(activity.id, studentId);
            
            if (existingResponse) {
                // Resume existing response
                this.currentResponse = existingResponse;
                
                // Update start time if not set
                if (!this.currentResponse.startedAt) {
                    this.currentResponse.startedAt = new Date();
                }
            } else {
                // Create new response
                this.currentResponse = {
                    id: ActivitySystem.generateId('resp'),
                    activityId: activity.id,
                    studentId: studentId,
                    responses: {},
                    submissionStatus: ActivitySystem.SubmissionStatus.IN_PROGRESS,
                    startedAt: new Date(),
                    timeSpent: 0
                };
            }

            // Start auto-save
            this.startAutoSave();

            return {
                success: true,
                response: this.currentResponse,
                isResuming: !!existingResponse
            };

        } catch (error) {
            console.error('Error starting response:', error);
            return {
                success: false,
                errors: ['Failed to start response: ' + error.message]
            };
        }
    }

    /**
     * Load existing response data
     * @param {string} responseId - Response ID to load
     * @returns {Promise<Object>} Load result
     */
    async loadResponse(responseId) {
        try {
            // In a real implementation, this would load from server
            // For now, we'll use the ActivityManager
            const response = window.activityManager?.responses.get(responseId);
            
            if (!response) {
                return {
                    success: false,
                    errors: ['Response not found']
                };
            }

            this.currentResponse = response;
            this.currentActivity = window.activityManager?.getActivity(response.activityId);

            return {
                success: true,
                response: this.currentResponse,
                activity: this.currentActivity
            };

        } catch (error) {
            console.error('Error loading response:', error);
            return {
                success: false,
                errors: ['Failed to load response: ' + error.message]
            };
        }
    }

    // ===== ANSWER HANDLING =====

    /**
     * Handle answer change from question components
     * @param {Object} changeDetail - Change event detail
     */
    handleAnswerChange(changeDetail) {
        if (!this.currentResponse) return;

        const { questionId, answer, timestamp } = changeDetail;

        // Update response data
        this.currentResponse.responses[questionId] = answer;
        this.currentResponse.lastModified = timestamp;
        
        // Mark as dirty for auto-save
        this.isDirty = true;

        // Dispatch response updated event
        this.dispatchResponseUpdated();
    }

    /**
     * Set answer for a specific question
     * @param {string} questionId - Question ID
     * @param {any} answer - Answer value
     */
    setAnswer(questionId, answer) {
        if (!this.currentResponse) return;

        this.currentResponse.responses[questionId] = answer;
        this.currentResponse.lastModified = new Date();
        this.isDirty = true;

        this.dispatchResponseUpdated();
    }

    /**
     * Get answer for a specific question
     * @param {string} questionId - Question ID
     * @returns {any} Answer value
     */
    getAnswer(questionId) {
        return this.currentResponse?.responses[questionId] || null;
    }

    /**
     * Get all answers
     * @returns {Object} All answers object
     */
    getAllAnswers() {
        return this.currentResponse?.responses || {};
    }

    // ===== AUTO-SAVE FUNCTIONALITY =====

    /**
     * Start auto-save functionality
     */
    startAutoSave() {
        // Clear existing interval
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }

        // Set up new auto-save interval
        this.autoSaveInterval = setInterval(() => {
            if (this.isDirty && this.currentResponse) {
                this.saveProgress();
            }
        }, this.autoSaveDelay);
    }

    /**
     * Stop auto-save functionality
     */
    stopAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
    }

    /**
     * Save current progress
     * @returns {Promise<Object>} Save result
     */
    async saveProgress() {
        if (!this.currentResponse || this.isSubmitting) return;

        try {
            // Update time spent
            this.updateTimeSpent();

            // Save using ActivityManager - get from window if not available
            const activityManager = this.activityManager || window.activityManager;
            if (!activityManager) {
                throw new Error('ActivityManager not available');
            }

            const result = await activityManager.saveResponseProgress(
                this.currentResponse.activityId,
                this.currentResponse.studentId,
                this.currentResponse.responses
            );

            if (result?.success) {
                this.isDirty = false;
                this.lastSaveTime = new Date();
                
                // Update current response with saved data
                this.currentResponse = result.response;

                // Dispatch save success event
                this.dispatchSaveSuccess();

                return {
                    success: true,
                    savedAt: this.lastSaveTime
                };
            } else {
                throw new Error(result?.errors?.join(', ') || 'Save failed');
            }

        } catch (error) {
            console.error('Error saving progress:', error);
            
            // Try to save to localStorage as backup
            this.saveToLocalStorage();

            return {
                success: false,
                errors: ['Failed to save progress: ' + error.message]
            };
        }
    }

    /**
     * Save to localStorage as backup
     */
    saveToLocalStorage() {
        try {
            const backupKey = `response_backup_${this.currentResponse.activityId}_${this.currentResponse.studentId}`;
            const backupData = {
                ...this.currentResponse,
                backupTime: new Date().toISOString()
            };
            
            localStorage.setItem(backupKey, JSON.stringify(backupData));
            console.log('Response saved to localStorage backup');
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
        }
    }

    /**
     * Load from localStorage backup
     * @param {string} activityId - Activity ID
     * @param {string} studentId - Student ID
     * @returns {Object|null} Backup data or null
     */
    loadFromLocalStorage(activityId, studentId) {
        try {
            const backupKey = `response_backup_${activityId}_${studentId}`;
            const backupData = localStorage.getItem(backupKey);
            
            if (backupData) {
                const parsed = JSON.parse(backupData);
                console.log('Loaded response from localStorage backup');
                return parsed;
            }
        } catch (error) {
            console.error('Failed to load from localStorage:', error);
        }
        
        return null;
    }

    // ===== SUBMISSION HANDLING =====

    /**
     * Submit the current response
     * @returns {Promise<Object>} Submission result
     */
    async submitResponse() {
        if (!this.currentResponse || this.isSubmitting) {
            return {
                success: false,
                errors: ['No active response or already submitting']
            };
        }

        try {
            this.isSubmitting = true;

            // Final save before submission
            await this.saveProgress();

            // Update time spent
            this.updateTimeSpent();

            // Validate response before submission
            const validation = this.validateResponse();
            if (!validation.isValid && validation.hasRequiredErrors) {
                return {
                    success: false,
                    errors: validation.errors,
                    warnings: validation.warnings
                };
            }

            // Submit using ActivityManager - get from window if not available
            const activityManager = this.activityManager || window.activityManager;
            if (!activityManager) {
                throw new Error('ActivityManager not available');
            }

            const result = await activityManager.submitResponse(
                this.currentResponse.activityId,
                this.currentResponse.studentId,
                this.currentResponse.responses
            );

            if (result?.success) {
                // Update current response
                this.currentResponse = result.response;
                this.currentResponse.submittedAt = new Date();
                this.currentResponse.submissionStatus = ActivitySystem.SubmissionStatus.SUBMITTED;

                // Stop auto-save
                this.stopAutoSave();

                // Clear backup
                this.clearLocalStorageBackup();

                // Dispatch submission success event
                this.dispatchSubmissionSuccess();

                return {
                    success: true,
                    response: this.currentResponse,
                    warnings: validation.warnings
                };
            } else {
                throw new Error(result?.errors?.join(', ') || 'Submission failed');
            }

        } catch (error) {
            console.error('Error submitting response:', error);
            return {
                success: false,
                errors: ['Failed to submit response: ' + error.message]
            };
        } finally {
            this.isSubmitting = false;
        }
    }

    /**
     * Validate current response
     * @returns {Object} Validation result
     */
    validateResponse() {
        if (!this.currentResponse || !this.currentActivity) {
            return {
                isValid: false,
                hasRequiredErrors: true,
                errors: ['No active response or activity'],
                warnings: []
            };
        }

        const errors = [];
        const warnings = [];
        let hasRequiredErrors = false;

        // Check required questions
        this.currentActivity.questions.forEach((question, index) => {
            const answer = this.currentResponse.responses[question.id];
            const isEmpty = answer === null || answer === undefined || answer === '';

            if (question.required && isEmpty) {
                errors.push(`Question ${index + 1} is required`);
                hasRequiredErrors = true;
            } else if (isEmpty) {
                warnings.push(`Question ${index + 1} is not answered`);
            }

            // Type-specific validation
            if (!isEmpty) {
                const typeValidation = this.validateAnswerByType(answer, question);
                if (!typeValidation.isValid) {
                    errors.push(`Question ${index + 1}: ${typeValidation.error}`);
                }
            }
        });

        return {
            isValid: errors.length === 0,
            hasRequiredErrors,
            errors,
            warnings
        };
    }

    /**
     * Validate answer by question type
     * @param {any} answer - Answer to validate
     * @param {Object} question - Question object
     * @returns {Object} Validation result
     */
    validateAnswerByType(answer, question) {
        switch (question.type) {
            case ActivitySystem.QuestionType.MULTIPLE_CHOICE:
                if (!question.options.includes(answer)) {
                    return {
                        isValid: false,
                        error: 'Invalid option selected'
                    };
                }
                break;

            case ActivitySystem.QuestionType.TRUE_FALSE:
                const validAnswers = ['true', 'false', 'True', 'False', true, false];
                if (!validAnswers.includes(answer)) {
                    return {
                        isValid: false,
                        error: 'Invalid true/false answer'
                    };
                }
                break;

            case ActivitySystem.QuestionType.SHORT_ANSWER:
            case ActivitySystem.QuestionType.ESSAY:
                if (typeof answer !== 'string') {
                    return {
                        isValid: false,
                        error: 'Answer must be text'
                    };
                }
                
                if (question.maxLength && answer.length > question.maxLength) {
                    return {
                        isValid: false,
                        error: `Answer exceeds maximum length of ${question.maxLength} characters`
                    };
                }
                
                if (question.minLength && answer.length < question.minLength) {
                    return {
                        isValid: false,
                        error: `Answer must be at least ${question.minLength} characters`
                    };
                }
                break;
        }

        return { isValid: true };
    }

    // ===== UTILITY METHODS =====

    /**
     * Update time spent on the activity
     */
    updateTimeSpent() {
        if (!this.currentResponse || !this.currentResponse.startedAt) return;

        const now = new Date();
        const startTime = new Date(this.currentResponse.startedAt);
        this.currentResponse.timeSpent = Math.floor((now - startTime) / 1000); // in seconds
    }

    /**
     * Get formatted time spent
     * @returns {string} Formatted time string
     */
    getFormattedTimeSpent() {
        if (!this.currentResponse?.timeSpent) return '0 minutes';

        const seconds = this.currentResponse.timeSpent;
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        } else if (minutes > 0) {
            return `${minutes}m`;
        } else {
            return `${seconds}s`;
        }
    }

    /**
     * Get response completion percentage
     * @returns {number} Completion percentage (0-100)
     */
    getCompletionPercentage() {
        if (!this.currentResponse || !this.currentActivity) return 0;

        const totalQuestions = this.currentActivity.questions.length;
        if (totalQuestions === 0) return 100;

        const answeredQuestions = Object.keys(this.currentResponse.responses).filter(
            questionId => {
                const answer = this.currentResponse.responses[questionId];
                return answer !== null && answer !== undefined && answer !== '';
            }
        ).length;

        return Math.round((answeredQuestions / totalQuestions) * 100);
    }

    /**
     * Clear localStorage backup
     */
    clearLocalStorageBackup() {
        if (!this.currentResponse) return;

        try {
            const backupKey = `response_backup_${this.currentResponse.activityId}_${this.currentResponse.studentId}`;
            localStorage.removeItem(backupKey);
        } catch (error) {
            console.error('Failed to clear localStorage backup:', error);
        }
    }

    /**
     * Reset response manager
     */
    reset() {
        this.stopAutoSave();
        this.currentResponse = null;
        this.currentActivity = null;
        this.isDirty = false;
        this.isSubmitting = false;
        this.lastSaveTime = null;
    }

    // ===== EVENT DISPATCHING =====

    /**
     * Dispatch response updated event
     */
    dispatchResponseUpdated() {
        const event = new CustomEvent('responseUpdated', {
            detail: {
                response: this.currentResponse,
                completionPercentage: this.getCompletionPercentage(),
                timeSpent: this.getFormattedTimeSpent()
            }
        });
        document.dispatchEvent(event);
    }

    /**
     * Dispatch save success event
     */
    dispatchSaveSuccess() {
        const event = new CustomEvent('responseSaved', {
            detail: {
                response: this.currentResponse,
                savedAt: this.lastSaveTime
            }
        });
        document.dispatchEvent(event);
    }

    /**
     * Dispatch submission success event
     */
    dispatchSubmissionSuccess() {
        const event = new CustomEvent('responseSubmitted', {
            detail: {
                response: this.currentResponse,
                submittedAt: this.currentResponse.submittedAt
            }
        });
        document.dispatchEvent(event);
    }

    // ===== GETTERS =====

    /**
     * Get current response status
     * @returns {Object} Status information
     */
    getStatus() {
        return {
            hasActiveResponse: !!this.currentResponse,
            isSubmitted: this.currentResponse?.submissionStatus === ActivitySystem.SubmissionStatus.SUBMITTED,
            isDirty: this.isDirty,
            isSubmitting: this.isSubmitting,
            lastSaveTime: this.lastSaveTime,
            completionPercentage: this.getCompletionPercentage(),
            timeSpent: this.getFormattedTimeSpent()
        };
    }
}

// Export ResponseManager
window.ResponseManager = ResponseManager;

console.log('ResponseManager component loaded successfully');