// ===== RESULTS VIEWER COMPONENT =====

/**
 * ResultsViewer Class
 * Displays student results, grades, and feedback for completed activities
 */
class ResultsViewer {
    constructor(activityManager, questionRenderer) {
        this.activityManager = activityManager;
        this.questionRenderer = questionRenderer;
        this.currentActivity = null;
        this.currentResponse = null;
        this.studentId = 'student_123'; // In real app, would get from session
    }

    /**
     * Show results for a completed activity
     * @param {string} activityId - Activity ID to show results for
     */
    async showResults(activityId) {
        try {
            this.currentActivity = this.activityManager.getActivity(activityId);
            if (!this.currentActivity) {
                throw new Error('Activity not found');
            }

            this.currentResponse = this.activityManager.getStudentResponse(activityId, this.studentId);
            if (!this.currentResponse) {
                throw new Error('No submission found for this activity');
            }

            if (this.currentResponse.submissionStatus !== ActivitySystem.SubmissionStatus.SUBMITTED &&
                this.currentResponse.submissionStatus !== ActivitySystem.SubmissionStatus.GRADED) {
                throw new Error('Activity not yet submitted');
            }

            await this.render();

        } catch (error) {
            console.error('Error showing results:', error);
            UIUtils.showToast('Error loading results: ' + error.message, 'error');
        }
    }

    /**
     * Render the results viewer
     */
    async render() {
        const contentArea = document.getElementById('contentArea');
        if (!contentArea) return;

        const isGraded = !!this.currentResponse.grade;
        const grade = this.currentResponse.grade;

        contentArea.innerHTML = `
            <div class="results-viewer">
                <div class="results-header">
                    <div class="results-title">
                        <button class="btn-back" onclick="window.currentActivitiesInterface.render()">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="15,18 9,12 15,6"></polyline>
                            </svg>
                        </button>
                        <div>
                            <h1>📊 Results: ${this.currentActivity.title}</h1>
                            <p>${this.currentActivity.description}</p>
                        </div>
                    </div>
                    
                    ${isGraded ? `
                        <div class="grade-summary">
                            <div class="grade-display">
                                <div class="grade-score ${this.getGradeClass(grade.percentage)}">${grade.percentage}%</div>
                                <div class="grade-points">${grade.totalPoints}/${grade.maxPoints} points</div>
                                <div class="grade-letter">${this.getLetterGrade(grade.percentage)}</div>
                            </div>
                        </div>
                    ` : `
                        <div class="pending-grade">
                            <div class="pending-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="12" cy="12" r="10"/>
                                    <polyline points="12,6 12,12 16,14"/>
                                </svg>
                            </div>
                            <div class="pending-text">
                                <h3>Pending Review</h3>
                                <p>Your submission is being reviewed by your teacher</p>
                            </div>
                        </div>
                    `}
                </div>

                <div class="results-stats">
                    <div class="stat-card">
                        <div class="stat-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                <line x1="16" y1="2" x2="16" y2="6"/>
                                <line x1="8" y1="2" x2="8" y2="6"/>
                                <line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                        </div>
                        <div class="stat-content">
                            <div class="stat-value">${ActivitySystem.formatDate(this.currentResponse.submittedAt)}</div>
                            <div class="stat-label">Submitted</div>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="10"/>
                                <polyline points="12,6 12,12 16,14"/>
                            </svg>
                        </div>
                        <div class="stat-content">
                            <div class="stat-value">${this.formatTimeSpent(this.currentResponse.timeSpent)}</div>
                            <div class="stat-label">Time Spent</div>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M9 11H5a2 2 0 0 0-2 2v7c0 1.1.9 2 2 2h4m4-9h4a2 2 0 0 1 2 2v7c0 1.1-.9 2-2 2h-4m-4-9v9m0-9l3-3m-3 3l-3-3"/>
                            </svg>
                        </div>
                        <div class="stat-content">
                            <div class="stat-value">${this.getAnsweredCount()}/${this.currentActivity.questions.length}</div>
                            <div class="stat-label">Questions Answered</div>
                        </div>
                    </div>

                    ${isGraded && grade.gradedAt ? `
                        <div class="stat-card">
                            <div class="stat-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                                    <path d="M12 11l2 2 4-4"/>
                                </svg>
                            </div>
                            <div class="stat-content">
                                <div class="stat-value">${ActivitySystem.formatDate(grade.gradedAt)}</div>
                                <div class="stat-label">Graded</div>
                            </div>
                        </div>
                    ` : ''}
                </div>

                ${isGraded && grade.feedback ? `
                    <div class="overall-feedback-section">
                        <h3>💬 Teacher Feedback</h3>
                        <div class="feedback-content">
                            ${grade.feedback.replace(/\n/g, '<br>')}
                        </div>
                    </div>
                ` : ''}

                <div class="questions-review">
                    <h3>📝 Question Review</h3>
                    <div class="questions-list">
                        ${this.renderQuestionsReview()}
                    </div>
                </div>

                ${this.shouldShowCorrectAnswers() ? `
                    <div class="study-mode-toggle">
                        <label class="toggle-label">
                            <input type="checkbox" id="showCorrectAnswers" onchange="window.resultsViewer.toggleCorrectAnswers()">
                            <span class="toggle-slider"></span>
                            Show correct answers for study
                        </label>
                    </div>
                ` : ''}
            </div>
        `;

        // Store reference for global access
        window.resultsViewer = this;
    }

