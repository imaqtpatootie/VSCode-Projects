// ===== GRADING INTERFACE COMPONENT =====

/**
 * GradingInterface Class
 * Handles teacher grading and feedback functionality
 */
class GradingInterface {
    constructor(activityManager, questionRenderer) {
        this.activityManager = activityManager;
        this.questionRenderer = questionRenderer;
        this.currentActivity = null;
        this.currentSubmissions = [];
        this.currentSubmission = null;
        this.currentView = 'submissions'; // 'submissions' or 'grading'
        this.gradingData = {};
    }

    /**
     * Show submissions for an activity
     * @param {string} activityId - Activity ID to show submissions for
     */
    async showSubmissions(activityId) {
        try {
            this.currentActivity = this.activityManager.getActivity(activityId);
            if (!this.currentActivity) {
                throw new Error('Activity not found');
            }

            this.currentSubmissions = this.activityManager.getActivityResponses(activityId);
            this.currentView = 'submissions';

            await this.render();
        } catch (error) {
            console.error('Error showing submissions:', error);
            UIUtils.showToast('Error loading submissions', 'error');
        }
    }

    /**
     * Show grading interface for a specific submission
     * @param {string} submissionId - Submission ID to grade
     */
    async showGradingInterface(submissionId) {
        try {
            this.currentSubmission = this.currentSubmissions.find(s => s.id === submissionId);
            if (!this.currentSubmission) {
                throw new Error('Submission not found');
            }

            this.currentView = 'grading';
            this.initializeGradingData();

            await this.render();
        } catch (error) {
            console.error('Error showing grading interface:', error);
            UIUtils.showToast('Error loading grading interface', 'error');
        }
    }

    /**
     * Initialize grading data for current submission
     */
    initializeGradingData() {
        this.gradingData = {
            questionGrades: {},
            totalPoints: 0,
            maxPoints: this.currentActivity.questions.reduce((sum, q) => sum + q.points, 0),
            percentage: 0,
            feedback: this.currentSubmission.grade?.feedback || '',
            autoGraded: false
        };

        // Initialize question grades
        this.currentActivity.questions.forEach(question => {
            const existingGrade = this.currentSubmission.grade?.questionGrades?.[question.id];
            this.gradingData.questionGrades[question.id] = {
                points: existingGrade?.points || 0,
                maxPoints: question.points,
                feedback: existingGrade?.feedback || '',
                isCorrect: existingGrade?.isCorrect || false
            };
        });

        // Auto-grade if possible
        this.performAutoGrading();
        this.calculateTotalGrade();
    }

    /**
     * Perform automatic grading for applicable questions
     */
    performAutoGrading() {
        let hasAutoGraded = false;

        this.currentActivity.questions.forEach(question => {
            const studentAnswer = this.currentSubmission.responses[question.id];

            if (this.canAutoGrade(question, studentAnswer)) {
                const isCorrect = this.checkAnswer(question, studentAnswer);
                const points = isCorrect ? question.points : 0;

                this.gradingData.questionGrades[question.id] = {
                    ...this.gradingData.questionGrades[question.id],
                    points: points,
                    isCorrect: isCorrect,
                    autoGraded: true
                };

                hasAutoGraded = true;
            }
        });

        this.gradingData.autoGraded = hasAutoGraded;
    }

    /**
     * Check if a question can be auto-graded
     */
    canAutoGrade(question, studentAnswer) {
        if (!studentAnswer || !question.correctAnswer) return false;

        return question.type === ActivitySystem.QuestionType.MULTIPLE_CHOICE ||
            question.type === ActivitySystem.QuestionType.TRUE_FALSE;
    }

