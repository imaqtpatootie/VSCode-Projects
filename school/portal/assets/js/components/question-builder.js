// ===== QUESTION BUILDER COMPONENT =====

/**
 * QuestionBuilder Class
 * Handles creation, validation, and management of different question types
 */
class QuestionBuilder {
    constructor() {
        this.questions = [];
        this.currentQuestionId = null;
        this.questionCounter = 0;
        
        this.init();
    }

    /**
     * Initialize the Question Builder
     */
    init() {
        console.log('QuestionBuilder initialized');
    }

    // ===== QUESTION CREATION METHODS =====

    /**
     * Create a new question of specified type
     * @param {string} type - Question type (multiple_choice, short_answer, essay, true_false)
     * @param {Object} questionData - Question data
     * @returns {Object} Created question with validation result
     */
    createQuestion(type, questionData = {}) {
        try {
            // Generate unique question ID
            const questionId = ActivitySystem.generateId('q');
            this.questionCounter++;

            // Create base question structure
            const question = {
                id: questionId,
                type: type,
                question: questionData.question || '',
                points: questionData.points || 1,
                required: questionData.required !== false, // Default to required
                order: this.questionCounter,
                createdAt: new Date(),
                ...this.getTypeSpecificDefaults(type),
                ...questionData
            };

            // Validate question
            const validation = ActivityValidators.EnhancedQuestionSchema.validate(question);
            if (!validation.isValid) {
                return {
                    success: false,
                    errors: validation.errors,
                    question: null
                };
            }

            // Add to questions array
            this.questions.push(question);

            return {
                success: true,
                errors: [],
                warnings: validation.warnings || [],
                question: question
            };

        } catch (error) {
            console.error('Error creating question:', error);
            return {
                success: false,
                errors: ['Failed to create question: ' + error.message],
                question: null
            };
        }
    }

    /**
     * Get type-specific default values for questions
     * @param {string} type - Question type
     * @returns {Object} Default values for the question type
     */
    getTypeSpecificDefaults(type) {
        switch (type) {
            case ActivitySystem.QuestionType.MULTIPLE_CHOICE:
                return {
                    options: ['Option 1', 'Option 2'],
                    correctAnswer: null,
                    shuffleOptions: false
                };

            case ActivitySystem.QuestionType.TRUE_FALSE:
                return {
                    correctAnswer: null,
                    options: ['True', 'False'] // For consistency in rendering
                };

            case ActivitySystem.QuestionType.SHORT_ANSWER:
                return {
                    maxLength: 500,
                    correctAnswer: null,
                    acceptableAnswers: [],
                    caseSensitive: false
                };

            case ActivitySystem.QuestionType.ESSAY:
                return {
                    maxLength: 2000,
                    minLength: 50,
                    allowFormatting: true
                };

            default:
                return {};
        }
    }

    /**
     * Create multiple choice question
     * @param {Object} questionData - Question data
     * @returns {Object} Creation result
     */
    createMultipleChoiceQuestion(questionData) {
        const mcData = {
            ...questionData,
            options: questionData.options || ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
            correctAnswer: questionData.correctAnswer || null,
            shuffleOptions: questionData.shuffleOptions || false
        };

        return this.createQuestion(ActivitySystem.QuestionType.MULTIPLE_CHOICE, mcData);
    }

    /**
     * Create true/false question
     * @param {Object} questionData - Question data
     * @returns {Object} Creation result
     */
    createTrueFalseQuestion(questionData) {
        const tfData = {
            ...questionData,
            correctAnswer: questionData.correctAnswer || null
        };

        return this.createQuestion(ActivitySystem.QuestionType.TRUE_FALSE, tfData);
    }

    /**
     * Create short answer question
     * @param {Object} questionData - Question data
     * @returns {Object} Creation result
     */
    createShortAnswerQuestion(questionData) {
        const saData = {
            ...questionData,
            maxLength: questionData.maxLength || 500,
            correctAnswer: questionData.correctAnswer || null,
            acceptableAnswers: questionData.acceptableAnswers || [],
            caseSensitive: questionData.caseSensitive || false
        };

        return this.createQuestion(ActivitySystem.QuestionType.SHORT_ANSWER, saData);
    }

    /**
     * Create essay question
     * @param {Object} questionData - Question data
     * @returns {Object} Creation result
     */
    createEssayQuestion(questionData) {
        const essayData = {
            ...questionData,
            maxLength: questionData.maxLength || 2000,
            minLength: questionData.minLength || 50,
            allowFormatting: questionData.allowFormatting !== false
        };

        return this.createQuestion(ActivitySystem.QuestionType.ESSAY, essayData);
    }

