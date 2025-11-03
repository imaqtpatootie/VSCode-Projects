// ===== ACTIVITY VALIDATION SCHEMAS =====

/**
 * Enhanced validation schemas for activity system data structures
 * Provides comprehensive validation for activities, questions, and responses
 */

/**
 * Field Validators - Reusable validation functions
 */
const FieldValidators = {
    /**
     * Validate required string field
     * @param {any} value - Value to validate
     * @param {string} fieldName - Name of the field for error messages
     * @param {number} minLength - Minimum length (default: 1)
     * @param {number} maxLength - Maximum length (default: 1000)
     * @returns {string|null} Error message or null if valid
     */
    requiredString(value, fieldName, minLength = 1, maxLength = 1000) {
        if (!value || typeof value !== 'string') {
            return `${fieldName} is required`;
        }
        
        const trimmed = value.trim();
        if (trimmed.length < minLength) {
            return `${fieldName} must be at least ${minLength} character${minLength > 1 ? 's' : ''} long`;
        }
        
        if (trimmed.length > maxLength) {
            return `${fieldName} cannot exceed ${maxLength} characters`;
        }
        
        return null;
    },

    /**
     * Validate optional string field
     * @param {any} value - Value to validate
     * @param {string} fieldName - Name of the field for error messages
     * @param {number} maxLength - Maximum length (default: 1000)
     * @returns {string|null} Error message or null if valid
     */
    optionalString(value, fieldName, maxLength = 1000) {
        if (value === null || value === undefined || value === '') {
            return null; // Optional field can be empty
        }
        
        if (typeof value !== 'string') {
            return `${fieldName} must be a string`;
        }
        
        if (value.trim().length > maxLength) {
            return `${fieldName} cannot exceed ${maxLength} characters`;
        }
        
        return null;
    },

    /**
     * Validate date field
     * @param {any} value - Value to validate
     * @param {string} fieldName - Name of the field for error messages
     * @param {boolean} required - Whether field is required
     * @param {Date} minDate - Minimum allowed date
     * @returns {string|null} Error message or null if valid
     */
    dateField(value, fieldName, required = true, minDate = null) {
        if (!value) {
            return required ? `${fieldName} is required` : null;
        }
        
        const date = value instanceof Date ? value : new Date(value);
        
        if (isNaN(date.getTime())) {
            return `${fieldName} must be a valid date`;
        }
        
        if (minDate && date < minDate) {
            return `${fieldName} cannot be in the past`;
        }
        
        return null;
    },

    /**
     * Validate positive number field
     * @param {any} value - Value to validate
     * @param {string} fieldName - Name of the field for error messages
     * @param {boolean} required - Whether field is required
     * @param {number} min - Minimum value (default: 0)
     * @param {number} max - Maximum value (optional)
     * @returns {string|null} Error message or null if valid
     */
    positiveNumber(value, fieldName, required = true, min = 0, max = null) {
        if (value === null || value === undefined) {
            return required ? `${fieldName} is required` : null;
        }
        
        if (typeof value !== 'number' || isNaN(value)) {
            return `${fieldName} must be a number`;
        }
        
        if (value < min) {
            return `${fieldName} must be at least ${min}`;
        }
        
        if (max !== null && value > max) {
            return `${fieldName} cannot exceed ${max}`;
        }
        
        return null;
    },

    /**
     * Validate array field
     * @param {any} value - Value to validate
     * @param {string} fieldName - Name of the field for error messages
     * @param {boolean} required - Whether field is required
     * @param {number} minLength - Minimum array length
     * @param {number} maxLength - Maximum array length
     * @returns {string|null} Error message or null if valid
     */
    arrayField(value, fieldName, required = true, minLength = 0, maxLength = null) {
        if (!value) {
            return required ? `${fieldName} is required` : null;
        }
        
        if (!Array.isArray(value)) {
            return `${fieldName} must be an array`;
        }
        
        if (value.length < minLength) {
            return `${fieldName} must have at least ${minLength} item${minLength > 1 ? 's' : ''}`;
        }
        
        if (maxLength !== null && value.length > maxLength) {
            return `${fieldName} cannot have more than ${maxLength} items`;
        }
        
        return null;
    },

    /**
     * Validate enum field
     * @param {any} value - Value to validate
     * @param {string} fieldName - Name of the field for error messages
     * @param {Array} allowedValues - Array of allowed values
     * @param {boolean} required - Whether field is required
     * @returns {string|null} Error message or null if valid
     */
    enumField(value, fieldName, allowedValues, required = true) {
        if (!value) {
            return required ? `${fieldName} is required` : null;
        }
        
        if (!allowedValues.includes(value)) {
            return `${fieldName} must be one of: ${allowedValues.join(', ')}`;
        }
        
        return null;
    }
};