    /**
     * Check if student answer is correct
     */
    checkAnswer(question, studentAnswer) {
        if (!studentAnswer || !question.correctAnswer) return false;

        switch (question.type) {
            case ActivitySystem.QuestionType.MULTIPLE_CHOICE:
                return studentAnswer === question.correctAnswer;

            case ActivitySystem.QuestionType.TRUE_FALSE:
                const normalizedStudent = studentAnswer.toString().toLowerCase();
                const normalizedCorrect = question.correctAnswer.toString().toLowerCase();
                return normalizedStudent === normalizedCorrect;

            case ActivitySystem.QuestionType.SHORT_ANSWER:
                if (question.caseSensitive) {
                    return studentAnswer.trim() === question.correctAnswer.trim();
                } else {
                    return studentAnswer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();
                }

            default:
                return false;
        }
    }

    /**
     * Calculate total grade
     */
    calculateTotalGrade() {
        this.gradingData.totalPoints = Object.values(this.gradingData.questionGrades)
            .reduce((sum, grade) => sum + grade.points, 0);

        this.gradingData.percentage = this.gradingData.maxPoints > 0
            ? Math.round((this.gradingData.totalPoints / this.gradingData.maxPoints) * 100)
            : 0;
    }

    /**
     * Render the grading interface
     */
    async render() {
        const contentArea = document.getElementById('contentArea');
        if (!contentArea) return;

        if (this.currentView === 'submissions') {
            await this.renderSubmissionsList();
        } else if (this.currentView === 'grading') {
            await this.renderGradingInterface();
        }
    }

    /**
     * Render submissions list
     */
    async renderSubmissionsList() {
        const contentArea = document.getElementById('contentArea');

        contentArea.innerHTML = `
            <div class="grading-interface submissions-view">
                <div class="grading-header">
                    <div class="grading-title">
                        <button class="btn-back" onclick="window.currentActivitiesInterface.render()">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="15,18 9,12 15,6"></polyline>
                            </svg>
                        </button>
                        <div>
                            <h1>📊 Submissions: ${this.currentActivity.title}</h1>
                            <p>Review and grade student submissions</p>
                        </div>
                    </div>
                    <div class="submissions-stats">
                        <div class="stat-item">
                            <span class="stat-number">${this.currentSubmissions.length}</span>
                            <span class="stat-label">Total Submissions</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number">${this.getGradedCount()}</span>
                            <span class="stat-label">Graded</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number">${this.getPendingCount()}</span>
                            <span class="stat-label">Pending</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number">${this.getAverageScore()}%</span>
                            <span class="stat-label">Average Score</span>
                        </div>
                    </div>
                </div>

                <div class="submissions-filters">
                    <button class="filter-btn active" data-filter="all">All Submissions</button>
                    <button class="filter-btn" data-filter="graded">Graded</button>
                    <button class="filter-btn" data-filter="pending">Pending Review</button>
                    <button class="filter-btn" data-filter="auto-gradable">Auto-gradable</button>
                </div>

                <div class="submissions-content">
                    ${this.currentSubmissions.length === 0 ? `
                        <div class="empty-state">
                            <div class="empty-state-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                    <polyline points="14,2 14,8 20,8"/>
                                    <line x1="16" y1="13" x2="8" y2="13"/>
                                    <line x1="16" y1="17" x2="8" y2="17"/>
                                    <polyline points="10,9 9,9 8,9"/>
                                </svg>
                            </div>
                            <h3 class="empty-state-title">No Submissions Yet</h3>
                            <p class="empty-state-description">Students haven't submitted any responses to this activity yet.</p>
                        </div>
                    ` : `
                        <div class="submissions-grid">
                            ${this.renderSubmissionCards()}
                        </div>
                    `}
                </div>
            </div>
        `;

        // Setup event listeners
        this.setupSubmissionsEventListeners();
    }