    // ===== QUESTION MANAGEMENT METHODS =====

    /**
     * Update an existing question
     * @param {string} questionId - Question ID to update
     * @param {Object} updateData - Data to update
     * @returns {Object} Update result
     */
    updateQuestion(questionId, updateData) {
        try {
            const questionIndex = this.questions.findIndex(q => q.id === questionId);
            if (questionIndex === -1) {
                return {
                    success: false,
                    errors: ['Question not found'],
                    question: null
                };
            }

            // Update question data
            const updatedQuestion = {
                ...this.questions[questionIndex],
                ...updateData,
                id: questionId, // Preserve ID
                updatedAt: new Date()
            };

            // Validate updated question
            const validation = ActivityValidators.EnhancedQuestionSchema.validate(updatedQuestion);
            if (!validation.isValid) {
                return {
                    success: false,
                    errors: validation.errors,
                    question: null
                };
            }

            // Update in array
            this.questions[questionIndex] = updatedQuestion;

            return {
                success: true,
                errors: [],
                warnings: validation.warnings || [],
                question: updatedQuestion
            };

        } catch (error) {
            console.error('Error updating question:', error);
            return {
                success: false,
                errors: ['Failed to update question: ' + error.message],
                question: null
            };
        }
    }

    /**
     * Delete a question
     * @param {string} questionId - Question ID to delete
     * @returns {Object} Delete result
     */
    deleteQuestion(questionId) {
        try {
            const questionIndex = this.questions.findIndex(q => q.id === questionId);
            if (questionIndex === -1) {
                return {
                    success: false,
                    errors: ['Question not found']
                };
            }

            // Remove question
            this.questions.splice(questionIndex, 1);

            // Reorder remaining questions
            this.reorderQuestions();

            return {
                success: true,
                errors: []
            };

        } catch (error) {
            console.error('Error deleting question:', error);
            return {
                success: false,
                errors: ['Failed to delete question: ' + error.message]
            };
        }
    }

    /**
     * Get a question by ID
     * @param {string} questionId - Question ID
     * @returns {Object|null} Question object or null
     */
    getQuestion(questionId) {
        return this.questions.find(q => q.id === questionId) || null;
    }

    /**
     * Get all questions
     * @returns {Array} Array of questions
     */
    getAllQuestions() {
        return [...this.questions].sort((a, b) => a.order - b.order);
    }

    /**
     * Reorder questions after deletion or manual reordering
     */
    reorderQuestions() {
        this.questions.forEach((question, index) => {
            question.order = index + 1;
        });
    }

    /**
     * Move question to new position
     * @param {string} questionId - Question ID to move
     * @param {number} newPosition - New position (1-based)
     * @returns {Object} Move result
     */
    moveQuestion(questionId, newPosition) {
        try {
            const questionIndex = this.questions.findIndex(q => q.id === questionId);
            if (questionIndex === -1) {
                return {
                    success: false,
                    errors: ['Question not found']
                };
            }

            if (newPosition < 1 || newPosition > this.questions.length) {
                return {
                    success: false,
                    errors: ['Invalid position']
                };
            }

            // Remove question from current position
            const [question] = this.questions.splice(questionIndex, 1);

            // Insert at new position (convert to 0-based)
            this.questions.splice(newPosition - 1, 0, question);

            // Reorder all questions
            this.reorderQuestions();

            return {
                success: true,
                errors: []
            };

        } catch (error) {
            console.error('Error moving question:', error);
            return {
                success: false,
                errors: ['Failed to move question: ' + error.message]
            };
        }
    }

    // ===== QUESTION VALIDATION METHODS =====

    /**
     * Validate all questions in the builder
     * @returns {Object} Validation result for all questions
     */
    validateAllQuestions() {
        const results = {
            isValid: true,
            errors: [],
            warnings: [],
            questionResults: []
        };

        this.questions.forEach((question, index) => {
            const validation = ActivityValidators.EnhancedQuestionSchema.validate(question);
            
            results.questionResults.push({
                questionId: question.id,
                questionNumber: index + 1,
                isValid: validation.isValid,
                errors: validation.errors,
                warnings: validation.warnings
            });

            if (!validation.isValid) {
                results.isValid = false;
                validation.errors.forEach(error => {
                    results.errors.push(`Question ${index + 1}: ${error}`);
                });
            }

            validation.warnings.forEach(warning => {
                results.warnings.push(`Question ${index + 1}: ${warning}`);
            });
        });

        return results;
    }