    /**
     * Render questions review
     */
    renderQuestionsReview() {
        return this.currentActivity.questions.map((question, index) => {
            const studentAnswer = this.currentResponse.responses[question.id];
            const questionGrade = this.currentResponse.grade?.questionGrades?.[question.id];
            const isGraded = !!questionGrade;
            const isCorrect = questionGrade?.isCorrect;
            const questionFeedback = questionGrade?.feedback;

            return `
                <div class="question-review-item ${isGraded ? (isCorrect ? 'correct' : 'incorrect') : 'ungraded'}">
                    <div class="question-review-header">
                        <div class="question-info">
                            <span class="question-number">${index + 1}</span>
                            <div class="question-details">
                                <div class="question-text">${question.question}</div>
                                <div class="question-meta">
                                    <span class="question-type">${this.getQuestionTypeName(question.type)}</span>
                                    <span class="question-points">${question.points} point${question.points !== 1 ? 's' : ''}</span>
                                </div>
                            </div>
                        </div>
                        <div class="question-score">
                            ${isGraded ? `
                                <div class="score-display ${isCorrect ? 'correct' : 'incorrect'}">
                                    <span class="score-points">${questionGrade.points}/${question.points}</span>
                                    <span class="score-icon">${isCorrect ? '✓' : '✗'}</span>
                                </div>
                            ` : `
                                <div class="score-display pending">
                                    <span class="score-text">Pending</span>
                                </div>
                            `}
                        </div>
                    </div>

                    <div class="question-content">
                        <div class="student-answer-section">
                            <h4>Your Answer:</h4>
                            <div class="answer-display">
                                ${this.renderStudentAnswer(question, studentAnswer)}
                            </div>
                        </div>

                        <div class="correct-answer-section" style="display: none;">
                            ${question.correctAnswer ? `
                                <h4>Correct Answer:</h4>
                                <div class="answer-display correct">
                                    ${this.renderCorrectAnswer(question)}
                                </div>
                            ` : ''}
                        </div>

                        ${questionFeedback ? `
                            <div class="question-feedback-section">
                                <h4>Feedback:</h4>
                                <div class="feedback-content">
                                    ${questionFeedback.replace(/\n/g, '<br>')}
                                </div>
                            </div>
                        ` : ''}
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
                return `<div class="choice-answer correct">${question.correctAnswer}</div>`;

            case ActivitySystem.QuestionType.SHORT_ANSWER:
                return `<div class="text-answer">${question.correctAnswer}</div>`;

            default:
                return `<div class="text-answer">${question.correctAnswer}</div>`;
        }
    }

    /**
     * Toggle correct answers visibility
     */
    toggleCorrectAnswers() {
        const checkbox = document.getElementById('showCorrectAnswers');
        const correctAnswerSections = document.querySelectorAll('.correct-answer-section');
        
        correctAnswerSections.forEach(section => {
            section.style.display = checkbox.checked ? 'block' : 'none';
        });
    }

    /**
     * Check if correct answers should be shown
     */
    shouldShowCorrectAnswers() {
        // Show correct answers if activity allows it or if it's been graded
        return this.currentActivity.showResultsImmediately || !!this.currentResponse.grade;
    }

    /**
     * Get answered questions count
     */
    getAnsweredCount() {
        return Object.values(this.currentResponse.responses).filter(answer => 
            answer !== null && answer !== undefined && answer !== ''
        ).length;
    }

    /**
     * Get grade class for styling
     */
    getGradeClass(percentage) {
        if (percentage >= 90) return 'excellent';
        if (percentage >= 80) return 'good';
        if (percentage >= 70) return 'satisfactory';
        if (percentage >= 60) return 'needs-improvement';
        return 'unsatisfactory';
    }

    /**
     * Get letter grade
     */
    getLetterGrade(percentage) {
        if (percentage >= 97) return 'A+';
        if (percentage >= 93) return 'A';
        if (percentage >= 90) return 'A-';
        if (percentage >= 87) return 'B+';
        if (percentage >= 83) return 'B';
        if (percentage >= 80) return 'B-';
        if (percentage >= 77) return 'C+';
        if (percentage >= 73) return 'C';
        if (percentage >= 70) return 'C-';
        if (percentage >= 67) return 'D+';
        if (percentage >= 65) return 'D';
        return 'F';
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

    /**
     * Format time spent
     */
    formatTimeSpent(seconds) {
        if (!seconds) return '0 minutes';
        
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        
        if (minutes > 0) {
            return `${minutes} minute${minutes !== 1 ? 's' : ''}${remainingSeconds > 0 ? ` ${remainingSeconds}s` : ''}`;
        } else {
            return `${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`;
        }
    }
}

// Export ResultsViewer
window.ResultsViewer = ResultsViewer;

console.log('ResultsViewer component loaded successfully');