    /**
     * Render submission cards
     */
    renderSubmissionCards() {
        return this.currentSubmissions.map(submission => {
            const isGraded = !!submission.grade;
            const canAutoGrade = this.canSubmissionBeAutoGraded(submission);
            const timeSpent = this.formatTimeSpent(submission.timeSpent);

            return `
                <div class="submission-card ${isGraded ? 'graded' : 'pending'}" data-submission-id="${submission.id}">
                    <div class="submission-header">
                        <div class="student-info">
                            <div class="student-avatar">
                                <span>${this.getStudentInitials(submission.studentId)}</span>
                            </div>
                            <div class="student-details">
                                <h3 class="student-name">${this.getStudentName(submission.studentId)}</h3>
                                <p class="student-id">${submission.studentId}</p>
                            </div>
                        </div>
                        <div class="submission-status">
                            ${isGraded ? `
                                <div class="grade-badge">
                                    <span class="grade-score">${submission.grade.percentage}%</span>
                                    <span class="grade-points">${submission.grade.totalPoints}/${submission.grade.maxPoints}</span>
                                </div>
                            ` : `
                                <div class="status-badge pending">
                                    ${canAutoGrade ? 'Auto-gradable' : 'Needs Review'}
                                </div>
                            `}
                        </div>
                    </div>

                    <div class="submission-meta">
                        <div class="meta-item">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                <line x1="16" y1="2" x2="16" y2="6"/>
                                <line x1="8" y1="2" x2="8" y2="6"/>
                                <line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                            <span>Submitted ${ActivitySystem.formatDate(submission.submittedAt)}</span>
                        </div>
                        <div class="meta-item">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="10"/>
                                <polyline points="12,6 12,12 16,14"/>
                            </svg>
                            <span>Time: ${timeSpent}</span>
                        </div>
                        <div class="meta-item">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M9 11H5a2 2 0 0 0-2 2v7c0 1.1.9 2 2 2h4m4-9h4a2 2 0 0 1 2 2v7c0 1.1-.9 2-2 2h-4m-4-9v9m0-9l3-3m-3 3l-3-3"/>
                            </svg>
                            <span>${this.getAnsweredCount(submission)}/${this.currentActivity.questions.length} answered</span>
                        </div>
                    </div>

                    <div class="submission-actions">
                        <button class="btn-grade-submission" onclick="window.gradingInterface.showGradingInterface('${submission.id}')">
                            ${isGraded ? 'Review Grade' : 'Grade Submission'}
                        </button>
                        ${canAutoGrade && !isGraded ? `
                            <button class="btn-auto-grade" onclick="window.gradingInterface.autoGradeSubmission('${submission.id}')">
                                Auto Grade
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Render grading interface
     */
    async renderGradingInterface() {
        const contentArea = document.getElementById('contentArea');

        contentArea.innerHTML = `
            <div class="grading-interface grading-view">
                <div class="grading-header">
                    <div class="grading-title">
                        <button class="btn-back" onclick="window.gradingInterface.showSubmissions('${this.currentActivity.id}')">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="15,18 9,12 15,6"></polyline>
                            </svg>
                        </button>
                        <div>
                            <h1>✏️ Grading: ${this.getStudentName(this.currentSubmission.studentId)}</h1>
                            <p>${this.currentActivity.title}</p>
                        </div>
                    </div>
                    <div class="grading-summary">
                        <div class="grade-display">
                            <div class="grade-score" id="totalScore">${this.gradingData.percentage}%</div>
                            <div class="grade-points" id="totalPoints">${this.gradingData.totalPoints}/${this.gradingData.maxPoints} points</div>
                        </div>
                        <div class="grading-actions">
                            <button class="btn-save-grade" onclick="window.gradingInterface.saveGrade()">
                                Save Grade
                            </button>
                            ${this.gradingData.autoGraded ? `
                                <button class="btn-auto-grade-info" title="Some questions were auto-graded">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <circle cx="12" cy="12" r="10"/>
                                        <path d="M12 6v6l4 2"/>
                                    </svg>
                                    Auto-graded
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>

                <div class="grading-content">
                    <div class="questions-grading">
                        ${this.renderQuestionsForGrading()}
                    </div>

                    <div class="overall-feedback">
                        <h3>📝 Overall Feedback</h3>
                        <textarea id="overallFeedback" class="feedback-textarea" placeholder="Provide overall feedback for the student...">${this.gradingData.feedback}</textarea>
                    </div>
                </div>
            </div>
        `;

        // Setup event listeners
        this.setupGradingEventListeners();

        // Store reference for global access
        window.gradingInterface = this;
    }

    /**
     * Render questions for grading
     */
    renderQuestionsForGrading() {
        return this.currentActivity.questions.map((question, index) => {
            const studentAnswer = this.currentSubmission.responses[question.id];
            const gradeData = this.gradingData.questionGrades[question.id];
            const isAutoGraded = gradeData.autoGraded;

            return `
                <div class="question-grading-item" data-question-id="${question.id}">
                    <div class="question-grading-header">
                        <div class="question-info">
                            <span class="question-number">${index + 1}</span>
                            <div class="question-details">
                                <div class="question-text">${question.question}</div>
                                <div class="question-meta">
                                    <span class="question-type">${this.getQuestionTypeName(question.type)}</span>
                                    <span class="question-max-points">${question.points} point${question.points !== 1 ? 's' : ''}</span>
                                </div>
                            </div>
                        </div>
                        <div class="question-grading-controls">
                            <div class="points-input">
                                <label>Points:</label>
                                <input type="number" class="points-input-field" min="0" max="${question.points}" step="0.5" 
                                       value="${gradeData.points}" data-question-id="${question.id}" 
                                       ${isAutoGraded ? 'readonly' : ''}>
                                <span class="max-points">/ ${question.points}</span>
                            </div>
                            ${isAutoGraded ? `
                                <div class="auto-grade-indicator" title="Auto-graded">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <circle cx="12" cy="12" r="10"/>
                                        <path d="M12 6v6l4 2"/>
                                    </svg>
                                </div>
                            ` : ''}
                        </div>
                    </div>

                    <div class="question-content">
                        <div class="student-answer">
                            <h4>Student Answer:</h4>
                            <div class="answer-display">
                                ${this.renderStudentAnswer(question, studentAnswer)}
                            </div>
                        </div>

                        ${question.correctAnswer ? `
                            <div class="correct-answer">
                                <h4>Correct Answer:</h4>
                                <div class="answer-display correct">
                                    ${this.renderCorrectAnswer(question)}
                                </div>
                            </div>
                        ` : ''}

                        <div class="question-feedback">
                            <label for="feedback-${question.id}">Question Feedback:</label>
                            <textarea id="feedback-${question.id}" class="question-feedback-textarea" 
                                      placeholder="Provide specific feedback for this question..."
                                      data-question-id="${question.id}">${gradeData.feedback}</textarea>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Render student answer based on question type
     */
    renderStudentAnswer(question, answer) {
        if (!answer) {
            return '<div class="no-answer">No answer provided</div>';
        }

        switch (question.type) {
            case ActivitySystem.QuestionType.MULTIPLE_CHOICE:
            case ActivitySystem.QuestionType.TRUE_FALSE:
                const isCorrect = answer === question.correctAnswer;
                return `
                    <div class="choice-answer ${isCorrect ? 'correct' : 'incorrect'}">
                        ${answer}
                        ${isCorrect ? '✓' : '✗'}
                    </div>
                `;

            case ActivitySystem.QuestionType.SHORT_ANSWER:
                return `<div class="text-answer">${answer}</div>`;

            case ActivitySystem.QuestionType.ESSAY:
                return `<div class="essay-answer">${answer.replace(/\n/g, '<br>')}</div>`;

            default:
                return `<div class="text-answer">${answer}</div>`;
        }
    }

    /**
     * Render correct answer
     */
    renderCorrectAnswer(question) {
        switch (question.type) {
            case ActivitySystem.QuestionType.MULTIPLE_CHOICE:
            case ActivitySystem.QuestionType.TRUE_FALSE:
                return `<div class="choice-answer correct">${question.correctAnswer} ✓</div>`;

            case ActivitySystem.QuestionType.SHORT_ANSWER:
                return `<div class="text-answer">${question.correctAnswer}</div>`;

            default:
                return `<div class="text-answer">${question.correctAnswer}</div>`;
        }
    }

    // ===== EVENT HANDLERS =====

    /**
     * Setup event listeners for submissions view
     */
    setupSubmissionsEventListeners() {
        // Filter buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('.filter-btn')) {
                document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');

                const filter = e.target.dataset.filter;
                this.applySubmissionsFilter(filter);
            }
        });
    }

    /**
     * Setup event listeners for grading view
     */
    setupGradingEventListeners() {
        // Points input changes
        document.addEventListener('input', (e) => {
            if (e.target.matches('.points-input-field')) {
                const questionId = e.target.dataset.questionId;
                const points = parseFloat(e.target.value) || 0;

                this.gradingData.questionGrades[questionId].points = points;
                this.calculateTotalGrade();
                this.updateGradeDisplay();
            }
        });

        // Question feedback changes
        document.addEventListener('input', (e) => {
            if (e.target.matches('.question-feedback-textarea')) {
                const questionId = e.target.dataset.questionId;
                this.gradingData.questionGrades[questionId].feedback = e.target.value;
            }
        });

        // Overall feedback changes
        document.addEventListener('input', (e) => {
            if (e.target.matches('#overallFeedback')) {
                this.gradingData.feedback = e.target.value;
            }
        });
    }

    /**
     * Apply filter to submissions
     */
    applySubmissionsFilter(filter) {
        const cards = document.querySelectorAll('.submission-card');

        cards.forEach(card => {
            const shouldShow = this.shouldShowSubmissionCard(card, filter);
            card.style.display = shouldShow ? 'block' : 'none';
        });
    }

    /**
     * Determine if submission card should be shown
     */
    shouldShowSubmissionCard(card, filter) {
        const submissionId = card.dataset.submissionId;
        const submission = this.currentSubmissions.find(s => s.id === submissionId);

        if (!submission) return false;

        switch (filter) {
            case 'all':
                return true;
            case 'graded':
                return !!submission.grade;
            case 'pending':
                return !submission.grade;
            case 'auto-gradable':
                return !submission.grade && this.canSubmissionBeAutoGraded(submission);
            default:
                return true;
        }
    }

    /**
     * Update grade display
     */
    updateGradeDisplay() {
        const totalScore = document.getElementById('totalScore');
        const totalPoints = document.getElementById('totalPoints');

        if (totalScore) {
            totalScore.textContent = this.gradingData.percentage + '%';
        }

        if (totalPoints) {
            totalPoints.textContent = `${this.gradingData.totalPoints}/${this.gradingData.maxPoints} points`;
        }
    }

    // ===== GRADING ACTIONS =====

    /**
     * Auto-grade a submission
     */
    async autoGradeSubmission(submissionId) {
        try {
            const submission = this.currentSubmissions.find(s => s.id === submissionId);
            if (!submission) {
                throw new Error('Submission not found');
            }

            // Perform auto-grading
            let totalPoints = 0;
            const maxPoints = this.currentActivity.questions.reduce((sum, q) => sum + q.points, 0);
            const questionGrades = {};

            this.currentActivity.questions.forEach(question => {
                const studentAnswer = submission.responses[question.id];

                if (this.canAutoGrade(question, studentAnswer)) {
                    const isCorrect = this.checkAnswer(question, studentAnswer);
                    const points = isCorrect ? question.points : 0;
                    totalPoints += points;

                    questionGrades[question.id] = {
                        points,
                        maxPoints: question.points,
                        isCorrect,
                        autoGraded: true
                    };
                }
            });

            const percentage = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0;

            // Save the grade
            const gradeData = {
                totalPoints,
                maxPoints,
                percentage,
                questionGrades,
                feedback: 'Auto-graded submission',
                gradedBy: 'system',
                gradedAt: new Date(),
                autoGraded: true
            };

            // Update submission with grade
            submission.grade = gradeData;
            submission.submissionStatus = ActivitySystem.SubmissionStatus.GRADED;

            // Save to storage
            this.activityManager.saveToStorage();

            UIUtils.showToast('Submission auto-graded successfully!', 'success');

            // Refresh the view
            await this.renderSubmissionsList();

        } catch (error) {
            console.error('Error auto-grading submission:', error);
            UIUtils.showToast('Error auto-grading submission', 'error');
        }
    }

    /**
     * Save grade for current submission
     */
    async saveGrade() {
        try {
            // Prepare grade data
            const gradeData = {
                totalPoints: this.gradingData.totalPoints,
                maxPoints: this.gradingData.maxPoints,
                percentage: this.gradingData.percentage,
                questionGrades: this.gradingData.questionGrades,
                feedback: this.gradingData.feedback,
                gradedBy: 'teacher', // In real app, would use current teacher ID
                gradedAt: new Date(),
                autoGraded: this.gradingData.autoGraded
            };

            // Update submission
            this.currentSubmission.grade = gradeData;
            this.currentSubmission.submissionStatus = ActivitySystem.SubmissionStatus.GRADED;

            // Save to storage
            this.activityManager.saveToStorage();

            UIUtils.showToast('Grade saved successfully!', 'success');

            // Return to submissions view
            setTimeout(() => {
                this.showSubmissions(this.currentActivity.id);
            }, 1500);

        } catch (error) {
            console.error('Error saving grade:', error);
            UIUtils.showToast('Error saving grade', 'error');
        }
    }

    // ===== UTILITY METHODS =====

    /**
     * Get graded submissions count
     */
    getGradedCount() {
        return this.currentSubmissions.filter(s => !!s.grade).length;
    }

    /**
     * Get pending submissions count
     */
    getPendingCount() {
        return this.currentSubmissions.filter(s => !s.grade).length;
    }

    /**
     * Get average score
     */
    getAverageScore() {
        const gradedSubmissions = this.currentSubmissions.filter(s => !!s.grade);
        if (gradedSubmissions.length === 0) return 0;

        const totalScore = gradedSubmissions.reduce((sum, s) => sum + s.grade.percentage, 0);
        return Math.round(totalScore / gradedSubmissions.length);
    }

    /**
     * Check if submission can be auto-graded
     */
    canSubmissionBeAutoGraded(submission) {
        return this.currentActivity.questions.some(question => {
            const studentAnswer = submission.responses[question.id];
            return this.canAutoGrade(question, studentAnswer);
        });
    }

    /**
     * Get answered questions count
     */
    getAnsweredCount(submission) {
        return Object.values(submission.responses).filter(answer =>
            answer !== null && answer !== undefined && answer !== ''
        ).length;
    }

    /**
     * Get student name (placeholder - in real app would fetch from user data)
     */
    getStudentName(studentId) {
        // In a real application, this would fetch from user database
        return `Student ${studentId.slice(-3)}`;
    }

    /**
     * Get student initials
     */
    getStudentInitials(studentId) {
        const name = this.getStudentName(studentId);
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }

    /**
     * Format time spent
     */
    formatTimeSpent(seconds) {
        if (!seconds) return '0m';

        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        if (minutes > 0) {
            return `${minutes}m ${remainingSeconds}s`;
        } else {
            return `${remainingSeconds}s`;
        }
    }

    /**
     * Get question type name
     */
    getQuestionTypeName(type) {
        const names = {
            'multiple_choice': 'Multiple Choice',
            'true_false': 'True/False',
            'short_answer': 'Short Answer',
            'essay': 'Essay'
        };
        return names[type] || 'Unknown';
    }
}

// Export GradingInterface
window.GradingInterface = GradingInterface;

console.log('GradingInterface component loaded successfully');