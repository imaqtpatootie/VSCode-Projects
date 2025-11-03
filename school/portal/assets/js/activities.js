// ===== SNHS PORTAL ACTIVITIES MODULE =====

/**
 * Activity System Core Module
 * Handles educational activities, exams, and student responses
 */

// ===== TYPE DEFINITIONS AND INTERFACES =====

/**
 * Activity Status Enumeration
 */
const ActivityStatus = {
    DRAFT: 'draft',
    PUBLISHED: 'published', 
    CLOSED: 'closed'
};

/**
 * Submission Status Enumeration
 */
const SubmissionStatus = {
    NOT_STARTED: 'not_started',
    IN_PROGRESS: 'in_progress',
    SUBMITTED: 'submitted',
    GRADED: 'graded'
};

/**
 * Question Type Enumeration
 */
const QuestionType = {
    MULTIPLE_CHOICE: 'multiple_choice',
    SHORT_ANSWER: 'short_answer',
    ESSAY: 'essay',
    TRUE_FALSE: 'true_false'
};

/**
 * Activity Data Structure
 * @typedef {Object} Activity
 * @property {string} id - Unique activity identifier
 * @property {string} title - Activity title
 * @property {string} description - Activity description
 * @property {string} instructions - Instructions for students
 * @property {Date} dueDate - Due date for submission
 * @property {number} [timeLimit] - Time limit in minutes (optional)
 * @property {string} status - Activity status (draft/published/closed)
 * @property {Question[]} questions - Array of questions
 * @property {string[]} assignedClasses - Array of assigned class IDs
 * @property {string} createdBy - Teacher ID who created the activity
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} [startDate] - Activity start date (optional)
 * @property {Date} [endDate] - Activity end date (optional)
 */

/**
 * Question Data Structure
 * @typedef {Object} Question
 * @property {string} id - Unique question identifier
 * @property {string} type - Question type (multiple_choice/short_answer/essay/true_false)
 * @property {string} question - Question text
 * @property {number} points - Points awarded for correct answer
 * @property {string[]} [options] - Answer options for multiple choice
 * @property {string} [correctAnswer] - Correct answer for auto-grading
 * @property {number} [maxLength] - Maximum character length for text answers
 * @property {boolean} [required] - Whether question is required
 */

/**
 * Student Response Data Structure
 * @typedef {Object} StudentResponse
 * @property {string} id - Unique response identifier
 * @property {string} activityId - Associated activity ID
 * @property {string} studentId - Student ID
 * @property {Object} responses - Question ID to answer mapping
 * @property {string} submissionStatus - Current submission status
 * @property {Date} [startedAt] - When student started the activity
 * @property {Date} [submittedAt] - When student submitted responses
 * @property {number} [timeSpent] - Time spent in seconds
 * @property {Grade} [grade] - Grading information
 */

/**
 * Grade Data Structure
 * @typedef {Object} Grade
 * @property {number} totalPoints - Points earned
 * @property {number} maxPoints - Maximum possible points
 * @property {number} percentage - Percentage score
 * @property {string} [feedback] - Teacher feedback
 * @property {string} [gradedBy] - Teacher ID who graded
 * @property {Date} [gradedAt] - Grading timestamp
 */

// ===== DATA VALIDATION SCHEMAS =====

/**
 * Activity Validation Schema
 */
