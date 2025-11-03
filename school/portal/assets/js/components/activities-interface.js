// ===== ACTIVITIES INTERFACE COMPONENT =====

/**
 * ActivitiesInterface Class
 * Main interface for the Activities & Exams system
 * Handles both teacher and student views
 */
class ActivitiesInterface {
    constructor(userData) {
        this.user = userData;
        this.isTeacher = userData.role === 'teacher' || userData.role === 'admin';
        this.activityManager = null;
        this.questionBuilder = null;
        this.questionRenderer = null;
        this.responseManager = null;
        this.currentView = 'dashboard';
        this.currentActivity = null;
        
        this.init();
    }

    /**
     * Initialize the Activities Interface
     */
    async init() {
        try {
            // Initialize core components
            this.activityManager = new ActivityManager();
            this.questionBuilder = new QuestionBuilder();
            this.questionRenderer = new QuestionRenderer();
            this.responseManager = new ResponseManager(this.activityManager);

            // Set global reference for other components
            window.activityManager = this.activityManager;

            // Render the interface
            await this.render();

            // Setup event listeners
            this.setupEventListeners();

            console.log('ActivitiesInterface initialized successfully');
        } catch (error) {
            console.error('Error initializing ActivitiesInterface:', error);
            throw error;
        }
    }

    /**
     * Render the main interface
     */
    async render() {
        const contentArea = document.getElementById('contentArea');
        if (!contentArea) return;

        if (this.isTeacher) {
            await this.renderTeacherInterface();
        } else {
            await this.renderStudentInterface();
        }
    }

    // ===== TEACHER INTERFACE =====

    /**
     * Render teacher interface
     */
    async renderTeacherInterface() {
        const contentArea = document.getElementById('contentArea');
        
        contentArea.innerHTML = `
            <div class="activities-interface teacher-interface">
                <div class="activities-header">
                    <div class="activities-title">
                        <h1>📚 Activities & Exams</h1>
                        <p>Create and manage activities for your students</p>
                    </div>
                    <div class="activities-actions">
                        <button class="btn-create-activity" id="createActivityBtn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                            Create Activity
                        </button>
                    </div>
                </div>

                <div class="activities-filters">
                    <button class="filter-btn active" data-filter="all">All Activities</button>
                    <button class="filter-btn" data-filter="draft">Drafts</button>
                    <button class="filter-btn" data-filter="published">Published</button>
                    <button class="filter-btn" data-filter="closed">Closed</button>
                </div>

                <div class="activities-content">
                    <div id="activitiesGrid" class="activities-grid">
                        <!-- Activities will be loaded here -->
                    </div>
                </div>
            </div>
        `;

        // Load teacher's activities
        await this.loadTeacherActivities();
    }

    /**
     * Load activities created by the teacher
     */
    async loadTeacherActivities() {
        const activitiesGrid = document.getElementById('activitiesGrid');
        if (!activitiesGrid) return;

        try {
            // Get activities created by this teacher
            const activities = this.activityManager.getActivitiesByTeacher(this.user.id);

            if (activities.length === 0) {
                activitiesGrid.innerHTML = `
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
                        <h3 class="empty-state-title">No Activities Yet</h3>
                        <p class="empty-state-description">Create your first activity to get started with online assessments.</p>
                        <button class="btn-create-activity" onclick="window.currentActivitiesInterface.showCreateActivityForm()">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                            Create Your First Activity
                        </button>
                    </div>
                `;
                return;
            }

            // Render activity cards
            const activitiesHTML = activities.map(activity => this.renderActivityCard(activity)).join('');
            activitiesGrid.innerHTML = activitiesHTML;

        } catch (error) {
            console.error('Error loading teacher activities:', error);
            activitiesGrid.innerHTML = `
                <div class="error-state">
                    <h3>Error Loading Activities</h3>
                    <p>There was an error loading your activities. Please try again.</p>
                    <button class="btn btn-primary" onclick="window.currentActivitiesInterface.loadTeacherActivities()">Retry</button>
                </div>
            `;
        }
    }