/**
 * Enhanced Activity Validation Schema
 */
const EnhancedActivitySchema = {
    /**
     * Validate complete activity object
     * @param {Object} activity - Activity object to validate
     * @returns {Object} Validation result with isValid, errors, and warnings
     */
    validate(activity) {
        const errors = [];
        const warnings = [];
        
        if (!activity || typeof activity !== 'object') {
            return {
                isValid: false,
                errors: ['Activity must be an object'],
                warnings: []
            };
        }

        // Basic field validation
        const titleError = FieldValidators.requiredString(activity.title, 'Title', 3, 200);
        if (titleError) errors.push(titleError);

        const descError = FieldValidators.requiredString(activity.description, 'Description', 10, 1000);
        if (descError) errors.push(descError);

        const instrError = FieldValidators.optionalString(activity.instructions, 'Instructions', 2000);
        if (instrError) errors.push(instrError);

        // Date validation
        const dueDateError = FieldValidators.dateField(activity.dueDate, 'Due date', true, new Date());
        if (dueDateError) errors.push(dueDateError);

        const startDateError = FieldValidators.dateField(activity.startDate, 'Start date', false);
        if (startDateError) errors.push(startDateError);

        const endDateError = FieldValidators.dateField(activity.endDate, 'End date', false);
        if (endDateError) errors.push(endDateError);

        // Date logic validation
        if (activity.startDate && activity.endDate && activity.startDate >= activity.endDate) {
            errors.push('Start date must be before end date');
        }

        if (activity.startDate && activity.dueDate && activity.startDate >= activity.dueDate) {
            errors.push('Start date must be before due date');
        }

        // Time limit validation
        const timeLimitError = FieldValidators.positiveNumber(activity.timeLimit, 'Time limit', false, 1, 480);
        if (timeLimitError) errors.push(timeLimitError);

        // Status validation
        const statusError = FieldValidators.enumField(
            activity.status, 
            'Status', 
            Object.values(ActivitySystem.ActivityStatus)
        );
        if (statusError) errors.push(statusError);

        // Questions validation
        const questionsError = FieldValidators.arrayField(activity.questions, 'Questions', true, 1, 50);
        if (questionsError) {
            errors.push(questionsError);
        } else {
            // Validate each question
            activity.questions.forEach((question, index) => {
                const questionValidation = EnhancedQuestionSchema.validate(question);
                if (!questionValidation.isValid) {
                    questionValidation.errors.forEach(error => {
                        errors.push(`Question ${index + 1}: ${error}`);
                    });
                }
                questionValidation.warnings.forEach(warning => {
                    warnings.push(`Question ${index + 1}: ${warning}`);
                });
            });
        }

        // Assigned classes validation
        const classesError = FieldValidators.arrayField(activity.assignedClasses, 'Assigned classes', true, 1, 20);
        if (classesError) errors.push(classesError);

        // Creator validation
        const creatorError = FieldValidators.requiredString(activity.createdBy, 'Creator ID', 1, 100);
        if (creatorError) errors.push(creatorError);

        // Warnings for best practices
        if (activity.questions && activity.questions.length > 20) {
            warnings.push('Activities with more than 20 questions may be overwhelming for students');
        }

        if (activity.timeLimit && activity.timeLimit < 5) {
            warnings.push('Time limit less than 5 minutes may be too short for most activities');
        }

        const totalPoints = activity.questions?.reduce((sum, q) => sum + (q.points || 0), 0) || 0;
        if (totalPoints === 0) {
            warnings.push('Activity has no points assigned to questions');
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    },

    /**
     * Validate activity for publishing
     * @param {Object} activity - Activity object to validate for publishing
     * @returns {Object} Validation result
     */
    validateForPublishing(activity) {
        const baseValidation = this.validate(activity);
        const errors = [...baseValidation.errors];
        const warnings = [...baseValidation.warnings];

        // Additional checks for publishing
        if (activity.status !== ActivitySystem.ActivityStatus.DRAFT) {
            errors.push('Only draft activities can be published');
        }

        if (!activity.questions || activity.questions.length === 0) {
            errors.push('Activity must have at least one question to publish');
        }

        // Check if all questions have correct answers for auto-grading
        const questionsWithoutAnswers = activity.questions?.filter(q => 
            (q.type === ActivitySystem.QuestionType.MULTIPLE_CHOICE || 
             q.type === ActivitySystem.QuestionType.TRUE_FALSE) && 
            !q.correctAnswer
        ) || [];

        if (questionsWithoutAnswers.length > 0) {
            warnings.push(`${questionsWithoutAnswers.length} question(s) don't have correct answers set for auto-grading`);
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }
};

/**
 * Enhanced Question Validation Schema
 */
const EnhancedQuestionSchema = {
    /**
     * Validate question object
     * @param {Object} question - Question object to validate
     * @returns {Object} Validation result
     */
    validate(question) {
        const errors = [];
        const warnings = [];

        if (!question || typeof question !== 'object') {
            return {
                isValid: false,
                errors: ['Question must be an object'],
                warnings: []
            };
        }

        // Basic field validation
        const questionError = FieldValidators.requiredString(question.question, 'Question text', 5, 1000);
        if (questionError) errors.push(questionError);

        const typeError = FieldValidators.enumField(
            question.type,
            'Question type',
            Object.values(ActivitySystem.QuestionType)
        );
        if (typeError) errors.push(typeError);

        const pointsError = FieldValidators.positiveNumber(question.points, 'Points', true, 0.5, 100);
        if (pointsError) errors.push(pointsError);

        // Type-specific validation
        if (question.type) {
            switch (question.type) {
                case ActivitySystem.QuestionType.MULTIPLE_CHOICE:
                    this.validateMultipleChoice(question, errors, warnings);
                    break;
                    
                case ActivitySystem.QuestionType.TRUE_FALSE:
                    this.validateTrueFalse(question, errors, warnings);
                    break;
                    
                case ActivitySystem.QuestionType.SHORT_ANSWER:
                    this.validateShortAnswer(question, errors, warnings);
                    break;
                    
                case ActivitySystem.QuestionType.ESSAY:
                    this.validateEssay(question, errors, warnings);
                    break;
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    },

    /**
     * Validate multiple choice question
     */
    validateMultipleChoice(question, errors, warnings) {
        const optionsError = FieldValidators.arrayField(question.options, 'Options', true, 2, 6);
        if (optionsError) {
            errors.push(optionsError);
            return;
        }

        // Validate each option
        question.options.forEach((option, index) => {
            const optionError = FieldValidators.requiredString(option, `Option ${index + 1}`, 1, 200);
            if (optionError) errors.push(optionError);
        });

        // Check for duplicate options
        const uniqueOptions = new Set(question.options.map(opt => opt.trim().toLowerCase()));
        if (uniqueOptions.size !== question.options.length) {
            errors.push('Options must be unique');
        }

        // Validate correct answer
        if (!question.correctAnswer) {
            warnings.push('No correct answer set - question cannot be auto-graded');
        } else if (!question.options.includes(question.correctAnswer)) {
            errors.push('Correct answer must be one of the provided options');
        }
    },

    /**
     * Validate true/false question
     */
    validateTrueFalse(question, errors, warnings) {
        if (!question.correctAnswer) {
            warnings.push('No correct answer set - question cannot be auto-graded');
        } else {
            const validAnswers = ['true', 'false', 'True', 'False'];
            if (!validAnswers.includes(question.correctAnswer)) {
                errors.push('Correct answer must be "true" or "false"');
            }
        }
    },

    /**
     * Validate short answer question
     */
    validateShortAnswer(question, errors, warnings) {
        const maxLengthError = FieldValidators.positiveNumber(
            question.maxLength, 
            'Maximum length', 
            false, 
            10, 
            1000
        );
        if (maxLengthError) errors.push(maxLengthError);

        if (!question.correctAnswer && !question.acceptableAnswers) {
            warnings.push('No correct answer or acceptable answers set - question requires manual grading');
        }
    },

    /**
     * Validate essay question
     */
    validateEssay(question, errors, warnings) {
        const maxLengthError = FieldValidators.positiveNumber(
            question.maxLength,
            'Maximum length',
            false,
            100,
            10000
        );
        if (maxLengthError) errors.push(maxLengthError);

        warnings.push('Essay questions require manual grading');
    }
};

/**
 * Enhanced Response Validation Schema
 */
const EnhancedResponseSchema = {
    /**
     * Validate student response object
     * @param {Object} response - Response object to validate
     * @param {Object} activity - Associated activity for context validation
     * @returns {Object} Validation result
     */
    validate(response, activity = null) {
        const errors = [];
        const warnings = [];

        if (!response || typeof response !== 'object') {
            return {
                isValid: false,
                errors: ['Response must be an object'],
                warnings: []
            };
        }

        // Basic field validation
        const activityIdError = FieldValidators.requiredString(response.activityId, 'Activity ID');
        if (activityIdError) errors.push(activityIdError);

        const studentIdError = FieldValidators.requiredString(response.studentId, 'Student ID');
        if (studentIdError) errors.push(studentIdError);

        const statusError = FieldValidators.enumField(
            response.submissionStatus,
            'Submission status',
            Object.values(ActivitySystem.SubmissionStatus)
        );
        if (statusError) errors.push(statusError);

        // Responses validation
        if (!response.responses || typeof response.responses !== 'object') {
            errors.push('Responses must be an object');
        } else if (activity) {
            // Validate responses against activity questions
            this.validateResponsesAgainstActivity(response.responses, activity, errors, warnings);
        }

        // Date validation
        if (response.startedAt) {
            const startedError = FieldValidators.dateField(response.startedAt, 'Started at', false);
            if (startedError) errors.push(startedError);
        }

        if (response.submittedAt) {
            const submittedError = FieldValidators.dateField(response.submittedAt, 'Submitted at', false);
            if (submittedError) errors.push(submittedError);

            if (response.startedAt && response.submittedAt < response.startedAt) {
                errors.push('Submitted at cannot be before started at');
            }
        }

        // Time spent validation
        if (response.timeSpent !== undefined) {
            const timeSpentError = FieldValidators.positiveNumber(response.timeSpent, 'Time spent', false, 0);
            if (timeSpentError) errors.push(timeSpentError);
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    },

    /**
     * Validate responses against activity questions
     */
    validateResponsesAgainstActivity(responses, activity, errors, warnings) {
        if (!activity.questions) return;

        const requiredQuestions = activity.questions.filter(q => q.required !== false);
        const answeredQuestions = Object.keys(responses);

        // Check for missing required answers
        requiredQuestions.forEach(question => {
            if (!responses.hasOwnProperty(question.id) || 
                responses[question.id] === null || 
                responses[question.id] === undefined ||
                responses[question.id] === '') {
                warnings.push(`No answer provided for required question: ${question.question.substring(0, 50)}...`);
            }
        });

        // Check for answers to non-existent questions
        answeredQuestions.forEach(questionId => {
            const question = activity.questions.find(q => q.id === questionId);
            if (!question) {
                warnings.push(`Answer provided for non-existent question ID: ${questionId}`);
            }
        });

        // Validate individual answers
        activity.questions.forEach(question => {
            const answer = responses[question.id];
            if (answer !== null && answer !== undefined && answer !== '') {
                this.validateIndividualAnswer(answer, question, errors, warnings);
            }
        });
    },

    /**
     * Validate individual answer against question constraints
     */
    validateIndividualAnswer(answer, question, errors, warnings) {
        switch (question.type) {
            case ActivitySystem.QuestionType.MULTIPLE_CHOICE:
                if (!question.options || !question.options.includes(answer)) {
                    errors.push(`Invalid option selected for question: ${question.question.substring(0, 50)}...`);
                }
                break;

            case ActivitySystem.QuestionType.TRUE_FALSE:
                const validAnswers = ['true', 'false', 'True', 'False', true, false];
                if (!validAnswers.includes(answer)) {
                    errors.push(`Invalid true/false answer for question: ${question.question.substring(0, 50)}...`);
                }
                break;

            case ActivitySystem.QuestionType.SHORT_ANSWER:
            case ActivitySystem.QuestionType.ESSAY:
                if (typeof answer !== 'string') {
                    errors.push(`Text answer required for question: ${question.question.substring(0, 50)}...`);
                } else if (question.maxLength && answer.length > question.maxLength) {
                    errors.push(`Answer exceeds maximum length (${question.maxLength}) for question: ${question.question.substring(0, 50)}...`);
                }
                break;
        }
    }
};

// Export enhanced validation schemas
window.ActivityValidators = {
    FieldValidators,
    EnhancedActivitySchema,
    EnhancedQuestionSchema,
    EnhancedResponseSchema
};

console.log('Activity validation schemas loaded successfully');