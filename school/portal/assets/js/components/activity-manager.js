// ===== ACTIVITY MANAGER COMPONENT =====

/**
 * ActivityManager Class
 * Central component for managing all activity-related operations
 */
class ActivityManager {
    constructor() {
        this.activities = new Map();
        this.responses = new Map();
        this.currentUser = null;
        this.storageKey = 'snhs_activities';
        this.responsesKey = 'snhs_responses';

        this.init();
    }

    /**
     * Initialize the Activity Manager
     */
    init() {
        // Load existing data from localStorage
        this.loadFromStorage();

        // Get current user from session
        this.currentUser = SessionManager?.validateSession() || null;

        console.log('ActivityManager initialized');
    }

    // ===== ACTIVITY CRUD OPERATIONS =====

    /**
     * Create a new activity
     * @param {Object} activityData - Activity data object
     * @returns {Promise<Object>} Created activity with validation result
     */
    async createActivity(activityData) {
        try {
            // Generate unique ID
            const id = ActivitySystem.generateId('act');

            // Process questions to ensure they have IDs
            const processedQuestions = (activityData.questions || []).map(question => ({
                ...question,
                id: question.id || ActivitySystem.generateId('q')
            }));

            // Create activity object with defaults
            const activity = {
                id,
                title: activityData.title || '',
                description: activityData.description || '',
                instructions: activityData.instructions || '',
                dueDate: new Date(activityData.dueDate),
                timeLimit: activityData.timeLimit || null,
                status: ActivitySystem.ActivityStatus.DRAFT,
                questions: processedQuestions,
                assignedClasses: activityData.assignedClasses || [],
                createdBy: this.currentUser?.id || 'unknown',
                createdAt: new Date(),
                startDate: activityData.startDate ? new Date(activityData.startDate) : null,
                endDate: activityData.endDate ? new Date(activityData.endDate) : null
            };

            // Validate activity data
            const validation = ActivitySystem.ActivitySchema.validate(activity);
            if (!validation.isValid) {
                return {
                    success: false,
                    errors: validation.errors,
                    activity: null
                };
            }

            // Store activity
            this.activities.set(id, activity);
            this.saveToStorage();

            return {
                success: true,
                errors: [],
                activity: activity
            };

        } catch (error) {
            console.error('Error creating activity:', error);
            return {
                success: false,
                errors: ['Failed to create activity: ' + error.message],
                activity: null
            };
        }
    }

    /**
     * Update an existing activity
     * @param {string} activityId - Activity ID to update
     * @param {Object} updateData - Data to update
     * @returns {Promise<Object>} Update result
     */
    async updateActivity(activityId, updateData) {
        try {
            const activity = this.activities.get(activityId);
            if (!activity) {
                return {
                    success: false,
                    errors: ['Activity not found'],
                    activity: null
                };
            }

            // Check permissions
            if (activity.createdBy !== this.currentUser?.id && this.currentUser?.role !== 'admin') {
                return {
                    success: false,
                    errors: ['Permission denied'],
                    activity: null
                };
            }

            // Process questions if provided
            if (updateData.questions) {
                updateData.questions = updateData.questions.map(question => ({
                    ...question,
                    id: question.id || ActivitySystem.generateId('q')
                }));
            }

            // Merge update data
            const updatedActivity = {
                ...activity,
                ...updateData,
                updatedAt: new Date()
            };

            // Validate updated activity
            const validation = ActivitySystem.ActivitySchema.validate(updatedActivity);
            if (!validation.isValid) {
                return {
                    success: false,
                    errors: validation.errors,
                    activity: null
                };
            }

            // Update activity
            this.activities.set(activityId, updatedActivity);
            this.saveToStorage();

            return {
                success: true,
                errors: [],
                activity: updatedActivity
            };

        } catch (error) {
            console.error('Error updating activity:', error);
            return {
                success: false,
                errors: ['Failed to update activity: ' + error.message],
                activity: null
            };
        }
    }