    /**
     * Render activity card for teacher view
     */
    renderActivityCard(activity) {
        const dueDate = new Date(activity.dueDate);
        const isOverdue = dueDate < new Date();
        const timeRemaining = ActivitySystem.getTimeRemaining(dueDate);
        
        return `
            <div class="activity-card" data-activity-id="${activity.id}">
                <div class="activity-card-header">
                    <div class="activity-status-badge ${activity.status}">
                        ${activity.status}
                    </div>
                    <h3 class="activity-title">${activity.title}</h3>
                    <p class="activity-description">${activity.description}</p>
                </div>
                
                <div class="activity-card-body">
                    <div class="activity-meta">
                        <div class="activity-meta-item">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                <line x1="16" y1="2" x2="16" y2="6"/>
                                <line x1="8" y1="2" x2="8" y2="6"/>
                                <line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                            <span class="activity-meta-value ${isOverdue ? 'overdue' : ''}">${ActivitySystem.formatDate(dueDate)}</span>
                        </div>
                        <div class="activity-meta-item">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="10"/>
                                <polyline points="12,6 12,12 16,14"/>
                            </svg>
                            <span class="activity-meta-value">${activity.timeLimit ? activity.timeLimit + ' min' : 'No limit'}</span>
                        </div>
                        <div class="activity-meta-item">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M9 11H5a2 2 0 0 0-2 2v7c0 1.1.9 2 2 2h4m4-9h4a2 2 0 0 1 2 2v7c0 1.1-.9 2-2 2h-4m-4-9v9m0-9l3-3m-3 3l-3-3"/>
                            </svg>
                            <span class="activity-meta-value">${activity.questions.length} question${activity.questions.length !== 1 ? 's' : ''}</span>
                        </div>
                        <div class="activity-meta-item">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                <circle cx="9" cy="7" r="4"/>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                            </svg>
                            <span class="activity-meta-value">${activity.assignedClasses.length} class${activity.assignedClasses.length !== 1 ? 'es' : ''}</span>
                        </div>
                    </div>
                </div>
                
                <div class="activity-card-footer">
                    <div class="activity-progress">
                        <span>Created ${ActivitySystem.formatDate(activity.createdAt)}</span>
                    </div>
                    <div class="activity-actions-menu">
                        <button class="btn-activity-action" onclick="window.currentActivitiesInterface.editActivity('${activity.id}')" title="Edit Activity">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </button>
                        ${activity.status === 'draft' ? `
                            <button class="btn-activity-action" onclick="window.currentActivitiesInterface.publishActivity('${activity.id}')" title="Publish Activity">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <polygon points="5,3 19,12 5,21 5,3"/>
                                </svg>
                            </button>
                        ` : ''}
                        <button class="btn-activity-action" onclick="window.currentActivitiesInterface.viewSubmissions('${activity.id}')" title="View Submissions">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14,2 14,8 20,8"/>
                                <line x1="16" y1="13" x2="8" y2="13"/>
                                <line x1="16" y1="17" x2="8" y2="17"/>
                                <polyline points="10,9 9,9 8,9"/>
                            </svg>
                        </button>
                        <button class="btn-activity-action danger" onclick="window.currentActivitiesInterface.deleteActivity('${activity.id}')" title="Delete Activity">
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
        `;
    }

    // ===== STUDENT INTERFACE =====

    /**
     * Render student interface
     */
    async renderStudentInterface() {
        const contentArea = document.getElementById('contentArea');
        
        contentArea.innerHTML = `
            <div class="activities-interface student-interface">
                <div class="activities-header">
                    <div class="activities-title">
                        <h1>📚 My Activities</h1>
                        <p>Complete your assignments and track your progress</p>
                    </div>
                    <div class="activities-stats">
                        <div class="stat-item">
                            <span class="stat-number" id="pendingCount">0</span>
                            <span class="stat-label">Pending</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number" id="completedCount">0</span>
                            <span class="stat-label">Completed</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number" id="averageScore">0%</span>
                            <span class="stat-label">Average Score</span>
                        </div>
                    </div>
                </div>

                <div class="activities-filters">
                    <button class="filter-btn active" data-filter="all">All Activities</button>
                    <button class="filter-btn" data-filter="pending">Pending</button>
                    <button class="filter-btn" data-filter="completed">Completed</button>
                    <button class="filter-btn" data-filter="overdue">Overdue</button>
                </div>

                <div class="activities-content">
                    <div id="activitiesGrid" class="activities-grid">
                        <!-- Activities will be loaded here -->
                    </div>
                </div>
            </div>
        `;

        // Load student's activities
        await this.loadStudentActivities();
    }

    /**
     * Load activities assigned to the student
     */
    async loadStudentActivities() {
        const activitiesGrid = document.getElementById('activitiesGrid');
        if (!activitiesGrid) return;

        try {
            // Get activities for student's class
            const studentClass = this.user.profile?.class || this.user.class || 'class_101';
            const studentId = this.user.id || 'student_123';
            const activities = this.activityManager.getActivitiesForClass(studentClass, studentId);

            if (activities.length === 0) {
                activitiesGrid.innerHTML = `
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
                        <h3 class="empty-state-title">No Activities Available</h3>
                        <p class="empty-state-description">Your teachers haven't assigned any activities yet. Check back later!</p>
                    </div>
                `;
                return;
            }

            // Render activity cards for students
            const activitiesHTML = activities.map(activity => this.renderStudentActivityCard(activity)).join('');
            activitiesGrid.innerHTML = activitiesHTML;

            // Update statistics
            this.updateStudentStats(activities);

        } catch (error) {
            console.error('Error loading student activities:', error);
            activitiesGrid.innerHTML = `
                <div class="error-state">
                    <h3>Error Loading Activities</h3>
                    <p>There was an error loading your activities. Please try again.</p>
                    <button class="btn btn-primary" onclick="window.currentActivitiesInterface.loadStudentActivities()">Retry</button>
                </div>
            `;
        }
    }

