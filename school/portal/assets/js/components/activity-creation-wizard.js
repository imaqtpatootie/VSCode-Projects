// ===== ACTIVITY CREATION WIZARD COMPONENT =====

/**
 * ActivityCreationWizard Class
 * Step-by-step activity creation interface with question builder
 */
class ActivityCreationWizard {
    constructor(activityManager, questionBuilder) {
        this.activityManager = activityManager;
        this.questionBuilder = questionBuilder;
        this.currentStep = 1;
        this.totalSteps = 4;
        this.activityData = {};
        this.isEditing = false;
        this.editingActivityId = null;
        
        this.steps = [
            { id: 1, title: 'Basic Information', icon: 'info' },
            { id: 2, title: 'Settings & Schedule', icon: 'settings' },
            { id: 3, title: 'Questions', icon: 'questions' },
            { id: 4, title: 'Review & Publish', icon: 'review' }
        ];
    }

    /**
     * Show the creation wizard
     * @param {string} activityId - Optional activity ID for editing
     */
    async show(activityId = null) {
        this.isEditing = !!activityId;
        this.editingActivityId = activityId;
        this.currentStep = 1;

        // Load existing activity data if editing
        if (this.isEditing) {
            const activity = this.activityManager.getActivity(activityId);
            if (activity) {
                this.activityData = { ...activity };
                this.questionBuilder.importQuestions(activity.questions);
            }
        } else {
            this.activityData = {};
            this.questionBuilder.clearAllQuestions();
        }

        this.render();
    }

    /**
     * Render the wizard interface
     */
    render() {
        const contentArea = document.getElementById('contentArea');
        if (!contentArea) return;

        contentArea.innerHTML = `
            <div class="activity-creation-wizard">
                <div class="wizard-header">
                    <div class="wizard-title">
                        <h1>${this.isEditing ? '✏️ Edit Activity' : '➕ Create New Activity'}</h1>
                        <p>Step ${this.currentStep} of ${this.totalSteps}</p>
                    </div>
                    <button class="btn-close-wizard" onclick="window.currentActivitiesInterface.render()">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <div class="wizard-progress">
                    ${this.renderProgressSteps()}
                </div>

                <div class="wizard-content">
                    ${this.renderCurrentStep()}
                </div>

                <div class="wizard-navigation">
                    <button class="btn-wizard-nav btn-previous" ${this.currentStep === 1 ? 'disabled' : ''} onclick="window.activityWizard.previousStep()">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="15,18 9,12 15,6"></polyline>
                        </svg>
                        Previous
                    </button>
                    
                    <button class="btn-wizard-nav btn-next" onclick="window.activityWizard.nextStep()">
                        ${this.currentStep === this.totalSteps ? 'Save Activity' : 'Next'}
                        ${this.currentStep !== this.totalSteps ? `
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="9,18 15,12 9,6"></polyline>
                            </svg>
                        ` : ''}
                    </button>
                </div>
            </div>
        `;

        // Store reference for global access
        window.activityWizard = this;
    }

    /**
     * Render progress steps
     */
    renderProgressSteps() {
        return this.steps.map(step => `
            <div class="progress-step ${step.id <= this.currentStep ? 'active' : ''} ${step.id < this.currentStep ? 'completed' : ''}">
                <div class="step-number">${step.id}</div>
                <div class="step-title">${step.title}</div>
            </div>
        `).join('');
    }

    /**
     * Render current step content
     */
    renderCurrentStep() {
        switch (this.currentStep) {
            case 1:
                return this.renderBasicInformationStep();
            case 2:
                return this.renderSettingsStep();
            case 3:
                return this.renderQuestionsStep();
            case 4:
                return this.renderReviewStep();
            default:
                return '<div>Invalid step</div>';
        }
    }