    /**
     * Get an activity by ID
     * @param {string} activityId - Activity ID
     * @returns {Object|null} Activity object or null if not found
     */
    getActivity(activityId) {
        return this.activities.get(activityId) || null;
    }

    /**
     * Get all activities
     * @param {Object} filters - Optional filters
     * @returns {Array} Array of activities
     */
    getActivities(filters = {}) {
        let activities = Array.from(this.activities.values());

        // Apply filters
        if (filters.status) {
            activities = activities.filter(activity => activity.status === filters.status);
        }

        if (filters.createdBy) {
            activities = activities.filter(activity => activity.createdBy === filters.createdBy);
        }

        if (filters.assignedClass) {
            activities = activities.filter(activity =>
                activity.assignedClasses.includes(filters.assignedClass)
            );
        }

        if (filters.available) {
            const now = new Date();
            activities = activities.filter(activity => {
                if (activity.status !== ActivitySystem.ActivityStatus.PUBLISHED) return false;
                if (activity.startDate && now < activity.startDate) return false;
                if (activity.endDate && now > activity.endDate) return false;
                return true;
            });
        }

        // Sort by creation date (newest first)
        activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return activities;
    }

    /**
     * Delete an activity
     * @param {string} activityId - Activity ID to delete
     * @returns {Promise<Object>} Delete result
     */
    async deleteActivity(activityId) {
        try {
            const activity = this.activities.get(activityId);
            if (!activity) {
                return {
                    success: false,
                    errors: ['Activity not found']
                };
            }

            // Check permissions
            if (activity.createdBy !== this.currentUser?.id && this.currentUser?.role !== 'admin') {
                return {
                    success: false,
                    errors: ['Permission denied']
                };
            }

            // Remove activity
            this.activities.delete(activityId);

            // Remove associated responses
            const responsesToDelete = [];
            this.responses.forEach((response, key) => {
                if (response.activityId === activityId) {
                    responsesToDelete.push(key);
                }
            });

            responsesToDelete.forEach(key => this.responses.delete(key));

            this.saveToStorage();

            return {
                success: true,
                errors: []
            };

        } catch (error) {
            console.error('Error deleting activity:', error);
            return {
                success: false,
                errors: ['Failed to delete activity: ' + error.message]
            };
        }
    }

    /**
     * Publish an activity
     * @param {string} activityId - Activity ID to publish
     * @returns {Promise<Object>} Publish result
     */
    async publishActivity(activityId) {
        try {
            const activity = this.activities.get(activityId);
            if (!activity) {
                return {
                    success: false,
                    errors: ['Activity not found']
                };
            }

            // Check permissions
            if (activity.createdBy !== this.currentUser?.id && this.currentUser?.role !== 'admin') {
                return {
                    success: false,
                    errors: ['Permission denied']
                };
            }

            // Validate activity is ready for publishing
            if (!activity.questions || activity.questions.length === 0) {
                return {
                    success: false,
                    errors: ['Activity must have at least one question']
                };
            }

            if (!activity.assignedClasses || activity.assignedClasses.length === 0) {
                return {
                    success: false,
                    errors: ['Activity must be assigned to at least one class']
                };
            }

            // Update status
            activity.status = ActivitySystem.ActivityStatus.PUBLISHED;
            activity.publishedAt = new Date();

            this.activities.set(activityId, activity);
            this.saveToStorage();

            return {
                success: true,
                errors: [],
                activity: activity
            };

        } catch (error) {
            console.error('Error publishing activity:', error);
            return {
                success: false,
                errors: ['Failed to publish activity: ' + error.message]
            };
        }
    }

    // ===== RESPONSE MANAGEMENT =====