const ActivitySchema = {
    /**
     * Validate activity data structure
     * @param {Activity} activity - Activity object to validate
     * @returns {Object} Validation result with isValid and errors
     */
    validate(activity) {
        const errors = [];
        
        // Required fields validation
        if (!activity.title || activity.title.trim().length === 0) {
            errors.push('Activity title is required');
        }
        
        if (!activity.description || activity.description.trim().length === 0) {
            errors.push('Activity description is required');
        }
        
        if (!activity.dueDate || !(activity.dueDate instanceof Date)) {
            errors.push('Valid due date is required');
        }
        
        if (!activity.questions || !Array.isArray(activity.questions) || activity.questions.length === 0) {
            errors.push('At least one question is required');
        }
        
        if (!activity.assignedClasses || !Array.isArray(activity.assignedClasses) || activity.assignedClasses.length === 0) {
            errors.push('At least one class must be assigned');
        }
        
        // Status validation
        if (!Object.values(ActivityStatus).includes(activity.status)) {
            errors.push('Invalid activity status');
        }
        
        // Time limit validation
        if (activity.timeLimit !== undefined && (typeof activity.timeLimit !== 'number' || activity.timeLimit <= 0)) {
            errors.push('Time limit must be a positive number');
        }
        
        // Questions validation
        if (activity.questions && Array.isArray(activity.questions)) {
            activity.questions.forEach((question, index) => {
                const questionErrors = QuestionSchema.validate(question);
                if (!questionErrors.isValid) {
                    errors.push(`Question ${index + 1}: ${questionErrors.errors.join(', ')}`);
                }
            });
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
};

/**
 * Question Validation Schema
 */
const QuestionSchema = {
    /**
     * Validate question data structure
     * @param {Question} question - Question object to validate
     * @returns {Object} Validation result with isValid and errors
     */
    validate(question) {
        const errors = [];
        
        // Required fields
        if (!question.question || question.question.trim().length === 0) {
            errors.push('Question text is required');
        }
        
        if (!Object.values(QuestionType).includes(question.type)) {
            errors.push('Invalid question type');
        }
        
        if (typeof question.points !== 'number' || question.points <= 0) {
            errors.push('Points must be a positive number');
        }
        
        // Type-specific validation
        switch (question.type) {
            case QuestionType.MULTIPLE_CHOICE:
                if (!question.options || !Array.isArray(question.options) || question.options.length < 2) {
                    errors.push('Multiple choice questions must have at least 2 options');
                }
                if (question.options && question.options.length > 6) {
                    errors.push('Multiple choice questions cannot have more than 6 options');
                }
                if (!question.correctAnswer || !question.options?.includes(question.correctAnswer)) {
                    errors.push('Correct answer must be one of the provided options');
                }
                break;
                
            case QuestionType.TRUE_FALSE:
                if (!question.correctAnswer || !['true', 'false'].includes(question.correctAnswer.toLowerCase())) {
                    errors.push('True/false questions must have correct answer as "true" or "false"');
                }
                break;
                
            case QuestionType.SHORT_ANSWER:
            case QuestionType.ESSAY:
                if (question.maxLength && (typeof question.maxLength !== 'number' || question.maxLength <= 0)) {
                    errors.push('Maximum length must be a positive number');
                }
                break;
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
};

/**
 * Response Validation Schema
 */
const ResponseSchema = {
    /**
     * Validate student response data structure
     * @param {StudentResponse} response - Response object to validate
     * @returns {Object} Validation result with isValid and errors
     */
    validate(response) {
        const errors = [];
        
        // Required fields
        if (!response.activityId || response.activityId.trim().length === 0) {
            errors.push('Activity ID is required');
        }
        
        if (!response.studentId || response.studentId.trim().length === 0) {
            errors.push('Student ID is required');
        }
        
        if (!Object.values(SubmissionStatus).includes(response.submissionStatus)) {
            errors.push('Invalid submission status');
        }
        
        // Responses validation
        if (!response.responses || typeof response.responses !== 'object') {
            errors.push('Responses must be an object');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
};

// ===== UTILITY FUNCTIONS =====

/**
 * Generate unique ID for activities and questions
 * @param {string} prefix - Prefix for the ID (e.g., 'act', 'q', 'resp')
 * @returns {string} Unique identifier
 */
function generateId(prefix = '') {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    return prefix ? `${prefix}_${timestamp}_${randomStr}` : `${timestamp}_${randomStr}`;
}

/**
 * Format date for display
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string
 */
function formatDate(date) {
    if (!(date instanceof Date)) return '';
    
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

/**
 * Calculate time remaining until due date
 * @param {Date} dueDate - Due date
 * @returns {Object} Time remaining object with days, hours, minutes
 */
function getTimeRemaining(dueDate) {
    const now = new Date();
    const timeDiff = dueDate.getTime() - now.getTime();
    
    if (timeDiff <= 0) {
        return { expired: true, days: 0, hours: 0, minutes: 0 };
    }
    
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    return { expired: false, days, hours, minutes };
}

/**
 * Format time remaining for display
 * @param {Object} timeRemaining - Time remaining object
 * @returns {string} Formatted time string
 */
function formatTimeRemaining(timeRemaining) {
    if (timeRemaining.expired) {
        return 'Expired';
    }
    
    const parts = [];
    if (timeRemaining.days > 0) parts.push(`${timeRemaining.days}d`);
    if (timeRemaining.hours > 0) parts.push(`${timeRemaining.hours}h`);
    if (timeRemaining.minutes > 0) parts.push(`${timeRemaining.minutes}m`);
    
    return parts.length > 0 ? parts.join(' ') : 'Less than 1 minute';
}

// ===== EXPORT OBJECTS =====

// Export all constants and utilities for use in other modules
window.ActivitySystem = {
    // Enums
    ActivityStatus,
    SubmissionStatus,
    QuestionType,
    
    // Validation schemas
    ActivitySchema,
    QuestionSchema,
    ResponseSchema,
    
    // Utility functions
    generateId,
    formatDate,
    getTimeRemaining,
    formatTimeRemaining
};

console.log('Activity System foundation loaded successfully');