    /**
     * Render basic information step
     */
    renderBasicInformationStep() {
        return `
            <div class="wizard-step step-basic-info">
                <h2>📝 Basic Information</h2>
                <p>Provide the essential details for your activity.</p>

                <div class="form-section">
                    <div class="form-group">
                        <label class="form-label required" for="activityTitle">Activity Title</label>
                        <input type="text" id="activityTitle" class="form-input" placeholder="Enter activity title" 
                               value="${this.activityData.title || ''}" maxlength="200">
                        <div class="form-help">Choose a clear, descriptive title for your activity</div>
                    </div>

                    <div class="form-group">
                        <label class="form-label required" for="activityDescription">Description</label>
                        <textarea id="activityDescription" class="form-textarea" placeholder="Describe what this activity covers" 
                                  maxlength="1000">${this.activityData.description || ''}</textarea>
                        <div class="form-help">Provide a brief overview of the activity content and objectives</div>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="activityInstructions">Instructions for Students</label>
                        <textarea id="activityInstructions" class="form-textarea" placeholder="Enter detailed instructions for students" 
                                  maxlength="2000">${this.activityData.instructions || ''}</textarea>
                        <div class="form-help">Provide clear instructions on how students should complete the activity</div>
                    </div>

                    <div class="form-group">
                        <label class="form-label required" for="assignedClasses">Assign to Classes</label>
                        <select id="assignedClasses" class="form-select" multiple>
                            <option value="class_101" ${this.activityData.assignedClasses?.includes('class_101') ? 'selected' : ''}>Grade 10 - Section A</option>
                            <option value="class_102" ${this.activityData.assignedClasses?.includes('class_102') ? 'selected' : ''}>Grade 10 - Section B</option>
                            <option value="class_103" ${this.activityData.assignedClasses?.includes('class_103') ? 'selected' : ''}>Grade 10 - Section C</option>
                            <option value="class_201" ${this.activityData.assignedClasses?.includes('class_201') ? 'selected' : ''}>Grade 11 - Section A</option>
                            <option value="class_202" ${this.activityData.assignedClasses?.includes('class_202') ? 'selected' : ''}>Grade 11 - Section B</option>
                            <option value="class_301" ${this.activityData.assignedClasses?.includes('class_301') ? 'selected' : ''}>Grade 12 - Section A</option>
                        </select>
                        <div class="form-help">Hold Ctrl/Cmd to select multiple classes</div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render settings step
     */
    renderSettingsStep() {
        const dueDate = this.activityData.dueDate ? new Date(this.activityData.dueDate).toISOString().slice(0, 16) : '';
        const startDate = this.activityData.startDate ? new Date(this.activityData.startDate).toISOString().slice(0, 16) : '';
        const endDate = this.activityData.endDate ? new Date(this.activityData.endDate).toISOString().slice(0, 16) : '';

        return `
            <div class="wizard-step step-settings">
                <h2>⚙️ Settings & Schedule</h2>
                <p>Configure timing and access settings for your activity.</p>

                <div class="form-section">
                    <h3 class="form-section-title">📅 Schedule</h3>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label required" for="dueDate">Due Date & Time</label>
                            <input type="datetime-local" id="dueDate" class="form-input" value="${dueDate}">
                            <div class="form-help">When students must submit their responses</div>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label" for="startDate">Available From (Optional)</label>
                            <input type="datetime-local" id="startDate" class="form-input" value="${startDate}">
                            <div class="form-help">When students can start accessing the activity</div>
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="endDate">Available Until (Optional)</label>
                            <input type="datetime-local" id="endDate" class="form-input" value="${endDate}">
                            <div class="form-help">When the activity becomes unavailable</div>
                        </div>
                    </div>
                </div>

                <div class="form-section">
                    <h3 class="form-section-title">⏱️ Time Limits</h3>
                    
                    <div class="form-group">
                        <label class="form-label" for="timeLimit">Time Limit (Minutes)</label>
                        <input type="number" id="timeLimit" class="form-input" placeholder="No limit" min="1" max="480" 
                               value="${this.activityData.timeLimit || ''}">
                        <div class="form-help">Maximum time students have to complete the activity (leave empty for no limit)</div>
                    </div>

                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="allowLateSubmission" ${this.activityData.allowLateSubmission ? 'checked' : ''}>
                            <span class="checkbox-custom"></span>
                            Allow late submissions
                        </label>
                        <div class="form-help">Students can submit after the due date (may be marked as late)</div>
                    </div>
                </div>

                <div class="form-section">
                    <h3 class="form-section-title">🔒 Access Control</h3>
                    
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="shuffleQuestions" ${this.activityData.shuffleQuestions ? 'checked' : ''}>
                            <span class="checkbox-custom"></span>
                            Shuffle question order for each student
                        </label>
                        <div class="form-help">Questions will appear in random order to prevent cheating</div>
                    </div>

                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="showResultsImmediately" ${this.activityData.showResultsImmediately ? 'checked' : ''}>
                            <span class="checkbox-custom"></span>
                            Show results immediately after submission
                        </label>
                        <div class="form-help">Students will see their scores and correct answers right away</div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render questions step
     */
    renderQuestionsStep() {
        return `
            <div class="wizard-step step-questions">
                <h2>❓ Questions</h2>
                <p>Add questions to your activity. You can create different types of questions to assess student understanding.</p>

                <div class="questions-builder-container">
                    <div class="questions-toolbar">
                        <div class="question-stats">
                            <span class="stat-item">
                                <strong id="questionCount">${this.questionBuilder.questions.length}</strong> Questions
                            </span>
                            <span class="stat-item">
                                <strong id="totalPoints">${this.questionBuilder.getTotalPoints()}</strong> Total Points
                            </span>
                        </div>
                        <div class="question-actions">
                            <div class="dropdown">
                                <button class="btn-add-question" id="addQuestionBtn">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <line x1="12" y1="5" x2="12" y2="19"></line>
                                        <line x1="5" y1="12" x2="19" y2="12"></line>
                                    </svg>
                                    Add Question
                                </button>
                                <div class="dropdown-menu" id="questionTypeMenu">
                                    <button class="dropdown-item" onclick="window.activityWizard.addQuestion('multiple_choice')">
                                        <span class="question-type-icon">🔘</span>
                                        Multiple Choice
                                    </button>
                                    <button class="dropdown-item" onclick="window.activityWizard.addQuestion('true_false')">
                                        <span class="question-type-icon">✅</span>
                                        True/False
                                    </button>
                                    <button class="dropdown-item" onclick="window.activityWizard.addQuestion('short_answer')">
                                        <span class="question-type-icon">📝</span>
                                        Short Answer
                                    </button>
                                    <button class="dropdown-item" onclick="window.activityWizard.addQuestion('essay')">
                                        <span class="question-type-icon">📄</span>
                                        Essay
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="questions-list" id="questionsList">
                        ${this.renderQuestionsList()}
                    </div>

                    ${this.questionBuilder.questions.length === 0 ? `
                        <div class="empty-questions-state">
                            <div class="empty-state-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="12" cy="12" r="10"/>
                                    <path d="M9,9h.01"/>
                                    <path d="M15,9h.01"/>
                                    <path d="M8,15s1.5,2 4,2 4-2 4-2"/>
                                </svg>
                            </div>
                            <h3>No Questions Yet</h3>
                            <p>Add your first question to get started with your activity.</p>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    /**
     * Render questions list
     */
    renderQuestionsList() {
        const questions = this.questionBuilder.getAllQuestions();
        
        return questions.map((question, index) => `
            <div class="question-item" data-question-id="${question.id}">
                <div class="question-header">
                    <div class="question-number">${index + 1}</div>
                    <div class="question-content">
                        <div class="question-text">${question.question || 'Untitled Question'}</div>
                        <div class="question-details">
                            <span class="question-type-indicator">
                                ${this.getQuestionTypeIcon(question.type)} ${this.getQuestionTypeName(question.type)}
                            </span>
                            <span class="question-points">${question.points} point${question.points !== 1 ? 's' : ''}</span>
                        </div>
                    </div>
                    <div class="question-actions">
                        <button class="btn-question-action" onclick="window.activityWizard.editQuestion('${question.id}')" title="Edit Question">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </button>
                        <button class="btn-question-action" onclick="window.activityWizard.duplicateQuestion('${question.id}')" title="Duplicate Question">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                            </svg>
                        </button>
                        <button class="btn-question-action danger" onclick="window.activityWizard.deleteQuestion('${question.id}')" title="Delete Question">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="3,6 5,6 21,6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                <line x1="10" y1="11" x2="10" y2="17"/>
                                <line x1="14" y1="11" x2="14" y2="17"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Render review step
     */
    renderReviewStep() {
        const questions = this.questionBuilder.getAllQuestions();
        const validation = this.questionBuilder.checkPublishingReadiness();
        
        return `
            <div class="wizard-step step-review">
                <h2>👀 Review & Publish</h2>
                <p>Review your activity details before ${this.isEditing ? 'saving changes' : 'creating the activity'}.</p>

                <div class="review-sections">
                    <div class="review-section">
                        <h3>📝 Basic Information</h3>
                        <div class="review-item">
                            <strong>Title:</strong> ${this.activityData.title || 'Not set'}
                        </div>
                        <div class="review-item">
                            <strong>Description:</strong> ${this.activityData.description || 'Not set'}
                        </div>
                        <div class="review-item">
                            <strong>Assigned Classes:</strong> ${this.activityData.assignedClasses?.length || 0} class${(this.activityData.assignedClasses?.length || 0) !== 1 ? 'es' : ''}
                        </div>
                    </div>

                    <div class="review-section">
                        <h3>⚙️ Settings</h3>
                        <div class="review-item">
                            <strong>Due Date:</strong> ${this.activityData.dueDate ? ActivitySystem.formatDate(new Date(this.activityData.dueDate)) : 'Not set'}
                        </div>
                        <div class="review-item">
                            <strong>Time Limit:</strong> ${this.activityData.timeLimit ? this.activityData.timeLimit + ' minutes' : 'No limit'}
                        </div>
                        <div class="review-item">
                            <strong>Late Submissions:</strong> ${this.activityData.allowLateSubmission ? 'Allowed' : 'Not allowed'}
                        </div>
                    </div>

                    <div class="review-section">
                        <h3>❓ Questions</h3>
                        <div class="review-item">
                            <strong>Total Questions:</strong> ${questions.length}
                        </div>
                        <div class="review-item">
                            <strong>Total Points:</strong> ${this.questionBuilder.getTotalPoints()}
                        </div>
                        <div class="review-item">
                            <strong>Question Types:</strong>
                            <div class="question-type-summary">
                                ${Object.entries(this.questionBuilder.getQuestionCountByType())
                                    .filter(([type, count]) => count > 0)
                                    .map(([type, count]) => `<span class="type-count">${this.getQuestionTypeName(type)}: ${count}</span>`)
                                    .join(', ') || 'None'}
                            </div>
                        </div>
                    </div>
                </div>

                ${!validation.isReady ? `
                    <div class="validation-issues">
                        <h3>⚠️ Issues to Address</h3>
                        ${validation.validationErrors.map(error => `<div class="validation-error">❌ ${error}</div>`).join('')}
                        ${validation.readinessIssues.map(issue => `<div class="validation-warning">⚠️ ${issue}</div>`).join('')}
                    </div>
                ` : ''}

                ${validation.warnings.length > 0 ? `
                    <div class="validation-warnings">
                        <h3>💡 Recommendations</h3>
                        ${validation.warnings.map(warning => `<div class="validation-info">💡 ${warning}</div>`).join('')}
                    </div>
                ` : ''}

                <div class="publish-options">
                    <h3>📤 Publishing Options</h3>
                    <div class="form-group">
                        <label class="radio-label">
                            <input type="radio" name="publishOption" value="draft" checked>
                            <span class="radio-custom"></span>
                            Save as Draft
                            <div class="option-description">Save the activity but don't make it available to students yet</div>
                        </label>
                    </div>
                    <div class="form-group">
                        <label class="radio-label">
                            <input type="radio" name="publishOption" value="publish" ${!validation.isReady ? 'disabled' : ''}>
                            <span class="radio-custom"></span>
                            Publish Immediately
                            <div class="option-description">Make the activity available to students right away</div>
                        </label>
                    </div>
                </div>
            </div>
        `;
    }

    // ===== NAVIGATION METHODS =====

    /**
     * Go to next step
     */
    async nextStep() {
        // Validate current step
        if (!await this.validateCurrentStep()) {
            return;
        }

        // Save current step data
        this.saveCurrentStepData();

        if (this.currentStep === this.totalSteps) {
            // Final step - save activity
            await this.saveActivity();
        } else {
            // Move to next step
            this.currentStep++;
            this.render();
        }
    }

    /**
     * Go to previous step
     */
    previousStep() {
        if (this.currentStep > 1) {
            this.saveCurrentStepData();
            this.currentStep--;
            this.render();
        }
    }

    /**
     * Validate current step
     */
    async validateCurrentStep() {
        switch (this.currentStep) {
            case 1:
                return this.validateBasicInformation();
            case 2:
                return this.validateSettings();
            case 3:
                return this.validateQuestions();
            case 4:
                return true; // Review step doesn't need validation
            default:
                return true;
        }
    }

    /**
     * Validate basic information step
     */
    validateBasicInformation() {
        const title = document.getElementById('activityTitle')?.value.trim();
        const description = document.getElementById('activityDescription')?.value.trim();
        const assignedClasses = Array.from(document.getElementById('assignedClasses')?.selectedOptions || [])
            .map(option => option.value);

        if (!title) {
            UIUtils.showToast('Please enter an activity title', 'error');
            document.getElementById('activityTitle')?.focus();
            return false;
        }

        if (!description) {
            UIUtils.showToast('Please enter an activity description', 'error');
            document.getElementById('activityDescription')?.focus();
            return false;
        }

        if (assignedClasses.length === 0) {
            UIUtils.showToast('Please assign the activity to at least one class', 'error');
            document.getElementById('assignedClasses')?.focus();
            return false;
        }

        return true;
    }

    /**
     * Validate settings step
     */
    validateSettings() {
        const dueDate = document.getElementById('dueDate')?.value;
        const startDate = document.getElementById('startDate')?.value;
        const endDate = document.getElementById('endDate')?.value;

        if (!dueDate) {
            UIUtils.showToast('Please set a due date for the activity', 'error');
            document.getElementById('dueDate')?.focus();
            return false;
        }

        const dueDateObj = new Date(dueDate);
        const now = new Date();

        if (dueDateObj <= now) {
            UIUtils.showToast('Due date must be in the future', 'error');
            document.getElementById('dueDate')?.focus();
            return false;
        }

        if (startDate && endDate) {
            const startDateObj = new Date(startDate);
            const endDateObj = new Date(endDate);

            if (startDateObj >= endDateObj) {
                UIUtils.showToast('End date must be after start date', 'error');
                document.getElementById('endDate')?.focus();
                return false;
            }

            if (endDateObj > dueDateObj) {
                UIUtils.showToast('End date cannot be after due date', 'error');
                document.getElementById('endDate')?.focus();
                return false;
            }
        }

        return true;
    }

    /**
     * Validate questions step
     */
    validateQuestions() {
        if (this.questionBuilder.questions.length === 0) {
            UIUtils.showToast('Please add at least one question to the activity', 'error');
            return false;
        }

        const validation = this.questionBuilder.validateAllQuestions();
        if (!validation.isValid) {
            UIUtils.showToast('Please fix the issues with your questions before proceeding', 'error');
            return false;
        }

        return true;
    }

    /**
     * Save current step data
     */
    saveCurrentStepData() {
        switch (this.currentStep) {
            case 1:
                this.saveBasicInformation();
                break;
            case 2:
                this.saveSettings();
                break;
            case 3:
                // Questions are managed by QuestionBuilder
                break;
        }
    }

    /**
     * Save basic information
     */
    saveBasicInformation() {
        this.activityData.title = document.getElementById('activityTitle')?.value.trim();
        this.activityData.description = document.getElementById('activityDescription')?.value.trim();
        this.activityData.instructions = document.getElementById('activityInstructions')?.value.trim();
        this.activityData.assignedClasses = Array.from(document.getElementById('assignedClasses')?.selectedOptions || [])
            .map(option => option.value);
    }

    /**
     * Save settings
     */
    saveSettings() {
        this.activityData.dueDate = document.getElementById('dueDate')?.value;
        this.activityData.startDate = document.getElementById('startDate')?.value || null;
        this.activityData.endDate = document.getElementById('endDate')?.value || null;
        this.activityData.timeLimit = parseInt(document.getElementById('timeLimit')?.value) || null;
        this.activityData.allowLateSubmission = document.getElementById('allowLateSubmission')?.checked || false;
        this.activityData.shuffleQuestions = document.getElementById('shuffleQuestions')?.checked || false;
        this.activityData.showResultsImmediately = document.getElementById('showResultsImmediately')?.checked || false;
    }

    /**
     * Save the complete activity
     */
    async saveActivity() {
        try {
            // Get publish option
            const publishOption = document.querySelector('input[name="publishOption"]:checked')?.value || 'draft';

            // Prepare activity data
            const activityData = {
                ...this.activityData,
                questions: this.questionBuilder.exportQuestions(),
                dueDate: new Date(this.activityData.dueDate),
                startDate: this.activityData.startDate ? new Date(this.activityData.startDate) : null,
                endDate: this.activityData.endDate ? new Date(this.activityData.endDate) : null
            };

            let result;

            if (this.isEditing) {
                // Update existing activity
                result = await this.activityManager.updateActivity(this.editingActivityId, activityData);
            } else {
                // Create new activity
                result = await this.activityManager.createActivity(activityData);
            }

            if (result.success) {
                // Publish if requested
                if (publishOption === 'publish') {
                    const publishResult = await this.activityManager.publishActivity(result.activity.id);
                    if (!publishResult.success) {
                        UIUtils.showToast('Activity saved but failed to publish: ' + publishResult.errors.join(', '), 'warning');
                    }
                }

                const message = this.isEditing ? 'Activity updated successfully!' : 'Activity created successfully!';
                UIUtils.showToast(message, 'success');

                // Return to activities interface
                setTimeout(() => {
                    window.currentActivitiesInterface.render();
                }, 1500);

            } else {
                UIUtils.showToast('Failed to save activity: ' + result.errors.join(', '), 'error');
            }

        } catch (error) {
            console.error('Error saving activity:', error);
            UIUtils.showToast('Error saving activity', 'error');
        }
    }

    // ===== QUESTION MANAGEMENT METHODS =====

    /**
     * Add a new question
     */
    addQuestion(type) {
        // Hide dropdown
        document.getElementById('questionTypeMenu')?.classList.remove('show');

        // Create question with default data
        const questionData = {
            question: '',
            points: 1
        };

        const result = this.questionBuilder.createQuestion(type, questionData);
        
        if (result.success) {
            this.refreshQuestionsDisplay();
            // Auto-edit the new question
            this.editQuestion(result.question.id);
        } else {
            UIUtils.showToast('Failed to add question: ' + result.errors.join(', '), 'error');
        }
    }

    /**
     * Edit a question
     */
    editQuestion(questionId) {
        // This would open a question editing modal/form
        UIUtils.showToast('Question editing interface will be implemented in the next phase', 'info');
    }

    /**
     * Duplicate a question
     */
    duplicateQuestion(questionId) {
        const result = this.questionBuilder.duplicateQuestion(questionId);
        
        if (result.success) {
            this.refreshQuestionsDisplay();
            UIUtils.showToast('Question duplicated successfully', 'success');
        } else {
            UIUtils.showToast('Failed to duplicate question: ' + result.errors.join(', '), 'error');
        }
    }

    /**
     * Delete a question
     */
    deleteQuestion(questionId) {
        if (!confirm('Are you sure you want to delete this question?')) {
            return;
        }

        const result = this.questionBuilder.deleteQuestion(questionId);
        
        if (result.success) {
            this.refreshQuestionsDisplay();
            UIUtils.showToast('Question deleted successfully', 'success');
        } else {
            UIUtils.showToast('Failed to delete question: ' + result.errors.join(', '), 'error');
        }
    }

    /**
     * Refresh questions display
     */
    refreshQuestionsDisplay() {
        const questionsList = document.getElementById('questionsList');
        const questionCount = document.getElementById('questionCount');
        const totalPoints = document.getElementById('totalPoints');

        if (questionsList) {
            questionsList.innerHTML = this.renderQuestionsList();
        }

        if (questionCount) {
            questionCount.textContent = this.questionBuilder.questions.length;
        }

        if (totalPoints) {
            totalPoints.textContent = this.questionBuilder.getTotalPoints();
        }
    }

    // ===== UTILITY METHODS =====

    /**
     * Get question type icon
     */
    getQuestionTypeIcon(type) {
        const icons = {
            'multiple_choice': '🔘',
            'true_false': '✅',
            'short_answer': '📝',
            'essay': '📄'
        };
        return icons[type] || '❓';
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

// Export ActivityCreationWizard
window.ActivityCreationWizard = ActivityCreationWizard;

console.log('ActivityCreationWizard component loaded successfully');