    /**
     * Render activity card for student view
     */
    renderStudentActivityCard(activity) {
        const dueDate = new Date(activity.dueDate);
        const isOverdue = dueDate < new Date();
        const timeRemaining = ActivitySystem.getTimeRemaining(dueDate);
        
        // Get student's response status
        const response = this.activityManager.getStudentResponse(activity.id, this.user.id);
        const isCompleted = response && response.submissionStatus === ActivitySystem.SubmissionStatus.SUBMITTED;
        const isGraded = response && response.grade;
        
        return `
            <div class="activity-card student-card ${isCompleted ? 'completed' : ''} ${isOverdue && !isCompleted ? 'overdue' : ''}" data-activity-id="${activity.id}">
                <div class="activity-card-header">
                    <div class="activity-status-badge ${isCompleted ? 'completed' : isOverdue ? 'overdue' : 'pending'}">
                        ${isCompleted ? 'Completed' : isOverdue ? 'Overdue' : 'Pending'}
                    </div>
                    <h3 class="activity-title">${activity.title}</h3>
                    <p class="activity-description">${activity.description}</p>
                </div>
                
                <div class="activity-card-body">
                    <div class="activity-meta">
                        <div class="activity-meta-item">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                <line x1="16" y1="2" x2="16" y2="6"/>
                                <line x1="8" y1="2" x2="8" y2="6"/>
                                <line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                            <span class="activity-meta-value ${isOverdue ? 'overdue' : ''}">${ActivitySystem.formatTimeRemaining(timeRemaining)}</span>
                        </div>
                        <div class="activity-meta-item">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="10"/>
                                <polyline points="12,6 12,12 16,14"/>
                            </svg>
                            <span class="activity-meta-value">${activity.timeLimit ? activity.timeLimit + ' min' : 'No limit'}</span>
                        </div>
                        <div class="activity-meta-item">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M9 11H5a2 2 0 0 0-2 2v7c0 1.1.9 2 2 2h4m4-9h4a2 2 0 0 1 2 2v7c0 1.1-.9 2-2 2h-4m-4-9v9m0-9l3-3m-3 3l-3-3"/>
                            </svg>
                            <span class="activity-meta-value">${activity.questions.length} question${activity.questions.length !== 1 ? 's' : ''}</span>
                        </div>
                        ${isGraded ? `
                            <div class="activity-meta-item">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <polygon points="14,6 10,12 14,18 22,12"/>
                                    <line x1="6" y1="12" x2="10" y2="12"/>
                                </svg>
                                <span class="activity-meta-value grade">${response.grade.percentage}%</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                <div class="activity-card-footer">
                    <div class="activity-progress">
                        <span>Due: ${ActivitySystem.formatDate(dueDate)}</span>
                    </div>
                    <div class="activity-actions-menu">
                        ${isCompleted ? `
                            <button class="btn-activity-action" onclick="window.currentActivitiesInterface.viewResults('${activity.id}')" title="View Results">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                    <circle cx="12" cy="12" r="3"/>
                                </svg>
                            </button>
                        ` : `
                            <button class="btn-activity-action primary" onclick="window.currentActivitiesInterface.startActivity('${activity.id}')" title="Start Activity">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <polygon points="5,3 19,12 5,21 5,3"/>
                                </svg>
                            </button>
                        `}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Update student statistics
     */
    updateStudentStats(activities) {
        const pendingCount = document.getElementById('pendingCount');
        const completedCount = document.getElementById('completedCount');
        const averageScore = document.getElementById('averageScore');

        if (!pendingCount || !completedCount || !averageScore) return;

        let pending = 0;
        let completed = 0;
        let totalScore = 0;
        let gradedCount = 0;

        activities.forEach(activity => {
            const response = this.activityManager.getStudentResponse(activity.id, this.user.id);
            
            if (response && response.submissionStatus === ActivitySystem.SubmissionStatus.SUBMITTED) {
                completed++;
                if (response.grade) {
                    totalScore += response.grade.percentage;
                    gradedCount++;
                }
            } else {
                pending++;
            }
        });

        pendingCount.textContent = pending;
        completedCount.textContent = completed;
        averageScore.textContent = gradedCount > 0 ? Math.round(totalScore / gradedCount) + '%' : '0%';
    }

    // ===== EVENT HANDLERS =====

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Create activity button
        document.addEventListener('click', (e) => {
            if (e.target.matches('#createActivityBtn, .btn-create-activity')) {
                this.showCreateActivityForm();
            }
        });

        // Filter buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('.filter-btn')) {
                // Update active filter
                document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                
                // Apply filter
                const filter = e.target.dataset.filter;
                this.applyFilter(filter);
            }
        });

        // Add question dropdown toggle
        document.addEventListener('click', (e) => {
            if (e.target.matches('#addQuestionBtn')) {
                e.stopPropagation();
                const dropdown = document.getElementById('questionTypeMenu');
                if (dropdown) {
                    dropdown.classList.toggle('show');
                }
            } else {
                // Close dropdown when clicking elsewhere
                const dropdown = document.getElementById('questionTypeMenu');
                if (dropdown) {
                    dropdown.classList.remove('show');
                }
            }
        });
    }

    /**
     * Apply filter to activities
     */
    applyFilter(filter) {
        const activityCards = document.querySelectorAll('.activity-card');
        
        activityCards.forEach(card => {
            const shouldShow = this.shouldShowCard(card, filter);
            card.style.display = shouldShow ? 'block' : 'none';
        });
    }

    /**
     * Determine if card should be shown based on filter
     */
    shouldShowCard(card, filter) {
        if (filter === 'all') return true;
        
        const statusBadge = card.querySelector('.activity-status-badge');
        if (!statusBadge) return false;
        
        const status = statusBadge.textContent.toLowerCase().trim();
        
        switch (filter) {
            case 'draft':
            case 'published':
            case 'closed':
                return status === filter;
            case 'pending':
                return status === 'pending';
            case 'completed':
                return status === 'completed';
            case 'overdue':
                return status === 'overdue';
            default:
                return true;
        }
    }

    // ===== TEACHER ACTIONS =====

    /**
     * Show create activity form
     */
    showCreateActivityForm() {
        if (!this.creationWizard) {
            this.creationWizard = new ActivityCreationWizard(this.activityManager, this.questionBuilder);
        }
        this.creationWizard.show();
    }

    /**
     * Edit activity
     */
    editActivity(activityId) {
        if (!this.creationWizard) {
            this.creationWizard = new ActivityCreationWizard(this.activityManager, this.questionBuilder);
        }
        this.creationWizard.show(activityId);
    }

    /**
     * Publish activity
     */
    async publishActivity(activityId) {
        try {
            const result = await this.activityManager.publishActivity(activityId);
            
            if (result.success) {
                UIUtils.showToast('Activity published successfully!', 'success');
                await this.loadTeacherActivities(); // Refresh the list
            } else {
                UIUtils.showToast('Failed to publish activity: ' + result.errors.join(', '), 'error');
            }
        } catch (error) {
            console.error('Error publishing activity:', error);
            UIUtils.showToast('Error publishing activity', 'error');
        }
    }

    /**
     * View submissions
     */
    viewSubmissions(activityId) {
        if (!this.gradingInterface) {
            this.gradingInterface = new GradingInterface(this.activityManager, this.questionRenderer);
        }
        this.gradingInterface.showSubmissions(activityId);
    }

    /**
     * Delete activity
     */
    async deleteActivity(activityId) {
        if (!confirm('Are you sure you want to delete this activity? This action cannot be undone.')) {
            return;
        }

        try {
            const result = await this.activityManager.deleteActivity(activityId);
            
            if (result.success) {
                UIUtils.showToast('Activity deleted successfully!', 'success');
                await this.loadTeacherActivities(); // Refresh the list
            } else {
                UIUtils.showToast('Failed to delete activity: ' + result.errors.join(', '), 'error');
            }
        } catch (error) {
            console.error('Error deleting activity:', error);
            UIUtils.showToast('Error deleting activity', 'error');
        }
    }

    // ===== STUDENT ACTIONS =====

    /**
     * Start activity
     */
    startActivity(activityId) {
        if (!this.activityTakingInterface) {
            this.activityTakingInterface = new ActivityTakingInterface(
                this.activityManager, 
                this.questionRenderer, 
                this.responseManager
            );
        }
        this.activityTakingInterface.startActivity(activityId);
    }

    /**
     * View results
     */
    viewResults(activityId) {
        if (!this.resultsViewer) {
            this.resultsViewer = new ResultsViewer(this.activityManager, this.questionRenderer);
        }
        this.resultsViewer.showResults(activityId);
    }

    // ===== CLEANUP =====

    /**
     * Destroy the interface and cleanup
     */
    destroy() {
        // Cleanup event listeners and resources
        this.activityManager = null;
        this.questionBuilder = null;
        this.questionRenderer = null;
        this.responseManager = null;
    }
}

// Export ActivitiesInterface
window.ActivitiesInterface = ActivitiesInterface;

console.log('ActivitiesInterface component loaded successfully');