    /**
     * Check if questions are ready for publishing
     * @returns {Object} Publishing readiness check
     */
    checkPublishingReadiness() {
        const validation = this.validateAllQuestions();
        const readinessIssues = [];

        // Check for minimum questions
        if (this.questions.length === 0) {
            readinessIssues.push('At least one question is required');
        }

        // Check for questions without correct answers (for auto-grading)
        const questionsWithoutAnswers = this.questions.filter(q => 
            (q.type === ActivitySystem.QuestionType.MULTIPLE_CHOICE || 
             q.type === ActivitySystem.QuestionType.TRUE_FALSE) && 
            !q.correctAnswer
        );

        if (questionsWithoutAnswers.length > 0) {
            readinessIssues.push(`${questionsWithoutAnswers.length} question(s) don't have correct answers for auto-grading`);
        }

        // Check total points
        const totalPoints = this.getTotalPoints();
        if (totalPoints === 0) {
            readinessIssues.push('Total points cannot be zero');
        }

        return {
            isReady: validation.isValid && readinessIssues.length === 0,
            validationErrors: validation.errors,
            readinessIssues: readinessIssues,
            warnings: validation.warnings
        };
    }

    // ===== UTILITY METHODS =====

    /**
     * Get total points for all questions
     * @returns {number} Total points
     */
    getTotalPoints() {
        return this.questions.reduce((total, question) => total + (question.points || 0), 0);
    }

    /**
     * Get question count by type
     * @returns {Object} Count of questions by type
     */
    getQuestionCountByType() {
        const counts = {};
        Object.values(ActivitySystem.QuestionType).forEach(type => {
            counts[type] = 0;
        });

        this.questions.forEach(question => {
            if (counts.hasOwnProperty(question.type)) {
                counts[question.type]++;
            }
        });

        return counts;
    }

    /**
     * Get questions statistics
     * @returns {Object} Statistics about questions
     */
    getStatistics() {
        return {
            totalQuestions: this.questions.length,
            totalPoints: this.getTotalPoints(),
            averagePoints: this.questions.length > 0 ? this.getTotalPoints() / this.questions.length : 0,
            questionsByType: this.getQuestionCountByType(),
            requiredQuestions: this.questions.filter(q => q.required).length,
            optionalQuestions: this.questions.filter(q => !q.required).length
        };
    }

    /**
     * Export questions for activity creation
     * @returns {Array} Array of questions ready for activity
     */
    exportQuestions() {
        return this.getAllQuestions().map(question => ({
            ...question,
            // Remove builder-specific properties
            createdAt: undefined,
            updatedAt: undefined
        }));
    }

    /**
     * Import questions from existing activity
     * @param {Array} questions - Array of questions to import
     * @returns {Object} Import result
     */
    importQuestions(questions) {
        try {
            if (!Array.isArray(questions)) {
                return {
                    success: false,
                    errors: ['Questions must be an array']
                };
            }

            // Clear existing questions
            this.questions = [];
            this.questionCounter = 0;

            // Import each question
            const importResults = [];
            questions.forEach((questionData, index) => {
                const result = this.createQuestion(questionData.type, questionData);
                importResults.push({
                    index: index + 1,
                    success: result.success,
                    errors: result.errors,
                    warnings: result.warnings
                });
            });

            // Check if any imports failed
            const failedImports = importResults.filter(r => !r.success);
            
            return {
                success: failedImports.length === 0,
                errors: failedImports.length > 0 ? ['Some questions failed to import'] : [],
                importResults: importResults,
                importedCount: this.questions.length
            };

        } catch (error) {
            console.error('Error importing questions:', error);
            return {
                success: false,
                errors: ['Failed to import questions: ' + error.message]
            };
        }
    }

    /**
     * Clear all questions
     */
    clearAllQuestions() {
        this.questions = [];
        this.questionCounter = 0;
        this.currentQuestionId = null;
    }

    /**
     * Duplicate a question
     * @param {string} questionId - Question ID to duplicate
     * @returns {Object} Duplication result
     */
    duplicateQuestion(questionId) {
        try {
            const originalQuestion = this.getQuestion(questionId);
            if (!originalQuestion) {
                return {
                    success: false,
                    errors: ['Question not found']
                };
            }

            // Create duplicate with new ID
            const duplicateData = {
                ...originalQuestion,
                question: originalQuestion.question + ' (Copy)',
                id: undefined, // Will be generated
                createdAt: undefined,
                updatedAt: undefined
            };

            return this.createQuestion(originalQuestion.type, duplicateData);

        } catch (error) {
            console.error('Error duplicating question:', error);
            return {
                success: false,
                errors: ['Failed to duplicate question: ' + error.message]
            };
        }
    }
}

// Export QuestionBuilder
window.QuestionBuilder = QuestionBuilder;

console.log('QuestionBuilder component loaded successfully');