    /**
     * Get student response for an activity
     * @param {string} activityId - Activity ID
     * @param {string} studentId - Student ID
     * @returns {Object|null} Response object or null if not found
     */
    getStudentResponse(activityId, studentId) {
        const responseKey = `${activityId}_${studentId}`;
        return this.responses.get(responseKey) || null;
    }

    /**
     * Save student response
     * @param {Object} response - Response object
     * @returns {Promise<Object>} Save result
     */
    async saveStudentResponse(response) {
        try {
            const responseKey = `${response.activityId}_${response.studentId}`;

            // Validate response
            const validation = ActivitySystem.ResponseSchema.validate(response);
            if (!validation.isValid) {
                return {
                    success: false,
                    errors: validation.errors
                };
            }

            this.responses.set(responseKey, response);
            this.saveToStorage();

            return {
                success: true,
                errors: []
            };

        } catch (error) {
            console.error('Error saving response:', error);
            return {
                success: false,
                errors: ['Failed to save response: ' + error.message]
            };
        }
    }

    /**
     * Save response progress (for auto-save functionality)
     * @param {string} activityId - Activity ID
     * @param {string} studentId - Student ID
     * @param {Object} responses - Response data
     * @returns {Promise<Object>} Save result
     */
    async saveResponseProgress(activityId, studentId, responses) {
        try {
            // Get or create response
            let response = this.getStudentResponse(activityId, studentId);
            if (!response) {
                response = {
                    id: ActivitySystem.generateId('resp'),
                    activityId: activityId,
                    studentId: studentId,
                    responses: {},
                    submissionStatus: ActivitySystem.SubmissionStatus.IN_PROGRESS,
                    startedAt: new Date(),
                    timeSpent: 0
                };
            }

            // Update response data
            response.responses = responses;
            response.lastModified = new Date();

            // Calculate time spent
            if (response.startedAt) {
                response.timeSpent = Math.floor((new Date() - new Date(response.startedAt)) / 1000);
            }

            // Save response
            const saveResult = await this.saveStudentResponse(response);
            if (!saveResult.success) {
                return saveResult;
            }

            return {
                success: true,
                errors: [],
                response: response
            };

        } catch (error) {
            console.error('Error saving response progress:', error);
            return {
                success: false,
                errors: ['Failed to save response progress: ' + error.message]
            };
        }
    }

    /**
     * Get all responses for an activity
     * @param {string} activityId - Activity ID
     * @returns {Array} Array of responses
     */
    getActivityResponses(activityId) {
        const responses = [];
        this.responses.forEach((response, key) => {
            if (response.activityId === activityId) {
                responses.push(response);
            }
        });
        return responses;
    }

    /**
     * Get activities available to a student
     * @param {string} studentId - Student ID
     * @param {string} studentClass - Student's class
     * @returns {Array} Array of available activities
     */
    getStudentActivities(studentId, studentClass) {
        const now = new Date();

        return this.getActivities({ available: true })
            .filter(activity => {
                // Check if assigned to student's class
                if (!activity.assignedClasses.includes(studentClass)) {
                    return false;
                }

                return true;
            })
            .map(activity => {
                // Add response status
                const response = this.getStudentResponse(activity.id, studentId);
                return {
                    ...activity,
                    responseStatus: response ? response.submissionStatus : ActivitySystem.SubmissionStatus.NOT_STARTED,
                    hasResponse: !!response,
                    canTake: !response || response.submissionStatus !== ActivitySystem.SubmissionStatus.SUBMITTED
                };
            });
    }

    /**
     * Get activities for a specific class (alias for getStudentActivities)
     * @param {string} classId - Class ID
     * @param {string} studentId - Student ID (optional)
     * @returns {Array} Array of activities for the class
     */
    getActivitiesForClass(classId, studentId = null) {
        if (studentId) {
            return this.getStudentActivities(studentId, classId);
        }

        // Return all activities assigned to the class
        return this.getActivities({ assignedClass: classId });
    }

    // ===== DATA PERSISTENCE =====

    /**
     * Save data to localStorage
     */
    saveToStorage() {
        try {
            // Convert Maps to Objects for storage
            const activitiesData = Object.fromEntries(this.activities);
            const responsesData = Object.fromEntries(this.responses);

            localStorage.setItem(this.storageKey, JSON.stringify(activitiesData));
            localStorage.setItem(this.responsesKey, JSON.stringify(responsesData));

        } catch (error) {
            console.error('Error saving to storage:', error);
        }
    }

    /**
     * Load data from localStorage
     */
    loadFromStorage() {
        try {
            // Load activities
            const activitiesData = localStorage.getItem(this.storageKey);
            if (activitiesData) {
                const parsed = JSON.parse(activitiesData);
                this.activities = new Map(Object.entries(parsed));
            }

            // Load responses
            const responsesData = localStorage.getItem(this.responsesKey);
            if (responsesData) {
                const parsed = JSON.parse(responsesData);
                this.responses = new Map(Object.entries(parsed));
            }

        } catch (error) {
            console.error('Error loading from storage:', error);
            this.activities = new Map();
            this.responses = new Map();
        }
    }

    /**
     * Clear all data (for testing)
     */
    clearAllData() {
        this.activities.clear();
        this.responses.clear();
        localStorage.removeItem(this.storageKey);
        localStorage.removeItem(this.responsesKey);
        console.log('All activity data cleared');
    }

    /**
     * Submit a student response
     * @param {string} activityId - Activity ID
     * @param {string} studentId - Student ID
     * @param {Object} responses - Response data
     * @returns {Promise<Object>} Submission result
     */
    async submitResponse(activityId, studentId, responses) {
        try {
            const activity = this.getActivity(activityId);
            if (!activity) {
                return {
                    success: false,
                    errors: ['Activity not found']
                };
            }

            // Get or create response
            let response = this.getStudentResponse(activityId, studentId);
            if (!response) {
                response = {
                    id: ActivitySystem.generateId('resp'),
                    activityId: activityId,
                    studentId: studentId,
                    responses: {},
                    submissionStatus: ActivitySystem.SubmissionStatus.IN_PROGRESS,
                    startedAt: new Date(),
                    timeSpent: 0
                };
            }

            // Update response data
            response.responses = responses;
            response.submissionStatus = ActivitySystem.SubmissionStatus.SUBMITTED;
            response.submittedAt = new Date();
            response.lastModified = new Date();

            // Calculate time spent if not already set
            if (response.startedAt && !response.timeSpent) {
                response.timeSpent = Math.floor((new Date() - new Date(response.startedAt)) / 1000);
            }

            // Save response
            const saveResult = await this.saveStudentResponse(response);
            if (!saveResult.success) {
                return saveResult;
            }

            return {
                success: true,
                errors: [],
                response: response
            };

        } catch (error) {
            console.error('Error submitting response:', error);
            return {
                success: false,
                errors: ['Failed to submit response: ' + error.message]
            };
        }
    }

    /**
     * Get statistics
     * @returns {Object} Statistics object
     */
    getStatistics() {
        const activities = Array.from(this.activities.values());
        const responses = Array.from(this.responses.values());

        return {
            totalActivities: activities.length,
            publishedActivities: activities.filter(a => a.status === ActivitySystem.ActivityStatus.PUBLISHED).length,
            draftActivities: activities.filter(a => a.status === ActivitySystem.ActivityStatus.DRAFT).length,
            totalResponses: responses.length,
            submittedResponses: responses.filter(r => r.submissionStatus === ActivitySystem.SubmissionStatus.SUBMITTED).length,
            inProgressResponses: responses.filter(r => r.submissionStatus === ActivitySystem.SubmissionStatus.IN_PROGRESS).length
        };
    }
}

// Export ActivityManager
window.ActivityManager = ActivityManager;

console.log('ActivityManager component loaded successfully');